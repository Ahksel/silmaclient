use std::{
    path::PathBuf,
    sync::Arc,
    time::Instant,
};

use axum::{
    extract::{
        State,
        ws::{Message, WebSocket, WebSocketUpgrade},
    },
    http::StatusCode,
    response::{IntoResponse, Response},
};
use futures_util::{SinkExt, StreamExt};
use serde_json::json;
use tokio::{
    io::{AsyncReadExt, AsyncWriteExt},
    sync::{
        OwnedSemaphorePermit, Semaphore,
        broadcast::{self, error::RecvError},
    },
    time::{self, Instant as TokioInstant},
};
use tracing::{debug, info, warn};

use crate::{config::Config, mud_connection, telnet::TelnetProcessor};

pub struct AppState {
    pub config: Config,
    pub data_dir: PathBuf,
    connection_slots: Arc<Semaphore>,
    notice_tx: broadcast::Sender<String>,
}

impl AppState {
    pub fn new(config: Config) -> Self {
        let max_connections = config.connection.max_connections;
        let data_dir = std::env::var("SILMACLIENT_DATA")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("data"));
        let (notice_tx, _) = broadcast::channel(32);
        Self {
            config,
            data_dir,
            connection_slots: Arc::new(Semaphore::new(max_connections)),
            notice_tx,
        }
    }

    /// Browser sessions currently subscribed to live notices (≈ open client tabs bridged to the MUD).
    pub fn connected_clients(&self) -> usize {
        self.notice_tx.receiver_count()
    }

    /// Publish a notice to all connected browser sessions. Returns subscriber count.
    pub fn publish_notice(&self, text: &str) -> usize {
        let payload = json!({
            "__silma": "notice",
            "text": text,
        })
        .to_string();
        let recipients = self.connected_clients();
        let _ = self.notice_tx.send(payload);
        recipients
    }
}

pub async fn upgrade(State(state): State<Arc<AppState>>, websocket: WebSocketUpgrade) -> Response {
    let permit = match Arc::clone(&state.connection_slots).try_acquire_owned() {
        Ok(permit) => permit,
        Err(_) => {
            warn!("rejected WebSocket connection because the connection limit was reached");
            return (
                StatusCode::SERVICE_UNAVAILABLE,
                "connection limit reached; try again later",
            )
                .into_response();
        }
    };

    let max_message_size = state.config.connection.max_websocket_message_bytes;
    websocket
        .max_message_size(max_message_size)
        .on_upgrade(move |socket| handle_connection(socket, state, permit))
}

async fn handle_connection(
    mut socket: WebSocket,
    state: Arc<AppState>,
    _permit: OwnedSemaphorePermit,
) {
    let started_at = Instant::now();
    info!("browser connected");

    let stream = match mud_connection::connect(
        &state.config.mud.host,
        state.config.mud.port,
        state.config.connect_timeout(),
    )
    .await
    {
        Ok(stream) => stream,
        Err(error) => {
            warn!(%error, "could not connect to configured MUD");
            let _ = socket
                .send(Message::Text(
                    "[gateway] Unable to connect to the MUD.\r\n".into(),
                ))
                .await;
            let _ = socket.close().await;
            return;
        }
    };

    info!("connected to configured MUD");
    let notice_rx = state.notice_tx.subscribe();
    if let Err(error) = bridge(socket, stream, &state.config, notice_rx).await {
        debug!(%error, "connection bridge ended with an error");
    }
    info!(
        connected_seconds = started_at.elapsed().as_secs(),
        "browser connection closed"
    );
}

async fn bridge(
    socket: WebSocket,
    stream: tokio::net::TcpStream,
    config: &Config,
    mut notice_rx: broadcast::Receiver<String>,
) -> Result<(), String> {
    let (mut websocket_sender, mut websocket_receiver) = socket.split();
    let (mut mud_reader, mut mud_writer) = stream.into_split();
    let mut mud_buffer = vec![0_u8; 8 * 1_024];
    let mut telnet = TelnetProcessor;
    let idle_timeout = config.idle_timeout();
    let idle_timer = time::sleep(idle_timeout);
    tokio::pin!(idle_timer);

    loop {
        tokio::select! {
            browser_message = websocket_receiver.next() => {
                match browser_message {
                    Some(Ok(Message::Text(text))) => {
                        mud_writer
                            .write_all(text.as_bytes())
                            .await
                            .map_err(|error| format!("failed writing browser data to MUD: {error}"))?;
                        mud_writer
                            .flush()
                            .await
                            .map_err(|error| format!("failed flushing browser data to MUD: {error}"))?;
                        idle_timer.as_mut().reset(TokioInstant::now() + idle_timeout);
                    }
                    Some(Ok(Message::Binary(data))) => {
                        mud_writer
                            .write_all(&data)
                            .await
                            .map_err(|error| format!("failed writing browser data to MUD: {error}"))?;
                        mud_writer
                            .flush()
                            .await
                            .map_err(|error| format!("failed flushing browser data to MUD: {error}"))?;
                        idle_timer.as_mut().reset(TokioInstant::now() + idle_timeout);
                    }
                    Some(Ok(Message::Ping(data))) => {
                        websocket_sender
                            .send(Message::Pong(data))
                            .await
                            .map_err(|error| format!("failed sending WebSocket pong: {error}"))?;
                    }
                    Some(Ok(Message::Pong(_))) => {}
                    Some(Ok(Message::Close(_))) | None => break,
                    Some(Err(error)) => {
                        return Err(format!("failed reading WebSocket message: {error}"));
                    }
                }
            }
            mud_read = mud_reader.read(&mut mud_buffer) => {
                let bytes_read =
                    mud_read.map_err(|error| format!("failed reading MUD data: {error}"))?;
                if bytes_read == 0 {
                    break;
                }

                let output = telnet.process_server_data(&mud_buffer[..bytes_read]);
                websocket_sender
                    .send(Message::Binary(output.to_vec().into()))
                    .await
                    .map_err(|error| format!("failed sending MUD data to browser: {error}"))?;
                idle_timer.as_mut().reset(TokioInstant::now() + idle_timeout);
            }
            notice = notice_rx.recv() => {
                match notice {
                    Ok(payload) => {
                        websocket_sender
                            .send(Message::Text(payload.into()))
                            .await
                            .map_err(|error| format!("failed sending notice to browser: {error}"))?;
                    }
                    Err(RecvError::Lagged(_)) => {}
                    Err(RecvError::Closed) => {}
                }
            }
            () = &mut idle_timer => {
                info!("closing idle connection");
                let _ = websocket_sender
                    .send(Message::Text("[gateway] Connection closed due to inactivity.\r\n".into()))
                    .await;
                break;
            }
        }
    }

    let _ = mud_writer.shutdown().await;
    let _ = websocket_sender.close().await;
    Ok(())
}

