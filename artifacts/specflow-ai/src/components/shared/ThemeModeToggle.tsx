"use client"

import { Moon, SunMedium } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

type ThemeMode = "light" | "dark"

export function ThemeModeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = useMemo<ThemeMode>(() => {
    if (theme === "light" || theme === "dark") {
      return theme
    }

    return resolvedTheme === "dark" ? "dark" : "light"
  }, [resolvedTheme, theme])

  useEffect(() => {
    if (!mounted || theme === "light" || theme === "dark") {
      return
    }

    setTheme(currentTheme)
  }, [currentTheme, mounted, setTheme, theme])

  const toggleTheme = () => {
    setTheme(currentTheme === "dark" ? "light" : "dark")
  }

  const Icon = currentTheme === "dark" ? Moon : SunMedium

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${currentTheme === "dark" ? "light" : "dark"} mode`}
      aria-pressed={currentTheme === "dark"}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span>{currentTheme === "dark" ? "Dark" : "Light"}</span>
    </button>
  )
}
