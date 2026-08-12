---
owner: Anderson
version: v1.0
updated: 2026-08-11
status: decidido
---

# DEC-004 — Aceites pendentes e cadastro de dealer

## Contexto

Quatro decisões ficaram em aberto nos SOPs, todas sobre até onde aplicar
o princípio de [[DEC-002-aceite-em-toda-movimentacao]].

## D1 — Devolução de fichas não exige aceite separado

**Decisão:** não exige.

**Motivo:** a contagem já é dupla — o jogador conta as fichas retiradas
da mesa e o dono confere. O valor ainda aparece no extrato que o jogador
aceita antes da liquidação. Ele valida duas vezes: fisicamente na
contagem e formalmente no extrato.

Um aceite adicional adicionaria fricção no momento da saída sem produzir
prova nova.

## D2 — Não existe devolução parcial

**Decisão:** a devolução é sempre o fechamento da conta.

**Consequência:** o sistema não precisa de saldo corrente com saques
intermediários. Simplifica o modelo.

## D3 — Cadastro permanente, alocação por sessão

**Decisão:** o dealer é freela (vínculo por sessão), mas o **cadastro é
permanente** e a **alocação é por sessão**.

**Motivo:** cadastro descartável não acumula histórico — e com pagamento
diferido (ver D4) o sistema precisa saber quanto o clube ainda deve a
cada dealer, somando sessões anteriores.

| Conceito | Natureza | Onde vive |
|---|---|---|
| Vínculo por sessão | Regra de negócio | — |
| Cadastro do dealer | Permanente | `dealers` |
| Alocação e turnos | Por sessão | `turnos_dealer` |

## D4 — Pagamento ao dealer é diferido e precisa de aceite

**Decisão:** o dealer visualiza o rake que produziu (transparência no
cálculo). O pagamento é feito **posteriormente** pelo dono do clube, e
**exige confirmação de recebimento** do dealer.

**Motivo:** pagamento diferido sem comprovante é a mesma disputa que o
produto existe para eliminar — *"já paguei"* contra *"não recebi"* —
aplicada à equipe. Com dealer freela, que trabalha poucas noites por mês
e roda entre clubes, a discussão aparece em semanas.

## Consequências

- 🔴 **Novo processo não mapeado:** contas a pagar do clube ao dealer.
  Espelho do [[SOP-Cobranca-de-Jogador-Devedor]], na direção contrária.
- `dealers` passa a ter saldo devedor acumulado entre sessões.
- Transação `pagamento ao dealer` ganha aceite obrigatório.
- `SOP-Rake-e-Turno-do-Dealer` deixa de encerrar o pagamento dentro da
  sessão — ele passa a gerar uma **obrigação em aberto**.

## Relacionado

- [[DEC-002-aceite-em-toda-movimentacao]]
- [[DEC-003-uma-mesa-por-sessao]]
- [[SOP-Rake-e-Turno-do-Dealer]]
- [[SOP-Devolucao-e-Fechamento]]
- [[MOC-StackTrack]]
