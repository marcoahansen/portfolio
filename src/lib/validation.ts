import { z } from "zod"
import type { Hero } from "@/types/domain"

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

export const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(3).max(150),
  message: z.string().min(10).max(1000),
})

export const heroSchema = z.object({
  fullName: z.string().min(2).max(100),
  displayName: z.string().min(2).max(60),
  role: z.string().min(3).max(120),
  tagline: z.string().min(10).max(200),
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
