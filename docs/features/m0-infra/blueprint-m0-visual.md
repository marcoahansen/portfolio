# Blueprint — `feat/m0-visual` (Fases A + B do FRD M0)

**Versão:** 0.1.0
**Status:** Draft — pronto para implementação
**FRD de origem:** `docs/features/m0-infra/frd-m0-infra.md` (v0.2.0)
**Spec / state:** `docs/spec.md`, `docs/scaffolding-state.md`
**Branch base:** `main` (HEAD `8169522`)
**Branch alvo:** `feat/m0-visual` → `main`

> Plano **só** para a primeira sub-branch de M0. Cobre Fase A (fontes, paleta slate+emerald, 9 tokens tipográficos) + Fase B (motion utilities, `<Section>`, retrofit Hero/Skills/Experience/Education/Contact). Theme/i18n/navbar ficam para sub-branches seguintes — nada de `ThemeProvider`, `useTranslation`, `LocaleToggle`, `Navbar` aqui. Rotas, basename e dados localizados **inalterados**.

---

## 1. Pré-flight

Antes do primeiro commit:

1. `git checkout main && git pull --ff-only`
2. `git checkout -b feat/m0-visual`
3. `pnpm install --frozen-lockfile`
4. Confirmar baseline verde: `pnpm run lint && pnpm run typecheck && pnpm run test:run && pnpm run build`
5. Capturar screenshots "antes" das 5 superfícies (Hero, Skills, Experience, Education, Contact) em light + dark — referência para a checklist visual da §6.

---

## 2. Inventário de arquivos

### 2.1 Criar

| Caminho | Concern | Comentário |
|---------|---------|------------|
| `src/lib/motion.tsx` | MOT | `useInView<T>` + `<Reveal variant>` + map de variantes |
| `src/lib/motion.test.tsx` | MOT | Cobre `useInView` (mock `IntersectionObserver`) + `<Reveal>` |
| `src/components/Section.tsx` | VIS | Wrapper API rica (`id`, `eyebrow?`, `title?`, `subtitle?`, `as?`, `reveal?`, `className?`, `containerClassName?`) |
| `src/components/Section.test.tsx` | VIS | Header opcional, `as`, `reveal={false}`, axe |

### 2.2 Modificar

| Caminho | Concern | Mudança |
|---------|---------|---------|
| `package.json` | VIS | + `@fontsource-variable/geist`, + `@fontsource-variable/geist-mono` em `dependencies` |
| `pnpm-lock.yaml` | VIS | atualizado pelo `pnpm add` |
| `src/app.css` | VIS/MOT | `@import` Geist; nova paleta slate+emerald (light + dark); base `font-family`; keyframes + utilitárias `motion-*`; `prefers-reduced-motion` |
| `tailwind.config.js` | VIS | `extend.fontFamily.sans/mono`; `extend.fontSize` com 9 tokens |
| `src/components/Hero.tsx` | VIS | Trocar tokens tipográficos; **sem** `<Section>`; sem mudar conteúdo/i18n |
| `src/components/Skills.tsx` | VIS | Substituir `<section>` cabeçalho ad-hoc por `<Section>` |
| `src/components/Experience.tsx` | VIS | idem |
| `src/components/Education.tsx` | VIS | idem |
| `src/components/Contact.tsx` | VIS | idem |
| `src/components/Skills.test.tsx` | VIS | Ajustar queries afetadas pelo wrapper Section/Reveal (manter texto, atualizar classNames se asseridos) |
| `src/components/Experience.test.tsx` | VIS | idem |
| `src/components/Education.test.tsx` | VIS | idem |
| `src/components/Contact.test.tsx` | VIS | idem |
| `src/components/Hero.test.tsx` | VIS | Atualizar asserts que dependem dos tokens antigos (`text-4xl` etc.) |

### 2.3 Sem mudança nesta sub-branch

