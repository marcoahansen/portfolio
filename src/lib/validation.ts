import { z } from "zod"
import type { Education, Experience, Hero, Project, Skill } from "@/types/domain"

export const projectCategorySchema = z.enum(["trabalho", "freelance", "open-source", "ensino"])

export const projectStatusSchema = z.enum(["concluido", "em-andamento"])

export const projectSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    shortDescription: z.string().min(1).max(160),
    fullDescription: z.string().min(1),
    technologies: z.array(z.string().min(1)).min(1),
    category: projectCategorySchema,
    status: projectStatusSchema,
    featured: z.boolean(),
    confidential: z.boolean(),
    repositoryUrl: z.string().url().optional(),
    demoUrl: z.string().url().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  })
  .refine((p) => !(p.confidential && p.repositoryUrl), {
    message: "RN-M2-02: confidential project cannot have repositoryUrl",
    path: ["repositoryUrl"],
  })

export const projectListSchema = z.array(projectSchema)

export const skillCategorySchema = z.enum([
  "frontend",
  "tools",
  "backend",
  "practices",
  "pedagogical",
])

export const skillSchema = z.object({
  name: z.string().min(1),
  category: skillCategorySchema,
})

export const skillListSchema = z.array(skillSchema)

export const experienceSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  description: z.string().min(1),
  stack: z.array(z.string()).default([]),
})

export const experienceListSchema = z.array(experienceSchema)

export const educationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  description: z.string().min(1).optional(),
})

export const educationListSchema = z.array(educationSchema)

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter ao menos 2 caracteres.")
    .max(100, "Nome deve ter no máximo 100 caracteres."),
  email: z.string().email("Informe um e-mail válido."),
  subject: z
    .string()
    .min(3, "Assunto deve ter ao menos 3 caracteres.")
    .max(150, "Assunto deve ter no máximo 150 caracteres."),
  message: z
    .string()
    .min(10, "Mensagem deve ter ao menos 10 caracteres.")
    .max(1000, "Mensagem deve ter no máximo 1000 caracteres."),
})

export const heroSchema = z.object({
  fullName: z.string().min(2).max(100),
  displayName: z.string().min(2).max(60),
  role: z.string().min(3).max(120),
  tagline: z.string().min(10).max(200),
  email: z.string().email(),
  github: z.object({
    url: z.string().url().startsWith("https://github.com/"),
    handle: z.string().min(1),
  }),
  linkedin: z.object({
    url: z.string().url().startsWith("https://www.linkedin.com/"),
    handle: z.string().min(1),
  }),
  cv: z.object({
    fileName: z.string().regex(/^[a-z0-9-]+\.pdf$/),
    versionLabel: z.string().regex(/^[a-z]{3}\/\d{4}$/),
  }),
  avatar: z.object({
    src: z.string().startsWith("/"),
    alt: z.string().min(3),
  }),
})

export function validateHero(input: unknown): Hero {
  const result = heroSchema.safeParse(input)
  if (!result.success) {
    const issue = result.error.issues[0]!
    const path = issue.path.join(".")
    throw new Error(`Invalid hero.json at ${path}: ${issue.message}`)
  }
  return result.data
}

export function validateSkills(input: unknown): Skill[] {
  const result = skillListSchema.safeParse(input)
  if (!result.success) {
    const issue = result.error.issues[0]!
    const path = issue.path.join(".")
    throw new Error(`Invalid skills.json at ${path}: ${issue.message}`)
  }
  return result.data
}

export function validateExperiences(input: unknown): Experience[] {
  const result = experienceListSchema.safeParse(input)
  if (!result.success) {
    const issue = result.error.issues[0]!
    const path = issue.path.join(".")
    throw new Error(`Invalid experiences.json at ${path}: ${issue.message}`)
  }
  return result.data
}

export function validateEducation(input: unknown): Education[] {
  const result = educationListSchema.safeParse(input)
  if (!result.success) {
    const issue = result.error.issues[0]!
    const path = issue.path.join(".")
    throw new Error(`Invalid education.json at ${path}: ${issue.message}`)
  }
  return result.data
}

export function validateProjects(input: unknown): Project[] {
  const result = projectListSchema.safeParse(input)
  if (!result.success) {
    const issue = result.error.issues[0]!
    const path = issue.path.join(".")
    throw new Error(`Invalid projects.json at ${path}: ${issue.message}`)
  }
  return result.data
}
