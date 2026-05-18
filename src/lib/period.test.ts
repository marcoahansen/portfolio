import { describe, it, expect } from "vitest"
import { formatPeriod, sortByRecency } from "./period"

describe("formatPeriod", () => {
  it("CT-M4-15: formats closed period in pt-BR with year separator", () => {
    const out = formatPeriod("2023-05-01", "2024-12-01", "pt")
    expect(out).toMatch(/2023.*—.*2024/)
    expect(out).toMatch(/mai/i)
    expect(out).toMatch(/dez/i)
  })

  it("CT-M4-16: pt without endDate uses 'Presente'", () => {
    const out = formatPeriod("2023-05-01", undefined, "pt")
    expect(out).toMatch(/2023.*Presente/)
  })

  it("CT-M0-PER-02: en without endDate uses 'Present'", () => {
    const out = formatPeriod("2023-05-01", undefined, "en")
    expect(out).toMatch(/2023.*Present/)
    expect(out).toMatch(/May/i)
  })

  it("CT-M0-PER-03: en closed period renders both years", () => {
    const out = formatPeriod("2023-05-01", "2024-09-30", "en")
    expect(out).toMatch(/2023.*—.*2024/)
  })

  it("CT-M4-17: handles every month of the year in pt", () => {
    for (let i = 1; i <= 12; i++) {
      const m = String(i).padStart(2, "0")
      const out = formatPeriod(`2024-${m}-01`, undefined, "pt")
      expect(out).toMatch(/2024.*Presente/)
    }
  })

  it("CT-M4-18: throws on malformed startDate", () => {
    expect(() => formatPeriod("bad", undefined, "pt")).toThrow()
  })

  it("CT-M0-PER-04: throws on malformed endDate", () => {
    expect(() => formatPeriod("2023-01-01", "bad", "en")).toThrow()
  })

  it("CT-M0-PER-05: caches formatter per locale (no exception on repeated calls)", () => {
    expect(() => {
      formatPeriod("2023-01-01", undefined, "pt")
      formatPeriod("2024-01-01", undefined, "pt")
      formatPeriod("2023-01-01", undefined, "en")
      formatPeriod("2024-01-01", undefined, "en")
    }).not.toThrow()
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
