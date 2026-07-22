mod changelog;
mod config;
mod macros_store;
mod mud_connection;
mod notices;
mod telnet;
mod tickets;
mod websocket;

use std::{
    collections::hash_map::DefaultHasher,
    env,
    error::Error,
    hash::{Hash, Hasher},
    sync::{Arc, OnceLock},
};

use axum::{
    Json, Router,
    extract::State,
    http::{HeaderValue, StatusCode, header},
    response::{IntoResponse, Response},
    routing::{get, patch, post},
};
use config::{ClientConfig, Config};
use tokio::{fs, net::TcpListener, signal};
use tracing::{error, info, warn};
use tracing_subscriber::EnvFilter;
use websocket::AppState;

const INDEX_HTML: &str = include_str!("../../web/index.html");
const ADMIN_HTML: &str = include_str!("../../web/admin.html");
const CLIENT_CSS: &str = include_str!("../../web/css/silmaclient.css");
const CLIENT_JS: &str = include_str!("../../web/js/silmaclient.js");
const ASSET_VERSION_PLACEHOLDER: &str = "__ASSET_V__";

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    init_logging();

    let config_path = env::args()
        .nth(1)
        .or_else(|| env::var("SILMACLIENT_CONFIG").ok())
        .unwrap_or_else(|| "config.toml".to_owned());
    let config = Config::load(&config_path).await?;
    let listen_address = config.listen_address();
    let serve_web = config.development.serve_web;
    let state = Arc::new(AppState::new(config));
    if let Err(error) = fs::create_dir_all(state.data_dir.join("tickets")).await {
        warn!(%error, path = %state.data_dir.display(), "could not create data directory");
    } else {
        info!(path = %state.data_dir.display(), "data directory ready");
    }

    let mut app = Router::new()
        .route("/ws", get(websocket::upgrade))
        .route("/silmaclient/ws", get(websocket::upgrade))
        .route("/config", get(client_config))
        .route("/silmaclient/config", get(client_config))
        .route("/macros", get(macros_store::get_macros).put(macros_store::put_macros))
        .route(
            "/silmaclient/macros",
            get(macros_store::get_macros).put(macros_store::put_macros),
        )
        .route("/feedback", post(tickets::create_ticket))
        .route("/silmaclient/feedback", post(tickets::create_ticket))
        .route("/admin/tickets", get(tickets::list_tickets))
        .route("/silmaclient/admin/tickets", get(tickets::list_tickets))
        .route(
            "/admin/tickets/{id}",
            patch(tickets::update_ticket).delete(tickets::delete_ticket),
        )
        .route(
            "/silmaclient/admin/tickets/{id}",
            patch(tickets::update_ticket)
                .delete(tickets::delete_ticket)
                .post(tickets::update_ticket),
        )
        .route(
            "/admin/tickets/{id}/delete",
            post(tickets::delete_ticket),
        )
        .route(
            "/silmaclient/admin/tickets/{id}/delete",
            post(tickets::delete_ticket),
        )
        .route("/changelog", get(changelog::get_changelog))
        .route("/silmaclient/changelog", get(changelog::get_changelog))
        .route("/admin/changelog", post(changelog::create_release))
        .route("/silmaclient/admin/changelog", post(changelog::create_release))
        .route(
            "/admin/changelog/{id}/delete",
            post(changelog::delete_release),
        )
        .route(
            "/silmaclient/admin/changelog/{id}/delete",
            post(changelog::delete_release),
        )
        .route("/admin/broadcast", post(notices::broadcast_notice))
        .route(
            "/silmaclient/admin/broadcast",
            post(notices::broadcast_notice),
        )
        .route("/admin/presence", get(notices::get_presence))
        .route("/silmaclient/admin/presence", get(notices::get_presence))
        .with_state(state);

    if serve_web {
        app = app
            .route("/", get(index))
            .route("/admin", get(admin_page))
            .route("/admin/", get(admin_page))
            .route("/css/silmaclient.css", get(stylesheet))
            .route("/js/silmaclient.js", get(javascript));
        info!(
            asset_v = %asset_version(),
            "development web client enabled at http://{listen_address}/"
        );
    }

    let listener = TcpListener::bind(listen_address)
        .await
        .map_err(|error| format!("cannot bind gateway listener to {listen_address}: {error}"))?;
    info!("gateway listening on {listen_address}");

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    info!("gateway stopped");
    Ok(())
}

fn init_logging() {
    let filter =
        EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("silmaclient=info"));
    tracing_subscriber::fmt().with_env_filter(filter).init();
}

async fn shutdown_signal() {
    let ctrl_c = async {
        if let Err(error) = signal::ctrl_c().await {
            error!(%error, "failed to install Ctrl+C handler");
        }
    };

    #[cfg(unix)]
    let terminate = async {
        match signal::unix::signal(signal::unix::SignalKind::terminate()) {
            Ok(mut stream) => {
                stream.recv().await;
            }
            Err(error) => error!(%error, "failed to install SIGTERM handler"),
        }
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        () = ctrl_c => {}
        () = terminate => {}
    }
}

async fn index() -> Response {
    // HTML must not be cached: it embeds the asset version query string.
    cached_asset_response(
        "text/html; charset=utf-8",
        "no-store, max-age=0",
        rendered_index_html(),
    )
}

async fn admin_page() -> Response {
    cached_asset_response(
        "text/html; charset=utf-8",
        "no-store, max-age=0",
        ADMIN_HTML,
    )
}

async fn stylesheet() -> Response {
    // Versioned via ?v=… from index.html; safe to cache after deploy.
    cached_asset_response(
        "text/css; charset=utf-8",
        "public, max-age=31536000, immutable",
        CLIENT_CSS,
    )
}

async fn javascript() -> Response {
    cached_asset_response(
        "text/javascript; charset=utf-8",
        "public, max-age=31536000, immutable",
        CLIENT_JS,
    )
}

fn asset_version() -> &'static str {
    static VERSION: OnceLock<String> = OnceLock::new();
    VERSION.get_or_init(|| {
        let mut hasher = DefaultHasher::new();
        CLIENT_CSS.hash(&mut hasher);
        CLIENT_JS.hash(&mut hasher);
        format!("{:x}", hasher.finish())
    })
}

fn rendered_index_html() -> &'static str {
    static RENDERED: OnceLock<String> = OnceLock::new();
    RENDERED
        .get_or_init(|| INDEX_HTML.replace(ASSET_VERSION_PLACEHOLDER, asset_version()))
        .as_str()
}

fn cached_asset_response(
    content_type: &'static str,
    cache_control: &'static str,
    body: impl Into<axum::body::Body>,
) -> Response {
    (
        StatusCode::OK,
        [
            (header::CONTENT_TYPE, HeaderValue::from_static(content_type)),
            (
                header::CACHE_CONTROL,
                HeaderValue::from_static(cache_control),
            ),
        ],
        body.into(),
    )
        .into_response()
}

async fn client_config(State(state): State<Arc<AppState>>) -> Json<ClientConfig> {
    Json(state.config.client.clone())
}
