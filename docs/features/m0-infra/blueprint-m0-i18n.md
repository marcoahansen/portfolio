# Blueprint — `feat/m0-i18n` (Fase D do FRD M0)

**Versão:** 0.1.0
**Status:** Draft — aguardando aval das decisões §7 antes de implementar
**FRD de origem:** `docs/features/m0-infra/frd-m0-infra.md` (v0.2.0)
**Handoff anterior:** `docs/features/m0-infra/handoff-m0.md` (v0.2.0) + `handoff-m0-visual.md`
**Branch base:** `main` (HEAD `8a625bc` — merge de `feat/m0-theme`)
**Branch alvo:** `feat/m0-i18n` → `main`

> Plano da **terceira** sub-branch de M0. Cobre apenas Fase D (i18next + dicionários PT/EN, split de dados por locale, rotas `:lang`, `LocaleToggle`, guard `check-i18n`, refatorações de Hero/Skills/Experience/Education/Contact/ContactForm/ThemeToggle para consumir `useTranslation`) + Fase F.3 (migração de specs E2E para `/pt/`, doc spec sync). Nada de Navbar, SkipLink, MobileMenu, Sheet — fica para `feat/m0-navbar`. `basename: "/portfolio/"` já está em `react-router.config.ts` desde antes do M0 — D-PREEXISTING-BASENAME (do blueprint m0-theme) **encerra aqui**.

---

## 1. Pré-flight

Antes do primeiro commit:

1. `git checkout main && git pull --ff-only` — confirmar HEAD `8a625bc` (merge de `feat/m0-theme`).
2. `git checkout -b feat/m0-i18n`.
3. `pnpm install --frozen-lockfile`.
4. Baseline verde: `pnpm run lint && pnpm run typecheck && pnpm run test:run && pnpm run build && pnpm run e2e`.
5. Confirmar `Intl.DateTimeFormat("pt-BR")` e `Intl.DateTimeFormat("en-US")` produzem outputs estáveis no Node 22: `node -e 'console.log(new Intl.DateTimeFormat("pt-BR",{month:"short",year:"numeric"}).format(new Date("2024-01-01")))'` deve retornar algo como `"jan. de 2024"`. Se o output mudar entre versões de ICU, ver D-PERIOD-FORMAT (§7).
6. Confirmar que `i18next@latest` e `react-i18next@latest` resolvem com o React 19 em uso: `pnpm view i18next peerDependencies` e `pnpm view react-i18next peerDependencies`.

---

## 2. Inventário de arquivos

### 2.1 Criar

| Caminho | Concern | Comentário |
|---------|---------|------------|
| `src/i18n/index.ts` | I18N | Init `i18next` + `initReactI18next`, exporta `LOCALES`, `Locale`, `DEFAULT_LOCALE`, `isLocale` |
| `src/i18n/index.test.ts` | I18N | Testa `isLocale`, init default, resources carregadas |
| `src/i18n/locales/pt/translation.json` | I18N | Dicionário PT-BR — todas as chaves M0 (nav, a11y, theme, locale, period, category, status, hero, skills, experience, education, contact) |
| `src/i18n/locales/en/translation.json` | I18N | Mesmo shape em EN |
| `src/types/i18n.ts` | I18N | `export type Locale = "pt" \| "en"`, `LocaleData<T>` |
| `src/lib/data.ts` | I18N | `getHero(locale)`, `getSkills(locale)`, `getExperiences(locale)`, `getEducation(locale)`, `getProjects(locale)` — validação no boot |
| `src/lib/data.test.ts` | I18N | Cada loader retorna dado validado; cada locale retorna conteúdo distinto |
| `src/components/LocaleToggle.tsx` | I18N | Botão Globe + sigla; troca prefixo `:lang` preservando resto do path |
| `src/components/LocaleToggle.test.tsx` | I18N | PT→EN navega, EN→PT navega, `aria-label` localizado, axe |
| `src/routes/_root-redirect.tsx` | I18N | `<Navigate to="/pt/" replace>` + `meta()` com canonical + meta refresh |
| `src/routes/$lang.tsx` | I18N | Layout do locale: valida `lang`, redireciona inválido, sincroniza `i18n.changeLanguage`, atualiza `<html lang>` via `useEffect` |
| `src/routes/$lang._index.tsx` | I18N | **Renomear** de `_index.tsx`. Substitui imports para `getX(locale)` em vez de json estático |
| `src/routes/$lang.projects._index.tsx` | I18N | **Renomear** de `projects._index.tsx` |
| `src/routes/$lang.projects.$id.tsx` | I18N | **Renomear** de `projects.$id.tsx` |
| `src/data/hero.en.json` | I18N | Tradução EN do hero (role, tagline, avatar.alt, cv.versionLabel) |
| `src/data/skills.en.json` | I18N | Mesmo shape; quase tudo proper noun (React, TypeScript) — só `category` muda via dicionário |
| `src/data/experiences.en.json` | I18N | `description` traduzida; `company` e `role` ficam em PT se nome próprio (ver D-DATA-CONTENT) |
| `src/data/education.en.json` | I18N | `description` traduzida |
| `src/data/projects.en.json` | I18N | `[]` (vazio até M2) — paralelo a `projects.pt.json` |
| `scripts/check-i18n.ts` | I18N | Paridade UI dict + paridade shape datasets. Roda em `prebuild` paralelo a `check-assets.ts` |

### 2.2 Modificar

