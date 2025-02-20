use std::{collections::HashMap, path::PathBuf};

use reqwest::header::{HeaderMap, HeaderValue};
use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Manager, Runtime};

use base64::{engine::general_purpose::STANDARD as b64, Engine as _};
use hex::FromHex;
use hmac::{Hmac, Mac};
use sha2::Sha256;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::models::*;

pub fn init<R: Runtime, C: DeserializeOwned>(
  app: &AppHandle<R>,
  _api: PluginApi<R, C>,
) -> crate::Result<InternalApi<R>> {
  Ok(InternalApi(app.clone()))
}

const BEREAL_IOS_BUNDLE_ID: &str = "AlexisBarreyat.BeReal";
const BEREAL_IOS_VERSION: &str = "4.10.0";
const BEREAL_IOS_BUILD: &str = "19846";
const BEREAL_CLIENT_SECRET: &str = "962D357B-B134-4AB6-8F53-BEA2B7255420";
const BEREAL_HMAC_KEY_HEX: &str =
  "3536303337663461663232666236393630663363643031346532656337316233";

pub struct InternalApi<R: Runtime>(AppHandle<R>);
impl<R: Runtime> InternalApi<R> {
  fn data_dir(&self) -> PathBuf {
    self.0.path().app_local_data_dir().unwrap()
  }

  fn create_bereal_signature(&self, device_id: &str) -> String {
    let bereal_hmac_key = Vec::from_hex(BEREAL_HMAC_KEY_HEX).expect("invalid HMAC key");
    let bereal_timezone = iana_time_zone::get_timezone().unwrap();

    let timestamp = SystemTime::now()
      .duration_since(UNIX_EPOCH)
      .expect("time went backwards")
      .as_secs()
      .to_string();

    let data = format!("{}{}{}", device_id, bereal_timezone, timestamp);
    let data = data.as_bytes();

    let mut hash =
      Hmac::<Sha256>::new_from_slice(&bereal_hmac_key).expect("HMAC can take key of any size");
    hash.update(b64.encode(data).as_bytes());
    let hash = hash.finalize().into_bytes();

    let prefix = format!("1:{}:", timestamp);
    let prefix = prefix.as_bytes();

    let mut bytes = Vec::new();
    bytes.extend_from_slice(prefix);
    bytes.extend_from_slice(&hash);

    b64.encode(&bytes)
  }

  fn bereal_default_headers(&self, device_id: &str) -> HeaderMap {
    let mut headers = HeaderMap::new();
    headers.insert("bereal-platform", HeaderValue::from_static("iOS"));
    headers.insert("bereal-os-version", HeaderValue::from_static("18.3"));
    headers.insert(
      "bereal-app-version",
      HeaderValue::from_static(BEREAL_IOS_VERSION),
    );
    headers.insert(
      "bereal-app-version-code",
      HeaderValue::from_static(BEREAL_IOS_BUILD),
    );
    headers.insert("bereal-device-language", HeaderValue::from_static("en"));
    headers.insert("bereal-app-language", HeaderValue::from_static("en-US"));
    headers.insert("bereal-device-id", device_id.parse().unwrap());

    headers.insert(
      "bereal-experiment-new-design",
      HeaderValue::from_static("false"),
    );
    headers.insert(
      "bereal-experiment-ranking",
      HeaderValue::from_static("false"),
    );
    headers.insert(
      "bereal-experiment-new-profile",
      HeaderValue::from_static("false"),
    );
    headers.insert(
      "bereal-experiment-unlimited-bereals",
      HeaderValue::from_static("false"),
    );

    let bereal_timezone = iana_time_zone::get_timezone().unwrap();
    headers.insert("bereal-timezone", bereal_timezone.parse().unwrap());

    let bereal_signature = self.create_bereal_signature(device_id);
    headers.insert("bereal-signature", bereal_signature.parse().unwrap());

    let user_agent = format!(
      "BeReal/{BEREAL_IOS_VERSION} ({BEREAL_IOS_BUNDLE_ID}; build:{BEREAL_IOS_BUILD}; iOS 18.3.0)"
    );
    headers.insert("user-agent", user_agent.parse().unwrap());

    headers
  }

