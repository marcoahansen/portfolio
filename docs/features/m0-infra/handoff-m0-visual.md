# Handoff — `feat/m0-visual` → próximo agent

**Branch:** `feat/m0-visual`
**PR:** https://github.com/marcoahansen/portfolio/pull/9
**Status:** Implementado, testado, merge pendente
**Próxima sub-branch:** `feat/m0-theme` (Fase C)
**Documentos:** `frd-m0-infra.md` (v0.2.0), `blueprint-m0-visual.md` (v0.1.0)

---

## 1. O que foi entregue

16 commits ahead de `main`. Tudo verde (lint, typecheck, 128 testes, coverage, build, e2e 7/7).

### 1.1 Commits da Fase A+B (1–10 do blueprint)

| # | SHA | Subject |
|---|-----|---------|
| 0 | `8c2380a` | docs(m0): add blueprint for feat/m0-visual sub-branch |
| 1 | `65444fd` | chore(deps): add Geist Variable fonts |
| 2 | `c09499e` | feat(style): wire Geist and font-family tokens |
| 3 | `6ecc5f6` | feat(style): swap palette to slate + emerald |
| 4 | `1ba9e46` | feat(style): add typography size tokens |
| 5 | `d81af43` | refactor(hero): migrate to new typography tokens |
| 6 | `334933b` | feat(motion): add motion utilities |
| 7 | `95919a5` | feat(ui): add Section wrapper |
| 8 | `461ff52` | refactor(skills): migrate to Section |
| 9 | `fe086cc` | refactor(experience): migrate to Section |
| 10 | `dc65a22` | refactor(contact): migrate to Section |

### 1.2 Follow-ups decididos em voo

| # | SHA | Subject | Origem |
|---|-----|---------|--------|
| 11 | `3555d90` | fix(style): lift palette tokens out of @layer base | Bug descoberto durante validação visual (`.dark` purgado por Tailwind) |
| 12 | `4d1ce14` | style(motion): slow reveal animations and soften easing | Pedido do autor (opção B: 900ms / 700ms) |
| 13 | `c418a01` | style(typography): apply Geist Mono to dates, badges and CV tag | Pedido do autor |
| 14 | `a5888b8` | feat(style): add Asimovian display font for main titles | Pedido do autor |
| 15 | `453ef5d` | style(typography): make Geist Mono the default body face, widen display | Pedido do autor |

---

## 2. Decisões fechadas (do blueprint §7)

| ID | Resolução final |
|----|-----------------|
| D-CONTRAST-A | Emerald-700 (`160 84% 28%`) no light em vez de emerald-600 — passa AA (4.74:1). Documentado em commit 3. |
| D-SEC-A | `<Section>` renderiza `<h2>` sem `id`. Axe + RTL `getByRole("heading")` cobrem. |
| D-MOTION-A | `IntersectionObserver` mockado em `src/setupTests.ts` como `MockIntersectionObserver`. Tests usam `mockObservers[i].trigger(true)`. |
| D-SPACE-A | Section unifica `py-16 md:py-24`. Education abandona `pb-only`. |
| D-PILL-A | Pill "Disponível para projetos" mantida em `text-xs`. |

---

## 3. Mudanças que divergem da letra da FRD

A FRD assumiu Geist Sans como default body face com Mono só para `code/pre/kbd/samp`. O autor mudou direção durante validação visual:

- **Geist Mono é agora o default global.** `:root { font-family }` em `app.css` e `theme.fontFamily.sans` no Tailwind apontam para Geist Mono Variable. Geist Sans deixou de carregar em runtime (woff2 não emitido).
- **Asimovian foi introduzida** como `fontFamily.display` (utilitário `font-display`). Aplicada **somente** em Hero `h1` (displayName) e Section `h2` (title). FRD não previa terceira família.
- **Reveal animations** subiram de 600ms/500ms (FRD §4.5) para 900ms/700ms; easing trocou de `cubic-bezier(0.16, 1, 0.3, 1)` (expo out) para `cubic-bezier(0.22, 0.61, 0.36, 1)` (ease-out-quart).
- **Geist Mono aplicada explicitamente** via `font-mono` nas datas (Experience/Education), badges (Skills/Experience stack) e CV version label (Hero) — redundante agora que tudo é mono por default, mas mantido como classe defensiva caso o default mude de novo.

Essas divergências **não estão refletidas** na FRD ou no blueprint. Se a próxima sub-branch precisar atualizar a documentação, fazer no merge final de M0 (`feat/m0-navbar`).

---

## 4. Bug latente que **foi corrigido nesta branch** mesmo não estando no escopo

