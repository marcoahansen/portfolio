import { Button } from "@/components/ui/button"
import { FEATURES, type Features } from "@/lib/features"
import { withBase } from "@/lib/withBase"
import type { Hero as HeroData } from "@/types/domain"

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1-.02-1.96-3.2.69-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.07.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12 24 5.65 18.85.5 12.5.5z" />
    </svg>
  )
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  )
}

type Props = {
  hero: HeroData
  features?: Features
}

export function Hero({ hero, features = FEATURES }: Props) {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-background via-background to-secondary/40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-32 -z-10 size-[28rem] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-24 -z-10 size-[24rem] rounded-full bg-accent/40 blur-3xl"
      />

      <div className="container mx-auto grid min-h-screen items-center gap-12 px-4 py-16 md:grid-cols-3">
        <div className="order-2 space-y-6 md:order-1 md:col-span-2">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            Disponível para projetos e mentorias
          </p>
          <h1 className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text font-display text-display-xl font-bold tracking-tight text-transparent md:text-display-2xl">
            {hero.displayName}
          </h1>
          <p className="text-headline-md font-medium text-primary/90 md:text-headline-lg">
            {hero.role}
          </p>
          <p className="max-w-xl text-body-lg leading-relaxed text-muted-foreground">
            {hero.tagline}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild size="lg" className="shadow-md transition-shadow hover:shadow-lg">
              <a href={withBase(`/cv/${hero.cv.fileName}`)} download>
                Download CV (<span className="font-mono">{hero.cv.versionLabel}</span>)
              </a>
            </Button>

            {features.contact && (
              <Button asChild variant="outline" size="lg">
                <a href={withBase("/#contact")}>Falar comigo</a>
              </Button>
            )}

            {features.projects && (
              <a
                href={withBase("/projects")}
                className="inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Ver projetos →
              </a>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-full border border-border/60 hover:border-border"
            >
              <a
                href={hero.github.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`GitHub: ${hero.github.handle}`}
              >
                <GithubIcon />
              </a>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-full border border-border/60 hover:border-border"
            >
              <a
                href={hero.linkedin.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`LinkedIn: ${hero.linkedin.handle}`}
              >
                <LinkedinIcon />
              </a>
            </Button>
          </div>
        </div>

        <div className="order-1 flex justify-center md:order-2 md:col-span-1">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-full bg-gradient-to-br from-primary/30 to-accent/40 blur-xl md:rounded-3xl"
            />
            <img
              src={withBase(hero.avatar.src)}
              alt={hero.avatar.alt}
              className="relative size-40 rounded-full object-cover shadow-2xl ring-4 ring-background md:size-80 md:rounded-2xl"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
