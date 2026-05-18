import { render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { axe } from "vitest-axe"
import { MemoryRouter, Route, Routes } from "react-router"
import i18n from "@/i18n"
import { Brand } from "@/components/Brand"

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]} basename="/portfolio">
      <Routes>
        <Route path="/:lang/*" element={<Brand />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  void i18n.changeLanguage("pt")
})
afterEach(() => {
  void i18n.changeLanguage("pt")
})

describe("Brand", () => {
  it("CT-M0-BR-01: targets /portfolio/pt/ when rendered under /pt/", () => {
    renderAt("/portfolio/pt/")
    const link = screen.getByRole("link", { name: "Marco Hansen" })
    expect(link).toHaveAttribute("href", "/portfolio/pt/")
  })

  it("CT-M0-BR-02: targets /portfolio/en/ when rendered under /en/projects", () => {
    renderAt("/portfolio/en/projects")
    const link = screen.getByRole("link", { name: "Marco Hansen" })
    expect(link).toHaveAttribute("href", "/portfolio/en/")
  })

  it("CT-M0-BR-03: exposes accessible name 'Marco Hansen'", () => {
    renderAt("/portfolio/pt/")
    expect(screen.getByLabelText("Marco Hansen")).toBeInTheDocument()
  })

  it("CT-M0-BR-04: has no axe violations", async () => {
    const { container } = renderAt("/portfolio/pt/")
    expect(await axe(container)).toHaveNoViolations()
  })
})
