# Scaffolding Blueprint — Portfolio Marco Hansen

**Versão:** 0.2.0 — entrega incremental
**Status:** Pronto para execução
**Pré-requisitos:** `docs/spec.md` v0.1.0, `docs/scaffolding-specification.md` v0.1.0, `AGENTS.md`

> Esta blueprint é um runbook **incremental**. Em vez de um único commit gigante, o trabalho é entregue em **branches lógicas com commits atômicos**, cada um deixando o repositório em estado funcional verificável.

> **Diretório de trabalho:** todas as operações ocorrem em `/home/vntmasen/www/portfolio` (raiz do repo). Comandos assumem esse cwd. Branch base é `main`.

---

## 1. Estratégia de entrega incremental

### 1.1 Princípios

- **Atomicidade:** cada commit faz **uma** mudança lógica. Refactor + feature nunca no mesmo commit.
- **Estado funcional:** após cada commit, o repositório está em um estado válido — instalação OK, typecheck OK (quando aplicável), nenhum build quebrado intermediário.
- **TDD explícito:** lógica de domínio entra em **dois commits separados** — `test:` (vermelho, com testes falhando documentado no body) seguido de `feat:` (verde, testes passando). Refactor entra como terceiro commit `refactor:` quando aplicável.
- **Conventional Commits em inglês** (alinhado ao `AGENTS.md §7`): `chore:`, `feat:`, `test:`, `fix:`, `docs:`, `refactor:`, `build:`, `ci:`.
- **Branches lógicas curtas:** cada branch entrega uma camada coesa do scaffolding; merge para `main` via PR quando o checklist de merge passa.
- **Sem `--no-verify`:** o hook só é instalado quando o projeto já está pronto para rodá-lo (Branch 9).

### 1.2 Mapa de branches

| # | Branch | Escopo | Commits | Fases originais |
|---|--------|--------|---------|-----------------|
| 1 | `chore/setup-tooling` | Dotfiles, package.json mínimo, deps, configs TS/Vite/Tailwind/Vitest/ESLint | 7 | 1–7 |
| 2 | `chore/domain-types` | Tipos do domínio | 1 | 8 |
| 3 | `chore/tdd-validation` | Zod schemas via TDD | 2 (red+green) | 9 |
| 4 | `chore/tdd-filter-projects` | `filterProjects` via TDD | 2 (red+green) | 10 |
| 5 | `chore/seed-data` | JSONs vazios validados | 1 | 11 |
| 6 | `chore/shadcn-setup` | `cn.ts`, `app.css`, `components.json`, componentes shadcn | 2 | 12 |
| 7 | `chore/routing-skeleton` | `root.tsx`, `routes.ts`, route stubs, `index.html` | 3 | 13–15 |
| 8 | `chore/e2e-smoke-tests` | Playwright config + 4 specs + browsers | 1 | 16 |
| 9 | `chore/git-hooks` | Husky pre-commit + lint-staged | 1 | 17, parte de 21 |
| 10 | `chore/public-assets` | Favicon, 404, cv/ | 1 | 18 |
| 11 | `ci/workflows-and-readme` | CI, deploy, README, scripts finais | 3 | 19–21 |

**Fase 0 (preflight)** não gera commit. **Fase 22 (verificação completa)** roda antes de cada merge. **Fase 23 (commit inicial)** é substituída por esta sequência de merges.

### 1.3 Definição de "estado funcional"

Para cada commit (exceto explicitamente os **red commits** de TDD), os seguintes critérios valem **quando aplicáveis ao escopo atual**:

| Após o commit existe... | Então deve passar |
|-------------------------|-------------------|
| `package.json` + node_modules | `pnpm install --frozen-lockfile` |
| `tsconfig.json` + ≥1 `.ts`/`.tsx` em `src` | `pnpm run typecheck` |
| `eslint.config.js` + ≥1 `.ts`/`.tsx` em `src` | `pnpm run lint` |
| Testes em `src/**/*.{test,spec}.{ts,tsx}` (todos verdes) | `pnpm run test:run` |
| `vite.config.ts` + `index.html` + `src/root.tsx` | `pnpm run build` |

Red commits de TDD documentam no body que `pnpm run test:run` falha intencionalmente; isso é o estado vermelho. O green commit seguinte restaura todo o critério.

### 1.4 Fluxo por branch

```sh
git checkout main
git pull --ff-only
git checkout -b <branch>
# ... commits da branch (ver seções a seguir) ...
# rodar checklist de merge da seção correspondente
git push -u origin <branch>
# abrir PR → main; aguardar CI (após Branch 11; antes disso o CI ainda não existe)
# merge fast-forward ou squash conforme política
git checkout main && git pull --ff-only
git branch -d <branch>
```

> Antes da Branch 11, o CI não existe no GitHub; merges são feitos localmente após checklist manual passar. A partir da Branch 11 mergeada, todo push para `main` aciona CI + deploy.

---

## Fase 0 — Pré-flight (sem commit)

```sh
node --version       # esperado: v22.x
pnpm --version       # esperado: 9.x+
git status           # esperado: limpo (alterações em docs/ aceitáveis)
git log --oneline -5
```

Se Node != 22 ou pnpm ausente:

```sh
corepack enable
corepack prepare pnpm@latest --activate
```

Sem `corepack` ou Node < 22: **pare e corrija o ambiente antes de continuar**.

Confirmar branch base limpa:

```sh
git checkout main
git pull --ff-only
```

---

## Branch 1 — `chore/setup-tooling`

**Objetivo:** projeto instalável com toda toolchain configurada (sem código de domínio ainda).

```sh
git checkout -b chore/setup-tooling
```

### Commit 1.1 — `chore: add repository metadata files`

**Arquivos:**

`.nvmrc`:

```
22
```

`.npmrc`:

```
engine-strict=true
auto-install-peers=true
```

`.gitignore`:

```
# Dependencies
node_modules
.pnpm-store

# Build artifacts
dist
build
.react-router

# Test artifacts
coverage
playwright-report
test-results

# Env
.env
.env.local
.env.*.local
!.env.example

# Editor
.idea
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*
yarn-error.log*
```

`.editorconfig`:

```
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

`.env.example`:

```
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

`.prettierignore`:

```
node_modules
dist
build
.react-router
coverage
playwright-report
pnpm-lock.yaml
src/components/ui
```

`.prettierrc.json`:

```json
{
  "semi": false,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

**Verificação:** `git status` mostra apenas arquivos novos; nada quebrado (não há código ainda).

**Mensagem:**

```
chore: add repository metadata files

