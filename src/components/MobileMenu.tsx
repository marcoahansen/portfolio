import { Link } from "react-router"
import { useState } from "react"
import { Menu } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/cn"
import { LocaleToggle } from "@/components/LocaleToggle"
import { ThemeToggle } from "@/components/ThemeToggle"

type Anchor = { id: string; labelKey: string }

type Props = {
  onHome: boolean
  locale: "pt" | "en"
  visibleAnchors: readonly Anchor[]
  activeId: string | null
  className?: string
}

export function MobileMenu({ onHome, locale, visibleAnchors, activeId, className }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("a11y.openMenu")}
          className={className}
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle className="font-display tracking-wider">MH</SheetTitle>
        </SheetHeader>

        {onHome ? (
          <ul className="mt-6 flex flex-col gap-1">
            {visibleAnchors.map((a) => {
              const isActive = activeId === a.id
              return (
                <li key={a.id}>
                  <a
                    href={`#${a.id}`}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "block rounded-md px-3 py-2 text-body-md transition-colors",
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
            onClick={() => setOpen(false)}
            className="mt-6 block rounded-md px-3 py-2 text-body-md text-muted-foreground hover:text-foreground"
          >
            {t("nav.backHome")}
          </Link>
        )}

        <div className="mt-6 flex items-center gap-2 border-t border-border pt-6">
          <LocaleToggle />
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  )
}
