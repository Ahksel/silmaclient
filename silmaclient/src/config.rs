use std::{
    error::Error,
    fmt::{self, Display, Formatter},
    net::{IpAddr, SocketAddr},
    path::Path,
    time::Duration,
};

use serde::{Deserialize, Serialize};
use tokio::fs;

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Config {
    pub server: ServerConfig,
    pub mud: MudConfig,
    #[serde(default)]
    pub connection: ConnectionConfig,
    #[serde(default)]
    pub client: ClientConfig,
    #[serde(default)]
    pub development: DevelopmentConfig,
    #[serde(default)]
    pub admin: AdminConfig,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct AdminConfig {
    /// Password for /admin ticket panel. Prefer overriding via config in production.
    pub password: String,
}

impl Default for AdminConfig {
    fn default() -> Self {
        Self {
            password: "Simaril".to_owned(),
        }
    }
}

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ServerConfig {
    pub listen_address: IpAddr,
    pub listen_port: u16,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MudConfig {
    pub host: String,
    pub port: u16,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct ConnectionConfig {
    pub connect_timeout_seconds: u64,
    pub idle_timeout_seconds: u64,
    pub max_connections: usize,
    pub max_websocket_message_bytes: usize,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(default, deny_unknown_fields)]
pub struct ClientConfig {
    pub command_history_size: usize,
}

#[derive(Clone, Debug, Default, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct DevelopmentConfig {
    pub serve_web: bool,
}

impl Default for ConnectionConfig {
    fn default() -> Self {
        Self {
            connect_timeout_seconds: 10,
            idle_timeout_seconds: 1_800,
            max_connections: 100,
            max_websocket_message_bytes: 16 * 1_024,
        }
    }
}

impl Default for ClientConfig {
    fn default() -> Self {
        Self {
            command_history_size: 20,
        }
    }
}

impl Config {
    pub async fn load(path: impl AsRef<Path>) -> Result<Self, ConfigError> {
        let path = path.as_ref();
        let contents = fs::read_to_string(path)
            .await
            .map_err(|source| ConfigError::Read {
                path: path.display().to_string(),
                source,
            })?;
        let config: Self = toml::from_str(&contents).map_err(ConfigError::Parse)?;
        config.validate()?;
        Ok(config)
    }

    pub fn listen_address(&self) -> SocketAddr {
        SocketAddr::new(self.server.listen_address, self.server.listen_port)
    }

    pub fn connect_timeout(&self) -> Duration {
        Duration::from_secs(self.connection.connect_timeout_seconds)
    }

    pub fn idle_timeout(&self) -> Duration {
        Duration::from_secs(self.connection.idle_timeout_seconds)
    }

    fn validate(&self) -> Result<(), ConfigError> {
        if self.mud.host.trim().is_empty() {
            return Err(ConfigError::Validation(
                "mud.host must not be empty".to_owned(),
            ));
        }
        if self.mud.port == 0 {
            return Err(ConfigError::Validation(
                "mud.port must be greater than zero".to_owned(),
            ));
        }
        if self.server.listen_port == 0 {
            return Err(ConfigError::Validation(
                "server.listen_port must be greater than zero".to_owned(),
            ));
        }
        if !self.server.listen_address.is_loopback() {
            return Err(ConfigError::Validation(
                "server.listen_address must be a loopback address".to_owned(),
            ));
        }
        if self.connection.connect_timeout_seconds == 0 {
            return Err(ConfigError::Validation(
                "connection.connect_timeout_seconds must be greater than zero".to_owned(),
            ));
        }
        if self.connection.idle_timeout_seconds == 0 {
            return Err(ConfigError::Validation(
                "connection.idle_timeout_seconds must be greater than zero".to_owned(),
            ));
        }
        if self.connection.max_connections == 0 {
            return Err(ConfigError::Validation(
                "connection.max_connections must be greater than zero".to_owned(),
            ));
        }
        if self.connection.max_websocket_message_bytes == 0 {
            return Err(ConfigError::Validation(
                "connection.max_websocket_message_bytes must be greater than zero".to_owned(),
            ));
        }
        if self.client.command_history_size == 0 {
            return Err(ConfigError::Validation(
                "client.command_history_size must be greater than zero".to_owned(),
            ));
        }
        Ok(())
    }
}

#[derive(Debug)]
pub enum ConfigError {
    Read {
        path: String,
        source: std::io::Error,
    },
    Parse(toml::de::Error),
    Validation(String),
}

impl Display for ConfigError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> fmt::Result {
        match self {
            Self::Read { path, source } => {
                write!(formatter, "cannot read configuration file {path}: {source}")
            }
            Self::Parse(source) => write!(formatter, "invalid TOML configuration: {source}"),
            Self::Validation(message) => write!(formatter, "invalid configuration: {message}"),
        }
    }
}

impl Error for ConfigError {
    fn source(&self) -> Option<&(dyn Error + 'static)> {
        match self {
            Self::Read { source, .. } => Some(source),
            Self::Parse(source) => Some(source),
            Self::Validation(_) => None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::Config;

    const VALID_CONFIG: &str = r#"
        [server]
        listen_address = "127.0.0.1"
        listen_port = 8088

        [mud]
        host = "mud.example.test"
        port = 4000
    "#;

    #[test]
    fn parses_valid_config_with_defaults() {
        let config: Config = toml::from_str(VALID_CONFIG).expect("test configuration should parse");

        assert_eq!(config.connection.max_connections, 100);
        assert_eq!(config.connection.idle_timeout_seconds, 1_800);
        assert_eq!(config.client.command_history_size, 20);
        assert!(!config.development.serve_web);
        assert!(config.validate().is_ok());
    }

    #[test]
    fn rejects_non_loopback_listener() {
        let input = VALID_CONFIG.replace("127.0.0.1", "0.0.0.0");
        let config: Config = toml::from_str(&input).expect("test configuration should parse");

        assert!(config.validate().is_err());
    }

    #[test]
    fn rejects_empty_mud_host() {
        let input = VALID_CONFIG.replace("mud.example.test", " ");
        let config: Config = toml::from_str(&input).expect("test configuration should parse");

        assert!(config.validate().is_err());
    }

    #[test]
    fn parses_configured_command_history_size() {
        let input = format!("{VALID_CONFIG}\n[client]\ncommand_history_size = 42\n");
        let config: Config = toml::from_str(&input).expect("test configuration should parse");

        assert_eq!(config.client.command_history_size, 42);
        assert!(config.validate().is_ok());
    }

    #[test]
    fn rejects_empty_command_history() {
        let input = format!("{VALID_CONFIG}\n[client]\ncommand_history_size = 0\n");
        let config: Config = toml::from_str(&input).expect("test configuration should parse");

        assert!(config.validate().is_err());
    }
}
