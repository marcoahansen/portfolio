# Blueprint — `feat/m0-navbar` (Fase E + F.4 do FRD M0)

**Versão:** 0.1.0
**Status:** Draft — aguardando aval das decisões §7 antes de implementar
**FRD de origem:** `docs/features/m0-infra/frd-m0-infra.md` (v0.2.0)
**Handoff anterior:** `docs/features/m0-infra/handoff-m0.md` v0.4.0
**Branch base:** `main` (HEAD `bbab54a` — merge de `feat/m0-i18n`)
**Branch alvo:** `feat/m0-navbar` → `main` (último PR antes de fechar M0)

> Plano da **última** sub-branch de M0. Cobre Fase E (Navbar + SkipLink + Brand + MobileMenu + `useScrolled` + `useScrollSpy` + Sheet primitive) e Fase F.4 (E2E navbar + skip-link + sheet mobile + reconciliação documental + `docs/scaffolding-state.md`). Realoca os dois toggles (`ThemeToggle` + `LocaleToggle`) do wrapper provisório em `root.tsx` para dentro do `Navbar`, removendo os marcadores `data-temporary-theme-toggle` e `data-temporary-locale-toggle`.

---

## 1. Pré-flight

Antes do primeiro commit de implementação (commit de blueprint já está aplicado como `eae8c7b`):

1. `git status` na branch `feat/m0-navbar` — só o commit de handoff bump (`eae8c7b`) deve estar à frente de `main` (`bbab54a`).
2. `pnpm install --frozen-lockfile`.
3. Baseline verde: `pnpm run lint && pnpm run typecheck && pnpm run test:run && pnpm run build && pnpm e2e`.
4. Confirmar que `lucide-react@^1.14.0` resolve `Menu`, `X`, `Globe` (já em uso no `LocaleToggle`), e que `Sun`/`Moon` continuam resolvendo (`ThemeToggle` em produção). Comando: `node -e 'import("lucide-react").then(m => console.log("Menu", typeof m.Menu, "X", typeof m.X, "Globe", typeof m.Globe))'`. Se falhar, ver D-LUCIDE-VERSION (§7).
5. Confirmar que o wrapper provisório em `src/root.tsx` ainda contém **ambos** os atributos marcadores (`data-temporary-theme-toggle` **e** `data-temporary-locale-toggle`) e o wrapper só será removido nesta sub-branch — `grep -n "data-temporary-" src/root.tsx` deve devolver as 2 ocorrências.
6. Capturar screenshot baseline do app em `/pt/` light e dark com viewport desktop (1280) **e** mobile (375) — referência para checklist visual da navbar.
7. Confirmar que `e2e/m0-infra.spec.ts` tem 7 testes atualmente (3 theme + 4 i18n) — após esta sub-branch fechará com ≥ 12 (adiciona ≥ 5 testes navbar/skip-link/sheet).

---

## 2. Inventário de arquivos

### 2.1 Criar

| Caminho | Concern | Comentário |
|---------|---------|------------|
| `src/components/ui/sheet.tsx` | NAV | Gerado por `pnpm dlx shadcn@latest add sheet`. **Não** editar à mão (AGENTS.md `src/components/ui/**` é vendor). |
| `src/components/Brand.tsx` | NAV | Monograma "MH" como SVG inline + `Link` para `/{lang}/`. |
| `src/components/Brand.test.tsx` | NAV | Render, target, axe. |
| `src/components/SkipLink.tsx` | NAV | `sr-only` → `focus:not-sr-only`, target `#main`. |
| `src/components/SkipLink.test.tsx` | NAV | Render, target, classes, axe. |
| `src/components/Navbar.tsx` | NAV | Sticky header + items por rota + toggles + mobile trigger. |
| `src/components/Navbar.test.tsx` | NAV | Items por rota (`/pt`, `/pt/projects`), scrollspy active state, axe. |
| `src/components/MobileMenu.tsx` | NAV | Sheet trigger (hamburger) + content (items + toggles + brand). |
| `src/components/MobileMenu.test.tsx` | NAV | Trigger abre Sheet, ESC fecha, items + toggles presentes, axe. |
| `src/lib/scroll.ts` | NAV | `useScrolled(threshold = 8)` — boolean derivado de `window.scrollY`. |
| `src/lib/scroll.test.ts` | NAV | Mock `window.scrollY` + `scroll` event; cobre threshold, cleanup, SSR-guard. |
| `src/lib/scrollSpy.ts` | NAV | `useScrollSpy(ids)` — string \| null via IntersectionObserver. |
| `src/lib/scrollSpy.test.ts` | NAV | IntersectionObserver mockado (igual `motion.test.tsx`); cobre múltiplos ids, último intersecting vence, cleanup. |

### 2.2 Modificar

| Caminho | Concern | Mudança |
|---------|---------|---------|
| `src/root.tsx` | NAV | Remover wrapper `<div data-temporary-theme-toggle data-temporary-locale-toggle>` e seus filhos. Adicionar `<SkipLink />` + `<Navbar />` antes de `<Outlet />`. `ThemeProvider` continua envolvendo tudo. |
| `src/i18n/locales/pt/translation.json` | NAV | Adicionar `nav.home` (label do brand em screen-reader, ex: `"Início"`) **se** decidirmos rotular o link do Brand. `nav.skills`/`nav.experience`/`nav.contact`/`nav.backHome`/`a11y.openMenu`/`a11y.closeMenu`/`a11y.skipToContent` já existem (verificado). |
| `src/i18n/locales/en/translation.json` | NAV | Paridade do item acima. |
| `e2e/m0-infra.spec.ts` | NAV (Phase F.4) | Adicionar `test.describe("M0 — navbar")` com ≥ 5 testes (skip-link, sticky transition, mobile sheet, scrollspy active, "← Início" em `/pt/projects`). |
| `e2e/_helpers.ts` | NAV | Adicionar `navHeader`, `mobileMenuTrigger`, `skipLink` helpers. |
| `docs/features/m0-infra/frd-m0-infra.md` | Doc reconciliação | §4.4 atualiza fonte default para Geist Mono + display Asimovian; §4.5 atualiza timings para 900/700ms e easing aplicado. §13 ganha entrada v0.3.0 documentando reconciliação. |
| `docs/features/m0-infra/blueprint-m0-visual.md` | Doc reconciliação | Idem (timings 900/700ms, fonts confirmadas). |
| `docs/scaffolding-state.md` | Doc | Registrar entrega completa de M0 (FRD §11 Fase F.4 final). Atualizar versão + seção referente a infra. |
| `docs/features/m0-infra/handoff-m0.md` | Doc | Bump para 1.0.0 no fim, marcando sub-branch 4 ✅ e M0 fechado (ver commit final da branch). |

