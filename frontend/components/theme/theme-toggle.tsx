"use client"

import { useTheme } from "@/lib/theme-context"
import { Moon, Sun, Monitor } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-md transition-colors ${
          theme === "light" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        title="Light mode"
      >
        <Sun size={18} />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-md transition-colors ${
          theme === "dark" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        title="Dark mode"
      >
        <Moon size={18} />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-md transition-colors ${
          theme === "system" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        title="System preference"
      >
        <Monitor size={18} />
      </button>
    </div>
  )
}
