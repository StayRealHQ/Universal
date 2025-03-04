use crate::{models::*, InternalApiExtension};
use caesium::{
  compress_to_size_in_memory, convert_in_memory, parameters::CSParameters, SupportedFileTypes,
};
use tauri::{command, AppHandle, Runtime};

#[command]
pub(crate) async fn set_auth_details<R: Runtime>(
  app: AppHandle<R>,
  payload: AuthDetails,
) -> crate::Result<()> {
  app.api().set_auth_details(payload)
}

#[command]
pub(crate) async fn get_auth_details<R: Runtime>(app: AppHandle<R>) -> crate::Result<AuthDetails> {
  app.api().get_auth_details()
}

#[command]
pub(crate) async fn clear_auth_details<R: Runtime>(app: AppHandle<R>) -> crate::Result<()> {
  app.api().clear_auth_details()
}

#[command]
pub(crate) async fn refresh_token<R: Runtime>(app: AppHandle<R>) -> crate::Result<()> {
  app.api().refresh_token().await
}

#[command]
pub(crate) async fn set_region<R: Runtime>(
  app: AppHandle<R>,
  payload: SetRegionArgs,
) -> crate::Result<()> {
  app.api().set_region(payload)
}

#[command]
pub(crate) async fn fetch_last_moment<R: Runtime>(app: AppHandle<R>) -> crate::Result<Moment> {
  app.api().fetch_last_moment().await
}

#[command]
pub(crate) async fn convert_jpeg_to_webp<R: Runtime>(
  _app: AppHandle<R>,
  payload: ConvertJpegToWebpArgs,
) -> crate::Result<Vec<u8>> {
  let parameters = CSParameters::new();
  let webp = convert_in_memory(payload.jpeg, &parameters, SupportedFileTypes::WebP)?;

  Ok(webp)
}

#[command]
pub(crate) async fn compress_webp_to_size<R: Runtime>(
  _app: AppHandle<R>,
  payload: CompressWebpToSizeArgs,
) -> crate::Result<Vec<u8>> {
  let mut parameters = CSParameters::new();

  let compressed =
    compress_to_size_in_memory(payload.webp, &mut parameters, payload.max_size, true)?;

  Ok(compressed)
}

#[command]
pub(crate) async fn request_permissions<R: Runtime>(
  app_handle: AppHandle<R>,
) -> crate::Result<NotificationPermissionStatus> {
  app_handle.api().request_permissions()
}