| Caminho | Concern | Mudança |
|---------|---------|---------|
| `package.json` | I18N | `+ i18next`, `+ react-i18next`. `prebuild` chama `check-i18n.ts` após `check-assets.ts`. Adicionar script `check:i18n` |
| `src/lib/period.ts` | I18N | Trocar `PT_BR_MONTHS` hardcoded por `Intl.DateTimeFormat(localeMap[locale])`. Assinatura nova: `formatPeriod(start, end, locale)`. `sortByRecency` inalterado |
| `src/lib/period.test.ts` | I18N | Asserts com regex tolerante (ICU varia). Passa locale em todos os casos. Adiciona CT-M0-PER-02 (EN) e CT-M0-PER-03 (intervalo com endDate) |
| `src/lib/validation.ts` | I18N | Sem mudança de schema. Adicionar `validateProjects` (já tem para hero/skills/experiences/education — projects entra para M2 mas o validator pode existir aqui antecipadamente). Mensagens Zod em `contactFormSchema` precisam ser deslocadas para o componente (ver D-CONTACT-ZOD-I18N) |
| `src/lib/contactSubmit.ts` | I18N | Sem mudança (EmailJS é language-agnostic) |
| `src/data/hero.json` | I18N | **Renomear** para `hero.pt.json` |
| `src/data/skills.json` | I18N | **Renomear** para `skills.pt.json` |
| `src/data/experiences.json` | I18N | **Renomear** para `experiences.pt.json` |
| `src/data/education.json` | I18N | **Renomear** para `education.pt.json` |
| `src/data/projects.json` | I18N | **Renomear** para `projects.pt.json` |
| `src/components/Hero.tsx` | I18N | `useTranslation` para tagline-aux ("Disponível para projetos"), CTAs ("Ver projetos", "Falar comigo", "Baixar CV"), label do CV ("Versão"). Dados (`displayName`, `role`, `tagline`, `email`, `github.url`, etc.) continuam vindo de `hero.{lang}.json` via `getHero(locale)` |
| `src/components/Skills.tsx` | I18N | Title, eyebrow (se houver), category headers via dict (`t("category.frontend")` etc.) |
| `src/components/Experience.tsx` | I18N | Title via dict, `formatPeriod(..., locale)` |
| `src/components/Education.tsx` | I18N | Title via dict, `formatPeriod(..., locale)` |
| `src/components/Contact.tsx` | I18N | Title, subtitle, labels de alt channels via dict. Manter email/linkedin como dados |
| `src/components/ContactForm.tsx` | I18N | Labels, placeholders, button text, success/error messages, validation messages — todos via `useTranslation`. Zod custom errorMap por locale (D-CONTACT-ZOD-I18N) |
| `src/components/ThemeToggle.tsx` | I18N | Trocar PT hardcoded ("Mudar para tema claro/escuro") por `t("theme.toLight")`/`t("theme.toDark")` — encerra D-TOGGLE-I18N do blueprint m0-theme |
| `src/root.tsx` | I18N | Import `@/i18n` no topo (side effect inicializa i18next). Pode permanecer rendering como está — `$lang.tsx` cuida da sync de locale |
| `src/routes.ts` | I18N | Nova tabela: index→redirect, `layout("$lang.tsx", [...children])` |
| `react-router.config.ts` | I18N | `prerender: ["/", "/pt", "/pt/projects", "/en", "/en/projects"]`. `basename` permanece `/portfolio/` |
| `index.html` | I18N | `<html lang="pt-BR">` ok (root inicial). $lang.tsx atualiza reativamente após hydration |
| `e2e/home.spec.ts` | I18N | baseURL pattern com `/pt/`; ajustar URLs e waitForHydration |
| `e2e/projects-list.spec.ts` | I18N | URLs `/pt/projects` |
| `e2e/project-detail.spec.ts` | I18N | URLs `/pt/projects/:id` |
| `e2e/contact.spec.ts` | I18N | URLs `/pt/#contact` |
| `e2e/m0-infra.spec.ts` | I18N | Adicionar specs de LocaleToggle (PT→EN preservando path); manter specs de theme |
| `docs/spec.md` | I18N | §5 remover "i18n PT/EN" de fora-de-escopo. §3 listar M0 entregue |

### 2.3 Sem mudança nesta sub-branch

`src/app.css`, `tailwind.config.js`, `src/components/Section.tsx`, `src/lib/motion.tsx`, `src/lib/theme.tsx`, `src/lib/cn.ts`, `src/lib/features.ts`, `src/lib/withBase.ts`, `src/lib/filterProjects.ts`, `src/components/ui/**`, `src/types/domain.ts`, `vitest.config.ts`, `tsconfig*.json`, `playwright.config.ts`, todos os `*.test.tsx` de motion/section/theme/Skills/Education/Experience/Contact/ContactForm/Hero (alguns terão diffs por causa de string literal updates — esperado, mas o **arquivo** não é reescrito do zero).

`docs/scaffolding-state.md` **não é atualizado** nesta sub-branch — o update final que registra M0 entregue acontece em `feat/m0-navbar` (FRD §11 Fase F.4).

---

## 3. Conteúdo esperado por arquivo

### 3.1 `src/i18n/index.ts`

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

Side-effect na importação: `i18n.init(...)` roda 1× quando `src/root.tsx` importar o módulo. **Antes** de qualquer componente renderizar. `useSuspense: false` evita boundary obrigatório no consumidor. `returnNull: false` faz `t("missing.key")` retornar a própria chave (visível no UI) em vez de `null` — facilita detectar chaves faltando durante dev.

> Tipos: `import "i18next"` ambient para `Resources` é nice-to-have mas não é obrigatório no M0. Adicionar em iteração futura se chaves crescerem.

### 3.2 `src/i18n/locales/pt/translation.json`

