import type { Route } from "./+types/_index"
import heroData from "@/data/hero.json"
import skillsData from "@/data/skills.json"
import { Hero } from "@/components/Hero"
import { Skills } from "@/components/Skills"
import { validateHero, validateSkills } from "@/lib/validation"
import { FEATURES } from "@/lib/features"

const hero = validateHero(heroData)
const skills = validateSkills(skillsData)

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
    </main>
  )
}
