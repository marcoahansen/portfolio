# Blueprint — `feat/m0-theme` (Fase C do FRD M0)

**Versão:** 0.1.0
**Status:** Draft — aguardando aval das decisões §7 antes de implementar
**FRD de origem:** `docs/features/m0-infra/frd-m0-infra.md` (v0.1.0)
**Handoff anterior:** `docs/features/m0-infra/handoff-m0-visual.md`
**Branch base:** `main` (HEAD `437dc00` — merge de `feat/m0-visual`)
**Branch alvo:** `feat/m0-theme` → `main`

> Plano da **segunda** sub-branch de M0. Cobre apenas Fase C: `ThemeProvider` + `useTheme`, script anti-FOUC, `ThemeToggle` (Sun/Moon, 2 estados), wiring do Provider em `root.tsx`. Nada de i18n, Navbar, basename. `ThemeToggle` será montado temporariamente em `root.tsx` (decisão D-TOGGLE-MOUNT) até `feat/m0-navbar` realocá-lo.

---

## 1. Pré-flight

Antes do primeiro commit:

1. `git checkout main && git pull --ff-only` — garantir `437dc00` ou mais recente.
2. `git checkout -b feat/m0-theme`.
3. `pnpm install --frozen-lockfile`.
4. Baseline verde: `pnpm run lint && pnpm run typecheck && pnpm run test:run && pnpm run build`.
5. Confirmar `lucide-react` resolve `Sun` e `Moon`: `node -e 'import("lucide-react").then(m => console.log(typeof m.Sun, typeof m.Moon))'`. Se falhar, ver D-LUCIDE-VERSION (§7).
6. Capturar screenshot baseline do app em light + dark forçando `localStorage.setItem("mh-theme", "dark"); location.reload()` no DevTools — referência para checklist de FOUC.

---

## 2. Inventário de arquivos

### 2.1 Criar

| Caminho | Concern | Comentário |
|---------|---------|------------|
| `src/lib/theme.tsx` | THM | `ThemeProvider`, `useTheme`, `getInitialTheme`, `STORAGE_KEY` |
| `src/lib/theme.test.tsx` | THM | Cobre CT-M0-THM-01..04 + persistência localStorage + side-effect em `documentElement` |
| `src/components/ThemeToggle.tsx` | THM | `Button variant="ghost" size="icon"` com Sun/Moon |
| `src/components/ThemeToggle.test.tsx` | THM | Ícone alterna, click toggle class `dark`, aria-label muda, axe |
| `e2e/m0-infra.spec.ts` | THM (subset Phase F.2) | Smoke E2E: toggle alterna `html.dark`; FOUC ausente com tema escuro salvo |

### 2.2 Modificar

| Caminho | Concern | Mudança |
|---------|---------|---------|
| `index.html` | THM | Inline `<script>` anti-FOUC como **primeiro** filho de `<head>`, antes de qualquer `<link>`/`<meta charset>` ficar entre script e início de paint |
| `src/root.tsx` | THM | `Layout` recebe mesmo script anti-FOUC via `dangerouslySetInnerHTML` em `<head>` (cobre HTML prerenderizado); `Root` envolve `<Outlet />` em `<ThemeProvider>` + monta `<ThemeToggle>` em wrapper fixed top-right (provisório) |
| `src/setupTests.ts` | THM | Adicionar mock global de `window.matchMedia` (jsdom não traz) — ver §3.6 |

### 2.3 Sem mudança nesta sub-branch

`src/app.css` (paleta + `.dark` já vivem fora de `@layer base` desde commit `3555d90`), `tailwind.config.js`, todos `src/components/{Hero,Skills,Experience,Education,Contact,ContactForm}.tsx` e respectivos `.test.tsx`, `src/components/Section.tsx`, `src/lib/motion.tsx`, `src/lib/cn.ts`, `src/data/**`, `src/types/**`, `src/routes/**`, `src/routes.ts`, `src/components/ui/**`, `react-router.config.ts`, `vitest.config.ts`, `tsconfig*.json`, `package.json`, `scripts/*`. **Nenhuma** dependência nova.

---

## 3. Conteúdo esperado por arquivo