Estrutura mínima M0:

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
    "toLight": "Mudar para tema claro",
    "toDark": "Mudar para tema escuro"
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
  "skillCategory": {
    "frontend": "Frontend",
    "backend": "Backend",
    "tools": "Ferramentas",
    "practices": "Práticas",
    "pedagogical": "Pedagógicas"
  },
  "status": {
    "concluido": "Concluído",
    "em-andamento": "Em andamento"
  },
  "hero": {
    "availability": "Disponível para projetos",
    "viewProjects": "Ver projetos",
    "contactMe": "Falar comigo",
    "downloadCv": "Baixar CV",
    "cvVersion": "Versão"
  },
  "skills": {
    "title": "Habilidades"
  },
  "experience": {
    "title": "Experiência"
  },
  "education": {
    "title": "Formação"
  },
  "contact": {
    "title": "Contato",
    "subtitle": "Manda mensagem ou usa um dos canais abaixo.",
    "form": {
      "name": "Nome",
      "email": "E-mail",
      "subject": "Assunto",
      "message": "Mensagem",
      "submit": "Enviar mensagem",
      "submitting": "Enviando...",
      "success": "Mensagem enviada. Vou retornar em breve.",
      "errors": {
        "invalidEmail": "Informe um e-mail válido.",
        "messageTooShort": "Mensagem precisa ter pelo menos 10 caracteres.",
        "messageTooLong": "Mensagem é muito longa (máx 1000 caracteres).",
        "required": "Campo obrigatório.",
        "submitFailed": "Não consegui enviar. Tenta de novo em alguns minutos."
      }
    },
    "altChannels": {
      "heading": "Outros canais",
      "email": "E-mail",
      "linkedin": "LinkedIn"
    }
  }
}
```

> O conjunto exato de chaves de `contact.form.errors` precisa **casar** com o que `ContactForm.tsx` consome via `t(...)`. Se Zod schema usar custom error map, mapear `z.invalid_string` → `contact.form.errors.invalidEmail` etc. (D-CONTACT-ZOD-I18N).

`en/translation.json` é estruturalmente idêntico — só os valores mudam. Exemplos: `"Habilidades"` → `"Skills"`, `"Mudar para tema claro"` → `"Switch to light theme"`, `"Disponível para projetos"` → `"Available for projects"`.

### 3.3 `src/types/i18n.ts`

```typescript
export type Locale = "pt" | "en"
export type LocaleData<T> = Record<Locale, T>
```

> `Locale` é **re-exportado** de `src/i18n/index.ts` para conveniência; o tipo definitivo vive em `src/types/i18n.ts`. Importar via `import type { Locale } from "@/types/i18n"`.

### 3.4 `src/lib/data.ts`

```typescript
import heroPt from "@/data/hero.pt.json"
import heroEn from "@/data/hero.en.json"
import skillsPt from "@/data/skills.pt.json"
import skillsEn from "@/data/skills.en.json"
import experiencesPt from "@/data/experiences.pt.json"
import experiencesEn from "@/data/experiences.en.json"
import educationPt from "@/data/education.pt.json"
import educationEn from "@/data/education.en.json"
import projectsPt from "@/data/projects.pt.json"
import projectsEn from "@/data/projects.en.json"
import {
  validateHero,
  validateSkills,
  validateExperiences,
  validateEducation,
  validateProjects,
} from "@/lib/validation"
import { sortByRecency } from "@/lib/period"
import type { Locale } from "@/types/i18n"
import type {
  Hero,
  Skill,
  Experience,
  Education,
  Project,
} from "@/types/domain"

const hero: Record<Locale, Hero> = {
  pt: validateHero(heroPt),
  en: validateHero(heroEn),
}
const skills: Record<Locale, Skill[]> = {
  pt: validateSkills(skillsPt),
  en: validateSkills(skillsEn),
}
const experiences: Record<Locale, Experience[]> = {
  pt: sortByRecency(validateExperiences(experiencesPt)),
  en: sortByRecency(validateExperiences(experiencesEn)),
}
const education: Record<Locale, Education[]> = {
  pt: sortByRecency(validateEducation(educationPt)),
  en: sortByRecency(validateEducation(educationEn)),
}
const projects: Record<Locale, Project[]> = {
  pt: validateProjects(projectsPt),
  en: validateProjects(projectsEn),
}

export const getHero = (locale: Locale): Hero => hero[locale]
export const getSkills = (locale: Locale): Skill[] => skills[locale]
export const getExperiences = (locale: Locale): Experience[] => experiences[locale]
export const getEducation = (locale: Locale): Education[] => education[locale]
export const getProjects = (locale: Locale): Project[] => projects[locale]
```

Validação **no boot** (top-level await é desnecessário pois `validate*` são síncronos). Erro de shape aborta o carregamento de `data.ts` — qualquer rota que importe lança no client antes do componente renderizar.

> `validateProjects` precisa existir em `src/lib/validation.ts` mesmo que `projects.{pt,en}.json` sejam `[]` no M0. Adicionar como `z.array(projectSchema)` (`projectSchema` já existe).

### 3.5 `src/lib/period.ts` (refator)

```typescript
import type { Locale } from "@/types/i18n"

const intlLocale: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en-US",
}

const presentLabel: Record<Locale, string> = {
  pt: "Presente",
  en: "Present",
}

const cache = new Map<Locale, Intl.DateTimeFormat>()
function getFormatter(locale: Locale): Intl.DateTimeFormat {
  let fmt = cache.get(locale)
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(intlLocale[locale], {
      month: "short",
      year: "numeric",
    })
    cache.set(locale, fmt)
  }
  return fmt
}

