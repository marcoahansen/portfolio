# Scaffolding Specification — Portfolio Marco Hansen

**Versão:** 0.1.0
**Status:** Draft — pronto para execução
**Pré-requisito:** `docs/spec.md` v0.1.0 (lido e aprovado)

> Esta spec descreve **exatamente** como bootstrappar o projeto: arquivos, configs, comandos. Segue o princípio do spec principal: **TDD primeiro, UI como consequência**. A primeira lógica de domínio (`filterProjects`) já vem com seus testes definidos.

---

## 1. Pré-requisitos do ambiente

- Node.js **22 LTS** (use `.nvmrc`)
- pnpm **>= 9** (`corepack enable && corepack prepare pnpm@latest --activate`)
- Conta GitHub com repositório **`marcohansen.github.io`** (user page) criado

---

## 2. Stack e versões fixadas

| Camada | Pacote | Versão alvo |
|--------|--------|-------------|
| Runtime | React | `^19.0.0` |
| Runtime | React DOM | `^19.0.0` |
| Linguagem | TypeScript | `^5.6.0` (strict + 4 flags extras) |
| Build/Dev | Vite | `^6.0.0` (via plugin RR7) |
| Roteamento | `react-router` | `^7.0.0` |
| Roteamento (dev) | `@react-router/dev` | `^7.0.0` |
| Roteamento (node) | `@react-router/node` | `^7.0.0` (peer) |
| Estilo | tailwindcss | `^3.4.0` (**v3 obrigatório**, não v4) |
| Estilo | postcss | `^8.4.0` |
| Estilo | autoprefixer | `^10.4.0` |
| Componentes | shadcn/ui | CLI: `shadcn@latest` (style: `new-york`, base: `stone`) |
| Utilidades shadcn | `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`, `tailwindcss-animate` | latest |
| Validação | zod | `^3.23.0` |
| Form (M5) | `@emailjs/browser` | `^4.4.0` |
| Testes (unit) | vitest | `^2.1.0` |
| Testes (DOM) | `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom` | latest |
| Testes (env) | `jsdom` | latest |
| Testes (a11y) | `vitest-axe`, `axe-core` | latest |
| Cobertura | `@vitest/coverage-v8` | matches vitest |
| Lint | eslint (flat config), `@typescript-eslint/*`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y` | latest |
| Format | prettier, `prettier-plugin-tailwindcss` | latest |
| Hooks | husky, lint-staged | latest |
| E2E | `@playwright/test` | `^1.48.0` |

---

## 3. Estrutura de diretórios

```
portfolio/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── .husky/
│   └── pre-commit
├── docs/
│   ├── spec.md
│   ├── scaffolding-specification.md
│   └── features/                 # ADRs e specs por feature
├── e2e/
│   ├── home.spec.ts
│   ├── projects-list.spec.ts
│   ├── project-detail.spec.ts
│   └── contact.spec.ts
├── public/
│   ├── 404.html                  # SPA fallback p/ GH Pages
│   ├── favicon.svg
│   └── cv/
│       └── .gitkeep              # CV PDF entra aqui
├── src/
│   ├── app.css                   # @tailwind base/components/utilities + CSS vars do shadcn
│   ├── components/               # componentes da aplicação
│   │   └── ui/                   # primitivos do shadcn (NÃO editar à mão; refazer via CLI)
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── textarea.tsx
│   ├── data/
│   │   ├── projects.json
│   │   ├── skills.json
│   │   └── experiences.json
│   ├── lib/
│   │   ├── cn.ts                 # gerado pelo shadcn (clsx + twMerge)
│   │   ├── filterProjects.ts
│   │   ├── filterProjects.test.ts
│   │   ├── validation.ts         # Zod schemas + parsers
│   │   └── validation.test.ts
│   ├── routes/
│   │   ├── _index.tsx            # `/`
│   │   ├── projects._index.tsx   # `/projects`
│   │   └── projects.$id.tsx      # `/projects/:id`
│   ├── types/
│   │   └── domain.ts             # tipos do §4 do spec principal
│   ├── root.tsx                  # layout raiz (RR7 framework)
│   ├── routes.ts                 # tabela de rotas explícita
│   └── setupTests.ts             # globals para Vitest + jest-dom + vitest-axe
├── .editorconfig
├── .env.example
├── .gitignore
├── .nvmrc                        # "22"
├── .npmrc
├── .prettierignore
├── .prettierrc.json
├── AGENTS.md
├── README.md
├── components.json               # shadcn config
├── eslint.config.js              # flat config
├── index.html
├── package.json
├── playwright.config.ts
├── postcss.config.cjs
├── react-router.config.ts
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vitest.config.ts
```

### Convenção de pastas

- `src/components/ui/*` — **gerado** pelo `shadcn` CLI. Não editar à mão; modificar via re-add ou wrapper na pasta `src/components/`.
- `src/components/*` (raiz) — componentes da aplicação (Hero, ProjectCard, ContactForm…). Compõem primitivos do `ui/`.
- `src/lib/*` — lógica de domínio pura (sem React). Cobertura obrigatória de 100% para regras de M2 e M5 (CA-03).
- `src/data/*` — dados estáticos (JSON). Carregados via import estático.
- `src/types/*` — tipos do domínio. Único ponto de verdade dos contratos.
- `src/routes/*` — entradas de rota do React Router v7 framework mode (file-based opcional; ver `src/routes.ts`).

---

## 4. Comandos pnpm

```json
{
  "scripts": {
    "dev": "react-router dev",
    "build": "react-router build",
    "start": "react-router-serve ./build/server/index.js",
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

> **Nota SPA:** `react-router.config.ts` define `ssr: false`. `build` gera saída em `build/client/` — esse é o diretório publicado no GH Pages. `start` não é usado em produção (sem servidor).

---

## 5. Configurações

### 5.1 `package.json` — metadados centrais

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
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css,html}": ["prettier --write"]
  }
}
```

### 5.2 `tsconfig.json`

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

### 5.3 `tsconfig.node.json`

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
  "include": ["vite.config.ts", "vitest.config.ts", "react-router.config.ts", "playwright.config.ts", "tailwind.config.js", "postcss.config.cjs"]
}
```

### 5.4 `react-router.config.ts`

```ts
import type { Config } from "@react-router/dev/config"

export default {
  appDirectory: "src",
  ssr: false,
  // Pre-render rotas estáticas; rota dinâmica /projects/:id é resolvida em runtime
  prerender: ["/", "/projects"],
  basename: "/",
} satisfies Config
```

### 5.5 `vite.config.ts`

```ts
import { reactRouter } from "@react-router/dev/vite"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  base: "/",
})
```

### 5.6 `vitest.config.ts`

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
        // Limiar global razoável; sobe junto com a base de testes
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
        // CA-03: 100% nas regras de negócio de M2 e M5
        "src/lib/filterProjects.ts": {
          lines: 100, functions: 100, branches: 100, statements: 100,
        },
        "src/lib/validation.ts": {
          lines: 100, functions: 100, branches: 100, statements: 100,
        },
      },
    },
  },
})
```

### 5.7 `src/setupTests.ts`

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

### 5.8 Tailwind v3 — `tailwind.config.js`

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
        // gerado/atualizado pelo `shadcn add`
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

### 5.9 `postcss.config.cjs`

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 5.10 `src/app.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* shadcn new-york + stone — preenchido pelo CLI `shadcn init` */
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
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}
```

### 5.11 shadcn `components.json`

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

Componentes iniciais a instalar:

```sh
pnpm dlx shadcn@latest init   # interativo — confirma os valores acima
pnpm dlx shadcn@latest add button card badge input textarea
```

### 5.12 ESLint flat config — `eslint.config.js`

```js
import js from "@eslint/js"
import tseslint from "typescript-eslint"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import jsxA11y from "eslint-plugin-jsx-a11y"
import prettier from "eslint-config-prettier"