Tailwind v3 com `darkMode: ["class"]` **purga** rules `.dark { ... }` quando esse seletor não aparece em nenhum arquivo escaneado pelo `content`. O baseline pré-M0 já tinha a paleta stone dentro de `@layer base { .dark { ... } }` e nunca foi testado em modo escuro — `.dark` block estava ausente do CSS construído.

Commit `3555d90` move os blocos `:root` e `.dark` para **fora** de `@layer base`. Tailwind não toca regras top-level. Confirmado:

```
build/client/assets/*.css     antes: grep -c "\.dark" → 0
build/client/assets/*.css     depois: grep -c "\.dark" → 1
```

Implicação para `feat/m0-theme`: quando o `ThemeProvider` adicionar `.dark` ao `<html>`, a paleta vai cascatar corretamente. Sem este fix, o toggle pareceria não funcionar.

---

## 5. Estado da árvore após merge

Pós-merge `feat/m0-visual` → `main`:

**Adicionados:**
- `src/lib/motion.tsx` (`useInView`, `<Reveal>`)
- `src/lib/motion.test.tsx` (8 testes, 100% coverage)
- `src/components/Section.tsx`
- `src/components/Section.test.tsx` (8 testes, 100% coverage)
- `docs/features/m0-infra/blueprint-m0-visual.md`
- `docs/features/m0-infra/handoff-m0-visual.md` (este arquivo)
- Dependências: `@fontsource-variable/geist`, `@fontsource-variable/geist-mono`, `@fontsource/asimovian`

**Modificados:**
- `src/app.css` — palette (slate+emerald), font imports (Geist+Asimovian), keyframes `mh-fade-*`, `prefers-reduced-motion`. Blocos `:root`/`.dark` **fora** de `@layer base`.
- `tailwind.config.js` — `fontFamily.sans/mono/display`, 9 tokens `fontSize`.
- `src/components/Hero.tsx` — tokens tipográficos + `font-display` no h1 + `tracking-widest` + `font-mono` no version label.
- `src/components/Skills.tsx` — wrap em `<Section>`, badges em `font-mono`.
- `src/components/Experience.tsx` — `<Section>` + datas mono + stack badges mono.
- `src/components/Education.tsx` — `<Section>` + datas mono.
- `src/components/Contact.tsx` — `<Section>` + alt-contact list em `text-body-sm`.
- `src/setupTests.ts` — `MockIntersectionObserver` + `mockObservers` array.

**Totalmente intactos (out-of-scope respeitado):**
- `src/root.tsx`, `src/routes/**`, `src/routes.ts`, `react-router.config.ts`
- `src/data/*.json`, `src/lib/period.ts`, `src/lib/validation.ts`, `src/lib/features.ts`, `src/lib/withBase.ts`, `src/lib/contactSubmit.ts`, `src/lib/cn.ts`
- `index.html`, `scripts/*`, todos os `e2e/*`
- `src/components/ui/**`, `src/components/ContactForm.tsx`
- `docs/spec.md`, `docs/scaffolding-state.md`, `AGENTS.md`

---

## 6. O que `feat/m0-theme` precisa saber

A Fase C da FRD entrega `ThemeProvider`, anti-FOUC inline script, `ThemeToggle`. Pontos relevantes deixados prontos:

1. **Paleta `.dark` já funciona** quando o toggle adicionar a classe ao `<html>`. Não precisa mexer em `app.css` palette.
2. **Geist Mono é default global** — se o agent quiser que `ThemeToggle` use Geist Sans para o label, terá que aplicar `font-sans` explicitamente. Mas `fontFamily.sans` no Tailwind também é Mono agora; talvez precise repensar.
3. **`lucide-react` está em `dependencies`** (state.md §2.3) — `Sun`/`Moon` icons disponíveis.
4. **Mock global de IntersectionObserver** em `setupTests.ts`. Se `ThemeProvider` quiser usar `matchMedia` em testes, vai precisar mockar `window.matchMedia` separado — não está pronto.
5. **Anti-FOUC script** (FRD §4.2) entra em `index.html`. `index.html` está intacto.
6. **Asimovian** carrega weight 400 só. Se `ThemeToggle` precisar de variante, vai puxar mais peso.

---

## 7. Merge e próximos passos

1. Revisar PR #9 visualmente.
2. Merge `--ff-only` (branch é fast-forwardable) ou squash.
3. Apagar `feat/m0-visual` local + remoto.
4. `git checkout main && git pull --ff-only`.
5. Cortar `feat/m0-theme` de `main`.
6. Próximo agent começa pela Fase C do FRD §11 (commits 11–14).

---

## 8. Histórico

| Versão | Data | Mudança |
|--------|------|---------|
| 0.1.0 | 2026-05-15 | Handoff inicial, branch pronta para merge. |
