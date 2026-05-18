import type { Route } from "./+types/$lang._index"
import { useTranslation } from "react-i18next"
import { isLocale } from "@/i18n"
import { getEducation, getExperiences, getHero, getSkills } from "@/lib/data"
import { Hero } from "@/components/Hero"
import { Skills } from "@/components/Skills"
import { Experience } from "@/components/Experience"
import { Education } from "@/components/Education"
import { Contact } from "@/components/Contact"
import { FEATURES } from "@/lib/features"
import { sendContactEmail } from "@/lib/contactSubmit"

export function meta(args: Route.MetaArgs): Route.MetaDescriptors {
  const lang = args.params.lang
  const locale = isLocale(lang) ? lang : "pt"
  const hero = getHero(locale)
  return [
    { title: `${hero.displayName} — ${hero.role}` },
    { name: "description", content: hero.tagline },
  ]
}

export default function HomeRoute() {
  const { i18n } = useTranslation()
  const locale = isLocale(i18n.language) ? i18n.language : "pt"
  const hero = getHero(locale)
  const skills = getSkills(locale)
  const experiences = getExperiences(locale)
  const education = getEducation(locale)

  return (
    <main id="main">
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
