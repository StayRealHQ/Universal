import { defineConfig, presetWind3, transformerVariantGroup } from "unocss";
import corvu from "@corvu/unocss";

export default defineConfig({
  // @ts-expect-error
  presets: [presetWind3(), corvu()],
  transformers: [transformerVariantGroup()]
});
