import { useSyncExternalStore } from "react"

const noop = () => undefined
const noopSubscribe = () => noop

export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
}
