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

  tweak(window, "outerHeight", 0)
  tweak(window, "outerWidth", 0)

  const originalWebGLParameter = WebGLRenderingContext.prototype.getParameter;
  WebGLRenderingContext.prototype.getParameter = function (pname) {
    switch (pname) {
      case 0x9245: // UNMASKED_VENDOR_WEBGL
        return "Apple Inc.";
      case 0x9246: // UNMASKED_RENDERER_WEBGL
        return "Apple GPU";
      case 0x1F01: // RENDERER
        return "WebKit WebGL";
      case 0x1F00: // VENDOR
        return "WebKit";
      case 0x1F02: // VERSION
        return "WebGL 1.0";
      case 0x8B8C: // SHADING_LANGUAGE_VERSION
        return "WebGL GLSL ES 1.0 (1.0)";
    }

    return originalWebGLParameter.call(this, pname);
  }

  const originalWebGLAttributes = WebGLRenderingContext.prototype.getContextAttributes;
  WebGLRenderingContext.prototype.getContextAttributes = function () {
    const attributes = originalWebGLAttributes.call(this) ?? {};
    attributes.antialias = true;
    return attributes;
  }

  WebGLRenderingContext.prototype.getSupportedExtensions = function () {
    return [
      "ANGLE_instanced_arrays", "EXT_blend_minmax", "EXT_clip_control",
      "EXT_color_buffer_half_float", "EXT_depth_clamp", "EXT_float_blend",
      "EXT_frag_depth", "EXT_polygon_offset_clamp", "EXT_shader_texture_lod",
      "EXT_texture_compression_bptc", "EXT_texture_compression_rgtc",
      "EXT_texture_filter_anisotropic", "EXT_texture_mirror_clamp_to_edge",
      "EXT_sRGB", "KHR_parallel_shader_compile", "OES_element_index_uint",
      "OES_fbo_render_mipmap", "OES_standard_derivatives", "OES_texture_float",
      "OES_texture_float_linear", "OES_texture_half_float",
      "OES_texture_half_float_linear", "OES_vertex_array_object",
      "WEBGL_blend_func_extended", "WEBGL_color_buffer_float",
      "WEBGL_compressed_texture_astc", "WEBGL_compressed_texture_etc",
      "WEBGL_compressed_texture_etc1", "WEBGL_compressed_texture_pvrtc",
      "WEBKIT_WEBGL_compressed_texture_pvrtc", "WEBGL_compressed_texture_s3tc",
      "WEBGL_compressed_texture_s3tc_srgb", "WEBGL_debug_renderer_info",
      "WEBGL_debug_shaders", "WEBGL_depth_texture", "WEBGL_draw_buffers",
      "WEBGL_lose_context", "WEBGL_multi_draw", "WEBGL_polygon_mode"
    ];
  }
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
          .user_agent("Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148")
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
