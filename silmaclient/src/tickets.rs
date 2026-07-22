use std::{
    collections::hash_map::DefaultHasher,
    hash::{Hash, Hasher},
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};

use axum::{
    Json,
    extract::{Path as AxumPath, State},
    http::{HeaderMap, StatusCode, header::AUTHORIZATION},
    response::{IntoResponse, Response},
};
use serde::{Deserialize, Serialize};
use tokio::fs;
use tracing::warn;

use crate::websocket::AppState;

const MAX_TEXT_CHARS: usize = 4_000;
const MAX_NICK_CHARS: usize = 40;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TicketKind {
    Bug,
    Miglioria,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum TicketStatus {
    Nuova,
    InCorso,
    Fatta,
    Scartata,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Ticket {
    pub id: String,
    pub kind: TicketKind,
    pub text: String,
    #[serde(default)]
    pub nick: String,
    pub status: TicketStatus,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateTicketRequest {
    pub kind: TicketKind,
    pub text: String,
    #[serde(default)]
    pub nick: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTicketRequest {
    pub status: TicketStatus,
}

pub async fn create_ticket(
    State(state): State<std::sync::Arc<AppState>>,
    Json(body): Json<CreateTicketRequest>,
) -> Response {
    let text = body.text.trim().to_owned();
    if text.is_empty() {
        return (StatusCode::BAD_REQUEST, "Il testo è obbligatorio").into_response();
    }
    if text.chars().count() > MAX_TEXT_CHARS {
        return (StatusCode::BAD_REQUEST, "Testo troppo lungo").into_response();
    }
    let nick = body.nick.trim().chars().take(MAX_NICK_CHARS).collect::<String>();

    let dir = tickets_dir(&state.data_dir);
    if let Err(error) = fs::create_dir_all(&dir).await {
        warn!(%error, "cannot create tickets directory");
        return (StatusCode::INTERNAL_SERVER_ERROR, "Impossibile salvare").into_response();
    }

    let now = iso_now();
    let ticket = Ticket {
        id: new_ticket_id(),
        kind: body.kind,
        text,
        nick,
        status: TicketStatus::Nuova,
        created_at: now.clone(),
        updated_at: now,
    };

    let path = dir.join(format!("{}.json", ticket.id));
    let encoded = match serde_json::to_vec_pretty(&ticket) {
        Ok(bytes) => bytes,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Impossibile salvare").into_response(),
    };
    if let Err(error) = fs::write(&path, encoded).await {
        warn!(%error, path = %path.display(), "cannot write ticket");
        return (StatusCode::INTERNAL_SERVER_ERROR, "Impossibile salvare").into_response();
    }

    (
        StatusCode::CREATED,
        Json(serde_json::json!({ "id": ticket.id, "ok": true })),
    )
        .into_response()
}

pub async fn list_tickets(
    State(state): State<std::sync::Arc<AppState>>,
    headers: HeaderMap,
) -> Response {
    if !authorize_admin(&state, &headers) {
        return (StatusCode::UNAUTHORIZED, "Password admin non valida").into_response();
    }

    let dir = tickets_dir(&state.data_dir);
    let mut tickets = Vec::new();
    let mut entries = match fs::read_dir(&dir).await {
        Ok(entries) => entries,
        Err(_) => {
            return Json(Vec::<Ticket>::new()).into_response();
        }
    };

    while let Ok(Some(entry)) = entries.next_entry().await {
        let path = entry.path();
        if path.extension().and_then(|ext| ext.to_str()) != Some("json") {
            continue;
        }
        if let Ok(contents) = fs::read_to_string(&path).await {
            if let Ok(ticket) = serde_json::from_str::<Ticket>(&contents) {
                tickets.push(ticket);
            }
        }
    }

    tickets.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Json(tickets).into_response()
}

pub async fn update_ticket(
    State(state): State<std::sync::Arc<AppState>>,
    headers: HeaderMap,
    AxumPath(id): AxumPath<String>,
    Json(body): Json<UpdateTicketRequest>,
) -> Response {
    if !authorize_admin(&state, &headers) {
        return (StatusCode::UNAUTHORIZED, "Password admin non valida").into_response();
    }
    match load_ticket(&state.data_dir, &id).await {
        Ok(mut ticket) => {
            ticket.status = body.status;
            ticket.updated_at = iso_now();
            match save_ticket(&state.data_dir, &ticket).await {
                Ok(()) => Json(ticket).into_response(),
                Err(response) => response,
            }
        }
        Err(response) => response,
    }
}

pub async fn delete_ticket(
    State(state): State<std::sync::Arc<AppState>>,
    headers: HeaderMap,
    AxumPath(id): AxumPath<String>,
) -> Response {
    if !authorize_admin(&state, &headers) {
        return (StatusCode::UNAUTHORIZED, "Password admin non valida").into_response();
    }
    if !is_safe_ticket_id(&id) {
        return (StatusCode::BAD_REQUEST, "ID non valido").into_response();
    }

    let path = tickets_dir(&state.data_dir).join(format!("{id}.json"));
    match fs::remove_file(&path).await {
        Ok(()) => StatusCode::NO_CONTENT.into_response(),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
            (StatusCode::NOT_FOUND, "Ticket non trovato").into_response()
        }
        Err(error) => {
            warn!(%error, path = %path.display(), "cannot delete ticket");
            (StatusCode::INTERNAL_SERVER_ERROR, "Impossibile eliminare").into_response()
        }
    }
}

async fn load_ticket(data_dir: &Path, id: &str) -> Result<Ticket, Response> {
    if !is_safe_ticket_id(id) {
        return Err((StatusCode::BAD_REQUEST, "ID non valido").into_response());
    }
    let path = tickets_dir(data_dir).join(format!("{id}.json"));
    let contents = fs::read_to_string(&path).await.map_err(|_| {
        (StatusCode::NOT_FOUND, "Ticket non trovato").into_response()
    })?;
    serde_json::from_str(&contents).map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, "Ticket corrotto").into_response()
    })
}

