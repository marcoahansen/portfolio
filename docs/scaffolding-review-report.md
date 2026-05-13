# Scaffolding Review Report — Portfolio Marco Hansen

**Date:** 2026-05-13
**Reviewer:** Claude (Opus 4.7) under `/plan` mode
**HEAD reviewed:** `01a46d3` (`docs: add scaffolding state snapshot`)
**Spec reference:** `docs/scaffolding-specification.md` v0.1.0
**State reference:** `docs/scaffolding-state.md` v0.1.0

---

## Verdict

**PASS WITH NOTES — scaffolding cleared for module implementation (M1..M5).**

Every spec section (§1..§14) was audited against the live repository. All 13 deviations catalogued in `scaffolding-state.md` §6 (D1..D13) were re-verified and remain valid. Gates SC-01..SC-07 were reproduced locally and all passed; SC-08/SC-09 are remote-only and stay pending until the first push to `main`. One undocumented divergence (Minor) was found, surfaced, and fixed during this audit: `package.json` was missing the `start` script listed in spec §4. Apart from that, the repo matches the spec exactly within the scope laid out by AGENTS.md.

---

## Gates SC-01..SC-09

| Gate | Status | Evidence |
|------|--------|----------|
| SC-01 `pnpm install --frozen-lockfile` | ✅ PASS | "Lockfile is up to date, resolution step is skipped"; exit 0. |
| SC-02 `pnpm run typecheck` | ✅ PASS | `react-router typegen && tsc --noEmit` exit 0, no output. |
| SC-03 `pnpm run lint` (`--max-warnings=0`) | ✅ PASS | `eslint .` exit 0, no output. |
| SC-04 `pnpm run test:coverage` | ✅ PASS | 26 tests / 2 files pass. Coverage: `filterProjects.ts` 100% (stmts/branch/funcs/lines); `validation.ts` 100% (idem). Global thresholds (≥70%) satisfied. |
| SC-05 `pnpm run build` | ✅ PASS | Vite 6.4.2 build OK; `build/client/index.html` generated; prerender of `/` → `build/client/index.html` and `/projects` → `build/client/projects/index.html` confirmed; server build cleaned (`ssr:false`). |
| SC-06 `pnpm run e2e` | ✅ PASS | 4 specs pass on chromium: `home.spec.ts`, `contact.spec.ts`, `projects-list.spec.ts`, `project-detail.spec.ts`. |
| SC-07 pre-commit gate | ✅ PASS (content) | `.husky/pre-commit` matches spec §5.14 verbatim: `lint-staged → typecheck → test:run`. Underlying gates (SC-02..SC-04) all green, so the hook will actually block on real failures. |
| SC-08 CI green on push to `main` | ⏳ PENDING (remote) | `.github/workflows/ci.yml` structurally correct (Node 22 + pnpm 9; lint → typecheck → coverage → build → e2e:install → e2e; failure artifact upload). Not yet exercised on GitHub. |
| SC-09 Pages deploy with `404.html` | ⏳ PENDING (remote) | `.github/workflows/deploy.yml` structurally correct; `cp build/client/index.html build/client/404.html` step present; secrets injection of `VITE_EMAILJS_*` present; concurrency group set. Requires GitHub repo settings → Pages → "GitHub Actions". |

---

## JUSTIFIED deviations (confirmed from `scaffolding-state.md` §6)

All 13 documented deviations re-verified against the live repo. Each row below states what was checked and where.

