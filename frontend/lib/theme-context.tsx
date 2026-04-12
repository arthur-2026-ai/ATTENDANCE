"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system")
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme") as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    let effectiveTheme = theme
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }

    const isDarkTheme = effectiveTheme === "dark"
    setIsDark(isDarkTheme)

    if (isDarkTheme) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    localStorage.setItem("theme", theme)
  }, [theme, mounted])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  return <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, isDark }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
