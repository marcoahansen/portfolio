import { describe, it, expect } from "vitest"
import { projectSchema, contactFormSchema } from "./validation"

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
    expect(() =>
      projectSchema.parse({ ...validProject, startDate: "2024/01/01" }),
    ).toThrow()
  })

  it("rejects empty technologies array", () => {
    expect(() =>
      projectSchema.parse({ ...validProject, technologies: [] }),
    ).toThrow()
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
    expect(() =>
      contactFormSchema.parse({ ...validContact, email: "marco@" }),
    ).toThrow()
  })

  it("rejects message with 9 chars (CT-M5-02)", () => {
    expect(() =>
      contactFormSchema.parse({ ...validContact, message: "a".repeat(9) }),
    ).toThrow()
  })

  it("rejects message with 1001 chars (CT-M5-03)", () => {
    expect(() =>
      contactFormSchema.parse({ ...validContact, message: "a".repeat(1001) }),
    ).toThrow()
  })

  it("rejects name with 1 char (RN-M5-03)", () => {
    expect(() =>
      contactFormSchema.parse({ ...validContact, name: "a" }),
    ).toThrow()
  })

  it("rejects subject with 2 chars (RN-M5-04)", () => {
    expect(() =>
      contactFormSchema.parse({ ...validContact, subject: "ab" }),
    ).toThrow()
  })
})