| ID | Deviation summary | Re-verification | OK? |
|----|-------------------|-----------------|-----|
| D1 | `tsconfig.json` removed `*.config.ts`/`*.config.js` from `include` | `tsconfig.json` line 27 — `"include": ["src", "e2e"]` only | ✅ |
| D2 | `eslint.config.js` disables type-checked rules on `.js/.cjs/.mjs` | `eslint.config.js` lines 48-51 — `tseslint.configs.disableTypeChecked` for `**/*.{js,cjs,mjs}` | ✅ |
| D3 | `eslint.config.js` manual `.cjs` globals | `eslint.config.js` lines 52-65 — `module`, `require`, `__dirname`, `__filename`, `process`, `exports` declared | ✅ |
| D4 | `consistent-type-definitions: off` | `eslint.config.js` line 34 — rule explicitly off | ✅ |
| D5 | `parserOptions.project` lists both tsconfigs | `eslint.config.js` line 20 — `["./tsconfig.json", "./tsconfig.node.json"]` | ✅ |
| D6 | `tailwind.config.js` ESM `import` for plugin | `tailwind.config.js` lines 1, 56 — `import tailwindcssAnimate from "tailwindcss-animate"`; `plugins: [tailwindcssAnimate]` | ✅ |
| D7 | `no-unused-vars` adds `varsIgnorePattern: "^_"` | `eslint.config.js` line 38 — both `argsIgnorePattern` and `varsIgnorePattern` set | ✅ |
| D8 | `lint-staged` pinned to `^15` | `package.json` line 71 — `"lint-staged": "^15"` | ✅ |
| D9 | `eslint` pinned to `^9` | `package.json` line 64 — `"eslint": "^9.39.4"` | ✅ |
| D10 | `isbot` added as dependency | `package.json` line 48 — `"isbot": "^5"` | ✅ |
| D11 | `filterProjects.test.ts` adds T14 for branch coverage | `filterProjects.test.ts` lines 115-130 — T14 present; live run reports 14 tests, 100% branch coverage | ✅ |
| D12 | `vitest.config.ts` excludes also include `src/routes.ts` + `src/lib/cn.ts` | `vitest.config.ts` lines 22, 26 — both paths excluded from coverage | ✅ |
| D13 | `.prettierignore` includes `docs/` and `AGENTS.md` | `.prettierignore` lines 9-10 — both ignored | ✅ |

No previously documented deviation has regressed or become inaccurate.

---

## ISSUEs

| # | Severity | Spec ref | Location | Description | Proposed fix | Status |
|---|----------|----------|----------|-------------|--------------|--------|
| ISSUE-01 | Minor | §4 (scripts table) | `package.json` | `"start": "react-router-serve ./build/server/index.js"` was missing. Spec §4 lists it (even though §5.6 notes it is unused in SPA flow). State-doc §6 did not catalogue the omission. | Insert the script verbatim between `build` and `preview` in `package.json` `scripts` block. | **fixed** in audit (user-approved). |

No Major or Blocker ISSUEs were found.

---

## Additional observations

These are notes worth keeping but **not** classified as ISSUEs:

1. **`vite.config.ts` not listed in spec §3 tree.** Spec §3 enumerates `vitest.config.ts` only; spec §5.5 dictates the content of `vite.config.ts` (which exists in repo and is needed for builds). This is a **spec internal inconsistency** — the repo is correct. Suggestion: a future patch of `scaffolding-specification.md` adds the file to the §3 tree.
2. **Validation error message language.** Spec §7 phrases the `refine` error in PT-BR ("projeto confidencial não pode ter repositoryUrl"); `src/lib/validation.ts:27` uses English ("confidential project cannot have repositoryUrl"). AGENTS.md §5 mandates English for code identifiers/comments — the English form is the correct outcome. Spec doc drift, not a code issue.
3. **`react-router.config.ts` lacks the inline comment from spec §5.4.** AGENTS.md §5 ("default to none for comments") supersedes; omitting the comment is consistent with house style.
4. **`build/client/__spa-fallback.html` emitted by RR7.** Not referenced in spec §10.3 (which expects manual `cp index.html → 404.html` in `deploy.yml`). Both paths coexist harmlessly: the deploy workflow overwrites `404.html` with the SPA shell, and `__spa-fallback.html` stays unused on GH Pages.
5. **Seed JSON files are empty arrays.** Intentional per spec §9; flagged here only to highlight that the Zod schemas (`projectListSchema`, `skillListSchema`, `experienceListSchema`) will accept empty arrays as-is. M1..M5 work will need to populate these and the boot-time validation (CT-M2-05) will then meaningfully exercise the refine in `projectSchema`.

---

## Audit coverage map (spec sections vs. report)

