# Scaffolding State — Portfolio Marco Hansen

**Versão:** 0.1.0
**Status:** Scaffolding concluído — pronto para módulos M1..M5
**Branch base:** `main` (HEAD em `01a46d3`)
**Documentos relacionados:** `docs/spec.md`, `docs/scaffolding-specification.md`, `docs/scaffolding-blueprint.md`, `AGENTS.md`

> Esta é uma **fotografia** do que efetivamente existe no repositório após a execução do `scaffolding-blueprint.md`. O blueprint descreve a intenção; este documento descreve o resultado. Toda divergência entre os dois está catalogada na §6.

---

## 1. Resumo executivo

- 30 commits em 11 branches lógicas mergeadas em `main` via fast-forward.
- Toolchain pronta: React 19, RR7 framework SPA, TS strict, Vite 6, Tailwind v3, shadcn (5 primitivos), Vitest, Playwright, ESLint flat, Prettier, Husky.
- Lógica de domínio coberta a 100%: `src/lib/validation.ts` e `src/lib/filterProjects.ts`.
- 26 testes unitários verdes (12 validation + 14 filterProjects, sendo 14 um extra para fechar a última branch do `??` no sort).
- 4 specs Playwright smoke verdes localmente.
- CI/Deploy yml versionados; ainda **não exercitados** (necessitam push + `Settings → Pages`).
- Pre-commit hook ativo: `lint-staged → typecheck → test:run`.

---

## 2. Stack resolvida

### 2.1 Runtime + framework

| Pacote | Range declarado | Resolvido |
|--------|-----------------|-----------|
| react | `^19` | 19.2.6 |
| react-dom | `^19` | 19.2.6 |
| react-router | `^7` | 7.15.0 |
| @react-router/dev | `^7` | 7.15.0 |
| @react-router/node | `^7` | 7.15.0 |
| isbot | `^5` | 5.x (auto-puxado pelo typegen do RR7) |

### 2.2 Build / linguagem

| Pacote | Range | Resolvido |
|--------|-------|-----------|
| typescript | `^5.6` | 5.9.3 |
| vite | `^6` | 6.4.2 |
| vite-tsconfig-paths | `^6.1.1` | 6.1.1 |
| @types/node | `^25.7.0` | 25.7.0 |
| @types/react | `^19` | 19.2.14 |
| @types/react-dom | `^19` | 19.2.3 |

### 2.3 Estilo / UI

| Pacote | Range | Resolvido | Observação |
|--------|-------|-----------|------------|
| tailwindcss | `^3.4` | 3.4.19 | **v4 proibido** — spec §13 |
| postcss | `^8.4` | 8.5.14 | |
| autoprefixer | `^10.4` | 10.5.0 | |
| tailwindcss-animate | `^1.0.7` | 1.0.7 | |
| clsx | `^2.1.1` | 2.1.1 | |
| tailwind-merge | `^3.6.0` | 3.6.0 | |
| class-variance-authority | `^0.7.1` | 0.7.1 | |
| lucide-react | `^1.14.0` | 1.14.0 | versão pinada pelo resolver atual; revisar quando shadcn requerer outra |
| @radix-ui/react-slot | `^1.2.4` | 1.2.4 | trazido pelo `shadcn add button` |

### 2.4 Validação / formulário

| Pacote | Range | Resolvido |
|--------|-------|-----------|
| zod | `^3.23` | 3.25.76 |
| @emailjs/browser | `^4.4` | 4.4.1 |

### 2.5 Testes

| Pacote | Range | Resolvido |
|--------|-------|-----------|
| vitest | `^2.1` | 2.1.9 |
| @vitest/coverage-v8 | `^2.1.9` | 2.1.9 (alinhado ao vitest) |
| jsdom | `^29.1.1` | 29.1.1 |
| @testing-library/react | `^16.3.2` | 16.3.2 |
| @testing-library/dom | `^10.4.1` | 10.4.1 |
| @testing-library/user-event | `^14.6.1` | 14.6.1 |
| @testing-library/jest-dom | `^6.9.1` | 6.9.1 |
| vitest-axe | `^0.1.0` | 0.1.0 |
| axe-core | `^4.11.4` | 4.11.4 |
| @playwright/test | `^1.48` | 1.60.0 |

