# Blueprint — M1: Hero / Apresentação

**Versão:** 0.2.0
**Status:** Aprovado — pronto para execução
**Spec de origem:** `docs/spec.md` §3 M1
**FRD de origem:** `docs/features/m1-hero/frd-m1-hero.md`
**Documentos relacionados:** `docs/scaffolding-state.md`, `AGENTS.md`

> Este blueprint converte o FRD em um plano TDD executável. Decisões D-01..D-09 fechadas em 2026-05-13 (sessão de perguntas com Marco) e registradas na §3. Cada passo lista alvo, conteúdo essencial, validação local e commit Conventional.

---

## 1. Branch e estratégia de merge

- **Nome:** `feat/m1-hero`
- **Base:** `main` em `5f17581` (HEAD atual).
- **Commits:** 11 sequenciais (FRD §10 com bundling RED+GREEN por step — ver D-09).
- **Merge:** `--ff-only` em `main` (mesmo padrão das 11 branches do scaffolding).
- **Pré-condição:** working tree limpo; `pnpm install --frozen-lockfile` exit 0; `main` atualizado.

## 2. Convenções herdadas

- TDD do `AGENTS.md §3`: RED → GREEN → REFACTOR — **bundle por commit** (D-09).
- Conventional Commits. Código e commits em inglês; docs em PT-BR.
- Pre-commit hook ativo: `lint-staged → typecheck → test:run`. Cada commit precisa passar.
- Cobertura: 100% em `src/lib/validation.ts` (gate herdado de CA-03). `heroSchema` + `validateHero` precisam exercitar todos os ramos.
- Não editar `src/components/ui/**` à mão (regra shadcn). Componentes de domínio em `src/components/`.
- Importações: usar alias `@/...` (já configurado por `vite-tsconfig-paths`).

---

## 3. Decisões fechadas (referência)

Sessão de perguntas em 2026-05-13. Todas as nove decisões resolvidas antes de iniciar a branch.

| # | Decisão | Resolução |
|---|---------|-----------|
| D-01 | Como o `Hero` recebe as feature flags | **Por prop com default `= FEATURES`.** Default mantém consumo direto em produção; tests injetam combos sem mocking. |
| D-02 | Quando entram os assets reais (CV + avatar) | **Placeholders agora, reais antes do merge.** Merge-checklist (§6) obriga substituição. |
| D-03 | Forma do helper `validateHero` | **`safeParse` + erro humanizado.** Mensagem leg ível no boot vence o custo de um ramo extra a testar. |
| D-04 | Conteúdo do PDF placeholder | **Arquivo vazio (0 byte).** `existsSync` passa; `<a download>` baixa bytes vazios. Browser preview falha mas é irrelevante até CV real. |
| D-05 | Conteúdo do avatar placeholder | **WebP 1x1 transparente (~30 B).** Passa `existsSync`, render trivial. |
| D-06 | Runner do script de assets | **`node --import tsx`.** `tsx@^4` continua em devDeps como loader hook; invocação fica `node --import tsx scripts/check-assets.ts`. |
| D-07 | Onde mora o smooth scroll | **`@layer base { html { scroll-behavior: smooth } }` em `src/app.css`.** |
| D-08 | Granularidade de commits de assets/guard | **Dois commits separados:** `chore(assets): ...` e `chore(build): ...`. |
| D-09 | Pre-commit hook bloqueia commits RED | **Combinar RED+GREEN por step.** Sem `--no-verify`, sem ajustes no hook. Perde-se RED→GREEN visível no histórico, mas cada commit fica verde e auto-contido. |

---

## 4. Plano TDD passo a passo

Ordem espelha FRD §10 com bundling D-09 aplicado. Cada passo: alvos, conteúdo essencial, validação local, commit.

### Passo 1 — Tipo `Hero`

**Alvo:** `src/types/domain.ts` (modificar)

Anexar ao final:

```typescript
export type Hero = {
  fullName: string
  displayName: string
  role: string
  tagline: string
  github: { url: string; handle: string }
  linkedin: { url: string; handle: string }
  cv: { fileName: string; versionLabel: string }
  avatar: { src: string; alt: string }
}
```

