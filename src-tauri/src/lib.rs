#[tauri::command]
fn navigate(mut webview_window: tauri::WebviewWindow, url: String) {
  _ = webview_window.navigate(tauri::Url::parse(&url).unwrap());
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_os::init())
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_internal_api::init())
    .invoke_handler(tauri::generate_handler![navigate])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