### 2.6 Lint / format / hooks

| Pacote | Range | Resolvido | Observação |
|--------|-------|-----------|------------|
| eslint | `^9.39.4` | 9.39.4 | v10 incompatível com peers atuais |
| @eslint/js | `^9.39.4` | 9.39.4 | alinhado ao eslint v9 |
| typescript-eslint | `^8.59.3` | 8.59.3 | |
| eslint-plugin-react | `^7.37.5` | 7.37.5 | |
| eslint-plugin-react-hooks | `^7.1.1` | 7.1.1 | |
| eslint-plugin-jsx-a11y | `^6.10.2` | 6.10.2 | |
| eslint-config-prettier | `^10.1.8` | 10.1.8 | |
| prettier | `^3.8.3` | 3.8.3 | |
| prettier-plugin-tailwindcss | `^0.8.0` | 0.8.0 | |
| husky | `^9.1.7` | 9.1.7 | |
| lint-staged | `^15` | 15.5.2 | pinado em v15 (v17 exige Node ≥ 22.22.1) |

### 2.7 Ambiente

- Node: `>=22.0.0` (testado em 22.16.0).
- pnpm: `>=9.0.0` (testado em 10.24.0; lockfile compatível).
- `.nvmrc` = `22`; `.npmrc` com `engine-strict=true` e `auto-install-peers=true`.

---

## 3. Estrutura final

```
portfolio/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── .husky/
│   ├── pre-commit                 # lint-staged → typecheck → test:run
│   └── _/                         # gerado pelo husky init
├── docs/                          # ignorado pelo prettier
│   ├── spec.md
│   ├── scaffolding-specification.md
│   ├── scaffolding-blueprint.md
│   └── scaffolding-state.md       # este arquivo
├── e2e/
│   ├── contact.spec.ts
│   ├── home.spec.ts
│   ├── project-detail.spec.ts
│   └── projects-list.spec.ts
├── public/
│   ├── 404.html                   # placeholder; deploy sobrescreve com index.html
│   ├── favicon.svg                # MH monogram
│   └── cv/.gitkeep
├── src/
│   ├── app.css                    # tailwind base/components/utilities + CSS vars new-york/stone
│   ├── components/
│   │   └── ui/
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── textarea.tsx
│   ├── data/
│   │   ├── experiences.json       # []
│   │   ├── projects.json          # []
│   │   └── skills.json            # []
│   ├── lib/
│   │   ├── cn.ts                  # clsx + twMerge
│   │   ├── filterProjects.ts      # 100% cobertura
│   │   ├── filterProjects.test.ts # 14 testes
│   │   ├── validation.ts          # 100% cobertura
│   │   └── validation.test.ts     # 12 testes
│   ├── routes/
│   │   ├── _index.tsx             # /
│   │   ├── projects._index.tsx    # /projects
│   │   └── projects.$id.tsx       # /projects/:id
│   ├── types/
│   │   └── domain.ts
│   ├── root.tsx
│   ├── routes.ts
│   └── setupTests.ts
├── .editorconfig
├── .env.example
├── .gitignore
├── .npmrc
├── .nvmrc
├── .prettierignore                # node_modules, build/coverage, docs, AGENTS.md, ui/
├── .prettierrc.json
├── AGENTS.md                      # ignorado pelo prettier
├── README.md
├── components.json                # shadcn (alias @/lib/cn como utils)
├── eslint.config.js
├── index.html
├── package.json                   # contém bloco lint-staged
├── playwright.config.ts
├── pnpm-lock.yaml
├── postcss.config.cjs
├── react-router.config.ts         # ssr: false, prerender ["/","/projects"]
├── tailwind.config.js             # ESM, plugin via import
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```

`build/`, `coverage/`, `playwright-report/`, `.react-router/` e `node_modules/` são artefatos — não versionados.

---

## 4. Mapa de branches e commits realizados