async fn save_ticket(data_dir: &Path, ticket: &Ticket) -> Result<(), Response> {
    let path = tickets_dir(data_dir).join(format!("{}.json", ticket.id));
    let encoded = serde_json::to_vec_pretty(ticket).map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, "Impossibile salvare").into_response()
    })?;
    fs::write(&path, encoded).await.map_err(|error| {
        warn!(%error, path = %path.display(), "cannot write ticket");
        (StatusCode::INTERNAL_SERVER_ERROR, "Impossibile salvare").into_response()
    })
}

pub(crate) fn authorize_admin(state: &AppState, headers: &HeaderMap) -> bool {
    let expected = state.config.admin.password.trim();
    if expected.is_empty() {
        return false;
    }
    let Some(header) = headers.get(AUTHORIZATION).and_then(|value| value.to_str().ok()) else {
        return false;
    };
    let Some(token) = header.strip_prefix("Bearer ") else {
        return false;
    };
    constant_time_eq(token.as_bytes(), expected.as_bytes())
}

fn constant_time_eq(left: &[u8], right: &[u8]) -> bool {
    if left.len() != right.len() {
        return false;
    }
    let mut diff = 0u8;
    for (a, b) in left.iter().zip(right.iter()) {
        diff |= a ^ b;
    }
    diff == 0
}

fn tickets_dir(data_dir: &Path) -> PathBuf {
    data_dir.join("tickets")
}

fn is_safe_ticket_id(value: &str) -> bool {
    let len = value.len();
    (4..=128).contains(&len)
        && value
            .chars()
            .all(|ch| ch.is_ascii_alphanumeric() || ch == '-' || ch == '_')
}

fn new_ticket_id() -> String {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_nanos())
        .unwrap_or(0);
    let mut hasher = DefaultHasher::new();
    nanos.hash(&mut hasher);
    std::process::id().hash(&mut hasher);
    format!("t{nanos:x}{:x}", hasher.finish())
}

fn iso_now() -> String {
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs())
        .unwrap_or(0);
    // Compact UTC timestamp; good enough for sorting/display.
    format!("{secs}")
}

#[cfg(test)]
mod tests {
    use super::{constant_time_eq, is_safe_ticket_id, new_ticket_id};

    #[test]
    fn ticket_ids_are_safe() {
        let id = new_ticket_id();
        assert!(is_safe_ticket_id(&id), "{id}");
    }

    #[test]
    fn password_compare_rejects_length_mismatch() {
        assert!(!constant_time_eq(b"ab", b"abc"));
        assert!(constant_time_eq(b"Simaril", b"Simaril"));
    }
}
