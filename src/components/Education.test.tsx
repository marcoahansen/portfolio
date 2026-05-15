import { render, screen, within } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { axe } from "vitest-axe"
import { Education } from "./Education"
import type { Education as EducationData } from "@/types/domain"

const items: EducationData[] = [
  {
    institution: "Cubos Academy",
    degree: "Bootcamp Full-Stack Web",
    startDate: "2021-03-01",
    endDate: "2021-12-01",
    description: "Imersão em JavaScript moderno.",
  },
  {
    institution: "Universidade Federal",
    degree: "Tecnólogo em ADS",
    startDate: "2018-02-01",
    endDate: "2020-12-01",
  },
]

describe("Education", () => {
  it("CT-M4-29: renders section heading separate from Experience (RF-M4-03)", () => {
    render(<Education items={items} />)
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(/educação|formação/i)
  })

  it("CT-M4-30: renders each entry with degree, institution and period", () => {
    render(<Education items={items} />)
    const entries = screen.getAllByRole("article")
    expect(entries).toHaveLength(2)
    expect(within(entries[0]!).getByRole("heading", { level: 3 })).toHaveTextContent(
      "Bootcamp Full-Stack Web",
    )
    expect(within(entries[0]!).getByText("Cubos Academy")).toBeInTheDocument()
    expect(within(entries[0]!).getByText(/Mar 2021 — Dez 2021/)).toBeInTheDocument()
  })

  it("CT-M4-31: omits description when not provided", () => {
    render(<Education items={items} />)
    const entries = screen.getAllByRole("article")
    expect(within(entries[0]!).getByText(/Imersão/)).toBeInTheDocument()
    expect(within(entries[1]!).queryByText(/Imersão/)).toBeNull()
  })

  it("CT-M4-32: renders nothing when list is empty", () => {
    const { container } = render(<Education items={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it("CT-M4-33: has no axe violations", async () => {
    const { container } = render(<Education items={items} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
