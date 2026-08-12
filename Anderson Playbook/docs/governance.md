---
tags: [governanca, raci, cadencia, feedback, stacktrack]
owner: Anderson
versão: v1.0
data: 2026-08-11
data_revisao: 2026-11-11
status: ativo
---

# Governança do Playbook StackTrack

Complementa [[adoption-plan]]. Garante que o playbook não envelheça.

---

## 1. Matriz RACI

**Papéis:** `AN` Anderson (owner do playbook) · `DC` Dono do clube ·
`RF` Responsável pelas fichas · `DL` Dealer

R = Responsável (executa) · A = Aprovador (decide) · C = Consultado · I = Informado

| # | Atividade | AN | DC | RF | DL |
|---|---|:--:|:--:|:--:|:--:|
| 1 | **Publicar nova versão de SOP** | **R** | **A** | C | I |
| 2 | **Treinar novo membro da operação** | C | **A** | **R** | I |
| 3 | **Responder e triar feedback** | **R** | **A** | C | C |
| 4 | **Auditar conformidade do caixa** (conferência da sessão) | C | **A** | **R** | I |
| 5 | **Alterar limite de crédito de jogador** | C | **A/R** | I | — |
| 6 | **Alterar regra da árvore de autoridade** | **R** | **A** | C | C |
| 7 | **Validar rake do turno** | I | C | I | **A/R** |
| 8 | **Ativar rollback do playbook** | **R** | **A** | C | I |

**Verificação de lacunas:** as 8 atividades têm exatamente **1 R e 1 A**.
Nas linhas 5 e 7, R e A coincidem por serem decisões de autoridade
própria — o dono define o limite que ele mesmo autoriza; o dealer valida
o próprio rake. Isso é intencional e está registrado em
[[ARV-Limites-de-Autoridade]].

> ⚠️ **Lacuna conhecida:** se o dono do clube e o responsável pelas fichas
> forem a **mesma pessoa** (falha D3 do [[relatorio-qa-v2]]), as linhas 2
> e 4 perdem a separação entre R e A. Resolver F4 antes de publicar.

---

## 2. Cadência de Revisão

| Item | Definição |
|---|---|
| **Frequência ordinária** | **Mensal** — coincide com ~2 sessões do clube |
| **Quem convoca** | Anderson (owner do playbook) |
| **Participantes** | Anderson + dono do clube. Responsável pelas fichas é consultado |
| **Duração** | 30 min |
| **Pergunta central** | "Cada SOP ainda reflete a realidade da mesa?" |
| **Onde ficam as decisões** | Changelog do artefato alterado (`Histórico de mudanças`) + linha no [[relatorio-qa-v2]] |

### Ritual complementar — pós-sessão

15 minutos ao fim de **cada sessão**: *"o que aconteceu que o playbook
não previa?"* Amarrado a evento que já vai acontecer, não a lembrete.

### Critérios de revisão extraordinária (quantitativos)

Qualquer um dispara revisão em até 48h, fora da cadência mensal:

| # | Gatilho | Limite |
|---|---|---|
| E1 | Furo de caixa não atribuído numa sessão | **> R$ 100** após validação de rake |
| E2 | Contingências de aceite numa sessão | **> 3** (teto de A2 estourado) |
| E3 | Perguntas do executor numa sessão | **> 5** a partir da 3ª sessão |
| E4 | Retiradas não registradas no app durante modo sombra | **> 5%** do total |
| E5 | Tempo médio da retirada | **> 3 min** (pior que o papel) |
| E6 | Incidente de segurança ou privacidade | **qualquer ocorrência** |

> E5 é o gatilho de veto: se o app ficar mais lento que o papel, revisar
> imediatamente — atrito derruba adoção mais rápido que benefício a
> convence.

---

## 3. Simulação de Feedback

Três feedbacks realistas após 2 semanas (≈2 sessões) de uso.

### FB-01 — "Não sei o que fazer quando o jogador só volta na semana seguinte"

