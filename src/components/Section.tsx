import type { ElementType, ReactNode } from "react"
import { cn } from "@/lib/cn"
import { Reveal } from "@/lib/motion"

type Props = {
  id: string
  eyebrow?: string
  title?: string
  subtitle?: string
  as?: ElementType
  reveal?: boolean
  className?: string
  containerClassName?: string
  children: ReactNode
}

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  as: Tag = "section",
  reveal = true,
  className,
  containerClassName,
  children,
}: Props) {
  const hasHeader = Boolean(eyebrow ?? title ?? subtitle)

  const body = (
    <Tag id={id} className={cn("scroll-mt-24 py-16 md:py-24", className)}>
      <div className={cn("container mx-auto px-4", containerClassName)}>
        {hasHeader && (
          <header className="mx-auto max-w-3xl space-y-3 text-center">
            {eyebrow && (
              <p className="text-body-sm font-medium uppercase tracking-[0.18em] text-primary">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="font-display text-headline-lg font-bold tracking-widest text-foreground md:text-display-lg">
                {title}
              </h2>
            )}
            {subtitle && <p className="text-body-lg text-muted-foreground">{subtitle}</p>}
          </header>
        )}
        <div className={hasHeader ? "mt-12" : ""}>{children}</div>
      </div>
    </Tag>
  )

  return reveal ? <Reveal>{body}</Reveal> : body
}