### 2.3 Sem mudança nesta sub-branch

`src/lib/{theme,motion,data,period,validation,cn,withBase,filterProjects,contactSubmit,useIsHydrated}.tsx?`, `src/components/{Hero,Skills,Experience,Education,Contact,ContactForm,Section,ThemeToggle,LocaleToggle}.tsx`, `src/components/ui/{badge,button,card,input,textarea}.tsx`, `src/data/**`, `src/i18n/index.ts`, `src/types/**`, `src/routes/**`, `src/routes.ts`, `react-router.config.ts`, `index.html`, `tailwind.config.js`, `src/app.css`, `package.json` (sem novas deps além das geradas por shadcn — ver D-SHEET-INSTALL), `scripts/*`, `tsconfig*.json`, `vitest.config.ts`, `playwright.config.ts`. **`ThemeToggle.tsx` e `LocaleToggle.tsx` permanecem intocados** — só mudam de container.

---

## 3. Conteúdo esperado por arquivo

### 3.1 `src/lib/scroll.ts` — `useScrolled`

```ts
import { useEffect, useState } from "react"

export function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState<boolean>(() => {
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
```

Notas:
- Initializer lê `window.scrollY` se já houver montagem com scroll (navegação com âncora preservada).
- `passive: true` evita warning de performance em mobile.
- `onScroll()` chamado uma vez dentro do effect para reconciliar caso o initializer tenha rodado em SSR (`scrolled = false`).
- SSR-guard via `typeof window === "undefined"`. `/* c8 ignore next */` no early-return — jsdom não exercita.

### 3.2 `src/lib/scroll.test.ts`

Mock `window.scrollY` via `Object.defineProperty` por teste (jsdom não permite atribuição direta). Dispara `scroll` event manualmente.

Casos mínimos:

| ID | Cenário | Asserção |
|----|---------|----------|
| CT-M0-SCR-01 | `scrollY=0`, threshold=8 | `scrolled === false` no primeiro render |
| CT-M0-SCR-02 | `scrollY=20`, threshold=8, scroll event | `scrolled === true` após event |
| CT-M0-SCR-03 | Toggle 20 → 0 via 2 events | `scrolled` transita true → false |
| CT-M0-SCR-04 | threshold customizado (50) | scroll 30 → false; scroll 60 → true |
| CT-M0-SCR-05 | Cleanup | `removeEventListener` chamado no unmount (spy no `window.removeEventListener`) |

Cobertura alvo: 100% (exceto SSR-guard com pragma).

### 3.3 `src/lib/scrollSpy.ts` — `useScrollSpy`

Implementação alinhada a FRD §4.1. Última seção a entrar no viewport (último `setActive`) vence (RN-M0-11).

```ts
import { useEffect, useState } from "react"

export function useScrollSpy(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
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
```

Notas:
- **Passar `ids` como `as const`** no call site (`Navbar.tsx`) para que a referência seja estável e o `useEffect` não re-execute em cada render. Se for derivado dinamicamente, memoizar com `useMemo`.
- `rootMargin` espreme a "janela ativa" para o meio da viewport (40% topo + 55% fundo descartados, 5% restante é a zona ativa).
- Não usa `entry.target.id` direto porque o tipo `IntersectionObserverEntry` em jsdom mockado fica pobre — preferir captura via closure do `for`.
- Sem cleanup do `active` no unmount — desnecessário porque o consumidor desmontaria junto.

### 3.4 `src/lib/scrollSpy.test.ts`

Padrão do mock alinhado com `src/lib/motion.test.tsx` (já valida `IntersectionObserver` em jsdom).

```ts
class MockIO implements IntersectionObserver {
  static instances: Array<{
    callback: IntersectionObserverCallback
    el: Element
  }> = []
  constructor(public callback: IntersectionObserverCallback) {}
  observe = (el: Element) => {
    MockIO.instances.push({ callback: this.callback, el })
  }
  disconnect = vi.fn()
  unobserve = vi.fn()
  takeRecords = () => []
  root = null
  rootMargin = ""
  thresholds = []
}
```

Casos mínimos:

| ID | Cenário | Asserção |
|----|---------|----------|
| CT-M0-SPY-01 | `ids=[]` | `active === null`; nenhum observer criado |
| CT-M0-SPY-02 | `ids=["a","b"]`, ambos existem, callback "a" intersecting | `active === "a"` |
| CT-M0-SPY-03 | callbacks em ordem "a" → "b" intersecting | `active === "b"` (último vence — RN-M0-11) |
| CT-M0-SPY-04 | id sem `getElementById` correspondente | observer não criado para esse id, sem throw |
| CT-M0-SPY-05 | Cleanup | `disconnect` chamado para cada observer no unmount |

Cobertura alvo: 100%.

