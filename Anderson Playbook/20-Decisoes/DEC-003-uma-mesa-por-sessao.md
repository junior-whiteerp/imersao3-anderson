---
owner: Anderson
version: v1.0
updated: 2026-08-11
status: decidido
---

# DEC-003 — Uma mesa por sessão; dealers em turnos sequenciais

## Contexto

Ficou em aberto se o clube opera mesas simultâneas e se o percentual do
dealer varia por pessoa. As duas respostas mudam bastante o modelo de
dados.

## Decisão

- **Uma mesa por sessão.** Sessão e mesa são a mesma coisa.
- **Dealers se revezam** na mesma mesa: um ativo por vez, turnos
  sequenciais sem sobreposição.
- **Percentual do rake é igual para todos** os dealers do clube.

## Motivo

Reflete a operação real do clube de referência. Não há motivo para
modelar concorrência que não existe — complexidade especulativa atrasa
o piloto sem reduzir risco.

## Consequências

- `mesa` **não** vira entidade: a sessão é a unidade.
- `turnos_dealer` é uma sequência simples, sem sobreposição — validável
  por constraint.
- Percentual do dealer é **configuração do clube** (um campo), não do
  dealer.
- ⚠️ `hora_retirada` (quando o rake saiu da mesa) e `hora_lancamento`
  (quando entrou no sistema) são campos **distintos**. A atribuição ao
  turno usa `hora_retirada` — senão, na troca de turno, o dealer errado
  é remunerado.

## Relacionado

- [[BRIEF-Sessao-Poker]]
- [[DEC-002-aceite-em-toda-movimentacao]]
- [[MOC-StackTrack]]
