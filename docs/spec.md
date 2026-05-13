# Portfolio — Spec Document
**Versão:** 0.1.0  
**Autor:** Marco Aurelio Hansen de Oliveira  
**Status:** Draft — em revisão

---

## 1. Visão Geral

Portfolio pessoal de Marco Hansen — desenvolvedor Frontend e instrutor de tecnologia.

O projeto tem **três públicos simultâneos** com necessidades distintas, e deve atendê-los sem comprometer a experiência de nenhum. A premissa técnica central é: **spec primeiro, testes antes do código, UI como consequência**.

---

## 2. Personas

### P1 — Recrutador / HR
**Contexto:** Analisa múltiplos candidatos por dia, tem menos de 2 minutos por perfil.

**Objetivo primário:** Validar fit técnico rapidamente.

**Critérios de sucesso:**
- Encontrar stack técnica em menos de 10 segundos
- Ver projetos reais com descrição do impacto
- Ter acesso fácil a CV e contato

---

### P2 — Cliente Freelance
**Contexto:** Procura dev para projeto específico; quer saber se Marco já resolveu problemas parecidos.

**Objetivo primário:** Avaliar experiência relevante ao problema dele.

**Critérios de sucesso:**
- Filtrar projetos por tipo ou tecnologia
- Ver evidências de qualidade (testes, CI/CD, metodologia)
- Conseguir iniciar contato com contexto

---

### P3 — Aluno / Estudante de Tech
**Contexto:** Está aprendendo, foi indicado por Marco ou encontrou o portfolio como referência.

**Objetivo primário:** Aprender com o trabalho e a trajetória de Marco.

**Critérios de sucesso:**
- Entender as escolhas técnicas (não só o resultado)
- Ver que qualidade de código é parte do portfolio
- Ter referências de como um dev experiente estrutura projetos

---

## 3. Módulos Funcionais

### M1 — Hero / Apresentação

**Descrição:** Primeira impressão. Identidade, cargo e call-to-action imediato.

**Requisitos funcionais:**
- RF-M1-01: Exibir nome completo, cargo e tagline
- RF-M1-02: Exibir links para GitHub e LinkedIn
- RF-M1-03: Exibir botão de download do CV (PDF)
- RF-M1-04: Exibir link para seção de contato

**Regras de negócio:**
- RN-M1-01: O cargo exibido deve sempre refletir o estado atual (não pode ser hardcoded de forma que fique desatualizado sem perceber)
- RN-M1-02: O CV para download deve ter data de versão visível no arquivo

---

### M2 — Projetos

**Descrição:** Vitrine dos trabalhos. Coração do portfolio.

**Requisitos funcionais:**
- RF-M2-01: Listar projetos com título, descrição curta, tecnologias e status
- RF-M2-02: Permitir filtro por tecnologia (ex: React, TypeScript, Next.js)
- RF-M2-03: Permitir filtro por categoria (ex: Freelance, Trabalho, Open Source, Ensino)
- RF-M2-04: Exibir página/modal de detalhe do projeto com descrição expandida
- RF-M2-05: Exibir link para repositório e/ou demo quando disponível
- RF-M2-06: Indicar visualmente projetos em destaque (featured)

**Regras de negócio:**
- RN-M2-01: Um projeto deve ter no mínimo: título, descrição, pelo menos uma tecnologia e uma categoria
- RN-M2-02: Projetos com `confidential: true` não exibem link de repositório
- RN-M2-03: Filtros são cumulativos dentro da mesma dimensão (OR) e restritivos entre dimensões (AND)
  - Exemplo: "React" OR "TypeScript" AND categoria "Freelance"
- RN-M2-04: Quando nenhum projeto corresponde ao filtro ativo, exibir estado vazio com mensagem
- RN-M2-05: A ordenação padrão é: featured primeiro, depois por data decrescente
- RN-M2-06: Projetos com `status: "em andamento"` devem ser identificados visualmente

**Casos de teste derivados das regras:**
- CT-M2-01: Dado filtro "React" + categoria "Freelance", retorna interseção correta
- CT-M2-02: Dado projeto confidencial, link de repositório não é renderizado
- CT-M2-03: Dado nenhum projeto com tecnologia "Vue", exibe estado vazio
- CT-M2-04: Dado lista com featured e não-featured, featured aparece primeiro
- CT-M2-05: Dado projeto sem título, deve falhar validação na camada de dados

---

### M3 — Habilidades / Stack

**Descrição:** Mapa de competências técnicas e pedagógicas.

**Requisitos funcionais:**
- RF-M3-01: Exibir habilidades técnicas agrupadas por categoria
- RF-M3-02: Exibir habilidades pedagógicas como grupo separado
- RF-M3-03: Exibir nível de experiência por habilidade (se aplicável)

**Regras de negócio:**
- RN-M3-01: Categorias válidas para habilidades técnicas: `frontend`, `tools`, `backend`, `practices`
- RN-M3-02: Uma habilidade não pode pertencer a mais de uma categoria

---

### M4 — Experiência / Trajetória

**Descrição:** Timeline profissional que conta a história de Marco.

**Requisitos funcionais:**
- RF-M4-01: Exibir experiências em ordem cronológica decrescente
- RF-M4-02: Cada experiência exibe: empresa, cargo, período, descrição, stack
- RF-M4-03: Exibir educação como seção separada

**Regras de negócio:**
- RN-M4-01: Experiências sem data de fim são consideradas "Presente" e ficam no topo
- RN-M4-02: O período deve ser exibido de forma humanizada (ex: "Mai 2023 — Presente")
- RN-M4-03: Uma experiência deve ter no mínimo empresa, cargo e data de início

---

### M5 — Contato

**Descrição:** Canal de comunicação direto com Marco.

