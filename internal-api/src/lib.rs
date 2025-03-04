use tauri::{
  plugin::{Builder, TauriPlugin},
  Manager, Runtime,
};

pub use models::*;

#[cfg(desktop)]
mod desktop;
#[cfg(mobile)]
mod mobile;

mod commands;
mod error;
mod models;

pub use error::{Error, Result};

#[cfg(desktop)]
use desktop::InternalApi;
#[cfg(mobile)]
use mobile::InternalApi;

pub trait InternalApiExtension<R: Runtime> {
  fn api(&self) -> &InternalApi<R>;
}

impl<R: Runtime, T: Manager<R>> InternalApiExtension<R> for T {
  fn api(&self) -> &InternalApi<R> {
    self.state::<InternalApi<R>>().inner()
  }
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("internal-api")
    .invoke_handler(tauri::generate_handler![
      commands::set_auth_details,
      commands::get_auth_details,
      commands::clear_auth_details,
      commands::refresh_token,
      commands::set_region,
      commands::fetch_last_moment,
      commands::convert_jpeg_to_webp,
      commands::compress_webp_to_size,
      commands::request_permissions
    ])
    .setup(|app, api| {
      #[cfg(mobile)]
      let internal_api = mobile::init(app, api)?;

      #[cfg(desktop)]
      let internal_api = desktop::init(app, api)?;

      app.manage(internal_api);

      Ok(())
    })
    .build()
}
