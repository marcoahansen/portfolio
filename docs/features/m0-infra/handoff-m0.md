# Handoff — Milestone M0 (cumulativo)

**Versão:** 1.1.0
**Data:** 2026-05-18
**FRD:** `docs/features/m0-infra/frd-m0-infra.md` (v0.3.0)
**Status do M0:** ✅ Entregue — 4 de 4 sub-branches mergeadas; PR #13 aberto com polish de UX (Brand removido, toggles vira switch).

> Snapshot do estado do milestone M0 atravessando as quatro sub-branches sequenciais (`feat/m0-visual` → `feat/m0-theme` → `feat/m0-i18n` → `feat/m0-navbar`). Substitui handoffs avulsos quando o próximo agent precisa de visão de milestone, não de sub-branch. Para detalhes de cada etapa, ver os handoffs/blueprints específicos referenciados em cada seção.

---

## 1. Mapa de progresso

| # | Sub-branch | Fases FRD | Status | Doc primário |
|---|------------|-----------|--------|--------------|
| 1 | `feat/m0-visual` | A + B + F.1 | ✅ **Mergeada** em `main` via PR #9 (commit `437dc00`) | `handoff-m0-visual.md` |
| 2 | `feat/m0-theme` | C + F.2 | ✅ **Mergeada** em `main` via PR #10 (commit `8a625bc`) | `blueprint-m0-theme.md` |
| 3 | `feat/m0-i18n` | D + F.3 | ✅ **Mergeada** em `main` via PR #11 (merge commit `bbab54a`) | `blueprint-m0-i18n.md` |
| 4 | `feat/m0-navbar` | E + F.4 | ✅ **Mergeada** em `main` — ver PR de fechamento de M0 | `blueprint-m0-navbar.md` |

`main` HEAD na abertura de M0-navbar: `bbab54a`. Branch fechou M0 com a entrega completa de Fase E + F.4 + reconciliações documentais.

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

## 5. Sub-branch 4 — `feat/m0-navbar` ✅

**Doc primário:** `blueprint-m0-navbar.md` (v0.1.0).

### Entregue
- **Sheet primitive** (`src/components/ui/sheet.tsx`) gerado por `pnpm dlx shadcn@latest add sheet`. Traz `@radix-ui/react-dialog` como dependência direta.
- **Hooks**: `src/lib/scroll.ts` (`useScrolled(threshold=8)` com initializer SSR-safe e listener passivo) + `src/lib/scrollSpy.ts` (`useScrollSpy(ids)` com `rootMargin: "-40% 0px -55% 0px"`; último intersecting vence — RN-M0-11). Ambos com pragma para SSR-guard, restante coberto 100%.
- **Componentes**:
  - `SkipLink` — `sr-only` → `focus:not-sr-only` apontando para `#main`.
  - `Navbar` — sticky header (`top-0 z-50`), `data-scrolled` attribute para E2E, transição transparente → backdrop blur ao passar `scrollY > 8`. Em `/{lang}/` lista anchors `skills/experience/contact` filtrados por `FEATURES`, scrollspy via `useScrollSpy` com `aria-current="true"` no ativo. Em demais rotas mostra `← Início`. Container usa `justify-end gap-4` (sem brand). Inclui desktop `LocaleToggle` + `ThemeToggle` e instância de `MobileMenu` com `className="md:hidden"`.
  - `MobileMenu` — Sheet right-side disparado por hamburger (`Menu` do Lucide). Anchors/back-home conforme estado da Navbar; clique fecha o sheet; `LocaleToggle` + `ThemeToggle` ao pé via `border-t`. `SheetTitle` `sr-only` (mantém accessible name do Radix Dialog sem render visual).
