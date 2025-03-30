import { defineConfig, presetWind3, transformerVariantGroup } from "unocss";
import corvu from "@corvu/unocss";
import { presetKobalte } from 'unocss-preset-primitives'

export default defineConfig({
  // @ts-expect-error
  presets: [presetWind3(), corvu(), presetKobalte({ prefix: "kobalte" })],
  transformers: [transformerVariantGroup()]
});
