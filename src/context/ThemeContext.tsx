import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(() => localStorage.getItem("wf-theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("wf-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => setIsDark((d) => !d);

  return <ThemeContext.Provider value={{ isDark, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