`src/routes/**`, `src/routes.ts`, `react-router.config.ts`, `src/root.tsx`, `src/data/*.json`, `src/lib/period.ts`, `src/lib/validation.ts`, `src/lib/contactSubmit.ts`, `src/lib/withBase.ts`, `src/lib/features.ts`, `src/types/**`, `src/components/ui/**`, todos os `e2e/*`, `index.html`, `scripts/*`, `docs/scaffolding-state.md`.

---

## 3. Conteúdo esperado por arquivo

### 3.1 `package.json` — diff conceitual

```diff
 "dependencies": {
+  "@fontsource-variable/geist": "^5",
+  "@fontsource-variable/geist-mono": "^5",
   "@emailjs/browser": "^4.4",
   ...
 }
```

Sem mudar `scripts`. `prebuild` continua só com `check-assets.ts`.

### 3.2 `src/app.css` — substituição integral

```css
@import "@fontsource-variable/geist/index.css";
@import "@fontsource-variable/geist-mono/index.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 160 84% 39%;            /* emerald-600 */
    --primary-foreground: 0 0% 100%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 160 60% 92%;
    --accent-foreground: 160 84% 22%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 160 84% 39%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 158 64% 52%;            /* emerald-400 */
    --primary-foreground: 144 80% 10%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 158 64% 22%;
    --accent-foreground: 158 64% 70%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 158 64% 52%;
  }
}

@layer base {
  html {
    scroll-behavior: smooth;
  }
  :root {
    font-family: "Geist Variable", system-ui, -apple-system, sans-serif;
  }
  code,
  pre,
  kbd,
  samp {
    font-family: "Geist Mono Variable", ui-monospace, monospace;
  }
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

@layer utilities {
  @keyframes mh-fade-in-up {
    from { opacity: 0; transform: translate3d(0, 16px, 0); }
    to   { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  @keyframes mh-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .motion-fade-in-up { animation: mh-fade-in-up 600ms cubic-bezier(0.16, 1, 0.3, 1) both; }
  .motion-fade-in    { animation: mh-fade-in    500ms ease-out both; }
}

@media (prefers-reduced-motion: reduce) {
  .motion-fade-in-up,
  .motion-fade-in {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 3.3 `tailwind.config.js` — diff conceitual

```diff
   extend: {
+    fontFamily: {
+      sans: ['"Geist Variable"', "system-ui", "sans-serif"],
+      mono: ['"Geist Mono Variable"', "ui-monospace", "monospace"],
+    },
+    fontSize: {
+      "display-2xl": ["clamp(2.75rem, 6vw, 5rem)",  { lineHeight: "1.05", letterSpacing: "-0.03em" }],
+      "display-xl":  ["clamp(2.25rem, 5vw, 4rem)",  { lineHeight: "1.1",  letterSpacing: "-0.025em" }],
+      "display-lg":  ["clamp(1.875rem, 4vw, 3rem)", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
+      "headline-lg": ["1.875rem", { lineHeight: "1.25" }],
+      "headline-md": ["1.5rem",   { lineHeight: "1.3"  }],
+      "headline-sm": ["1.25rem",  { lineHeight: "1.4"  }],
+      "body-lg":     ["1.125rem", { lineHeight: "1.65" }],
+      "body-md":     ["1rem",     { lineHeight: "1.6"  }],
+      "body-sm":     ["0.875rem", { lineHeight: "1.5"  }],
+    },
     colors: { /* existente */ },
     borderRadius: { /* existente */ },
   },
```

### 3.4 `src/lib/motion.tsx` — conteúdo final

Cópia direta do bloco em FRD §4.5:

```tsx
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
```

### 3.5 `src/lib/motion.test.tsx` — escopo dos testes

- `useInView`:
  - CT-M0-MOT-01: `inView === false` antes do observer disparar.
  - CT-M0-MOT-02: após callback do `IntersectionObserver` mock com `isIntersecting: true`, `inView === true`.
  - Cleanup: `disconnect` chamado em unmount + após primeira interseção.
- `Reveal`:
  - Estado inicial: wrapper tem `opacity-0`.
  - Após mock-trigger: wrapper recebe `motion-fade-in-up` (variant default).
  - `variant="fade-in"` mapeia para `motion-fade-in`.

Mock `IntersectionObserver` em `setupTests.ts`? Não — mock local, escopo do arquivo, evita poluir globalmente. Padrão: capturar o callback no construtor e expor `trigger(entries)`.

### 3.6 `src/components/Section.tsx` — conteúdo final

Cópia do bloco em FRD §4.4. Nota: `header` é renderizado quando ao menos um de `eyebrow`/`title`/`subtitle` é fornecido (a expressão `(eyebrow ?? title ?? subtitle)` cobre isso porque qualquer string trunca o `??`).

`<h2>` interno **não tem `id`**. Componentes legados usavam `aria-labelledby="<section>-title"`. A migração assume que a presença do `<h2>` dentro do `<section>` é suficiente para o landmark — `axe` aceita `<section>` sem `aria-labelledby` quando há heading interno. Ver decisão D-SEC-A na §7.

### 3.7 `src/components/Section.test.tsx` — escopo dos testes

- Render `<section id={id}>` com `eyebrow`, `title`, `subtitle` quando passados.
- Omite header quando nenhum dos três é passado.
- `as="article"` renderiza `<article>` no lugar de `<section>`.
- `reveal={false}` ⇒ wrapper externo `<Reveal>` não aparece (sem `opacity-0` inicial). Verifica via classe ausente.
- `axe(container)` sem violações.

### 3.8 `src/components/Hero.tsx` — diff conceitual

Mudanças exclusivamente de classes Tailwind nos três tokens:

```diff
-<h1 className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-6xl">
+<h1 className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-display-xl font-bold tracking-tight text-transparent md:text-display-2xl">
   {hero.displayName}
 </h1>
-<p className="text-xl font-medium text-primary/90 md:text-2xl">{hero.role}</p>
+<p className="text-headline-md font-medium text-primary/90 md:text-headline-lg">{hero.role}</p>
-<p className="max-w-xl text-lg leading-relaxed text-muted-foreground">{hero.tagline}</p>
+<p className="max-w-xl text-body-lg leading-relaxed text-muted-foreground">{hero.tagline}</p>
```

**Não** envolver em `<Section>` (RN-M0-06). Pill, gradient orbs, avatar, CTAs e socials inalterados. Pill `text-xs` mantido — ver decisão D-PILL-A.

### 3.9 `src/components/Skills.tsx` — retrofit para `<Section>`

Substitui `<section id="skills" aria-labelledby=...>` e o bloco header por `<Section>`. Mantém `CategoryGroup`, grids e badges.

```tsx
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Section } from "@/components/Section"
import type { Skill, SkillCategory } from "@/types/domain"

