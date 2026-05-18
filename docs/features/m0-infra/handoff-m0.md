# Handoff — Milestone M0 (cumulativo)

**Versão:** 0.2.0
**Data:** 2026-05-18
**FRD:** `docs/features/m0-infra/frd-m0-infra.md` (v0.2.0)
**Status do M0:** 2 de 4 sub-branches mergeadas; 2 ainda não iniciadas.

> Snapshot do estado do milestone M0 atravessando as quatro sub-branches sequenciais (`feat/m0-visual` → `feat/m0-theme` → `feat/m0-i18n` → `feat/m0-navbar`). Substitui handoffs avulsos quando o próximo agent precisa de visão de milestone, não de sub-branch. Para detalhes de cada etapa, ver os handoffs/blueprints específicos referenciados em cada seção.

---

## 1. Mapa de progresso

| # | Sub-branch | Fases FRD | Status | Doc primário |
|---|------------|-----------|--------|--------------|
| 1 | `feat/m0-visual` | A + B + F.1 | ✅ **Mergeada** em `main` via PR #9 (commit `437dc00`) | `handoff-m0-visual.md` |
| 2 | `feat/m0-theme` | C + F.2 | ✅ **Mergeada** em `main` via PR #10 (commit `8a625bc`) | `blueprint-m0-theme.md` |
| 3 | `feat/m0-i18n` | D + F.3 | ⚪ Não iniciada | FRD §4.3 / §11 (Fase D) |
| 4 | `feat/m0-navbar` | E + F.4 | ⚪ Não iniciada | FRD §4.1 / §11 (Fase E) |

`main` HEAD atual: `8a625bc`. Working tree limpo exceto este arquivo untracked (este handoff cumulativo).

---

## 2. Sub-branch 1 — `feat/m0-visual` ✅

**PR:** https://github.com/marcoahansen/portfolio/pull/9
**Merge:** `437dc00` em 2026-05-15
**Handoff dedicado:** `handoff-m0-visual.md` (autoritativo para detalhe).

### Entregue
- Tokens visuais: paleta slate + emerald-700 (light) / emerald-400 (dark), 9 tokens `fontSize`.
- Fontes: Geist Sans + Geist Mono Variable + Asimovian via `@fontsource(-variable)`.
- `<Section>` wrapper aplicado a Skills, Experience, Education, Contact.
- Motion: `useInView`, `<Reveal>`, keyframes `mh-fade-in-up/in`, respeitando `prefers-reduced-motion`.
- 16 commits totais (10 do blueprint + 5 follow-ups em voo + 1 doc commit do handoff).

### Divergências da FRD (mantidas em produção)
1. **Geist Mono é default body face** (FRD assumia Sans). `theme.fontFamily.sans` aponta para Geist Mono.
2. **Asimovian** introduzida como `fontFamily.display`, aplicada só em Hero `h1` e Section `h2`.
3. **Reveal animations:** 900ms / 700ms (FRD §4.5 dizia 600ms / 500ms); easing trocado para `cubic-bezier(0.22, 0.61, 0.36, 1)`.

Essas mudanças **não foram refletidas na FRD nem no blueprint original**. Reconciliação documental fica para o merge final de M0 (em `feat/m0-navbar`).

### Bug latente corrigido fora de escopo
Commit `3555d90` moveu blocos `:root` e `.dark` de **dentro** de `@layer base` para top-level — Tailwind v3 estava purgando `.dark`. Sem esse fix, `feat/m0-theme` produziria toggle visualmente quebrado.

---

## 3. Sub-branch 2 — `feat/m0-theme` ✅

**PR:** https://github.com/marcoahansen/portfolio/pull/10
**Merge:** `8a625bc` em 2026-05-18
**Doc primário:** `blueprint-m0-theme.md` (v0.1.0).

