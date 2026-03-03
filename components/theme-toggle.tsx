"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme()

  if (!mounted) return null

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-full bg-transparent">
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  )
}
