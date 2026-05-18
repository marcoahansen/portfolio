import { useEffect, useState } from "react"

export function useScrollSpy(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    /* c8 ignore next 3 */
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      return
    }
    const observers: IntersectionObserver[] = []
    for (const id of ids) {
      const el = document.getElementById(id)
      if (!el) continue
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) setActive(id)
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
      )
      obs.observe(el)
      observers.push(obs)
    }
    return () => observers.forEach((o) => o.disconnect())
  }, [ids])

  return active
}