export function formatPeriod(
  startDate: string,
  endDate: string | undefined,
  locale: Locale,
): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(startDate)
  if (!match) throw new Error(`Invalid ISO date: ${startDate}`)
  const fmt = getFormatter(locale)
  const start = fmt.format(new Date(startDate))
  const end = endDate ? fmt.format(new Date(endDate)) : presentLabel[locale]
  return `${start} — ${end}`
}

type Datable = { startDate: string; endDate?: string | undefined }
export function sortByRecency<T extends Datable>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const aOngoing = !a.endDate
    const bOngoing = !b.endDate
    if (aOngoing !== bOngoing) return aOngoing ? -1 : 1
    return b.startDate.localeCompare(a.startDate)
  })
}
```

`sortByRecency` **não muda** — não é locale-dependent. Cache de `Intl.DateTimeFormat` evita reinstanciar a cada chamada (relevante para Experience com muitos itens).

> **Breaking change**: signature de `formatPeriod` ganha 3º parâmetro obrigatório. Call sites em `Experience.tsx` e `Education.tsx` precisam passar `locale` (vindo de `useTranslation`).

### 3.6 `src/lib/period.test.ts` (atualizar)

Substituir asserts com strings exatas por regex tolerante. ICU varia entre versões de Node:

```typescript
import { formatPeriod, sortByRecency } from "@/lib/period"

describe("formatPeriod", () => {
  it("CT-M0-PER-01: PT start without end → uses 'Presente'", () => {
    expect(formatPeriod("2023-05-01", undefined, "pt")).toMatch(/2023.*Presente/i)
  })
  it("CT-M0-PER-02: EN start without end → uses 'Present'", () => {
    expect(formatPeriod("2023-05-01", undefined, "en")).toMatch(/2023.*Present/i)
  })
  it("CT-M0-PER-03: PT with endDate → range with two formatted dates", () => {
    expect(formatPeriod("2023-05-01", "2024-09-30", "pt")).toMatch(/2023.*2024/)
  })
  it("CT-M0-PER-04: invalid ISO → throws", () => {
    expect(() => formatPeriod("2023/05/01", undefined, "pt")).toThrow()
  })
})
// sortByRecency: testes existentes mantidos
```

Coverage alvo 100% (CA-M0-18).

### 3.7 `src/routes.ts` (refator)

```typescript
import { type RouteConfig, index, route, layout } from "@react-router/dev/routes"

export default [
  index("routes/_root-redirect.tsx"),
  layout("routes/$lang.tsx", [
    route(":lang", "routes/$lang._index.tsx"),
    route(":lang/projects", "routes/$lang.projects._index.tsx"),
    route(":lang/projects/:id", "routes/$lang.projects.$id.tsx"),
  ]),
] satisfies RouteConfig
```

> Atenção ao casamento da convenção RR7 file-based. Se `routes/$lang.tsx` for layout, os filhos precisam ser **rotas separadas** que renderizam dentro do `<Outlet />` do layout. Validar com `pnpm typecheck` que o typegen do RR7 aceita essa estrutura (variantes possíveis: convenção `$lang.*` é alternativa flat sem `layout()` wrapper; confirmar qual gera os tipos corretos).

### 3.8 `src/routes/_root-redirect.tsx`

```tsx
import { Navigate } from "react-router"
import { DEFAULT_LOCALE } from "@/i18n"

export function meta() {
  return [
    {
      tagName: "link",
      rel: "canonical",
      href: `/portfolio/${DEFAULT_LOCALE}/`,
    },
    {
      httpEquiv: "refresh",
      content: `0; url=/portfolio/${DEFAULT_LOCALE}/`,
    },
  ]
}

export default function RootRedirect() {
  return <Navigate to={`/${DEFAULT_LOCALE}/`} replace />
}
```

Meta refresh garante que crawlers e clients sem JS sigam o redirect. `Navigate` cuida do client-side.

### 3.9 `src/routes/$lang.tsx`

```tsx
import { Outlet, useParams, Navigate } from "react-router"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { isLocale } from "@/i18n"

export default function LangLayout() {
  const { lang } = useParams()
  const { i18n } = useTranslation()

  useEffect(() => {
    if (isLocale(lang) && i18n.language !== lang) {
      i18n.changeLanguage(lang)
      document.documentElement.setAttribute("lang", lang === "pt" ? "pt-BR" : "en-US")
    }
  }, [lang, i18n])

  if (!isLocale(lang)) {
    return <Navigate to="/pt/" replace />
  }
  return <Outlet />
}
```

`<html lang>` atualiza reativamente (RF-M0-I18N-09). Sem fallback no SSR — prerender emite `lang="pt-BR"` por default (do `Layout` em root.tsx); client patches após mount em `/en/`. Mismatch de hydration aqui é **separado** do mismatch já suprimido em `<html>` por `feat/m0-theme` — mesmo `suppressHydrationWarning` cobre.

### 3.10 `src/routes/$lang._index.tsx`

```tsx
import type { Route } from "./+types/$lang._index"
import { useTranslation } from "react-i18next"
import { isLocale } from "@/i18n"
import { getHero, getSkills, getExperiences, getEducation } from "@/lib/data"
import { Hero } from "@/components/Hero"
import { Skills } from "@/components/Skills"
import { Experience } from "@/components/Experience"
import { Education } from "@/components/Education"
import { Contact } from "@/components/Contact"
import { FEATURES } from "@/lib/features"
import { sendContactEmail } from "@/lib/contactSubmit"

export function meta(args: Route.MetaArgs): Route.MetaDescriptors {
  const lang = args.params.lang
  const locale = isLocale(lang) ? lang : "pt"
  const hero = getHero(locale)
  return [
    { title: `${hero.displayName} — ${hero.role}` },
    { name: "description", content: hero.tagline },
  ]
}

