import { useNavigate, useLocation } from "react-router"
import { useTranslation } from "react-i18next"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/cn"
import { isLocale } from "@/i18n"
import { useIsHydrated } from "@/lib/useIsHydrated"

export function LocaleToggle() {
  const { i18n, t } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const hydrated = useIsHydrated()

  const current = isLocale(i18n.language) ? i18n.language : "pt"
  const other = current === "pt" ? "en" : "pt"
  const isEn = hydrated && current === "en"

  const switchLocale = () => {
    const next = pathname.replace(/^\/(pt|en)/, `/${other}`)
    void navigate(next)
  }

  return (
    <SwitchPrimitives.Root
      checked={isEn}
      onCheckedChange={switchLocale}
      aria-label={t("locale.switchTo", { locale: other.toUpperCase() })}
      className={cn(
        "relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full",
        "border border-border bg-secondary transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "data-[state=checked]:bg-primary/15",
      )}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none flex h-5 w-6 translate-x-0.5 items-center justify-center rounded-full",
          "bg-background text-foreground shadow-md ring-1 ring-border transition-transform",
          "font-mono text-[10px] font-semibold uppercase",
          "data-[state=checked]:translate-x-[1.875rem]",
        )}
      >
        {hydrated ? current.toUpperCase() : ""}
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
  )
}
