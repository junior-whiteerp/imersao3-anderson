---
owner: Anderson
version: v1.0
updated: 2026-08-11
status: ativo
---

# MOC — StackTrack

> Mapa de conteúdo do playbook operacional de clube de pôquer e da
> especificação do app StackTrack.
> Links **vermelhos** = documentação que ainda não existe (backlog visual).

## Contexto do negócio

- [[BRIEF-Sessao-Poker]] — ✅ briefing completo (v1.0) · AS-IS 13 etapas, 6 gargalos, TO-BE

## Decisões

- [[DEC-001-arquitetura-cliente-web]] — ✅ admin nativo + jogador via link web
- [[DEC-002-aceite-em-toda-movimentacao]] — ✅ nenhuma movimentação sem confirmação da contraparte
- [[DEC-003-uma-mesa-por-sessao]] — ✅ sessão = mesa; dealers em turnos sequenciais
- [[DEC-004-aceites-e-cadastro-de-dealer]] — ✅ D1 a D4 resolvidas · cadastro permanente, pagamento diferido com aceite
- [[DEC-005-dealer-global-entre-clubes]] — ✅ dealer global; identidade compartilhada, financeiro isolado por clube
- [[DEC-006-aceite-presencial-no-r1]] — ✅ (v1.4) aceite presencial na release 1 · **hipótese central confirmada pelo dono do processo** · **decisão com prazo de validade: cai no R2** · cadastro: nome + WhatsApp obrigatórios, CPF opcional

## Processos documentados

Todos em estado **TO-BE** (processo com StackTrack), derivados do briefing.
Status `rascunho` até validação no modo sombra.

| Processo | Status | Ver. | Owner | Executor na operação | Cobre |
|---|---|---|---|---|---|
| [[SOP-Retirada-de-Fichas]] | 🔄 rascunho | **v0.7** | Anderson | Resp. fichas | etapas 3–4 · G1, G2 · **aceite presencial (R1)** · identidade = **nome + WhatsApp** · sem WhatsApp não joga · **caminho de contingência** |
| [[SOP-Devolucao-e-Fechamento]] | 🔄 rascunho | v0.1 | Anderson | Resp. fichas | etapas 8–10 · G6 |
| [[SOP-Rake-e-Turno-do-Dealer]] | 🔄 rascunho | v0.1 | Anderson | Dono do clube | etapas 5–7, 12 · G3 |
| [[SOP-Conferencia-de-Caixa]] | 🔄 rascunho | **v0.2** | Anderson | Dono do clube | etapa 11 · G4 · **3 faixas de divergência no painel** · sem tela no mockup |
| [[SOP-Abertura-e-Encerramento-de-Sessao]] | 🔄 rascunho | v0.1 | Anderson | Dono do clube | etapas 1, 13 · G5 |
| [[SOP-Cobranca-de-Jogador-Devedor]] | 🔄 rascunho | v0.1 | Anderson | Dono do clube | **maior perda** · C1–C4 |
| [[SOP-Contingencia-de-Sistema]] | 🔄 rascunho | v0.1 | Anderson | Operador do caixa | **sistema fora do ar** · corrige F1 (crítico) do QA v2 |
| [[SOP-Pagamento-Diferido-ao-Dealer]] | 🔄 rascunho | v0.1 | Anderson | Dono do clube | contas a pagar |

> Os dois últimos são o **mesmo problema em direções opostas**: dívida
> que atravessa sessões, sem comprovante que sobreviva à noite.
> Contas a receber (jogador) e contas a pagar (dealer).

## Árvores de decisão

- [[ARV-Limites-de-Autoridade]] — ✅ **ativo** (v3.5) · 3 níveis de escalação com prazos · A1–A6 · **A6 (cadastro) é a única regra sem escalação** · B12, B14 e B15 resolvidos · **B11, B13 e B16 abertos**

## Revisões

- [[REV-SOPs-2026-08-11]] — ✅ v2.0 · rubric de **forma**: 2/5 → 5/5 nos 7 SOPs
- [[QA-Playbook-2026-08-11]] — 🔴 v1.0 · QA de **executabilidade**: **bloqueado** · 3 pendências antes de publicar
- [[checklist-confirmacao-r1]] — ✅ v1.5 · 11 perguntas para o dono do processo · corrige **F4** (crítico) do QA v2 · **2 fechadas (P4, P10) · 9 em aberto**

## Templates

- [[template-sop]] — modelo de procedimento
- [[template-checklist]] — modelo de checklist operacional
- [[template-decisao]] — modelo de registro de decisão

Convenção de nomenclatura, versionamento e como criar documento novo:
ver `README.md` na raiz do vault.

## Caso de negócio consolidado

