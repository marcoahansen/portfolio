# Handoff — Milestone M0 (cumulativo)

**Versão:** 0.4.0
**Data:** 2026-05-18
**FRD:** `docs/features/m0-infra/frd-m0-infra.md` (v0.2.0)
**Status do M0:** 3 de 4 sub-branches mergeadas; 1 em andamento (`feat/m0-navbar`).

> Snapshot do estado do milestone M0 atravessando as quatro sub-branches sequenciais (`feat/m0-visual` → `feat/m0-theme` → `feat/m0-i18n` → `feat/m0-navbar`). Substitui handoffs avulsos quando o próximo agent precisa de visão de milestone, não de sub-branch. Para detalhes de cada etapa, ver os handoffs/blueprints específicos referenciados em cada seção.

---

## 1. Mapa de progresso

| # | Sub-branch | Fases FRD | Status | Doc primário |
|---|------------|-----------|--------|--------------|
| 1 | `feat/m0-visual` | A + B + F.1 | ✅ **Mergeada** em `main` via PR #9 (commit `437dc00`) | `handoff-m0-visual.md` |
| 2 | `feat/m0-theme` | C + F.2 | ✅ **Mergeada** em `main` via PR #10 (commit `8a625bc`) | `blueprint-m0-theme.md` |
| 3 | `feat/m0-i18n` | D + F.3 | ✅ **Mergeada** em `main` via PR #11 (merge commit `bbab54a`) | `blueprint-m0-i18n.md` |
| 4 | `feat/m0-navbar` | E + F.4 | 🟡 Branch cortada de `bbab54a`; blueprint pendente | FRD §4.1 / §11 (Fase E) |

`main` HEAD atual: `bbab54a`. `feat/m0-navbar` cortada deste SHA, começando por este commit (handoff bump 0.4.0).

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

## 4. Sub-branch 3 — `feat/m0-i18n` ✅

**PR:** https://github.com/marcoahansen/portfolio/pull/11
**Merge:** `bbab54a` em 2026-05-18 (squash/merge)
**Branch tip:** `ea98e07`
**Doc primário:** `blueprint-m0-i18n.md` (v0.1.0).

