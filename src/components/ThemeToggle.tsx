import { useSyncExternalStore } from "react"
import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation()
  const hydrated = useIsHydrated()

  const isDark = hydrated && theme === "dark"
  const label = isDark ? t("theme.toLight") : t("theme.toDark")
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