### 3.1 `src/lib/theme.tsx`

Implementação alinhada a FRD §4.2 com dois ajustes:
- `getInitialTheme` envolto em `try/catch` para tolerar `localStorage`/`matchMedia` indisponíveis (Safari private mode, ambientes restritivos).
- `useEffect` que aplica `.dark` e persiste só roda no client (já é o caso em SPA, mas guarda explícita `typeof document !== "undefined"` evita warning em prerender se RR7 chamar fora de browser).

```tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type Theme = "light" | "dark"
export type ThemeCtx = { theme: Theme; toggle: () => void }

export const STORAGE_KEY = "mh-theme"

const ThemeContext = createContext<ThemeCtx | null>(null)

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light"
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === "light" || stored === "dark") return stored
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  } catch {
    return "light"
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.classList.toggle("dark", theme === "dark")
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* storage indisponível — estado em memória só */
    }
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

Exports: `Theme`, `ThemeCtx`, `STORAGE_KEY`, `getInitialTheme`, `ThemeProvider`, `useTheme`. `STORAGE_KEY` exportado para o E2E aferir persistência sem duplicar literal.

### 3.2 `src/lib/theme.test.tsx`

TDD por bullet. Render via `@testing-library/react` com helpers utilitários e mocks por teste. Padrão:

```tsx
import { renderHook, act } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  STORAGE_KEY,
  ThemeProvider,
  getInitialTheme,
  useTheme,
} from "@/lib/theme"

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
)

