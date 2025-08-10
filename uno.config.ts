import { defineConfig, presetWind3, transformerVariantGroup } from "unocss";
import corvu from "@corvu/unocss";
import { presetKobalte } from 'unocss-preset-primitives'

export default defineConfig({
  // @ts-expect-error
  presets: [presetWind3(), corvu(), presetKobalte({ prefix: "kobalte" })],
  transformers: [transformerVariantGroup()],
  theme: {
    colors: {
      'bg-primary': 'var(--bg-primary)',
      'bg-secondary': 'var(--bg-secondary)',
      'bg-tertiary': 'var(--bg-tertiary)',
      'text-primary': 'var(--text-primary)',
      'text-secondary': 'var(--text-secondary)',
      'text-tertiary': 'var(--text-tertiary)',
      'border-primary': 'var(--border-primary)',
      'border-secondary': 'var(--border-secondary)',
      'overlay': 'var(--overlay)',
      'overlay-strong': 'var(--overlay-strong)',
    }
  }
});
