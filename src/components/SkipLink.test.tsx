import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { axe } from "vitest-axe"
import { SkipLink } from "@/components/SkipLink"

describe("SkipLink", () => {
  it("CT-M0-SK-01: renders anchor pointing to #main with translated label", () => {
    render(<SkipLink />)
    const link = screen.getByRole("link", { name: /pular/i })
    expect(link).toHaveAttribute("href", "#main")
  })

  it("CT-M0-SK-02: includes sr-only and focus:not-sr-only classes", () => {
    render(<SkipLink />)
    const link = screen.getByRole("link", { name: /pular/i })
    expect(link.className).toContain("sr-only")
    expect(link.className).toContain("focus:not-sr-only")
  })

  it("CT-M0-SK-03: has no axe violations", async () => {
    const { container } = render(<SkipLink />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