const mockMatchMedia = (matches: boolean) => {
  vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.classList.remove("dark")
})
afterEach(() => {
  vi.restoreAllMocks()
})
```

Casos (mínimo):

| ID | Cenário | Asserção |
|----|---------|----------|
| CT-M0-THM-01 | Sem `localStorage`, `prefers-color-scheme: dark` | `getInitialTheme()` retorna `"dark"` |
| CT-M0-THM-02 | `localStorage["mh-theme"]="light"`, sistema dark | `getInitialTheme()` retorna `"light"` |
| CT-M0-THM-02b | `localStorage["mh-theme"]="dark"`, sistema light | `getInitialTheme()` retorna `"dark"` |
| CT-M0-THM-03 | `useTheme()` + `toggle()` | `result.current.theme` alterna `"light"` ↔ `"dark"` |
| CT-M0-THM-04 | `useTheme()` fora do Provider | `renderHook` lança `Error("useTheme must be used within ThemeProvider")` |
| CT-M0-THM-05 | Provider monta com `theme="dark"` | `document.documentElement.classList.contains("dark") === true` após effect |
| CT-M0-THM-06 | Toggle dark→light | classe `dark` removida de `documentElement` |
| CT-M0-THM-07 | Toggle persiste | `localStorage.getItem(STORAGE_KEY)` reflete novo valor |
| CT-M0-THM-08 | `localStorage.setItem` throws | Provider não quebra; estado em memória atualiza (try/catch swallow) |
| CT-M0-THM-09 | `localStorage` lê valor inválido (ex: `"system"`) | `getInitialTheme()` cai no fallback `matchMedia` |

Cobertura alvo: 100% lines/branches em `theme.tsx`. Os ramos `typeof window === "undefined"` e `typeof document === "undefined"` ficam descobertos em jsdom; aceitáveis (apenas em SSR, fora do alcance do RR7 SPA mode). Documentar via comentário curto se v8 reclamar — preferível a inflar o teste.

### 3.3 `src/components/ThemeToggle.tsx`

```tsx
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/lib/theme"

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === "dark"
  const label = isDark ? "Mudar para tema claro" : "Mudar para tema escuro"
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={label}
    >
      {isDark ? (
        <Sun className="size-5" aria-hidden="true" />
      ) : (
        <Moon className="size-5" aria-hidden="true" />
      )}
    </Button>
  )
}
```

Decisões dentro do componente:
- **Labels em PT hardcoded** (D-TOGGLE-I18N §7). UI text é PT-BR por AGENTS.md §5; `feat/m0-i18n` migra para `useTranslation`.
- Ícone com `aria-hidden` para evitar leitura dupla pelo screen reader (o `aria-label` do botão já anuncia a ação).
- `type="button"` explícito (não submete forms acidentalmente).
- Sem `data-testid` — testes consultam por `role="button"` + `name`.

### 3.4 `src/components/ThemeToggle.test.tsx`

```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { axe } from "vitest-axe"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { ThemeProvider } from "@/lib/theme"
import { ThemeToggle } from "@/components/ThemeToggle"
```

Casos:

| ID | Cenário | Asserção |
|----|---------|----------|
| CT-M0-TT-01 | Render sem valor salvo, sistema light | Botão `name="Mudar para tema escuro"`, ícone Moon (`<svg>` com `lucide-moon` data attr ou inspeção de SVG-path por classe) |
| CT-M0-TT-02 | `localStorage["mh-theme"]="dark"` antes do render | Botão `name="Mudar para tema claro"`, ícone Sun |
| CT-M0-TT-03 | Click no toggle (light → dark) | `document.documentElement.classList.contains("dark") === true`; `aria-label` muda para "Mudar para tema claro" |
| CT-M0-TT-04 | Click duplo | volta para light; classe removida |
| CT-M0-TT-05 | Axe | `expect(await axe(container)).toHaveNoViolations()` |

Helper `renderWithProvider`:

```tsx
const renderToggle = () =>
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  )
```

`beforeEach` limpa `localStorage` + remove classe `dark` de `documentElement`.

Identificação do ícone: `lucide-react` v1 emite `<svg>` com classe interna (`lucide` ou `lucide-sun`/`lucide-moon`). Se a classe não for estável, fallback é `screen.getByRole("button", { name })` — o `aria-label` distingue suficientemente entre estados. **Não** assert via classe SVG se houver fragilidade (ver D-LUCIDE-VERSION).

### 3.5 `index.html` — anti-FOUC

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <script>
      (function () {
        try {
          var t = localStorage.getItem("mh-theme")
          var dark =
            t === "dark" ||
            (t === null &&
              window.matchMedia("(prefers-color-scheme: dark)").matches)
          if (dark) document.documentElement.classList.add("dark")
        } catch (_) {}
      })()
    </script>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Marco Hansen — Portfolio</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

Ordem importa: script **antes** de `<meta charset>` é tecnicamente discutível mas o conteúdo do script é ASCII puro — sem risco. Alternativa segura: script imediatamente após `<meta charset>` + `<meta viewport>`. Adotar essa ordem se houver desconforto (decisão menor; recomendação: charset/viewport primeiro, script em seguida, **antes** de qualquer `<link>` ou `<style>`).

### 3.6 `src/root.tsx`

Duas mudanças: replicar o script no `<head>` do `Layout` (cobre o HTML emitido pelo prerender de RR7) e envolver `Outlet` em `ThemeProvider` + montar `ThemeToggle` provisório.

```tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router"
import type { ReactNode } from "react"
import { ThemeProvider } from "@/lib/theme"
import { ThemeToggle } from "@/components/ThemeToggle"
import "./app.css"

const themeBootstrap = `(function(){try{var t=localStorage.getItem("mh-theme");var d=t==="dark"||(t===null&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark");}catch(_){}})();`

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
      <div className="fixed right-4 top-4 z-50" data-temporary-theme-toggle>
        <ThemeToggle />
      </div>
      <Outlet />
    </ThemeProvider>
  )
}
```

Notas:
- `data-temporary-theme-toggle` atributo é marcador para `feat/m0-navbar` localizar e remover o wrapper provisório (grep direto). Sem efeito visual/funcional.
- `fixed right-4 top-4 z-50` posiciona o botão acima de qualquer conteúdo. Trade-off cosmético aceito porque some assim que Navbar absorver o toggle.
- Tanto `index.html` quanto `Layout` carregam o script. Quando Vite serve dev, `index.html` é o shell — script roda; em prerender estático, `Layout` produz o HTML emitido — script roda. Sem dupla execução no mesmo carregamento.

### 3.7 `src/setupTests.ts`

Adicionar mock default de `window.matchMedia` imediatamente após os imports e antes do `expect.extend`. Não interfere com testes existentes (motion, Section etc.) — todos retornam `matches: false`.

```ts
if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}
```

Testes que precisam de `matches: true` (CT-M0-THM-01) usam `vi.spyOn(window, "matchMedia")` per-test (§3.2).

### 3.8 `e2e/m0-infra.spec.ts` — subset Phase F.2

```ts
import { expect, test } from "@playwright/test"

