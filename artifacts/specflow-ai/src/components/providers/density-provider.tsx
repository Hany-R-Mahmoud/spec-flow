"use client"

import * as React from "react"

export type DensityMode = "comfortable" | "compact"

type DensityContextValue = {
  density: DensityMode
  setDensity: (density: DensityMode) => void
}

const DENSITY_STORAGE_KEY = "specflow-density"

const DensityContext = React.createContext<DensityContextValue | undefined>(
  undefined,
)

function isDensityMode(value: string | null): value is DensityMode {
  return value === "comfortable" || value === "compact"
}

export function DensityProvider({ children }: { children: React.ReactNode }) {
  const [density, setDensityState] = React.useState<DensityMode>("comfortable")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const savedDensity = window.localStorage.getItem(DENSITY_STORAGE_KEY)
    if (isDensityMode(savedDensity)) {
      setDensityState(savedDensity)
    }
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) {
      return
    }

    document.documentElement.dataset.density = density
    window.localStorage.setItem(DENSITY_STORAGE_KEY, density)
  }, [density, mounted])

  const setDensity = React.useCallback((nextDensity: DensityMode) => {
    setDensityState(nextDensity)
  }, [])

  return (
    <DensityContext.Provider value={{ density, setDensity }}>
      {children}
    </DensityContext.Provider>
  )
}

export function useDensity() {
  const context = React.useContext(DensityContext)
  if (!context) {
    throw new Error("useDensity must be used within a DensityProvider")
  }

  return context
}
