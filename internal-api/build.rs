const COMMANDS: &[&str] = &[
  "set_auth_details",
  "get_auth_details",
  "clear_auth_details",
  "refresh_token",
  "set_region",
  "fetch_last_moment",
  "convert_jpeg_to_webp",
  "compress_webp_to_size",
  "request_permissions",
];

fn main() {
  tauri_plugin::Builder::new(COMMANDS)
    .android_path("android")
    .ios_path("ios")
    .build();
}
