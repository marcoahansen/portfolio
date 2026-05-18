import { Link, useLocation, useParams } from "react-router"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/cn"
import { isLocale } from "@/i18n"
import { FEATURES } from "@/lib/features"
import { useScrolled } from "@/lib/scroll"
import { useScrollSpy } from "@/lib/scrollSpy"
import { LocaleToggle } from "@/components/LocaleToggle"
import { ThemeToggle } from "@/components/ThemeToggle"
import { MobileMenu } from "@/components/MobileMenu"

type NavAnchor = { id: "skills" | "experience" | "contact"; labelKey: string }

const HOME_ANCHORS: readonly NavAnchor[] = [
  { id: "skills", labelKey: "nav.skills" },
  { id: "experience", labelKey: "nav.experience" },
  { id: "contact", labelKey: "nav.contact" },
] as const

const HOME_SPY_IDS = HOME_ANCHORS.map((a) => a.id) as readonly string[]

function isHome(pathname: string, lang: string): boolean {
  return pathname === `/${lang}` || pathname === `/${lang}/`
}

export function Navbar() {
  const { t } = useTranslation()
  const { lang } = useParams()
  const { pathname } = useLocation()
  const locale = isLocale(lang) ? lang : "pt"
  const onHome = isHome(pathname, locale)
  const scrolled = useScrolled(8)

  const visibleAnchors = useMemo(() => HOME_ANCHORS.filter((a) => FEATURES[a.id]), [])

  const activeId = useScrollSpy(onHome ? HOME_SPY_IDS : EMPTY_IDS)

  return (
    <header
      data-scrolled={scrolled ? "true" : "false"}
      className={cn(
        "sticky top-0 z-50 transition-colors duration-200",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-end gap-4 px-4">
        <nav className="hidden md:block">
          {onHome ? (
            <ul className="flex items-center gap-1">
              {visibleAnchors.map((a) => {
                const isActive = activeId === a.id
                return (
                  <li key={a.id}>
                    <a
                      href={`#${a.id}`}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "rounded-md px-3 py-2 text-body-sm transition-colors",
                        isActive
                          ? "font-medium text-primary"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {t(a.labelKey)}
                    </a>
                  </li>
                )
              })}
            </ul>
          ) : (
            <Link
              to={`/${locale}/`}
              className="rounded-md px-3 py-2 text-body-sm text-muted-foreground hover:text-foreground"
            >
              {t("nav.backHome")}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-1">
          <div className="hidden items-center gap-1 md:flex">
            <LocaleToggle />
            <ThemeToggle />
          </div>
          <MobileMenu
            onHome={onHome}
            locale={locale}
            visibleAnchors={visibleAnchors}
            activeId={activeId}
            className="md:hidden"
          />
        </div>
      </div>
    </header>
  )
}

const EMPTY_IDS: readonly string[] = []
