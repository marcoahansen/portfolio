import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/lib/theme"

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === "dark"
  const label = isDark ? "Mudar para tema claro" : "Mudar para tema escuro"
  return (
    <Button type="button" variant="ghost" size="icon" onClick={toggle} aria-label={label}>
      {isDark ? (
        <Sun className="size-5" aria-hidden="true" />
      ) : (
        <Moon className="size-5" aria-hidden="true" />
      )}
    </Button>
  )
}
