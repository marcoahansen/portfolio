import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { formatPeriod } from "@/lib/period"
import type { Education as EducationData } from "@/types/domain"

type Props = { items: EducationData[] }

function EducationCard({ item }: { item: EducationData }) {
  return (
    <article className="h-full">
      <Card className="flex h-full flex-col bg-card/60 backdrop-blur">
        <CardHeader className="space-y-1 pb-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {formatPeriod(item.startDate, item.endDate)}
          </p>
          <h3 className="text-lg font-semibold tracking-tight">{item.degree}</h3>
          <p className="text-sm font-medium text-primary/90">{item.institution}</p>
        </CardHeader>
        {item.description && (
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          </CardContent>
        )}
      </Card>
    </article>
  )
}

export function Education({ items }: Props) {
  if (items.length === 0) return null

  return (
    <section
      id="education"
      aria-labelledby="education-title"
      className="container mx-auto px-4 pb-20 md:pb-28"
    >
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary/80">Formação</p>
        <h2 id="education-title" className="text-3xl font-bold tracking-tight md:text-4xl">
          Educação
        </h2>
      </div>

      <ol className="mt-12 grid auto-rows-fr gap-6 md:grid-cols-2">
        {items.map((item) => (
          <li key={`${item.institution}-${item.startDate}`} className="h-full">
            <EducationCard item={item} />
          </li>
        ))}
      </ol>
    </section>
  )
}
