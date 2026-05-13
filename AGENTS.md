# AGENTS.md — Project Rules for AI Assistants

This file is the durable source of truth for AI agents collaborating on this repository. Keep it tight; long-form decisions live in `docs/spec.md` and `docs/scaffolding-specification.md`.

## 1. Project at a glance

- **What:** Personal portfolio for Marco Hansen — frontend developer + tech instructor.
- **Audiences:** Recruiters (≤2 min), freelance clients, tech students.
- **Method:** Spec-first, **TDD**, UI as consequence.
- Full spec: `docs/spec.md`. Scaffolding recipe: `docs/scaffolding-specification.md`.

## 2. Stack (locked)

- React 19 + TypeScript strict (+ 4 extra flags: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch`).
- React Router v7 **framework mode**, SPA (`ssr: false`), `appDirectory: "src"`.
- Tailwind CSS **v3** (NOT v4) + shadcn/ui (style `new-york`, base color `stone`).
- Vitest + React Testing Library + vitest-axe + @vitest/coverage-v8.
- Playwright for e2e (one smoke test per route).
- ESLint (flat config) + Prettier.
- Zod for runtime data validation.
- EmailJS for the contact form (no backend).
- pnpm @9+, Node 22 LTS.
- Hosting: GitHub Pages (user page `marcohansen.github.io`, basename `/`).

## 3. Commands

```sh
pnpm install
pnpm dev              # local dev server (RR7)
pnpm test             # vitest watch
pnpm test:run         # vitest single-run
pnpm test:coverage    # coverage + thresholds
pnpm lint             # eslint, --max-warnings=0
pnpm lint:fix
pnpm format           # prettier write
pnpm typecheck        # react-router typegen + tsc --noEmit
pnpm build            # production build -> build/client
pnpm e2e              # playwright (boots dev server)
pnpm e2e:install      # one-time browser install
```

Pre-commit hook (`.husky/pre-commit`) runs: `lint-staged` → `typecheck` → `test:run`. Keep unit tests fast. Never bypass with `--no-verify`.

## 4. Folder conventions

| Path | Purpose | Rule |
|------|---------|------|
| `src/components/ui/**` | shadcn primitives | **Generated** — never edit by hand. Re-run `pnpm dlx shadcn@latest add <name>` to update. Wrap in `src/components/` if customisation needed. |
| `src/components/**` | App components | Compose shadcn primitives. PascalCase files. |
| `src/lib/**` | Pure domain logic (no React) | 100% test coverage required (CA-03). |
| `src/data/**` | Static JSON | Validate at load time via Zod (`src/lib/validation.ts`). |
| `src/types/**` | Domain TS types | Single source of truth for `Project`, `Skill`, `Experience`, `ContactForm`. |
| `src/routes/**` | RR7 route files | One file = one route. Keep route files thin; offload to components. |
| `src/root.tsx` | Root layout | Imports global `app.css`. |
| `e2e/**` | Playwright specs | One smoke test per route. |
| `docs/**` | Process artifacts (PT-BR allowed) | Specs, ADRs, decisions. Not bundled. |

## 5. Coding rules

- **Language of code:** English — identifiers, comments, commit messages, branch names. (Spec §8.)
- **Language of UI text:** Portuguese (PT-BR). i18n is v2.
- **Language of `docs/**`:** PT-BR allowed (process artifacts).
- **Imports:** path alias `@/*` → `src/*`. Use `import type` for type-only imports (`@typescript-eslint/consistent-type-imports` is `error`).
- **Comments:** default to none. Only when WHY is non-obvious (constraint, invariant, workaround). Never narrate WHAT the code does — the names already do that.
- **No dead abstractions:** don't write a helper for one caller; don't introduce a feature flag for hypothetical futures.
- **No premature error handling:** trust internal contracts; validate only at boundaries (JSON load via Zod, form input via Zod).
- **Pure domain logic:** functions in `src/lib/` must be pure and unit-testable without DOM.
- **Strict TS:** any `as` cast in a PR needs a one-line justification in the PR description.
- **shadcn integrity:** treat `src/components/ui/*` as vendor code. PRs that modify those files by hand will be rejected.

## 6. Testing rules

- **TDD on domain logic:** write `*.test.ts` first for everything in `src/lib/`. Red → Green → Refactor.
- **Coverage gates (enforced in CI):**
  - Global lines/branches/functions/statements ≥ **70%**.
  - `src/lib/filterProjects.ts` and `src/lib/validation.ts` = **100%**.
- **RTL conventions:**
  - Query by role/accessible name first (`getByRole`, `getByLabelText`); fall back to text/test-id only when justified.
  - Use `userEvent` (not `fireEvent`) for interactions.
  - One assertion focus per test; multiple `expect` are fine if they validate the same scenario.
- **Accessibility:** every interactive component spec must include `expect(await axe(container)).toHaveNoViolations()` (CA-04).
- **Playwright:** one smoke test per route (`/`, `/projects`, `/projects/:id`, `/#contact`). Asserts the route renders and one anchor element is visible. Heavy flows tested in unit/component level.

## 7. Git & commits

- **Conventional Commits** in English: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `build:`, `ci:`.
- **Subject ≤ 72 chars.** Body explains WHY when not obvious.
- **One logical change per commit.** Don't bundle scaffolding tweaks with feature work.
- **Never** `git commit --no-verify`. If the hook fails, fix the underlying issue.
- **Never** force-push to `main`. Pushes to `main` trigger `deploy.yml` (publishes to GH Pages).

## 8. Branch & PR workflow

- Branch from `main` per feature/module. Naming: `feat/m2-projects`, `fix/contact-validation`.
- Open PR to `main` → CI must pass (lint + typecheck + test + build + e2e).
- After merge, deploy workflow publishes to `marcohansen.github.io` automatically.

## 9. Data model

Locked in `src/types/domain.ts` (mirrors `docs/spec.md` §4). Changes to types require a matching update in:

1. `src/types/domain.ts`
2. `src/lib/validation.ts` (Zod schema)
3. `src/lib/validation.test.ts` (test for the new constraint)
4. `src/data/*.json` (if shape changes)
5. `docs/spec.md` §4 (canonical reference)

Validate JSON imports at app boot via Zod. Throw early if data is malformed — better than a runtime UI crash later.

## 10. Routing

- File-based + explicit `src/routes.ts` table.
- `/` is a single-page landing with anchored sections (Hero, Featured Projects, Skills, Experience, Contact).
- `/projects` is the full filterable list.
- `/projects/:id` is the per-project detail page.
- Contact is an anchor (`/#contact`) on `/`, not its own route. The contact form posts via EmailJS.

## 11. Environment variables

Only `VITE_*`-prefixed vars reach the client bundle (Vite convention). Defined:

```
VITE_EMAILJS_SERVICE_ID
VITE_EMAILJS_TEMPLATE_ID
VITE_EMAILJS_PUBLIC_KEY
```

All three end up in the client bundle — that is intentional per EmailJS architecture. `PUBLIC_KEY` is protected by origin allowlist in the EmailJS dashboard, not by secrecy. **No other secrets are allowed in the codebase.** No backend keys, no analytics tokens; this is a static SPA.

Local: copy `.env.example` → `.env`. CI: defined as `secrets.VITE_EMAILJS_*` in GitHub.

## 12. Don'ts (sharp edges)

- Don't upgrade Tailwind to v4 — breaks shadcn-stone setup.
- Don't switch RR7 to `ssr: true` — GH Pages is static; needs an ADR first.
- Don't edit `src/components/ui/*` by hand.
- Don't add a backend service (auth, analytics, comments) — explicitly out of scope (`docs/spec.md` §5).
- Don't introduce a new state-management lib (Redux, Zustand, …) for v1 — React state + URL is enough.
- Don't add CSS files outside `src/app.css` and shadcn-generated styles. Tailwind only.
- Don't downgrade test coverage thresholds to make CI pass — fix the test gap instead.
- Don't merge a PR that hasn't run e2e locally at least once.

## 13. When in doubt

1. Re-read the relevant section of `docs/spec.md` first.
2. If it concerns scaffolding/configs, `docs/scaffolding-specification.md`.
3. If neither answers it, open an ADR draft in `docs/features/` before coding.
