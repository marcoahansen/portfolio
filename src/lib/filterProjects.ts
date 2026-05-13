import type { Project, ProjectCategory } from "@/types/domain"

export type ProjectFilter = {
  technologies?: readonly string[]
  categories?: readonly ProjectCategory[]
}

export function filterProjects(
  projects: readonly Project[],
  filter: ProjectFilter = {},
): Project[] {
  const techs = filter.technologies ?? []
  const cats = filter.categories ?? []

  const filtered = projects.filter((p) => {
    const techOk = techs.length === 0 || techs.some((t) => p.technologies.includes(t))
    const catOk = cats.length === 0 || cats.includes(p.category)
    return techOk && catOk
  })

  return [...filtered].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    const aKey = a.endDate ?? a.startDate
    const bKey = b.endDate ?? b.startDate
    return bKey.localeCompare(aKey)
  })
}
