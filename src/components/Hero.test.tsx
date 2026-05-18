import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { axe } from "vitest-axe"
import { Hero } from "./Hero"
import type { Features } from "@/lib/features"
import type { Hero as HeroData } from "@/types/domain"

const hero: HeroData = {
  fullName: "Marco Aurelio Hansen",
  displayName: "Marco Hansen",
  role: "Frontend & Instrutor",
  tagline: "Tagline de teste com tamanho suficiente.",
  email: "marco@example.com",
  github: { url: "https://github.com/marcohansen", handle: "marcohansen" },
  linkedin: { url: "https://www.linkedin.com/in/marco-hansen/", handle: "marco-hansen" },
  cv: { fileName: "cv-2026-05.pdf", versionLabel: "mai/2026" },
  avatar: { src: "/avatar.webp", alt: "Foto de teste" },
}

const allOff: Features = {
  hero: true,
  skills: false,
  experience: false,
  projects: false,
  contact: false,
}

const allOn: Features = { ...allOff, contact: true, projects: true }

describe("Hero", () => {
  it("renders displayName as h1", () => {
    render(<Hero hero={hero} features={allOff} />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Marco Hansen")
  })

  it("renders role and tagline", () => {
    render(<Hero hero={hero} features={allOff} />)
    expect(screen.getByText(hero.role)).toBeInTheDocument()
    expect(screen.getByText(hero.tagline)).toBeInTheDocument()
  })

  it("renders CV button with download href and versionLabel", () => {
    render(<Hero hero={hero} features={allOff} />)
    const cv = screen.getByRole("link", { name: /Baixar CV/i })
    expect(cv).toHaveAttribute("href", "/cv/cv-2026-05.pdf")
    expect(cv).toHaveAttribute("download")
    expect(cv).toHaveTextContent("mai/2026")
  })

  it("renders GitHub link with target/rel and handle in aria-label", () => {
    render(<Hero hero={hero} features={allOff} />)
    const gh = screen.getByRole("link", { name: /GitHub: marcohansen/ })
    expect(gh).toHaveAttribute("target", "_blank")
    expect(gh).toHaveAttribute("rel", expect.stringContaining("noopener"))
    expect(gh).toHaveAttribute("rel", expect.stringContaining("noreferrer"))
  })

  it("renders LinkedIn link analogously", () => {
    render(<Hero hero={hero} features={allOff} />)
    const li = screen.getByRole("link", { name: /LinkedIn: marco-hansen/ })
    expect(li).toHaveAttribute("target", "_blank")
    expect(li).toHaveAttribute("rel", expect.stringContaining("noopener"))
  })

  it("renders 'Falar comigo' when contact flag is on", () => {
    render(<Hero hero={hero} features={{ ...allOff, contact: true }} />)
    expect(screen.getByRole("link", { name: /Falar comigo/ })).toHaveAttribute("href", "/#contact")
  })

  it("omits 'Falar comigo' when contact flag is off", () => {
    render(<Hero hero={hero} features={allOff} />)
    expect(screen.queryByRole("link", { name: /Falar comigo/ })).toBeNull()
  })

  it("renders 'Ver projetos' when projects flag is on", () => {
    render(<Hero hero={hero} features={{ ...allOff, projects: true }} />)
    expect(screen.getByRole("link", { name: /Ver projetos/ })).toHaveAttribute("href", "/projects")
  })

  it("omits 'Ver projetos' when projects flag is off", () => {
    render(<Hero hero={hero} features={allOff} />)
    expect(screen.queryByRole("link", { name: /Ver projetos/ })).toBeNull()
  })

  it("renders avatar img with alt and src from data", () => {
    render(<Hero hero={hero} features={allOff} />)
    const img = screen.getByAltText("Foto de teste")
    expect(img).toHaveAttribute("src", "/avatar.webp")
  })

  it("has no axe violations on both flag branches", async () => {
    const offRender = render(<Hero hero={hero} features={allOff} />)
    expect(await axe(offRender.container)).toHaveNoViolations()
    offRender.unmount()

    const onRender = render(<Hero hero={hero} features={allOn} />)
    expect(await axe(onRender.container)).toHaveNoViolations()
  })
})
