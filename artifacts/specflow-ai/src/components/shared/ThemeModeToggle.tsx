"use client"

import { LaptopMinimal, Moon, SunMedium } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: SunMedium },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: LaptopMinimal },
] as const

export function ThemeModeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = useMemo(() => {
    return theme === "light" || theme === "dark" ? theme : "system"
  }, [theme])

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      value={mounted ? currentTheme : undefined}
      onValueChange={(value) => {
        if (value === "light" || value === "dark" || value === "system") {
          setTheme(value)
        }
      }}
      aria-label="Theme mode"
      className={cn("rounded-md border border-border bg-card p-1 shadow-sm", className)}
    >
      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
        <ToggleGroupItem
          key={value}
          value={value}
          aria-label={label}
          className="h-8 gap-1.5 rounded-sm px-2.5 text-xs"
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
