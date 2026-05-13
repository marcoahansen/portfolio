# FRD — M1: Hero / Apresentação

**Versão:** 0.1.0
**Status:** Draft — pronto para implementação
**Spec de origem:** `docs/spec.md` §3 M1
**Documentos relacionados:** `docs/scaffolding-state.md`, `AGENTS.md`

> Este FRD refina a spec do Módulo 1 em um contrato implementável. Decisões abertas na spec foram fechadas em sessão de brainstorming em 2026-05-13. Qualquer divergência futura desta especificação requer atualização aqui antes do código.

---

## 1. Visão geral

O Hero é a primeira impressão do portfolio. Atende as três personas em segundos:

- **P1 (Recrutador):** valida nome, cargo e baixa o CV em <10s.
- **P2 (Cliente freelance):** vê tagline e tem link direto pra contato.
- **P3 (Aluno):** entende quem é Marco e tem acesso a GitHub/LinkedIn.

CTA primário: **Download do CV**. CTAs secundários: Contato (gated por flag), GitHub, LinkedIn.

---

## 2. Escopo

### 2.1 Dentro

- Seção Hero em `/` (`src/routes/_index.tsx` reescrito).
- Componente `src/components/Hero.tsx` compondo shadcn primitives.
- Tipo `Hero` em `src/types/domain.ts`.
- Schema `heroSchema` em `src/lib/validation.ts`.
- Dados em `src/data/hero.json`.
- Flags estáticas em `src/lib/features.ts`.
- Slot do CV em `public/cv/<file>.pdf`.
- Slot do avatar em `public/avatar.webp`.
- Meta tags da rota `/` derivadas de hero.json.
- Smooth scroll global em `src/app.css`.
- Asset-check script em `scripts/check-assets.ts` (rodado em `prebuild`).
- Testes: unitários (validation + features), componente (RTL + vitest-axe), e2e smoke (estende `e2e/home.spec.ts`).

### 2.2 Fora (deste módulo)

- Seções Skills, Experience, Projects, Contact (módulos M2..M5).
- Nav header + skip-link.
- Toggle de tema.
- Internacionalização.
- Headshot real e PDF de CV reais (assets entram antes do merge, fora deste FRD).

---

## 3. Decisões de design

### 3.1 Fonte de dados

`src/data/hero.json` validado em boot por `heroSchema` (Zod). Padrão idêntico a projects/skills/experiences. Garante:

- Uma única fonte de verdade (cumpre RN-M1-01).
- Falha-rápido se a forma do JSON divergir.
- Permite mudar o cargo sem editar JSX.

### 3.2 Versionamento do CV

A data fica em **dois lugares visíveis**:

1. **Filename:** `public/cv/marco-hansen-cv-YYYY-MM.pdf` (ex: `marco-hansen-cv-2026-05.pdf`).
2. **Label do botão:** `Download CV (mai/2026)`.

O label vem do campo `cv.versionLabel` em `hero.json`. Trocar o CV vira: substituir o PDF e atualizar duas strings em um JSON (`fileName` + `versionLabel`).

### 3.3 Hierarquia de CTAs

| Ordem | CTA | Variante | Quando aparece |
|-------|-----|----------|---------------|
| 1 | Download CV | `Button` default | Sempre (CA-M1-07 garante o asset) |
| 2 | Falar comigo (`/#contact`) | `Button` outline | Iff `FEATURES.contact === true` |
| 3 | Ver projetos (`/projects`) | text link | Iff `FEATURES.projects === true` |
| 4 | GitHub | icon-button | Sempre |
| 5 | LinkedIn | icon-button | Sempre |

### 3.4 Layout

**Desktop (`md+`, ~768px+):** grid 3 colunas. Coluna esquerda (col-span-2) com texto + CTAs. Coluna direita (col-span-1) com avatar quadrado `~320px`. `min-h-screen`, conteúdo vertical-centered.

**Mobile (< md):** stack. Avatar (~160px circle) → headline → role → tagline → CTAs full-width → social icons inline. Padding `py-16`.

ASCII (desktop):

```
+----------------------------------------------+
| Marco Hansen                                 |
| Desenvolvedor Frontend &        +----------+ |
| Instrutor de Tecnologia         |          | |
|                                 |  AVATAR  | |
| <tagline em 1-2 frases>         |  ~320px  | |
|                                 |          | |
| [Download CV (mai/2026)]        +----------+ |
| [Falar comigo]*                              |
| Ver projetos →*                              |
|                                              |
| (gh) (li)                                    |
+----------------------------------------------+
* gated por feature flag
```

### 3.5 Feature flags

`src/lib/features.ts` exporta:

