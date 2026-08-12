---
owner: Anderson
version: v2.0
updated: 2026-08-11
status: ativo
tipo: pacote-de-contexto
alvo: Geração de SOP operacional — StackTrack
---

# Pacote de Contexto — Geração de SOP v2

> Pacote versionado que governa a geração de **qualquer** SOP do playbook.
> `v1` produziu SOPs que falharam no rubric (2/5). `v2` corrigiu o insumo
> — ver [[REV-SOPs-2026-08-11]].

## 1. Fontes rastreáveis

| Fonte | O que fornece |
|---|---|
| [[BRIEF-Sessao-Poker]] | AS-IS de 13 etapas, atores, handoffs, gargalos G1–G6 |
| [[DEC-001-arquitetura-cliente-web]] | Onde cada aceite acontece (celular do jogador, não do admin) |
| [[DEC-002-aceite-em-toda-movimentacao]] | Princípio: nenhuma movimentação de valor sem confirmação da contraparte |
| [[DEC-003-uma-mesa-por-sessao]] | Sessão = mesa; turnos sequenciais; dois timestamps |
| [[DEC-004-aceites-e-cadastro-de-dealer]] | Quais transações exigem aceite e quais não |
| [[DEC-005-dealer-global-entre-clubes]] | Dealer global; financeiro isolado por clube |
| [[template-sop]] | **Formato obrigatório de saída** |
| [[REV-SOPs-2026-08-11]] | Rubric e histórico de reprovação |

## 2. Resumo executivo do processo

Clube de pôquer com controle de fichas em papel, descartado ao fim da
sessão de ~10h. Toda sessão tem divergência sobre retirada de fichas.
Furo de caixa de R$ 300–1.000 em metade das sessões, sem atribuição
possível. O StackTrack registra cada movimentação com prova de aceite da
contraparte, e concilia o caixa continuamente pelo invariante
`Σ saldos = −rake`.

Os SOPs descrevem o estado **TO-BE** — o processo já com o sistema.

## 3. Restrições operacionais

| # | Restrição | Efeito no SOP |
|---|---|---|
| Pico | Vários jogadores pedem fichas ao mesmo tempo | Passos precisam funcionar sob concorrência, não em fila ideal |
| Duração | Sessão de 10h, ~15 recompras | Nenhum passo pode exigir cálculo mental ou memória |
| Atores sem login | Jogador e dealer acessam por link, não têm conta | O SOP precisa dizer **em qual dispositivo** cada passo ocorre |
| Contingência | Jogador sem celular ou sem internet | Todo SOP com aceite precisa de caminho alternativo **com justificativa registrada** |
| LGPD | CPF, assinatura e histórico financeiro | Consentimento no cadastro; nada de dado real em exemplo |

## 4. Critérios de aceitação (rubric)

O SOP só é aprovado com **5 de 5**:

| # | Critério | Regra |
|---|---|---|
| C1 | Passos numerados e sequenciais | Tabela numerada. Nunca checkbox solto — número precisa ser referenciável |
| C2 | Responsável **por passo** | Coluna própria. **Proibido herdar** o responsável do topo do documento |
| C3 | Critério de conclusão **por passo** | Coluna própria, verificável |
| C4 | Exceções e escalações | Seção `## Exceções` + árvore de decisão com bifurcações reais |
| C5 | Linguagem executável | Verbo de ação no início. "Lançar o valor", não "o valor é lançado" |

### Regras adicionais de conteúdo

- Passos de atores diferentes na mesma tabela é o **caso normal**
- Todo passo de aceite deve dizer **quem assina e em qual dispositivo**
- Procedimento não duplica passos de outro SOP — referencia com `[[link]]`
- Toda contingência exige justificativa registrada, nunca silenciosa

## 5. Formato de saída

Seguir [[template-sop]] literalmente: YAML de metadados, Objetivo,
Pré-requisitos, Gatilho, Responsáveis (elenco), Passos (tabela numerada),
Decisões, Critérios de aceitação, Exceções, Relacionado, Histórico.

## Histórico de rodadas

| Versão | O que mudou no insumo | Resultado no rubric |
|---|---|---|
| v1.0 | Template com passos em checkbox e responsável único no topo | **2/5** — reprovado nos 7 SOPs |
| v2.0 | Template com tabela numerada; responsável e critério **por passo**; proibição explícita de herdar responsável | **5/5** — 7 de 7 aprovados |

> A correção foi feita **apenas no insumo**. Nenhum texto de SOP foi
> editado à mão para passar no rubric — por isso o próximo SOP já nasce
> aprovado.

## Compliance do prompt

> ⚠️ Nenhum dado real de jogador ou dealer entra na geração. Nomes e
> valores em exemplos são fictícios.

## Changelog

| Versão | Data | O que mudou |
|---|---|---|
| v1.0 | 2026-08-11 | Contexto inicial (implícito no template) |
| v2.0 | 2026-08-11 | Formalizado como pacote; critérios C1–C3 endurecidos após reprovação no rubric |