test.describe("M0 — theme", () => {
  test("toggles .dark on html element", async ({ page }) => {
    await page.goto("/")
    const html = page.locator("html")
    const before = await html.evaluate((el) => el.classList.contains("dark"))
    await page.getByRole("button", { name: /tema/i }).click()
    const after = await html.evaluate((el) => el.classList.contains("dark"))
    expect(after).toBe(!before)
  })

  test("persists theme across reload", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: /tema/i }).click()
    const expectedDark = await page
      .locator("html")
      .evaluate((el) => el.classList.contains("dark"))
    await page.reload()
    const afterReload = await page
      .locator("html")
      .evaluate((el) => el.classList.contains("dark"))
    expect(afterReload).toBe(expectedDark)
  })

  test("no FOUC: html starts with .dark when localStorage has dark", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("mh-theme", "dark")
    })
    await page.goto("/")
    // Primeira paint já com .dark — sem flash de claro
    expect(
      await page.locator("html").evaluate((el) => el.classList.contains("dark")),
    ).toBe(true)
  })
})
```

Demais specs (`home.spec.ts`, `projects-list.spec.ts`, etc.) **não** mudam — basename `/portfolio/` e prerender estão pre-existentes em `react-router.config.ts`. Ver risco D-PREEXISTING-BASENAME (§7).

---

## 4. Mapa commit → arquivos

Conventional Commits em inglês (AGENTS.md §7). Subject ≤ 72 chars. Pre-commit (`lint-staged → typecheck → test:run`) em todos. Sem `--no-verify`.

| # | Subject | Arquivos | Verificação |
|---|---------|----------|-------------|
| 0 | `docs(m0): add blueprint for feat/m0-theme sub-branch` | `docs/features/m0-infra/blueprint-m0-theme.md` | — |
| 11 | `feat(theme): add ThemeProvider and useTheme` | `src/lib/theme.tsx`, `src/lib/theme.test.tsx`, `src/setupTests.ts` | `pnpm test:run` cobre CT-M0-THM-01..09 |
| 12 | `feat(theme): add anti-FOUC inline script` | `index.html` | `pnpm dev` → DevTools → set `localStorage.mh-theme="dark"` → reload → sem flash |
| 13 | `feat(theme): add ThemeToggle component` | `src/components/ThemeToggle.tsx`, `src/components/ThemeToggle.test.tsx` | `pnpm test:run` cobre CT-M0-TT-01..05 |
| 14 | `feat(root): wire ThemeProvider and bootstrap script` | `src/root.tsx` | `pnpm dev` exibe botão fixo top-right; click alterna `.dark`; reload preserva |
| 15 | `test(e2e): cover theme toggle and FOUC absence` | `e2e/m0-infra.spec.ts` | `pnpm e2e` verde local |

Total: **6 commits** (commits 11–14 do FRD §11 + commit de blueprint + commit de E2E pertinente à Phase F.2).

> Commit 12 ANTES do 14 garante que o script já está no `index.html` antes do Provider montar — útil para validação manual incremental. Commit 14 adiciona a duplicata no `Layout` para cobertura de prerender.

---

## 5. Coverage e gates

- `src/lib/theme.tsx` é arquivo novo em `src/lib/` → AGENTS.md §6 exige TDD. Alvo: 100%, com ramos SSR-guard documentados como aceitáveis. **Não** adicionar à lista de exclusão de cobertura.
- `src/components/ThemeToggle.tsx` entra na cobertura global (não está em `ui/`).
- CA-M0-18 (FRD §8) lista `validation.ts`, `period.ts`, `motion.tsx` em 100% — `theme.tsx` **não** é obrigatório a 100%, mas tentar.
- `pnpm run test:coverage` deve passar com pisos atuais (lines/branches/functions/statements ≥ 70 global).
- Sem mudança em `vitest.config.ts`.

---

## 6. Merge checklist `feat/m0-theme` → `main` (FRD §11.1)

- [ ] `pnpm run lint` exit 0
- [ ] `pnpm run typecheck` exit 0
- [ ] `pnpm run test:run` exit 0 (theme + ThemeToggle + demais specs RTL)
- [ ] `pnpm run test:coverage` mantém piso global; `motion.tsx`, `validation.ts`, `period.ts` continuam em 100%
- [ ] `pnpm run build` exit 0 (prebuild `check-assets.ts` continua passando)
- [ ] **Sem FOUC** validado manualmente em browser real: `localStorage.setItem("mh-theme", "dark")` + reload → primeira paint já dark (gravar 5 reloads em throttle 3G — nenhum flash de light) — CA-M0-06
- [ ] `prefers-color-scheme: dark` (emular via DevTools → Rendering) na primeira visita (sem `localStorage`) → app abre em dark — RF-M0-THM-04
- [ ] Após primeiro click em `ThemeToggle`, alterar `prefers-color-scheme` no DevTools **não** afeta o tema (RF-M0-THM-05)
- [ ] `localStorage["mh-theme"]` reflete escolha após cada toggle; persiste cross-reload — CA-M0-07
- [ ] `document.documentElement.classList` contém `dark` quando theme=dark, ausente quando theme=light — CA-M0-07
- [ ] `aria-label` do toggle reflete a próxima ação ("Mudar para tema claro" quando dark; "Mudar para tema escuro" quando light) — RF-M0-THM-07
- [ ] Toggle navegável por teclado (Tab até o botão; Enter/Space dispara)
- [ ] Subset `e2e/m0-infra.spec.ts` (theme + FOUC) verde local: `pnpm e2e --grep "theme|FOUC"`
- [ ] Sem regressão visual em Hero/Skills/Experience/Education/Contact (botão fixo top-right não sobrepõe conteúdo crítico)
- [ ] PR aberto contra `main`, CI verde
- [ ] Merge `--ff-only` ou squash, branch local apagada após merge

---

## 7. Riscos e decisões pendentes (precisam do seu aval **antes** de codar)

| ID | Item | Pergunta | Recomendação |
|----|------|----------|--------------|
| **D-TOGGLE-MOUNT** | `ThemeToggle` precisa estar montado para o E2E clicar, mas `Navbar` (lar definitivo dele) só vem em `feat/m0-navbar`. | Mountar provisoriamente em `root.tsx` (fixed top-right) ou pular o E2E e validar só por unidade? | **Mount provisório.** `Navbar` realocará via grep do marcador `data-temporary-theme-toggle`. E2E exigido pelo merge checklist da FRD §11.1. |
| **D-TOGGLE-I18N** | FRD §4.2 escreve `ThemeToggle` usando `useTranslation()`, mas i18n só chega em `feat/m0-i18n`. | Hardcode PT, stub `t()` local, ou postpone o componente? | **Hardcode PT** ("Mudar para tema claro/escuro"). UI text é PT-BR (AGENTS.md §5). `feat/m0-i18n` faz o refactor universal junto com Hero/Skills/etc. — sem custo extra. |
| **D-FOUC-INDEX** | RR7 framework mode + `ssr: false` + `prerender: ["/", "/projects"]`. O HTML emitido em produção vem de `Layout` em `root.tsx`, **não** de `index.html` (que serve só o dev shell do Vite). | Anti-FOUC em qual lugar? | **Em ambos**, como descrito em §3.5/§3.6. `index.html` cobre dev (HMR, navegação inicial do Vite); `Layout` cobre estático prerenderizado (GH Pages). Script idempotente — dupla inclusão no mesmo carregamento é impossível porque cada HTML doc carrega só um. |
| **D-LUCIDE-VERSION** | `lucide-react` está fixado em `^1.14.0` em `package.json`. Releases modernas são `0.4xx.x`. Possivelmente versão **errada** introduzida pelo scaffolding. | Verificar se `Sun`/`Moon` existem; se não, fazer upgrade ou trocar por ícone inline SVG. | **Verificar no pré-flight** (§1 passo 5). Se `Sun`/`Moon` resolverem, seguir. Se não, abrir issue em paralelo: `chore(deps): pin lucide-react to latest` antes do commit 13. Não fazer upgrade dentro desta sub-branch sem aval — pode afetar quem mais depende. |
| **D-PREEXISTING-BASENAME** | `react-router.config.ts` já contém `basename: "/portfolio/"` e `prerender: ["/", "/projects"]` — fora do escopo desta sub-branch, conflita com AGENTS.md §2 ("basename `/`") e adiantado em relação ao FRD (basename é responsabilidade de `feat/m0-i18n`). | Tocar agora ou deixar para `feat/m0-i18n`? | **Não tocar.** Não é problema de tema. Documentar como dívida no handoff desta sub-branch para o agent de i18n decidir. Se quebrar `pnpm dev` ou e2e local, abrir issue separada. |
| **D-COV-SSR-BRANCH** | `getInitialTheme` tem `if (typeof window === "undefined") return "light"` que jsdom nunca exercita; v8 marca como branch descoberto. | Aceitar leve drop de coverage ou usar `/* c8 ignore next */`? | **`/* c8 ignore next 1 */`** sobre a linha do early return SSR. Pragma é a forma idiomática v8 para ramos genuinamente impossíveis em jsdom. Manter 100% real-world coverage. |
| **D-MOUNT-Z** | `fixed right-4 top-4 z-50` no botão temporário pode sobrepor CTAs do Hero ou ícones de social em viewport pequeno. | OK aceitar overlay provisório ou usar `z-40` + offset maior? | **`z-50` + `right-4 top-4`** — durabilidade do provisório é uma sub-branch (~1–2 dias). Anomalia visual aceitável pelo período. Hero atual não tem nada no canto superior direito. |
| **D-AXE-SVG** | `lucide-react` pode renderizar SVG sem `role`/`aria-label` (depende da versão). Axe pode reclamar do `aria-hidden` no SVG se o pai não tiver nome acessível — mas Button tem `aria-label`. | Confiar no `aria-label` do Button + `aria-hidden` do SVG? | **Sim.** Padrão WAI-ARIA "icon button": botão tem `aria-label`, ícone interno é `aria-hidden`. Axe aceita. Se reclamar, investigar versão específica do `lucide-react`. |

Se algum item acima divergir do recomendado, **avise antes do commit 11** — D-FOUC-INDEX e D-TOGGLE-MOUNT são estruturais; D-LUCIDE-VERSION afeta o commit 13.

---

## 8. Out-of-scope desta sub-branch (não cair em escopo)

Reaviso para evitar drift:

- `useTranslation`, `i18next`, dicionário PT/EN, split de dados por locale, `LocaleToggle`, `_root-redirect.tsx`, `$lang.tsx` — `feat/m0-i18n`.
- `Navbar`, `SkipLink`, `Brand`, `MobileMenu`, `useScrolled`, `useScrollSpy`, `Sheet` — `feat/m0-navbar`.
- Migrar `ThemeToggle` para receber strings via i18n e ser montado dentro de `Navbar` — `feat/m0-navbar` realoca, `feat/m0-i18n` traduz (ordem nessa cadeia já cuida).
- Mudar `react-router.config.ts` (basename, prerender) — `feat/m0-i18n`.
- Refatorar `formatPeriod`, `validation.ts`, dados — `feat/m0-i18n`.
- Atualizar `docs/scaffolding-state.md` para M0 entregue — só no merge de `feat/m0-navbar`.
- Atualizar `docs/spec.md` (remover i18n de fora-de-escopo) — `feat/m0-i18n`.
- 3-state theme (light/dark/system explícito) — item aberto FRD §12, fora de M0.

---

## 9. Histórico

| Versão | Data | Mudança |
|--------|------|---------|
| 0.1.0 | 2026-05-15 | Blueprint inicial derivado da FRD v0.1.0 §11 (commits 11–14) + Phase F.2 + leitura do estado pós-merge de `feat/m0-visual`. |