// TECHNICAL_CATEGORIES / PEDAGOGICAL_CATEGORY / CategoryGroup inalterados

export function Skills({ skills }: Props) {
  const technicalGroups = TECHNICAL_CATEGORIES.map((c) => ({
    ...c,
    items: skills.filter((s) => s.category === c.id),
  })).filter((g) => g.items.length > 0)

  const pedagogicalItems = skills.filter((s) => s.category === PEDAGOGICAL_CATEGORY.id)

  return (
    <Section
      id="skills"
      eyebrow="Stack & mentoria"
      title="Habilidades"
      subtitle="Stack técnico do dia-a-dia e o que ensino para quem está começando."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {technicalGroups.map((g) => (
          <CategoryGroup key={g.id} id={g.id} label={g.label} items={g.items} />
        ))}
      </div>
      {pedagogicalItems.length > 0 && (
        <div className="mt-6">
          <CategoryGroup
            id={PEDAGOGICAL_CATEGORY.id}
            label={PEDAGOGICAL_CATEGORY.label}
            items={pedagogicalItems}
          />
        </div>
      )}
    </Section>
  )
}
```

Strings PT permanecem aqui — i18n vem em `feat/m0-i18n`.

### 3.10 `src/components/Experience.tsx` — retrofit

```tsx
import { Section } from "@/components/Section"
// ExperienceCard inalterado