```typescript
export const FEATURES = {
  hero: true,
  skills: false,
  experience: false,
  projects: false,
  contact: false,
} as const

export type FeatureName = keyof typeof FEATURES
```

Cada módulo flipa sua própria flag no PR que o entrega. Hero consome o objeto direto. Quando a flag está `false`, a CTA correspondente **não é renderizada** (não é só `display:none`).

### 3.6 Links externos

`target="_blank"` + `rel="noopener noreferrer"`. Aplicado em GitHub e LinkedIn.

### 3.7 Acessibilidade

- h1 = `displayName`.
- Cada link/botão acessível por teclado, com `focus-visible` ring (default do Tailwind).
- Avatar com `alt` populado de `hero.avatar.alt`.
- Social icons com `aria-label` contendo o handle (`"GitHub: marcohansen"`).
- Botão CV é `<a download>` com texto visível, não icon-only.
- `prefers-reduced-motion` é respeitado pelo browser via `scroll-behavior: smooth`.
- Specs do componente passam `expect(await axe(container)).toHaveNoViolations()`.

---

## 4. Modelo de dados

### 4.1 Tipo (adicionar em `src/types/domain.ts`)

```typescript
export type Hero = {
  fullName: string         // nome completo legal
  displayName: string      // nome exibido no h1
  role: string             // cargo + papel pedagógico
  tagline: string          // 1-2 frases de valor
  github: { url: string; handle: string }
  linkedin: { url: string; handle: string }
  cv: { fileName: string; versionLabel: string }
  avatar: { src: string; alt: string }
}
```

### 4.2 Schema (adicionar em `src/lib/validation.ts`)

```typescript
const heroSchema = z.object({
  fullName: z.string().min(2).max(100),
  displayName: z.string().min(2).max(60),
  role: z.string().min(3).max(120),
  tagline: z.string().min(10).max(200),
  github: z.object({
    url: z.string().url().startsWith("https://github.com/"),
    handle: z.string().min(1),
  }),
  linkedin: z.object({
    url: z.string().url().startsWith("https://www.linkedin.com/"),
    handle: z.string().min(1),
  }),
  cv: z.object({
    fileName: z.string().regex(/^[a-z0-9-]+\.pdf$/),
    versionLabel: z.string().regex(/^[a-z]{3}\/\d{4}$/),
  }),
  avatar: z.object({
    src: z.string().startsWith("/"),
    alt: z.string().min(3),
  }),
})
```

### 4.3 Placeholder inicial de `hero.json`

```json
{
  "fullName": "Marco Aurelio Hansen de Oliveira",
  "displayName": "Marco Hansen",
  "role": "Desenvolvedor Frontend & Instrutor de Tecnologia",
  "tagline": "Construo interfaces robustas com TDD e ajudo devs em formação a fazerem o mesmo.",
  "github": { "url": "https://github.com/marcohansen", "handle": "marcohansen" },
  "linkedin": {
    "url": "https://www.linkedin.com/in/marco-hansen/",
    "handle": "marco-hansen"
  },
  "cv": {
    "fileName": "marco-hansen-cv-2026-05.pdf",
    "versionLabel": "mai/2026"
  },
  "avatar": { "src": "/avatar.webp", "alt": "Foto de Marco Hansen" }
}
```

> Valores são placeholders. Substituir pelos reais quando implementar M1.

---

## 5. Requisitos funcionais (refinam spec §3 M1)

| ID | Origem | Refinamento |
|----|--------|-------------|
| RF-M1-01 | spec | Renderizar `displayName`, `role` e `tagline` lidos de `hero.json`. |
| RF-M1-02 | spec | Renderizar links GitHub e LinkedIn como icon-buttons com `target="_blank"` + `rel="noopener noreferrer"`. |
| RF-M1-03 | spec | Botão `<a href="/cv/{fileName}" download>` com label `Download CV ({versionLabel})`. |
| RF-M1-04 | spec | Link âncora `/#contact` com label "Falar comigo". **Renderizado apenas se `FEATURES.contact === true`.** |
| RF-M1-05 | novo | Renderizar `<img>` de avatar à direita do texto em `md+`, e acima do texto em `<md`. |
| RF-M1-06 | novo | Função `meta()` da rota `/` retorna `title = "{displayName} — {role}"` e `description = tagline`. |
| RF-M1-07 | novo | Link text "Ver projetos →" para `/projects`. Renderizado apenas se `FEATURES.projects === true`. |

---

## 6. Regras de negócio