### Entregue
- **i18next + react-i18next** inicializados em `src/i18n/index.ts` (side-effect via import em `src/root.tsx` e `src/setupTests.ts`). Default `pt`, sem fallback automático para detectar chaves faltando, `useSuspense: false`.
- **Dicionários paralelos** em `src/i18n/locales/{pt,en}/translation.json`. Conjunto M0 cobre `nav`, `a11y`, `theme`, `locale`, `period`, `category`, `skillCategory`, `status`, `hero`, `skills`, `experience`, `education`, `contact` (form + altChannels).
- **Tipos** em `src/types/i18n.ts` (`Locale`, `LocaleData<T>`). `isLocale` type-guard exportado por `@/i18n`.
- **Dados por locale**: cada `{name}.json` virou `{name}.pt.json` + `{name}.en.json`. `projects.{pt,en}.json` ficam `[]` até M2.
- **Loaders puros** em `src/lib/data.ts` (`getHero`/`getSkills`/`getExperiences`/`getEducation`/`getProjects` por `Locale`). Validação Zod no boot do módulo.
- **`formatPeriod` refatorada** para `Intl.DateTimeFormat` com `timeZone: "UTC"` (prerender estável) + cache de formatter por locale. Terceiro argumento `Locale` agora obrigatório (D-PERIOD-BREAKING). `sortByRecency` inalterado.
- **Rotas locale-prefixadas**: `index("routes/_root-redirect.tsx")` emite `<Navigate>` + `<link rel="canonical">` + `<meta http-equiv="refresh">` para `/portfolio/pt/`. `layout("routes/$lang.tsx", [...])` valida `:lang` e sincroniza `i18n.changeLanguage` + `<html lang>` reativo. Filhos: `$lang._index.tsx`, `$lang.projects._index.tsx`, `$lang.projects.$id.tsx`.
- **`react-router.config.ts`** prerender expandido para `["/", "/pt", "/pt/projects", "/en", "/en/projects"]`. `basename: "/portfolio/"` mantido (D-PREEXISTING-BASENAME encerrada aqui).
- **`LocaleToggle`** (`src/components/LocaleToggle.tsx`): Globe icon + sigla. Click troca prefixo `/pt|/en` preservando resto do path (regex `^/(pt|en)`). `aria-label` localizado.
- **`useIsHydrated`** extraído para `src/lib/useIsHydrated.ts` (D-LOCALE-HYDRATION); ThemeToggle e LocaleToggle compartilham. Ambos no wrapper provisório `fixed right-4 top-4` em `src/root.tsx` com marcadores `data-temporary-theme-toggle` **e** `data-temporary-locale-toggle`.
- **Componentes consumindo `useTranslation`**: Hero (availability badge, CTAs, CV label), Skills (title + skillCategory labels), Experience (title + locale-aware period), Education (idem), Contact (title/subtitle/altChannels), ContactForm (labels, placeholder, button text, success/error feedback, mensagens Zod via custom messages no schema in-component), ThemeToggle (aria-label) — fecha D-TOGGLE-I18N.
- **Zod em ContactForm**: schema vive no componente, mensagens via `t("contact.form.errors.*")` (D-VALIDATION-LOCALE + D-CONTACT-ZOD-I18N). `validation.ts` mantém `contactFormSchema` genérico (sem mensagens custom) — tests Zod globais asseguram presença de issue.
- **Guard de build `scripts/check-i18n.ts`** roda em `prebuild` (`pnpm run check:assets && pnpm run check:i18n`). Valida paridade de chaves UI (PT vs EN) **e** shape de cada dataset paralelo. Break-tests verificados: remover chave EN ou adicionar campo PT extra aborta `pnpm run check:i18n`.
- **E2E migrado para `/pt/`**: helpers compartilhados em `e2e/_helpers.ts` (`themeButton`, `localeButton`, `waitForHydration`) — D-E2E-HELPER. `m0-infra.spec.ts` ganha 4 novos testes i18n (LocaleToggle PT↔EN preservando path, root redirect, `<html lang>` muta para `en-US`). Total e2e: 14/14 verdes.
- **`docs/spec.md`** atualizado: §5 perde "modo escuro/claro toggle" e "i18n PT/EN"; §3 ganha entrada M0 — Infraestrutura.
- **Fix CI**: `pnpm run lint` agora prefixa `react-router typegen` — sem isso, CI cold start falha porque `.react-router/types` ainda não existe quando lint roda (antes de typecheck).

### Commits da branch (16 total)
| # | SHA | Subject |
|---|-----|---------|
| 0  | `14ab151` | docs(m0): add blueprint for feat/m0-i18n sub-branch |
| 15 | `6c9de98` | chore(deps): add i18next + react-i18next |
| 16 | `6b907c1` | feat(i18n): init i18n config and PT/EN dictionaries |
| 17 | `36554b6` | feat(i18n): split data files by locale |
| 18 | `cb97fa7` | feat(i18n): add data loaders by locale |
| 19 | `6062370` | feat(i18n): refactor period to Intl by locale |
| 20 | `b27050d` | feat(i18n): add check-i18n build guard |
| 21 | `15bfcb8` | feat(routes): restructure to locale-prefixed paths |
| 22 | `149be16` | refactor(hero): consume i18n + locale data |
| 23 | `43c66c0` | refactor(skills,experience,education): consume i18n + locale data |
| 24 | `0bc60d4` | refactor(contact): consume i18n + locale data |
| 25 | `8f72414` | refactor(theme): migrate ThemeToggle to useTranslation |
| 26 | `74d446f` | feat(i18n): add LocaleToggle component |
| 27 | `21cb269` | test(e2e): migrate specs to /pt/ + cover LocaleToggle |
| 28 | `8386295` | docs(spec): remove i18n from out-of-scope; reference M0 FRD |
| (fix) | `ea98e07` | fix(lint): run react-router typegen before eslint |