export function Experience({ experiences }: Props) {
  if (experiences.length === 0) return null
  return (
    <Section id="experience" eyebrow="Trajetória" title="Experiência">
      <ol className="grid auto-rows-fr gap-6 md:grid-cols-2">
        {experiences.map((item) => (
          <li key={`${item.company}-${item.startDate}`} className="h-full">
            <ExperienceCard item={item} />
          </li>
        ))}
      </ol>
    </Section>
  )
}
```

Mantém `formatPeriod(item.startDate, item.endDate)` (assinatura atual, sem `locale`). Refator i18n acontece em Fase D.

### 3.11 `src/components/Education.tsx` — retrofit

```tsx
import { Section } from "@/components/Section"
// EducationCard inalterado

export function Education({ items }: Props) {
  if (items.length === 0) return null
  return (
    <Section id="education" eyebrow="Formação" title="Educação">
      <ol className="grid auto-rows-fr gap-6 md:grid-cols-2">
        {items.map((item) => (
          <li key={`${item.institution}-${item.startDate}`} className="h-full">
            <EducationCard item={item} />
          </li>
        ))}
      </ol>
    </Section>
  )
}
```

Pequena mudança de spacing: Section usa `py-16 md:py-24`; Education usava `pb-20 md:pb-28` (sem `pt`). Aceito — mantém ritmo vertical consistente entre seções. Ver decisão D-SPACE-A.

### 3.12 `src/components/Contact.tsx` — retrofit

```tsx
import { Section } from "@/components/Section"
import { ContactForm } from "@/components/ContactForm"

