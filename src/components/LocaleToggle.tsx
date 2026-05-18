import { Globe } from "lucide-react"
import { useNavigate, useLocation } from "react-router"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { isLocale } from "@/i18n"
import { useIsHydrated } from "@/lib/useIsHydrated"

export function LocaleToggle() {
  const { i18n, t } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const hydrated = useIsHydrated()

  const current = isLocale(i18n.language) ? i18n.language : "pt"
  const other = current === "pt" ? "en" : "pt"

  const switchLocale = () => {
    const next = pathname.replace(/^\/(pt|en)/, `/${other}`)
    void navigate(next)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={switchLocale}
      aria-label={t("locale.switchTo", { locale: other.toUpperCase() })}
      className="gap-1.5"
    >
      <Globe className="size-4" aria-hidden="true" />
      {hydrated ? other.toUpperCase() : ""}
    </Button>
  )
}