export default function HomeRoute() {
  const { i18n } = useTranslation()
  const locale = isLocale(i18n.language) ? i18n.language : "pt"
  const hero = getHero(locale)
  const skills = getSkills(locale)
  const experiences = getExperiences(locale)
  const education = getEducation(locale)

  return (
    <main id="main">
      <Hero hero={hero} />
      {FEATURES.skills && <Skills skills={skills} />}
      {FEATURES.experience && (
        <>
          <Experience experiences={experiences} />
          <Education items={education} />
        </>
      )}
      {FEATURES.contact && (
        <Contact
          email={hero.email}
          linkedinUrl={hero.linkedin.url}
          onSubmit={sendContactEmail}
        />
      )}
    </main>
  )
}
```

> `id="main"` no `<main>` é preparação para `feat/m0-navbar` (SkipLink alvo). Não há SkipLink ainda mas o anchor é estável.

`$lang.projects._index.tsx` e `$lang.projects.$id.tsx` seguem padrão análogo — substituem imports estáticos por `getProjects(locale)`.

### 3.11 `src/components/LocaleToggle.tsx`

```tsx
import { Globe } from "lucide-react"
import { useNavigate, useLocation } from "react-router"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { isLocale } from "@/i18n"

export function LocaleToggle() {
  const { i18n, t } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const current = isLocale(i18n.language) ? i18n.language : "pt"
  const other = current === "pt" ? "en" : "pt"

  const switchLocale = () => {
    const next = pathname.replace(/^\/(pt|en)/, `/${other}`)
    navigate(next)
  }

  return (
    <Button
      type="button"
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

Comportamento:
- `/pt/projects` → click → `/en/projects` (regex troca prefixo, resto preservado — RF-M0-I18N-05).
- `/pt/` (com hash) `/pt/#contact` → mantém hash (regex só toca primeiro segmento).
- Sem locale na URL (`/`) → não acontece em rotas reais; defensive: `pathname.replace` no-op, navigate fica em `/`.

> **Hydration**: igual ao `ThemeToggle`, este botão renderiza dependente de `i18n.language` que pode diferir entre server (default "pt") e client (recém-trocado para "en"). Sem URL inicial `/en/...` no prerender direto, mismatch é improvável — mas adicionar guard `useIsHydrated` (extraído para `src/lib/useIsHydrated.ts` em commit antes do LocaleToggle) para consistência. **D-LOCALE-HYDRATION**.

### 3.12 `src/components/Hero.tsx` (refator)

Padrão de mudança:

```tsx
// Antes
<span>Disponível para projetos</span>
<Button>Ver projetos</Button>

// Depois
const { t } = useTranslation()
<span>{t("hero.availability")}</span>
<Button>{t("hero.viewProjects")}</Button>
```

Identificadores que ficam intactos: `displayName`, `role`, `tagline`, `email`, `github.url`, `linkedin.url`, `cv.fileName`, `avatar.src` — vêm de `hero` (dados). Strings de UI ao redor (labels de seções, badges, CTAs) — via `t`.

Idem para `Skills.tsx` (title via `t("skills.title")`, category labels via `t("skillCategory.frontend")` etc.), `Experience.tsx`, `Education.tsx`, `Contact.tsx`, `ContactForm.tsx`.

### 3.13 `src/components/ContactForm.tsx` (i18n errors)

Custom `errorMap` por locale para Zod:

```tsx
import { useTranslation } from "react-i18next"
import { z } from "zod"

export function ContactForm({ onSubmit }: { onSubmit: ... }) {
  const { t } = useTranslation()

  const schema = z.object({
    name: z.string().min(1, t("contact.form.errors.required")),
    email: z.string().email(t("contact.form.errors.invalidEmail")),
    subject: z.string().min(1, t("contact.form.errors.required")),
    message: z
      .string()
      .min(10, t("contact.form.errors.messageTooShort"))
      .max(1000, t("contact.form.errors.messageTooLong")),
  })

  // ... resto do form
}
```

Schema **dentro** do componente (não em `validation.ts` global) porque depende de `t`. `validation.ts` mantém `contactFormSchema` original para retrocompatibilidade com testes existentes ou pode ser desfeito (D-CONTACT-ZOD-I18N).

### 3.14 `scripts/check-i18n.ts`

Implementação exata como FRD §4.3 mostra. Roda em `prebuild`:

```json
{
  "scripts": {
    "prebuild": "pnpm run check:assets && pnpm run check:i18n",
    "check:assets": "node --import tsx scripts/check-assets.ts",
    "check:i18n": "node --import tsx scripts/check-i18n.ts"
  }
}
```

> Se `prebuild` atual ainda chama `check-assets` inline, refatorar para 2 scripts `check:*` separados — facilita debug. Não-breaking.

### 3.15 `react-router.config.ts`

```typescript
export default {
  appDirectory: "src",
  ssr: false,
  prerender: ["/", "/pt", "/pt/projects", "/en", "/en/projects"],
  basename: "/portfolio/",
} satisfies Config
```

`/` continua na lista — emite o redirect HTML. Sem `/pt/projects/:id` (params) — IDs vêm de `projects.{lang}.json` que estão vazios no M0; M2 adicionará prerender por ID. `:id` continua client-routed.

### 3.16 E2E migrations

Pattern para cada spec migrado:

```typescript
// Antes
await page.goto("/")

// Depois
await page.goto("/pt/")
```

`baseURL` em `playwright.config.ts` continua `http://localhost:5173/portfolio/` — relativo. `page.goto("/pt/")` resolve para `http://localhost:5173/portfolio/pt/`.

Para LocaleToggle smoke:

```typescript
test("LocaleToggle navigates PT -> EN preserving path", async ({ page }) => {
  await page.goto("/pt/projects")
  await waitForHydration(page)
  await page.getByRole("button", { name: /locale.*EN|EN/i }).click()
  await expect(page).toHaveURL(/\/en\/projects/)
})
```

Onde `waitForHydration` é o helper extraído de `m0-infra.spec.ts` (commit 14 do m0-theme). Se for usado em vários specs, extrair para `e2e/_helpers.ts`.

### 3.17 `docs/spec.md`

Diff conceitual:

- §3 (Roadmap): adicionar linha "M0 — Infrastructure: entregue (PR #9, #10, #?)".
- §5 (Out of scope): remover "i18n (PT/EN)" da lista.

---

## 4. Mapa commit → arquivos

15 commits totais (Fase D + F.3 + reconciliations). Conventional Commits em inglês. Pre-commit hook em todos. Sem `--no-verify`.

| # | Subject | Arquivos |
|---|---------|----------|
| 0 | `docs(m0): add blueprint for feat/m0-i18n sub-branch` | `docs/features/m0-infra/blueprint-m0-i18n.md` + `docs/features/m0-infra/handoff-m0.md` (de v0.2.0 que já estava untracked) |
| 15 | `chore(deps): add i18next + react-i18next` | `package.json`, `pnpm-lock.yaml` |
| 16 | `feat(i18n): init i18n config and PT/EN dictionaries` | `src/i18n/index.ts`, `src/i18n/index.test.ts`, `src/i18n/locales/pt/translation.json`, `src/i18n/locales/en/translation.json`, `src/types/i18n.ts`, `src/root.tsx` (import side-effect) |
| 17 | `feat(i18n): split data files by locale` | `src/data/{hero,skills,experiences,education,projects}.{pt,en}.json` (rename PT, criar EN) |
| 18 | `feat(i18n): add data loaders by locale` | `src/lib/data.ts`, `src/lib/data.test.ts`, `src/lib/validation.ts` (`validateProjects`) |
| 19 | `feat(i18n): refactor period to Intl by locale` | `src/lib/period.ts`, `src/lib/period.test.ts` |
| 20 | `feat(i18n): add check-i18n build guard` | `scripts/check-i18n.ts`, `package.json` (scripts) |
| 21 | `feat(routes): restructure to locale-prefixed paths` | `src/routes.ts`, `src/routes/_root-redirect.tsx`, `src/routes/$lang.tsx`, `src/routes/$lang._index.tsx` (move + edit), `src/routes/$lang.projects._index.tsx` (move + edit), `src/routes/$lang.projects.$id.tsx` (move + edit), `react-router.config.ts` |
| 22 | `refactor(hero): consume i18n + locale data` | `src/components/Hero.tsx`, `src/components/Hero.test.tsx` |
| 23 | `refactor(skills,experience,education): consume i18n + locale data` | `src/components/{Skills,Experience,Education}.tsx` + respectivos `.test.tsx` |
| 24 | `refactor(contact): consume i18n + locale data` | `src/components/Contact.tsx`, `src/components/ContactForm.tsx` + `.test.tsx`, `src/lib/validation.ts` (talvez remover `contactFormSchema` se migrar in-component) |
| 25 | `refactor(theme): migrate ThemeToggle to useTranslation` | `src/components/ThemeToggle.tsx`, `src/components/ThemeToggle.test.tsx` |
| 26 | `feat(i18n): add LocaleToggle component` | `src/lib/useIsHydrated.ts` (extraído do ThemeToggle), `src/components/LocaleToggle.tsx`, `src/components/LocaleToggle.test.tsx`, `src/root.tsx` (mount provisório próximo do ThemeToggle) |
| 27 | `test(e2e): migrate specs to /pt/ + cover LocaleToggle` | `e2e/{home,projects-list,project-detail,contact,m0-infra}.spec.ts`, `e2e/_helpers.ts` (extrair `waitForHydration`) |
| 28 | `docs(spec): remove i18n from out-of-scope; reference M0 FRD` | `docs/spec.md` |

Total: 15 commits (1 doc + 13 funcionais + 1 doc final). **A ordem importa**: rotas (21) **antes** dos refactors de componente (22–25) garante que routes/$lang._index.tsx já consuma getX(locale). Se inverter, dois passes nas rotas.

> Commits 22 e 23 podem ser fundidos se forem pequenos. Manter separados ajuda na revisão. Commit 26 (LocaleToggle) **depois** dos refactors para que `t("locale.switchTo")` esteja disponível.

---

## 5. Coverage e gates

- **`src/i18n/index.ts`** — `isLocale` precisa de testes. Init é side-effect; coverage parcial OK.
- **`src/lib/data.ts`** — cada getter testado por locale.
- **`src/lib/period.ts`** — manter 100% (CA-M0-18).
- **`src/lib/validation.ts`** — manter 100% (CA-03).
- **Componentes refatorados** — testes existentes precisam ser atualizados para envolver render em `<I18nextProvider>` ou usar helper que importa `@/i18n` antes (side-effect inicia i18next, então `useTranslation` funciona em testes).
- **CA-M0-10**: Grep `\"[A-ZÁÉÍÓÚ][a-záéíóú\s]+\"` em JSX retorna 0 ocorrências user-facing após Phase D. Validar manualmente com `grep -rE "['\"]([A-ZÁÉÍÓÚ][^'\"]{3,})['\"]" src/components/`.

> Coverage de rotas (`src/routes/`) historicamente exclusa do vitest. Manter — testes RTL cobrem componentes, e2e cobre rotas.

---

## 6. Merge checklist `feat/m0-i18n` → `main` (FRD §11.1)

- [ ] `pnpm run lint` exit 0
- [ ] `pnpm run typecheck` exit 0 (incluindo typegen RR7 da nova estrutura `$lang`)
- [ ] `pnpm run test:run` exit 0 — incluindo novos testes de `i18n`, `data`, `period`, `LocaleToggle`, e refactors em Hero/Skills/Experience/Education/Contact/ContactForm/ThemeToggle
- [ ] `pnpm run test:coverage` mantém piso global; `validation.ts`, `period.ts`, `motion.tsx` continuam em 100%
- [ ] `pnpm run check:i18n` passa em isolation (`pnpm run check:i18n`) e dentro de `prebuild`
- [ ] **Quebrar `check:i18n` localmente**: remover uma chave de `en/translation.json` → `pnpm run check:i18n` falha; revert. Adicionar campo em `hero.pt.json` sem espelhar em `hero.en.json` → falha; revert
- [ ] `pnpm run build` exit 0 — prerender emite `/`, `/pt`, `/pt/projects`, `/en`, `/en/projects`
- [ ] `/portfolio/` (no build estático) redireciona para `/portfolio/pt/` — verificar em `pnpm dev` e em servidor estático local (`pnpm dlx serve build/client`)
- [ ] LocaleToggle em `/pt/projects` navega para `/en/projects` preservando path — manual + E2E
- [ ] `<html lang>` atualiza de `pt-BR` para `en-US` ao navegar para `/en/...` (DevTools Elements pane)
- [ ] Grep `grep -rE "['\"]([A-ZÁÉÍÓÚ][a-záéíóú\s]{3,})['\"]" src/components/` retorna **0** ocorrências user-facing
- [ ] `pnpm e2e` — todas as 10+ specs migradas para `/pt/...` e LocaleToggle smoke verde
- [ ] Sem regressão visual: theme toggle ainda funciona; FOUC ausente em `/pt/` e `/en/`
- [ ] `docs/spec.md` atualizado (§5 sem i18n; §3 com M0)
- [ ] `handoff-m0.md` atualizado para refletir `feat/m0-i18n` ✅ (em commit separado pós-merge ou como commit 0 da `feat/m0-navbar`)
- [ ] PR aberto contra `main`, CI verde
- [ ] Merge `--ff-only` ou squash; branch apagada após merge

---

## 7. Riscos e decisões pendentes (precisam do seu aval **antes** de codar)

| ID | Item | Pergunta | Recomendação |
|----|------|----------|--------------|
| **D-DICT-SCOPE** | Quais chaves de UI entram no dict M0? FRD §5.4 lista um subset mínimo (nav, a11y, theme, locale, period, category, status). Componentes M1/M3/M4/M5 adicionarão suas próprias durante o refactor. | Trabalhar com dict mínimo ou ampliar logo no commit 16? | **Ampliar** — incluir `hero.*`, `skills.*`, `experience.*`, `education.*`, `contact.*` desde o commit 16. Evita PR-thrash quando refactors chegarem. Dict cresce ~80 chaves; não é problema. |
| **D-EN-CONTENT** | Quem escreve as traduções EN? FRD §12 lista isso como item em aberto. | Placeholder EN (tradução literal automática) ou esperar tradução humana? | **Placeholder agora** — usar tradução literal/funcional (eu gero) para destravar o pipeline. Marco revisa antes do merge. Bloqueia merge se traduções estiverem ofensivas/quebradas, não em polimento. |
| **D-DATA-LOADER** | FRD §4.3 mostra `getHero(locale)` como função pura. Alternativa: hook `useHero()` que lê de `useTranslation().i18n.language` automaticamente. | Função pura (FRD) ou hook conveniente? | **Função pura** — Hero/Skills/etc. recebem `hero` etc. como prop, route file resolve. Componentes ficam server-renderable e testáveis sem precisar de Provider em todo teste. Hook adicional vira ruído. |
| **D-PERIOD-FORMAT** | `Intl.DateTimeFormat` varia entre Node versions/ICU. Strings exatas ("jan. de 2024" vs "jan. 2024") instáveis. | Aceitar regex tolerante em testes (FRD §9.1) ou normalizar via lib (date-fns)? | **Regex tolerante** — date-fns adiciona ~12kb sem ganho. Pre-flight passo 5 valida sanidade do output local. |
| **D-PERIOD-BREAKING** | `formatPeriod(start, end, locale)` introduz 3º param obrigatório. Call sites em Experience.tsx, Education.tsx, qualquer teste. | Default param (`locale = "pt"`) ou exigir explícito? | **Exigir explícito** — TS strict pega call sites faltantes em compile. Default mascararia bugs de propagação de locale. |
| **D-VALIDATION-LOCALE** | Schemas Zod (`validation.ts`) precisam de locale para mensagens em PT/EN. Hoje: mensagens em PT hardcoded em `contactFormSchema`. | Mover schema para dentro de ContactForm.tsx (depende de `t`) ou customErrorMap global injetado por locale? | **Schema dentro de `ContactForm.tsx`** — depende de `t` que precisa de Provider. validation.ts mantém apenas `contactFormSchema` sem mensagens (ou remove e fica só nas chamadas de teste). |
| **D-CONTACT-ZOD-I18N** | Mensagens de erro existentes em `validation.ts` (`"Informe um e-mail válido"` etc.) são citadas por `contactFormSchema.test.ts` (testes Zod globais). | Migrar testes para usar i18n PT (mesma string) ou desfazer mensagens custom no validation.ts e mover responsabilidade pro componente? | **Desfazer no validation.ts**. Schema fica genérico; mensagens vivem no componente via `t`. Testes Zod globais ficam sem mensagem custom (asserir só presença de issue). Trade-off: menos asserts no schema, mais asserts no componente — alinha com onde a UX vive. |
| **D-PROJECTS-EMPTY** | `projects.{pt,en}.json` vazios (`[]`) no M0 — preenchidos em M2. | Criar ambos vazios agora ou postpone até M2? | **Criar ambos vazios agora** — `check-i18n.ts` espera paridade; ter arquivos zera fricção no M2. |
| **D-LOCALE-HYDRATION** | `LocaleToggle` depende de `i18n.language` que pode diferir entre server prerender (default "pt") e client após navegação. | Aplicar mesmo gate de `useIsHydrated` do ThemeToggle? | **Sim.** Extrair hook `useIsHydrated` para `src/lib/useIsHydrated.ts` no commit 26, reuso entre Toggle components. |
| **D-HTML-LANG** | `<html lang>` atualiza reativamente em `$lang.tsx` via `document.documentElement.setAttribute("lang", ...)`. Mismatch de hydration com server prerender (que emite `pt-BR` para `/en/...` também). | `suppressHydrationWarning` em `<html>` já cobre? | **Sim — já está aplicado** desde `feat/m0-theme` (commit `9ae9b29`). Confirmar não foi removido. |
| **D-ROUTE-CONVENTION** | RR7 file-based: `$lang.tsx` como layout vs flat `$lang._index.tsx` etc. sem `layout()`. | Usar `layout("routes/$lang.tsx", [...])` explícito (FRD §4.3) ou convenção implícita? | **Layout explícito** — match exato com FRD. Convenção implícita exige `$lang.tsx` ter `<Outlet />` mas RR7 typegen reconhece ambos. Explícito vence em clareza. |
| **D-DEFAULT-EXPORT-ON-INDEX** | `routes/_root-redirect.tsx` precisa export default + `meta()`. Sem `loader` (prerender estático). | Validar prerender consegue emitir `<meta refresh>` + `<Navigate>` no HTML estático? | **Confirmar empiricamente** durante commit 21. Se `Navigate` não funcionar em prerender (sem JS), meta refresh garante fallback. Se Navigate render-emitir `<a href>`, melhor ainda. |
| **D-E2E-HELPER** | `waitForHydration` foi inline em `m0-infra.spec.ts`. Vários specs vão usar. | Extrair pra `e2e/_helpers.ts` ou duplicar inline? | **Extrair**. `e2e/_helpers.ts` exporta `waitForHydration`, `themeButton`, helpers comuns. |
| **D-PRERENDER-IDS** | `react-router.config.ts` lista 5 prerenders. Project-detail (`:id`) não inclusa porque IDs vazios no M0. | OK manter assim? | **Sim**. M2 estende. SPA fallback cobre rotas dinâmicas. |
| **D-DOCS-SCAFFOLDING** | FRD §11.1 reserva `docs/scaffolding-state.md` update para `feat/m0-navbar` (última sub-branch). | Tocar agora ou esperar? | **Esperar**. Não tocar em `scaffolding-state.md` nesta sub-branch. |
| **D-MIGRATION-ORDER** | Refactors de componente (commits 22–25) **dependem** de rotas migradas (commit 21) e data loader (commit 18). Mas as rotas migradas dependem dos componentes ainda aceitarem props. | Como evitar quebra intermediária? | **Manter componente APIs estáveis** (`<Hero hero={hero}>`, `<Skills skills={skills}>`) — só substituir conteúdo de strings hardcoded por `t(...)`. Rotas mudam o **source** dos dados (`getHero(locale)`), não o shape. Quebra intermediária: zero. Cada commit é green standalone. |

Itens estruturais (bloqueiam mais de um commit se mudarem): **D-DICT-SCOPE**, **D-DATA-LOADER**, **D-CONTACT-ZOD-I18N**, **D-ROUTE-CONVENTION**. Avise antes do commit 16 se algum mudar.

---

## 8. Out-of-scope desta sub-branch (não cair em escopo)

Reaviso para evitar drift:

- `Navbar`, `SkipLink`, `Brand`, `MobileMenu`, `useScrolled`, `useScrollSpy`, `Sheet`, scrollspy ativo — `feat/m0-navbar` (próxima e última sub-branch de M0).
- Realocar `ThemeToggle` para dentro do Navbar — `feat/m0-navbar` (remove o wrapper provisório `data-temporary-theme-toggle`).
- Realocar `LocaleToggle` para Navbar — idem, com marcador análogo `data-temporary-locale-toggle`.
- Atualizar `docs/scaffolding-state.md` para M0 entregue — `feat/m0-navbar`.
- 3-state theme (light/dark/system) — FRD §12, fora de M0.
- View transitions API — FRD §12, fora de v1.
- Page transitions cross-route — FRD §12.
- Tradução EN final/revisada (placeholder no commit 16, Marco revisa antes do merge).
- Reconciliação documental das divergências `feat/m0-visual` (Geist Mono default, Asimovian, motion timings) — `feat/m0-navbar` na atualização final da FRD.

---

## 9. Histórico

| Versão | Data | Mudança |
|--------|------|---------|
| 0.1.0 | 2026-05-18 | Blueprint inicial derivado da FRD v0.2.0 §11 Fase D (commits 15–24) + Phase F.3 + estado pós-merge `feat/m0-theme` (`8a625bc`). 15 commits planejados. 16 decisões a fechar (§7). |
