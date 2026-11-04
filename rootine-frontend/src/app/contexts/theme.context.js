import { createContext, useContext } from "react";

export const THEME_KEY = "theme";
export const THEMES = ["system", "light", "dark"];

/** { theme: "system" | "light" | "dark", resolvedTheme: "light" | "dark", setTheme(theme) } */
export const ThemeContext = createContext(null);

export const useTheme = () => useContext(ThemeContext);
