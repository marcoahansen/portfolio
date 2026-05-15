import type { Route } from "./+types/_index"
import heroData from "@/data/hero.json"
import skillsData from "@/data/skills.json"
import experiencesData from "@/data/experiences.json"
import educationData from "@/data/education.json"
import { Hero } from "@/components/Hero"
import { Skills } from "@/components/Skills"
import { Experience } from "@/components/Experience"
import { Education } from "@/components/Education"
import { Contact } from "@/components/Contact"
import {
  validateHero,
  validateSkills,
  validateExperiences,
  validateEducation,
} from "@/lib/validation"
import { sortByRecency } from "@/lib/period"
import { FEATURES } from "@/lib/features"
import { sendContactEmail } from "@/lib/contactSubmit"

const hero = validateHero(heroData)
const skills = validateSkills(skillsData)
const experiences = sortByRecency(validateExperiences(experiencesData))
const education = sortByRecency(validateEducation(educationData))

export function meta(_args: Route.MetaArgs): Route.MetaDescriptors {
  return [
    { title: `${hero.displayName} — ${hero.role}` },
    { name: "description", content: hero.tagline },
  ]
}

export default function HomeRoute() {
  return (
    <main>
      <Hero hero={hero} />
      {FEATURES.skills && <Skills skills={skills} />}
      {FEATURES.experience && (
        <>
          <Experience experiences={experiences} />
          <Education items={education} />
        </>
      )}
      {FEATURES.contact && (
        <Contact email={hero.email} linkedinUrl={hero.linkedin.url} onSubmit={sendContactEmail} />
      )}
    </main>
  )
}
