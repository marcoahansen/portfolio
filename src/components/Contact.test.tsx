import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { axe } from "vitest-axe"
import { Contact } from "./Contact"

describe("Contact", () => {
  it("CT-M5-10: renders #contact anchor and heading", () => {
    const { container } = render(
      <Contact
        email="marco@example.com"
        linkedinUrl="https://www.linkedin.com/in/marco-hansen/"
        onSubmit={vi.fn()}
      />,
    )
    expect(container.querySelector("#contact")).not.toBeNull()
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(/contato|fale comigo/i)
  })

  it("CT-M5-11: renders alternative contact links (RF-M5-04)", () => {
    render(
      <Contact
        email="marco@example.com"
        linkedinUrl="https://www.linkedin.com/in/marco-hansen/"
        onSubmit={vi.fn()}
      />,
    )
    const email = screen.getByRole("link", { name: /marco@example\.com/ })
    expect(email).toHaveAttribute("href", "mailto:marco@example.com")
    const linkedin = screen.getByRole("link", { name: /linkedin/i })
    expect(linkedin).toHaveAttribute("href", "https://www.linkedin.com/in/marco-hansen/")
    expect(linkedin).toHaveAttribute("target", "_blank")
  })

  it("CT-M5-12: embeds the ContactForm", () => {
    render(
      <Contact
        email="marco@example.com"
        linkedinUrl="https://www.linkedin.com/in/marco-hansen/"
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByLabelText(/mensagem/i)).toBeInTheDocument()
  })

  it("CT-M5-13: has no axe violations", async () => {
    const { container } = render(
      <Contact
        email="marco@example.com"
        linkedinUrl="https://www.linkedin.com/in/marco-hansen/"
        onSubmit={vi.fn()}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
