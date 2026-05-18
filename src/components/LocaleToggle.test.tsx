import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { axe } from "vitest-axe"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { MemoryRouter, Routes, Route, useLocation } from "react-router"
import i18n from "@/i18n"
import { LocaleToggle } from "@/components/LocaleToggle"

function LocationDisplay() {
  const { pathname } = useLocation()
  return <div data-testid="loc">{pathname}</div>
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LocaleToggle />
      <LocationDisplay />
      <Routes>
        <Route path="*" element={null} />
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

describe("LocaleToggle", () => {
  it("CT-M0-LT-01: PT context renders EN target with localized aria-label", () => {
    renderAt("/pt/")
    expect(screen.getByRole("switch", { name: /Mudar idioma para EN/i })).toBeInTheDocument()
  })

  it("CT-M0-LT-02: clicking from /pt/projects navigates to /en/projects preserving path", async () => {
    const user = userEvent.setup()
    renderAt("/pt/projects")
    await user.click(screen.getByRole("switch", { name: /Mudar idioma para EN/i }))
    expect(screen.getByTestId("loc")).toHaveTextContent("/en/projects")
  })

  it("CT-M0-LT-03: clicking from /en/ navigates to /pt/", async () => {
    await i18n.changeLanguage("en")
    const user = userEvent.setup()
    renderAt("/en/")
    await user.click(screen.getByRole("switch", { name: /Switch language to PT/i }))
    expect(screen.getByTestId("loc")).toHaveTextContent("/pt/")
  })

  it("CT-M0-LT-04: has no axe violations", async () => {
    const { container } = renderAt("/pt/")
    expect(await axe(container)).toHaveNoViolations()
  })
})
