"use client"

import { Rows3, SquareDashedMousePointer } from "lucide-react"

import { cn } from "@/lib/utils"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DensityMode, useDensity } from "@/components/providers/density-provider"

const DENSITY_OPTIONS: { value: DensityMode; label: string; icon: typeof Rows3 }[] = [
  { value: "comfortable", label: "Comfortable", icon: Rows3 },
  { value: "compact", label: "Compact", icon: SquareDashedMousePointer },
]

export function DensityToggle({ className }: { className?: string }) {
  const { density, setDensity } = useDensity()

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      value={density}
      onValueChange={(value) => {
        if (value === "comfortable" || value === "compact") {
          setDensity(value)
        }
      }}
      aria-label="Layout density"
      className={cn("rounded-md border border-border bg-card p-1 shadow-sm", className)}
    >
      {DENSITY_OPTIONS.map(({ value, label, icon: Icon }) => (
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
