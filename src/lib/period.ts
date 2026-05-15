const PT_BR_MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
]

function formatMonthYear(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(isoDate)
  if (!match) throw new Error(`Invalid ISO date: ${isoDate}`)
  const year = match[1]!
  const monthIndex = Number(match[2]) - 1
  const label = PT_BR_MONTHS[monthIndex]
  if (!label) throw new Error(`Invalid month in date: ${isoDate}`)
  return `${label} ${year}`
}

export function formatPeriod(startDate: string, endDate?: string): string {
  const start = formatMonthYear(startDate)
  const end = endDate ? formatMonthYear(endDate) : "Presente"
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