- **`Brand` foi adicionado e depois removido no mesmo PR** — decisão de produto pós-implementação inicial (usuário rejeitou monograma SVG e label "MH"). `src/components/Brand.tsx` + `.test.tsx` deletados antes do PR #13. Navbar e MobileMenu não montam brand.
- **Toggles vira switch (Radix Switch)** — pós-implementação inicial, `ThemeToggle` e `LocaleToggle` migraram de `<Button>` ghost para `SwitchPrimitives.Root` + `Thumb` com ícone/label dentro do thumb. ThemeToggle: track 28×48, thumb 20×20 com Sun (light) / Moon (dark). LocaleToggle: track 28×56, thumb 20×24 com label "PT"/"EN" em mono uppercase. `role="switch"` + `aria-checked` substitui `role="button"`. Trouxe `@radix-ui/react-switch` como dep direta.
- **Wiring** (`src/root.tsx`): wrapper `data-temporary-*` (theme + locale) removido. `<SkipLink />` + `<Navbar />` montados antes de `<Outlet />`. `grep -n "data-temporary-" src/root.tsx` exit 1.
- **E2E** (`e2e/m0-infra.spec.ts`): bloco `M0 — navbar` ganha 5 testes — skip-link primeiro focusable, `data-scrolled` flip após scroll, `/pt/projects` mostra back-home, scrollspy marca contact ativo, mobile sheet abre/fecha via Escape. `e2e/_helpers.ts` ganha `navHeader`, `skipLink`, `mobileMenuTrigger`. Total no spec: 12 (3 theme + 4 i18n + 5 navbar). Suite e2e final: 20/20 verdes.
- **Bug fix herdado**: Hero CTA "Falar comigo" passou a apontar para `#contact` em vez de `withBase("/#contact")` (PR #12 — `fix/contact-scroll-anchor`, mergeado em `main` antes do navbar). E2E `e2e/contact.spec.ts` ganhou regressão dedicada.
- **Reconciliação documental**: FRD §4.4/§4.5/§13 ganham notas explicitando divergências entregues (Geist Mono default, `fontFamily.display` Asimovian, motion 900/700ms, easing `cubic-bezier(0.22, 0.61, 0.36, 1)`). FRD bump para v0.3.0. `blueprint-m0-visual.md` bump para v0.2.0 com callout "Pós-merge" cruzando para a FRD reconciliada.
- **`docs/scaffolding-state.md`** bump para v1.0.0 registrando M0 entregue (linha de entrada na §8 + history).

### Decisões (blueprint §7) — resoluções aplicadas
| ID | Resolução final |
|----|-----------------|
| **D-SHEET-INSTALL** | ✅ `pnpm dlx shadcn@latest add sheet` aceito as-is. Lockfile diff: 1 dep direta nova (`@radix-ui/react-dialog`), demais peers já presentes. |
| **D-LUCIDE-VERSION** | ✅ Pré-flight confirmou `Menu`/`X`/`Globe`/`Sun`/`Moon` resolvem em `lucide-react@^1.14.0`. Sem upgrade. |
| **D-NAV-EDUCATION** | ✅ Education não entra no scrollspy nem no nav. Education continua visível na home como seção, sem âncora navegável. |
| **D-SCROLLSPY-INITIAL** | ✅ `useScrollSpy` retorna `null` antes da primeira intersection. Sem highlight inicial. |
| **D-SHEET-AXE** | ✅ Axe aplicado ao subtree do nosso componente; Radix Dialog internals fora do escopo. Sem violações reportadas em CT-M0-MM-08. |
| **D-DOCS-RECONCILIATION** | ✅ FRD bump para v0.3.0 com notas em §4.4 e §4.5 + entrada §13. `blueprint-m0-visual.md` bump v0.2.0 com callout cruzado. |
| **D-SCAFFOLDING-VERSION** | ✅ `docs/scaffolding-state.md` bump 0.3.0 → 1.0.0, adicionando linha M0 na §8 e entrada history. |
| **D-HANDOFF-MERGE-SHA** | ✅ Opção (b) adotada — handoff v1.0.0 não cita SHA específico do merge final. Refere "PR de fechamento de M0". |
| **D-BRAND-ARIA** | ✅ `aria-label="Marco Hansen"` hardcoded; nome próprio não traduz. Sem chave de i18n. |
| **D-CONTACT-HASH-LINK** | ✅ Já resolvido em `fix/contact-scroll-anchor` (PR #12) antes desta sub-branch. Hero passou a usar `<a href="#contact">`. |
| **D-NAV-MEMO-IDS** | ✅ `HOME_SPY_IDS` é constante module-level. Sem `useMemo`. |
| **D-MOBILE-TOGGLES-DUPLICACAO** | ✅ Mobile e desktop renderizam instâncias separadas; estado compartilhado via `ThemeProvider` + `useNavigate`. Sem divergência. |

### Divergências da blueprint
1. **Commits 28 e 29 fundidos** — Navbar.tsx importa `MobileMenu`, então `feat(nav): add Navbar with desktop items and mobile sheet` veio como commit único em vez de dois sequenciais. Cobre CT-M0-NV-01..09 + CT-M0-MM-01..08 num só passo. Plano original separava para "isolar falhas"; na prática a interdependência tornaria o primeiro commit não-compilável.
2. **`<nav aria-label>` removido** — Blueprint sugeria `aria-label={t("a11y.openMenu")}` na `<nav>` desktop; semanticamente errado (aria-label deveria descrever a nav, não o trigger do menu). `<nav>` sem aria-label é a forma padrão quando há só um landmark.
3. **`Brand` mostra "MH" via `hidden md:inline`** — Blueprint propunha `sr-only md:not-sr-only` com `aria-label` no `<Link>`. Substituído por `aria-hidden="true"` no `<span>` "MH" porque o `aria-label` do link já fornece o accessible name "Marco Hansen"; ler "MH" depois seria redundância para leitores de tela.

---

## 6. Estado da árvore após `feat/m0-navbar` (M0 fechado)

**Adicionados em M0:**
- `src/lib/motion.tsx` + `.test.tsx`
- `src/lib/theme.tsx` + `.test.tsx`
- `src/lib/data.ts` + `.test.ts`
- `src/lib/useIsHydrated.ts`
- `src/lib/scroll.ts` + `.test.ts`
- `src/lib/scrollSpy.ts` + `.test.ts`
- `src/components/Section.tsx` + `.test.tsx`
- `src/components/ThemeToggle.tsx` + `.test.tsx`
- `src/components/LocaleToggle.tsx` + `.test.tsx`
- `src/components/SkipLink.tsx` + `.test.tsx`
- `src/components/Navbar.tsx` + `.test.tsx`
- `src/components/MobileMenu.tsx` + `.test.tsx`
- `src/components/ui/sheet.tsx` + `src/components/ui/switch.tsx` (vendor shadcn)
- `src/i18n/index.ts` + `.test.ts`
- `src/i18n/locales/{pt,en}/translation.json`
- `src/types/i18n.ts`
- `src/routes/_root-redirect.tsx`, `src/routes/$lang.tsx`
- `src/data/{hero,skills,experiences,education,projects}.en.json`
- `scripts/check-i18n.ts`
- `e2e/m0-infra.spec.ts`, `e2e/_helpers.ts`
- Deps: `@fontsource-variable/geist`, `@fontsource-variable/geist-mono`, `@fontsource/asimovian`, `i18next`, `react-i18next`, `@radix-ui/react-dialog`, `@radix-ui/react-switch`
- Docs: `frd-m0-infra.md`, `blueprint-m0-visual.md`, `handoff-m0-visual.md`, `blueprint-m0-theme.md`, `blueprint-m0-i18n.md`, `blueprint-m0-navbar.md`

**Renomeados em M0:**
- `src/data/{hero,skills,experiences,education,projects}.json` → `*.pt.json`
- `src/routes/_index.tsx` → `src/routes/$lang._index.tsx`
- `src/routes/projects.{_index,$id}.tsx` → `src/routes/$lang.projects.{_index,$id}.tsx`

**Adicionados e depois deletados em M0 (PR #13):**
- `src/components/Brand.tsx` + `.test.tsx` — Brand entrou e saiu no mesmo PR a pedido do usuário. Sem rastro no merge.

**Modificados em M0:**
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
- `package.json` (`prebuild` chama `check:assets && check:i18n`; `lint` prefixa `react-router typegen`; `@radix-ui/react-dialog` adicionado)
- `scripts/check-assets.ts` (lê `hero.pt.json`)
- `e2e/{home,contact,projects-list,project-detail}.spec.ts` (paths `/pt/...`)
- `e2e/contact.spec.ts` (regressão "Falar comigo" via PR #12)
- `src/components/Hero.tsx` + `.test.tsx` (`href="#contact"` em vez de `withBase("/#contact")` — PR #12)
- `src/components/ThemeToggle.tsx` + `.test.tsx` (refatorado para Radix Switch com Sun/Moon dentro do thumb)
- `src/components/LocaleToggle.tsx` + `.test.tsx` (refatorado para Radix Switch com PT/EN dentro do thumb)
- `src/components/ui/**` (sheet adicionado; demais primitives intocados por convenção)
- `src/types/domain.ts` (Project optional fields ganham `| undefined`)
- `docs/spec.md` (§5 sem i18n/theme; §3 com M0)
- `docs/scaffolding-state.md` bump 1.0.0 (M0 entregue)
- `docs/features/m0-infra/frd-m0-infra.md` bump 0.3.0 (notas de divergência em §4.4 e §4.5; entrada em §13)
- `docs/features/m0-infra/blueprint-m0-visual.md` bump 0.2.0 (callout pós-merge)

**Intactos** (out-of-scope respeitado por M0):
- `src/components/ui/{badge,button,card,input,textarea}.tsx` (vendor shadcn)
- `src/lib/{features,withBase,contactSubmit,cn,filterProjects}.ts`

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
| `feat/m0-navbar` | Sheet primitive trazida; `@radix-ui/react-dialog` direct dep | Mergeado |
| `feat/m0-navbar` | Navbar `data-scrolled` attribute para E2E (não depende de classes Tailwind voláteis) | Mergeado |
| `feat/m0-navbar` | `useScrollSpy` rootMargin `-40% 0px -55% 0px`; último intersecting vence | Mergeado |
| `feat/m0-navbar` | Education **fora** do scrollspy/nav (continua visível como seção) | Mergeado; D-NAV-EDUCATION resolvida |
| `feat/m0-navbar` | `Brand` `aria-label="Marco Hansen"` hardcoded (nome próprio) | Mergeado |
| `feat/m0-navbar` | LocaleToggle + ThemeToggle agora vivem dentro do Navbar (desktop) e do MobileMenu Sheet | Mergeado; wrapper `data-temporary-*` removido |
| `feat/m0-navbar` | Hero CTA "Falar comigo" usa `<a href="#contact">` (PR #12 — bug fix herdado) | Mergeado |
| `feat/m0-navbar` (PR #13) | Brand removido inteiro do Navbar e do MobileMenu (decisão de produto) | Aplicado pré-merge |
| `feat/m0-navbar` (PR #13) | `ThemeToggle` + `LocaleToggle` viram Radix Switch com ícone/label no thumb (`role="switch"`, `aria-checked`); helpers E2E migrados | Aplicado pré-merge; `@radix-ui/react-switch` direct dep |

---

## 8. M0 fechado

M0 entregue. Próximos passos:

1. **M2 — Projetos**. Único módulo de produto pendente. `filterProjects` + `projectSchema` já 100% cobertos; `$lang.projects.{_index,$id}.tsx` precisam consumir `getProjects(locale)` e renderizar filtros + detalhe. Feature flag `FEATURES.projects` ainda em `false`.
2. **Revisão humana das traduções EN** continua pendente (placeholder funcional). Marco revisa antes do release público.
3. **Upgrade de `lucide-react`** (`^1.14.0` → versão atual, ex. `^0.4xx`) — issue separada se necessário. Foi mantido nesta versão durante todo o M0 porque os ícones necessários (Menu/X/Globe/Sun/Moon) resolvem; upgrade é tarefa de housekeeping.
4. **Warning RR7 `<Navigate> in StaticRouter`** durante prerender continua benigno; pode ser silenciado mais tarde com loader-based redirect se ruído incomodar (`_root-redirect.tsx` e `$lang.tsx`).

---

## 9. Histórico

| Versão | Data | Mudança |
|--------|------|---------|
| 1.1.0 | 2026-05-18 | UX polish em cima do PR #13 antes do merge: Brand removido inteiro (Navbar + MobileMenu), toggles convertidos para Radix Switch com ícone/label no thumb (`@radix-ui/react-switch` direct dep). `blueprint-m0-navbar.md` bump para v0.2.0 com callout pós-merge; §5/§6/§7 deste handoff atualizam para refletir o estado real do que entra em `main`. Brand entra e sai no mesmo PR — sem rastro pós-merge. |
| 1.0.0 | 2026-05-18 | M0 ✅ Entregue. `feat/m0-navbar` conclui Fase E + F.4: Sheet primitive, hooks `useScrolled`/`useScrollSpy`, componentes `Brand`/`SkipLink`/`Navbar`/`MobileMenu`, wiring em `root.tsx` (toggles realocados, wrapper provisório removido), 5 E2Es novos. Reconciliação documental aplicada: FRD bump v0.3.0, `blueprint-m0-visual.md` bump v0.2.0, `docs/scaffolding-state.md` bump v1.0.0. Bug fix de `fix/contact-scroll-anchor` (PR #12) absorvido no histórico de M0. Sub-branch 4 ✅; tabela §7 marca decisões `feat/m0-navbar` como Mergeado. §8 reescrita para próximos passos pós-M0 (M2). |
| 0.4.0 | 2026-05-18 | `feat/m0-i18n` mergeada (PR #11, merge commit `bbab54a`). `main` avança 17 commits. `feat/m0-navbar` cortada deste SHA; este commit é o primeiro da branch. Sub-branch 3 → ✅; tabela §7 marca todas as decisões `feat/m0-i18n` como Mergeado. §8 reescrita: PR/bump já feitos, próximo passo é blueprint `feat/m0-navbar`. |
| 0.3.0 | 2026-05-18 | `feat/m0-i18n` concluída — PR #11 aberto, CI verde, pronto para merge. 16 commits (15 do blueprint + 1 fix CI). Entrega i18next + PT/EN, rotas locale-prefixadas, LocaleToggle, check-i18n guard, refactor de todos os componentes e specs E2E migradas para `/pt/`. 4 divergências da blueprint documentadas. Próxima ação migra para `feat/m0-navbar`. |
| 0.2.0 | 2026-05-18 | `feat/m0-theme` mergeada (PR #10, `8a625bc`). Adiciona divergência crítica vs blueprint (hydration mismatch) com fix `9ae9b29`. 7 commits totais na sub-branch. Próxima ação migra para `feat/m0-i18n`. |
| 0.1.0 | 2026-05-18 | Handoff cumulativo inicial: `feat/m0-visual` mergeada; `feat/m0-theme` com blueprint pendente de aval; `i18n` e `navbar` não iniciadas. |
