import { useCallback, useEffect, useMemo, useState } from "react";
import { THEMES, THEME_KEY, ThemeContext } from "../contexts/theme.context.js";

const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

// Storage can be unavailable (private mode, blocked site data); the theme still works for the session
function readStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return THEMES.includes(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme);
  const [systemDark, setSystemDark] = useState(() => darkQuery().matches);

  // Follow OS changes while on "system"
  useEffect(() => {
    const query = darkQuery();
    const onChange = (e) => setSystemDark(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const resolvedTheme = theme === "system" ? (systemDark ? "dark" : "light") : theme;

  // The CSS tokens switch on this attribute (see index.css)
  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    try {
      if (next === "system") localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, next);
    } catch {
      // Not persisted; applies for this session only
    }
  }, []);

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
