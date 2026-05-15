import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { axe } from "vitest-axe"
import { Section } from "@/components/Section"

describe("Section", () => {
  it("renders <section> with the given id and the children", () => {
    const { container } = render(
      <Section id="skills">
        <p>inner</p>
      </Section>,
    )
    const section = container.querySelector("section#skills")
    expect(section).not.toBeNull()
    expect(screen.getByText("inner")).toBeInTheDocument()
  })

  it("renders eyebrow, title and subtitle when provided", () => {
    render(
      <Section id="x" eyebrow="EYE" title="TIT" subtitle="SUB">
        body
      </Section>,
    )
    expect(screen.getByText("EYE")).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 2, name: "TIT" })).toBeInTheDocument()
    expect(screen.getByText("SUB")).toBeInTheDocument()
  })

  it("omits the header element when no eyebrow/title/subtitle is passed", () => {
    const { container } = render(<Section id="x">body</Section>)
    expect(container.querySelector("header")).toBeNull()
  })

  it('supports as="article"', () => {
    const { container } = render(
      <Section id="x" as="article">
        body
      </Section>,
    )
    expect(container.querySelector("article#x")).not.toBeNull()
    expect(container.querySelector("section")).toBeNull()
  })

  it("wraps children in a Reveal (opacity-0 initially) by default", () => {
    const { container } = render(<Section id="x">body</Section>)
    const reveal = container.firstElementChild as HTMLElement
    expect(reveal.className).toContain("opacity-0")
  })

  it("skips Reveal when reveal={false}", () => {
    const { container } = render(
      <Section id="x" reveal={false}>
        body
      </Section>,
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.tagName.toLowerCase()).toBe("section")
    expect(root.className).not.toContain("opacity-0")
  })

  it("merges className on the Tag and containerClassName on the inner container", () => {
    const { container } = render(
      <Section id="x" reveal={false} className="bg-foo" containerClassName="px-2">
        body
      </Section>,
    )
    const section = container.querySelector("section#x")!
    expect(section.className).toContain("bg-foo")
    const innerContainer = section.firstElementChild as HTMLElement
    expect(innerContainer.className).toContain("px-2")
  })

  it("has no axe violations", async () => {
    const { container } = render(
      <Section id="x" eyebrow="E" title="T" subtitle="S" reveal={false}>
        <p>content</p>
      </Section>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