  pub fn set_auth_details(&self, payload: AuthDetails) -> crate::Result<()> {
    let credentials_file_path = self.data_dir().join("credentials.json");

    if let Some(parent) = credentials_file_path.parent() {
      std::fs::create_dir_all(parent)?;
    }

    std::fs::write(
      credentials_file_path,
      serde_json::to_string(&payload).unwrap(),
    )
    .map_err(Into::into)
  }

  pub fn get_auth_details(&self) -> crate::Result<AuthDetails> {
    let credentials_file_path = self.data_dir().join("credentials.json");
    let credentials = std::fs::read_to_string(credentials_file_path).map_err(crate::Error::Io)?;
    serde_json::from_str(&credentials).map_err(Into::into)
  }

  pub fn clear_auth_details(&self) -> crate::Result<()> {
    let credentials_file_path = self.data_dir().join("credentials.json");
    std::fs::remove_file(credentials_file_path).map_err(Into::into)
  }

  pub async fn refresh_token(&self) -> crate::Result<()> {
    let auth = self.get_auth_details()?;

    let mut json = HashMap::new();
    json.insert("client_id", "ios");
    json.insert("grant_type", "refresh_token");
    json.insert("client_secret", BEREAL_CLIENT_SECRET);
    json.insert("refresh_token", &auth.refresh_token);

    let client = reqwest::Client::new();
    let response = client
      .post("https://auth-l7.bereal.com/token")
      .headers(self.bereal_default_headers(&auth.device_id))
      .json(&json)
      .send()
      .await?;

    if response.status() != 201 {
      return Err(crate::Error::RefreshTokenError());
    }

    let body: serde_json::Value = response.json().await?;

    let auth = AuthDetails {
      device_id: auth.device_id,
      access_token: body["access_token"].as_str().unwrap().to_string(),
      refresh_token: body["refresh_token"].as_str().unwrap().to_string(),
    };

    self.set_auth_details(auth)?;

    Ok(())
  }

  fn get_preferences(&self) -> crate::Result<Preferences> {
    let preferences_file_path = self.data_dir().join("preferences.json");
    let preferences = std::fs::read_to_string(preferences_file_path).map_err(crate::Error::Io)?;
    serde_json::from_str(&preferences).map_err(Into::into)
  }

  fn set_preferences(&self, preferences: Preferences) -> crate::Result<()> {
    let preferences_file_path = self.data_dir().join("preferences.json");

    if let Some(parent) = preferences_file_path.parent() {
      std::fs::create_dir_all(parent)?;
    }

    std::fs::write(
      preferences_file_path,
      serde_json::to_string(&preferences).unwrap(),
    )
    .map_err(Into::into)
  }

  pub fn set_region(&self, payload: SetRegionArgs) -> crate::Result<()> {
    let mut preferences = self.get_preferences().unwrap_or_default();
    preferences.region = payload.region;
    self.set_preferences(preferences)?;

    Ok(())
  }

  pub async fn fetch_last_moment(&self) -> crate::Result<Moment> {
    let preferences = self.get_preferences()?;

    let client = reqwest::Client::new();
    let response = client
      .get(format!(
        "https://mobile-l7.bereal.com/api/bereal/moments/last/{}",
        &preferences.region
      ))
      .send()
      .await?;

    let body: serde_json::Value = response.json().await?;

    let moment = Moment {
      id: body["id"].as_str().unwrap().to_string(),
      region: body["region"].as_str().unwrap().to_string(),
      start_date: body["startDate"].as_str().unwrap().to_string(),
      end_date: body["endDate"].as_str().unwrap().to_string(),
    };

    Ok(moment)
  }
}