| Spec §  | Coverage in this report |
|--------|--------------------------|
| §1 Pré-requisitos | Stack check confirmed Node 22 / pnpm 9 declared in `engines` and `.nvmrc` (`22`). |
| §2 Stack/versões | Toolchain table — all ranges in `package.json` match spec; resolved versions match `scaffolding-state.md` §2. |
| §3 Estrutura | File-by-file directory check — matches with extra docs (`scaffolding-blueprint.md`, `scaffolding-state.md`) and `vite.config.ts` (see note 1). |
| §4 Comandos | Scripts diff — ISSUE-01 (now fixed). |
| §5.1 package.json | Engines + lint-staged block present and correct. |
| §5.2 tsconfig.json | Verified — D1 documented. |
| §5.3 tsconfig.node.json | Verified — matches. |
| §5.4 react-router.config.ts | Verified — matches (comment style note 3). |
| §5.5 vite.config.ts | Verified — matches. |
| §5.6 vitest.config.ts | Verified — D12 documented; thresholds enforced. |
| §5.7 setupTests.ts | Verified — matches. |
| §5.8 tailwind.config.js | Verified — D6 documented. |
| §5.9 postcss.config.cjs | Verified — matches. |
| §5.10 app.css | Verified — matches new-york/stone vars. |
| §5.11 components.json + shadcn | Verified — utils alias `@/lib/cn`; 5 primitives present in `src/components/ui/`. |
| §5.12 eslint.config.js | Verified — D2/D3/D4/D5/D7 documented. |
| §5.13 .prettierrc.json | Verified — matches. |
| §5.14 husky pre-commit | Verified — matches. |
| §5.15 .env.example | Verified — 3 `VITE_EMAILJS_*` keys present. |
| §5.16 playwright.config.ts + 4 specs | Verified — all 4 spec files present; assertions cover the required anchor per spec table. |
| §6 Domain types | `src/types/domain.ts` mirrors spec §6 verbatim. |
| §7 Zod validation | `src/lib/validation.ts` + `validation.test.ts` cover all 7 spec-listed scenarios (+5 positive/negative extras → 12 tests total). |
| §8 filterProjects | Implementation matches §8.4 reference; tests T01..T13 + T14 (D11) cover RN-M2-03..05 + CT-M2-01/03/04. |
| §9 Seed data | 3 JSON files; empty arrays per spec. |
| §10 GH Actions + 404 | Both workflows match; 404 copy step present in `deploy.yml`; `public/404.html` placeholder present. |
| §11 Ordem de execução | Reflected by branch/commit log in `scaffolding-state.md` §4. Not re-verified commit-by-commit — out of scope. |
| §12 Critérios de aceite | SC-01..SC-09 reported above. |
| §13 Notas de manutenção | No drift — Tailwind v3 confirmed at `3.4.x`; RR7 still `ssr: false`. |
| §14 Histórico de decisões (SD-01..SD-16) | All decisions still reflected in the repo (no contradictions). |

---

## Sign-off

> **Scaffolding is ready to proceed to module M1.**
>
> All AGENTS.md §6 testing rules are honoured: domain logic 100% covered, axe matchers wired via `setupTests.ts`, Playwright smokes in place. The TDD red→green workflow is unblocked for M1..M5. SC-08 and SC-09 will turn from PENDING to PASS automatically on the first push to `main` provided GH Pages is set to "GitHub Actions" in the repository settings.
>
> Recommended sequence per `scaffolding-state.md` §8: **M1 → M3 → M4 → M2 → M5**.

---

## Appendix A — Files inspected during audit

`package.json`, `tsconfig.json`, `tsconfig.node.json`, `react-router.config.ts`, `vite.config.ts`, `vitest.config.ts`, `tailwind.config.js`, `postcss.config.cjs`, `components.json`, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `.husky/pre-commit`, `.env.example`, `.nvmrc`, `.npmrc`, `.gitignore`, `playwright.config.ts`, `index.html`, `src/setupTests.ts`, `src/root.tsx`, `src/routes.ts`, `src/routes/_index.tsx`, `src/routes/projects._index.tsx`, `src/routes/projects.$id.tsx`, `src/types/domain.ts`, `src/lib/filterProjects.ts`, `src/lib/filterProjects.test.ts`, `src/lib/validation.ts`, `src/lib/validation.test.ts`, `src/lib/cn.ts`, `src/app.css`, `src/components/ui/{badge,button,card,input,textarea}.tsx` (listed only — vendor code per AGENTS.md §5), `src/data/{projects,skills,experiences}.json`, `public/404.html`, `public/favicon.svg`, `e2e/{home,contact,projects-list,project-detail}.spec.ts`, `.github/workflows/{ci,deploy}.yml`.

## Appendix B — Live gate commands executed

```sh
pnpm install --frozen-lockfile    # SC-01
pnpm run typecheck                # SC-02
pnpm run lint                     # SC-03
pnpm run test:coverage            # SC-04
pnpm run build                    # SC-05
pnpm run e2e                      # SC-06
```

All six exited 0. Side-effects landed in gitignored directories (`build/`, `coverage/`, `playwright-report/`, `test-results/`).
