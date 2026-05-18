# FRD — M0: Infraestrutura compartilhada

**Versão:** 0.3.0
**Status:** Implementado — sub-branches `feat/m0-visual`, `feat/m0-theme`, `feat/m0-i18n` e `feat/m0-navbar` mergeadas
**Spec de origem:** `docs/spec.md` (refinamentos a §5 e adição implícita ao §3)
**Documentos relacionados:** `docs/scaffolding-state.md`, `docs/features/m1-hero/frd-m1-hero.md`, `AGENTS.md`

> Módulo de infraestrutura que precede M2. Cobre cinco preocupações que viajam juntas: Navbar, tema light/dark, i18n PT/EN, refinamento visual e animações. M0 também faz **retrofit** parcial de M1 (Hero), M3 (Skills), M4 (Experience/Education) e M5 (Contact) para acomodar i18n, fontes, tokens visuais e o novo wrapper `<Section>`.

---

## 1. Visão geral

O portfolio atual (`main` em `9ea59f0`) entregou M1, M3, M4 e M5 com toolchain estável, mas cinco compromissos atravessam toda a base de código sem tratamento sistemático:

1. **Navegação inexistente.** M1 FRD §11 marcou o nav-header como pós-M1. Sem navbar, o skip-link e a descoberta de seções dependem só do Hero.
2. **Dark mode dormente.** `src/app.css` já declara `:root` e `.dark` mas não há toggle, persistência, nem detecção de `prefers-color-scheme`.
3. **i18n adiado para v2.** Spec §5 listou PT/EN como out-of-scope; decidimos puxar para v1 com prefixo de path obrigatório.
4. **Estilo divergente.** Hero refinou o visual (gradientes, blur orbs, escalas ad-hoc) sem que os tokens fossem padronizados. M3/M4 já apresentam drift.
5. **Movimento ausente.** Apenas `scroll-behavior: smooth` está plumbado. Sem scroll-reveal padronizado, as seções entram em paint final.

M0 fecha as cinco frentes em **quatro sub-branches sequenciais** (`feat/m0-visual` → `feat/m0-theme` → `feat/m0-i18n` → `feat/m0-navbar`), cada uma mergeada para `main` antes da próxima começar, encerrando antes do M2.

---

## 2. Escopo

### 2.1 Dentro

**Navegação**

- `src/components/Navbar.tsx` montada em `src/root.tsx`, sticky, transparente no topo, `backdrop-blur` + border ao rolar.
- `src/components/SkipLink.tsx` antes da Navbar, `<a href="#main">` visível só com foco.
- Brand: monograma "MH" inline SVG.
- Em `/`: âncoras Skills/Experience/Contact, gated por `FEATURES`.
- Em `/projects` e `/projects/:id`: âncoras substituídas por link "← Home".
- Mobile (< md): shadcn `Sheet` drawer (instalar via CLI).
- Active state em `/` via IntersectionObserver scrollspy.

**Tema**

- `src/lib/theme.tsx`: `ThemeProvider` + `useTheme()` (roll-own React Context).
- `src/components/ThemeToggle.tsx`: botão ícone (sol ↔ lua), 2-state.
- Persistência em `localStorage["mh-theme"]`. Primeira visita: `prefers-color-scheme`. Depois do primeiro clique, sistema é ignorado.
- Script inline em `index.html` aplica `.dark` antes do React montar (anti-FOUC).

**i18n**

- Biblioteca: `react-i18next` + `i18next`.
- URL: prefixos `/pt/` e `/en/` obrigatórios. `/` redireciona para `/pt/`.
- Default: PT-BR. **Sem fallback** — paridade exigida.
- `src/components/LocaleToggle.tsx`: botão toggle (ícone globo + label 2 letras).
- Dicionário de UI: `src/i18n/locales/{pt,en}/translation.json`.
- Dados localizados: arquivos paralelos por dataset (`hero.pt.json`, `hero.en.json`, etc.).
- Guard: `scripts/check-i18n.ts` no `prebuild` (diffeia dicionários + JSONs paralelos).
- `src/lib/period.ts` refatorado para `Intl.DateTimeFormat` por locale.

**Estilo visual**

- Tipografia: Geist Variable Sans + Geist Variable Mono via `@fontsource-variable/geist` e `@fontsource-variable/geist-mono`. Import em `src/app.css`.
- Paleta: **slate** base + **emerald** primary. HSL detalhados em §4.4.
- 9 tokens em `tailwind.config.js` → `theme.extend.fontSize`: `display-2xl/xl/lg`, `headline-lg/md/sm`, `body-lg/md/sm`.
- `src/components/Section.tsx` com API `id`, `eyebrow?`, `title?`, `subtitle?`, `as?`, `reveal?`, `children`.
- Retrofit: `Hero.tsx` migra para novos tokens; `Skills`, `Experience`, `Education`, `Contact` migram para `<Section>`.

**Animações**

- CSS-only via `tailwindcss-animate` + keyframes customizados em `src/app.css`.
- Escopo: micro-interações (hover/focus existentes mantidas) + scroll-reveal por seção. **Sem** page transitions.
- `src/lib/motion.tsx`: hook `useInView` + componente `<Reveal>` + map de variantes → classes CSS (`fade-in-up`, `fade-in`).
- `<Section reveal={true}>` envolve children em `<Reveal>` por default.
- `@media (prefers-reduced-motion: reduce)` em `app.css` zera durações.

### 2.2 Fora (deste módulo)

- M2 Projetos — próxima feature, fora do M0.
- Page transitions entre rotas (cross-route view transitions).
- Modo "system" (3-state theme).
- Adição de uma terceira locale (a infraestrutura permite, mas só PT e EN são entregues).
- Tradução dos slugs internos `trabalho/freelance/open-source/ensino` e `concluido/em-andamento`. Permanecem em PT como tokens; display labels vêm do dicionário de UI.

---

## 3. Decisões fechadas (sessão de brainstorm 2026-05-15)

26 decisões fechadas em 5 rounds + 1 derivada do alinhamento com `scaffolding-state.md` (D-BASE-01). IDs hierárquicos por concern.

| # | Decisão | Resolução |
|---|---------|-----------|
| D-NAV-01 | Itens da navbar | Brand + âncoras (sem item "Projects" — Hero CTA cobre o link) |
| D-NAV-02 | Mobile menu | shadcn `Sheet` drawer lateral |
| D-NAV-03 | Scroll behavior | Sticky transparente → solid + blur ao rolar |
| D-NAV-04 | Active state | IntersectionObserver scrollspy em `/` |
| D-NAV-05 | Brand | Monograma "MH" inline SVG |
| D-NAV-06 | Rotas não-home | Mesma navbar; âncoras viram link "← Home" |
| D-THM-01 | UI do toggle | Botão ícone 2-state (sol ↔ lua) |
| D-THM-02 | Default primeira visita | `prefers-color-scheme` |
| D-THM-03 | Anti-FOUC | Script inline em `<head>` de `index.html` |
| D-THM-04 | Biblioteca | Roll-own React Context (`src/lib/theme.tsx`) |
| D-I18N-01 | Biblioteca | `react-i18next` |
| D-I18N-02 | URL | Prefixos `/pt/` e `/en/` para ambos os locales |
| D-I18N-03 | Default + fallback | PT-BR default; **sem fallback** |
| D-I18N-04 | Estrutura dos dados | Arquivos paralelos por locale (`hero.pt.json` + `hero.en.json`) |
| D-I18N-05 | Redirect raiz | `/` sempre redireciona para `/pt/` |
| D-I18N-06 | Switcher UI | Botão toggle (globo + 2 letras) |
| D-I18N-07 | Guard de paridade | Script `scripts/check-i18n.ts` no `prebuild` |
| D-I18N-08 | Formatação de datas | `period.ts` refatorado para `Intl.DateTimeFormat` por locale |
| D-VIS-01 | Fonte | Geist Sans + Geist Mono via `@fontsource-variable` |
| D-VIS-02 | Paleta | Slate base + Emerald primary |
| D-VIS-03 | Wrapper de seção | `<Section>` com API `id`/`eyebrow?`/`title?`/`subtitle?`/`as?`/`reveal?` |
| D-VIS-04 | Tipografia | 9 tokens em `tailwind.config.js` (display/headline/body × 3) |
| D-MOT-01 | Biblioteca | CSS-only com `tailwindcss-animate` + keyframes customizados |
| D-MOT-02 | Escopo | Micro + scroll-reveal (**sem** page transitions) |
| D-MOT-03 | Reduced motion | `@media (prefers-reduced-motion: reduce)` em `app.css` |
| D-MOT-04 | Localização do código | `src/lib/motion.tsx` centraliza hook + Reveal + variantes |
| D-BASE-01 | Basename da app | `basename: "/portfolio/"` em `react-router.config.ts` para casar com subpath GH Pages em `marcohansen.github.io/portfolio` (hoje config aplica `/`, vide `scaffolding-state.md`) |

