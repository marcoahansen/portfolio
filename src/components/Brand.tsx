import { Link, useParams } from "react-router"
import { cn } from "@/lib/cn"
import { isLocale } from "@/i18n"

type Props = { className?: string }

export function Brand({ className }: Props) {
  const { lang } = useParams()
  const locale = isLocale(lang) ? lang : "pt"
  return (
    <Link
      to={`/${locale}/`}
      aria-label="Marco Hansen"
      className={cn(
        "inline-flex items-center gap-2 font-display text-headline-md font-bold tracking-wider text-foreground transition-opacity hover:opacity-80",
        className,
      )}
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="size-7 text-primary"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 26 L4 6 L10 18 L16 6 L16 26" />
        <path d="M20 6 L20 26 M28 6 L28 26 M20 16 L28 16" />
      </svg>
      <span aria-hidden="true" className="hidden md:inline">
        MH
      </span>
    </Link>
  )
}
