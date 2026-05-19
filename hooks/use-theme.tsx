import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void; // 👈 Añadimos toggleTheme
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemTheme = useRNColorScheme();
  const [theme, setThemeState] = useState<Theme>("system");

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // 👈 Función para alternar entre light y dark
  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      if (currentTheme === "system") {
        // Si está en system, cambia al opuesto del tema del sistema
        return systemTheme === "light" ? "dark" : "light";
      }
      // Si está en light o dark, cambia al opuesto
      return currentTheme === "light" ? "dark" : "light";
    });
  }, [systemTheme]);

  const resolvedTheme: "light" | "dark" = theme === "system"
    ? (systemTheme ?? "light")
    : theme;

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}