**Requisitos funcionais:**
- RF-M5-01: Exibir formulário com campos: nome, e-mail, assunto, mensagem
- RF-M5-02: Validar campos antes do envio
- RF-M5-03: Exibir feedback de sucesso ou erro após envio
- RF-M5-04: Exibir links alternativos de contato (e-mail direto, LinkedIn)

**Regras de negócio:**
- RN-M5-01: E-mail deve ser válido (formato padrão RFC 5322 simplificado)
- RN-M5-02: Mensagem deve ter entre 10 e 1000 caracteres
- RN-M5-03: Nome deve ter entre 2 e 100 caracteres
- RN-M5-04: Assunto deve ter entre 3 e 150 caracteres
- RN-M5-05: O formulário deve ser desabilitado durante o envio (evitar submit duplo)
- RN-M5-06: Em caso de erro de envio, os dados preenchidos não devem ser perdidos

**Casos de teste derivados das regras:**
- CT-M5-01: Dado e-mail "marco@", deve retornar erro de validação
- CT-M5-02: Dado mensagem com 9 caracteres, deve retornar erro de validação
- CT-M5-03: Dado mensagem com 1001 caracteres, deve retornar erro de validação
- CT-M5-04: Dado formulário em estado "enviando", botão de submit está desabilitado
- CT-M5-05: Dado erro no envio, campos mantêm seus valores

---

## 4. Modelo de Dados

> ⚠️ ADR-01 resolvida: fonte dos dados → JSON local em `src/data/`.

```typescript
type Project = {
  id: string
  title: string                         // obrigatório
  shortDescription: string              // obrigatório, max 160 chars
  fullDescription: string               // obrigatório
  technologies: string[]                // obrigatório, min 1
  category: ProjectCategory             // obrigatório
  status: 'concluido' | 'em-andamento'  // obrigatório
  featured: boolean
  confidential: boolean
  repositoryUrl?: string                // ausente se confidential
  demoUrl?: string
  startDate: string                     // ISO 8601
  endDate?: string                      // ausente se em andamento
}

type ProjectCategory = 'trabalho' | 'freelance' | 'open-source' | 'ensino'

type Skill = {
  name: string                          // obrigatório
  category: SkillCategory               // obrigatório
}

type SkillCategory = 'frontend' | 'tools' | 'backend' | 'practices' | 'pedagogical'

type Experience = {
  company: string                       // obrigatório
  role: string                          // obrigatório
  startDate: string                     // obrigatório, ISO 8601
  endDate?: string                      // ausente = Presente
  description: string                   // obrigatório
  stack: string[]
}

type ContactForm = {
  name: string        // min 2, max 100
  email: string       // formato válido
  subject: string     // min 3, max 150
  message: string     // min 10, max 1000
}
```

---

## 5. Fora do Escopo (v1)

- Blog / artigos (pode ser v2)
- Modo escuro/claro toggle (pode ser v2; CSS adapta ao sistema)
- Internacionalização PT/EN (pode ser v2)
- Analytics de visitantes
- Autenticação / área admin
- Comentários em projetos
- Integração automática com GitHub API (pode ser v2)

---

## 6. Decisões em Aberto (ADRs)

| # | Decisão | Status | Resolução |
|---|---------|--------|-----------|
| ADR-01 | Fonte dos dados dos projetos | ✅ Resolvida | JSON local em `src/data/` |
| ADR-02 | Estratégia de roteamento | ✅ Resolvida | React Router v7 |
| ADR-03 | Hospedagem | ✅ Resolvida | GitHub Pages |
| ADR-04 | Envio do formulário de contato | ✅ Resolvida | EmailJS |
| ADR-05 | Estilização | ✅ Resolvida | Tailwind CSS v3 + shadcn/ui |

---

## 7. Stack Definida

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Core | React 19 | Explorar novos recursos (Actions, use()) |
| Linguagem | TypeScript (strict) | Tipagem do modelo de dados + DX |
| Build | Vite | Padrão ecossistema React sem framework |
| Testes unitários | Vitest | Integra com Vite, já no currículo |
| Testes de componente | React Testing Library | Standard da indústria |
| Estilização | Tailwind CSS v3 | Maturidade + compatibilidade com shadcn |
| Componentes base | shadcn/ui | Acessibilidade pronta + customizável |
| Roteamento | React Router v7 | Standard do ecossistema React |
| Formulário | EmailJS | Backend-less, simples de configurar |

---

## 8. Constraints de Desenvolvimento

- **Idioma do código:** Todo o código, comentários, nomes de variáveis, funções e componentes em inglês
- **Commits:** Mensagens de commit em inglês (ex: `feat: add project filter logic`)
- **Artefatos de doc** (`docs/`): podem ser em português — são artefatos de processo, não de código

---

## 10. Critérios de Aceite Gerais

- CA-01: O projeto passa em todos os testes unitários e de componente antes de qualquer merge
- CA-02: Nenhum componente de UI existe sem contrato de tipo (TypeScript strict)
- CA-03: As regras de negócio dos módulos M2 e M5 têm 100% de cobertura de testes
- CA-04: Acessibilidade: todos os elementos interativos são acessíveis por teclado
- CA-05: O build de produção não contém erros de TypeScript

---

## 11. Próximos Passos

1. **Scaffolding** — concluído ✅ (ver `docs/scaffolding-specification.md`)
2. **M1 — Hero** — presentacional, entrega visual imediata
3. **M3 — Skills** — simples, só exibição agrupada
4. **M4 — Experiência** — timeline, poucas regras
5. **M5 — Contato** — validações bem definidas, fecha o site "funcional"
6. **Deploy** — publicar no GitHub Pages com CI verde
7. **M2 — Projetos** — módulo mais rico em regras, TDD com base estável