Adds .nvmrc, .npmrc, .gitignore, .editorconfig, .env.example,
.prettierignore, and .prettierrc.json so subsequent commits run in
a deterministic environment.
```

---

### Commit 1.2 — `chore: bootstrap package.json and install dependencies`

**Arquivos:**

`package.json` (versão inicial; scripts finais na Branch 11):

```json
{
  "name": "portfolio",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=22.0.0",
    "pnpm": ">=9.0.0"
  },
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "dev": "react-router dev",
    "build": "react-router build",
    "preview": "vite preview",
    "typecheck": "react-router typegen && tsc --noEmit",
    "lint": "eslint . --max-warnings=0",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "e2e": "playwright test",
    "e2e:install": "playwright install --with-deps chromium",
    "prepare": "husky"
  }
}
```

**Comandos:**

```sh
# Production deps
pnpm add \
  react@^19 \
  react-dom@^19 \
  react-router@^7 \
  @react-router/node@^7 \
  zod@^3.23 \
  @emailjs/browser@^4.4 \
  clsx \
  tailwind-merge \
  class-variance-authority \
  lucide-react \
  tailwindcss-animate

# Dev — build/types
pnpm add -D \
  typescript@^5.6 \
  @types/node \
  @types/react@^19 \
  @types/react-dom@^19 \
  vite@^6 \
  vite-tsconfig-paths \
  @react-router/dev@^7

# Dev — tests
pnpm add -D \
  vitest@^2.1 \
  @vitest/coverage-v8 \
  jsdom \
  @testing-library/react \
  @testing-library/dom \
  @testing-library/user-event \
  @testing-library/jest-dom \
  vitest-axe \
  axe-core \
  @playwright/test@^1.48

# Dev — lint/format/hooks/css
pnpm add -D \
  eslint \
  @eslint/js \
  typescript-eslint \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-jsx-a11y \
  eslint-config-prettier \
  prettier \
  prettier-plugin-tailwindcss \
  husky \
  lint-staged \
  tailwindcss@^3.4 \
  postcss@^8.4 \
  autoprefixer@^10.4
```

> `tailwindcss` fixado em `^3.4` por exigência da spec (`§13`). Não atualize para v4.
> `prepare: "husky"` é no-op até a Branch 9 (sem `.husky/` ainda).

**Verificação:**

```sh
pnpm install --frozen-lockfile   # exit 0
ls node_modules/.bin/vite         # existe
```

**Mensagem:**

```
chore: bootstrap package.json and install dependencies

Pins Node >=22 and pnpm >=9. Adds React 19, RR7 framework, Zod,
EmailJS, Tailwind v3, Vitest+RTL, Playwright, ESLint flat, Prettier,
Husky, and lint-staged. Scripts wired but Husky stays inactive until
the git-hooks branch lands.
```

---

### Commit 1.3 — `chore: configure TypeScript`

**Arquivos:**

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "types": ["vite/client", "vitest/globals", "@testing-library/jest-dom", "node"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noEmit": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "verbatimModuleSyntax": true,
    "allowImportingTsExtensions": false,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "e2e", "*.config.ts", "*.config.js"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

`tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": [
    "vite.config.ts",
    "vitest.config.ts",
    "react-router.config.ts",
    "playwright.config.ts",
    "tailwind.config.js",
    "postcss.config.cjs"
  ]
}
```

**Verificação:** `tsc --version` ≥ 5.6. Typecheck completo ainda não roda (sem código).

**Mensagem:**

```
chore: configure TypeScript with strict mode and 4 extra flags

Enables noUncheckedIndexedAccess, exactOptionalPropertyTypes,
noImplicitOverride, and noFallthroughCasesInSwitch. Adds `@/*`
path alias and a node tsconfig for build configs.
```

---

### Commit 1.4 — `chore: configure Vite and React Router v7`

**Arquivos:**

`react-router.config.ts`:

```ts
import type { Config } from "@react-router/dev/config"

export default {
  appDirectory: "src",
  ssr: false,
  prerender: ["/", "/projects"],
  basename: "/",
} satisfies Config
```

`vite.config.ts`:

```ts
import { reactRouter } from "@react-router/dev/vite"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  base: "/",
})
```

**Verificação:** `pnpm exec vite --version` ≥ 6.

**Mensagem:**

```
chore: configure Vite and React Router v7 framework SPA mode

Sets RR7 to ssr:false with prerender for the static routes. Wires
tsconfig-paths so `@/*` resolves at build and dev time.
```

---

### Commit 1.5 — `chore: configure Tailwind v3 and PostCSS`

**Arquivos:**

`tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

`postcss.config.cjs`:

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Mensagem:**

```
chore: configure Tailwind v3 and PostCSS

Adds the shadcn-stone palette plumbing via HSL CSS variables.
v4 is intentionally excluded — it breaks the shadcn-stone setup
documented in scaffolding-specification §13.
```

---

### Commit 1.6 — `chore: configure Vitest with coverage gates`

```sh
mkdir -p src
```

