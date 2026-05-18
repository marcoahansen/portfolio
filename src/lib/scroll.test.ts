import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useScrolled } from "@/lib/scroll"

function setScrollY(value: number): void {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    writable: true,
    value,
  })
}

function dispatchScroll(): void {
  window.dispatchEvent(new Event("scroll"))
}

describe("useScrolled", () => {
  beforeEach(() => {
    setScrollY(0)
  })

  afterEach(() => {
    setScrollY(0)
  })

  it("CT-M0-SCR-01: scrollY=0 with default threshold returns false on first render", () => {
    const { result } = renderHook(() => useScrolled())
    expect(result.current).toBe(false)
  })

  it("CT-M0-SCR-02: scrollY=20 above threshold flips to true after scroll event", () => {
    const { result } = renderHook(() => useScrolled(8))
    setScrollY(20)
    act(() => dispatchScroll())
    expect(result.current).toBe(true)
  })

  it("CT-M0-SCR-03: transitions true -> false when scroll returns under threshold", () => {
    const { result } = renderHook(() => useScrolled(8))
    setScrollY(20)
    act(() => dispatchScroll())
    expect(result.current).toBe(true)
    setScrollY(0)
    act(() => dispatchScroll())
    expect(result.current).toBe(false)
  })

  it("CT-M0-SCR-04: respects custom threshold", () => {
    const { result } = renderHook(() => useScrolled(50))
    setScrollY(30)
    act(() => dispatchScroll())
    expect(result.current).toBe(false)
    setScrollY(60)
    act(() => dispatchScroll())
    expect(result.current).toBe(true)
  })

  it("CT-M0-SCR-05: removes scroll listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener")
    const { unmount } = renderHook(() => useScrolled(8))
    unmount()
    expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function))
    removeSpy.mockRestore()
  })

  it("initializer reads window.scrollY synchronously when already scrolled", () => {
    setScrollY(50)
    const { result } = renderHook(() => useScrolled(8))
    expect(result.current).toBe(true)
  })
})