### Perda financeira

| Fonte | Por sessão | Por clube/ano | Operação (2–3 clubes)/ano |
|---|---|---|---|
| **Furo de caixa não atribuído** | R$ 150–500 | R$ 3.600–12.000 | **R$ 7.200 – 36.000** |
| Inadimplência de jogador | R$ 0 | R$ 0 | R$ 0 |

> Correção registrada em 2026-08-11: a inadimplência foi inicialmente
> estimada em 10% e o dono do processo corrigiu para **0%** — todos
> pagam, define-se apenas prazo para o acerto. **O furo de caixa é a
> única perda financeira da operação.**

### Exposição sob controle informal

| Item | Volume | Risco |
|---|---|---|
| Crédito concedido a jogadores | R$ 12.000/mês por clube · ~R$ 144.000/ano | Recuperação de 100% **depende da memória e das relações do dono** |
| Limite de crédito por jogador | Varia por pessoa | Existe apenas na cabeça do dono |
| Acordos de prazo | A cada dívida | Combinados na conversa, sem comprovante |

⚠️ O produto nasceu para atacar o furo de caixa — e essa continua sendo
a única perda em dinheiro. A gestão de crédito não é problema de perda,
é de **escala**: o resultado atual é bom, mas não sobrevive ao
crescimento da operação nem à ausência do dono numa sessão.

## Cobertura dos gargalos

| Gargalo | SOP que trata |
|---|---|
| G1 — retirada sob concorrência | [[SOP-Retirada-de-Fichas]] |
| G2 — assinatura sem conferência | [[SOP-Retirada-de-Fichas]] |
| G3 — rake sem validação | [[SOP-Rake-e-Turno-do-Dealer]] |
| G4 — conferência tardia | [[SOP-Conferencia-de-Caixa]] |
| G5 — descarte do papel | [[SOP-Abertura-e-Encerramento-de-Sessao]] |
| G6 — soma manual | [[SOP-Devolucao-e-Fechamento]] |

**6 de 6 gargalos cobertos.**

## Pacotes de contexto

- [[PKG-Geracao-de-SOP-v2]] — ✅ v2.0 · governa a geração de todo SOP · v1 reprovou 2/5, v2 aprova 5/5
- [[PKG-Modelo-de-Dados-v1]] — ✅ v1.0 · 12 fontes, 10 critérios de aceitação

## Especificação do produto

- `docs/PRD.md` — ✅ **v1.6** · PRD do **Caixa Vivo**, a release 1 ·
  fora do vault, no repositório · 11 funcionalidades, 18 regras,
  23 critérios de aceitação · duas auditorias de consistência aplicadas

## Especificação técnica

- [[SPEC-Modelo-de-Dados-Supabase]] — 🔄 rascunho (v0.1) · 13 tabelas, 3 views, RLS · **gerado de [[PKG-Modelo-de-Dados-v1]]**
- [[SPEC-Telas-do-Admin]] — ⬜ mockup existe, falta conferência de caixa e ficha de crédito
- [[SPEC-Link-de-Aceite-do-Jogador]] — ⬜ token de uso único (RPC definida na SPEC do modelo)

## Lacunas conhecidas

- [x] ~~Aceite da devolução de fichas~~ · resolvido em [[DEC-004-aceites-e-cadastro-de-dealer]]
- [x] ~~Devolução parcial~~ · resolvido em [[DEC-004-aceites-e-cadastro-de-dealer]]
- [x] ~~Cadastro de dealer: permanente ou por sessão~~ · resolvido em [[DEC-004-aceites-e-cadastro-de-dealer]]
- [x] ~~Aceite do pagamento ao dealer~~ · resolvido em [[DEC-004-aceites-e-cadastro-de-dealer]]
- [x] ~~Tempos do AS-IS~~ · 4 confirmados; restantes marcados **(H)**
- [ ] **R5 (equipe) e R6 (orçamento)** registrados como **premissa (P)** — confirmar · perguntas P7 e P8 do [[checklist-confirmacao-r1]] · hipóteses H4 e H5 do PRD
- [x] ~~Cobrança de jogador devedor~~ · mapeado em [[SOP-Cobranca-de-Jogador-Devedor]]
- [x] ~~Pagamento diferido ao dealer~~ · mapeado em [[SOP-Pagamento-Diferido-ao-Dealer]]
- [ ] Validar tempos restantes **(H)** no modo sombra
- [ ] **Revisar escopo do MVP:** gestão de crédito era fase 2 e virou núcleo
- [ ] Rever o mockup: faltam conferência de caixa, ficha de crédito do jogador e histórico
- [ ] Nível 3 (Desafio) do exercício da Lição 3 — pendente na trilha do curso
