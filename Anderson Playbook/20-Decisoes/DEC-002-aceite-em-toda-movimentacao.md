---
owner: Anderson
version: v1.0
updated: 2026-08-11
status: decidido
---

# DEC-002 — Nenhuma movimentação de valor sem aceite da contraparte

## Contexto

O mapeamento revelou que o rake era a única movimentação sem prova:
o dealer retira do pote, entrega ao dono, o dono lança no sistema —
e ninguém confirma o valor entregue.

Isso ganhou peso quando ficou definido que **o dealer é remunerado por
% do rake**: ele é pago sobre um número que não controla e não pode
conferir. Estruturalmente idêntico ao problema do jogador que assina sem
olhar, mas com a equipe interna no lugar do cliente.

## Opções consideradas

| Opção | Prós | Contras |
|---|---|---|
| Manter rake sem aceite | Mais rápido na operação | Produto cuja premissa é "toda movimentação tem prova" com exceção justo no faturamento |
| **Dealer valida o rake** | Cadeia de custódia fechada | Dois toques a mais a cada 30–60 min |

## Decisão

**Toda movimentação de valor exige confirmação da contraparte, sem
exceção.** O dono lança o rake e o dealer valida o valor entregue.

## Motivo

Um sistema que dispensa prova em uma transação perde a autoridade em
todas. E a transação dispensada era justamente a que define o pagamento
de quem trabalha na mesa — o desenho permitia erro mesmo sem má-fé, e
desenho que permite gera desconfiança.

## Consequências

- Transação de rake ganha estado `aguardando validação do dealer`.
- Dealer valida por link no próprio celular (coerente com [[DEC-001-arquitetura-cliente-web]]
  e reaproveita o mecanismo de token do jogador).
- Efeito de negócio não previsto: pagamento transparente vira argumento
  de **retenção de dealer** — canal de adoção adicional.
- Pendente: decidir se devolução de fichas e pagamento ao dealer também
  exigem aceite (provável que sim, pelo mesmo princípio).

## Relacionado

- [[BRIEF-Sessao-Poker]] · gargalo G3
- [[MOC-StackTrack]]
