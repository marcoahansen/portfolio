import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { Skill, SkillCategory } from "@/types/domain"

const TECHNICAL_CATEGORIES: { id: SkillCategory; label: string }[] = [
  { id: "frontend", label: "Frontend" },
  { id: "tools", label: "Ferramentas" },
  { id: "backend", label: "Backend" },
  { id: "practices", label: "Práticas" },
]

const PEDAGOGICAL_CATEGORY = { id: "pedagogical" as const, label: "Pedagógico" }

type Props = { skills: Skill[] }

function CategoryGroup({ id, label, items }: { id: string; label: string; items: Skill[] }) {
  const headingId = `skills-cat-${id}`
  return (
    <Card role="group" aria-labelledby={headingId} className="bg-card/60 backdrop-blur">
      <CardHeader className="pb-3">
        <h3 id={headingId} className="text-base font-semibold leading-none tracking-tight">
          {label}
        </h3>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-wrap gap-2">
          {items.map((s) => (
            <li key={s.name}>
              <Badge variant="secondary" className="text-sm font-medium">
                {s.name}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export function Skills({ skills }: Props) {
  const technicalGroups = TECHNICAL_CATEGORIES.map((c) => ({
    ...c,
    items: skills.filter((s) => s.category === c.id),
  })).filter((g) => g.items.length > 0)

  const pedagogicalItems = skills.filter((s) => s.category === PEDAGOGICAL_CATEGORY.id)

  return (
    <section
      id="skills"
      aria-labelledby="skills-title"
      className="container mx-auto px-4 py-20 md:py-28"
    >
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary/80">
          Stack & mentoria
        </p>
        <h2 id="skills-title" className="text-3xl font-bold tracking-tight md:text-4xl">
          Habilidades
        </h2>
        <p className="text-muted-foreground">
          Stack técnico do dia-a-dia e o que ensino para quem está começando.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {technicalGroups.map((g) => (
          <CategoryGroup key={g.id} id={g.id} label={g.label} items={g.items} />
        ))}
      </div>

      {pedagogicalItems.length > 0 && (
        <div className="mt-6">
          <CategoryGroup
            id={PEDAGOGICAL_CATEGORY.id}
            label={PEDAGOGICAL_CATEGORY.label}
            items={pedagogicalItems}
          />
        </div>
      )}
    </section>
  )
}
