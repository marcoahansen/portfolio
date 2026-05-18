import { useTranslation } from "react-i18next"
import { Moon, Sun } from "lucide-react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/cn"
import { useTheme } from "@/lib/theme"
import { useIsHydrated } from "@/lib/useIsHydrated"

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const { t } = useTranslation()
  const hydrated = useIsHydrated()

  const isDark = hydrated && theme === "dark"
  const label = isDark ? t("theme.toLight") : t("theme.toDark")
  return (
    <SwitchPrimitives.Root
      checked={isDark}
      onCheckedChange={toggle}
      aria-label={label}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full",
        "border border-border bg-secondary transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "data-[state=checked]:bg-primary/15",
      )}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none flex size-5 translate-x-0.5 items-center justify-center rounded-full",
          "bg-background text-foreground shadow-md ring-1 ring-border transition-transform",
          "data-[state=checked]:translate-x-[1.375rem]",
        )}
      >
        {!hydrated ? (
          <span className="size-3" aria-hidden="true" />
        ) : isDark ? (
          <Moon className="size-3" aria-hidden="true" />
        ) : (
          <Sun className="size-3" aria-hidden="true" />
        )}
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
  )
}
