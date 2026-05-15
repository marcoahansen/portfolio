import { act, render, renderHook } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { Reveal, useInView } from "@/lib/motion"
import { mockObservers } from "@/setupTests"

describe("useInView", () => {
  it("CT-M0-MOT-01: returns inView=false before observer fires", () => {
    const { result } = renderHook(() => useInView<HTMLDivElement>())
    expect(result.current.inView).toBe(false)
  })

  it("returns inView=false when ref was never attached (effect early-returns)", () => {
    const { result } = renderHook(() => useInView<HTMLDivElement>())
    expect(result.current.inView).toBe(false)
    expect(mockObservers).toHaveLength(0)
  })
})

describe("Reveal", () => {
  it("renders wrapper with opacity-0 before intersection", () => {
    const { container } = render(<Reveal>child</Reveal>)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain("opacity-0")
  })

  it("CT-M0-MOT-02: swaps opacity-0 for variant class after intersection", () => {
    const { container } = render(<Reveal>child</Reveal>)
    expect(mockObservers).toHaveLength(1)
    act(() => mockObservers[0]!.trigger(true))
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain("motion-fade-in-up")
    expect(wrapper.className).not.toContain("opacity-0")
  })

  it('maps variant="fade-in" to motion-fade-in', () => {
    const { container } = render(<Reveal variant="fade-in">child</Reveal>)
    act(() => mockObservers[0]!.trigger(true))
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain("motion-fade-in")
    expect(wrapper.className).not.toContain("motion-fade-in-up")
  })

  it("ignores non-intersecting entries (inView stays false)", () => {
    const { container } = render(<Reveal>child</Reveal>)
    act(() => mockObservers[0]!.trigger(false))
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain("opacity-0")
  })

  it("disconnects observer after first intersection", () => {
    render(<Reveal>child</Reveal>)
    const obs = mockObservers[0]!
    act(() => obs.trigger(true))
    expect(obs.elements.size).toBe(0)
  })

  it("merges extra className", () => {
    const { container } = render(<Reveal className="custom-x">child</Reveal>)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain("custom-x")
  })
})
