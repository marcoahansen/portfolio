import type { Route } from "./+types/_index"
import heroData from "@/data/hero.json"
import { Hero } from "@/components/Hero"
import { validateHero } from "@/lib/validation"

const hero = validateHero(heroData)

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
    </main>
  )
}