### 3.5 `src/components/Brand.tsx`

```tsx
import { Link, useParams } from "react-router"
import { cn } from "@/lib/cn"
import { isLocale } from "@/i18n"

type Props = { className?: string }

export function Brand({ className }: Props) {
  const { lang } = useParams()
  const locale = isLocale(lang) ? lang : "pt"
  return (
    <Link
      to={`/${locale}/`}
      aria-label="Marco Hansen"
      className={cn(
        "inline-flex items-center gap-2 font-display text-headline-md font-bold tracking-wider text-foreground transition-opacity hover:opacity-80",
        className,
      )}
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="size-7 text-primary"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* M */}
        <path d="M4 26 L4 6 L10 18 L16 6 L16 26" />
        {/* H */}
        <path d="M20 6 L20 26 M28 6 L28 26 M20 16 L28 16" />
      </svg>
      <span className="sr-only md:not-sr-only">MH</span>
    </Link>
  )
}
```

Notas:
- Texto "MH" só visível ≥ md (mobile mostra só o monograma SVG para economizar espaço); screen-reader sempre lê via `aria-label="Marco Hansen"` no `<Link>`.
- `font-display` usa Asimovian (decisão de `feat/m0-visual`, divergência reconciliada nesta sub-branch).
- Cor primária para o SVG (emerald).
- Target dinâmico via `useParams()` — em rotas children de `$lang.tsx`, `lang` sempre presente. Em `/` (root-redirect), `useParams()` retorna `{}` → fallback `pt`.

### 3.6 `src/components/Brand.test.tsx`

| ID | Cenário | Asserção |
|----|---------|----------|
| CT-M0-BR-01 | Render em `/pt/` | `<a>` `href="/portfolio/pt/"` (basename inclui prefixo) |
| CT-M0-BR-02 | Render em `/en/projects` | `<a>` `href="/portfolio/en/"` |
| CT-M0-BR-03 | aria-label | `"Marco Hansen"` presente |
| CT-M0-BR-04 | axe | Sem violações |

Helper de render envolve em `<MemoryRouter initialEntries={[path]}>` + rota fake `<Routes>` configurando `useParams`. Padrão idêntico ao usado em `LocaleToggle.test.tsx`.

### 3.7 `src/components/SkipLink.tsx`

```tsx
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/cn"

export function SkipLink() {
  const { t } = useTranslation()
  return (
    <a
      href="#main"
      className={cn(
        "sr-only fixed left-2 top-2 z-[60] rounded-md bg-background px-3 py-2",
        "text-body-sm font-medium ring-2 ring-ring",
        "focus:not-sr-only focus:outline-none",
      )}
    >
      {t("a11y.skipToContent")}
    </a>
  )
}
```

Notas:
- `z-[60]` acima da navbar (`z-50`).
- `#main` é o id de `<main>` em todas as rotas (`$lang._index.tsx`, `$lang.projects._index.tsx`, `$lang.projects.$id.tsx` — confirmado).
- Foco visível obrigatório (`ring-2 ring-ring`). `focus:outline-none` substitui o outline default por um ring estilizado.

### 3.8 `src/components/SkipLink.test.tsx`

| ID | Cenário | Asserção |
|----|---------|----------|
| CT-M0-SK-01 | Render | `<a href="#main">` com texto traduzido (`/pular/i`) |
| CT-M0-SK-02 | Classes | inclui `sr-only` e `focus:not-sr-only` |
| CT-M0-SK-03 | axe | Sem violações |

i18n test wrapper já está pronto (via `src/setupTests.ts` importa `@/i18n`).

### 3.9 `src/components/Navbar.tsx`

Estrutura conforme FRD §4.1 com adições/divergências documentadas:

