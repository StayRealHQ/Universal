use serde::de::DeserializeOwned;
use tauri::{
  plugin::{PluginApi, PluginHandle},
  AppHandle, Runtime,
};

use crate::models::*;

#[cfg(target_os = "ios")]
tauri::ios_plugin_binding!(init_plugin_internal_api);

pub fn init<R: Runtime, C: DeserializeOwned>(
  _app: &AppHandle<R>,
  api: PluginApi<R, C>,
) -> crate::Result<InternalApi<R>> {
  #[cfg(target_os = "android")]
  let handle = api.register_android_plugin("com.vexcited.stayreal.api", "ApiPlugin")?;

  #[cfg(target_os = "ios")]
  let handle = api.register_ios_plugin(init_plugin_internal_api)?;

  Ok(InternalApi(handle))
}

pub struct InternalApi<R: Runtime>(PluginHandle<R>);

impl<R: Runtime> InternalApi<R> {
  pub fn set_auth_details(&self, payload: AuthDetails) -> crate::Result<()> {
    self
      .0
      .run_mobile_plugin("setAuthDetails", payload)
      .map_err(Into::into)
  }

  pub fn get_auth_details(&self) -> crate::Result<AuthDetails> {
    self
      .0
      .run_mobile_plugin("getAuthDetails", ())
      .map_err(Into::into)
  }

  pub fn clear_auth_details(&self) -> crate::Result<()> {
    self
      .0
      .run_mobile_plugin("clearAuthDetails", ())
      .map_err(Into::into)
  }

  pub async fn refresh_token(&self) -> crate::Result<()> {
    self
      .0
      .run_mobile_plugin("refreshToken", ())
      .map_err(Into::into)
  }

  pub fn set_region(&self, payload: SetRegionArgs) -> crate::Result<()> {
    self
      .0
      .run_mobile_plugin("setRegion", payload)
      .map_err(Into::into)
  }

  pub async fn fetch_last_moment(&self) -> crate::Result<Moment> {
    self
      .0
      .run_mobile_plugin("fetchLastMoment", ())
      .map_err(Into::into)
  }

  pub fn request_permissions(&self) -> crate::Result<NotificationPermissionStatus> {
    self
      .0
      .run_mobile_plugin("requestPermissions", ())
      .map_err(Into::into)
  }
}