export default tseslint.config(
  { ignores: ["dist", "build", ".react-router", "coverage", "node_modules", "playwright-report"] },
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
      // shadcn-generated; relaxar warnings opinativos aqui
      "react/prop-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  prettier,
)
```

### 5.13 Prettier — `.prettierrc.json`

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

### 5.14 Husky `pre-commit` — `.husky/pre-commit`

```sh
pnpm exec lint-staged
pnpm run typecheck
pnpm run test:run
```

> Falha qualquer etapa → commit abortado. Re-staging exigido após `lint-staged` modificar arquivos (mensagem do husky orienta).

### 5.15 EmailJS — `.env.example`

```
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

> As três variáveis `VITE_*` são embarcadas no bundle client. Per modelo do EmailJS, `PUBLIC_KEY` é público por design (restrição de origem é feita no painel EmailJS). Em CI/CD, fornecer via `secrets.VITE_EMAILJS_*` no GH Actions.

### 5.16 Playwright — `playwright.config.ts`

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
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "pnpm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
```

Smoke specs (um por rota): cada `*.spec.ts` em `e2e/` deve abrir a rota e validar 1 elemento âncora visível. Lista:

| Arquivo | Rota | Asserção mínima |
|---|---|---|
| `home.spec.ts` | `/` | título Hero com "Marco" visível |
| `projects-list.spec.ts` | `/projects` | filtro de tecnologia visível |
| `project-detail.spec.ts` | `/projects/:id` (id seed válido) | título do projeto visível |
| `contact.spec.ts` | `/#contact` | input "email" presente |

