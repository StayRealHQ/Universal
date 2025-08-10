import { createRoot, createSignal, createEffect } from "solid-js";

export type ThemeMode = "light" | "dark" | "system";

export default createRoot(() => {
  const STORAGE_KEY = "theme_preference";
  const INITIAL_THEME = (typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) as ThemeMode : null) || "system";

  const [themeMode, setThemeMode] = createSignal<ThemeMode>(INITIAL_THEME);
  const [isDark, setIsDark] = createSignal<boolean>(false);

  const getSystemTheme = (): boolean => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const updateTheme = () => {
    if (typeof window === "undefined") return;
    
    const mode = themeMode();
    let dark: boolean;

    if (mode === "system") {
      dark = getSystemTheme();
    } else {
      dark = mode === "dark";
    }

    setIsDark(dark);
    
    // Update document class
    if (dark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }

    // Update theme-color meta tag
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", dark ? "#0D0E12" : "#FFFFFF");
    }
  };

  const setTheme = (mode: ThemeMode) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, mode);
    }
    setThemeMode(mode);
  };

  // Listen for system theme changes
  if (typeof window !== "undefined") {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", () => {
      if (themeMode() === "system") {
        updateTheme();
      }
    });
  }

  // Update theme when mode changes
  createEffect(() => {
    updateTheme();
  });

  // Initialize theme on mount
  updateTheme();

  return {
    themeMode,
    isDark,
    setTheme,
    getSystemTheme
  };
});