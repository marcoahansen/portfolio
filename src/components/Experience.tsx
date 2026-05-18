import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Section } from "@/components/Section"
import { formatPeriod } from "@/lib/period"
import { isLocale } from "@/i18n"
import type { Locale } from "@/types/i18n"
import type { Experience as ExperienceData } from "@/types/domain"

type Props = { experiences: ExperienceData[] }

function ExperienceCard({ item, locale }: { item: ExperienceData; locale: Locale }) {
  return (
    <article className="h-full">
      <Card className="flex h-full flex-col bg-card/60 backdrop-blur">
        <CardHeader className="space-y-1 pb-3">
          <p className="font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {formatPeriod(item.startDate, item.endDate, locale)}
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
                  <Badge variant="secondary" className="font-mono text-xs font-medium">
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
  const { t, i18n } = useTranslation()
  if (experiences.length === 0) return null
  const locale: Locale = isLocale(i18n.language) ? i18n.language : "pt"

  return (
    <Section id="experience" title={t("experience.title")}>
      <ol className="grid auto-rows-fr gap-6 md:grid-cols-2">
        {experiences.map((item) => (
          <li key={`${item.company}-${item.startDate}`} className="h-full">
            <ExperienceCard item={item} locale={locale} />
          </li>
        ))}
      </ol>
    </Section>
  )
}
