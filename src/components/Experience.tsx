import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { formatPeriod } from "@/lib/period"
import type { Experience as ExperienceData } from "@/types/domain"

type Props = { experiences: ExperienceData[] }

function ExperienceCard({ item }: { item: ExperienceData }) {
  return (
    <article className="h-full">
      <Card className="flex h-full flex-col bg-card/60 backdrop-blur">
        <CardHeader className="space-y-1 pb-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {formatPeriod(item.startDate, item.endDate)}
          </p>
          <h3 className="text-lg font-semibold tracking-tight">{item.role}</h3>
          <p className="text-sm font-medium text-primary/90">{item.company}</p>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4">
          <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          {item.stack.length > 0 && (
            <ul className="mt-auto flex flex-wrap gap-1.5">
              {item.stack.map((tech) => (
                <li key={tech}>
                  <Badge variant="secondary" className="text-xs font-medium">
                    {tech}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </article>
  )
}

export function Experience({ experiences }: Props) {
  if (experiences.length === 0) return null

  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className="container mx-auto px-4 py-20 md:py-28"
    >
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary/80">
          Trajetória
        </p>
        <h2 id="experience-title" className="text-3xl font-bold tracking-tight md:text-4xl">
          Experiência
        </h2>
      </div>

      <ol className="mt-12 grid auto-rows-fr gap-6 md:grid-cols-2">
        {experiences.map((item) => (
          <li key={`${item.company}-${item.startDate}`} className="h-full">
            <ExperienceCard item={item} />
          </li>
        ))}
      </ol>
    </section>
  )
}
