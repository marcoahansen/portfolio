import { describe, it, expect } from "vitest"
import type { Project } from "@/types/domain"
import { filterProjects } from "./filterProjects"

function make(id: string, overrides: Partial<Project> = {}): Project {
  return {
    id,
    title: `Project ${id}`,
    shortDescription: "short",
    fullDescription: "full",
    technologies: ["React"],
    category: "trabalho",
    status: "concluido",
    featured: false,
    confidential: false,
    startDate: "2024-01-01",
    endDate: "2024-06-01",
    ...overrides,
  }
}

describe("filterProjects", () => {
  it("T01: no filter, empty list returns []", () => {
    expect(filterProjects([])).toEqual([])
  })

  it("T02: no filter, sorts featured-first and date desc", () => {
    const a = make("a", { featured: false, endDate: "2024-12-01" })
    const b = make("b", { featured: true, endDate: "2023-01-01" })
    const c = make("c", { featured: false, endDate: "2024-06-01" })
    const result = filterProjects([a, b, c])
    expect(result.map((p) => p.id)).toEqual(["b", "a", "c"])
  })

  it("T03: empty technologies filter is a no-op", () => {
    const a = make("a")
    expect(filterProjects([a], { technologies: [] })).toHaveLength(1)
  })

  it("T04: tech OR within — matches when project has one of them", () => {
    const a = make("a", { technologies: ["React", "TS"] })
    expect(filterProjects([a], { technologies: ["React"] })).toHaveLength(1)
  })

  it("T05: no project matches tech — returns [] (CT-M2-03)", () => {
    const a = make("a", { technologies: ["React"] })
    expect(filterProjects([a], { technologies: ["Vue"] })).toEqual([])
  })

  it("T06: tech OR — matches if any filter tech is in project", () => {
    const a = make("a", { technologies: ["TS"] })
    expect(filterProjects([a], { technologies: ["React", "TS"] })).toHaveLength(1)
  })

  it("T07: category mismatch excludes project", () => {
    const a = make("a", { category: "trabalho" })
    expect(filterProjects([a], { categories: ["freelance"] })).toEqual([])
  })

  it("T08: tech + category AND between (CT-M2-01)", () => {
    const a = make("a", { technologies: ["React"], category: "freelance" })
    const b = make("b", { technologies: ["React"], category: "trabalho" })
    const c = make("c", { technologies: ["Vue"], category: "freelance" })
    const result = filterProjects([a, b, c], {
      technologies: ["React"],
      categories: ["freelance"],
    })
    expect(result.map((p) => p.id)).toEqual(["a"])
  })

  it("T09: featured appears before non-featured (CT-M2-04)", () => {
    const a = make("a", { featured: false, endDate: "2024-12-01" })
    const b = make("b", { featured: true, endDate: "2024-01-01" })
    const result = filterProjects([a, b])
    expect(result[0]?.id).toBe("b")
  })

  it("T10: two featured sorted by date desc", () => {
    const a = make("a", { featured: true, endDate: "2024-01-01" })
    const b = make("b", { featured: true, endDate: "2024-12-01" })
    expect(filterProjects([a, b]).map((p) => p.id)).toEqual(["b", "a"])
  })

  it("T11: project without endDate sorts by startDate", () => {
    const a: Project = {
      id: "a",
      title: "A",
      shortDescription: "s",
      fullDescription: "f",
      technologies: ["React"],
      category: "trabalho",
      status: "em-andamento",
      featured: false,
      confidential: false,
      startDate: "2024-06-01",
    }
    const b = make("b", { startDate: "2024-01-01", endDate: "2024-05-01" })
    expect(filterProjects([a, b]).map((p) => p.id)).toEqual(["a", "b"])
  })

  it("T12: pure — does not mutate input array", () => {
    const a = make("a", { featured: false })
    const b = make("b", { featured: true })
    const input: Project[] = [a, b]
    const snapshot = JSON.stringify(input)
    filterProjects(input)
    expect(JSON.stringify(input)).toBe(snapshot)
  })

  it("T13: technology match is case-sensitive", () => {
    const a = make("a", { technologies: ["React"] })
    expect(filterProjects([a], { technologies: ["react"] })).toEqual([])
  })
})
