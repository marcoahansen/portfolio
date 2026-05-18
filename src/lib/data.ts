import heroPt from "@/data/hero.pt.json"
import heroEn from "@/data/hero.en.json"
import skillsPt from "@/data/skills.pt.json"
import skillsEn from "@/data/skills.en.json"
import experiencesPt from "@/data/experiences.pt.json"
import experiencesEn from "@/data/experiences.en.json"
import educationPt from "@/data/education.pt.json"
import educationEn from "@/data/education.en.json"
import projectsPt from "@/data/projects.pt.json"
import projectsEn from "@/data/projects.en.json"
import {
  validateHero,
  validateSkills,
  validateExperiences,
  validateEducation,
  validateProjects,
} from "@/lib/validation"
import { sortByRecency } from "@/lib/period"
import type { Locale } from "@/types/i18n"
import type { Education, Experience, Hero, Project, Skill } from "@/types/domain"

const hero: Record<Locale, Hero> = {
  pt: validateHero(heroPt),
  en: validateHero(heroEn),
}
const skills: Record<Locale, Skill[]> = {
  pt: validateSkills(skillsPt),
  en: validateSkills(skillsEn),
}
const experiences: Record<Locale, Experience[]> = {
  pt: sortByRecency(validateExperiences(experiencesPt)),
  en: sortByRecency(validateExperiences(experiencesEn)),
}
const education: Record<Locale, Education[]> = {
  pt: sortByRecency(validateEducation(educationPt)),
  en: sortByRecency(validateEducation(educationEn)),
}
const projects: Record<Locale, Project[]> = {
  pt: validateProjects(projectsPt),
  en: validateProjects(projectsEn),
}

export const getHero = (locale: Locale): Hero => hero[locale]
export const getSkills = (locale: Locale): Skill[] => skills[locale]
export const getExperiences = (locale: Locale): Experience[] => experiences[locale]
export const getEducation = (locale: Locale): Education[] => education[locale]
export const getProjects = (locale: Locale): Project[] => projects[locale]