```tsx
import { Link, useLocation, useParams } from "react-router"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/cn"
import { isLocale } from "@/i18n"
import { FEATURES } from "@/lib/features"
import { useScrolled } from "@/lib/scroll"
import { useScrollSpy } from "@/lib/scrollSpy"
import { Brand } from "@/components/Brand"
import { LocaleToggle } from "@/components/LocaleToggle"
import { ThemeToggle } from "@/components/ThemeToggle"
import { MobileMenu } from "@/components/MobileMenu"

type NavAnchor = { id: string; labelKey: string }

const HOME_ANCHORS: readonly NavAnchor[] = [
  { id: "skills", labelKey: "nav.skills" },
  { id: "experience", labelKey: "nav.experience" },
  { id: "contact", labelKey: "nav.contact" },
] as const

const HOME_SPY_IDS = HOME_ANCHORS.map((a) => a.id) as readonly string[]

function isHome(pathname: string, lang: string): boolean {
  return pathname === `/${lang}` || pathname === `/${lang}/`
}

export function Navbar() {
  const { t } = useTranslation()
  const { lang } = useParams()
  const { pathname } = useLocation()
  const locale = isLocale(lang) ? lang : "pt"
  const onHome = isHome(pathname, locale)
  const scrolled = useScrolled(8)

  const visibleAnchors = useMemo(
    () =>
      HOME_ANCHORS.filter((a) => {
        if (a.id === "skills") return FEATURES.skills
        if (a.id === "experience") return FEATURES.experience
        if (a.id === "contact") return FEATURES.contact
        return false
      }),
    [],
  )

  const activeId = useScrollSpy(onHome ? HOME_SPY_IDS : [])

  return (
    <header
      data-scrolled={scrolled ? "true" : "false"}
      className={cn(
        "sticky top-0 z-50 transition-colors duration-200",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Brand />

        <nav className="hidden md:block" aria-label={t("a11y.openMenu")}>
          {onHome ? (
            <ul className="flex items-center gap-1">
              {visibleAnchors.map((a) => {
                const isActive = activeId === a.id
                return (
                  <li key={a.id}>
                    <a
                      href={`#${a.id}`}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "rounded-md px-3 py-2 text-body-sm transition-colors",
                        isActive
                          ? "font-medium text-primary"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {t(a.labelKey)}
                    </a>
                  </li>
                )
              })}
            </ul>
          ) : (
            <Link
              to={`/${locale}/`}
              className="rounded-md px-3 py-2 text-body-sm text-muted-foreground hover:text-foreground"
            >
              {t("nav.backHome")}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-1">
          <div className="hidden items-center gap-1 md:flex">
            <LocaleToggle />
            <ThemeToggle />
          </div>
          <MobileMenu
            onHome={onHome}
            locale={locale}
            visibleAnchors={visibleAnchors}
            activeId={activeId}
            className="md:hidden"
          />
        </div>
      </div>
    </header>
  )
}
```

Decisões dentro do componente:
- **`activeId` sempre chamado** (regra de hooks); só passa `ids` populados quando em home, evitando observers em `/projects*`.
- **`HOME_ANCHORS` mantém só `skills`, `experience`, `contact`** (não `education`) — FRD §4.1/§6 explicita. `Education` continua sendo seção visível na home, só não é destino de navegação. Confirmar D-NAV-EDUCATION (§7).
- **`aria-current="true"`** no anchor ativo (acessibilidade do scrollspy — RN-M0-11).
- **`data-scrolled`** facilita E2E (espera por `[data-scrolled="true"]` em vez de aferir classes Tailwind voláteis).
- **Brand sempre visível**, mobile só mostra o monograma SVG (texto "MH" oculto em `<md`).
- `<header>` renderiza sempre que `<Outlet />` renderiza; é montado em `root.tsx` para cobrir rotas index e `/projects*`.

### 3.10 `src/components/Navbar.test.tsx`

Render com `<MemoryRouter initialEntries={["/pt/"]}>` + rota fake equivalente. Mock `IntersectionObserver` e `window.matchMedia` (já em `setupTests.ts`). Mock `window.scrollY` por teste para `useScrolled`.

Casos mínimos:

| ID | Cenário | Asserção |
|----|---------|----------|
| CT-M0-NV-01 | `/pt/`, flags default | Renderiza Brand link `/portfolio/pt/`; lista com 3 anchors (`Habilidades`, `Experiência`, `Contato`) |
| CT-M0-NV-02 | `/en/`, flags default | Mesma estrutura com labels EN (`Skills`, `Experience`, `Contact`) |
| CT-M0-NV-03 | `/pt/projects` | Renderiza link "← Início" para `/portfolio/pt/`; nenhuma lista de anchors |
| CT-M0-NV-04 | `/pt/`, `FEATURES.experience = false` (override via test) | Anchor `experience` ausente; Skills + Contact presentes |
| CT-M0-NV-05 | LocaleToggle + ThemeToggle presentes | Existem 2 botões com aria-labels esperados (já cobertos por seus próprios testes; aqui só asserir presença) |
| CT-M0-NV-06 | Scroll 0 → 100 (mock) | `<header>` ganha `data-scrolled="true"` |
| CT-M0-NV-07 | Scrollspy callback marca `skills` | Anchor `Habilidades` recebe `aria-current="true"` e `text-primary` |
| CT-M0-NV-08 | Mobile viewport (mock `matchMedia(max-width: 767px)` matches=true) | Mobile trigger visível, desktop nav oculto (asserir classes ou via roles) |
| CT-M0-NV-09 | axe | Sem violações em `/pt/` e em `/pt/projects` |

Mock global de `FEATURES` via `vi.mock("@/lib/features", () => ({ FEATURES: { ... } }))` por bloco.

### 3.11 `src/components/MobileMenu.tsx`

```tsx
import { Link } from "react-router"
import { useState } from "react"
import { Menu } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/cn"
import { LocaleToggle } from "@/components/LocaleToggle"
import { ThemeToggle } from "@/components/ThemeToggle"

type Anchor = { id: string; labelKey: string }

type Props = {
  onHome: boolean
  locale: "pt" | "en"
  visibleAnchors: readonly Anchor[]
  activeId: string | null
  className?: string
}

export function MobileMenu({
  onHome,
  locale,
  visibleAnchors,
  activeId,
  className,
}: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("a11y.openMenu")}
          className={className}
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle className="font-display tracking-wider">MH</SheetTitle>
        </SheetHeader>

        {onHome ? (
          <ul className="mt-6 flex flex-col gap-1">
            {visibleAnchors.map((a) => {
              const isActive = activeId === a.id
              return (
                <li key={a.id}>
                  <a
                    href={`#${a.id}`}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "block rounded-md px-3 py-2 text-body-md transition-colors",
                      isActive
                        ? "font-medium text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t(a.labelKey)}
                  </a>
                </li>
              )
            })}
          </ul>
        ) : (
          <Link
            to={`/${locale}/`}
            onClick={() => setOpen(false)}
            className="mt-6 block rounded-md px-3 py-2 text-body-md text-muted-foreground hover:text-foreground"
          >
            {t("nav.backHome")}
          </Link>
        )}

        <div className="mt-6 flex items-center gap-2 border-t border-border pt-6">
          <LocaleToggle />
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

Notas:
- **Reusa as instâncias compartilhadas** de `LocaleToggle` e `ThemeToggle` (Sheet primitive de shadcn usa Portal → ambos vivem fora da DOM do Navbar; sem problema de duplicate state — `ThemeProvider` é único).
- **`onClick={() => setOpen(false)}`** em todos os anchors/links — UX comum em mobile sheet.
- `side="right"` (FRD §4.1).
- `SheetTitle` obrigatório para acessibilidade do Sheet de shadcn (sem ele, axe reclama de "missing accessible name" no Dialog).
- **Trigger é o único elemento que respeita `className` externo** (`md:hidden` vem do Navbar) — `SheetContent` e demais ficam visíveis só com o trigger.

