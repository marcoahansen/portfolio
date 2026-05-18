import type { Locale } from "@/types/i18n"

const intlLocale: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en-US",
}

const presentLabel: Record<Locale, string> = {
  pt: "Presente",
  en: "Present",
}

const cache = new Map<Locale, Intl.DateTimeFormat>()

function getFormatter(locale: Locale): Intl.DateTimeFormat {
  const cached = cache.get(locale)
  if (cached) return cached
  const fmt = new Intl.DateTimeFormat(intlLocale[locale], {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
  cache.set(locale, fmt)
  return fmt
}

export function formatPeriod(
  startDate: string,
  endDate: string | undefined,
  locale: Locale,
): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    throw new Error(`Invalid ISO date: ${startDate}`)
  }
  if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    throw new Error(`Invalid ISO date: ${endDate}`)
  }
  const fmt = getFormatter(locale)
  const start = fmt.format(new Date(startDate))
  const end = endDate ? fmt.format(new Date(endDate)) : presentLabel[locale]
  return `${start} — ${end}`
}

type Datable = { startDate: string; endDate?: string | undefined }

export function sortByRecency<T extends Datable>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const aOngoing = !a.endDate
    const bOngoing = !b.endDate
    if (aOngoing !== bOngoing) return aOngoing ? -1 : 1
    return b.startDate.localeCompare(a.startDate)
  })
}
