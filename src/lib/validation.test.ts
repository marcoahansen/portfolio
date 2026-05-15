import { describe, it, expect } from "vitest"
import {
  projectSchema,
  contactFormSchema,
  heroSchema,
  validateHero,
  skillSchema,
  skillListSchema,
  validateSkills,
  experienceSchema,
  educationSchema,
  validateExperiences,
  validateEducation,
} from "./validation"

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
  email: "marco@example.com",
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

  it("CT-M1-15: rejects malformed email", () => {
    expect(() => heroSchema.parse({ ...validHero, email: "marco@" })).toThrow()
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

const validSkills = [
  { name: "React", category: "frontend" as const },
  { name: "TypeScript", category: "frontend" as const },
  { name: "Vite", category: "tools" as const },
  { name: "Node.js", category: "backend" as const },
  { name: "TDD", category: "practices" as const },
  { name: "Mentoria 1:1", category: "pedagogical" as const },
]

describe("skillSchema", () => {
  it("CT-M3-01: accepts a valid skill", () => {
    expect(() => skillSchema.parse(validSkills[0])).not.toThrow()
  })

  it("CT-M3-02: rejects skill with empty name", () => {
    expect(() => skillSchema.parse({ name: "", category: "frontend" })).toThrow()
  })

  it("CT-M3-03: rejects skill with invalid category (RN-M3-01)", () => {
    expect(() => skillSchema.parse({ name: "React", category: "design" })).toThrow()
  })
})

describe("skillListSchema", () => {
  it("CT-M3-04: accepts a valid list", () => {
    expect(() => skillListSchema.parse(validSkills)).not.toThrow()
  })

  it("CT-M3-05: rejects non-array input", () => {
    expect(() => skillListSchema.parse({ items: validSkills })).toThrow()
  })
})

describe("validateSkills", () => {
  it("CT-M3-06: returns parsed list for valid input", () => {
    expect(validateSkills(validSkills)).toEqual(validSkills)
  })

  it("CT-M3-07: throws Error with humanized path and message on invalid input", () => {
    expect(() => validateSkills([{ name: "React", category: "design" }])).toThrow(
      /Invalid skills\.json at 0\.category/,
    )
  })
})

const validExperience = {
  company: "Venturus",
  role: "Frontend Developer",
  startDate: "2023-05-01",
  endDate: "2024-12-01",
  description: "Worked on React apps for telecom clients.",
  stack: ["React", "TypeScript"],
}

describe("experienceSchema", () => {
  it("CT-M4-01: accepts a valid experience", () => {
    expect(() => experienceSchema.parse(validExperience)).not.toThrow()
  })

  it("CT-M4-02: accepts ongoing experience without endDate (RN-M4-01)", () => {
    const { endDate: _e, ...ongoing } = validExperience
    expect(() => experienceSchema.parse(ongoing)).not.toThrow()
  })

  it("CT-M4-03: rejects missing company (RN-M4-03)", () => {
    const { company: _c, ...rest } = validExperience
    expect(() => experienceSchema.parse(rest)).toThrow()
  })

  it("CT-M4-04: rejects missing role (RN-M4-03)", () => {
    const { role: _r, ...rest } = validExperience
    expect(() => experienceSchema.parse(rest)).toThrow()
  })

  it("CT-M4-05: rejects missing startDate (RN-M4-03)", () => {
    const { startDate: _s, ...rest } = validExperience
    expect(() => experienceSchema.parse(rest)).toThrow()
  })

  it("CT-M4-06: rejects malformed startDate", () => {
    expect(() => experienceSchema.parse({ ...validExperience, startDate: "2023/05" })).toThrow()
  })
})

describe("validateExperiences", () => {
  it("CT-M4-07: returns parsed list", () => {
    expect(validateExperiences([validExperience])).toEqual([validExperience])
  })

  it("CT-M4-08: throws humanized error", () => {
    expect(() => validateExperiences([{ ...validExperience, startDate: "bad" }])).toThrow(
      /Invalid experiences\.json at 0\.startDate/,
    )
  })
})

const validEducation = {
  institution: "Universidade X",
  degree: "Análise e Desenvolvimento de Sistemas",
  startDate: "2018-02-01",
  endDate: "2020-12-01",
  description: "Tecnólogo.",
}

describe("educationSchema", () => {
  it("CT-M4-09: accepts a valid education entry", () => {
    expect(() => educationSchema.parse(validEducation)).not.toThrow()
  })

  it("CT-M4-10: accepts entry without description", () => {
    const { description: _d, ...rest } = validEducation
    expect(() => educationSchema.parse(rest)).not.toThrow()
  })

  it("CT-M4-11: rejects empty institution", () => {
    expect(() => educationSchema.parse({ ...validEducation, institution: "" })).toThrow()
  })

  it("CT-M4-12: rejects empty degree", () => {
    expect(() => educationSchema.parse({ ...validEducation, degree: "" })).toThrow()
  })
})

describe("validateEducation", () => {
  it("CT-M4-13: returns parsed list", () => {
    expect(validateEducation([validEducation])).toEqual([validEducation])
  })

  it("CT-M4-14: throws humanized error", () => {
    expect(() => validateEducation([{ ...validEducation, institution: "" }])).toThrow(
      /Invalid education\.json at 0\.institution/,
    )
  })
})
