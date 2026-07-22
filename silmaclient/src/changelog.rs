use std::{
    collections::hash_map::DefaultHasher,
    hash::{Hash, Hasher},
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};

use axum::{
    Json,
    extract::{Path as AxumPath, State},
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
};
use serde::{Deserialize, Serialize};
use tokio::fs;
use tracing::warn;

use crate::{tickets, websocket::AppState};

const MAX_VERSION_CHARS: usize = 32;
const MAX_ITEMS: usize = 40;
const MAX_ITEM_CHARS: usize = 500;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ChangeKind {
    Fix,
    Feature,
    Note,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ChangeItem {
    pub kind: ChangeKind,
    pub text: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Release {
    pub id: String,
    pub version: String,
    pub created_at: String,
    pub items: Vec<ChangeItem>,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct ChangelogFile {
    pub releases: Vec<Release>,
}

#[derive(Debug, Deserialize)]
pub struct CreateReleaseRequest {
    pub version: String,
    pub items: Vec<ChangeItem>,
}

pub async fn get_changelog(State(state): State<std::sync::Arc<AppState>>) -> Response {
    match read_changelog(&state.data_dir).await {
        Ok(file) => Json(file).into_response(),
        Err(_) => Json(ChangelogFile::default()).into_response(),
    }
}

pub async fn create_release(
    State(state): State<std::sync::Arc<AppState>>,
    headers: HeaderMap,
    Json(body): Json<CreateReleaseRequest>,
) -> Response {
    if !tickets::authorize_admin(&state, &headers) {
        return (StatusCode::UNAUTHORIZED, "Password admin non valida").into_response();
    }

    let version = body.version.trim().to_owned();
    if version.is_empty() || version.chars().count() > MAX_VERSION_CHARS {
        return (StatusCode::BAD_REQUEST, "Versione non valida").into_response();
    }

    let mut items = Vec::new();
    for item in body.items.into_iter().take(MAX_ITEMS) {
        let text = item.text.trim().to_owned();
        if text.is_empty() {
            continue;
        }
        if text.chars().count() > MAX_ITEM_CHARS {
            return (StatusCode::BAD_REQUEST, "Voce troppo lunga").into_response();
        }
        items.push(ChangeItem {
            kind: item.kind,
            text,
        });
    }
    if items.is_empty() {
        return (StatusCode::BAD_REQUEST, "Aggiungi almeno una voce").into_response();
    }

    let mut file = read_changelog(&state.data_dir)
        .await
        .unwrap_or_default();
    let release = Release {
        id: new_release_id(),
        version,
        created_at: iso_now(),
        items,
    };
    file.releases.insert(0, release.clone());

    if let Err(error) = write_changelog(&state.data_dir, &file).await {
        warn!(%error, "cannot write changelog");
        return (StatusCode::INTERNAL_SERVER_ERROR, "Impossibile salvare").into_response();
    }

    (StatusCode::CREATED, Json(release)).into_response()
}

pub async fn delete_release(
    State(state): State<std::sync::Arc<AppState>>,
    headers: HeaderMap,
    AxumPath(id): AxumPath<String>,
) -> Response {
    if !tickets::authorize_admin(&state, &headers) {
        return (StatusCode::UNAUTHORIZED, "Password admin non valida").into_response();
    }
    if !is_safe_id(&id) {
        return (StatusCode::BAD_REQUEST, "ID non valido").into_response();
    }

    let mut file = match read_changelog(&state.data_dir).await {
        Ok(file) => file,
        Err(_) => return (StatusCode::NOT_FOUND, "Changelog vuoto").into_response(),
    };
    let before = file.releases.len();
    file.releases.retain(|release| release.id != id);
    if file.releases.len() == before {
        return (StatusCode::NOT_FOUND, "Release non trovata").into_response();
    }
    if let Err(error) = write_changelog(&state.data_dir, &file).await {
        warn!(%error, "cannot write changelog");
        return (StatusCode::INTERNAL_SERVER_ERROR, "Impossibile salvare").into_response();
    }
    StatusCode::NO_CONTENT.into_response()
}

fn changelog_path(data_dir: &Path) -> PathBuf {
    data_dir.join("changelog.json")
}

async fn read_changelog(data_dir: &Path) -> Result<ChangelogFile, ()> {
    let path = changelog_path(data_dir);
    let contents = fs::read_to_string(&path).await.map_err(|_| ())?;
    serde_json::from_str(&contents).map_err(|_| ())
}

async fn write_changelog(data_dir: &Path, file: &ChangelogFile) -> Result<(), std::io::Error> {
    fs::create_dir_all(data_dir).await?;
    let path = changelog_path(data_dir);
    let encoded = serde_json::to_vec_pretty(file)
        .map_err(|error| std::io::Error::new(std::io::ErrorKind::InvalidData, error))?;
    fs::write(path, encoded).await
}

fn is_safe_id(value: &str) -> bool {
    let len = value.len();
    (4..=128).contains(&len)
        && value
            .chars()
            .all(|ch| ch.is_ascii_alphanumeric() || ch == '-' || ch == '_')
}

fn new_release_id() -> String {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_nanos())
        .unwrap_or(0);
    let mut hasher = DefaultHasher::new();
    nanos.hash(&mut hasher);
    std::process::id().hash(&mut hasher);
    format!("r{nanos:x}{:x}", hasher.finish())
}

fn iso_now() -> String {
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs())
        .unwrap_or(0);
    format!("{secs}")
}