Todos mergeados em `main` via `--ff-only` e branch local apagada após merge.

| Branch | Commits | SHA início → fim |
|--------|---------|-------------------|
| `chore/setup-tooling` | 7 | `0517c58` → `f06d9aa` |
| `chore/domain-types` | 3 (1 fix tsconfig + 1 fix eslint/tailwind + 1 spec) | `fba2380` → `9fca256` |
| `chore/tdd-validation` | 3 (RED + fix unused-vars + GREEN) | `e6b1c89` → `f5f393a` |
| `chore/tdd-filter-projects` | 2 (RED + GREEN com T14 extra) | `b8e496f` → `2ec965f` |
| `chore/seed-data` | 1 | `3d3acd9` |
| `chore/shadcn-setup` | 2 | `c696e78` → `9400323` |
| `chore/routing-skeleton` | 4 (root+routes, stubs, isbot autodep, index.html) | `b8a3c4f` → `584ea34` |
| `chore/e2e-smoke-tests` | 1 | `f4a45fa` |
| `chore/git-hooks` | 1 | `8b8388f` |
| `chore/public-assets` | 1 | `1f917f9` |
| `ci/workflows-and-readme` | 5 (ci, deploy, prettier sweep, coverage exclude, README) | `edf936c` → `01a46d3` |

Total: **30 commits** após o último commit pré-scaffolding (`2ec86e9 docs: add incremental scaffolding blueprint`).

---

## 5. Gates Phase 22 — estado local

| ID | Verificação | Comando | Resultado |
|----|-------------|---------|-----------|
| SC-01 | install determinístico | `pnpm install --frozen-lockfile` | ✅ exit 0 |
| SC-02 | typecheck | `pnpm run typecheck` | ✅ exit 0 |
| SC-03 | lint zero warnings | `pnpm run lint` | ✅ exit 0 |
| SC-04 | cobertura | `pnpm run test:coverage` | ✅ 100% em `filterProjects.ts` + `validation.ts`; global 100% |
| SC-05 | build | `pnpm run build` | ✅ `build/client/index.html` gerado |
| SC-06 | e2e smoke | `pnpm run e2e` | ✅ 4 passed |
| SC-07 | pre-commit bloqueia erro | manual | ✅ verificado |
| SC-08 | CI verde em push | GH Actions | ⏳ aguarda push para `main` |
| SC-09 | deploy publica com 404.html | GH Pages | ⏳ aguarda `Settings → Pages → GitHub Actions` |

> Formatação: `pnpm run format:check` também passa após o sweep do prettier feito no commit `4eaccdf`.

---

## 6. Desvios do blueprint original

Cada item abaixo deviou da letra do `scaffolding-blueprint.md` por necessidade técnica. Justificativa no body do respectivo commit.

| # | Desvio | Motivo | Commit |
|---|--------|--------|--------|
| D1 | `tsconfig.json` removeu `*.config.ts`/`*.config.js` do `include` | Colidia com `references` composite, gerando TS6305 em todo config | `fba2380` |
| D2 | `eslint.config.js`: bloco `disableTypeChecked` para `.js/.cjs/.mjs` | Regras com type info quebravam em arquivos JS | `0167349` |
| D3 | `eslint.config.js`: globals manuais para `.cjs` | `postcss.config.cjs` quebrava no `no-undef` (module/require) | `0167349` |
| D4 | `eslint.config.js`: `consistent-type-definitions: off` | Spec usa `type =` em todo lugar; rule pedia `interface` | `0167349` |
| D5 | `eslint.config.js`: `parserOptions.project` lista os dois tsconfigs | Configs `*.config.ts` ficavam fora do parser sem isso | `0167349` |
| D6 | `tailwind.config.js`: ESM com `import` em vez de `require()` | `type: "module"` no `package.json` rejeita `require` | `0167349` |
| D7 | `eslint.config.js`: `varsIgnorePattern: "^_"` adicional | Destructure `_title` em teste falhava com só `argsIgnorePattern` | `e2b6abe` |
| D8 | `lint-staged@^15` (em vez de latest) | v17.0.4 exige Node ≥ 22.22.1; ambiente em 22.16 | `fcdaf52` (decisão inicial) |
| D9 | `eslint@^9` (em vez de v10 latest) | Peers `eslint-plugin-react` e `jsx-a11y` topam só até v9 | `fcdaf52` |
| D10 | Dep `isbot` adicionada | `react-router typegen` injeta para compilar entry templates | `c6f084e` |
| D11 | Teste extra `T14` em `filterProjects.test.ts` | Fechar branch `b.endDate ?? b.startDate` (lado direito), do contrário coverage cai a 93% | `2ec965f` |
| D12 | `vitest.config.ts`: exclude inclui `src/routes.ts` e `src/lib/cn.ts` | Sem isso, global functions coverage fica em 50% | `17b36c2` |
| D13 | `.prettierignore`: `docs/` e `AGENTS.md` | Sweep do prettier reformataria prosa autoral | `4eaccdf` |

