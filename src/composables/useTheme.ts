import { ref, watch } from "vue";
import type { Theme } from "../types/ui";

const DARK_THEME_MEDIA_QUERY = "(prefers-color-scheme: dark)";

const FALLBACK_THEME_COLORS: Record<Theme, string> = {
  light: "#f4f4f5",
  dark: "#111113",
};

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia(DARK_THEME_MEDIA_QUERY).matches ? "dark" : "light";
}

function getToolbarThemeColor(themeValue: Theme): string {
  const fallback = FALLBACK_THEME_COLORS[themeValue] ?? FALLBACK_THEME_COLORS.light;

  if (typeof document === "undefined") {
    return fallback;
  }

  const themedRoot = document.querySelector("[data-theme]");
  if (!themedRoot) {
    return fallback;
  }

  const toolbarBg = getComputedStyle(themedRoot)
    .getPropertyValue("--toolbar-bg")
    .trim();

  return toolbarBg || fallback;
}

function applyThemeColorMeta(themeValue: Theme): void {
  if (typeof document === "undefined") {
    return;
  }

  const color = getToolbarThemeColor(themeValue);
  let themeColorMeta = document.querySelector('meta[name="theme-color"]');

  if (!themeColorMeta) {
    themeColorMeta = document.createElement("meta");
    themeColorMeta.setAttribute("name", "theme-color");
    document.head.appendChild(themeColorMeta);
  }

  themeColorMeta.setAttribute("content", color);
  document.documentElement.style.colorScheme = themeValue;
}

export function useTheme() {
  const theme = ref<Theme>(getInitialTheme());

  watch(
    theme,
    (value) => {
      applyThemeColorMeta(value);
    },
    { immediate: true, flush: "post" },
  );

  function toggleTheme(): void {
    theme.value = theme.value === "dark" ? "light" : "dark";
  }

  return {
    theme,
    toggleTheme,
  };
}