#[cfg(test)]
mod tests {
    use std::{net::IpAddr, sync::Arc, time::Duration};

    use axum::{Router, routing::get};
    use futures_util::{SinkExt, StreamExt};
    use tokio::{
        io::{AsyncReadExt, AsyncWriteExt},
        net::TcpListener,
        time,
    };
    use tokio_tungstenite::{connect_async, tungstenite::Message};

    use super::{AppState, upgrade};
    use crate::config::{
        AdminConfig, ClientConfig, Config, ConnectionConfig, DevelopmentConfig, MudConfig,
        ServerConfig,
    };

    #[tokio::test]
    async fn forwards_data_in_both_directions() {
        let mud_listener = TcpListener::bind("127.0.0.1:0")
            .await
            .expect("fake MUD listener should bind");
        let mud_address = mud_listener
            .local_addr()
            .expect("fake MUD address should be available");

        let fake_mud = tokio::spawn(async move {
            let (mut stream, _) = mud_listener
                .accept()
                .await
                .expect("gateway should connect to fake MUD");
            stream
                .write_all(b"Welcome\r\n")
                .await
                .expect("fake MUD should send greeting");

            let mut input = [0_u8; 64];
            let bytes_read = stream
                .read(&mut input)
                .await
                .expect("fake MUD should receive browser command");
            assert_eq!(&input[..bytes_read], b"look\r\n");

            stream
                .write_all(b"A test room.\r\n")
                .await
                .expect("fake MUD should send response");
        });

        let config = Config {
            server: ServerConfig {
                listen_address: IpAddr::V4(std::net::Ipv4Addr::LOCALHOST),
                listen_port: 8088,
            },
            mud: MudConfig {
                host: mud_address.ip().to_string(),
                port: mud_address.port(),
            },
            connection: ConnectionConfig {
                connect_timeout_seconds: 2,
                idle_timeout_seconds: 10,
                max_connections: 4,
                max_websocket_message_bytes: 1_024,
            },
            client: ClientConfig::default(),
            development: DevelopmentConfig::default(),
            admin: AdminConfig::default(),
        };

        let app = Router::new()
            .route("/ws", get(upgrade))
            .with_state(Arc::new(AppState::new(config)));
        let gateway_listener = TcpListener::bind("127.0.0.1:0")
            .await
            .expect("gateway listener should bind");
        let gateway_address = gateway_listener
            .local_addr()
            .expect("gateway address should be available");
        let gateway = tokio::spawn(async move {
            axum::serve(gateway_listener, app)
                .await
                .expect("test gateway should run");
        });

        let (mut browser, _) = connect_async(format!("ws://{gateway_address}/ws"))
            .await
            .expect("browser should connect to gateway");

        let greeting = next_message(&mut browser).await;
        assert_eq!(greeting.into_data().as_ref(), b"Welcome\r\n");

        browser
            .send(Message::Text("look\r\n".into()))
            .await
            .expect("browser should send command");

        let response = next_message(&mut browser).await;
        assert_eq!(response.into_data().as_ref(), b"A test room.\r\n");

        browser.close(None).await.expect("browser should close");
        fake_mud.await.expect("fake MUD task should complete");
        gateway.abort();
    }

    async fn next_message<S>(browser: &mut S) -> Message
    where
        S: StreamExt<Item = Result<Message, tokio_tungstenite::tungstenite::Error>> + Unpin,
    {
        time::timeout(Duration::from_secs(2), browser.next())
            .await
            .expect("WebSocket receive should not time out")
            .expect("WebSocket should remain open")
            .expect("WebSocket message should be valid")
    }
}