---

## 6. Tipos do domínio — `src/types/domain.ts`

(Espelho fiel do §4 do `spec.md`.)

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
  startDate: string  // ISO 8601 (YYYY-MM-DD)
  endDate?: string   // ISO 8601 — ausente => em andamento
}

export type SkillCategory = "frontend" | "tools" | "backend" | "practices" | "pedagogical"

export type Skill = {
  name: string
  category: SkillCategory
}

export type Experience = {
  company: string
  role: string
  startDate: string
  endDate?: string  // ausente = Presente
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

---

## 7. Validação runtime — `src/lib/validation.ts`

Zod schemas garantem que JSON em `src/data/` está conforme (CT-M2-05).

```ts
import { z } from "zod"

export const projectCategorySchema = z.enum(["trabalho", "freelance", "open-source", "ensino"])
export const projectStatusSchema = z.enum(["concluido", "em-andamento"])

export const projectSchema = z.object({
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
}).refine(
  (p) => !(p.confidential && p.repositoryUrl),
  { message: "RN-M2-02: projeto confidencial não pode ter repositoryUrl", path: ["repositoryUrl"] },
)

export const projectListSchema = z.array(projectSchema)

export const skillCategorySchema = z.enum(["frontend", "tools", "backend", "practices", "pedagogical"])
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

Testes mínimos (em `src/lib/validation.test.ts`) — derivados de CT-M2-05, CT-M5-01..03:

- Projeto sem `title` → `parse` lança.
- Projeto `confidential: true` com `repositoryUrl` → `parse` lança (refine).
- `ContactForm` com email `marco@` → falha (CT-M5-01).
- Mensagem com 9 chars → falha (CT-M5-02).
- Mensagem com 1001 chars → falha (CT-M5-03).
- Nome com 1 char → falha (RN-M5-03).
- Assunto com 2 chars → falha (RN-M5-04).

---

## 8. Primeira lógica de domínio — `filterProjects()`

### 8.1 Assinatura

```ts
// src/lib/filterProjects.ts
import type { Project, ProjectCategory } from "@/types/domain"

export type ProjectFilter = {
  technologies?: readonly string[]
  categories?: readonly ProjectCategory[]
}

export function filterProjects(
  projects: readonly Project[],
  filter?: ProjectFilter,
): Project[]
```

### 8.2 Regras (derivadas do spec §3.M2)

- **RN-M2-03 (OR dentro, AND entre):**
  - `technologies` informado → projeto inclui se `project.technologies` contém **pelo menos uma** das técnicas filtradas (OR).
  - `categories` informado → projeto inclui se `project.category` está **em** `categories` filtradas (OR).
  - Ambos informados → projeto deve satisfazer **as duas** dimensões (AND).
  - Filtro vazio/`undefined` em uma dimensão → essa dimensão não restringe.
- **Match de tecnologia:** exato, case-sensitive (vocabulário controlado pelos dados seed).
- **RN-M2-05 (ordenação):**
  1. `featured: true` primeiro.
  2. Dentro de cada grupo, ordenar por data decrescente. Usa `endDate ?? startDate` como chave (projeto em andamento mantém o `startDate`; documentado).
  3. Empate → estabilidade da ordem original.
- **RN-M2-04 (estado vazio):** função retorna `[]` quando nenhum projeto casa — UI trata o estado vazio.
- Função é **pura** e não muta `projects`.

### 8.3 Casos de teste — `src/lib/filterProjects.test.ts`

Cobrem CT-M2-01, CT-M2-03, CT-M2-04 e regras adicionais:

| # | Cenário | Expectativa |
|---|---------|-------------|
| T01 | Sem filtro, lista vazia | retorna `[]` |
| T02 | Sem filtro, lista com 3 projetos | retorna 3, ordem featured-first + data desc |
| T03 | Filtro `{ technologies: [] }` | trata como sem filtro (todas) |
| T04 | Filtro `{ technologies: ["React"] }`, projeto tem `["React","TS"]` | inclui |
| T05 | Filtro `{ technologies: ["Vue"] }`, nenhum projeto Vue | retorna `[]` (CT-M2-03) |
| T06 | Filtro `{ technologies: ["React","TS"] }` (OR), projeto só com TS | inclui (OR within) |
| T07 | Filtro `{ categories: ["freelance"] }`, projeto categoria `trabalho` | exclui |
| T08 | Filtro `{ technologies:["React"], categories:["freelance"] }` (CT-M2-01) | inclui só se ambos casam |
| T09 | `featured` no meio do array | aparece **antes** dos não-featured no resultado (CT-M2-04) |
| T10 | Dois featured, datas diferentes | data mais recente primeiro |
| T11 | Projeto sem `endDate` (em andamento) | ordenado pelo `startDate` |
| T12 | Função não muta input | `Object.isFrozen(projects)` ou cópia profunda comparada |
| T13 | Match de tecnologia é case-sensitive | `"react"` no filtro não casa com `"React"` no projeto |

### 8.4 Implementação de referência

> A implementação não faz parte do scaffolding; escrita **após** os testes (TDD). Esboço para validação mental:

```ts
export function filterProjects(
  projects: readonly Project[],
  filter: ProjectFilter = {},
): Project[] {
  const techs = filter.technologies ?? []
  const cats = filter.categories ?? []

  const filtered = projects.filter((p) => {
    const techOk = techs.length === 0 || techs.some((t) => p.technologies.includes(t))
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

---

## 9. Dados seed — `src/data/*.json`

Esqueletos válidos (validados pelos schemas Zod). Conteúdo real entra na fase de implementação dos módulos.

```json
// src/data/projects.json
[]
```

```json
// src/data/skills.json
[]
```

```json
// src/data/experiences.json
[]
```

---

## 10. Workflows GH Actions

### 10.1 `.github/workflows/ci.yml`

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

### 10.2 `.github/workflows/deploy.yml`

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

### 10.3 `public/404.html`

Arquivo idêntico a `index.html` (gerado pelo build) — copiado no workflow. Necessário porque GH Pages serve `404.html` em rotas não-encontradas, e o SPA reidrata e roteia client-side. Sem isso, refresh em `/projects/:id` → 404 real.

---

## 11. Ordem de execução (passo a passo)

1. **Inicializar repo & Node**
   - `corepack enable && corepack prepare pnpm@latest --activate`
   - Criar `.nvmrc` (`22`), `.npmrc` (`engine-strict=true`)
2. **Bootstrap RR7 framework + Vite + TS**
   - `pnpm create react-router@latest .` (escolher template TS, SPA)
   - Mover `app/` → `src/`; ajustar `react-router.config.ts` (`appDirectory: "src"`, `ssr: false`)
3. **Adicionar deps de teste**
   - `pnpm add -D vitest @vitest/coverage-v8 jsdom @testing-library/{react,dom,user-event,jest-dom} vitest-axe axe-core vite-tsconfig-paths`
4. **Adicionar deps de lint/format**
   - `pnpm add -D eslint typescript-eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y eslint-config-prettier @eslint/js prettier prettier-plugin-tailwindcss`
5. **Adicionar Tailwind v3**
   - `pnpm add -D tailwindcss@^3 postcss autoprefixer tailwindcss-animate`
   - `pnpm dlx tailwindcss init -p` → ajustar para configs §5.8/§5.9
6. **Inicializar shadcn**
   - `pnpm dlx shadcn@latest init` → responder conforme §5.11
   - `pnpm dlx shadcn@latest add button card badge input textarea`
7. **Adicionar Zod + EmailJS**
   - `pnpm add zod @emailjs/browser`
8. **Adicionar Playwright**
   - `pnpm add -D @playwright/test`
   - `pnpm run e2e:install`
9. **Husky + lint-staged**
   - `pnpm add -D husky lint-staged`
   - `pnpm exec husky init` → editar `.husky/pre-commit` conforme §5.14
10. **Criar `src/types/domain.ts`** (§6)
11. **TDD #1 — `filterProjects`**
    - Escrever `src/lib/filterProjects.test.ts` com os 13 casos (§8.3)
    - Rodar `pnpm test` → vermelho
    - Implementar `src/lib/filterProjects.ts` (§8.4) → verde
12. **TDD #2 — schemas Zod** (§7)
    - Testes em `validation.test.ts` → vermelho → implementar → verde
13. **Configurar rotas RR7**
    - `src/routes.ts` (explícito) + arquivos `src/routes/*.tsx` esqueletos
    - `src/root.tsx` importando `app.css`
14. **Smoke E2E**
    - Criar 4 specs em `e2e/`; ajustar asserções mínimas
15. **CI + Deploy workflows** (§10)
16. **Commit inicial**
    - `git add -A && git commit -m "chore: scaffolding"`

---

## 12. Critérios de aceite do scaffolding

- SC-01: `pnpm install` finaliza sem erros em Node 22.
- SC-02: `pnpm run typecheck` passa.
- SC-03: `pnpm run lint` passa com `--max-warnings=0`.
- SC-04: `pnpm run test:run` passa, com `filterProjects` e `validation` em **100%** de cobertura.
- SC-05: `pnpm run build` gera `build/client/` sem erros.
- SC-06: `pnpm run e2e` passa os 4 smoke tests.
- SC-07: Pre-commit hook bloqueia commit com `console.log` no diff (`@typescript-eslint/no-console` opcional — ou via teste manual de typecheck/test).
- SC-08: CI verde em push para `main` (job único).
- SC-09: Deploy job publica `build/client/` no GH Pages com `404.html` presente.

---

## 13. Notas de manutenção

- **shadcn updates:** `pnpm dlx shadcn@latest add <component>` regenera. Não editar à mão arquivos em `src/components/ui/`; criar wrapper em `src/components/` se precisar customizar.
- **Tailwind v3 obrigatório:** v4 muda o engine (lightning-css) e quebra o pipeline shadcn-stone aqui descrito. Não atualizar para v4 antes de uma ADR dedicada.
- **RR7 SPA:** `ssr: false` é necessário para GH Pages. Reverter para `true` exigirá host com Node (Cloudflare Pages Functions, Vercel, etc.).
- **Cobertura 100% em `src/lib/*`:** se uma branch é genuinamente inalcançável, anotar com `/* v8 ignore next */` + comentário explicando.

---

## 14. Histórico de decisões

| ID | Decisão | Resolução |
|----|---------|-----------|
| SD-01 | Gerenciador de pacotes | pnpm |
| SD-02 | RR7 mode | Framework, SPA (`ssr: false`) |
| SD-03 | UX do detalhe de projeto | Rota dedicada `/projects/:id` |
| SD-04 | Toolchain de lint/format | ESLint flat + Prettier |
| SD-05 | Target GH Pages | User page (`marcohansen.github.io`), basename `/` |
| SD-06 | Tema shadcn | `new-york` + `stone` |
| SD-07 | TS flags extras | 4 ativadas (ver §5.2) |
| SD-08 | Pre-commit | lint+format+typecheck+tests |
| SD-09 | Estrutura de rotas | `/` (landing) + `/projects` + `/projects/:id` |
| SD-10 | Node CI | 22 LTS, job único |
| SD-11 | Extras de teste | vitest-axe + coverage-v8 + Playwright |
| SD-12 | Deploy | Auto em `main` via workflow separado |
| SD-13 | EmailJS | Env vars + `.env.example`; Public Key embarcada |
| SD-14 | Playwright v1 | Smoke por rota (4 specs) |
| SD-15 | Validação runtime | Zod em `src/lib/validation.ts` |
| SD-16 | Idioma da UI | PT-BR (i18n é v2) |
