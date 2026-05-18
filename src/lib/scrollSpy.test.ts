import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useScrollSpy } from "@/lib/scrollSpy"
import { mockObservers } from "@/setupTests"

function attachElement(id: string): HTMLElement {
  const el = document.createElement("section")
  el.id = id
  document.body.appendChild(el)
  return el
}

function cleanupElements(...ids: string[]): void {
  for (const id of ids) {
    document.getElementById(id)?.remove()
  }
}

describe("useScrollSpy", () => {
  it("CT-M0-SPY-01: returns null and creates no observer when ids is empty", () => {
    const { result } = renderHook(() => useScrollSpy([]))
    expect(result.current).toBeNull()
    expect(mockObservers).toHaveLength(0)
  })

  it("CT-M0-SPY-02: returns id of intersecting element", () => {
    attachElement("a")
    attachElement("b")
    const ids = ["a", "b"] as const
    const { result } = renderHook(() => useScrollSpy(ids))
    expect(mockObservers).toHaveLength(2)
    act(() => mockObservers[0]!.trigger(true))
    expect(result.current).toBe("a")
    cleanupElements("a", "b")
  })

  it("CT-M0-SPY-03: last intersecting wins when observers fire in order (RN-M0-11)", () => {
    attachElement("a")
    attachElement("b")
    const ids = ["a", "b"] as const
    const { result } = renderHook(() => useScrollSpy(ids))
    act(() => mockObservers[0]!.trigger(true))
    act(() => mockObservers[1]!.trigger(true))
    expect(result.current).toBe("b")
    cleanupElements("a", "b")
  })

  it("CT-M0-SPY-04: skips id when getElementById misses without throwing", () => {
    attachElement("present")
    const ids = ["present", "missing"] as const
    const { result } = renderHook(() => useScrollSpy(ids))
    expect(mockObservers).toHaveLength(1)
    expect(result.current).toBeNull()
    cleanupElements("present")
  })

  it("CT-M0-SPY-05: disconnects every observer on unmount", () => {
    attachElement("a")
    attachElement("b")
    const ids = ["a", "b"] as const
    const { unmount } = renderHook(() => useScrollSpy(ids))
    const observers = [...mockObservers]
    expect(observers).toHaveLength(2)
    unmount()
    for (const obs of observers) {
      expect(obs.elements.size).toBe(0)
    }
    cleanupElements("a", "b")
  })

  it("ignores non-intersecting entries", () => {
    attachElement("a")
    const ids = ["a"] as const
    const { result } = renderHook(() => useScrollSpy(ids))
    act(() => mockObservers[0]!.trigger(false))
    expect(result.current).toBeNull()
    cleanupElements("a")
  })
})