---

## 4. Decisões de design

### 4.1 Navbar

**Composição em DOM (em `src/root.tsx`):**

```
<body>
  <SkipLink />
  <ThemeProvider>
    <I18nProvider> {/* via react-i18next */}
      <Navbar />
      <main id="main">{children}</main>
    </I18nProvider>
  </ThemeProvider>
</body>
```

**`Navbar.tsx` estrutura:**

```
<header className="sticky top-0 z-50 ...">
  <div className="container flex h-16 items-center justify-between">
    <Brand />                          {/* link para /{lang}/ */}
    <NavItems />                       {/* desktop ≥ md */}
    <div className="flex items-center gap-2">
      <LocaleToggle />
      <ThemeToggle />
      <MobileMenuButton className="md:hidden" />
    </div>
  </div>
</header>
```

**Estado visual ao rolar:**

- Classe controlada por `useScrolled(threshold = 8)` em `src/lib/scroll.ts`.
- Inicial: `bg-transparent border-transparent`.
- Após threshold: `bg-background/80 backdrop-blur-md border-b border-border/60`.
- Transição: `transition-colors duration-200`.

**Items por rota:**

- `pathname.endsWith("/") || pathname === "/{lang}"` → âncoras (Skills, Experience, Contact), cada uma gated por `FEATURES.skills`/`FEATURES.experience`/`FEATURES.contact`. Active state pelo scrollspy.
- Caso contrário → link único "← Home" para `/{lang}/`.

**`useScrollSpy(ids)`:**

```typescript
// src/lib/scrollSpy.ts
export function useScrollSpy(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    const observers = ids.map((id) => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => entry?.isIntersecting && setActive(id),
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach((o) => o?.disconnect())
  }, [ids])
  return active
}
```

**Mobile menu (shadcn Sheet):**

```sh
pnpm dlx shadcn@latest add sheet
```

Sheet abre da direita, contém: nome do site, lista de âncoras (ou "← Home"), separador, LocaleToggle, ThemeToggle.

**Skip-link:**

```tsx
// src/components/SkipLink.tsx
export function SkipLink() {
  const { t } = useTranslation()
  return (
    <a
      href="#main"
      className="sr-only fixed left-2 top-2 z-[60] rounded-md bg-background px-3 py-2 text-body-sm font-medium ring-2 ring-ring focus:not-sr-only"
    >
      {t("a11y.skipToContent")}
    </a>
  )
}
```

### 4.2 Tema (light/dark)

**`src/lib/theme.tsx`:**

```typescript
type Theme = "light" | "dark"
type ThemeCtx = { theme: Theme; toggle: () => void }

const ThemeContext = createContext<ThemeCtx | null>(null)

const STORAGE_KEY = "mh-theme"

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light"
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "light" || stored === "dark") return stored
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggle = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    [],
  )

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
```

**Script anti-FOUC em `index.html`:**

```html
<head>
  <!-- ... -->
  <script>
    (function () {
      try {
        var t = localStorage.getItem("mh-theme")
        var dark = t === "dark" || (t === null && window.matchMedia("(prefers-color-scheme: dark)").matches)
        if (dark) document.documentElement.classList.add("dark")
      } catch (_) {}
    })()
  </script>
</head>
```

**`ThemeToggle.tsx`:**

```tsx
export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const { t } = useTranslation()
  const label = theme === "dark" ? t("theme.toLight") : t("theme.toDark")
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label={label}>
      {theme === "dark" ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
    </Button>
  )
}
```

Ícones via `lucide-react` (`Sun`, `Moon`) — `lucide-react` já está em `dependencies` (state.md §2.3).

### 4.3 i18n PT/EN

**Inicialização — `src/i18n/index.ts`:**

```typescript
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import pt from "./locales/pt/translation.json"
import en from "./locales/en/translation.json"

export const LOCALES = ["pt", "en"] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "pt"

i18n.use(initReactI18next).init({
  resources: { pt: { translation: pt }, en: { translation: en } },
  lng: DEFAULT_LOCALE,
  fallbackLng: false,
  interpolation: { escapeValue: false },
  returnNull: false,
  react: { useSuspense: false },
})

export function isLocale(value: string | undefined): value is Locale {
  return value === "pt" || value === "en"
}

export default i18n
```

**Estrutura de rotas — `src/routes.ts`:**

```typescript
import { type RouteConfig, index, route, layout } from "@react-router/dev/routes"

export default [
  index("routes/_root-redirect.tsx"),                       // /  → redirect /pt/
  layout("routes/$lang.tsx", [
    index("routes/$lang._index.tsx"),                       // /:lang
    route("projects", "routes/$lang.projects._index.tsx"),  // /:lang/projects
    route("projects/:id", "routes/$lang.projects.$id.tsx"), // /:lang/projects/:id
  ]),
] satisfies RouteConfig
```

**`routes/_root-redirect.tsx` (prerender-safe):**

```tsx
import { Navigate } from "react-router"
import { DEFAULT_LOCALE } from "@/i18n"

export function meta() {
  return [
    { tagName: "link", rel: "canonical", href: `/portfolio/${DEFAULT_LOCALE}/` },
    { httpEquiv: "refresh", content: `0; url=/portfolio/${DEFAULT_LOCALE}/` },
  ]
}

export default function RootRedirect() {
  return <Navigate to={`/${DEFAULT_LOCALE}/`} replace />
}
```

**`routes/$lang.tsx` (locale layout):**

```tsx
import { Outlet, useParams, Navigate } from "react-router"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { isLocale } from "@/i18n"

export default function LangLayout() {
  const { lang } = useParams()
  const { i18n } = useTranslation()

  if (!isLocale(lang)) {
    return <Navigate to={`/pt/`} replace />
  }

  useEffect(() => {
    if (i18n.language !== lang) i18n.changeLanguage(lang)
  }, [lang, i18n])

  return <Outlet />
}
```

**`react-router.config.ts` prerender:**

```typescript
export default {
  appDirectory: "src",
  ssr: false,
  prerender: ["/", "/pt", "/pt/projects", "/en", "/en/projects"],
  basename: "/portfolio/",
} satisfies Config
```

