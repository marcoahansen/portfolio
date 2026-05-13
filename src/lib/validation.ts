import { z } from "zod"

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