**Validação local:** `pnpm typecheck` exit 0.

**Commit:** `feat(domain): add Hero type`

---

### Passo 2 — `heroSchema` + `validateHero` (RED+GREEN bundle)

**Alvos:**
- `src/lib/validation.test.ts` (modificar — +14 casos)
- `src/lib/validation.ts` (modificar — +schema +helper +import de tipo)

**Test plan (`validation.test.ts`):**

Importar `validateHero` junto. Adicionar `validHero` fixture e dois blocks:

```typescript
import { heroSchema, projectSchema, contactFormSchema, validateHero } from "./validation"

const validHero = {
  fullName: "Marco Aurelio Hansen de Oliveira",
  displayName: "Marco Hansen",
  role: "Desenvolvedor Frontend & Instrutor de Tecnologia",
  tagline: "Construo interfaces robustas com TDD e ajudo devs em formação a fazerem o mesmo.",
  github: { url: "https://github.com/marcohansen", handle: "marcohansen" },
  linkedin: { url: "https://www.linkedin.com/in/marco-hansen/", handle: "marco-hansen" },
  cv: { fileName: "marco-hansen-cv-2026-05.pdf", versionLabel: "mai/2026" },
  avatar: { src: "/avatar.webp", alt: "Foto de Marco Hansen" },
}

describe("heroSchema", () => {
  it("CT-M1-01: accepts a valid hero", () => {
    expect(() => heroSchema.parse(validHero)).not.toThrow()
  })

  it("CT-M1-02: rejects missing fullName", () => {
    const { fullName: _f, ...rest } = validHero
    expect(() => heroSchema.parse(rest)).toThrow()
  })

  it("CT-M1-03: rejects displayName with 1 char", () => {
    expect(() => heroSchema.parse({ ...validHero, displayName: "M" })).toThrow()
  })

  it("CT-M1-04: rejects role with 121 chars", () => {
    expect(() => heroSchema.parse({ ...validHero, role: "a".repeat(121) })).toThrow()
  })

  it("CT-M1-05: rejects tagline with 9 chars", () => {
    expect(() => heroSchema.parse({ ...validHero, tagline: "a".repeat(9) })).toThrow()
  })

  it("CT-M1-06: rejects malformed github.url", () => {
    expect(() =>
      heroSchema.parse({ ...validHero, github: { ...validHero.github, url: "not-a-url" } }),
    ).toThrow()
  })

  it("CT-M1-07: rejects github.url not under github.com", () => {
    expect(() =>
      heroSchema.parse({
        ...validHero,
        github: { ...validHero.github, url: "https://gitlab.com/marcohansen" },
      }),
    ).toThrow()
  })

  it("CT-M1-08: rejects linkedin.url not under www.linkedin.com", () => {
    expect(() =>
      heroSchema.parse({
        ...validHero,
        linkedin: { ...validHero.linkedin, url: "https://linkedin.com/in/marco-hansen" },
      }),
    ).toThrow()
  })

  it("CT-M1-09: rejects cv.fileName without .pdf extension", () => {
    expect(() =>
      heroSchema.parse({ ...validHero, cv: { ...validHero.cv, fileName: "cv-2026-05.txt" } }),
    ).toThrow()
  })

  it("CT-M1-10: rejects cv.versionLabel with invalid format", () => {
    expect(() =>
      heroSchema.parse({ ...validHero, cv: { ...validHero.cv, versionLabel: "2026-05" } }),
    ).toThrow()
  })

  it("CT-M1-11: rejects avatar.src not starting with /", () => {
    expect(() =>
      heroSchema.parse({ ...validHero, avatar: { ...validHero.avatar, src: "avatar.webp" } }),
    ).toThrow()
  })

  it("CT-M1-12: rejects avatar.alt with 2 chars", () => {
    expect(() =>
      heroSchema.parse({ ...validHero, avatar: { ...validHero.avatar, alt: "ab" } }),
    ).toThrow()
  })
})

describe("validateHero", () => {
  it("CT-M1-13: returns parsed Hero for valid input", () => {
    expect(validateHero(validHero)).toEqual(validHero)
  })

  it("CT-M1-14: throws Error with humanized path and message on invalid input", () => {
    expect(() => validateHero({ ...validHero, displayName: "M" })).toThrow(
      /Invalid hero\.json at displayName/,
    )
  })
})
```

