use std::{io, time::Duration};

use tokio::{net::TcpStream, time};

pub async fn connect(host: &str, port: u16, timeout: Duration) -> io::Result<TcpStream> {
    let address = format!("{host}:{port}");

    let stream = match time::timeout(timeout, TcpStream::connect(&address)).await {
        Ok(result) => result?,
        Err(_) => {
            return Err(io::Error::new(
                io::ErrorKind::TimedOut,
                format!("connection to configured MUD timed out after {timeout:?}"),
            ));
        }
    };

    // Avoid Nagle delay on small MUD packets (commands / combat spam).
    stream.set_nodelay(true)?;
    Ok(stream)
}
