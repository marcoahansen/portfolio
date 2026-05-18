import { describe, it, expect } from "vitest"
import { getHero, getSkills, getExperiences, getEducation, getProjects } from "./data"

describe("getHero", () => {
  it("returns Portuguese hero for pt", () => {
    const hero = getHero("pt")
    expect(hero.displayName).toBe("Marco Hansen")
    expect(hero.role).toContain("Desenvolvedor")
  })

  it("returns English hero for en", () => {
    const hero = getHero("en")
    expect(hero.displayName).toBe("Marco Hansen")
    expect(hero.role).toContain("Frontend Developer")
  })

  it("differs between locales", () => {
    expect(getHero("pt").role).not.toBe(getHero("en").role)
  })
})

describe("getSkills", () => {
  it("returns validated list for pt", () => {
    const list = getSkills("pt")
    expect(list.length).toBeGreaterThan(0)
    expect(list[0]).toHaveProperty("category")
  })

  it("returns validated list for en", () => {
    const list = getSkills("en")
    expect(list.length).toBeGreaterThan(0)
    expect(list[0]).toHaveProperty("category")
  })

  it("differs between locales (at least one entry text)", () => {
    const pt = getSkills("pt").map((s) => s.name)
    const en = getSkills("en").map((s) => s.name)
    expect(pt).not.toEqual(en)
  })
})

describe("getExperiences", () => {
  it("returns recency-sorted list with ongoing first", () => {
    const list = getExperiences("pt")
    expect(list.length).toBeGreaterThan(0)
    const ongoingFirst = list.findIndex((e) => !e.endDate)
    if (ongoingFirst !== -1) {
      expect(ongoingFirst).toBe(0)
    }
  })

  it("differs between pt and en (description)", () => {
    const pt = getExperiences("pt")
    const en = getExperiences("en")
    expect(pt[0]?.description).not.toBe(en[0]?.description)
  })
})

describe("getEducation", () => {
  it("returns validated list for pt", () => {
    expect(getEducation("pt").length).toBeGreaterThan(0)
  })

  it("returns validated list for en", () => {
    expect(getEducation("en").length).toBeGreaterThan(0)
  })
})

describe("getProjects", () => {
  it("returns empty array for pt (M0)", () => {
    expect(getProjects("pt")).toEqual([])
  })

  it("returns empty array for en (M0)", () => {
    expect(getProjects("en")).toEqual([])
  })
})
