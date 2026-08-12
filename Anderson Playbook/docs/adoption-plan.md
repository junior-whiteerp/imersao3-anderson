---
tags: [adocao, treinamento, governanca, feedback, stacktrack]
owner: Anderson
versão: v1.0
data: 2026-08-11
data_revisao: 2026-11-11
gatilho_revisao: após cada sessão em modo sombra, ou trimestral
status: ativo
---

# Plano de Adoção — Playbook StackTrack

> Arquivo criado via terminal:
> ```bash
> $ touch docs/adoption-plan.md && echo 'Arquivo criado' && ls docs/
> Arquivo criado
> adoption-plan.md
> ```

---

## 1. Objetivo

O playbook cobre o **controle de fichas e débito/crédito de jogadores em
clube de pôquer** — da abertura da sessão à liquidação das contas, com
prova de aceite em cada movimentação de valor.

Os usuários finais são o **dono do clube** (decide e lança), o
**responsável pelas fichas** (executa as retiradas e devoluções) e os
**dealers freela** (retiram o rake e validam o valor entregue). Os
jogadores recebem link para aceite, sem instalar nada.

O resultado esperado após a adoção: **zerar o furo de caixa não
atribuído** (hoje R$ 300–1.000 em metade das sessões) e reduzir de 100%
para ≤ 5% as sessões com divergência não resolvida — mantendo o tempo de
atendimento por retirada igual ou melhor que o processo em papel.

---

## 2. Cronograma de Treinamento

| Semana | Atividade | Responsável | Participantes | Formato |
|---|---|---|---|---|
| **S1** | Apresentação do playbook: por que existe, o que muda, os números do próprio clube | Anderson | Dono do clube | Walk-through do vault + 3 casos reais · 90 min |
| **S2** | Sessão prática com casos reais: retirada, contingência, conferência de caixa | Anderson | Dono do clube + responsável pelas fichas | Simulação fora do horário de jogo · 45 min |
| **S3** | Onboarding do dealer: como validar o rake pelo link | Dono do clube | Dealers da sessão | Demonstração no primeiro turno · 5 min por dealer |
| **S4** | Revisão pós-adoção: o que o playbook não previa | Anderson | Dono + responsável pelas fichas | Retrospectiva após 2 sessões · 30 min |

**Material de campo:** do vault de 30 arquivos sai **um** artefato para a
mesa — cartão plastificado de 1 página com os 6 passos da retirada, o
limite de 3 contingências e quando chamar o dono.

> Regra: **se o SOP não é bom o suficiente para ensinar, não está pronto
> para implantar.** Teste na S2 — entregar o SOP sem explicar nada e
> contar as perguntas.

---

## 3. Papéis e Responsabilidades

| Papel | Pessoa | Obrigação principal |
|---|---|---|
| **Owner do Playbook** | Anderson | Mantém, versiona e atualiza o vault após cada sessão em modo sombra |
| **Facilitador de Treinamento** | Anderson (S1–S2) · Dono do clube (S3) | Conduz as sessões e mede quantas perguntas o executor faz |
| **Usuário Final — decisor** | Dono do clube | Executa os SOPs, define limites de crédito e decide as escalações N2 |
| **Usuário Final — executor** | Responsável pelas fichas | Executa retiradas, devoluções e contingências dentro dos limites |
| **Usuário Final — validador** | Dealer (freela, por sessão) | Valida o valor de rake entregue e confirma o recebimento do pagamento |

---

## 4. Canal de Feedback

| Item | Definição |
|---|---|
| **Onde reportar** | Grupo de WhatsApp "StackTrack — Operação", criado na S1. É onde o time já está — canal novo não é adotado |
| **Formato** | Mensagem livre. Anderson traduz para o vault. Exigir formulário mata o feedback |
| **SLA de resposta** | 24h para responder · 1 sessão para corrigir no playbook |
| **Quem faz a triagem** | Anderson. Cada feedback vira linha no plano de correção do [[relatorio-qa-v2]], com owner, prioridade e critério de aceitação |
| **Canal estruturado** | Retrospectiva de 15 min ao fim de **cada sessão**: "o que aconteceu que o playbook não previa?" |

> A retrospectiva pós-sessão é o canal principal. Ela está amarrada a um
> evento que **já vai acontecer** — o fim da noite de jogo. Feedback que
> depende de alguém lembrar de reportar não acontece.

---

## 5. Critérios de Sucesso

| # | Métrica | Baseline | Meta | Prazo |
|---|---|---|---|---|
| **C1** | Retiradas registradas no app ÷ total de retiradas | 0% | **100%** | até a 5ª sessão (~S10) |
| **C2** | Perguntas do executor por sessão | não medido | **≤ 2** | até a 3ª sessão (~S6) |
| **C3** | Furo de caixa não atribuído por sessão | R$ 300–1.000 em ~50% das sessões | **R$ 0** | em 3 sessões consecutivas |
| **C4** | Tempo médio da retirada de fichas | 3 min (papel) | **≤ 3 min** — não pode piorar | medido no modo sombra, S4 em diante |
| **C5** | Dealers usando validação de rake | 0% | **100%** | até a 4ª sessão (~S8) |

> **C2 é o critério mais honesto de adoção.** Se o executor continua
> perguntando na 5ª sessão, o playbook não foi adotado — foi imposto.
>
> **C4 é o critério de veto.** Se o app deixar a retirada mais lenta que
> o papel, o piloto falhou mesmo com o caixa fechando em zero. Numa mesa
> em horário de pico, atrito derruba adoção mais rápido que qualquer
> benefício a convence.

---

## Relacionado

- [[PLANO-Adocao-StackTrack]] · plano completo com rollout e governança
- [[BRIEF-Sessao-Poker]] · [[relatorio-qa-v2]] · [[MOC-StackTrack]]

## Histórico de versões

| Versão | Data | Mudança | Autor |
|---|---|---|---|
| v1.0 | 2026-08-11 | Versão inicial | Anderson |