**Implementation (`validation.ts`):**

Adicionar import no topo:

```typescript
import type { Hero } from "@/types/domain"
```

Adicionar após `contactFormSchema`:

```typescript
export const heroSchema = z.object({
  fullName: z.string().min(2).max(100),
  displayName: z.string().min(2).max(60),
  role: z.string().min(3).max(120),
  tagline: z.string().min(10).max(200),
  github: z.object({
    url: z.string().url().startsWith("https://github.com/"),
    handle: z.string().min(1),
  }),
  linkedin: z.object({
    url: z.string().url().startsWith("https://www.linkedin.com/"),
    handle: z.string().min(1),
  }),
  cv: z.object({
    fileName: z.string().regex(/^[a-z0-9-]+\.pdf$/),
    versionLabel: z.string().regex(/^[a-z]{3}\/\d{4}$/),
  }),
  avatar: z.object({
    src: z.string().startsWith("/"),
    alt: z.string().min(3),
  }),
})

export function validateHero(input: unknown): Hero {
  const result = heroSchema.safeParse(input)
  if (!result.success) {
    const issue = result.error.issues[0]
    const path = issue.path.join(".")
    throw new Error(`Invalid hero.json at ${path}: ${issue.message}`)
  }
  return result.data as Hero
}
```

**Validação local:**
- `pnpm test:run` verde (14 novos casos passam).
- `pnpm test:coverage` mantém 100% em `validation.ts`:
  - CT-M1-13 cobre `result.success === true`.
  - CT-M1-14 cobre `result.success === false` + path join + throw.
  - CT-M1-07/08 cobrem branch `.startsWith`.
  - CT-M1-09/10 cobrem branch `.regex`.

**Commit:** `feat(validation): add heroSchema and validateHero helper`

---

### Passo 3 — Seed `hero.json`

**Alvo:** `src/data/hero.json` (criar)

```json
{
  "fullName": "Marco Aurelio Hansen de Oliveira",
  "displayName": "Marco Hansen",
  "role": "Desenvolvedor Frontend & Instrutor de Tecnologia",
  "tagline": "Construo interfaces robustas com TDD e ajudo devs em formação a fazerem o mesmo.",
  "github": { "url": "https://github.com/marcohansen", "handle": "marcohansen" },
  "linkedin": {
    "url": "https://www.linkedin.com/in/marco-hansen/",
    "handle": "marco-hansen"
  },
  "cv": {
    "fileName": "marco-hansen-cv-2026-05.pdf",
    "versionLabel": "mai/2026"
  },
  "avatar": { "src": "/avatar.webp", "alt": "Foto de Marco Hansen" }
}
```

> Valores placeholders idênticos ao FRD §4.3. Substituição pelos reais é responsabilidade de Marco (FRD §11).

**Validação local:** `pnpm test:run` verde; manual `node -e "import('./src/data/hero.json', { with: { type: 'json' } }).then(console.log)"` retorna objeto.

**Commit:** `feat(data): seed hero.json with placeholders`

---

### Passo 4 — Feature flags

**Alvo:** `src/lib/features.ts` (criar)

```typescript
export const FEATURES = {
  hero: true,
  skills: false,
  experience: false,
  projects: false,
  contact: false,
} as const

export type FeatureName = keyof typeof FEATURES
export type Features = typeof FEATURES
```

Sem teste dedicado: objeto literal sem ramo de execução.

**Validação local:** `pnpm lint` verde; `pnpm typecheck` verde.

**Commit:** `feat(features): add static feature flags`

---

### Passo 5 — Componente `Hero` (RED+GREEN bundle)

