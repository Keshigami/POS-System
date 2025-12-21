"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("system");
    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
    const [mounted, setMounted] = useState(false);

    // On mount, load saved theme preference
    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("pos-theme") as Theme | null;
        if (stored && ["light", "dark", "system"].includes(stored)) {
            setThemeState(stored);
        }
    }, []);

    // Apply theme to document
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        let resolved: "light" | "dark" = "light";

        if (theme === "system") {
            resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        } else {
            resolved = theme;
        }

        root.classList.remove("light", "dark");
        root.classList.add(resolved);
        setResolvedTheme(resolved);
    }, [theme, mounted]);

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== "system") return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
            const resolved = e.matches ? "dark" : "light";
            document.documentElement.classList.remove("light", "dark");
            document.documentElement.classList.add(resolved);
            setResolvedTheme(resolved);
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem("pos-theme", newTheme);
    };

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    // Return safe defaults during SSR or when outside provider
    if (context === undefined) {
        return {
            theme: "system" as const,
            setTheme: () => { },
            resolvedTheme: "light" as const
        };
    }
    return context;
}
