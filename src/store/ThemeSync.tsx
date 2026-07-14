"use client";

import { useEffect } from "react";

import { useSettingsStore } from "@/store/settings-store";

function applyTheme(theme: "light" | "dark" | "system") {
  const isDark =
    theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

function ThemeSync() {
  const theme = useSettingsStore((state) => state.preferences.theme);
  const hasHydrated = useSettingsStore((state) => state.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;
    applyTheme(theme);

    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme, hasHydrated]);

  return null;
}

export { ThemeSync };