**Alvos:**
- `src/components/Hero.test.tsx` (criar)
- `src/components/Hero.tsx` (criar)

**Test plan (`Hero.test.tsx`):**

```tsx
import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { axe } from "vitest-axe"
import { Hero } from "./Hero"
import type { Features } from "@/lib/features"
import type { Hero as HeroData } from "@/types/domain"

const hero: HeroData = {
  fullName: "Marco Aurelio Hansen",
  displayName: "Marco Hansen",
  role: "Frontend & Instrutor",
  tagline: "Tagline de teste com tamanho suficiente.",
  github: { url: "https://github.com/marcohansen", handle: "marcohansen" },
  linkedin: { url: "https://www.linkedin.com/in/marco-hansen/", handle: "marco-hansen" },
  cv: { fileName: "cv-2026-05.pdf", versionLabel: "mai/2026" },
  avatar: { src: "/avatar.webp", alt: "Foto de teste" },
}

const allOff: Features = {
  hero: true,
  skills: false,
  experience: false,
  projects: false,
  contact: false,
}

const allOn: Features = { ...allOff, contact: true, projects: true }

describe("Hero", () => {
  it("renders displayName as h1", () => {
    render(<Hero hero={hero} features={allOff} />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Marco Hansen")
  })

  it("renders role and tagline", () => {
    render(<Hero hero={hero} features={allOff} />)
    expect(screen.getByText(hero.role)).toBeInTheDocument()
    expect(screen.getByText(hero.tagline)).toBeInTheDocument()
  })

  it("renders CV button with download href and versionLabel", () => {
    render(<Hero hero={hero} features={allOff} />)
    const cv = screen.getByRole("link", { name: /Download CV/ })
    expect(cv).toHaveAttribute("href", "/cv/cv-2026-05.pdf")
    expect(cv).toHaveAttribute("download")
    expect(cv).toHaveTextContent("mai/2026")
  })

  it("renders GitHub link with target/rel and handle in aria-label", () => {
    render(<Hero hero={hero} features={allOff} />)
    const gh = screen.getByRole("link", { name: /GitHub: marcohansen/ })
    expect(gh).toHaveAttribute("target", "_blank")
    expect(gh).toHaveAttribute("rel", expect.stringContaining("noopener"))
    expect(gh).toHaveAttribute("rel", expect.stringContaining("noreferrer"))
  })

  it("renders LinkedIn link analogously", () => {
    render(<Hero hero={hero} features={allOff} />)
    const li = screen.getByRole("link", { name: /LinkedIn: marco-hansen/ })
    expect(li).toHaveAttribute("target", "_blank")
    expect(li).toHaveAttribute("rel", expect.stringContaining("noopener"))
  })

  it("renders 'Falar comigo' when contact flag is on", () => {
    render(<Hero hero={hero} features={{ ...allOff, contact: true }} />)
    expect(screen.getByRole("link", { name: /Falar comigo/ })).toHaveAttribute(
      "href",
      "/#contact",
    )
  })

  it("omits 'Falar comigo' when contact flag is off", () => {
    render(<Hero hero={hero} features={allOff} />)
    expect(screen.queryByRole("link", { name: /Falar comigo/ })).toBeNull()
  })

  it("renders 'Ver projetos' when projects flag is on", () => {
    render(<Hero hero={hero} features={{ ...allOff, projects: true }} />)
    expect(screen.getByRole("link", { name: /Ver projetos/ })).toHaveAttribute(
      "href",
      "/projects",
    )
  })

  it("omits 'Ver projetos' when projects flag is off", () => {
    render(<Hero hero={hero} features={allOff} />)
    expect(screen.queryByRole("link", { name: /Ver projetos/ })).toBeNull()
  })

  it("renders avatar img with alt and src from data", () => {
    render(<Hero hero={hero} features={allOff} />)
    const img = screen.getByAltText("Foto de teste")
    expect(img).toHaveAttribute("src", "/avatar.webp")
  })

  it("has no axe violations on both flag branches", async () => {
    const offRender = render(<Hero hero={hero} features={allOff} />)
    expect(await axe(offRender.container)).toHaveNoViolations()
    offRender.unmount()

    const onRender = render(<Hero hero={hero} features={allOn} />)
    expect(await axe(onRender.container)).toHaveNoViolations()
  })
})
```

