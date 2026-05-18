import { useTranslation } from "react-i18next"
import { cn } from "@/lib/cn"

export function SkipLink() {
  const { t } = useTranslation()
  return (
    <a
      href="#main"
      className={cn(
        "sr-only fixed left-2 top-2 z-[60] rounded-md bg-background px-3 py-2",
        "text-body-sm font-medium ring-2 ring-ring",
        "focus:not-sr-only focus:outline-none",
      )}
    >
      {t("a11y.skipToContent")}
    </a>
  )
}