### Entregue
- `src/lib/theme.tsx` — `ThemeProvider`, `useTheme`, `getInitialTheme`, `STORAGE_KEY="mh-theme"`, com try/catch em `localStorage`/`matchMedia` para Safari private/bloqueios.
- `src/components/ThemeToggle.tsx` — `Button` ghost/icon com Sun/Moon (lucide). PT-BR hardcoded até `feat/m0-i18n`.
- Anti-FOUC inline script em `index.html` **e** em `Layout` em `src/root.tsx` (script idêntico, idempotente — um HTML carrega só uma vez).
- `ThemeProvider` wrappa `<Outlet />` em `root.tsx`; `ThemeToggle` montado **provisoriamente** em wrapper `fixed right-4 top-4 z-50` com atributo marcador `data-temporary-theme-toggle` — `feat/m0-navbar` realocará via grep do atributo.
- `src/setupTests.ts` ganha mock default de `window.matchMedia` (retorna `matches: false`).
- `e2e/m0-infra.spec.ts` — 3 specs: toggle alterna `.dark`, persistência cross-reload (verificando real mudança de estado, não só preservação), ausência de FOUC com `localStorage["mh-theme"]="dark"`.

### Commits da branch (7 total)
| # | SHA | Subject |
|---|-----|---------|
| 0 | `23c8c29` | docs(m0): add blueprint for feat/m0-theme sub-branch |
| 11 | `d2c73c8` | feat(theme): add ThemeProvider and useTheme |
| 12 | `643be74` | feat(theme): add anti-FOUC inline script |
| 13 | `c22c81c` | feat(theme): add ThemeToggle component |
| 14 | `300730a` | feat(root): wire ThemeProvider and bootstrap script |
| (fix) | `9ae9b29` | fix(theme): resolve hydration mismatch on prerendered pages |
| 15 | `15e22db` | test(e2e): cover theme toggle and FOUC absence |

### Decisões (blueprint §7) — resoluções aplicadas
| ID | Resolução final |
|----|-----------------|
| **D-TOGGLE-MOUNT** | ✅ Mount provisório `fixed right-4 top-4 z-50` em `root.tsx` com `data-temporary-theme-toggle`. Marcador a ser removido por `feat/m0-navbar`. |
| **D-TOGGLE-I18N** | ✅ Hardcode PT — "Mudar para tema claro/escuro". Refactor para `useTranslation` cai em `feat/m0-i18n`. |
| **D-FOUC-INDEX** | ✅ Script em ambos `index.html` e `Layout`. Cobre dev shell (Vite) **e** prerender estático (RR7). |
| **D-LUCIDE-VERSION** | ✅ Pré-flight confirmou `Sun`/`Moon` resolvem em `lucide-react@^1.14.0`. Versão estranha mantida — sem upgrade. |
| **D-PREEXISTING-BASENAME** | ✅ `react-router.config.ts` não tocado. Reconciliação fica para `feat/m0-i18n`. |
| **D-COV-SSR-BRANCH** | ✅ `/* c8 ignore next */` aplicado em ambos early returns SSR (`getInitialTheme` e useEffect em `ThemeProvider`). `theme.tsx` em 100% real-world coverage. |
| **D-MOUNT-Z** | ✅ `z-50` + `right-4 top-4`. Sem regressão visual reportada. |
| **D-AXE-SVG** | ✅ `aria-label` no Button, `aria-hidden` no SVG. Axe sem violações. |

### Divergência crítica da blueprint — hydration mismatch
Blueprint §3.3/§3.6 não previu que `ssr: false` + `prerender: ["/", "/projects"]` ainda **hidrata** o HTML estático no browser. Resultado:
- `<html>` sem `.dark` no prerender vs `<html class="dark">` após bootstrap script → React reclama de mismatch.
- `ThemeToggle` renderiza Moon no prerender (state inicial "light") vs Sun no client (state "dark" lido do localStorage) → mismatch no SVG e aria-label.

**Fix aplicado em `9ae9b29`:**
- `<html suppressHydrationWarning>` no `Layout` — padrão consagrado (next-themes, shadcn/ui).
- `ThemeToggle` usa `useSyncExternalStore(noopSubscribe, () => true, () => false)` para detectar pós-hidratação. Antes de hidratar, renderiza `<span className="size-5" />` (placeholder) no lugar do ícone. Após hidratar, ícone real.