**Implementation (`Hero.tsx`):**

```tsx
import { Github, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FEATURES, type Features } from "@/lib/features"
import type { Hero as HeroData } from "@/types/domain"

type Props = {
  hero: HeroData
  features?: Features
}

export function Hero({ hero, features = FEATURES }: Props) {
  return (
    <section className="container mx-auto grid min-h-screen items-center gap-12 px-4 py-16 md:grid-cols-3">
      <div className="order-2 space-y-6 md:order-1 md:col-span-2">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{hero.displayName}</h1>
        <p className="text-xl text-muted-foreground">{hero.role}</p>
        <p className="text-lg">{hero.tagline}</p>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href={`/cv/${hero.cv.fileName}`} download>
              Download CV ({hero.cv.versionLabel})
            </a>
          </Button>

          {features.contact && (
            <Button asChild variant="outline">
              <a href="/#contact">Falar comigo</a>
            </Button>
          )}

          {features.projects && (
            <a
              href="/projects"
              className="inline-flex items-center text-sm font-medium underline-offset-4 hover:underline"
            >
              Ver projetos →
            </a>
          )}
        </div>

        <div className="flex gap-2">
          <Button asChild variant="ghost" size="icon">
            <a
              href={hero.github.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`GitHub: ${hero.github.handle}`}
            >
              <Github aria-hidden="true" />
            </a>
          </Button>
          <Button asChild variant="ghost" size="icon">
            <a
              href={hero.linkedin.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`LinkedIn: ${hero.linkedin.handle}`}
            >
              <Linkedin aria-hidden="true" />
            </a>
          </Button>
        </div>
      </div>

      <div className="order-1 flex justify-center md:order-2 md:col-span-1">
        <img
          src={hero.avatar.src}
          alt={hero.avatar.alt}
          className="size-40 rounded-full object-cover md:size-80 md:rounded-2xl"
          loading="eager"
        />
      </div>
    </section>
  )
}
```

> Mobile: avatar `order-1` (acima) com `rounded-full size-40`. Desktop (`md+`): avatar à direita `md:order-2` com `md:size-80 md:rounded-2xl`. Atende FRD §3.4 sem media-queries adicionais.

**Validação local:**
- `pnpm test:run` verde (11 casos do Hero).
- `pnpm typecheck` verde.
- `pnpm lint` verde.

**Commit:** `feat(hero): implement Hero component`

---

### Passo 6 — Rota `/`

**Alvo:** `src/routes/_index.tsx` (modificar — reescrita completa)

```tsx
import type { Route } from "./+types/_index"
import heroData from "@/data/hero.json"
import { Hero } from "@/components/Hero"
import { validateHero } from "@/lib/validation"

const hero = validateHero(heroData)

export function meta(_args: Route.MetaArgs): Route.MetaDescriptors {
  return [
    { title: `${hero.displayName} — ${hero.role}` },
    { name: "description", content: hero.tagline },
  ]
}

export default function HomeRoute() {
  return (
    <main>
      <Hero hero={hero} />
    </main>
  )
}
```

**Pré-requisito a verificar:** `tsconfig.json` precisa de `"resolveJsonModule": true` para o import direto do JSON. Se ausente, adicionar no mesmo commit.

**Validação local:**
- `pnpm typecheck` verde.
- `pnpm dev` → `http://localhost:5173/` carrega Hero sem erro de runtime.
- `pnpm test:run` verde.
- `pnpm build` verde (prerender de `/` consome `hero.json` validado).

**Commit:** `feat(home): render Hero on root route with meta`

---

### Passo 7 — Smooth scroll global

**Alvo:** `src/app.css` (modificar)

Adicionar `html { scroll-behavior: smooth }` dentro do segundo `@layer base`:

```css
@layer base {
  html {
    scroll-behavior: smooth;
  }
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

> `prefers-reduced-motion` é respeitado pelo browser nativamente para `scroll-behavior: smooth`.

**Validação local:**
- `pnpm build` continua verde.
- Manual em `pnpm dev`: link âncora (quando flag de contact ligar no futuro) faz scroll suave.

**Commit:** `style(app): enable smooth scroll`

---

### Passo 8 — Placeholders de assets

**Alvos:**
- `public/cv/marco-hansen-cv-2026-05.pdf` (criar — arquivo vazio, 0 byte)
- `public/avatar.webp` (criar — WebP 1x1 transparente, ~30 B)
- `public/cv/.gitkeep` (remover — substituído pelo PDF placeholder)

**Como gerar:**

```bash
# PDF vazio (D-04)
: > public/cv/marco-hansen-cv-2026-05.pdf

# WebP 1x1 transparente (D-05) — bytes hex conhecidos, ~30 B
printf '\x52\x49\x46\x46\x1a\x00\x00\x00\x57\x45\x42\x50\x56\x50\x38\x4c\x0d\x00\x00\x00\x2f\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00' > public/avatar.webp

# Remove .gitkeep agora obsoleto
rm public/cv/.gitkeep
```

**Validação local:**
- `git status` mostra PDF + WebP novos e `.gitkeep` removido.
- `ls -la public/cv/ public/avatar.webp` confirma presença.
- `existsSync` no script do Passo 9b devolve `true` para ambos.

**Commit:** `chore(assets): add placeholder CV and avatar`

---

### Passo 9 — Asset guard + dependência

**Alvos:**
- `scripts/check-assets.ts` (criar)
- `package.json` (modificar — adicionar `prebuild` + `check:assets`, adicionar `tsx` em devDeps)
- `pnpm-lock.yaml` (regenerar via `pnpm install`)

**`scripts/check-assets.ts`:**

```typescript
import { existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { validateHero } from "../src/lib/validation"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")

function fail(message: string): never {
  console.error(`check-assets ERROR: ${message}`)
  process.exit(1)
}

const heroRaw = readFileSync(resolve(ROOT, "src/data/hero.json"), "utf8")
const hero = validateHero(JSON.parse(heroRaw))

const cvPath = resolve(ROOT, "public/cv", hero.cv.fileName)
if (!existsSync(cvPath)) {
  fail(
    `CV file missing: ${cvPath}\n` +
      "Update src/data/hero.json or place the PDF at public/cv/",
  )
}

const avatarPath = resolve(ROOT, "public" + hero.avatar.src)
if (!existsSync(avatarPath)) {
  fail(`Avatar missing: ${avatarPath}`)
}

console.log("check-assets OK: hero.json validated and all referenced assets exist")
```

**`package.json` patch (scripts + devDependencies):**

```jsonc
{
  "scripts": {
    "dev": "react-router dev",
    "build": "react-router build",
    "prebuild": "node --import tsx scripts/check-assets.ts",
    "check:assets": "node --import tsx scripts/check-assets.ts",
    // ...resto sem alteração
  },
  "devDependencies": {
    // ...existentes,
    "tsx": "^4.20.0"
  }
}
```

> Decisão D-06: `tsx` continua em devDeps como **loader hook** do Node (não como CLI binary). Invocação `node --import tsx <arquivo>` usa o hook ESM do tsx.

**Validação local:**
- `pnpm install` exit 0; lockfile atualizado.
- `pnpm check:assets` exit 0 (placeholders existem).
- Renomear `public/avatar.webp` temporariamente → `pnpm check:assets` exit 1 com mensagem clara → restaurar.
- `pnpm build` verde (prebuild dispara guard).

**Commit:** `chore(build): add prebuild asset guard with tsx`

---

### Passo 10 — E2E

**Alvo:** `e2e/home.spec.ts` (modificar — substituir asserts do smoke atual)

```typescript
import { test, expect } from "@playwright/test"

test("home hero renders name, role and CV CTA", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Marco")

  const cv = page.getByRole("link", { name: /Download CV/ })
  await expect(cv).toHaveAttribute("href", /^\/cv\/.+\.pdf$/)
  await expect(cv).toHaveAttribute("download", /.*/)

  const gh = page.getByRole("link", { name: /GitHub:/ })
  await expect(gh).toHaveAttribute("target", "_blank")
  await expect(gh).toHaveAttribute("rel", /noopener/)
})
```

**Validação local:** `pnpm build && pnpm e2e` verde.

**Commit:** `test(e2e): cover hero CV link and socials`

---

### Passo 11 — Sync da spec

**Alvo:** `docs/spec.md` (modificar §3 M1)

Refinamentos a inserir:

- **Novos RFs:**
  - RF-M1-05: renderizar avatar à direita do texto em `md+`, acima em `<md`.
  - RF-M1-06: `meta()` da rota `/` deriva `title` e `description` de `hero.json`.
  - RF-M1-07: link "Ver projetos →" para `/projects`, condicional a `FEATURES.projects === true`.
- **Refinamento de RFs existentes:**
  - RF-M1-04 fica condicional a `FEATURES.contact === true`.
- **Novas RNs:** RN-M1-03..09 conforme FRD §6.
- **Nota de desvio:** "RF-M1-04 e RF-M1-07 só são renderizados quando a feature flag correspondente está `true`. Detalhes em `docs/features/m1-hero/frd-m1-hero.md` §3.5 e RN-M1-08/09."

**Validação local:** `pnpm format:check` verde.

**Commit:** `docs(spec): refine M1 with feature-flag gates and new RFs`

---

## 5. Matriz consolidada de arquivos

| Caminho | Ação | Passo | Tamanho aprox. |
|---------|------|-------|----------------|
| `src/types/domain.ts` | modificar | 1 | +10 linhas |
| `src/lib/validation.test.ts` | modificar | 2 | +100 linhas |
| `src/lib/validation.ts` | modificar | 2 | +32 linhas |
| `src/data/hero.json` | criar | 3 | 15 linhas |
| `src/lib/features.ts` | criar | 4 | 10 linhas |
| `src/components/Hero.test.tsx` | criar | 5 | ~110 linhas |
| `src/components/Hero.tsx` | criar | 5 | ~75 linhas |
| `src/routes/_index.tsx` | modificar | 6 | reescrita ~20 linhas |
| `tsconfig.json` | (talvez) modificar | 6 | +1 linha se `resolveJsonModule` ausente |
| `src/app.css` | modificar | 7 | +3 linhas |
| `public/cv/marco-hansen-cv-2026-05.pdf` | criar | 8 | binário (0 B placeholder) |
| `public/avatar.webp` | criar | 8 | binário (~30 B placeholder) |
| `public/cv/.gitkeep` | remover | 8 | — |
| `scripts/check-assets.ts` | criar | 9 | ~30 linhas |
| `package.json` | modificar | 9 | +2 scripts, +1 devDep |
| `pnpm-lock.yaml` | regenerar | 9 | gerado |
| `e2e/home.spec.ts` | modificar | 10 | reescrita ~15 linhas |
| `docs/spec.md` | modificar | 11 | +12 linhas |
| `docs/features/m1-hero/blueprint-m1-hero.md` | (este doc) | pré | — |

Total: **18 mudanças**, **11 commits**.

---

## 6. Merge checklist (em `feat/m1-hero`)

Pré-merge — todos verdes localmente e em CI antes de abrir PR / pedir merge:

**Toolchain**
- [ ] `pnpm install --frozen-lockfile` exit 0
- [ ] `pnpm typecheck` exit 0
- [ ] `pnpm lint` exit 0
- [ ] `pnpm format:check` exit 0

**Testes**
- [ ] `pnpm test:run` verde (14 casos schema/helper + 11 do componente Hero)
- [ ] `pnpm test:coverage` — `validation.ts` 100%; global ≥ 70%
- [ ] `pnpm e2e` verde (home.spec.ts atualizado)

**Build**
- [ ] `pnpm check:assets` exit 0
- [ ] `pnpm build` verde (prebuild dispara guard automaticamente)

**Process**
- [ ] Pre-commit hook passou em cada commit (RED+GREEN bundle garante)
- [ ] CI workflow verde no push da branch
- [ ] `docs/spec.md` espelha refinamentos do FRD

**Conteúdo real (responsabilidade de Marco)**
- [ ] PDF real `marco-hansen-cv-2026-05.pdf` substituiu placeholder
- [ ] Avatar real `avatar.webp` (~512x512, ≤80kb) substituiu placeholder
- [ ] Copy real do `hero.json` revisado (displayName, role, tagline)
- [ ] URLs e handles reais de GitHub e LinkedIn validados

**Merge**
- [ ] `git merge --ff-only feat/m1-hero` em `main`
- [ ] Deletar branch local + remota
- [ ] (opcional) Tag `m1-hero-v0.1.0`

---

## 7. Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Importar JSON falha sem `resolveJsonModule` no `tsconfig.json` | média | alto (build red) | Verificar `tsconfig.json` antes do Passo 6; adicionar flag se ausente |
| RR7 `Route.MetaArgs`/`MetaDescriptors` com nomes diferentes | baixa | médio | Inspecionar `.react-router/types/+types/_index.d.ts` após primeiro `react-router typegen`; ajustar imports |
| `vitest-axe` reporta violação em `<a aria-label>` sem texto visível dentro do `<Button asChild>` | média | médio | `aria-label` no anchor + ícone com `aria-hidden="true"` (já incluído no Passo 5); fallback: adicionar texto sr-only |
| `lucide-react@^1.14.0` não expõe `Github`/`Linkedin` ou usa nomes diferentes | baixa | médio | Confirmar `node_modules/lucide-react/dist/...` antes do Passo 5; fallback: SVG inline |
| Cobertura de `validation.ts` < 100% após `validateHero` | baixa | alto (CA-M1-11) | CT-M1-13/14 exercitam sucesso/falha; CT-M1-07/08 cobrem `.startsWith`; verificar com `pnpm test:coverage` |
| Placeholder PDF é detectado como malformado pelo browser | baixa | baixo | `<a download>` baixa bytes independente; teste manual pós-asset real |
| `pnpm install` com nova dep `tsx` quebra lockfile no CI | baixa | médio | Commit do `pnpm-lock.yaml` regenerado junto com `package.json` |
| `node --import tsx` não encontra o loader no CI | baixa | médio | tsx está em devDeps locais; CI roda `pnpm install` antes de `pnpm build`; verificar primeiro push |
| GitHub Pages 404 no PDF após deploy (path case-sensitive) | baixa | baixo | Filename é all-lowercase via regex de `heroSchema`; SC-09 cobre 404.html |

---

## 8. Não pertence a este blueprint

- Nav header / skip-link semântico → quando existir nav, FRD §11 já notou
- Toggle de tema → fora de v1 (spec §5)
- Animações Hero → escopo de PR posterior, não M1
- I18n → fora de v1
- Skills / Experience / Projects / Contact → módulos M2..M5
- Conteúdo real do CV PDF e foto → asset físico, fora do código

---

## 9. Próximos passos após merge

1. Marco revisa copy final em `hero.json` e abre PR de ajuste se necessário.
2. M3 (Skills) entra na fila — espelhar este blueprint para o próximo módulo.
3. Antes de M5 (Contato), `FEATURES.contact` flip + introduzir seção contato em rota apropriada.

---

## 10. Histórico

| Versão | Data | Mudança |
|--------|------|---------|
| 0.1.0 | 2026-05-13 | Blueprint inicial derivado do FRD `0.1.0`. Decisões D-01..D-09 abertas. |
| 0.2.0 | 2026-05-13 | Decisões D-01..D-09 fechadas via sessão de perguntas. RED+GREEN bundle aplicado; `validateHero` usa `safeParse` + erro humanizado; PDF placeholder vazio; runner via `node --import tsx`. 11 commits no total. |