Nenhum desvio compromete os critérios de aceite globais. A spec original (`docs/spec.md`) continua sendo a fonte de verdade do **comportamento**; este documento substitui o blueprint para refletir o **estado**.

---

## 7. Cobertura detalhada

```
File               | % Stmts | % Branch | % Funcs | % Lines
-------------------|---------|----------|---------|---------
All files          |   100   |   100    |   100   |   100
 filterProjects.ts |   100   |   100    |   100   |   100
 validation.ts     |   100   |   100    |   100   |   100
```

Excluídos (por design): `src/routes/**`, `src/routes.ts`, `src/root.tsx`, `src/components/ui/**`, `src/types/**`, `src/setupTests.ts`, `src/lib/cn.ts`, `**/*.{test,spec}.{ts,tsx}`.

---

## 8. Próximos passos (módulos M1..M5)

Espelho de `docs/spec.md §3`:

| Módulo | Escopo | Pré-requisitos atendidos pelo scaffolding |
|--------|--------|--------------------------------------------|
| M1 Hero + CV | `/` hero, CTA download CV | `src/routes/_index.tsx` stub; `public/cv/` pronto |
| M2 Projetos | `/projects`, `/projects/:id`, filtros | `filterProjects` + `projectSchema` ambos 100%; stubs de rota; `src/data/projects.json` |
| M3 Skills | seção em `/` | `skillSchema`; `src/data/skills.json` |
| M4 Timeline | seção em `/` | `experienceSchema`; `src/data/experiences.json` |
| M5 Contato | `#contact` na home | `contactFormSchema` + EmailJS dep + `.env.example` |

Ordem sugerida de implementação: **M1 → M3 → M4 → M2 → M5** (alinhada à reordenação registrada em `1c6165e`).

Cada módulo segue o ciclo TDD do `AGENTS.md §3`:

1. Aceitar critério do `spec.md`.
2. Escrever teste vermelho.
3. Implementar até verde.
4. Refatorar mantendo verde.
5. Commit Conventional (`feat:` / `test:` / `refactor:`).

---

## 9. Convenções herdadas (referência rápida)

Resumo do `AGENTS.md` que afeta todo trabalho subsequente:

- **Idioma:** mensagens de commit, código e identificadores em inglês; UI e docs em PT-BR.
- **Tipagem:** sem `any`; preferir `unknown` + narrowing; tipos em `src/types/`.
- **Estilo:** Conventional Commits, atomicidade por commit, sem `--no-verify`.
- **shadcn:** nunca editar `src/components/ui/**` à mão — regenerar com a CLI e criar wrappers em `src/components/` para customização.
- **Acessibilidade:** specs Playwright + `vitest-axe` em componentes interativos; metas WCAG AA.
- **Cobertura:** 100% obrigatório em `src/lib/filterProjects.ts` e `src/lib/validation.ts`; global ≥ 70%.

---

## 10. Histórico

| Versão | Data | Mudança |
|--------|------|---------|
| 0.1.0 | 2026-05-13 | Documento inicial cobrindo o estado pós-scaffolding (HEAD `01a46d3`). |