### Decisões (blueprint §7) — resoluções aplicadas
| ID | Resolução final |
|----|-----------------|
| **D-DICT-SCOPE** | ✅ Dicionário ampliado já no commit 16 (hero/skills/experience/education/contact incluídos). Evitou PR-thrash durante refactors. |
| **D-EN-CONTENT** | ✅ Tradução EN funcional gerada agora. Marco revisa antes do merge final em produção. |
| **D-DATA-LOADER** | ✅ Função pura `getX(locale)` — componentes recebem dados como prop, rotas resolvem locale. |
| **D-PERIOD-FORMAT** | ✅ Regex tolerante em `period.test.ts`. ICU varia (PT-BR retorna `"dez. de 2023"` no Node 22 com `timeZone: UTC`). |
| **D-PERIOD-BREAKING** | ✅ 3º param `locale` obrigatório. Sem default. Call sites em Experience/Education vêm de `useTranslation().i18n.language`. |
| **D-VALIDATION-LOCALE** | ✅ Schema dentro de `ContactForm.tsx` via `useMemo([t])`. `validation.ts` mantém `contactFormSchema` sem mensagens custom. |
| **D-CONTACT-ZOD-I18N** | ✅ Mensagens vivem no componente; `contactFormSchema` global ficou genérico. Tests Zod globais ainda asserem presença de issue (não texto). |
| **D-PROJECTS-EMPTY** | ✅ Ambos `projects.{pt,en}.json` criados como `[]`. `check-i18n` valida shape mesmo com array vazio (sentinela `[]` no flatten). |
| **D-LOCALE-HYDRATION** | ✅ `useIsHydrated` extraído para `src/lib/useIsHydrated.ts`, reusado por ThemeToggle e LocaleToggle. |
| **D-HTML-LANG** | ✅ `<html suppressHydrationWarning>` herdado de `feat/m0-theme` cobre. `$lang.tsx` atualiza `document.documentElement.setAttribute("lang", "pt-BR"|"en-US")` após mount. |
| **D-ROUTE-CONVENTION** | ✅ `layout("routes/$lang.tsx", [...])` explícito. typegen RR7 produz `+types/$lang._index.d.ts` corretamente. |
| **D-DEFAULT-EXPORT-ON-INDEX** | ✅ Build emite warning `<Navigate> must not be used on the initial render in a <StaticRouter>` — esperado. Meta refresh cobre crawlers/no-JS; `<Navigate>` cobre client após hydration. |
| **D-E2E-HELPER** | ✅ `e2e/_helpers.ts` exporta `themeButton`, `localeButton`, `waitForHydration`. |
| **D-PRERENDER-IDS** | ✅ 5 prerenders. `/projects/:id` permanece SPA fallback até M2. |
| **D-DOCS-SCAFFOLDING** | ✅ `scaffolding-state.md` intocado. Update final fica para `feat/m0-navbar`. |
| **D-MIGRATION-ORDER** | ✅ APIs de componente preservadas (props inalteradas); só conteúdo de string literal trocado para `t(...)`. Quebra intermediária zero — cada commit standalone verde. |

### Divergências da blueprint
1. **CI lint cold-start fail** — Blueprint não previu que `pnpm run lint` em CI cold-start falha sem `.react-router/types` (porque `Route.MetaArgs` colapsa para `any`). Fix `ea98e07` prefixa `react-router typegen` no script `lint` (e `lint:fix`).
2. **`$lang.tsx` early-return ordering** — Versão final retorna `<Navigate to="/pt/" replace />` **depois** do `useEffect`, evitando warning de hooks condicionais. Blueprint §3.9 mostrava early-return antes; trocado.
3. **`useIsHydrated` em LocaleToggle** — Aplicado de fato apenas no rótulo de texto (`hydrated ? other.toUpperCase() : ""`) — botão sempre renderiza, sem placeholder vazio. Suficiente para evitar mismatch porque o ícone Globe não muda entre server e client.
4. **`contact.form.email` PT** — Blueprint sugeria "E-mail" mas o label original do componente já era "Email", e testes existentes usam `getByLabelText(/email/i)`. Dict ficou "Email" para PT (mantém compat) e "Email" para EN.