**Arquivos:**

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    css: false,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/*.spec.{ts,tsx}",
        "src/components/ui/**",
        "src/routes/**",
        "src/root.tsx",
        "src/setupTests.ts",
        "src/types/**",
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
        "src/lib/filterProjects.ts": {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
        "src/lib/validation.ts": {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  },
})
```

`src/setupTests.ts`:

```ts
import "@testing-library/jest-dom/vitest"
import * as matchers from "vitest-axe/matchers"
import { expect, afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

expect.extend(matchers)

afterEach(() => {
  cleanup()
})
```

**Verificação:** `pnpm test:run` finaliza com "No test files found" (exit 0 acceptable nesse modo; ok também se Vitest exigir ≥1 teste — nesse caso, ignorar até Branch 3).

**Mensagem:**

```
test: configure Vitest with jsdom and coverage thresholds

Global 70% thresholds plus 100% gates for filterProjects.ts and
validation.ts (CA-03). Sets up @testing-library/jest-dom and
vitest-axe matchers in src/setupTests.ts.
```

---

### Commit 1.7 — `chore: configure ESLint flat config`

**Arquivo:**

`eslint.config.js`:

```js
import js from "@eslint/js"
import tseslint from "typescript-eslint"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import jsxA11y from "eslint-plugin-jsx-a11y"
import prettier from "eslint-config-prettier"

export default tseslint.config(
  {
    ignores: [
      "dist",
      "build",
      ".react-router",
      "coverage",
      "node_modules",
      "playwright-report",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: { project: ["./tsconfig.json"] },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["src/components/ui/**"],
    rules: {
      "react/prop-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  prettier,
)
```

**Verificação:** `pnpm lint` (sem arquivos `.ts`/`.tsx` em `src` ainda → exit 0 / "no files matched").

**Mensagem:**

```
chore: configure ESLint flat config

Adds typescript-eslint type-checked rules, React, React Hooks,
jsx-a11y, and prettier compatibility. Relaxes rules under
src/components/ui/** since shadcn-generated code is vendored.
```

---

### Checklist de merge — `chore/setup-tooling` → `main`

Antes do PR / merge, rodar local:

- [ ] `pnpm install --frozen-lockfile` exit 0
- [ ] `pnpm-lock.yaml` versionado
- [ ] `git status` limpo na branch (sem arquivos não rastreados não intencionais)
- [ ] Estrutura de arquivos confere com a esperada na branch
- [ ] `pnpm exec tsc --version` ≥ 5.6
- [ ] `pnpm exec vite --version` ≥ 6
- [ ] Nenhum diretório `src/` populado ainda (apenas `src/setupTests.ts`)

Merge → `main`. Próxima: Branch 2.

---

## Branch 2 — `chore/domain-types`

```sh
git checkout main && git pull --ff-only
git checkout -b chore/domain-types
mkdir -p src/types
```

### Commit 2.1 — `chore: add domain types (Project, Skill, Experience, ContactForm)`

**Arquivo:** `src/types/domain.ts`

```ts
export type ProjectStatus = "concluido" | "em-andamento"
export type ProjectCategory = "trabalho" | "freelance" | "open-source" | "ensino"

export type Project = {
  id: string
  title: string
  shortDescription: string
  fullDescription: string
  technologies: string[]
  category: ProjectCategory
  status: ProjectStatus
  featured: boolean
  confidential: boolean
  repositoryUrl?: string
  demoUrl?: string
  startDate: string
  endDate?: string
}

export type SkillCategory =
  | "frontend"
  | "tools"
  | "backend"
  | "practices"
  | "pedagogical"

export type Skill = {
  name: string
  category: SkillCategory
}

export type Experience = {
  company: string
  role: string
  startDate: string
  endDate?: string
  description: string
  stack: string[]
}

export type ContactForm = {
  name: string
  email: string
  subject: string
  message: string
}
```

**Verificação:**

```sh
pnpm run typecheck    # exit 0 (tsc puro; sem react-router routes ainda → typegen é no-op)
pnpm run lint         # exit 0
```

> Se `react-router typegen` reclamar de `routes.ts` ausente, esse passo entra no green path da Branch 7. Aceitável aqui rodar apenas `pnpm exec tsc --noEmit`.

**Mensagem:**

```
chore: add domain types for Project, Skill, Experience, ContactForm

Mirrors docs/spec.md §4. Single source of truth for downstream
Zod schemas and components.
```

### Checklist de merge — `chore/domain-types` → `main`

- [ ] `pnpm exec tsc --noEmit` exit 0
- [ ] `pnpm run lint` exit 0
- [ ] `src/types/domain.ts` exporta `Project`, `Skill`, `Experience`, `ContactForm`

---

## Branch 3 — `chore/tdd-validation` (TDD #1)

```sh
git checkout main && git pull --ff-only
git checkout -b chore/tdd-validation
mkdir -p src/lib
```

### Commit 3.1 (RED) — `test: add failing tests for Zod project/contact schemas`

**Arquivo:** `src/lib/validation.test.ts`

```ts
import { describe, it, expect } from "vitest"
import { projectSchema, contactFormSchema } from "./validation"

const validProject = {
  id: "p1",
  title: "Demo",
  shortDescription: "short",
  fullDescription: "full description text",
  technologies: ["React"],
  category: "trabalho",
  status: "concluido",
  featured: false,
  confidential: false,
  startDate: "2024-01-01",
  endDate: "2024-02-01",
}

const validContact = {
  name: "Marco",
  email: "marco@example.com",
  subject: "Hello",
  message: "This is a long enough message.",
}

describe("projectSchema", () => {
  it("accepts a valid project", () => {
    expect(() => projectSchema.parse(validProject)).not.toThrow()
  })

  it("rejects project without title (CT-M2-05)", () => {
    const { title: _title, ...rest } = validProject
    expect(() => projectSchema.parse(rest)).toThrow()
  })

  it("rejects confidential project with repositoryUrl (RN-M2-02)", () => {
    expect(() =>
      projectSchema.parse({
        ...validProject,
        confidential: true,
        repositoryUrl: "https://github.com/x/y",
      }),
    ).toThrow()
  })

  it("rejects invalid startDate format", () => {
    expect(() =>
      projectSchema.parse({ ...validProject, startDate: "2024/01/01" }),
    ).toThrow()
  })

  it("rejects empty technologies array", () => {
    expect(() =>
      projectSchema.parse({ ...validProject, technologies: [] }),
    ).toThrow()
  })

  it("rejects shortDescription longer than 160 chars", () => {
    expect(() =>
      projectSchema.parse({ ...validProject, shortDescription: "a".repeat(161) }),
    ).toThrow()
  })
})

describe("contactFormSchema", () => {
  it("accepts a valid form", () => {
    expect(() => contactFormSchema.parse(validContact)).not.toThrow()
  })

  it("rejects malformed email (CT-M5-01)", () => {
    expect(() =>
      contactFormSchema.parse({ ...validContact, email: "marco@" }),
    ).toThrow()
  })

  it("rejects message with 9 chars (CT-M5-02)", () => {
    expect(() =>
      contactFormSchema.parse({ ...validContact, message: "a".repeat(9) }),
    ).toThrow()
  })

  it("rejects message with 1001 chars (CT-M5-03)", () => {
    expect(() =>
      contactFormSchema.parse({ ...validContact, message: "a".repeat(1001) }),
    ).toThrow()
  })

  it("rejects name with 1 char (RN-M5-03)", () => {
    expect(() =>
      contactFormSchema.parse({ ...validContact, name: "a" }),
    ).toThrow()
  })

  it("rejects subject with 2 chars (RN-M5-04)", () => {
    expect(() =>
      contactFormSchema.parse({ ...validContact, subject: "ab" }),
    ).toThrow()
  })
})
```

**Verificação:** `pnpm test:run` **deve falhar** (módulo `./validation` ausente). Esse é o estado vermelho.

**Mensagem:**

```
test: add failing tests for Zod project/contact schemas

Red half of TDD. 12 specs covering CT-M2-05, RN-M2-02 (refine),
CT-M5-01..03, RN-M5-03, RN-M5-04. The schemas they import do not
exist yet — vitest fails by design; the next commit makes them green.
```

> Husky ainda não ativo (Branch 9). Commit passa sem hook.

---

### Commit 3.2 (GREEN) — `feat: implement Zod schemas for domain validation`

**Arquivo:** `src/lib/validation.ts`

```ts
import { z } from "zod"

export const projectCategorySchema = z.enum([
  "trabalho",
  "freelance",
  "open-source",
  "ensino",
])

export const projectStatusSchema = z.enum(["concluido", "em-andamento"])

export const projectSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    shortDescription: z.string().min(1).max(160),
    fullDescription: z.string().min(1),
    technologies: z.array(z.string().min(1)).min(1),
    category: projectCategorySchema,
    status: projectStatusSchema,
    featured: z.boolean(),
    confidential: z.boolean(),
    repositoryUrl: z.string().url().optional(),
    demoUrl: z.string().url().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  })
  .refine((p) => !(p.confidential && p.repositoryUrl), {
    message: "RN-M2-02: confidential project cannot have repositoryUrl",
    path: ["repositoryUrl"],
  })

export const projectListSchema = z.array(projectSchema)

export const skillCategorySchema = z.enum([
  "frontend",
  "tools",
  "backend",
  "practices",
  "pedagogical",
])

export const skillSchema = z.object({
  name: z.string().min(1),
  category: skillCategorySchema,
})

export const skillListSchema = z.array(skillSchema)

export const experienceSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  description: z.string().min(1),
  stack: z.array(z.string()).default([]),
})

export const experienceListSchema = z.array(experienceSchema)

export const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(3).max(150),
  message: z.string().min(10).max(1000),
})
```

**Verificação:**

```sh
pnpm test:run          # 12 testes verdes
pnpm test:coverage     # confirmar 100% em src/lib/validation.ts
pnpm run typecheck     # exit 0
pnpm run lint          # exit 0
```

**Mensagem:**

```
feat: implement Zod schemas for domain validation

Green half of TDD. Schemas for Project, Skill, Experience, and
ContactForm. Project schema refines RN-M2-02 (confidential ⇒ no
repositoryUrl). Contact form enforces RN-M5-03/04 bounds.
Coverage: 100% on src/lib/validation.ts.
```

### Checklist de merge — `chore/tdd-validation` → `main`

- [ ] `pnpm test:run` exit 0 (12 testes verdes)
- [ ] `pnpm test:coverage` mostra 100% em `src/lib/validation.ts`
- [ ] `pnpm run typecheck` exit 0
- [ ] `pnpm run lint` exit 0
- [ ] Histórico contém **dois** commits separados: `test:` (red) seguido de `feat:` (green)

---

## Branch 4 — `chore/tdd-filter-projects` (TDD #2)

```sh
git checkout main && git pull --ff-only
git checkout -b chore/tdd-filter-projects
```

### Commit 4.1 (RED) — `test: add failing tests for filterProjects`

**Arquivo:** `src/lib/filterProjects.test.ts`

```ts
import { describe, it, expect } from "vitest"
import type { Project } from "@/types/domain"
import { filterProjects } from "./filterProjects"

function make(id: string, overrides: Partial<Project> = {}): Project {
  return {
    id,
    title: `Project ${id}`,
    shortDescription: "short",
    fullDescription: "full",
    technologies: ["React"],
    category: "trabalho",
    status: "concluido",
    featured: false,
    confidential: false,
    startDate: "2024-01-01",
    endDate: "2024-06-01",
    ...overrides,
  }
}

describe("filterProjects", () => {
  it("T01: no filter, empty list returns []", () => {
    expect(filterProjects([])).toEqual([])
  })

  it("T02: no filter, sorts featured-first and date desc", () => {
    const a = make("a", { featured: false, endDate: "2024-12-01" })
    const b = make("b", { featured: true, endDate: "2023-01-01" })
    const c = make("c", { featured: false, endDate: "2024-06-01" })
    const result = filterProjects([a, b, c])
    expect(result.map((p) => p.id)).toEqual(["b", "a", "c"])
  })

  it("T03: empty technologies filter is a no-op", () => {
    const a = make("a")
    expect(filterProjects([a], { technologies: [] })).toHaveLength(1)
  })

  it("T04: tech OR within — matches when project has one of them", () => {
    const a = make("a", { technologies: ["React", "TS"] })
    expect(filterProjects([a], { technologies: ["React"] })).toHaveLength(1)
  })

  it("T05: no project matches tech — returns [] (CT-M2-03)", () => {
    const a = make("a", { technologies: ["React"] })
    expect(filterProjects([a], { technologies: ["Vue"] })).toEqual([])
  })

  it("T06: tech OR — matches if any filter tech is in project", () => {
    const a = make("a", { technologies: ["TS"] })
    expect(filterProjects([a], { technologies: ["React", "TS"] })).toHaveLength(1)
  })

  it("T07: category mismatch excludes project", () => {
    const a = make("a", { category: "trabalho" })
    expect(filterProjects([a], { categories: ["freelance"] })).toEqual([])
  })

  it("T08: tech + category AND between (CT-M2-01)", () => {
    const a = make("a", { technologies: ["React"], category: "freelance" })
    const b = make("b", { technologies: ["React"], category: "trabalho" })
    const c = make("c", { technologies: ["Vue"], category: "freelance" })
    const result = filterProjects([a, b, c], {
      technologies: ["React"],
      categories: ["freelance"],
    })
    expect(result.map((p) => p.id)).toEqual(["a"])
  })

  it("T09: featured appears before non-featured (CT-M2-04)", () => {
    const a = make("a", { featured: false, endDate: "2024-12-01" })
    const b = make("b", { featured: true, endDate: "2024-01-01" })
    const result = filterProjects([a, b])
    expect(result[0]?.id).toBe("b")
  })

  it("T10: two featured sorted by date desc", () => {
    const a = make("a", { featured: true, endDate: "2024-01-01" })
    const b = make("b", { featured: true, endDate: "2024-12-01" })
    expect(filterProjects([a, b]).map((p) => p.id)).toEqual(["b", "a"])
  })

  it("T11: project without endDate sorts by startDate", () => {
    const a: Project = {
      id: "a",
      title: "A",
      shortDescription: "s",
      fullDescription: "f",
      technologies: ["React"],
      category: "trabalho",
      status: "em-andamento",
      featured: false,
      confidential: false,
      startDate: "2024-06-01",
    }
    const b = make("b", { startDate: "2024-01-01", endDate: "2024-05-01" })
    expect(filterProjects([a, b]).map((p) => p.id)).toEqual(["a", "b"])
  })

  it("T12: pure — does not mutate input array", () => {
    const a = make("a", { featured: false })
    const b = make("b", { featured: true })
    const input: Project[] = [a, b]
    const snapshot = JSON.stringify(input)
    filterProjects(input)
    expect(JSON.stringify(input)).toBe(snapshot)
  })

  it("T13: technology match is case-sensitive", () => {
    const a = make("a", { technologies: ["React"] })
    expect(filterProjects([a], { technologies: ["react"] })).toEqual([])
  })
})
```

**Verificação:** `pnpm test:run` **deve falhar** (módulo `./filterProjects` ausente). Estado vermelho.

**Mensagem:**

```
test: add failing tests for filterProjects

Red half of TDD. 13 cases covering RN-M2-03 (OR within / AND between),
RN-M2-04 (empty state), RN-M2-05 (sort order), purity, and case-
sensitivity (CT-M2-01/03/04). Implementation lands in the next commit.
```

---

### Commit 4.2 (GREEN) — `feat: implement filterProjects with featured-first sort`

**Arquivo:** `src/lib/filterProjects.ts`

```ts
import type { Project, ProjectCategory } from "@/types/domain"

export type ProjectFilter = {
  technologies?: readonly string[]
  categories?: readonly ProjectCategory[]
}

export function filterProjects(
  projects: readonly Project[],
  filter: ProjectFilter = {},
): Project[] {
  const techs = filter.technologies ?? []
  const cats = filter.categories ?? []

  const filtered = projects.filter((p) => {
    const techOk =
      techs.length === 0 || techs.some((t) => p.technologies.includes(t))
    const catOk = cats.length === 0 || cats.includes(p.category)
    return techOk && catOk
  })

  return [...filtered].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    const aKey = a.endDate ?? a.startDate
    const bKey = b.endDate ?? b.startDate
    return bKey.localeCompare(aKey)
  })
}
```

**Verificação:**

```sh
pnpm test:run          # 25 testes verdes (12 + 13)
pnpm test:coverage     # 100% em filterProjects.ts e validation.ts
pnpm run typecheck     # exit 0
pnpm run lint          # exit 0
```

**Mensagem:**

```
feat: implement filterProjects with featured-first sort

Green half of TDD. Pure function: OR within each dimension, AND
between dimensions, sorted by featured then date desc (endDate
falling back to startDate). Coverage: 100% on
src/lib/filterProjects.ts.
```

### Checklist de merge — `chore/tdd-filter-projects` → `main`

- [ ] 25 testes verdes (`pnpm test:run`)
- [ ] `pnpm test:coverage` confirma 100% em ambos arquivos críticos
- [ ] `pnpm run typecheck` exit 0
- [ ] `pnpm run lint` exit 0
- [ ] Dois commits: `test:` (red) seguido de `feat:` (green)

---

## Branch 5 — `chore/seed-data`

```sh
git checkout main && git pull --ff-only
git checkout -b chore/seed-data
mkdir -p src/data
```

### Commit 5.1 — `chore: add empty seed JSONs for projects, skills, experiences`

**Arquivos:**

`src/data/projects.json`:

```json
[]
```

`src/data/skills.json`:

```json
[]
```

`src/data/experiences.json`:

```json
[]
```

**Verificação:** `pnpm test:run` ainda verde; `pnpm run lint` exit 0.

> Schemas Zod aceitam arrays vazios. Conteúdo real entra nos módulos M1–M5 posteriormente.

**Mensagem:**

```
chore: add empty seed JSONs for projects, skills, experiences

Placeholders validated by Zod array schemas. Real content lands
with each module's implementation.
```

### Checklist de merge — `chore/seed-data` → `main`

- [ ] Três arquivos JSON existem em `src/data/`
- [ ] `JSON.parse` cada um sem erro
- [ ] `pnpm test:run` ainda verde

---

## Branch 6 — `chore/shadcn-setup`

```sh
git checkout main && git pull --ff-only
git checkout -b chore/shadcn-setup
mkdir -p src/components/ui
```

### Commit 6.1 — `chore: add shadcn configuration (cn util, app.css, components.json)`

**Arquivos:**

`src/lib/cn.ts`:

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

`src/app.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 20 14.3% 4.1%;
    --card: 0 0% 100%;
    --card-foreground: 20 14.3% 4.1%;
    --popover: 0 0% 100%;
    --popover-foreground: 20 14.3% 4.1%;
    --primary: 24 9.8% 10%;
    --primary-foreground: 60 9.1% 97.8%;
    --secondary: 60 4.8% 95.9%;
    --secondary-foreground: 24 9.8% 10%;
    --muted: 60 4.8% 95.9%;
    --muted-foreground: 25 5.3% 44.7%;
    --accent: 60 4.8% 95.9%;
    --accent-foreground: 24 9.8% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 60 9.1% 97.8%;
    --border: 20 5.9% 90%;
    --input: 20 5.9% 90%;
    --ring: 20 14.3% 4.1%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 20 14.3% 4.1%;
    --foreground: 60 9.1% 97.8%;
    --card: 20 14.3% 4.1%;
    --card-foreground: 60 9.1% 97.8%;
    --popover: 20 14.3% 4.1%;
    --popover-foreground: 60 9.1% 97.8%;
    --primary: 60 9.1% 97.8%;
    --primary-foreground: 24 9.8% 10%;
    --secondary: 12 6.5% 15.1%;
    --secondary-foreground: 60 9.1% 97.8%;
    --muted: 12 6.5% 15.1%;
    --muted-foreground: 24 5.4% 63.9%;
    --accent: 12 6.5% 15.1%;
    --accent-foreground: 60 9.1% 97.8%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 60 9.1% 97.8%;
    --border: 12 6.5% 15.1%;
    --input: 12 6.5% 15.1%;
    --ring: 24 5.7% 82.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

`components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app.css",
    "baseColor": "stone",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/cn",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

**Verificação:**

```sh
pnpm run typecheck   # exit 0
pnpm run lint        # exit 0
pnpm test:run        # ainda verde
```

**Mensagem:**

```
chore: add shadcn configuration (cn util, app.css, components.json)

Wires the cn() helper to @/lib/cn alias, declares CSS variables for
the new-york + stone palette, and points components.json to the
correct config and CSS paths.
```

---

### Commit 6.2 — `chore: add shadcn primitives (button, card, badge, input, textarea)`

**Comando:**

```sh
pnpm dlx shadcn@latest add button card badge input textarea --yes --overwrite
```

**Arquivos gerados** (não editar à mão):

- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/textarea.tsx`

Conferir:

```sh
ls src/components/ui   # 5 .tsx
```

> Se a CLI criar `src/lib/utils.ts` ignorando o alias `@/lib/cn`: deletar o arquivo, conferir `components.json`, re-rodar com `--cwd .`. A CLI deve honrar o alias declarado.

**Verificação:**

```sh
pnpm run typecheck   # exit 0
pnpm run lint        # exit 0 (regras relaxadas em src/components/ui/**)
pnpm test:run        # verde
```

**Mensagem:**

```
chore: add shadcn primitives (button, card, badge, input, textarea)

Generated via `shadcn@latest add`. Vendored code under
src/components/ui/** — never edit by hand (AGENTS.md §4).
Re-run the CLI to update.
```

### Checklist de merge — `chore/shadcn-setup` → `main`

- [ ] `src/lib/cn.ts` exporta `cn`
- [ ] `src/app.css` declara as duas paletas (`:root` e `.dark`)
- [ ] `src/components/ui/` contém exatamente os 5 arquivos esperados
- [ ] Nenhum `src/lib/utils.ts` extra
- [ ] `pnpm run typecheck`, `pnpm run lint`, `pnpm test:run` verdes

---

## Branch 7 — `chore/routing-skeleton`

```sh
git checkout main && git pull --ff-only
git checkout -b chore/routing-skeleton
mkdir -p src/routes
```

### Commit 7.1 — `chore: add RR7 root layout and route table`

**Arquivos:**

`src/root.tsx`:

```tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router"
import type { ReactNode } from "react"
import "./app.css"

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
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
  return <Outlet />
}
```

`src/routes.ts`:

```ts
import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  index("routes/_index.tsx"),
  route("projects", "routes/projects._index.tsx"),
  route("projects/:id", "routes/projects.$id.tsx"),
] satisfies RouteConfig
```

> Build ainda falha sem os arquivos de rota. O próximo commit adiciona os stubs e fecha o ciclo.

**Mensagem:**

```
chore: add RR7 root layout and route table

Declares the three routes (/, /projects, /projects/:id) and the
root HTML shell. Stub route files follow in the next commit so
the build stays viable.
```

---

### Commit 7.2 — `chore: add route stubs (home, projects list, project detail)`

**Arquivos:**

`src/routes/_index.tsx`:

```tsx
export default function Home() {
  return (
    <main>
      <h1>Marco Hansen</h1>
      <p>Frontend Developer & Tech Instructor</p>
      <section id="contact">
        <h2>Contato</h2>
        <form>
          <label>
            Email
            <input type="email" name="email" />
          </label>
        </form>
      </section>
    </main>
  )
}
```

`src/routes/projects._index.tsx`:

```tsx
export default function ProjectsList() {
  return (
    <main>
      <h1>Projetos</h1>
      <label>
        Tecnologia
        <input type="search" name="technology" placeholder="React, TypeScript..." />
      </label>
    </main>
  )
}
```

`src/routes/projects.$id.tsx`:

```tsx
import { useParams } from "react-router"

export default function ProjectDetail() {
  const { id } = useParams()
  return (
    <main>
      <h1>Projeto {id ?? "desconhecido"}</h1>
    </main>
  )
}
```

**Verificação:**

```sh
pnpm run typecheck   # exit 0 (typegen + tsc)
pnpm run lint        # exit 0
pnpm test:run        # verde
```

**Mensagem:**

```
chore: add route stubs (home, projects list, project detail)

Placeholders that expose the anchor elements consumed by the
Playwright smoke specs. Real content lands in modules M1–M5.
UI text in PT-BR per AGENTS.md §5.
```

---

### Commit 7.3 — `chore: add index.html entry`

**Arquivo:** `index.html`

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Marco Hansen — Portfolio</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

**Verificação:**

```sh
pnpm run typecheck   # exit 0
pnpm run lint        # exit 0
pnpm run build       # gera build/client/index.html
ls build/client/index.html
```

**Mensagem:**

```
chore: add index.html entry

Required by the Tailwind content glob and by Vite preview. RR7
renders production HTML through the Layout in root.tsx; this file
is just the dev/preview shell.
```

### Checklist de merge — `chore/routing-skeleton` → `main`

- [ ] `pnpm run typecheck` exit 0
- [ ] `pnpm run lint` exit 0
- [ ] `pnpm run build` gera `build/client/index.html`
- [ ] `pnpm test:run` verde
- [ ] `pnpm dev` sobe sem erros (`http://localhost:5173`) — verificação manual rápida

---

## Branch 8 — `chore/e2e-smoke-tests`

```sh
git checkout main && git pull --ff-only
git checkout -b chore/e2e-smoke-tests
mkdir -p e2e
```

### Commit 8.1 — `test: add Playwright config and 4 smoke specs`

**Arquivos:**

`playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
```

`e2e/home.spec.ts`:

```ts
import { test, expect } from "@playwright/test"

test("home loads with hero title containing 'Marco'", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Marco")
})
```

`e2e/projects-list.spec.ts`:

```ts
import { test, expect } from "@playwright/test"

test("projects list shows technology filter", async ({ page }) => {
  await page.goto("/projects")
  await expect(page.getByLabel(/tecnologia/i)).toBeVisible()
})
```

`e2e/project-detail.spec.ts`:

```ts
import { test, expect } from "@playwright/test"

test("project detail renders project title", async ({ page }) => {
  await page.goto("/projects/p1")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Projeto")
})
```

`e2e/contact.spec.ts`:

```ts
import { test, expect } from "@playwright/test"

test("contact section has email input", async ({ page }) => {
  await page.goto("/#contact")
  await expect(page.getByLabel(/email/i)).toBeVisible()
})
```

**Comando único (não vai pro commit, mas garante browsers locais):**

```sh
pnpm run e2e:install
```

**Verificação:**

```sh
pnpm run typecheck   # exit 0
pnpm run e2e         # 4 smoke specs passam
```

**Mensagem:**

```
test: add Playwright config and 4 smoke specs

One spec per route (/, /projects, /projects/:id, /#contact). Each
asserts a single anchor element rendered by the route stubs.
Browsers installed via `pnpm run e2e:install` (not committed).
```

### Checklist de merge — `chore/e2e-smoke-tests` → `main`

- [ ] `pnpm run e2e` passa as 4 specs localmente
- [ ] `playwright.config.ts` aponta para `./e2e`
- [ ] Browsers chromium instalados (`pnpm run e2e:install` se primeiro setup)
- [ ] `pnpm run typecheck`, `pnpm run lint`, `pnpm test:run` verdes

---

## Branch 9 — `chore/git-hooks`

```sh
git checkout main && git pull --ff-only
git checkout -b chore/git-hooks
```

### Commit 9.1 — `chore: enable Husky pre-commit with lint-staged, typecheck, tests`

**Comandos:**

```sh
pnpm exec husky init
```

> `husky init` cria `.husky/pre-commit` com script default. Sobrescrever.

`.husky/pre-commit`:

```sh
pnpm exec lint-staged
pnpm run typecheck
pnpm run test:run
```

```sh
chmod +x .husky/pre-commit
```

**Atualizar `package.json`** adicionando bloco `lint-staged`:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css,html}": ["prettier --write"]
  }
}
```

(Inserir como sibling de `scripts`. Não tocar `dependencies` / `devDependencies`.)

**Verificação manual do hook:**

```sh
# fluxo positivo
touch src/lib/_smoke.ts
echo 'export const _smoke = 1' >> src/lib/_smoke.ts
git add src/lib/_smoke.ts
git commit -m "test: smoke commit"   # deve passar: lint+types+tests
git reset --hard HEAD~1               # desfaz

# fluxo negativo
echo 'const unused = 1' >> src/lib/cn.ts
git add src/lib/cn.ts
git commit -m "test: should fail"     # deve ser bloqueado
git checkout -- src/lib/cn.ts
```

**Mensagem do commit real:**

```
chore: enable Husky pre-commit with lint-staged, typecheck, tests

Hook runs lint-staged → typecheck → test:run. Fails block the
commit. Never bypass with --no-verify (AGENTS.md §7).
```

### Checklist de merge — `chore/git-hooks` → `main`

- [ ] `.husky/pre-commit` existe e tem bit `x`
- [ ] `package.json` contém bloco `lint-staged`
- [ ] Commit forçado com erro de lint é bloqueado (teste manual acima)
- [ ] Commit válido passa pelo hook

---

## Branch 10 — `chore/public-assets`

```sh
git checkout main && git pull --ff-only
git checkout -b chore/public-assets
mkdir -p public/cv
```

### Commit 10.1 — `chore: add public assets (favicon, 404 fallback, cv folder)`

**Arquivos:**

`public/cv/.gitkeep` (arquivo vazio)

`public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#1c1917" />
  <text x="50%" y="55%" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="28" font-weight="700" fill="#fafaf9">MH</text>
</svg>
```

`public/404.html`:

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Marco Hansen — Portfolio</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

> O deploy workflow (Branch 11) sobrescreverá `404.html` com o `index.html` real do build. Esse aqui é só um placeholder válido.

**Verificação:**

```sh
pnpm run build       # exit 0; ls build/client/favicon.svg deve existir
```

**Mensagem:**

```
chore: add public assets (favicon, 404 fallback, cv folder)

Favicon SVG (MH monogram), GH Pages 404 fallback placeholder, and
.gitkeep for the future CV PDF location.
```

### Checklist de merge — `chore/public-assets` → `main`

- [ ] `public/favicon.svg`, `public/404.html`, `public/cv/.gitkeep` versionados
- [ ] `pnpm run build` copia `favicon.svg` para `build/client/`
- [ ] Pre-commit hook não bloqueou (lint dos `.html`/`.svg` é apenas prettier)

---

## Branch 11 — `ci/workflows-and-readme`

```sh
git checkout main && git pull --ff-only
git checkout -b ci/workflows-and-readme
mkdir -p .github/workflows
```

### Commit 11.1 — `ci: add CI workflow (lint, typecheck, tests, build, e2e)`

**Arquivo:** `.github/workflows/ci.yml`

```yaml
name: ci

on:
  pull_request:
  push:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint
      - run: pnpm run typecheck
      - run: pnpm run test:coverage
      - run: pnpm run build
      - name: Install Playwright browsers
        run: pnpm run e2e:install
      - run: pnpm run e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

**Mensagem:**

```
ci: add CI workflow (lint, typecheck, tests, build, e2e)

Single verify job on Node 22 + pnpm 9. Uploads playwright-report
as artifact on failure. Coverage thresholds enforced by Vitest.
```

---

### Commit 11.2 — `ci: add GitHub Pages deploy workflow`

**Arquivo:** `.github/workflows/deploy.yml`

```yaml
name: deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
        env:
          VITE_EMAILJS_SERVICE_ID: ${{ secrets.VITE_EMAILJS_SERVICE_ID }}
          VITE_EMAILJS_TEMPLATE_ID: ${{ secrets.VITE_EMAILJS_TEMPLATE_ID }}
          VITE_EMAILJS_PUBLIC_KEY: ${{ secrets.VITE_EMAILJS_PUBLIC_KEY }}
      - name: Copy 404 fallback
        run: cp build/client/index.html build/client/404.html
      - uses: actions/upload-pages-artifact@v3
        with:
          path: build/client


  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**Mensagem:**

```
ci: add GitHub Pages deploy workflow

Builds with EmailJS secrets, copies index.html to 404.html so SPA
refresh on /projects/:id works, and uploads build/client/ as the
Pages artifact. Triggered on push to main + workflow_dispatch.
```

---

### Commit 11.3 — `docs: add README`

**Arquivo:** `README.md`

````markdown
# Portfolio — Marco Hansen

Personal portfolio. React 19 + TypeScript (strict) + React Router v7 + Tailwind v3 + shadcn/ui. Hosted on GitHub Pages.

Decisions live in `docs/spec.md`. Scaffolding recipe in `docs/scaffolding-specification.md`. Implementation rules in `AGENTS.md`.

## Quickstart

```sh
pnpm install
cp .env.example .env   # fill EmailJS keys
pnpm dev               # http://localhost:5173
```

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Local dev server |
| `pnpm build` | Production build (`build/client/`) |
| `pnpm test` | Vitest watch |
| `pnpm test:coverage` | Coverage + enforced thresholds |
| `pnpm lint` | ESLint, zero warnings |
| `pnpm format` | Prettier write |
| `pnpm typecheck` | RR7 typegen + `tsc --noEmit` |
| `pnpm e2e` | Playwright smoke tests |

## License

UNLICENSED — personal portfolio of Marco Hansen.
````

**Verificação final completa (Fase 22):**

```sh
pnpm install --frozen-lockfile
pnpm run format:check
pnpm run lint
pnpm run typecheck
pnpm run test:coverage
pnpm run build
pnpm run e2e
```

Todos exit 0.

**Mensagem:**

```
docs: add README

Quickstart, scripts table, and pointers to spec/AGENTS.md.
```

### Checklist de merge — `ci/workflows-and-readme` → `main`

- [ ] `.github/workflows/ci.yml` e `deploy.yml` presentes
- [ ] `README.md` presente
- [ ] `pnpm install --frozen-lockfile` exit 0
- [ ] `pnpm run format:check` exit 0
- [ ] `pnpm run lint` exit 0
- [ ] `pnpm run typecheck` exit 0
- [ ] `pnpm run test:coverage` exit 0 + 100% em filterProjects e validation
- [ ] `pnpm run build` exit 0 + `build/client/index.html` gerado
- [ ] `pnpm run e2e` exit 0 (4 smoke specs)
- [ ] Hook pre-commit passou em cada commit desta branch

> **Atenção pré-push:** confirmar que o repositório remoto `marcohansen.github.io` existe no GitHub e está configurado como user-page (`Settings → Pages → Build and deployment → GitHub Actions`). Sem isso, o deploy workflow falha após o merge.

Após merge: o push em `main` aciona `ci.yml` (verde esperado) **e** `deploy.yml` (publica em `marcohansen.github.io`). Esse é o equivalente da antiga Fase 23 — sem commit gigante, apenas o último merge da sequência.

---

## 2. Critérios de aceite globais (Fase 22 final)

Espelham `scaffolding-specification.md §12`. Validados ao final de cada branch e definitivamente após a Branch 11.

| ID | Verificação | Como conferir |
|----|-------------|---------------|
| SC-01 | install passa | exit 0 |
| SC-02 | typecheck passa | exit 0 |
| SC-03 | lint passa com `--max-warnings=0` | exit 0 |
| SC-04 | 100% coverage em filterProjects + validation | output do `test:coverage` |
| SC-05 | build gera `build/client/` | `ls build/client/index.html` |
| SC-06 | 4 e2e smoke specs passam | output do `e2e` |
| SC-07 | pre-commit bloqueia erros | teste manual: staged com lint error → `git commit` aborta |
| SC-08 | CI verde | push para `main` após Branch 11 → Actions tab |
| SC-09 | deploy publica com `404.html` | release no `marcohansen.github.io` |

---

## Apêndice A — Mapa "spec → branch / commit"

| Spec ref | Atendida em |
|---------|-------------|
| spec.md §3.M2 RF-M2-02 (filtro tech) | Branch 4 (commits 4.1, 4.2 — tests T04/T06/T13) |
| spec.md §3.M2 RF-M2-03 (filtro categoria) | Branch 4 (tests T07/T08) |
| spec.md §3.M2 RN-M2-03 (OR/AND) | Branch 4 (impl + T04/T06/T08) |
| spec.md §3.M2 RN-M2-05 (ordenação) | Branch 4 (impl + T02/T09/T10/T11) |
| spec.md §3.M5 RN-M5-01..04 | Branch 3 (contactFormSchema + tests) |
| spec.md §4 Modelo de dados | Branch 2 + Branch 3 |
| spec.md §7 Stack | Branch 1 (commit 1.2) |
| spec.md §8 Idioma do código | reforçado em `AGENTS.md`; revisão de PR |
| spec.md §10 CA-01 | Branch 11 (testes obrigatórios) |
| spec.md §10 CA-02 | Branch 1 (commit 1.3, TS strict) |
| spec.md §10 CA-03 | Branch 1 (commit 1.6 thresholds) + Branches 3, 4 |
| spec.md §10 CA-04 | Branch 1 (vitest-axe) + Branch 8 (Playwright) |
| spec.md §10 CA-05 | Branch 7 (commit 7.3 build OK) |
| spec.md §11 Próximos passos | Ordem geral das branches |

---

## Apêndice B — Lista de arquivos por commit

```
1.1: .nvmrc, .npmrc, .gitignore, .editorconfig, .env.example,
     .prettierignore, .prettierrc.json
1.2: package.json (initial) + pnpm-lock.yaml + node_modules/
1.3: tsconfig.json, tsconfig.node.json
1.4: react-router.config.ts, vite.config.ts
1.5: tailwind.config.js, postcss.config.cjs
1.6: vitest.config.ts, src/setupTests.ts
1.7: eslint.config.js
2.1: src/types/domain.ts
3.1: src/lib/validation.test.ts                       (RED)
3.2: src/lib/validation.ts                            (GREEN)
4.1: src/lib/filterProjects.test.ts                   (RED)
4.2: src/lib/filterProjects.ts                        (GREEN)
5.1: src/data/projects.json, skills.json, experiences.json
6.1: src/lib/cn.ts, src/app.css, components.json
6.2: src/components/ui/{badge,button,card,input,textarea}.tsx (generated)
7.1: src/root.tsx, src/routes.ts
7.2: src/routes/_index.tsx, projects._index.tsx, projects.$id.tsx
7.3: index.html
8.1: playwright.config.ts, e2e/{home,projects-list,project-detail,contact}.spec.ts
9.1: .husky/pre-commit + package.json (lint-staged block)
10.1: public/cv/.gitkeep, public/favicon.svg, public/404.html
11.1: .github/workflows/ci.yml
11.2: .github/workflows/deploy.yml
11.3: README.md
```

Pré-existentes (não tocados): `docs/spec.md`, `docs/scaffolding-specification.md`, `docs/scaffolding-blueprint.md`, `AGENTS.md`.

---

## Apêndice C — Sequência de comandos consolidada

```sh
# Fase 0 — preflight (sem commit)
node --version
pnpm --version
git status

# Branch 1
git checkout -b chore/setup-tooling
# commit 1.1 — criar dotfiles (editor); git add + commit
# commit 1.2 — package.json + 4 grupos de pnpm add
pnpm add react@^19 react-dom@^19 react-router@^7 @react-router/node@^7 \
  zod@^3.23 @emailjs/browser@^4.4 \
  clsx tailwind-merge class-variance-authority lucide-react tailwindcss-animate
pnpm add -D typescript@^5.6 @types/node @types/react@^19 @types/react-dom@^19 \
  vite@^6 vite-tsconfig-paths @react-router/dev@^7
pnpm add -D vitest@^2.1 @vitest/coverage-v8 jsdom \
  @testing-library/react @testing-library/dom @testing-library/user-event @testing-library/jest-dom \
  vitest-axe axe-core @playwright/test@^1.48
pnpm add -D eslint @eslint/js typescript-eslint \
  eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y eslint-config-prettier \
  prettier prettier-plugin-tailwindcss \
  husky lint-staged \
  tailwindcss@^3.4 postcss@^8.4 autoprefixer@^10.4
# commits 1.3 - 1.7 — criar configs e committar um por um
# Merge → main (rodar checklist)

# Branch 2 — chore/domain-types
git checkout main && git pull --ff-only
git checkout -b chore/domain-types
# commit 2.1
# Merge

# Branch 3 — TDD validation
git checkout main && git pull --ff-only
git checkout -b chore/tdd-validation
# commit 3.1 RED — escrever validation.test.ts; pnpm test:run falha
# commit 3.2 GREEN — implementar validation.ts; pnpm test:run + coverage
# Merge

# Branch 4 — TDD filterProjects
git checkout main && git pull --ff-only
git checkout -b chore/tdd-filter-projects
# commit 4.1 RED, 4.2 GREEN
# Merge

# Branches 5..10 — análogo

# Branch 9 — husky setup
git checkout -b chore/git-hooks
pnpm exec husky init
# sobrescrever .husky/pre-commit; chmod +x
# editar package.json adicionando lint-staged
# commit 9.1 (já passa pelo próprio hook)
# Merge

# Branch 11 — CI/deploy/README
git checkout -b ci/workflows-and-readme
# commits 11.1, 11.2, 11.3
# Verificação final (Fase 22):
pnpm install --frozen-lockfile
pnpm run format:check
pnpm run lint
pnpm run typecheck
pnpm run test:coverage
pnpm run build
pnpm run e2e
# Merge → main → CI roda → deploy publica
```

---

## Apêndice D — Falhas possíveis e mitigação

| Sintoma | Causa provável | Mitigação |
|---------|----------------|-----------|
| `pnpm install` reclama de peer `react@19` | RR7 peer ranges restritos | Conferir versões no commit 1.2; se persistir, adicionar `strict-peer-dependencies=false` em `.npmrc` |
| `react-router typegen` falha na Branch 2 | sem `routes.ts` ainda | Rodar apenas `pnpm exec tsc --noEmit` na Branch 2; typecheck completo após Branch 7 |
| `pnpm dlx shadcn add` cria `src/lib/utils.ts` | CLI ignorou alias `@/lib/cn` | Deletar `utils.ts`, conferir `components.json` (commit 6.1), re-rodar com `--cwd .` |
| Vitest não acha tipos `@testing-library/jest-dom` | `tsconfig types` incompleto | Conferir commit 1.3 (`types` inclui `@testing-library/jest-dom`) |
| Playwright spec falha em CI mas passa local | dev server demora a iniciar | Aumentar `webServer.timeout` em `playwright.config.ts` |
| Pre-commit não dispara | `.husky/pre-commit` sem bit `x` | `chmod +x .husky/pre-commit` |
| Coverage não atinge 100% em `validation.ts` | Refine não exercitado | Manter o teste "rejects confidential project with repositoryUrl" |
| GH Pages 404 em refresh de `/projects/x` | `404.html` ausente no deploy | Conferir commit 11.2, step "Copy 404 fallback" |
| Red commit bloqueado pelo hook | Husky já instalado antes da hora | Branches 3 e 4 **devem** mergear antes da Branch 9 |
| `pnpm-lock.yaml` muda entre commits 1.2 e 11.x | reinstalação alterou o lock | Re-rodar com `--frozen-lockfile` no PR final; se diferir, refazer 1.2 e propagar |

---

**Fim do blueprint.**
