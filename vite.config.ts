import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import icons from "unplugin-icons/vite";
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import unocss from "unocss/vite";
import path from "node:path";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(async () => ({
  plugins: [
    unocss(),
    icons({
      compiler: "solid",
      customCollections: {
        stayreal: FileSystemIconLoader(path.resolve(__dirname, "icons"))
      }
    }),
    solid()
  ],

  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src")
    }
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    }
  }
}));
