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

export type SkillCategory = "frontend" | "tools" | "backend" | "practices" | "pedagogical"

export type Skill = {
  name: string
  category: SkillCategory
}

export type Experience = {
  company: string
  role: string
  startDate: string
  endDate?: string | undefined
  description: string
  stack: string[]
}

export type Education = {
  institution: string
  degree: string
  startDate: string
  endDate?: string | undefined
  description?: string | undefined
}

export type ContactForm = {
  name: string
  email: string
  subject: string
  message: string
}

export type Hero = {
  fullName: string
  displayName: string
  role: string
  tagline: string
  email: string
  github: { url: string; handle: string }
  linkedin: { url: string; handle: string }
  cv: { fileName: string; versionLabel: string }
  avatar: { src: string; alt: string }
}
