import { useSyncExternalStore } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/lib/theme"

const noop = () => undefined
const noopSubscribe = () => noop
const useIsHydrated = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const hydrated = useIsHydrated()

  const isDark = hydrated && theme === "dark"
  const label = isDark ? "Mudar para tema claro" : "Mudar para tema escuro"
  return (
    <Button type="button" variant="ghost" size="icon" onClick={toggle} aria-label={label}>
      {!hydrated ? (
        <span className="size-5" aria-hidden="true" />
      ) : isDark ? (
        <Sun className="size-5" aria-hidden="true" />
      ) : (
        <Moon className="size-5" aria-hidden="true" />
      )}
    </Button>
  )
}