Sem o fix, app funcionava mas React descartava a árvore prerenderizada e re-renderizava no client — perf hit + warning ruidoso.

### Pendências herdadas para próximas sub-branches
- **Marcador `data-temporary-theme-toggle`** em `src/root.tsx` precisa ser removido por `feat/m0-navbar` (grep o atributo) quando `Navbar` absorver o toggle.
- **PT-BR hardcoded** em `ThemeToggle.tsx` precisa migrar para `useTranslation` em `feat/m0-i18n`.
- **Hydration fix** (`suppressHydrationWarning` + `useSyncExternalStore`) é necessário enquanto o app continuar com `ssr: false` + `prerender`. Não desfazer sem repensar bootstrap.

---

## 4. Sub-branch 3 — `feat/m0-i18n` ⚪

**Branch:** não cortada.
**Doc primário:** FRD §4.3, §11 Fase D.

### Escopo (Fase D + F.3)
- i18next + dicionário PT/EN em `src/i18n/locales/{pt,en}/translation.json`.
- Tipos novos em `src/types/i18n.ts`; schemas Zod estendidos em `src/lib/validation.ts`.
- Split de dados por locale (estrutura em FRD §5.3).
- Rotas com `:lang`, `_root-redirect.tsx` com canonical + meta refresh para `/portfolio/`.
- `LocaleToggle` componente.
- Guard de build `check-i18n` (FRD §9.4).
- `basename: "/portfolio/"` documentado como D-BASE-01 — já está em `react-router.config.ts` pré-existente (ver D-PREEXISTING-BASENAME).
- Migra specs E2E existentes (`home`, `projects-list`, `project-detail`, `contact`) para baseURL `/pt/`.
- `docs(spec): remove i18n from out-of-scope; reference M0 FRD`.

### Pendências cruzadas a herdar
- **D-PREEXISTING-BASENAME** (do blueprint m0-theme): `react-router.config.ts` já tem `basename: "/portfolio/"` + `prerender: ["/", "/projects"]`. Reconciliar com escopo i18n aqui.
- **Migração do `ThemeToggle` para `useTranslation`** (era plano original da FRD §4.2). Hardcode PT introduzido em `feat/m0-theme` precisa ser refatorado nesta sub-branch.
- Itens em aberto da FRD §12: "decidir se Skills e Education recebem `eyebrow`" — copy decision durante Fase D.

---

## 5. Sub-branch 4 — `feat/m0-navbar` ⚪

**Branch:** não cortada.
**Doc primário:** FRD §4.1, §11 Fase E.

### Escopo (Fase E + F.4)
- `Sheet` (shadcn primitive), `SkipLink`, `Brand`, `Navbar`, `MobileMenu`.
- Hooks: `useScrolled`, `useScrollSpy`.
- Wiring em `root.tsx`.
- **Realoca `ThemeToggle`** para dentro do Navbar — remover wrapper provisório `data-temporary-theme-toggle` introduzido em `feat/m0-theme` (grep direto pelo atributo).
- Completa `e2e/m0-infra.spec.ts` com navbar + skip-link + mobile sheet.
- `docs(state): record M0 delivery` — update final em `docs/scaffolding-state.md`.
- Reconciliação documental: atualizar FRD/blueprint para refletir divergências mantidas (Geist Mono default, Asimovian, motion timings 900/700ms).

---

## 6. Estado da árvore após `feat/m0-theme`

**Adicionados em M0 até agora:**
- `src/lib/motion.tsx` + `.test.tsx`
- `src/lib/theme.tsx` + `.test.tsx`
- `src/components/Section.tsx` + `.test.tsx`
- `src/components/ThemeToggle.tsx` + `.test.tsx`
- `e2e/m0-infra.spec.ts`
- Deps: `@fontsource-variable/geist`, `@fontsource-variable/geist-mono`, `@fontsource/asimovian`
- Docs: `frd-m0-infra.md`, `blueprint-m0-visual.md`, `handoff-m0-visual.md`, `blueprint-m0-theme.md`

