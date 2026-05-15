import { render, screen, within } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { axe } from "vitest-axe"
import { Skills } from "./Skills"
import type { Skill } from "@/types/domain"

const skills: Skill[] = [
  { name: "React", category: "frontend" },
  { name: "TypeScript", category: "frontend" },
  { name: "Vite", category: "tools" },
  { name: "Node.js", category: "backend" },
  { name: "TDD", category: "practices" },
  { name: "Mentoria 1:1", category: "pedagogical" },
  { name: "Pair programming didático", category: "pedagogical" },
]

describe("Skills", () => {
  it("CT-M3-08: renders section heading", () => {
    render(<Skills skills={skills} />)
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(/habilidades/i)
  })

  it("CT-M3-09: groups technical skills under their categories (RF-M3-01)", () => {
    render(<Skills skills={skills} />)
    const group = screen.getByRole("group", { name: /frontend/i })
    expect(within(group).getByText("React")).toBeInTheDocument()
    expect(within(group).getByText("TypeScript")).toBeInTheDocument()
  })

  it("CT-M3-10: renders pedagogical group separately (RF-M3-02)", () => {
    render(<Skills skills={skills} />)
    const group = screen.getByRole("group", { name: /pedagóg/i })
    expect(within(group).getByText("Mentoria 1:1")).toBeInTheDocument()
    expect(within(group).getByText("Pair programming didático")).toBeInTheDocument()
  })

  it("CT-M3-11: omits a category group when it has no skills", () => {
    render(<Skills skills={[{ name: "React", category: "frontend" }]} />)
    expect(screen.queryByRole("heading", { level: 3, name: /backend/i })).toBeNull()
    expect(screen.queryByRole("heading", { level: 3, name: /pedagóg/i })).toBeNull()
  })

  it("CT-M3-12: exposes anchor id 'skills' for in-page navigation", () => {
    const { container } = render(<Skills skills={skills} />)
    expect(container.querySelector("#skills")).not.toBeNull()
  })

  it("CT-M3-13: has no axe violations", async () => {
    const { container } = render(<Skills skills={skills} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
