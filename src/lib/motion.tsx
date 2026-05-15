import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/cn"

export type MotionVariant = "fade-in-up" | "fade-in"

const variantClass: Record<MotionVariant, string> = {
  "fade-in-up": "motion-fade-in-up",
  "fade-in": "motion-fade-in",
}

export function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, inView }
}

type RevealProps = {
  variant?: MotionVariant
  className?: string
  children: ReactNode
}

export function Reveal({ variant = "fade-in-up", className, children }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <div ref={ref} className={cn(className, inView ? variantClass[variant] : "opacity-0")}>
      {children}
    </div>
  )
}