| ID | Regra |
|----|-------|
| RN-M1-01 | `role` é lido exclusivamente de `hero.json`. Hardcoded em JSX é regressão. |
| RN-M1-02 | Filename do CV contém ano-mês; `versionLabel` aparece no botão. |
| RN-M1-03 | `hero.json` é validado por Zod no boot da aplicação. Falha lança e impede render — não há UI quebrada. |
| RN-M1-04 | `cv.fileName` DEVE existir em `public/cv/` no momento do build. Garantido por `scripts/check-assets.ts`. |
| RN-M1-05 | `avatar.src` DEVE existir em `public/` no momento do build. Mesma guard. |
| RN-M1-06 | Ordem visual de CTAs: 1º Download CV, 2º Falar comigo\*, 3º Ver projetos\*, 4º GitHub, 5º LinkedIn. (\*condicional a flag.) |
| RN-M1-07 | Hero usa `min-h-screen` em `md+` e altura automática abaixo. Conteúdo vertical-centered no breakpoint maior. |
| RN-M1-08 | `FEATURES.contact === false` suprime RF-M1-04 do DOM (ausência total, não `display:none`). Documentado como desvio condicional da spec. |
| RN-M1-09 | `FEATURES.projects === false` suprime RF-M1-07 do DOM. |

---

## 7. Critérios de aceite

| ID | Critério |
|----|----------|
| CA-M1-01 | Hero exibe displayName, role, tagline, botão CV (com versionLabel), GitHub e LinkedIn lidos de `hero.json`. |
| CA-M1-02 | Quando `FEATURES.contact === true`, "Falar comigo" renderiza com `href="/#contact"`. Quando `false`, elemento ausente do DOM. |
| CA-M1-03 | Clicar no botão CV dispara download do arquivo em `public/cv/`. |
| CA-M1-04 | GitHub e LinkedIn abrem em nova aba com `rel="noopener noreferrer"`. |
| CA-M1-05 | `pnpm test:run` passa com axe sem violações nos cenários de componente. |
| CA-M1-06 | `heroSchema` rejeita todos os payloads inválidos listados em §8.1. |
| CA-M1-07 | Build falha se `cv.fileName` ou `avatar.src` ausente em `public/`. |
| CA-M1-08 | `meta()` em `/` emite `<title>` derivado de hero data. |
| CA-M1-09 | `e2e/home.spec.ts` valida h1, link de CV e link externo GitHub. |
| CA-M1-10 | Hero ocupa `min-h-screen` em viewport `md+`. |
| CA-M1-11 | Cobertura: 100% em `validation.ts` (gate herdado de CA-03). |

---

## 8. Plano de testes

### 8.1 Casos da `heroSchema` (em `src/lib/validation.test.ts`)

| ID | Cenário | Esperado |
|----|---------|----------|
| CT-M1-01 | payload completo válido | parse OK |
| CT-M1-02 | `fullName` ausente | falha |
| CT-M1-03 | `displayName` com 1 char | falha |
| CT-M1-04 | `role` com 121 chars | falha |
| CT-M1-05 | `tagline` com 9 chars | falha |
| CT-M1-06 | `github.url` não é URL | falha |
| CT-M1-07 | `github.url` não começa com `https://github.com/` | falha |
| CT-M1-08 | `linkedin.url` não começa com `https://www.linkedin.com/` | falha |
| CT-M1-09 | `cv.fileName` sem `.pdf` | falha |
| CT-M1-10 | `cv.versionLabel` em formato inválido (ex: `2026-05`) | falha |
| CT-M1-11 | `avatar.src` não inicia com `/` | falha |
| CT-M1-12 | `avatar.alt` com 2 chars | falha |

### 8.2 Componente Hero (`src/components/Hero.test.tsx`)

- Renderiza `displayName` em `h1`.
- Renderiza `role`.
- Renderiza `tagline`.
- Botão CV tem `href="/cv/{fileName}"` e atributo `download`.
- Label do botão CV contém `versionLabel`.
- Link GitHub tem `target="_blank"`, `rel` contém `"noopener"` e `"noreferrer"`, `aria-label` contém o handle.
- Link LinkedIn idem.
- Com `features.contact = true` mockado: âncora "Falar comigo" presente com `href="/#contact"`.
- Com `features.contact = false`: âncora ausente.
- Com `features.projects = true`: link "Ver projetos" presente com `href="/projects"`.
- Com `features.projects = false`: link ausente.
- Avatar `<img>` com alt vindo dos dados.
- `axe(container)` sem violações nos dois branches de flag.

### 8.3 E2E (estende `e2e/home.spec.ts`)

