import { useEffect, useState } from "react"

export function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState<boolean>(() => {
    /* c8 ignore next */
    if (typeof window === "undefined") return false
    return window.scrollY > threshold
  })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [threshold])

  return scrolled
}