> Basename muda de `/` (atual em `react-router.config.ts`, vide `scaffolding-state.md`) para `/portfolio/` casando com subpath GH Pages (D-BASE-01). URLs públicas finais: `/portfolio/pt/`, `/portfolio/en/projects` etc. Meta `refresh` e `canonical` em `_root-redirect.tsx` carregam o subpath explicitamente porque saem direto no HTML, não passam pelo resolver do router.

**Locale switcher — `src/components/LocaleToggle.tsx`:**

```tsx
import { Globe } from "lucide-react"
import { useNavigate, useLocation } from "react-router"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"

export function LocaleToggle() {
  const { i18n, t } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const current = i18n.language === "pt" ? "pt" : "en"
  const other = current === "pt" ? "en" : "pt"

  const switchLocale = () => {
    const next = pathname.replace(/^\/(pt|en)/, `/${other}`)
    navigate(next)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={switchLocale}
      aria-label={t("locale.switchTo", { locale: other.toUpperCase() })}
      className="gap-1.5"
    >
      <Globe className="size-4" aria-hidden="true" />
      {other.toUpperCase()}
    </Button>
  )
}
```

**Layout de dados localizados — `src/data/`:**

```
src/data/
  hero.pt.json      hero.en.json
  skills.pt.json    skills.en.json
  experiences.pt.json   experiences.en.json
  education.pt.json     education.en.json
  projects.pt.json      projects.en.json   # M2
```

**Loader por locale — `src/lib/data.ts`:**

```typescript
import heroPt from "@/data/hero.pt.json"
import heroEn from "@/data/hero.en.json"
import { validateHero } from "@/lib/validation"
import type { Locale } from "@/i18n"
import type { Hero } from "@/types/domain"

const heroByLocale: Record<Locale, Hero> = {
  pt: validateHero(heroPt),
  en: validateHero(heroEn),
}

export function getHero(locale: Locale): Hero {
  return heroByLocale[locale]
}
```

Repetir o padrão para skills, experiences, education, projects. Validação roda **no boot** — falha aborta o render (RN-M1-03 estendido).

**Dicionário de UI — `src/i18n/locales/pt/translation.json` (exemplo):**

```json
{
  "nav": {
    "skills": "Habilidades",
    "experience": "Experiência",
    "contact": "Contato",
    "backHome": "← Início"
  },
  "a11y": {
    "skipToContent": "Pular para conteúdo",
    "openMenu": "Abrir menu",
    "closeMenu": "Fechar menu"
  },
  "theme": {
    "toLight": "Mudar para modo claro",
    "toDark": "Mudar para modo escuro"
  },
  "locale": {
    "switchTo": "Mudar idioma para {{locale}}"
  },
  "period": {
    "present": "Presente"
  },
  "category": {
    "trabalho": "Trabalho",
    "freelance": "Freelance",
    "open-source": "Open Source",
    "ensino": "Ensino"
  },
  "status": {
    "concluido": "Concluído",
    "em-andamento": "Em andamento"
  }
}
```

`src/i18n/locales/en/translation.json` é estruturalmente idêntico com valores em EN. O guard de §4.3.6 garante.

**Guard de paridade — `scripts/check-i18n.ts`:**

```typescript
import { existsSync, readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const LOCALES = ["pt", "en"] as const
const DATASETS = ["hero", "skills", "experiences", "education", "projects"]

function fail(msg: string): never {
  console.error(`check-i18n ERROR: ${msg}`)
  process.exit(1)
}

function flattenKeys(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object") return [prefix]
  if (Array.isArray(obj)) return [prefix]
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    flattenKeys(v, prefix ? `${prefix}.${k}` : k),
  )
}

function load(path: string): unknown {
  if (!existsSync(path)) fail(`missing file: ${path}`)
  return JSON.parse(readFileSync(path, "utf8"))
}

// 1) UI dictionary parity
const ptDict = load(resolve(ROOT, "src/i18n/locales/pt/translation.json"))
const enDict = load(resolve(ROOT, "src/i18n/locales/en/translation.json"))
const ptKeys = new Set(flattenKeys(ptDict))
const enKeys = new Set(flattenKeys(enDict))
const missingInEn = [...ptKeys].filter((k) => !enKeys.has(k))
const missingInPt = [...enKeys].filter((k) => !ptKeys.has(k))
if (missingInEn.length || missingInPt.length) {
  fail(
    `UI dictionary key mismatch.\n` +
      (missingInEn.length ? `  missing in EN: ${missingInEn.join(", ")}\n` : "") +
      (missingInPt.length ? `  missing in PT: ${missingInPt.join(", ")}` : ""),
  )
}

// 2) Per-dataset shape parity (top-level keys for records / arrays of same shape)
for (const ds of DATASETS) {
  const ptPath = resolve(ROOT, `src/data/${ds}.pt.json`)
  const enPath = resolve(ROOT, `src/data/${ds}.en.json`)
  if (!existsSync(ptPath) && !existsSync(enPath)) continue // dataset not yet introduced (e.g., projects in M2)
  const pt = load(ptPath)
  const en = load(enPath)
  const ptShape = JSON.stringify(flattenKeys(pt).sort())
  const enShape = JSON.stringify(flattenKeys(en).sort())
  if (ptShape !== enShape) {
    fail(`Dataset shape mismatch in '${ds}': pt and en JSON keys diverge.`)
  }
}

console.log("check-i18n OK: dictionaries and datasets are in parity")
```

Wire no `package.json`:

```json
{
  "scripts": {
    "prebuild": "node --import tsx scripts/check-assets.ts && node --import tsx scripts/check-i18n.ts",
    "check:i18n": "node --import tsx scripts/check-i18n.ts"
  }
}
```

**Refator de `src/lib/period.ts`:**

```typescript
import type { Locale } from "@/i18n"

const intlLocale: Record<Locale, string> = { pt: "pt-BR", en: "en-US" }

const presentLabel: Record<Locale, string> = { pt: "Presente", en: "Present" }

export function formatPeriod(startISO: string, endISO: string | undefined, locale: Locale): string {
  const fmt = new Intl.DateTimeFormat(intlLocale[locale], { month: "short", year: "numeric" })
  const start = fmt.format(new Date(startISO))
  const end = endISO ? fmt.format(new Date(endISO)) : presentLabel[locale]
  return `${start} — ${end}`
}

export function sortByRecency<T extends { startDate: string; endDate?: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => {
    const aKey = a.endDate ?? "9999-12-31"
    const bKey = b.endDate ?? "9999-12-31"
    return bKey.localeCompare(aKey) || b.startDate.localeCompare(a.startDate)
  })
}
```

Os call-sites em `Experience.tsx`/`Education.tsx` lêem o locale via `i18n.language` e passam para `formatPeriod`.

### 4.4 Estilo visual

