import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { axe } from "vitest-axe"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { STORAGE_KEY, ThemeProvider } from "@/lib/theme"
import { ThemeToggle } from "@/components/ThemeToggle"

const renderToggle = () =>
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  )

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.classList.remove("dark")
})

afterEach(() => {
  window.localStorage.clear()
  document.documentElement.classList.remove("dark")
})

describe("ThemeToggle", () => {
  it("CT-M0-TT-01: renders Moon icon and PT label when current theme is light", () => {
    renderToggle()
    expect(screen.getByRole("button", { name: "Mudar para tema escuro" })).toBeInTheDocument()
  })

  it("CT-M0-TT-02: renders Sun icon and PT label when stored theme is dark", () => {
    window.localStorage.setItem(STORAGE_KEY, "dark")
    renderToggle()
    expect(screen.getByRole("button", { name: "Mudar para tema claro" })).toBeInTheDocument()
  })

  it("CT-M0-TT-03: click toggles light to dark, applies .dark and swaps label", async () => {
    const user = userEvent.setup()
    renderToggle()
    const button = screen.getByRole("button", {
      name: "Mudar para tema escuro",
    })
    await user.click(button)
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(screen.getByRole("button", { name: "Mudar para tema claro" })).toBeInTheDocument()
  })

  it("CT-M0-TT-04: double click returns to light and removes .dark", async () => {
    const user = userEvent.setup()
    renderToggle()
    const button = screen.getByRole("button", {
      name: "Mudar para tema escuro",
    })
    await user.click(button)
    await user.click(screen.getByRole("button", { name: "Mudar para tema claro" }))
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })

  it("CT-M0-TT-05: has no axe violations", async () => {
    const { container } = renderToggle()
    expect(await axe(container)).toHaveNoViolations()
  })
})