### Pendências herdadas para próximas sub-branches
- **Marcadores `data-temporary-*-toggle`** em `src/root.tsx`: ambos `data-temporary-theme-toggle` **e** `data-temporary-locale-toggle` no mesmo wrapper. `feat/m0-navbar` deve grepar pelos atributos e mover ambos os toggles para dentro do Navbar.
- **`docs/scaffolding-state.md`** continua sem update — reservado para `feat/m0-navbar` (FRD §11 Fase F.4).
- **Reconciliação documental** (Geist Mono default, Asimovian, motion timings 900/700ms) — ainda pendente; deve cair em `feat/m0-navbar` na atualização final da FRD.
- **Revisão humana das traduções EN** — placeholder funcional, Marco revisa antes do release público.
- **`Hero.test.tsx`** usa regex `/Baixar CV/i` (PT) em vez de `/Download CV/`. Sob i18n default `pt`, tests cobrem PT; se rodar testes com locale EN no futuro, ajustar fixture ou usar regex tolerante.

---

## 5. Sub-branch 4 — `feat/m0-navbar` ⚪

**Branch:** não cortada.
**Doc primário:** FRD §4.1, §11 Fase E.

### Escopo (Fase E + F.4)
- `Sheet` (shadcn primitive), `SkipLink`, `Brand`, `Navbar`, `MobileMenu`.
- Hooks: `useScrolled`, `useScrollSpy`.
- Wiring em `root.tsx`.
- **Realoca `ThemeToggle` e `LocaleToggle`** para dentro do Navbar — remover wrapper provisório `data-temporary-theme-toggle` + `data-temporary-locale-toggle` (mesmo container `<div>`, grep pelos atributos).
- Completa `e2e/m0-infra.spec.ts` com navbar + skip-link + mobile sheet. SkipLink já tem âncora `#main` plantada nas rotas (`$lang._index.tsx`, `$lang.projects._index.tsx`, `$lang.projects.$id.tsx`) — basta apontar para ela.
- `docs(state): record M0 delivery` — update final em `docs/scaffolding-state.md`.
- Reconciliação documental: atualizar FRD/blueprint para refletir divergências mantidas (Geist Mono default, Asimovian, motion timings 900/700ms).
- Atualizar este handoff: bump para 0.4.0, marcar sub-branch 3 ✅ com SHA real do merge.

---

## 6. Estado da árvore após `feat/m0-i18n`

**Adicionados em M0 até agora:**
- `src/lib/motion.tsx` + `.test.tsx`
- `src/lib/theme.tsx` + `.test.tsx`
- `src/lib/data.ts` + `.test.ts`
- `src/lib/useIsHydrated.ts`
- `src/components/Section.tsx` + `.test.tsx`
- `src/components/ThemeToggle.tsx` + `.test.tsx`
- `src/components/LocaleToggle.tsx` + `.test.tsx`
- `src/i18n/index.ts` + `.test.ts`
- `src/i18n/locales/{pt,en}/translation.json`
- `src/types/i18n.ts`
- `src/routes/_root-redirect.tsx`, `src/routes/$lang.tsx`
- `src/data/{hero,skills,experiences,education,projects}.en.json`
- `scripts/check-i18n.ts`
- `e2e/m0-infra.spec.ts`, `e2e/_helpers.ts`
- Deps: `@fontsource-variable/geist`, `@fontsource-variable/geist-mono`, `@fontsource/asimovian`, `i18next`, `react-i18next`
- Docs: `frd-m0-infra.md`, `blueprint-m0-visual.md`, `handoff-m0-visual.md`, `blueprint-m0-theme.md`, `blueprint-m0-i18n.md`

