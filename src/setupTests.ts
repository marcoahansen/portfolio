import "@testing-library/jest-dom/vitest"
import * as matchers from "vitest-axe/matchers"
import type { AxeMatchers } from "vitest-axe/matchers"
import { expect, afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends AxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

expect.extend(matchers)

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = ""
  readonly thresholds: readonly number[] = []
  readonly callback: IntersectionObserverCallback
  readonly elements = new Set<Element>()

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    mockObservers.push(this)
  }

  observe(el: Element) {
    this.elements.add(el)
  }
  unobserve(el: Element) {
    this.elements.delete(el)
  }
  disconnect() {
    this.elements.clear()
  }
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }

  trigger(intersecting: boolean) {
    const entries = [...this.elements].map((target) => ({
      target,
      isIntersecting: intersecting,
      intersectionRatio: intersecting ? 1 : 0,
      boundingClientRect: target.getBoundingClientRect(),
      intersectionRect: target.getBoundingClientRect(),
      rootBounds: null,
      time: Date.now(),
    }))
    this.callback(entries, this)
  }
}

export const mockObservers: MockIntersectionObserver[] = []
;(
  globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }
).IntersectionObserver = MockIntersectionObserver

afterEach(() => {
  mockObservers.length = 0
  cleanup()
})