### 3.12 `src/components/MobileMenu.test.tsx`

Render dentro de `<MemoryRouter>`. Sheet de shadcn usa Radix Dialog; precisa de `pointer-events` workaround comum em testes do Radix (`document.body.style.pointerEvents = ""` no `beforeEach` se necessário).

| ID | Cenário | Asserção |
|----|---------|----------|
| CT-M0-MM-01 | Render inicial | Sheet fechado (conteúdo não no DOM ou `aria-hidden`) |
| CT-M0-MM-02 | Click no trigger | Sheet abre; items visíveis (`getByRole("menuitem"|"link")` ou aria-label do botão) |
| CT-M0-MM-03 | ESC fecha (`userEvent.keyboard("{Escape}")`) | Sheet fechado |
| CT-M0-MM-04 | Click em anchor home | Sheet fecha |
| CT-M0-MM-05 | `onHome=false` | Mostra "← Início" link, não a lista |
| CT-M0-MM-06 | LocaleToggle + ThemeToggle presentes dentro do Sheet | Botões com aria-labels esperados |
| CT-M0-MM-07 | axe (Sheet aberto) | Sem violações |

Se axe reclamar de Radix internals fora do nosso controle, documentar em D-AXE-RADIX (§7). Alternativa: snapshotar mais leniente ou só asserir presença/acessibilidade dos nossos elementos.

### 3.13 `src/root.tsx` — wiring final

```tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router"
import type { ReactNode } from "react"
import { ThemeProvider } from "@/lib/theme"
import { Navbar } from "@/components/Navbar"
import { SkipLink } from "@/components/SkipLink"
import "@/i18n"
import "./app.css"

const themeBootstrap = `(function(){try{var t=localStorage.getItem("mh-theme");var d=t==="dark"||(t===null&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark");}catch(_){}})();`

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function Root() {
  return (
    <ThemeProvider>
      <SkipLink />
      <Navbar />
      <Outlet />
    </ThemeProvider>
  )
}
```

Diff vs estado atual (`feat/m0-navbar` pré-implementação):
- **Remove** imports diretos de `ThemeToggle` e `LocaleToggle` (vivem agora dentro do Navbar/MobileMenu).
- **Remove** o wrapper `<div className="fixed right-4 top-4 z-50 flex items-center gap-2" data-temporary-theme-toggle data-temporary-locale-toggle>` e seus filhos.
- **Adiciona** `import { Navbar } from "@/components/Navbar"` + `import { SkipLink } from "@/components/SkipLink"`.
- **Adiciona** `<SkipLink />` e `<Navbar />` antes de `<Outlet />`.

`grep -n "data-temporary-" src/root.tsx` deve retornar **zero** após o commit de wiring.

### 3.14 Dicionário — adição mínima

`src/i18n/locales/pt/translation.json` e `en/translation.json` já têm `nav.skills`, `nav.experience`, `nav.contact`, `nav.backHome`, `a11y.skipToContent`, `a11y.openMenu`, `a11y.closeMenu`. **Não precisa adicionar chaves** se Brand não tiver label traduzível (usamos string fixa "Marco Hansen" via `aria-label`, que é nome próprio e não tradução de UI). Decisão D-BRAND-ARIA (§7) avalia se isso é aceitável.

### 3.15 `e2e/m0-infra.spec.ts` — Phase F.4

Adicionar bloco navbar **mantendo** os 7 testes existentes (3 theme + 4 i18n). Total final: ≥ 12 testes.

```ts
test.describe("M0 — navbar", () => {
  test("skip-link is first focusable, navigates to #main", async ({ page }) => {
    await page.goto("/pt/")
    await page.keyboard.press("Tab")
    const skip = page.getByRole("link", { name: /pular/i })
    await expect(skip).toBeFocused()
    await skip.click()
    // hash atualiza
    await expect(page).toHaveURL(/#main$/)
  })

  test("sticky header becomes solid on scroll", async ({ page }) => {
    await page.goto("/pt/")
    const header = page.locator("header[data-scrolled]")
    await expect(header).toHaveAttribute("data-scrolled", "false")
    await page.evaluate(() => window.scrollBy(0, 200))
    await expect(header).toHaveAttribute("data-scrolled", "true")
  })

  test("/pt/projects shows back-home link instead of anchors", async ({
    page,
  }) => {
    await page.goto("/pt/projects")
    await expect(page.getByRole("link", { name: /início/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /habilidades/i })).toHaveCount(0)
  })

  test("scrollspy marks contact as active when in viewport", async ({ page }) => {
    await page.goto("/pt/")
    await page.locator("#contact").scrollIntoViewIfNeeded()
    await page.waitForTimeout(150) // observers debounce
    await expect(
      page.locator('a[href="#contact"][aria-current="true"]').first(),
    ).toBeVisible()
  })

  test("mobile sheet opens and closes", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 700 })
    await page.goto("/pt/")
    await page.getByRole("button", { name: /abrir menu/i }).click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog")).toBeHidden()
  })
})
```

Notas:
- `data-scrolled` attribute do header é o ponto de aferição (em vez de classes Tailwind voláteis).
- O 4º teste (scrollspy) pode ser flaky em CI — manter `await page.waitForTimeout(150)` modesto e `.first()` para tolerar duplicação desktop/mobile.
- O 5º teste assume Sheet de shadcn emite `role="dialog"`.

### 3.16 `e2e/_helpers.ts` — extensão

```ts
export const navHeader = (page: Page) => page.locator("header[data-scrolled]")
export const skipLink = (page: Page) =>
  page.getByRole("link", { name: /pular|skip/i })
export const mobileMenuTrigger = (page: Page) =>
  page.getByRole("button", { name: /abrir menu|open menu/i })
```

Os helpers existentes (`themeButton`, `localeButton`, `waitForHydration`) ficam intactos.

### 3.17 Reconciliação documental (FRD + blueprint-visual)

**`docs/features/m0-infra/frd-m0-infra.md` §4.4 (Estilo visual)** — adicionar nota:

> **Divergência aplicada em produção (`feat/m0-visual` PR #9):**
> - `tailwind.config.js` `fontFamily.sans` aponta para **Geist Mono** (não Geist Sans). Geist Mono é o body face default.
> - `fontFamily.display` foi introduzido apontando para **Asimovian**, aplicado em Hero `h1` e Section `h2` via classe `font-display`.
> - `@fontsource/asimovian` adicionado a `dependencies`.

**`docs/features/m0-infra/frd-m0-infra.md` §4.5 (Animações)** — atualizar timings:

> **Divergência aplicada em produção:**
> - `mh-fade-in-up`: duração 900ms (FRD original 600ms).
> - `mh-fade-in`: duração 700ms (FRD original 500ms).
> - Easing: `cubic-bezier(0.22, 0.61, 0.36, 1)` (FRD original `cubic-bezier(0.16, 1, 0.3, 1)`).

**`docs/features/m0-infra/frd-m0-infra.md` §13 Histórico** — entrada v0.3.0 documentando reconciliação.

**`docs/features/m0-infra/blueprint-m0-visual.md`** — adicionar bloco "Pós-merge" ao topo (ou versão 0.2.0) registrando que os valores acima foram aceitos como entregues. Sem rewrite — referência cruzada à FRD v0.3.0.

### 3.18 `docs/scaffolding-state.md`

Bump da versão (consultar arquivo atual no commit final para decidir incremento; provavelmente `0.4.0` → `1.0.0` ou similar). Conteúdo a adicionar:

- Seção "M0 — Infraestrutura" registrando entrega completa (visual + tema + i18n + navbar).
- Lista de novos arquivos por concern.
- Decisões cross-cutting (basename `/portfolio/`, default locale `pt`, divergências visuais).
- Pointer para `docs/features/m0-infra/handoff-m0.md` v1.0.0 como autoritativo.

**Inspecionar o arquivo no commit de docs**; não pré-escrever aqui porque depende do estado real pós-merges.

### 3.19 `docs/features/m0-infra/handoff-m0.md` — bump 1.0.0

Último commit da branch. Atualizações:

- Versão → 1.0.0. Status M0 → "✅ Entregue".
- §1: sub-branch 4 → ✅ com SHA do merge final.
- §5 (sub-branch 4) reescrita: Entregue, commits, decisões resolvidas, divergências.
- §6: árvore final pós-navbar.
- §7: novas decisões marcadas como Mergeado.
- §8: "M0 fechado. Próximos milestones M1+ via FRDs próprios."
- §9: histórico v1.0.0 com SHA real.

---

## 4. Mapa commit → arquivos

Conventional Commits em inglês (AGENTS.md §7). Subject ≤ 72 chars. Pre-commit (`lint-staged → typecheck → test:run`) em todos. Sem `--no-verify`.

| # | Subject | Arquivos | Verificação |
|---|---------|----------|-------------|
| 0  | `docs(m0): bump handoff to 0.4.0 opening feat/m0-navbar` | `docs/features/m0-infra/handoff-m0.md` | **Já aplicado** (`eae8c7b`) |
| 1  | `docs(m0): add blueprint for feat/m0-navbar sub-branch` | `docs/features/m0-infra/blueprint-m0-navbar.md` | — |
| 25 | `chore(ui): add shadcn sheet primitive` | `src/components/ui/sheet.tsx`, `package.json`, `pnpm-lock.yaml` | `pnpm dlx shadcn@latest add sheet`; `pnpm install`; `pnpm typecheck` |
| 26 | `feat(nav): add useScrolled and useScrollSpy hooks` | `src/lib/scroll.ts`, `src/lib/scroll.test.ts`, `src/lib/scrollSpy.ts`, `src/lib/scrollSpy.test.ts` | `pnpm test:run` cobre CT-M0-SCR-01..05 + CT-M0-SPY-01..05 |
| 27 | `feat(nav): add SkipLink and Brand components` | `src/components/SkipLink.tsx`, `.test.tsx`, `src/components/Brand.tsx`, `.test.tsx` | `pnpm test:run` cobre CT-M0-SK-01..03 + CT-M0-BR-01..04 |
| 28 | `feat(nav): add Navbar with desktop items` | `src/components/Navbar.tsx`, `src/components/Navbar.test.tsx` | `pnpm test:run` cobre CT-M0-NV-01..09 (sem MobileMenu) |
| 29 | `feat(nav): add MobileMenu via Sheet` | `src/components/MobileMenu.tsx`, `src/components/MobileMenu.test.tsx` | `pnpm test:run` cobre CT-M0-MM-01..07 |
| 30 | `feat(root): mount Navbar and SkipLink; drop temporary toggles wrapper` | `src/root.tsx` | `pnpm dev` confirma toggles dentro do header; `grep data-temporary src/root.tsx` exit 1 |
| 31 | `test(e2e): cover navbar, skip-link, sticky transition, mobile sheet` | `e2e/m0-infra.spec.ts`, `e2e/_helpers.ts` | `pnpm e2e` verde local |
| 32 | `docs(m0): reconcile FRD and blueprint-visual with delivered divergences` | `docs/features/m0-infra/frd-m0-infra.md`, `docs/features/m0-infra/blueprint-m0-visual.md` | Reading review — sem efeito em código |
| 33 | `docs(state): record M0 delivery` | `docs/scaffolding-state.md` | Reading review |
| 34 | `docs(m0): bump handoff to 1.0.0 — M0 closed` | `docs/features/m0-infra/handoff-m0.md` | Reading review — SHA do merge entra após PR mergeado (amend permitido apenas pré-PR; senão segue commit posterior pós-merge no `main` se necessário; preferir empacotar com merge commit message no GitHub) |

Total: **11 commits** (1 blueprint + 1 já aplicado + 7 código/testes + 3 docs). Estimativa FRD §11 (commits 25–29) somava 5 commits Phase E + Phase F.4 docs; este blueprint quebra de forma mais granular (separa SkipLink+Brand de Navbar para isolar falhas, e isola MobileMenu).

> Ordem importa: **25 antes de 28/29** (Sheet primitive necessária para MobileMenu compilar). **30 depois de 28/29** (root só monta Navbar depois que Navbar+MobileMenu existirem).

---

## 5. Coverage e gates

- `src/lib/scroll.ts` e `src/lib/scrollSpy.ts` são arquivos novos em `src/lib/` → AGENTS.md §6 exige TDD. Alvo 100% real-world (com pragma para SSR-guard).
- `src/components/{Navbar,MobileMenu,SkipLink,Brand}.tsx` entram na cobertura global (não estão em `ui/`).
- CA-M0-18 lista `validation.ts`, `period.ts`, `motion.tsx` em 100% — todos mantidos.
- `pnpm run test:coverage` deve passar pisos atuais (≥ 70 global) — pode subir levemente com novos arquivos bem cobertos.
- Sem mudança em `vitest.config.ts`. `src/components/ui/sheet.tsx` é vendor → fica fora da cobertura via padrão atual de exclusão (`src/components/ui/**`).

---

## 6. Merge checklist `feat/m0-navbar` → `main` (FRD §11.1)

- [ ] `pnpm run lint` exit 0
- [ ] `pnpm run typecheck` exit 0
- [ ] `pnpm run test:run` exit 0 (≥ 14 test files após Brand/SkipLink/Navbar/MobileMenu)
- [ ] `pnpm run test:coverage` mantém pisos; `motion.tsx`, `validation.ts`, `period.ts` continuam em 100%
- [ ] `pnpm run build` exit 0 (prebuild `check-assets` + `check-i18n` passam)
- [ ] `pnpm e2e` verde local (≥ 12 testes em `m0-infra.spec.ts` + specs migradas existentes)
- [ ] Skip-link foca em `<main>` em todas as rotas (`/pt/`, `/en/`, `/pt/projects`, `/en/projects`) — CA-M0-05
- [ ] Navbar transparente → blur+border ao rolar (`scrollY > 8`) em desktop e mobile — CA-M0-02
- [ ] Sheet abre/fecha em mobile com ESC e clique fora — CA-M0-03
- [ ] Scrollspy destaca seção em viewport central (visual + `aria-current="true"`) — CA-M0-04 / RN-M0-11
- [ ] "← Início" em `/pt/projects` e `/en/projects` navega para `/{locale}/` — RF-M0-NAV-03
- [ ] `grep -n "data-temporary-" src/root.tsx` exit 1 (wrapper provisório removido)
- [ ] LocaleToggle + ThemeToggle continuam funcionando em viewport desktop e dentro do Sheet em mobile
- [ ] `docs/scaffolding-state.md` registra M0 entregue
- [ ] FRD e blueprint-visual reconciliados com divergências
- [ ] Handoff bump para 1.0.0 com SHA do merge
- [ ] PR aberto contra `main`, CI verde
- [ ] Merge `--ff-only` ou squash; deploy GH Pages valida `/portfolio/pt/`, `/portfolio/en/`, `/portfolio/pt/projects`, skip-link funcional, navbar visível em todas as rotas

---

## 7. Riscos e decisões pendentes (precisam do seu aval **antes** de codar)

| ID | Item | Pergunta | Recomendação |
|----|------|----------|--------------|
| **D-SHEET-INSTALL** | `pnpm dlx shadcn@latest add sheet` adiciona Radix Dialog + tailwind-merge + class-variance-authority dependências indiretas. Pode também tocar `components.json` se ainda não estiver alinhado. | Aceitar o comando "as-is" ou pre-flight em branch throwaway? | **Aceitar as-is** no commit 25. Inspecionar o lockfile diff antes de comitar — qualquer dep nova chega como peer já requerida pelos primitives existentes. Se `components.json` mudar, comitar junto. |
| **D-LUCIDE-VERSION** | `lucide-react@^1.14.0` — Menu/X/Globe precisam resolver. Globe já está em uso (`LocaleToggle`). Menu/X são novos. Versão `1.x` é antiga (atual lucide-react está em `0.4xx`); risco de absent exports. | Verificar no pré-flight; se faltar, parar e abrir issue de upgrade? | **Verificar pré-flight (§1.4)**. Se Menu/X resolverem, seguir. Se faltar, abrir issue separada de `chore(deps): upgrade lucide-react`; não fazer upgrade dentro desta sub-branch sem aval explícito. Plan B: SVG inline para hamburger (`<svg>` com 3 linhas) e descartar Lucide para esses 2 ícones. |
| **D-NAV-EDUCATION** | FRD §4.1 lista apenas `Skills`, `Experience`, `Contact` no navbar (sem `Education`). Mas Education é uma seção visível em `/pt/` entre Experience e Contact. | Seguir FRD (sem Education no nav) ou incluir? | **Seguir FRD** — sem Education no nav. Education ainda aparece no scroll. Razão: nav curto em mobile e dicionário não tem `nav.education`. Se quiser incluir depois, é adição de 1 linha + 2 chaves de dicionário. |
| **D-SCROLLSPY-INITIAL** | `useScrollSpy` retorna `null` antes de qualquer intersection. No primeiro paint em `/pt/`, nenhum anchor tem `aria-current`. | Aceitável (sem highlight inicial) ou força `skills` como default? | **Aceitável.** IntersectionObserver dispara assim que monta — o highlight chega em <100ms. Forçar default cria divergência entre estado renderizado e estado observado, gerando flicker. |
| **D-SHEET-AXE** | Radix Dialog (base do Sheet shadcn) pode emitir avisos axe sobre focus trap ou aria internos em jsdom. | Tolerar / esperar / pular? | **Asserir só nossos elementos** dentro de `MobileMenu.test.tsx` (axe escopado ao subtree dos nossos componentes). Se axe sobre o portal interno reclamar, documentar como CT-M0-MM-07-known-issue e mover ao E2E (Playwright axe). |
| **D-DOCS-RECONCILIATION** | FRD `frd-m0-infra.md` já foi tocada em PR #11 (versão atual v0.2.0); reconciliação propõe v0.3.0 inserindo notas de divergência. | Atualizar FRD nesta sub-branch é OK? FRD é tipicamente imutável após primeira merge. | **Sim, atualizar** — esta é a última sub-branch e o handoff-m0 v0.3.0 já promete a reconciliação como pendência cruzada. Manter histórico em §13. Se o usuário preferir manter FRD intocada, alternativa é só atualizar `blueprint-m0-visual.md` + uma nota no handoff. Confirmar antes do commit 32. |
| **D-SCAFFOLDING-VERSION** | `docs/scaffolding-state.md` tem schema próprio com versões internas. Não conheço o estado atual dele sem ler. | Atualizar como? | **Ler o arquivo no commit 33** e adaptar a estrutura existente. Pré-escrever aqui seria especulação — o conteúdo concreto entra no PR. |
| **D-HANDOFF-MERGE-SHA** | Commit 34 (`docs(m0): bump handoff to 1.0.0`) precisa do SHA do merge final, mas o commit acontece **antes** do merge. | Como capturar SHA real? | **Duas opções:** (a) Comitar com placeholder `<merge-sha>` e fazer follow-up commit no `main` após merge — sujo. (b) Não incluir SHA específico do merge no handoff v1.0.0; apenas marcar "Mergeado em 2026-MM-DD via PR #N". Preferir **(b)** — handoff foca em estado, não em SHA imutável. |
| **D-BRAND-ARIA** | Brand `aria-label="Marco Hansen"` é nome próprio (não tradução), mesmo em locale EN. | OK ou adicionar chave `nav.brand` que retorna nome próprio para PT/EN? | **OK manter hardcoded.** Nome próprio não traduz. Sem chave de i18n. |
| **D-CONTACT-HASH-LINK** | Hero atualmente usa `<a href={withBase("/#contact")}>` — vai para `/portfolio/#contact` (sem locale). Pós-i18n esse href quebra (rota não existe). | Fora de escopo aqui? | **Fora de escopo.** Bug pre-existente herdado de `feat/m0-i18n` (Hero não atualizou o href para `/{locale}/#contact`). Documentar no handoff v1.0.0 como follow-up — não bloqueia M0 nem o navbar. Navbar usa `<a href="#contact">` (relativo, OK em qualquer rota com `<main id="main">`). |
| **D-NAV-MEMO-IDS** | `HOME_SPY_IDS` é uma constante module-level. Pode ser passada direto ao `useScrollSpy` sem memo. | OK ou `useMemo`? | **OK constante module-level.** Identidade estável por natureza. `useMemo` seria desperdício. |
| **D-MOBILE-TOGGLES-DUPLICACAO** | `LocaleToggle` e `ThemeToggle` aparecem na desktop nav E dentro do Sheet mobile. São instâncias separadas. | Risco de estado divergente? | **Sem risco.** `ThemeProvider` é único; `LocaleToggle` lê de `useNavigate`/`useLocation` (também únicos). Ambas instâncias compartilham estado via contextos. Click em qualquer uma muda o estado global. |

Se algum item acima divergir do recomendado, **avise antes do commit 25** — D-SHEET-INSTALL e D-LUCIDE-VERSION são estruturais; D-DOCS-RECONCILIATION afeta o último terço da branch.

---

## 8. Out-of-scope desta sub-branch (não cair em escopo)

Reaviso para evitar drift:

- Refatorar `Hero` para usar `/{locale}/#contact` em vez de `/#contact` (D-CONTACT-HASH-LINK). Documentar como follow-up no handoff v1.0.0.
- Adicionar `nav.education` no dicionário e incluir Education no scrollspy (D-NAV-EDUCATION).
- Upgrade de `lucide-react` para versão atual (D-LUCIDE-VERSION). Issue separada se necessário.
- Implementar page transitions com View Transitions API (FRD §12).
- 3-state theme com sync ativo do `prefers-color-scheme` (FRD §12).
- Tradução real EN das taglines/descriptions (FRD §12 — responsável: Marco).
- Tracking de acessibilidade com leitor de tela real (FRD §12 — QA manual pós-M0).
- Aproveitar para refactor de outros componentes — manter foco em Phase E + F.4.
- Substituir o `aria-label` fixo do Brand por chave de i18n.

---

## 9. Histórico

| Versão | Data | Mudança |
|--------|------|---------|
| 0.1.0 | 2026-05-18 | Blueprint inicial derivado da FRD v0.2.0 §11 (commits 25–29) + Phase F.4 + leitura do estado pós-merge de `feat/m0-i18n` (`main` HEAD `bbab54a`). Inclui plano de reconciliação documental (FRD §4.4/§4.5/§13 + blueprint-visual) e bump final do handoff para 1.0.0. |