```typescript
test("home hero renderiza nome, role e CTA de CV", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Marco")
  await expect(page.getByRole("link", { name: /Download CV/ })).toHaveAttribute(
    "href",
    /^\/cv\/.+\.pdf$/,
  )
  const gh = page.getByRole("link", { name: /GitHub/ })
  await expect(gh).toHaveAttribute("target", "_blank")
  await expect(gh).toHaveAttribute("rel", /noopener/)
})
```

### 8.4 Guard de assets (build-time)

`scripts/check-assets.ts`:

1. Lê e valida `src/data/hero.json` via `heroSchema`.
2. Confere `fs.existsSync("public/cv/" + hero.cv.fileName)`.
3. Confere `fs.existsSync("public" + hero.avatar.src)`.
4. Imprime erro humanizado e `process.exit(1)` em falha.

Wire no `package.json`:

```json
{
  "scripts": {
    "prebuild": "tsx scripts/check-assets.ts",
    "build": "react-router build"
  }
}
```

`tsx` é leve; pode ser substituído por `node --import tsx` se já estiver disponível. Se não, alternativa: usar Node + import dinâmico do JSON + checagem manual sem reusar Zod (mais simples mas duplica validação).

---

## 9. Arquivos a criar / modificar

| Caminho | Tipo | Notas |
|---------|------|-------|
| `src/types/domain.ts` | modificar | + tipo `Hero`. |
| `src/lib/validation.ts` | modificar | + `heroSchema`, + helper `validateHero`. |
| `src/lib/validation.test.ts` | modificar | + casos CT-M1-01..12. |
| `src/lib/features.ts` | criar | `FEATURES` const + tipo. |
| `src/data/hero.json` | criar | Seed com placeholders. |
| `src/components/Hero.tsx` | criar | Componente da seção. |
| `src/components/Hero.test.tsx` | criar | RTL + vitest-axe. |
| `src/routes/_index.tsx` | modificar | Importa hero, valida, renderiza `<Hero/>`, exporta `meta()`. |
| `src/app.css` | modificar | `html { scroll-behavior: smooth; }`. |
| `public/cv/marco-hansen-cv-2026-05.pdf` | adicionar | Asset real (substitui `.gitkeep` quando entrar). |
| `public/avatar.webp` | adicionar | Asset real. |
| `e2e/home.spec.ts` | modificar | Expandir asserts conforme §8.3. |
| `scripts/check-assets.ts` | criar | Guard de build. |
| `package.json` | modificar | Adicionar `prebuild`; talvez adicionar `tsx` em devDependencies. |
| `docs/spec.md` | modificar | Anotar refinamentos: RF-M1-05/06/07, RN-M1-03..09, deviation note (M1 RF-M1-04 e RF-M1-07 gated por feature flag). |
| `docs/features/m1-hero/frd-m1-hero.md` | criar | Este documento. |

---

## 10. Ordem de implementação (TDD)

1. **Types** — adicionar `Hero` em `src/types/domain.ts`.
2. **Schema (RED)** — escrever CT-M1-01..12 em `validation.test.ts`. Rodar — vermelho.
3. **Schema (GREEN)** — implementar `heroSchema` + `validateHero`.
4. **Seed** — `src/data/hero.json` com placeholders que passam no schema.
5. **Features** — `src/lib/features.ts` (e teste leve opcional).
6. **Componente (RED)** — `Hero.test.tsx` com casos do §8.2.
7. **Componente (GREEN)** — `Hero.tsx` consumindo hero data + features.
8. **Rota** — `routes/_index.tsx` puxa hero (via `validateHero`), renderiza `<Hero/>`, exporta `meta()`.
9. **Smooth scroll** — `app.css`.
10. **Assets guard** — `scripts/check-assets.ts` + wire em `prebuild`.
11. **E2E** — atualizar `e2e/home.spec.ts`.
12. **Spec sync** — atualizar `docs/spec.md` §3 M1.
13. **Commits** Conventional, um logical change por commit.

---

## 11. Itens em aberto (não-bloqueantes do FRD)

| Item | Quem resolve | Quando |
|------|--------------|--------|
| Copy real (`displayName`, `role`, `tagline`) | Marco | Antes de merge do M1 |
| Foto real `public/avatar.webp` (~512x512, ≤80kb) | Marco | Antes de merge do M1 |
| PDF real `public/cv/marco-hansen-cv-2026-05.pdf` | Marco | Antes de merge do M1 |
| URL e handle real do GitHub + LinkedIn | Marco | Antes de merge do M1 |
| Skip-link semântico | Quando nav-header existir | Pós-M1 |

---

## 12. Histórico

| Versão | Data | Mudança |
|--------|------|---------|
| 0.1.0 | 2026-05-13 | FRD inicial, derivado da sessão de brainstorm sobre `docs/spec.md` §3 M1. |