**Renomeados em M0:**
- `src/data/{hero,skills,experiences,education,projects}.json` → `*.pt.json`
- `src/routes/_index.tsx` → `src/routes/$lang._index.tsx`
- `src/routes/projects.{_index,$id}.tsx` → `src/routes/$lang.projects.{_index,$id}.tsx`

**Modificados em M0 até agora:**
- `src/app.css` (paleta + fonts + keyframes + `:root`/`.dark` fora de `@layer base`)
- `tailwind.config.js` (fontFamily + fontSize tokens)
- `src/components/{Hero,Skills,Experience,Education,Contact,ContactForm}.tsx` (i18n)
- `src/components/{Skills,Experience,Education,Contact,Hero,ContactForm,ThemeToggle}.test.tsx` (regex tolerantes + i18n)
- `src/lib/period.ts` (`formatPeriod(start,end,locale)` via Intl, cache de formatter)
- `src/lib/period.test.ts` (regex tolerantes, casos PT+EN)
- `src/lib/validation.ts` (`validateProjects` + Project optional `| undefined` + `contactFormSchema` sem mensagens custom)
- `src/lib/validation.test.ts` (block para `validateProjects`)
- `src/setupTests.ts` (`MockIntersectionObserver` + `window.matchMedia` + `import "@/i18n"`)
- `src/root.tsx` (Layout com bootstrap + `ThemeProvider` + wrapper com ambos os toggles provisórios)
- `index.html` (bootstrap script inline antes do title)
- `src/routes.ts` (`index(_root-redirect)` + `layout($lang, [...])`)
- `react-router.config.ts` (prerender 5 rotas)
- `package.json` (`prebuild` chama `check:assets && check:i18n`; `lint` prefixa `react-router typegen`)
- `scripts/check-assets.ts` (lê `hero.pt.json`)
- `e2e/{home,contact,projects-list,project-detail}.spec.ts` (paths `/pt/...`)
- `src/types/domain.ts` (Project optional fields ganham `| undefined`)
- `docs/spec.md` (§5 sem i18n/theme; §3 com M0)

**Intactos** (out-of-scope respeitado pelas sub-branches concluídas):
- Navbar/SkipLink/MobileMenu/Sheet/useScrolled/useScrollSpy — **não criados ainda**
- `src/components/ui/**` (vendor shadcn intocado por convenção)
- `src/lib/{features,withBase,contactSubmit,cn,filterProjects}.ts`
- `docs/scaffolding-state.md` (reservado para `feat/m0-navbar`)

---

## 7. Decisões cross-cutting acumuladas

| Origem | Decisão | Status |
|--------|---------|--------|
| FRD §3 | M0 dividido em 4 sub-branches sequenciais, merge `--ff-only`/squash entre cada | Honrado em PR #9, #10, #11 |
| FRD §3 | basename `/portfolio/` (D-BASE-01) | Pré-existente; reconciliado em `feat/m0-i18n` |
| `feat/m0-visual` | Geist Mono = default global; Asimovian = display | Mergeado, **diverge da FRD** |
| `feat/m0-visual` | Reveal 900/700ms, easing-out-quart | Mergeado, **diverge da FRD** |
| `feat/m0-visual` | `:root`/`.dark` fora de `@layer base` | Mergeado (necessário para tema funcionar) |
| `feat/m0-theme` | `ThemeToggle` hardcode PT até i18n | Mergeado; encerrado em `feat/m0-i18n` (commit 25) |
| `feat/m0-theme` | Mount provisório com marcador `data-temporary-theme-toggle` | Mergeado |
| `feat/m0-theme` | `suppressHydrationWarning` em `<html>` + `useSyncExternalStore` no toggle | Mergeado, **adiciona constraint** para próximas sub-branches |
| `feat/m0-theme` | Inline bootstrap script em `index.html` **e** `Layout` | Mergeado (anti-FOUC dupla cobertura) |
| `feat/m0-i18n` | `useIsHydrated` virou helper compartilhado em `src/lib/` | Mergeado; reusado por ThemeToggle + LocaleToggle |
| `feat/m0-i18n` | LocaleToggle mount provisório paralelo ao ThemeToggle com `data-temporary-locale-toggle` | Mergeado; `feat/m0-navbar` deve grepar AMBOS os atributos |
| `feat/m0-i18n` | `formatPeriod(start, end, locale)` — 3º param obrigatório, sem default | Mergeado; toda chamada nova deve passar locale do `useTranslation` |
| `feat/m0-i18n` | Schema Zod do ContactForm vive no componente; `contactFormSchema` global ficou sem mensagens | Mergeado; tests Zod globais só asseguram presença de issue |
| `feat/m0-i18n` | `pnpm run lint` prefixa `react-router typegen` | Mergeado; necessário para CI cold-start não quebrar em `Route.MetaArgs` |
| `feat/m0-i18n` | Prerender static `/` emite `<Navigate>` + `meta refresh` para `/portfolio/pt/` | Mergeado; warning RR7 `<Navigate> in StaticRouter` é benigno |
| `feat/m0-i18n` | `<html lang>` muta reativamente em `$lang.tsx` via `useEffect` | Mergeado; coberto por `suppressHydrationWarning` do `feat/m0-theme` |

