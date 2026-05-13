import { describe, it, expect } from "vitest"
import { projectSchema, contactFormSchema, heroSchema, validateHero } from "./validation"

const validProject = {
  id: "p1",
  title: "Demo",
  shortDescription: "short",
  fullDescription: "full description text",
  technologies: ["React"],
  category: "trabalho",
  status: "concluido",
  featured: false,
  confidential: false,
  startDate: "2024-01-01",
  endDate: "2024-02-01",
}

const validContact = {
  name: "Marco",
  email: "marco@example.com",
  subject: "Hello",
  message: "This is a long enough message.",
}

describe("projectSchema", () => {
  it("accepts a valid project", () => {
    expect(() => projectSchema.parse(validProject)).not.toThrow()
  })

  it("rejects project without title (CT-M2-05)", () => {
    const { title: _title, ...rest } = validProject
    expect(() => projectSchema.parse(rest)).toThrow()
  })

  it("rejects confidential project with repositoryUrl (RN-M2-02)", () => {
    expect(() =>
      projectSchema.parse({
        ...validProject,
        confidential: true,
        repositoryUrl: "https://github.com/x/y",
      }),
    ).toThrow()
  })

  it("rejects invalid startDate format", () => {
    expect(() => projectSchema.parse({ ...validProject, startDate: "2024/01/01" })).toThrow()
  })

  it("rejects empty technologies array", () => {
    expect(() => projectSchema.parse({ ...validProject, technologies: [] })).toThrow()
  })

  it("rejects shortDescription longer than 160 chars", () => {
    expect(() =>
      projectSchema.parse({ ...validProject, shortDescription: "a".repeat(161) }),
    ).toThrow()
  })
})

describe("contactFormSchema", () => {
  it("accepts a valid form", () => {
    expect(() => contactFormSchema.parse(validContact)).not.toThrow()
  })

  it("rejects malformed email (CT-M5-01)", () => {
    expect(() => contactFormSchema.parse({ ...validContact, email: "marco@" })).toThrow()
  })

  it("rejects message with 9 chars (CT-M5-02)", () => {
    expect(() => contactFormSchema.parse({ ...validContact, message: "a".repeat(9) })).toThrow()
  })

  it("rejects message with 1001 chars (CT-M5-03)", () => {
    expect(() => contactFormSchema.parse({ ...validContact, message: "a".repeat(1001) })).toThrow()
  })

  it("rejects name with 1 char (RN-M5-03)", () => {
    expect(() => contactFormSchema.parse({ ...validContact, name: "a" })).toThrow()
  })

  it("rejects subject with 2 chars (RN-M5-04)", () => {
    expect(() => contactFormSchema.parse({ ...validContact, subject: "ab" })).toThrow()
  })
})

const validHero = {
  fullName: "Marco Aurelio Hansen de Oliveira",
  displayName: "Marco Hansen",
  role: "Desenvolvedor Frontend & Instrutor de Tecnologia",
  tagline: "Construo interfaces robustas com TDD e ajudo devs em formação a fazerem o mesmo.",
  github: { url: "https://github.com/marcohansen", handle: "marcohansen" },
  linkedin: { url: "https://www.linkedin.com/in/marco-hansen/", handle: "marco-hansen" },
  cv: { fileName: "marco-hansen-cv-2026-05.pdf", versionLabel: "mai/2026" },
  avatar: { src: "/avatar.webp", alt: "Foto de Marco Hansen" },
}

describe("heroSchema", () => {
  it("CT-M1-01: accepts a valid hero", () => {
    expect(() => heroSchema.parse(validHero)).not.toThrow()
  })

  it("CT-M1-02: rejects missing fullName", () => {
    const { fullName: _f, ...rest } = validHero
    expect(() => heroSchema.parse(rest)).toThrow()
  })

  it("CT-M1-03: rejects displayName with 1 char", () => {
    expect(() => heroSchema.parse({ ...validHero, displayName: "M" })).toThrow()
  })

  it("CT-M1-04: rejects role with 121 chars", () => {
    expect(() => heroSchema.parse({ ...validHero, role: "a".repeat(121) })).toThrow()
  })

  it("CT-M1-05: rejects tagline with 9 chars", () => {
    expect(() => heroSchema.parse({ ...validHero, tagline: "a".repeat(9) })).toThrow()
  })

  it("CT-M1-06: rejects malformed github.url", () => {
    expect(() =>
      heroSchema.parse({ ...validHero, github: { ...validHero.github, url: "not-a-url" } }),
    ).toThrow()
  })

  it("CT-M1-07: rejects github.url not under github.com", () => {
    expect(() =>
      heroSchema.parse({
        ...validHero,
        github: { ...validHero.github, url: "https://gitlab.com/marcohansen" },
      }),
    ).toThrow()
  })

  it("CT-M1-08: rejects linkedin.url not under www.linkedin.com", () => {
    expect(() =>
      heroSchema.parse({
        ...validHero,
        linkedin: { ...validHero.linkedin, url: "https://linkedin.com/in/marco-hansen" },
      }),
    ).toThrow()
  })

  it("CT-M1-09: rejects cv.fileName without .pdf extension", () => {
    expect(() =>
      heroSchema.parse({ ...validHero, cv: { ...validHero.cv, fileName: "cv-2026-05.txt" } }),
    ).toThrow()
  })

  it("CT-M1-10: rejects cv.versionLabel with invalid format", () => {
    expect(() =>
      heroSchema.parse({ ...validHero, cv: { ...validHero.cv, versionLabel: "2026-05" } }),
    ).toThrow()
  })

  it("CT-M1-11: rejects avatar.src not starting with /", () => {
    expect(() =>
      heroSchema.parse({ ...validHero, avatar: { ...validHero.avatar, src: "avatar.webp" } }),
    ).toThrow()
  })

  it("CT-M1-12: rejects avatar.alt with 2 chars", () => {
    expect(() =>
      heroSchema.parse({ ...validHero, avatar: { ...validHero.avatar, alt: "ab" } }),
    ).toThrow()
  })
})

describe("validateHero", () => {
  it("CT-M1-13: returns parsed Hero for valid input", () => {
    expect(validateHero(validHero)).toEqual(validHero)
  })

  it("CT-M1-14: throws Error with humanized path and message on invalid input", () => {
    expect(() => validateHero({ ...validHero, displayName: "M" })).toThrow(
      /Invalid hero\.json at displayName/,
    )
  })
})
