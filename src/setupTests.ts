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

afterEach(() => {
  cleanup()
})