---

## 8. Próxima ação

`feat/m0-navbar` já cortada de `bbab54a`. Este commit (handoff bump 0.4.0) abre a branch.

1. **Escrever blueprint** `blueprint-m0-navbar.md` (Fase E + F.4) — espelhar formato dos blueprints anteriores. Decisões a fechar antes de codar:
   - Estrutura do Navbar (sticky? mobile sheet vs drawer? scrollspy ativo via IntersectionObserver?)
   - Realocação dos toggles: grep `data-temporary-theme-toggle` **e** `data-temporary-locale-toggle` simultaneamente e mover ambos para dentro do Navbar
   - SkipLink target: `#main` (já existe nas rotas `$lang.*`)
   - Reconciliação documental final: atualizar FRD/blueprint para refletir Geist Mono default + Asimovian display + motion 900/700ms
   - Atualizar `docs/scaffolding-state.md` registrando M0 entregue
2. **Implementar Navbar + SkipLink + MobileMenu + hooks de scroll** (`useScrolled`, `useScrollSpy`); wire em `root.tsx`; remover wrapper provisório dos toggles.
3. **Completar `e2e/m0-infra.spec.ts`** com cobertura navbar (sticky, mobile sheet, skip-link).
4. Abrir PR, mergear em `main`. Este handoff bump para 1.0.0, M0 fechado.

---

## 9. Histórico

| Versão | Data | Mudança |
|--------|------|---------|
| 0.4.0 | 2026-05-18 | `feat/m0-i18n` mergeada (PR #11, merge commit `bbab54a`). `main` avança 17 commits. `feat/m0-navbar` cortada deste SHA; este commit é o primeiro da branch. Sub-branch 3 → ✅; tabela §7 marca todas as decisões `feat/m0-i18n` como Mergeado. §8 reescrita: PR/bump já feitos, próximo passo é blueprint `feat/m0-navbar`. |
| 0.3.0 | 2026-05-18 | `feat/m0-i18n` concluída — PR #11 aberto, CI verde, pronto para merge. 16 commits (15 do blueprint + 1 fix CI). Entrega i18next + PT/EN, rotas locale-prefixadas, LocaleToggle, check-i18n guard, refactor de todos os componentes e specs E2E migradas para `/pt/`. 4 divergências da blueprint documentadas. Próxima ação migra para `feat/m0-navbar`. |
| 0.2.0 | 2026-05-18 | `feat/m0-theme` mergeada (PR #10, `8a625bc`). Adiciona divergência crítica vs blueprint (hydration mismatch) com fix `9ae9b29`. 7 commits totais na sub-branch. Próxima ação migra para `feat/m0-i18n`. |
| 0.1.0 | 2026-05-18 | Handoff cumulativo inicial: `feat/m0-visual` mergeada; `feat/m0-theme` com blueprint pendente de aval; `i18n` e `navbar` não iniciadas. |
