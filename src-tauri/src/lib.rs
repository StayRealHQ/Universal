use tauri::{window::Color, WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
fn navigate(webview_window: tauri::WebviewWindow, url: String) {
  _ = webview_window.navigate(tauri::Url::parse(&url).unwrap());
}

pub const ARKOSE_INIT_SCRIPT: &str = r#"
if (window.location.origin === "https://client-api.arkoselabs.com") {
  const tweak = (obj, prop, val) => obj.__defineGetter__(prop, () => val)

  tweak(navigator, "hardwareConcurrency", 4)
  tweak(navigator, "userAgentData", null)
  tweak(navigator, "platform", "iPhone")
  tweak(navigator, "connection", null)

  tweak(window.screen, "height", 852)
  tweak(window.screen, "width", 393)

  tweak(window.screen, "availHeight", 852)
  tweak(window.screen, "availWidth", 393)

  tweak(window.screen, "pixelDepth", 24)
  tweak(window.screen, "colorDepth", 24)

  tweak(window.screen.orientation, "type", "portrait-primary")
  tweak(window, "devicePixelRatio", 3)
}
"#;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_os::init())
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_internal_api::init())
    .setup(|app| {
        let mut win = WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
          .background_color(Color(0, 0, 0, 255))
          .user_agent("Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148")
          .initialization_script_for_all_frames(ARKOSE_INIT_SCRIPT);

        #[cfg(not(mobile))]
        {
          win = win
            .title("StayReal")
            .theme(Some(tauri::Theme::Dark))
            .inner_size(436.0, 800.0)
            .min_inner_size(436.0, 600.0)
        }

        win.build()?;

        Ok(())
    })
    .invoke_handler(tauri::generate_handler![navigate])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
