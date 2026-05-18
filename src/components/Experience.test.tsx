import { render, screen, within } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { axe } from "vitest-axe"
import { Experience } from "./Experience"
import type { Experience as ExperienceData } from "@/types/domain"

const experiences: ExperienceData[] = [
  {
    company: "Venturus",
    role: "Frontend Developer",
    startDate: "2023-05-01",
    description: "Aplicações React para telecom.",
    stack: ["React", "TypeScript"],
  },
  {
    company: "Freelance",
    role: "Desenvolvedor Frontend",
    startDate: "2020-06-01",
    endDate: "2022-12-01",
    description: "Landing pages e painéis.",
    stack: ["Next.js"],
  },
]

describe("Experience", () => {
  it("CT-M4-23: renders section heading", () => {
    render(<Experience experiences={experiences} />)
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(/experiência|trajetória/i)
  })

  it("CT-M4-24: renders one entry per experience with role, company, description (RF-M4-02)", () => {
    render(<Experience experiences={experiences} />)
    const entries = screen.getAllByRole("article")
    expect(entries).toHaveLength(2)
    expect(within(entries[0]!).getByRole("heading", { level: 3 })).toHaveTextContent(
      "Frontend Developer",
    )
    expect(within(entries[0]!).getByText("Venturus")).toBeInTheDocument()
    expect(within(entries[0]!).getByText(/Aplicações React/)).toBeInTheDocument()
  })

  it("CT-M4-25: shows 'Presente' for ongoing entries (RN-M4-01/02)", () => {
    render(<Experience experiences={experiences} />)
    const entries = screen.getAllByRole("article")
    expect(within(entries[0]!).getByText(/2023.*Presente/)).toBeInTheDocument()
    expect(within(entries[1]!).getByText(/2020.*—.*2022/)).toBeInTheDocument()
  })

  it("CT-M4-26: renders stack badges per experience", () => {
    render(<Experience experiences={experiences} />)
    const entries = screen.getAllByRole("article")
    expect(within(entries[0]!).getByText("React")).toBeInTheDocument()
    expect(within(entries[0]!).getByText("TypeScript")).toBeInTheDocument()
  })

  it("CT-M4-27: renders nothing when list is empty", () => {
    const { container } = render(<Experience experiences={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it("CT-M4-28: has no axe violations", async () => {
    const { container } = render(<Experience experiences={experiences} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