**Quem:** responsável pelas fichas, após a 1ª sessão.
**Contexto:** jogador saiu devendo, combinou pagar na próxima sessão, e o
executor não soube se libera fichas quando ele voltar.

| Item | Definição |
|---|---|
| **Seção que muda** | [[ARV-Limites-de-Autoridade]] · A4 — jogador devedor querendo jogar |
| **O que muda** | A regra já existe ("acordo em dia → liberar até o limite") mas **não aparece no SOP que o executor lê**. Incluir a linha em [[SOP-Retirada-de-Fichas]], seção Decisões, com link para A4 |
| **Quem aprova** | Dono do clube (A na linha 6 da RACI) |
| **Rastreabilidade** | Mesma causa da falha **D2** do [[relatorio-qa-v2]] — regra que vive em um documento só |
| **Versão resultante** | `SOP-Retirada-de-Fichas` v0.1 → v0.2 |

### FB-02 — "O jogador reclamou que teve que assinar duas vezes na mesma retirada"

**Quem:** dono do clube, após a 2ª sessão.
**Contexto:** o link foi reenviado por falha de entrega e o jogador
recebeu dois pedidos de aceite para a mesma retirada.

| Item | Definição |
|---|---|
| **Seção que muda** | [[SPEC-Modelo-de-Dados-Supabase]] · tabela `tokens_aceite` |
| **O que muda** | Ao reenviar o link, **invalidar o token anterior** — um token ativo por movimentação. Adicionar índice único parcial em `tokens_aceite (movimentacao_id) where usado_em is null` |
| **Quem aprova** | Anderson (A na linha 1 da RACI, owner técnico) |
| **Rastreabilidade** | Caso de borda **não coberto** pela suíte atual. Vira caso T16 no [[relatorio-qa-v2]] |
| **Versão resultante** | `SPEC-Modelo-de-Dados-Supabase` v0.2 → v0.3 |

### FB-03 — "Perdi 10 minutos procurando como cadastrar jogador novo"

**Quem:** responsável pelas fichas, na 1ª sessão.
**Contexto:** primeiro jogador da noite era novo e o executor não achou o
procedimento.

| Item | Definição |
|---|---|
| **Seção que muda** | Estrutura do vault — mover o SOP de cadastro de `80-Experimentos/` para `10-SOPs/` e linkar no [[MOC-StackTrack]] |
| **O que muda** | Promover `SOP-Cadastro-de-Jogador` a procedimento oficial e adicionar link no passo 1 de [[SOP-Retirada-de-Fichas]] |
| **Quem aprova** | Anderson |
| **Rastreabilidade** | Confirma a falha **B1** do [[relatorio-qa-v2]] em condição real — previsão do QA validada em campo |
| **Versão resultante** | `MOC-StackTrack` v1.0 → v1.1 |

### Consolidação

| Feedback | Vira | Prioridade | Prazo |
|---|---|---|---|
| FB-01 | Correção F7 do [[relatorio-qa-v2]] | 🟠 Importante | próxima sessão |
| FB-02 | **Novo** — caso de borda não previsto | 🔴 Crítico | antes da próxima sessão |
| FB-03 | Correção F6 do [[relatorio-qa-v2]] | 🟠 Importante | próxima sessão |

> Dois dos três feedbacks **já estavam previstos** no plano de correção do
> QA. O terceiro (FB-02) é novo — e é o valor do canal de feedback:
> encontrar o que a suíte de testes não imaginou.

---

## Relacionado

- [[adoption-plan]] · [[PLANO-Adocao-StackTrack]] · [[relatorio-qa-v2]]
- [[ARV-Limites-de-Autoridade]] · [[SPEC-Modelo-de-Dados-Supabase]] · [[MOC-StackTrack]]

## Histórico de versões

| Versão | Data | Mudança | Autor |
|---|---|---|---|
| v1.0 | 2026-08-11 | Versão inicial: RACI de 8 atividades, cadência com 6 gatilhos extraordinários, 3 feedbacks simulados | Anderson |
