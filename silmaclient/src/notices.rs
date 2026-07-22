use axum::{
    Json,
    extract::State,
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
};
use serde::{Deserialize, Serialize};

use crate::{tickets, websocket::AppState};

const MAX_NOTICE_CHARS: usize = 280;
const DEFAULT_UPDATE_TEXT: &str =
    "Il client verrà aggiornato a breve. Salva e preparati a riconnetterti.";

#[derive(Debug, Deserialize)]
pub struct BroadcastRequest {
    pub text: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct BroadcastResponse {
    pub ok: bool,
    pub recipients: usize,
    pub text: String,
}

#[derive(Debug, Serialize)]
pub struct PresenceResponse {
    pub ok: bool,
    pub connected: usize,
    pub max_connections: usize,
}

pub async fn get_presence(
    State(state): State<std::sync::Arc<AppState>>,
    headers: HeaderMap,
) -> Response {
    if !tickets::authorize_admin(&state, &headers) {
        return (StatusCode::UNAUTHORIZED, "Password admin non valida").into_response();
    }
    (
        StatusCode::OK,
        Json(PresenceResponse {
            ok: true,
            connected: state.connected_clients(),
            max_connections: state.config.connection.max_connections,
        }),
    )
        .into_response()
}

pub async fn broadcast_notice(
    State(state): State<std::sync::Arc<AppState>>,
    headers: HeaderMap,
    Json(body): Json<BroadcastRequest>,
) -> Response {
    if !tickets::authorize_admin(&state, &headers) {
        return (StatusCode::UNAUTHORIZED, "Password admin non valida").into_response();
    }

    let text = body
        .text
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or(DEFAULT_UPDATE_TEXT)
        .to_owned();

    if text.chars().count() > MAX_NOTICE_CHARS {
        return (StatusCode::BAD_REQUEST, "Messaggio troppo lungo").into_response();
    }

    let recipients = state.publish_notice(&text);
    (
        StatusCode::OK,
        Json(BroadcastResponse {
            ok: true,
            recipients,
            text,
        }),
    )
        .into_response()
}
