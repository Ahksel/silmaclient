use std::{
    collections::hash_map::DefaultHasher,
    hash::{Hash, Hasher},
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};

use axum::{
    body::Bytes,
    extract::State,
    http::{
        HeaderMap, HeaderValue, StatusCode,
        header::{CACHE_CONTROL, CONTENT_TYPE, COOKIE, SET_COOKIE},
    },
    response::{IntoResponse, Response},
};
use serde_json::{Value, json};
use tokio::fs;
use tracing::warn;

use crate::websocket::AppState;

const COOKIE_NAME: &str = "silma_profile";
const MAX_BODY_BYTES: usize = 256 * 1024;

pub async fn get_macros(State(state): State<std::sync::Arc<AppState>>, headers: HeaderMap) -> Response {
    let (profile_id, is_new) = resolve_profile_id(&headers);
    let path = macros_path(&state.data_dir, &profile_id);
    let payload = match fs::read_to_string(&path).await {
        Ok(contents) => contents,
        Err(_) => json!({ "version": 1, "categories": [] }).to_string(),
    };

    let mut response = Response::builder()
        .status(StatusCode::OK)
        .header(CONTENT_TYPE, "application/json; charset=utf-8")
        .header(CACHE_CONTROL, "no-store")
        .body(payload.into())
        .unwrap_or_else(|_| StatusCode::INTERNAL_SERVER_ERROR.into_response());

    if is_new {
        if let Ok(value) = HeaderValue::from_str(&profile_cookie(&profile_id)) {
            response.headers_mut().append(SET_COOKIE, value);
        }
    }
    response
}

pub async fn put_macros(
    State(state): State<std::sync::Arc<AppState>>,
    headers: HeaderMap,
    body: Bytes,
) -> Response {
    if body.len() > MAX_BODY_BYTES {
        return (StatusCode::PAYLOAD_TOO_LARGE, "macros payload too large").into_response();
    }

    let (profile_id, is_new) = resolve_profile_id(&headers);
    let parsed: Value = match serde_json::from_slice(&body) {
        Ok(value) => value,
        Err(_) => return (StatusCode::BAD_REQUEST, "invalid JSON").into_response(),
    };
    if !parsed.get("categories").map(|value| value.is_array()).unwrap_or(false) {
        return (StatusCode::BAD_REQUEST, "categories array required").into_response();
    }

    if let Err(error) = fs::create_dir_all(&state.data_dir).await {
        warn!(%error, "cannot create macros data directory");
        return (StatusCode::INTERNAL_SERVER_ERROR, "cannot store macros").into_response();
    }

    let path = macros_path(&state.data_dir, &profile_id);
    let encoded = match serde_json::to_vec_pretty(&parsed) {
        Ok(bytes) => bytes,
        Err(_) => return (StatusCode::BAD_REQUEST, "invalid macros payload").into_response(),
    };
    if let Err(error) = fs::write(&path, encoded).await {
        warn!(%error, path = %path.display(), "cannot write macros file");
        return (StatusCode::INTERNAL_SERVER_ERROR, "cannot store macros").into_response();
    }

    let mut response = StatusCode::NO_CONTENT.into_response();
    response
        .headers_mut()
        .insert(CACHE_CONTROL, HeaderValue::from_static("no-store"));
    if is_new {
        if let Ok(value) = HeaderValue::from_str(&profile_cookie(&profile_id)) {
            response.headers_mut().append(SET_COOKIE, value);
        }
    }
    response
}

fn macros_path(data_dir: &Path, profile_id: &str) -> PathBuf {
    data_dir.join(format!("{profile_id}.json"))
}

fn profile_cookie(profile_id: &str) -> String {
    format!(
        "{COOKIE_NAME}={profile_id}; Path=/; Max-Age=31536000; SameSite=Lax"
    )
}

fn resolve_profile_id(headers: &HeaderMap) -> (String, bool) {
    if let Some(existing) = cookie_value(headers, COOKIE_NAME).filter(|id| is_safe_profile_id(id)) {
        return (existing, false);
    }
    (new_profile_id(), true)
}

fn cookie_value(headers: &HeaderMap, name: &str) -> Option<String> {
    let cookie_header = headers.get(COOKIE)?.to_str().ok()?;
    for part in cookie_header.split(';') {
        let part = part.trim();
        let mut pieces = part.splitn(2, '=');
        let key = pieces.next()?.trim();
        let value = pieces.next()?.trim();
        if key == name && !value.is_empty() {
            return Some(value.to_owned());
        }
    }
    None
}

fn is_safe_profile_id(value: &str) -> bool {
    let len = value.len();
    (16..=80).contains(&len)
        && value
            .chars()
            .all(|ch| ch.is_ascii_alphanumeric() || ch == '-' || ch == '_')
}

fn new_profile_id() -> String {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_nanos())
        .unwrap_or(0);
    let mut hasher = DefaultHasher::new();
    nanos.hash(&mut hasher);
    std::process::id().hash(&mut hasher);
    format!("p{nanos:x}{:x}", hasher.finish())
}

#[cfg(test)]
mod tests {
    use super::{is_safe_profile_id, new_profile_id};

    #[test]
    fn generated_profile_ids_are_safe() {
        let id = new_profile_id();
        assert!(is_safe_profile_id(&id), "{id}");
    }
}
