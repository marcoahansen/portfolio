import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { axe } from "vitest-axe"
import { MemoryRouter } from "react-router"
import i18n from "@/i18n"
import { ThemeProvider } from "@/lib/theme"
import { MobileMenu } from "@/components/MobileMenu"

const ANCHORS = [
  { id: "skills", labelKey: "nav.skills" },
  { id: "experience", labelKey: "nav.experience" },
  { id: "contact", labelKey: "nav.contact" },
] as const

function renderMenu(
  props: Partial<{
    onHome: boolean
    locale: "pt" | "en"
    activeId: string | null
  }> = {},
) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={["/portfolio/pt/"]} basename="/portfolio">
        <MobileMenu
          onHome={props.onHome ?? true}
          locale={props.locale ?? "pt"}
          visibleAnchors={ANCHORS}
          activeId={props.activeId ?? null}
        />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

beforeEach(() => {
  void i18n.changeLanguage("pt")
})
afterEach(() => {
  void i18n.changeLanguage("pt")
})

describe("MobileMenu", () => {
  it("CT-M0-MM-01: closed by default — dialog not in DOM", () => {
    renderMenu()
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("CT-M0-MM-02: click on trigger opens the sheet with anchor links", async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(screen.getByRole("button", { name: /Abrir menu/i }))
    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByRole("link", { name: /Habilidades/ })).toHaveAttribute(
      "href",
      "#skills",
    )
    expect(within(dialog).getByRole("link", { name: /Contato/ })).toHaveAttribute(
      "href",
      "#contact",
    )
  })

  it("CT-M0-MM-03: Escape closes the sheet", async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(screen.getByRole("button", { name: /Abrir menu/i }))
    await screen.findByRole("dialog")
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("CT-M0-MM-04: clicking an anchor closes the sheet", async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(screen.getByRole("button", { name: /Abrir menu/i }))
    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("link", { name: /Habilidades/ }))
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("CT-M0-MM-05: onHome=false renders back-home link instead of anchors", async () => {
    const user = userEvent.setup()
    renderMenu({ onHome: false })
    await user.click(screen.getByRole("button", { name: /Abrir menu/i }))
    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByRole("link", { name: /Início/ })).toHaveAttribute(
      "href",
      "/portfolio/pt/",
    )
    expect(within(dialog).queryByRole("link", { name: /Habilidades/ })).toBeNull()
  })

  it("CT-M0-MM-06: includes LocaleToggle and ThemeToggle inside the sheet", async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(screen.getByRole("button", { name: /Abrir menu/i }))
    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByRole("switch", { name: /Mudar idioma/i })).toBeInTheDocument()
    expect(within(dialog).getByRole("switch", { name: /tema/i })).toBeInTheDocument()
  })

  it("CT-M0-MM-07: active anchor receives aria-current='true'", async () => {
    const user = userEvent.setup()
    renderMenu({ activeId: "contact" })
    await user.click(screen.getByRole("button", { name: /Abrir menu/i }))
    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByRole("link", { name: /Contato/ })).toHaveAttribute(
      "aria-current",
      "true",
    )
  })

  it("CT-M0-MM-08: has no axe violations on trigger render", async () => {
    const { container } = renderMenu()
    expect(await axe(container)).toHaveNoViolations()
  })
})
