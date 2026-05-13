export type ProjectStatus = "concluido" | "em-andamento"
export type ProjectCategory = "trabalho" | "freelance" | "open-source" | "ensino"

export type Project = {
  id: string
  title: string
  shortDescription: string
  fullDescription: string
  technologies: string[]
  category: ProjectCategory
  status: ProjectStatus
  featured: boolean
  confidential: boolean
  repositoryUrl?: string
  demoUrl?: string
  startDate: string
  endDate?: string
}

export type SkillCategory =
  | "frontend"
  | "tools"
  | "backend"
  | "practices"
  | "pedagogical"

export type Skill = {
  name: string
  category: SkillCategory
}

export type Experience = {
  company: string
  role: string
  startDate: string
  endDate?: string
  description: string
  stack: string[]
}

export type ContactForm = {
  name: string
  email: string
  subject: string
  message: string
}