> **Divergência reconciliada em produção (`feat/m0-visual` PR #9, `feat/m0-navbar`):**
> - `tailwind.config.js` `fontFamily.sans` aponta para **Geist Mono Variable** (não Geist Sans). Geist Mono é o body face default em `:root`.
> - Foi introduzido `fontFamily.display` apontando para **Asimovian**, consumido pelas headings via classe `font-display` em Hero `h1`, Section `h2` e Brand.
> - `@fontsource/asimovian` foi adicionado a `dependencies`.
> - O snippet de fontes abaixo permanece como histórico do plano original; a verdade da implementação está em `src/app.css` e `tailwind.config.js`.

**Fontes — em `src/app.css`:**

```css
@import "@fontsource-variable/geist/index.css";
@import "@fontsource-variable/geist-mono/index.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    font-family: "Geist Variable", system-ui, -apple-system, sans-serif;
  }
  code, pre, kbd, samp {
    font-family: "Geist Mono Variable", ui-monospace, monospace;
  }
}
```

**Paleta — substitui o bloco `@layer base { :root { ... } .dark { ... } }` atual:**

```css
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
    --accent: 160 60% 92%;             /* emerald-100 tint */
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
    --accent: 158 64% 22%;             /* emerald-900 tint */
    --accent-foreground: 158 64% 70%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 158 64% 52%;
  }
}
```

> Valores são alvos. Ajuste fino é permitido na implementação desde que mantenha contraste WCAG AA (`primary` vs `primary-foreground`, `foreground` vs `background`).

**Tipografia — `tailwind.config.js`:**

```javascript
theme: {
  // ...container existente
  extend: {
    fontFamily: {
      sans: ["\"Geist Variable\"", "system-ui", "sans-serif"],
      mono: ["\"Geist Mono Variable\"", "ui-monospace", "monospace"],
    },
    fontSize: {
      "display-2xl": ["clamp(2.75rem, 6vw, 5rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
      "display-xl":  ["clamp(2.25rem, 5vw, 4rem)", { lineHeight: "1.1",  letterSpacing: "-0.025em" }],
      "display-lg":  ["clamp(1.875rem, 4vw, 3rem)", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
      "headline-lg": ["1.875rem",   { lineHeight: "1.25" }],
      "headline-md": ["1.5rem",     { lineHeight: "1.3"  }],
      "headline-sm": ["1.25rem",    { lineHeight: "1.4"  }],
      "body-lg":     ["1.125rem",   { lineHeight: "1.65" }],
      "body-md":     ["1rem",       { lineHeight: "1.6"  }],
      "body-sm":     ["0.875rem",   { lineHeight: "1.5"  }],
    },
    // ... colors existentes, borderRadius existente
  },
},
```

**Section wrapper — `src/components/Section.tsx`:**

```tsx
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
  const header = (eyebrow ?? title ?? subtitle) ? (
    <header className="mx-auto max-w-3xl space-y-3 text-center">
      {eyebrow && (
        <p className="text-body-sm font-medium uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      )}
      {title && (
        <h2 className="text-headline-lg font-bold tracking-tight text-foreground md:text-display-lg">
          {title}
        </h2>
      )}
      {subtitle && <p className="text-body-lg text-muted-foreground">{subtitle}</p>}
    </header>
  ) : null

  const body = (
    <Tag id={id} className={cn("scroll-mt-24 py-16 md:py-24", className)}>
      <div className={cn("container mx-auto px-4", containerClassName)}>
        {header}
        <div className={header ? "mt-12" : ""}>{children}</div>
      </div>
    </Tag>
  )

  return reveal ? <Reveal>{body}</Reveal> : body
}
```

> `scroll-mt-24` compensa o offset da navbar sticky ao usar `#hash`.

**Retrofit de componentes existentes (este FRD):**

- `Hero.tsx` — migrar `text-4xl md:text-6xl` → `text-display-xl md:text-display-2xl`; `text-xl md:text-2xl` → `text-headline-md md:text-headline-lg`; `text-lg` → `text-body-lg`. Manter o resto (gradiente, blur orbs, pill, ring). **Não** envolver em `<Section>` — Hero permanece único.
- `Skills.tsx`, `Experience.tsx`, `Education.tsx`, `Contact.tsx` — migrar para `<Section>` com `id` correspondente (`skills`, `experience`, `education`, `contact`), `title` puxado do dicionário.

### 4.5 Animações

> **Divergência reconciliada em produção (`feat/m0-visual` PR #9):**
> - `.motion-fade-in-up`: duração final **900ms** (FRD original 600ms).
> - `.motion-fade-in`: duração final **700ms** (FRD original 500ms).
> - Easing aplicado: `cubic-bezier(0.22, 0.61, 0.36, 1)` (FRD original `cubic-bezier(0.16, 1, 0.3, 1)`).
> - Os timings foram ajustados em revisão visual e ficaram como entregues. O snippet abaixo mantém os valores planejados originalmente para histórico.

**Keyframes em `src/app.css` (dentro de `@layer utilities`):**

```css
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

**`src/lib/motion.tsx`:**

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

> Estado inicial `opacity-0` previne flash do conteúdo antes do observer disparar. `prefers-reduced-motion` força `opacity: 1 !important` via media query, anulando o `opacity-0` inicial.

---

## 5. Modelo de dados

### 5.1 Tipos novos — `src/types/i18n.ts`

```typescript
export type Locale = "pt" | "en"

export type LocaleData<T> = Record<Locale, T>
```

### 5.2 Schemas Zod — adicionar em `src/lib/validation.ts`

```typescript
import type { Locale } from "@/types/i18n"

const localeSchema = z.enum(["pt", "en"])

// Mantém heroSchema/skillSchema/experienceSchema/educationSchema existentes.
// Adiciona apenas validateXBy(locale) helpers que decidem entre arquivos PT e EN.
```

### 5.3 Estrutura de arquivos de dados

```
src/data/
├── hero.pt.json
├── hero.en.json
├── skills.pt.json
├── skills.en.json
├── experiences.pt.json
├── experiences.en.json
├── education.pt.json
├── education.en.json
└── projects.pt.json   # M2
    projects.en.json   # M2
```

**Migração de arquivos atuais:**

- `hero.json` → `hero.pt.json` (mesmo conteúdo). Criar `hero.en.json` com tradução de `role`, `tagline`, `avatar.alt`, `cv.versionLabel` (`mai/2026` → `may/2026`).
- `skills.json` → `skills.pt.json` (nomes são proper nouns; muitos não mudam). Criar `skills.en.json` com mesmo conteúdo mais traduções caso existam skills "pedagogicas" descritivas.
- `experiences.json` → `experiences.pt.json`. Criar `experiences.en.json` com `description` traduzida (campo `company` e `role` podem manter PT se nome próprio).
- `education.json` → `education.pt.json`. Criar `education.en.json`.

### 5.4 Dicionário de UI — `src/i18n/locales/{pt,en}/translation.json`

Chaves necessárias para o M0 (mais módulos adicionam suas próprias):

```
nav.skills              nav.experience          nav.contact
nav.backHome            a11y.skipToContent      a11y.openMenu
a11y.closeMenu          theme.toLight           theme.toDark
locale.switchTo         period.present          category.trabalho
category.freelance      category.open-source    category.ensino
status.concluido        status.em-andamento
```

Componentes M1/M3/M4/M5 que migrarem adicionarão chaves próprias (`hero.availabilityBadge`, `hero.viewProjects`, `hero.contactMe`, `hero.downloadCv`, `skills.title`, `experience.title`, `education.title`, `contact.title`, etc.).

---

## 6. Requisitos funcionais

### Navbar

| ID | Requisito |
|----|-----------|
| RF-M0-NAV-01 | Navbar renderiza em todas as rotas (`/`, `/:lang/`, `/:lang/projects`, `/:lang/projects/:id`). |
| RF-M0-NAV-02 | Em `/:lang/` (rota index do locale), nav mostra âncoras para `#skills`, `#experience`, `#contact` — cada uma gated pela sua flag `FEATURES`. |
| RF-M0-NAV-03 | Em `/:lang/projects` e `/:lang/projects/:id`, nav mostra um único link "← Início" apontando para `/:lang/`. |
| RF-M0-NAV-04 | Brand "MH" (SVG inline) sempre visível; clicar leva a `/:lang/`. |
| RF-M0-NAV-05 | Mobile (< md): brand + hamburger; hamburger abre `Sheet` da direita com lista de itens + toggles. |
| RF-M0-NAV-06 | Sticky `top-0 z-50`. Inicial: transparente. Após `scrollY > 8`: `bg-background/80 backdrop-blur-md` + border bottom. |
| RF-M0-NAV-07 | Em `/:lang/`, item ativo (segundo scrollspy) recebe estilo destacado (`text-primary` + `font-medium`). |
| RF-M0-NAV-08 | Toggles ThemeToggle e LocaleToggle sempre visíveis no canto direito, em ambos os viewports. |
| RF-M0-NAV-09 | Skip-link "Pular para conteúdo" renderiza antes da navbar; visível apenas com foco; pula para `#main`. |

### Tema

| ID | Requisito |
|----|-----------|
| RF-M0-THM-01 | `ThemeProvider` envolve toda a aplicação em `root.tsx`. |
| RF-M0-THM-02 | `ThemeToggle` botão único, ícone alterna entre Sun/Moon conforme estado atual. |
| RF-M0-THM-03 | Tema persiste em `localStorage["mh-theme"]` em cada mudança. |
| RF-M0-THM-04 | Primeira visita (sem valor armazenado) lê `prefers-color-scheme` uma vez. |
| RF-M0-THM-05 | Após o primeiro clique no toggle, `prefers-color-scheme` é ignorado. |
| RF-M0-THM-06 | Script inline em `index.html` aplica `.dark` em `document.documentElement` antes do React montar (sem FOUC). |
| RF-M0-THM-07 | Toggle expõe `aria-label` traduzido conforme o estado atual. |

### i18n

| ID | Requisito |
|----|-----------|
| RF-M0-I18N-01 | URLs incluem locale: `/portfolio/pt/...` e `/portfolio/en/...`. |
| RF-M0-I18N-02 | `/` (sem locale) redireciona para `/portfolio/pt/`. Prerender inclui a rota `/` como página de redirect. |
| RF-M0-I18N-03 | `/:lang/` valida `lang` contra `["pt", "en"]`. Locale inválido redireciona para `/pt/`. |
| RF-M0-I18N-04 | Mudar `:lang` na URL muda a língua reativa via `i18n.changeLanguage`. |
| RF-M0-I18N-05 | `LocaleToggle` troca apenas o prefixo de path, preservando o resto da URL. |
| RF-M0-I18N-06 | Dados de cada dataset são carregados do arquivo correspondente ao locale ativo (`hero.{lang}.json`, etc.). |
| RF-M0-I18N-07 | Texto de UI vem 100% do dicionário (`useTranslation`). Sem string hardcoded em componentes. |
| RF-M0-I18N-08 | `formatPeriod` formata datas com `Intl.DateTimeFormat` no locale corrente. |
| RF-M0-I18N-09 | `<html lang>` reflete o locale corrente. |

### Estilo visual

| ID | Requisito |
|----|-----------|
| RF-M0-VIS-01 | Geist Variable Sans + Geist Variable Mono carregados via `@fontsource-variable` em `src/app.css`. |
| RF-M0-VIS-02 | `tailwind.config.js` declara `fontFamily.sans` e `fontFamily.mono` apontando para Geist. |
| RF-M0-VIS-03 | Variáveis HSL de slate + emerald substituem os valores stone atuais em `:root` e `.dark`. |
| RF-M0-VIS-04 | `theme.extend.fontSize` declara 9 tokens (`display-2xl`...`body-sm`). |
| RF-M0-VIS-05 | Componente `<Section>` exporta API `id`, `eyebrow?`, `title?`, `subtitle?`, `as?`, `reveal?`, `className?`, `containerClassName?`, `children`. |
| RF-M0-VIS-06 | Componentes M3/M4/M5 (Skills, Experience, Education, Contact) migram para `<Section>`. |
| RF-M0-VIS-07 | Hero migra para tokens `text-display-*`, `text-headline-*`, `text-body-*` mantendo o gradiente/blur/avatar atuais. |

### Animações

| ID | Requisito |
|----|-----------|
| RF-M0-MOT-01 | `src/lib/motion.tsx` exporta `useInView` e `<Reveal variant>`. |
| RF-M0-MOT-02 | Keyframes `mh-fade-in-up` e `mh-fade-in` definidos em `src/app.css` como utilidades. |
| RF-M0-MOT-03 | `<Section>` envolve seu conteúdo em `<Reveal>` por padrão; consumidor pode desligar com `reveal={false}`. |
| RF-M0-MOT-04 | `@media (prefers-reduced-motion: reduce)` em `app.css` zera `animation`, `transition` e `scroll-behavior`. |
| RF-M0-MOT-05 | Reveal anima apenas `transform` e `opacity` (GPU-friendly). |

---

## 7. Regras de negócio

| ID | Regra |
|----|-------|
| RN-M0-01 | A navbar vive em `src/root.tsx`; nunca duplicada em rotas individuais. |
| RN-M0-02 | Tema é persistido apenas como `"light" \| "dark"` — modo "system" não é uma terceira opção armazenada. |
| RN-M0-03 | Locale corrente é fonte única no segmento `:lang` da URL. `i18n.language` é derivado da URL, nunca o contrário (exceto sincronização interna no `routes/$lang.tsx`). |
| RN-M0-04 | Cada dataset paralelo (`X.pt.json` + `X.en.json`) tem o mesmo shape (validado por `scripts/check-i18n.ts`). |
| RN-M0-05 | Dicionários de UI PT e EN têm exatamente o mesmo conjunto de chaves. Build falha se houver divergência. |
| RN-M0-06 | Hero não é envolvido em `<Section>` — preserva seu layout único. Demais seções obrigatoriamente usam `<Section>`. |
| RN-M0-07 | Animações só usam `transform` ou `opacity`. Animar `height`, `top`, `width`, `background-color` é proibido (jank em mobile). |
| RN-M0-08 | `prefers-reduced-motion: reduce` desliga todas as animações declaradas no projeto e neutraliza o `scroll-behavior: smooth`. |
| RN-M0-09 | A versão do CV em `cv.versionLabel` em `hero.pt.json` é PT (ex: `"mai/2026"`); em `hero.en.json` é EN (ex: `"may/2026"`). O regex `^[a-z]{3}\/\d{4}$` já aceita ambos. |
| RN-M0-10 | A primary color (emerald) é usada apenas em CTAs primárias, links ativos, foco, e elementos de feedback positivo. Não usar como texto longo (contraste reduzido). |
| RN-M0-11 | O active state na navbar é exclusivo: apenas uma âncora ativa por vez (último a entrar no IntersectionObserver vence). |
| RN-M0-12 | `scripts/check-i18n.ts` roda em `prebuild`, paralelo ao `scripts/check-assets.ts`. Qualquer um falhar aborta o build. |

---

## 8. Critérios de aceite

| ID | Critério |
|----|----------|
| CA-M0-01 | Navbar renderiza em todas as rotas. Em `/` mostra âncoras das flags `true`; em `/projects*` mostra "← Home". |
| CA-M0-02 | Em desktop, scroll de 0 a >8px transiciona navbar de transparente para solid+blur. |
| CA-M0-03 | Em mobile, hamburger abre Sheet com todos os itens; ESC e clique fora fecham. |
| CA-M0-04 | Scrollspy destaca a âncora correspondente à seção em viewport central. |
| CA-M0-05 | Skip-link é o primeiro elemento focável da página; ativação leva foco para `<main>`. |
| CA-M0-06 | Sem FOUC: usuário com tema escuro salvo nunca vê paint claro na primeira renderização. |
| CA-M0-07 | Toggle de tema alterna `.dark` em `document.documentElement` e persiste em `localStorage`. |
| CA-M0-08 | `/portfolio/` redireciona o navegador para `/portfolio/pt/` (via meta-refresh + Navigate). |
| CA-M0-09 | `LocaleToggle` em `/pt/projects` navega para `/en/projects` e vice-versa. |
| CA-M0-10 | Todos os componentes M1/M3/M4/M5 (Hero, Skills, Experience, Education, Contact) leem strings via `useTranslation`. Grep `\"[A-ZÁÉÍÓÚ][a-záéíóú\s]+\"` em JSX retorna 0 string user-facing. |
| CA-M0-11 | `pnpm run build` falha se PT e EN divergirem em UI dictionary ou data shape. |
| CA-M0-12 | `formatPeriod("2024-01-01", undefined, "pt")` → `"jan. de 2024 — Presente"`; o mesmo em EN → `"Jan 2024 — Present"`. (Strings exatas dependem do node Intl; teste assert tolerante.) |
| CA-M0-13 | Geist é o font-family computado para `body` em produção. |
| CA-M0-14 | `primary` em modo claro tem contraste ≥ 4.5:1 contra `primary-foreground`. (WCAG AA.) |
| CA-M0-15 | Seções com `<Section reveal>` aparecem com `opacity-0` antes do scroll; transitionam para `opacity-1` quando entram no viewport. |
| CA-M0-16 | Com `prefers-reduced-motion: reduce`, todas as animações `mh-*` ficam neutralizadas — `opacity:1`, `transform:none`, sem `scroll-behavior: smooth`. |
| CA-M0-17 | `pnpm e2e` valida em `/pt/` que skip-link aparece em foco, navbar muda visual ao rolar, e LocaleToggle troca para `/en/`. |
| CA-M0-18 | Cobertura: `validation.ts`, `period.ts` e `motion.tsx` (`useInView`) mantêm 100%. |
| CA-M0-19 | shadcn `sheet` é instalado via `pnpm dlx shadcn@latest add sheet` — nenhuma edição manual em `src/components/ui/sheet.tsx`. |
| CA-M0-20 | `pnpm run typecheck`, `pnpm run lint`, `pnpm test:run` continuam verdes ao fim da branch. |

---

## 9. Plano de testes

### 9.1 Unitários — `src/lib/`

| ID | Alvo | Cenário | Resultado |
|----|------|---------|-----------|
| CT-M0-THM-01 | `theme.tsx` | Sem `localStorage`, sistema escuro | `getInitialTheme` → `"dark"` |
| CT-M0-THM-02 | `theme.tsx` | `localStorage["mh-theme"]="light"` + sistema escuro | `getInitialTheme` → `"light"` |
| CT-M0-THM-03 | `theme.tsx` | `useTheme` → `toggle()` muda valor | rerender mostra novo theme |
| CT-M0-THM-04 | `theme.tsx` | `useTheme` fora do Provider | throw |
| CT-M0-PER-01 | `period.ts` | `formatPeriod("2023-05-01", undefined, "pt")` | regex matches `/mai.*2023.*Presente/i` |
| CT-M0-PER-02 | `period.ts` | `formatPeriod("2023-05-01", undefined, "en")` | regex matches `/may.*2023.*Present/i` |
| CT-M0-PER-03 | `period.ts` | Com `endDate`, PT | regex matches `/mai.*2023.*set.*2024/i` |
| CT-M0-MOT-01 | `motion.tsx` | `useInView` antes do observer | `inView === false` |
| CT-M0-MOT-02 | `motion.tsx` | `useInView` após `IntersectionObserver` callback | `inView === true` (mock observer) |
| CT-M0-SPY-01 | `scrollSpy.ts` | Múltiplos elementos, observer fake | retorna id do último intersecting |

### 9.2 Componente — `src/components/`

`Navbar.test.tsx`:

- Renderiza brand "MH" como link para `/pt/`.
- Em `/pt`, mostra âncoras Skills/Experience/Contact se flags `true`.
- Em `/pt/projects`, mostra apenas link "← Início".
- ThemeToggle e LocaleToggle sempre presentes.
- `axe(container)` sem violações em ambos viewports.

`ThemeToggle.test.tsx`:

- Renderiza ícone Moon quando tema claro, Sun quando escuro.
- Clicar alterna a classe `dark` em `document.documentElement`.
- `aria-label` reflete a próxima ação.

`LocaleToggle.test.tsx`:

- Em `/pt/projects`, clicar navega para `/en/projects`.
- Em `/en/`, clicar navega para `/pt/`.
- `aria-label` localizado.

`Section.test.tsx`:

- Renderiza `<section id={id}>` com `eyebrow`, `title`, `subtitle` quando passados.
- Sem `title`/`eyebrow`/`subtitle`, omite header.
- `as="article"` renderiza `<article>`.
- `reveal={false}` não envolve em `<Reveal>` (DOM não contém `.opacity-0` inicial).
- `axe` sem violações.

`Reveal.test.tsx`:

- Estado inicial: filho dentro de wrapper com `opacity-0`.
- Após mock-trigger do `IntersectionObserver`: wrapper recebe classe da variant (`motion-fade-in-up`).

`SkipLink.test.tsx`:

- Renderiza link `href="#main"`.
- `sr-only` por default; `focus:not-sr-only` ao receber foco (verifica classes Tailwind aplicadas).

### 9.3 E2E — `e2e/`

Atualizar `home.spec.ts` e adicionar `e2e/m0-infra.spec.ts`:

- `home.spec.ts`: ajustar baseURL para `/pt/`. Assert Hero h1 contém "Marco".
- `m0-infra.spec.ts`:
  - Skip-link aparece com `Tab` e tem foco.
  - Scroll de 0 → 100px adiciona classes de blur/border na navbar (verifica `bg-background/80` ou similar).
  - LocaleToggle em `/pt/` navega para `/en/`; texto da pill ("Disponível para...") muda para inglês.
  - ThemeToggle alterna `html.classList` com `dark`.
  - Sheet abre/fecha em viewport mobile (`page.setViewportSize({width: 375, height: 700})`).

Atualizar specs existentes (`projects-list.spec.ts`, `project-detail.spec.ts`, `contact.spec.ts`) para incluir locale prefix `/pt/`.

### 9.4 Guards de build

- `scripts/check-assets.ts` — sem mudanças funcionais, mas precisa rodar com `getHero("pt")` (ou apenas validar `hero.pt.json`).
- `scripts/check-i18n.ts` — testes manuais:
  1. Remover uma chave de `en/translation.json` → `pnpm prebuild` falha com chave faltando.
  2. Adicionar campo a `hero.pt.json` sem espelhar em `hero.en.json` → `pnpm prebuild` falha com shape mismatch.

---

## 10. Arquivos a criar / modificar

| Caminho | Ação | Concern | Notas |
|---------|------|---------|-------|
| `src/components/Navbar.tsx` | criar | NAV | Sticky shell + items por rota |
| `src/components/SkipLink.tsx` | criar | NAV | sr-only → focus visible |
| `src/components/MobileMenu.tsx` | criar | NAV | Sheet trigger + content |
| `src/components/Brand.tsx` | criar | NAV | Monograma MH SVG inline |
| `src/components/ui/sheet.tsx` | gerar via shadcn CLI | NAV | `pnpm dlx shadcn@latest add sheet` |
| `src/components/ThemeToggle.tsx` | criar | THM | Sun/Moon ícone |
| `src/components/LocaleToggle.tsx` | criar | I18N | Globe + 2 letras |
| `src/components/Section.tsx` | criar | VIS | Wrapper API rica |
| `src/lib/theme.tsx` | criar | THM | Context + Provider + hook |
| `src/lib/scroll.ts` | criar | NAV | `useScrolled(threshold)` |
| `src/lib/scrollSpy.ts` | criar | NAV | `useScrollSpy(ids)` |
| `src/lib/motion.tsx` | criar | MOT | `useInView` + `<Reveal>` + variants |
| `src/lib/period.ts` | modificar | I18N | Refatorar para `Intl.DateTimeFormat` |
| `src/lib/validation.ts` | modificar | I18N | Mantém schemas; novos validators por locale opcionais |
| `src/lib/data.ts` | criar | I18N | `getHero(locale)`, `getSkills(locale)`, etc. |
| `src/i18n/index.ts` | criar | I18N | init `i18next` + exports |
| `src/i18n/locales/pt/translation.json` | criar | I18N | Dicionário PT |
| `src/i18n/locales/en/translation.json` | criar | I18N | Dicionário EN |
| `src/types/i18n.ts` | criar | I18N | `Locale`, `LocaleData<T>` |
| `src/data/hero.pt.json` | renomear | I18N | era `hero.json` |
| `src/data/hero.en.json` | criar | I18N | tradução de role/tagline/alt/versionLabel |
| `src/data/skills.pt.json` | renomear | I18N | era `skills.json` |
| `src/data/skills.en.json` | criar | I18N | mesmo shape; PT names em proper nouns |
| `src/data/experiences.pt.json` | renomear | I18N | era `experiences.json` |
| `src/data/experiences.en.json` | criar | I18N | descriptions traduzidas |
| `src/data/education.pt.json` | renomear | I18N | era `education.json` |
| `src/data/education.en.json` | criar | I18N | descriptions traduzidas |
| `src/data/projects.pt.json` | renomear | I18N | era `projects.json` (vazio) |
| `src/data/projects.en.json` | criar | I18N | vazio (preenchido em M2) |
| `src/routes.ts` | modificar | I18N | Nova tabela com `:lang` segment |
| `src/routes/_root-redirect.tsx` | criar | I18N | `/` → `/pt/` |
| `src/routes/$lang.tsx` | criar | I18N | Layout de locale |
| `src/routes/$lang._index.tsx` | renomear | I18N | era `routes/_index.tsx` |
| `src/routes/$lang.projects._index.tsx` | renomear | I18N | era `routes/projects._index.tsx` |
| `src/routes/$lang.projects.$id.tsx` | renomear | I18N | era `routes/projects.$id.tsx` |
| `src/routes/_index.tsx` | deletar | I18N | substituído por `_root-redirect.tsx` |
| `src/root.tsx` | modificar | NAV/THM/I18N/MOT | Adicionar Providers + Navbar + SkipLink |
| `src/components/Hero.tsx` | modificar | VIS/I18N | Migrar para tokens + `useTranslation` |
| `src/components/Skills.tsx` | modificar | VIS/I18N | Migrar para `<Section>` + `useTranslation` |
| `src/components/Experience.tsx` | modificar | VIS/I18N | idem + `formatPeriod(..., locale)` |
| `src/components/Education.tsx` | modificar | VIS/I18N | idem |
| `src/components/Contact.tsx`, `ContactForm.tsx` | modificar | VIS/I18N | `<Section>` + traduções; mensagens de erro de Zod via dicionário |
| `src/app.css` | modificar | VIS/MOT | @import Geist; nova paleta; keyframes; reduced-motion media query |
| `tailwind.config.js` | modificar | VIS | `fontFamily.sans/mono` + `fontSize` tokens |
| `react-router.config.ts` | modificar | I18N | `prerender` expandido |
| `index.html` | modificar | THM | Script inline anti-FOUC |
| `package.json` | modificar | NAV/THM/I18N/VIS | + deps + scripts |
| `scripts/check-i18n.ts` | criar | I18N | Guard de paridade |
| `e2e/m0-infra.spec.ts` | criar | NAV/THM/I18N/MOT | Smoke E2E do M0 |
| `e2e/home.spec.ts` | modificar | I18N | baseURL com `/pt/` |
| `e2e/projects-list.spec.ts` | modificar | I18N | rota `/pt/projects` |
| `e2e/project-detail.spec.ts` | modificar | I18N | rota `/pt/projects/:id` |
| `e2e/contact.spec.ts` | modificar | I18N | rota `/pt/#contact` |
| `docs/spec.md` | modificar | — | Remover i18n de §5 fora-de-escopo; adicionar M0 a §3 |
| `docs/scaffolding-state.md` | modificar | — | Próxima versão registra M0 entregue |
| `docs/features/m0-infra/frd-m0-infra.md` | criar | — | Este documento |

**Novas dependências (`package.json`):**

- `react-i18next` (latest 14.x)
- `i18next` (latest 23.x)
- `@fontsource-variable/geist` (^5.x)
- `@fontsource-variable/geist-mono` (^5.x)

`tsx` já está em devDeps por causa de `scripts/check-assets.ts` — reaproveitar para `scripts/check-i18n.ts`.

---

## 11. Ordem de implementação (TDD onde aplicável)

**Quatro sub-branches sequenciais**, cada uma mergeada para `main` antes da próxima começar:

| Ordem | Branch | Conteúdo |
|-------|--------|----------|
| 1 | `feat/m0-visual` | Fases A + B (tokens visuais, fontes, paleta, `<Section>`, Motion, retrofit M1/M3/M4/M5) |
| 2 | `feat/m0-theme` | Fase C (`ThemeProvider`, anti-FOUC, `ThemeToggle`) |
| 3 | `feat/m0-i18n` | Fase D (i18next, split de dados por locale, rotas com `:lang`, `LocaleToggle`, `check-i18n`, basename `/portfolio/`) |
| 4 | `feat/m0-navbar` | Fase E (Sheet, SkipLink, Brand, Navbar, MobileMenu, wiring em `root.tsx`) |

Fase F (E2E + docs) é distribuída entre as sub-branches: cada uma fecha com os specs E2E relevantes ao seu concern e doc sync local. O update final em `docs/scaffolding-state.md` registrando M0 entregue acontece no merge da última sub-branch.

Estimativa total: 25–30 commits agrupados por concern. Pre-commit hook deve passar em cada commit (lint-staged → typecheck → test:run).

### Fase A — Estilo visual (sem mudar comportamento de rotas)

1. `chore(deps): add Geist Variable fonts` — `pnpm add @fontsource-variable/geist @fontsource-variable/geist-mono`.
2. `feat(style): wire Geist and font-family tokens` — `app.css` imports + `tailwind.config.js` `fontFamily`.
3. `feat(style): swap palette to slate + emerald` — `app.css` HSL vars (light + dark).
4. `feat(style): add typography size tokens` — `tailwind.config.js` `fontSize` 9 tokens.
5. `refactor(hero): migrate to new typography tokens` — Hero.tsx atualizado, screenshots verificados.

> Após Fase A, app continua funcional com visual atualizado. Sem regressão.

### Fase B — Section + Motion (continua sem mudar rotas)

6. `feat(motion): add motion utilities` — `src/lib/motion.tsx` + keyframes em `app.css` + reduced-motion media query. Testes de `useInView` mockando `IntersectionObserver`.
7. `feat(ui): add Section wrapper` — `src/components/Section.tsx` + testes RTL.
8. `refactor(skills): migrate to Section` — Skills.tsx usa `<Section>`.
9. `refactor(experience): migrate to Section` — Experience + Education.
10. `refactor(contact): migrate to Section` — Contact.

### Fase C — Tema

11. `feat(theme): add ThemeProvider and useTheme` — `src/lib/theme.tsx` + testes do hook (Provider wrapper, localStorage mock, matchMedia mock).
12. `feat(theme): add anti-FOUC inline script` — modifica `index.html`.
13. `feat(theme): add ThemeToggle component` — testes RTL + axe.
14. `feat(root): wire ThemeProvider` — atualiza `src/root.tsx`.

### Fase D — i18n

15. `chore(deps): add i18next + react-i18next` — `pnpm add i18next react-i18next`.
16. `feat(i18n): init i18n config and PT/EN dictionaries` — `src/i18n/index.ts` + dois `translation.json` com todas as chaves M0.
17. `feat(i18n): split data files by locale` — renomeia/cria `*.pt.json` e `*.en.json` para hero/skills/experiences/education/projects.
18. `feat(i18n): add data loaders by locale` — `src/lib/data.ts`.
19. `feat(i18n): refactor period to Intl by locale` — `src/lib/period.ts` + testes.
20. `feat(i18n): add check-i18n build guard` — `scripts/check-i18n.ts` + wire em `prebuild` (compor com `check-assets.ts`).
21. `feat(routes): restructure to locale-prefixed paths` — `src/routes.ts` + `routes/$lang.tsx` + `routes/$lang._index.tsx` (move) + `routes/_root-redirect.tsx`. `react-router.config.ts` prerender atualizado.
22. `refactor(hero): consume i18n + locale data` — Hero usa `useTranslation` e `getHero(locale)`.
23. `refactor(skills,experience,education,contact): consume i18n + locale data`.
24. `feat(i18n): add LocaleToggle component` — testes RTL + e2e smoke.

### Fase E — Navbar

25. `feat(ui): add Sheet primitive` — `pnpm dlx shadcn@latest add sheet`.
26. `feat(nav): add SkipLink, Brand, useScrolled, useScrollSpy` — utilidades + `Brand.tsx` + `SkipLink.tsx`.
27. `feat(nav): add Navbar with desktop items` — `Navbar.tsx` consumindo FEATURES + scrollspy + scroll state.
28. `feat(nav): add MobileMenu via Sheet` — drawer para < md.
29. `feat(root): mount Navbar and SkipLink in root.tsx`.

### Fase F — Fechamento (distribuída entre sub-branches)

- **F.1 — em `feat/m0-visual`**: atualiza testes RTL/unitários afetados pelos novos tokens. Sem mudança em E2E — rotas inalteradas nesta sub-branch.
- **F.2 — em `feat/m0-theme`**: subset de `e2e/m0-infra.spec.ts` cobrindo ThemeToggle + ausência de FOUC.
- **F.3 — em `feat/m0-i18n`**: migra specs existentes (`home`, `projects-list`, `project-detail`, `contact`) para baseURL `/pt/`; adiciona LocaleToggle smoke; `docs(spec): remove i18n from out-of-scope; reference M0 FRD`.
- **F.4 — em `feat/m0-navbar`**: completa `e2e/m0-infra.spec.ts` com navbar + skip-link + mobile sheet; `docs(state): record M0 delivery`.

> Cada commit roda pre-commit hook completo. Falha em qualquer etapa exige correção antes de seguir.

### 11.1 Merge checklist por sub-branch

Cada sub-branch entra em `main` via `--ff-only` ou squash, e só após sua checklist passar. A próxima sub-branch parte do `main` atualizado.

**`feat/m0-visual` → `main`:**

- [ ] `pnpm run lint`, `pnpm run typecheck`, `pnpm test:run` verdes
- [ ] Comparação visual manual (Hero, Skills, Experience, Education, Contact) antes/depois
- [ ] Contraste WCAG AA validado em modo claro e escuro para `primary`, `foreground`, `muted-foreground`
- [ ] `pnpm run build` sem erros (prebuild guard de assets continua passando)

**`feat/m0-theme` → `main`:**

- [ ] Sem FOUC na primeira carga com tema escuro salvo (validado manualmente em browser real)
- [ ] `prefers-color-scheme` respeitado apenas na primeira visita; ignorado após primeiro clique
- [ ] `localStorage["mh-theme"]` persiste após reload
- [ ] Testes unitários de `useTheme` + componentes verdes; subset de `e2e/m0-infra.spec.ts` para ThemeToggle passa

**`feat/m0-i18n` → `main`:**

- [ ] `pnpm run check:i18n` passa (rodando dentro de `prebuild`)
- [ ] `basename: "/portfolio/"` aplicado em `react-router.config.ts` (D-BASE-01)
- [ ] `/portfolio/` redireciona para `/portfolio/pt/` em build estático
- [ ] `/portfolio/pt/projects` e `/portfolio/en/projects` prerenderizam
- [ ] Grep por strings PT/EN hardcoded em componentes user-facing retorna 0 ocorrências
- [ ] E2E `home`, `projects-list`, `project-detail`, `contact` migradas para `/pt/...` e verdes

**`feat/m0-navbar` → `main`:**

- [ ] Skip-link foca em `<main>` em todas as rotas
- [ ] Navbar transparente → blur+border ao rolar (`scrollY > 8`)
- [ ] Sheet abre/fecha em mobile com Escape e clique fora
- [ ] Scrollspy destaca a seção em viewport central
- [ ] `docs/scaffolding-state.md` registra M0 entregue
- [ ] CI completo verde; deploy GH Pages valida `/portfolio/pt/`, `/portfolio/en/`, `/portfolio/pt/projects`

---

## 12. Itens em aberto (não-bloqueantes)

| Item | Responsável | Quando |
|------|-------------|--------|
| Tradução real EN das taglines, descriptions, role em todos os datasets | Marco (revisão) | Antes do merge |
| Decisão sobre cor exata do emerald (HSL declarado é alvo — pode ser ajustado para contraste WCAG AA com `primary-foreground` em ambos os modos) | Implementação | Durante Fase A |
| Curva de easing alternativa para `mh-fade-in-up` se a atual (`cubic-bezier(0.16, 1, 0.3, 1)`) sentir lenta | Tuning | Durante Fase B |
| Decidir se Skills e Education recebem `eyebrow` (ex: "Stack" / "Formação") | Copy | Durante Fase D |
| Tracking de acessibilidade: testar com leitor de tela (NVDA/VoiceOver) após M0 | QA manual | Pós-implementação |
| Page transitions cross-route (view transitions API) | Futuro | Pós-v1 |
| Sincronização ativa do dark mode com `prefers-color-scheme` mesmo após escolha manual (3-state implícito) | Possível ADR futuro | v1.x |

---

## 13. Histórico

| Versão | Data | Mudança |
|--------|------|---------|
| 0.1.0 | 2026-05-15 | FRD inicial. Derivado de sessão de brainstorm de 5 rounds (navbar, tema, i18n, visual, animações) com 26 decisões fechadas. |
| 0.3.0 | 2026-05-18 | Reconciliação documental durante `feat/m0-navbar`. §4.4 e §4.5 ganham notas de divergência registrando as escolhas entregues por `feat/m0-visual` (Geist Mono default, fontFamily.display Asimovian, durações 900/700ms, easing `0.22, 0.61, 0.36, 1`). FRD permanece source-of-truth de intenção; divergências entregues passam a ser explícitas em vez de tribais. |
| 0.2.0 | 2026-05-15 | Split de implementação em 4 sub-branches sequenciais (`feat/m0-visual` → `theme` → `i18n` → `navbar`) com merge checklist por sub-branch (§11.1). D-BASE-01 documenta `basename: "/portfolio/"` alinhando com subpath GH Pages. URLs em `_root-redirect.tsx` (canonical + meta refresh) carregam `/portfolio/` explícito. |
