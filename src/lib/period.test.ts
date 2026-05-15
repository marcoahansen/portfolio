import { describe, it, expect } from "vitest"
import { formatPeriod, sortByRecency } from "./period"

describe("formatPeriod", () => {
  it("CT-M4-15: formats closed period with PT-BR month abbreviations (RN-M4-02)", () => {
    expect(formatPeriod("2023-05-01", "2024-12-01")).toBe("Mai 2023 — Dez 2024")
  })

  it("CT-M4-16: formats ongoing period as 'Presente' (RN-M4-01/02)", () => {
    expect(formatPeriod("2023-05-01")).toBe("Mai 2023 — Presente")
  })

  it("CT-M4-17: handles every month of the year", () => {
    const months = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ]
    months.forEach((label, i) => {
      const m = String(i + 1).padStart(2, "0")
      expect(formatPeriod(`2024-${m}-01`)).toBe(`${label} 2024 — Presente`)
    })
  })

  it("CT-M4-18: throws on malformed startDate", () => {
    expect(() => formatPeriod("bad")).toThrow()
  })
})

const e = (startDate: string, endDate?: string) => ({
  company: "X",
  role: "Dev",
  startDate,
  ...(endDate ? { endDate } : {}),
  description: "d",
  stack: [],
})

describe("sortByRecency", () => {
  it("CT-M4-19: ongoing entries float to the top (RN-M4-01)", () => {
    const list = [e("2020-01-01", "2021-01-01"), e("2019-06-01"), e("2022-01-01", "2023-01-01")]
    const sorted = sortByRecency(list)
    expect(sorted[0]!.startDate).toBe("2019-06-01")
    expect(sorted[0]!.endDate).toBeUndefined()
  })

  it("CT-M4-20: closed entries sorted by startDate desc (RF-M4-01)", () => {
    const list = [e("2020-01-01", "2021-01-01"), e("2022-01-01", "2023-01-01")]
    const sorted = sortByRecency(list)
    expect(sorted.map((x) => x.startDate)).toEqual(["2022-01-01", "2020-01-01"])
  })

  it("CT-M4-21: multiple ongoing entries sorted by startDate desc among themselves", () => {
    const list = [e("2020-01-01"), e("2022-06-01"), e("2018-01-01", "2019-01-01")]
    const sorted = sortByRecency(list)
    expect(sorted.map((x) => x.startDate)).toEqual(["2022-06-01", "2020-01-01", "2018-01-01"])
  })

  it("CT-M4-22: does not mutate input", () => {
    const list = [e("2020-01-01", "2021-01-01"), e("2022-01-01")]
    const before = JSON.stringify(list)
    sortByRecency(list)
    expect(JSON.stringify(list)).toBe(before)
  })
})