export function Contact({ email, linkedinUrl, onSubmit }: Props) {
  return (
    <Section
      id="contact"
      eyebrow="Fale comigo"
      title="Contato"
      subtitle="Tem um projeto, vaga ou conversa técnica em mente? Envie uma mensagem abaixo ou use os canais alternativos."
    >
      <div className="mx-auto max-w-3xl space-y-8">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-body-sm">
          <li>
            <a
              href={`mailto:${email}`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {email}
            </a>
          </li>
          <li>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              LinkedIn
            </a>
          </li>
        </ul>
        <div className="rounded-xl border bg-card/60 p-6 shadow-sm backdrop-blur md:p-8">
          <ContactForm onSubmit={onSubmit} />
        </div>
      </div>
    </Section>
  )
}
```

`text-sm` → `text-body-sm` para consistência com os novos tokens. `ContactForm.tsx` não muda nesta sub-branch.

### 3.13 Ajustes nos `.test.tsx` existentes

Foco: testes que asseridos em classes Tailwind ou que dependem de `<section aria-labelledby>` quebram. Texto em PT permanece igual — `getByText("Habilidades")`, etc. continuam válidos.

- `Skills.test.tsx`: `getByRole("region", { name: /habilidades/i })` continua válido se `axe` aceitar `<section>` com `<h2>` interno (sem `aria-labelledby`). Se o RTL exigir `name`, trocar para `getByRole("heading", { name: /habilidades/i })`. Mesmo para Experience/Education/Contact.
- `Hero.test.tsx`: qualquer asserção em `text-4xl` / `text-6xl` migra para `text-display-xl` / `text-display-2xl`. Evitar — preferir queries por role/texto.

Re-rodar `pnpm test:run` após cada migração; consertar exclusivamente o teste afetado.

---

## 4. Mapa commit → arquivos

Conventional Commits em inglês (AGENTS.md §7). Subject ≤ 72 chars. Cada commit roda pre-commit (`lint-staged → typecheck → test:run`) — não usar `--no-verify`.

### Fase A

| # | Subject | Arquivos tocados | Verificação |
|---|---------|------------------|-------------|
| 1 | `chore(deps): add Geist Variable fonts` | `package.json`, `pnpm-lock.yaml` | `pnpm install --frozen-lockfile` |
| 2 | `feat(style): wire Geist and font-family tokens` | `src/app.css` (`@import` + `:root font-family` + `code/pre` selector), `tailwind.config.js` (`fontFamily.sans/mono`) | `pnpm dev` confirma fonte aplicada |
| 3 | `feat(style): swap palette to slate + emerald` | `src/app.css` (`:root` + `.dark` HSL vars) | Inspeção visual light + dark; checagem contraste WCAG AA |
| 4 | `feat(style): add typography size tokens` | `tailwind.config.js` (`fontSize` 9 tokens) | `pnpm typecheck`; Hero ainda usa tokens antigos — sem regressão |
| 5 | `refactor(hero): migrate to new typography tokens` | `src/components/Hero.tsx`, `src/components/Hero.test.tsx` (se necessário) | `pnpm test:run`; screenshot Hero antes/depois |

### Fase B

| # | Subject | Arquivos tocados | Verificação |
|---|---------|------------------|-------------|
| 6 | `feat(motion): add motion utilities` | `src/lib/motion.tsx`, `src/lib/motion.test.tsx`, `src/app.css` (keyframes + utilitárias `motion-*` + `prefers-reduced-motion`) | `pnpm test:run` cobre `useInView` e `Reveal`; `pnpm test:coverage` mantém `motion.tsx` ≥ 90% (linha do `if (!el) return` aceita) |
| 7 | `feat(ui): add Section wrapper` | `src/components/Section.tsx`, `src/components/Section.test.tsx` | `pnpm test:run` cobre todos os cenários §3.7 |
| 8 | `refactor(skills): migrate to Section` | `src/components/Skills.tsx`, `src/components/Skills.test.tsx` | `pnpm test:run`; visual idêntico |
| 9 | `refactor(experience): migrate to Section` | `src/components/Experience.tsx`, `src/components/Education.tsx`, `src/components/Experience.test.tsx`, `src/components/Education.test.tsx` | Idem |
| 10 | `refactor(contact): migrate to Section` | `src/components/Contact.tsx`, `src/components/Contact.test.tsx` | Idem |

Total: **10 commits** (alinhado a FRD §11 commits 1-10).

> Education entra no commit 9 com Experience por economia — ambos seguem o mesmo padrão de retrofit e compartilham `formatPeriod`. Atomicidade preservada: um commit, um conceito ("migrate timeline sections to Section wrapper").

---

## 5. Coverage e gates

- `motion.tsx` é novo `src/lib/` ⇒ AGENTS.md §6 exige TDD + alvo de cobertura. Não é nominalmente listado nos 100% obrigatórios (`filterProjects.ts`, `validation.ts`), mas mantém o piso global ≥ 70%. Buscar 100% no possível; branches de `if (!el) return` cobertas via render sem nó.
- `vitest.config.ts` atualmente exclui `src/routes/**`, `src/components/ui/**`, `src/lib/cn.ts`. **Não** adicionar `motion.tsx` ao exclude.
- `Section.tsx` mora em `src/components/` (não `ui/`), entra no escopo de cobertura global.
- Validar local antes do push: `pnpm run test:coverage`.

---

## 6. Merge checklist `feat/m0-visual` → `main` (FRD §11.1)

- [ ] `pnpm run lint` exit 0
- [ ] `pnpm run typecheck` exit 0
- [ ] `pnpm run test:run` exit 0 (todos os specs RTL + lib verdes)
- [ ] `pnpm run test:coverage` mantém o piso global e não regride os 100% obrigatórios
- [ ] `pnpm run build` exit 0 (prebuild `check-assets.ts` continua passando)
- [ ] Comparação visual manual (Hero, Skills, Experience, Education, Contact) light + dark — screenshots antes/depois lado a lado
- [ ] Contraste WCAG AA validado para:
  - `primary` (160 84% 39%) vs `primary-foreground` (0 0% 100%) — modo claro
  - `primary` (158 64% 52%) vs `primary-foreground` (144 80% 10%) — modo escuro
  - `foreground` vs `background` em ambos os modos
  - `muted-foreground` vs `background` em ambos os modos
- [ ] `prefers-reduced-motion` testado (DevTools → Rendering → Emulate `reduce`) — seções aparecem sem `opacity-0` inicial
- [ ] Sem regressão de E2E local (`pnpm e2e`)
- [ ] PR aberto contra `main`, CI verde
- [ ] Merge `--ff-only` ou squash (manter histórico atômico se `--ff-only`)
- [ ] Branch local apagada após merge

---

## 7. Riscos e decisões pendentes (precisam do seu aval **antes** de codar)

| ID | Item | Pergunta | Recomendação |
|----|------|----------|--------------|
| **D-CONTRAST-A** | Contraste do emerald-600 (160 84% 39%) com texto branco em CTAs primárias | Os HSL do FRD são "alvos" (FRD §12). Aceita ajustar para 160 84% 35% se medição falhar AA? | Sim — qualquer ajuste é cosmético; documentar valor final em commit 3 |
| **D-SEC-A** | `<Section>` renderiza `<h2>` sem `id`; componentes legados usam `aria-labelledby="<section>-title"` | Vamos confiar no heading interno (axe aceita) ou estender Section com prop `aria-labelledby`? | Confiar no heading interno — axe + RTL `getByRole("heading")` cobrem. Mantém a API enxuta. |
| **D-PILL-A** | Pill "Disponível para projetos e mentorias" no Hero usa `text-xs` | Migrar para `text-body-sm` (0.875rem) ou manter `text-xs` (0.75rem)? | Manter `text-xs` — pill é caption denso, não cabe no escopo dos 9 tokens body. |
| **D-SPACE-A** | Section usa `py-16 md:py-24`; Education hoje usa só `pb-20 md:pb-28` (sem `pt`) | Ok unificar para o ritmo padrão da Section, ou preservar a justaposição Experience+Education sem padding-top? | Unificar via Section — ritmo consistente entre seções. Se ficar muito espaço entre Experience e Education, abrir issue após merge. |
| **D-MOTION-A** | `<Section reveal>` aplica `opacity-0` inicial; jsdom não dispara IntersectionObserver | Aceita que testes RTL precisem mockar IO (ou renderizar com `reveal={false}` quando texto for inspecionado)? | Sim — `setupTests.ts` pode mockar IO globalmente (`global.IntersectionObserver = MockIO`). Já é prática em vitest-axe testes de in-view. |
| **D-FOUT-A** | Fontes Geist via `@fontsource-variable` ainda permitem FOUT no primeiro paint | Adicionar `<link rel="preload">` em `index.html`? | **Não** nesta sub-branch — antifouc é tema de Phase C (`feat/m0-theme`); fonte é menos crítico que tema. Tratar como item aberto pós-M0 se notado. |

Se algum item acima divergir do recomendado, **avise antes do commit 1** — D-SEC-A e D-MOTION-A afetam Section/motion direto; D-CONTRAST-A afeta commit 3.

---

## 8. Out-of-scope desta sub-branch (não cair em escopo)

Reaviso para evitar drift:

- `ThemeProvider`, `ThemeToggle`, anti-FOUC script — `feat/m0-theme`.
- `useTranslation`, `i18next`, dicionário, `LocaleToggle`, split de dados, basename `/portfolio/`, `_root-redirect`, `$lang.tsx` — `feat/m0-i18n`.
- `Navbar`, `SkipLink`, `Brand`, `MobileMenu`, `useScrolled`, `useScrollSpy`, `Sheet` — `feat/m0-navbar`.
- Refatorar `formatPeriod` para receber `locale` — `feat/m0-i18n`.
- Atualizar `docs/scaffolding-state.md` para M0 entregue — só no merge da última sub-branch.

---

## 9. Histórico

| Versão | Data | Mudança |
|--------|------|---------|
| 0.1.0 | 2026-05-15 | Blueprint inicial derivado da FRD v0.2.0 §11 (commits 1-10) + leitura dos componentes a retrofittear. |
