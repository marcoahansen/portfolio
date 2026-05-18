import { act, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { axe } from "vitest-axe"
import { MemoryRouter, Route, Routes } from "react-router"
import i18n from "@/i18n"
import { mockObservers } from "@/setupTests"
import { ThemeProvider } from "@/lib/theme"

vi.mock("@/lib/features", () => ({
  FEATURES: { hero: true, skills: true, experience: true, projects: false, contact: true },
}))

import { Navbar } from "@/components/Navbar"

function renderAt(path: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]} basename="/portfolio">
        <Routes>
          <Route path="/:lang/*" element={<Navbar />} />
          <Route path="/:lang" element={<Navbar />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

function attachSections(...ids: string[]): HTMLElement[] {
  return ids.map((id) => {
    const el = document.createElement("section")
    el.id = id
    document.body.appendChild(el)
    return el
  })
}

function cleanupSections(...ids: string[]): void {
  ids.forEach((id) => document.getElementById(id)?.remove())
}

beforeEach(() => {
  void i18n.changeLanguage("pt")
  attachSections("skills", "experience", "contact")
})
afterEach(() => {
  void i18n.changeLanguage("pt")
  cleanupSections("skills", "experience", "contact")
  Object.defineProperty(window, "scrollY", { configurable: true, writable: true, value: 0 })
})

describe("Navbar", () => {
  it("CT-M0-NV-01: /pt/ renders 3 anchor items (PT labels)", () => {
    renderAt("/portfolio/pt/")
    expect(screen.queryByRole("link", { name: "Marco Hansen" })).toBeNull()
    const nav = screen.getByRole("navigation")
    expect(within(nav).getByRole("link", { name: /Habilidades/ })).toHaveAttribute(
      "href",
      "#skills",
    )
    expect(within(nav).getByRole("link", { name: /Experiência/ })).toHaveAttribute(
      "href",
      "#experience",
    )
    expect(within(nav).getByRole("link", { name: /Contato/ })).toHaveAttribute("href", "#contact")
  })

  it("CT-M0-NV-02: /en/ renders 3 anchor items (EN labels)", async () => {
    await i18n.changeLanguage("en")
    renderAt("/portfolio/en/")
    const nav = screen.getByRole("navigation")
    expect(within(nav).getByRole("link", { name: /Skills/ })).toBeInTheDocument()
    expect(within(nav).getByRole("link", { name: /Experience/ })).toBeInTheDocument()
    expect(within(nav).getByRole("link", { name: /Contact/ })).toBeInTheDocument()
  })

  it("CT-M0-NV-03: /pt/projects renders back-home link, no anchors", () => {
    renderAt("/portfolio/pt/projects")
    const nav = screen.getByRole("navigation")
    expect(within(nav).getByRole("link", { name: /Início/ })).toHaveAttribute(
      "href",
      "/portfolio/pt/",
    )
    expect(within(nav).queryByRole("link", { name: /Habilidades/ })).toBeNull()
  })

  it("CT-M0-NV-05: includes LocaleToggle and ThemeToggle buttons", () => {
    renderAt("/portfolio/pt/")
    expect(screen.getByRole("switch", { name: /Mudar idioma/i })).toBeInTheDocument()
    expect(screen.getByRole("switch", { name: /tema/i })).toBeInTheDocument()
  })

  it("CT-M0-NV-06: header reports data-scrolled='true' after scroll", () => {
    const { container } = renderAt("/portfolio/pt/")
    const header = container.querySelector("header[data-scrolled]")!
    expect(header).toHaveAttribute("data-scrolled", "false")
    Object.defineProperty(window, "scrollY", { configurable: true, writable: true, value: 100 })
    act(() => {
      window.dispatchEvent(new Event("scroll"))
    })
    expect(header).toHaveAttribute("data-scrolled", "true")
  })

  it("CT-M0-NV-07: scrollspy marks active anchor with aria-current", () => {
    renderAt("/portfolio/pt/")
    expect(mockObservers.length).toBeGreaterThanOrEqual(3)
    act(() => {
      mockObservers[0]!.trigger(true)
    })
    const nav = screen.getByRole("navigation")
    const active = within(nav).getByRole("link", { name: /Habilidades/ })
    expect(active).toHaveAttribute("aria-current", "true")
    expect(active.className).toContain("text-primary")
  })

  it("CT-M0-NV-08: mobile trigger present (hamburger button)", () => {
    renderAt("/portfolio/pt/")
    expect(screen.getByRole("button", { name: /Abrir menu/i })).toBeInTheDocument()
  })

  it("CT-M0-NV-09: has no axe violations on /pt/ and /pt/projects", async () => {
    const home = renderAt("/portfolio/pt/")
    expect(await axe(home.container)).toHaveNoViolations()
    home.unmount()
    const projects = renderAt("/portfolio/pt/projects")
    expect(await axe(projects.container)).toHaveNoViolations()
  })
})