**Modificados em M0 até agora:**
- `src/app.css` (paleta + fonts + keyframes + `:root`/`.dark` fora de `@layer base`)
- `tailwind.config.js` (fontFamily + fontSize tokens)
- `src/components/{Hero,Skills,Experience,Education,Contact}.tsx`
- `src/setupTests.ts` (`MockIntersectionObserver` + `window.matchMedia` mock)
- `src/root.tsx` (`Layout` com bootstrap script + `Root` envolvendo `Outlet` em `ThemeProvider` + toggle provisório)
- `index.html` (bootstrap script inline antes do title)

**Intactos** (out-of-scope respeitado pelas sub-branches concluídas):
- `src/routes/**`, `src/routes.ts`, `react-router.config.ts`
- Todos os `e2e/*` exceto `m0-infra.spec.ts` (novo)
- `src/components/ui/**`, `src/components/ContactForm.tsx`
- `src/data/*.json`, `src/lib/{period,validation,features,withBase,contactSubmit,cn}.ts`

---

## 7. Decisões cross-cutting acumuladas

| Origem | Decisão | Status |
|--------|---------|--------|
| FRD §3 | M0 dividido em 4 sub-branches sequenciais, merge `--ff-only`/squash entre cada | Honrado em PR #9 e PR #10 |
| FRD §3 | basename `/portfolio/` (D-BASE-01) | Pré-existe; oficialmente entra em `feat/m0-i18n` |
| `feat/m0-visual` | Geist Mono = default global; Asimovian = display | Mergeado, **diverge da FRD** |
| `feat/m0-visual` | Reveal 900/700ms, easing-out-quart | Mergeado, **diverge da FRD** |
| `feat/m0-visual` | `:root`/`.dark` fora de `@layer base` | Mergeado (necessário para tema funcionar) |
| `feat/m0-theme` | `ThemeToggle` hardcode PT até i18n | Mergeado |
| `feat/m0-theme` | Mount provisório com marcador `data-temporary-theme-toggle` | Mergeado |
| `feat/m0-theme` | `suppressHydrationWarning` em `<html>` + `useSyncExternalStore` no toggle | Mergeado, **adiciona constraint** para próximas sub-branches |
| `feat/m0-theme` | Inline bootstrap script em `index.html` **e** `Layout` | Mergeado (anti-FOUC dupla cobertura) |

---

## 8. Próxima ação

1. Escrever blueprint para `feat/m0-i18n` (Fase D + F.3) — espelhar formato do `blueprint-m0-theme.md`. Inclui decisões fechadas (similar a §7 dele).
2. Cortar `feat/m0-i18n` a partir de `8a625bc` (`main`).
3. Implementar i18next, dicionário PT/EN, rotas com `:lang`, `LocaleToggle`, guard `check-i18n`. Não esquecer:
   - Migrar `ThemeToggle.tsx` para `useTranslation` (substitui strings hardcoded em PT-BR).
   - Reconciliar `react-router.config.ts` (basename + prerender) — D-PREEXISTING-BASENAME chega ao destino aqui.
   - `docs(spec): remove i18n from out-of-scope; reference M0 FRD`.
4. Migrar specs E2E existentes (`home`, `projects-list`, `project-detail`, `contact`) para baseURL `/pt/`.
5. Merge → atualizar este handoff (status sub-branch 3 → ✅).

---

## 9. Histórico

| Versão | Data | Mudança |
|--------|------|---------|
| 0.2.0 | 2026-05-18 | `feat/m0-theme` mergeada (PR #10, `8a625bc`). Adiciona divergência crítica vs blueprint (hydration mismatch) com fix `9ae9b29`. 7 commits totais na sub-branch. Próxima ação migra para `feat/m0-i18n`. |
| 0.1.0 | 2026-05-18 | Handoff cumulativo inicial: `feat/m0-visual` mergeada; `feat/m0-theme` com blueprint pendente de aval; `i18n` e `navbar` não iniciadas. |
