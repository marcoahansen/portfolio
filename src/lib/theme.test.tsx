import { renderHook, act } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { ReactNode } from "react"
import { STORAGE_KEY, ThemeProvider, getInitialTheme, useTheme } from "@/lib/theme"

const wrapper = ({ children }: { children: ReactNode }) => <ThemeProvider>{children}</ThemeProvider>

const mockMatchMedia = (matches: boolean) => {
  vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.classList.remove("dark")
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("getInitialTheme", () => {
  it("CT-M0-THM-01: returns dark when no storage and prefers-color-scheme is dark", () => {
    mockMatchMedia(true)
    expect(getInitialTheme()).toBe("dark")
  })

  it("CT-M0-THM-02: returns stored light even when system prefers dark", () => {
    mockMatchMedia(true)
    window.localStorage.setItem(STORAGE_KEY, "light")
    expect(getInitialTheme()).toBe("light")
  })

  it("CT-M0-THM-02b: returns stored dark even when system prefers light", () => {
    mockMatchMedia(false)
    window.localStorage.setItem(STORAGE_KEY, "dark")
    expect(getInitialTheme()).toBe("dark")
  })

  it("CT-M0-THM-09: falls back to matchMedia when storage holds invalid value", () => {
    mockMatchMedia(true)
    window.localStorage.setItem(STORAGE_KEY, "system")
    expect(getInitialTheme()).toBe("dark")
  })

  it("returns light when no storage and system prefers light", () => {
    mockMatchMedia(false)
    expect(getInitialTheme()).toBe("light")
  })

  it("returns light when localStorage access throws", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked")
    })
    expect(getInitialTheme()).toBe("light")
    spy.mockRestore()
  })
})

describe("ThemeProvider + useTheme", () => {
  it("CT-M0-THM-03: toggle alternates light <-> dark", () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe("light")
    act(() => result.current.toggle())
    expect(result.current.theme).toBe("dark")
    act(() => result.current.toggle())
    expect(result.current.theme).toBe("light")
  })

  it("CT-M0-THM-04: useTheme outside Provider throws", () => {
    expect(() => renderHook(() => useTheme())).toThrow("useTheme must be used within ThemeProvider")
  })

  it("CT-M0-THM-05: mounts with dark applies .dark class to documentElement", () => {
    mockMatchMedia(false)
    window.localStorage.setItem(STORAGE_KEY, "dark")
    renderHook(() => useTheme(), { wrapper })
    expect(document.documentElement.classList.contains("dark")).toBe(true)
  })

  it("CT-M0-THM-06: toggling from dark to light removes .dark class", () => {
    mockMatchMedia(false)
    window.localStorage.setItem(STORAGE_KEY, "dark")
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    act(() => result.current.toggle())
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })

  it("CT-M0-THM-07: toggle persists new value in localStorage", () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("light")
    act(() => result.current.toggle())
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("dark")
    act(() => result.current.toggle())
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("light")
  })

  it("CT-M0-THM-08: localStorage.setItem throwing does not crash provider", () => {
    mockMatchMedia(false)
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota")
    })
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(() => act(() => result.current.toggle())).not.toThrow()
    expect(result.current.theme).toBe("dark")
    spy.mockRestore()
  })
})
