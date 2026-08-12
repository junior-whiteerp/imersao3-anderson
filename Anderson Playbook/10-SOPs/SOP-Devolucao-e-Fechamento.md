---
owner: Anderson
version: v0.1
updated: 2026-08-11
status: rascunho
estado: TO-BE
---

# SOP: Devolução de Fichas e Fechamento de Conta

> Estado **TO-BE**. Cobre as etapas 8 a 10 do [[BRIEF-Sessao-Poker]].
> Corrige G6 (soma manual) e fecha o ciclo do dinheiro.

## Gatilho

Jogador encerra a participação na sessão e devolve as fichas ao caixa.

## Responsáveis

| Papel | O que faz neste procedimento |
|---|---|
| **Jogador** | Conta as próprias fichas, aceita o extrato e a liquidação |
| Dono do clube | Confere a contagem, lança e liquida |
| Sistema | Apura o saldo e registra os aceites |

## Passos

| # | Passo | Responsável | Ferramenta | Critério de conclusão |
|---|---|---|---|---|
| 1 | Contar as fichas que retira da mesa | **Jogador** | — | Contagem concluída pelo jogador |
| 2 | Conferir a contagem | Dono do clube | — | Contagem dupla, ambos presentes, valores batem |
| 3 | Lançar a devolução | Dono do clube | App admin | Valor conferido na tela |
| 4 | Apurar o saldo `Σ devoluções − Σ saídas` | Sistema | Automático | Saldo calculado e exibido |
| 5 | Apresentar o extrato **linha a linha** | Dono do clube | App admin | Todas as movimentações visíveis, não só o total |
| 6 | **Conferir e aceitar o extrato** | **Jogador** | Link web | Aceite do extrato registrado |
| 7 | Executar a liquidação (ver árvore de decisão) | Dono do clube | App admin | Forma de pagamento registrada |
| 8 | **Aceitar a liquidação** | **Jogador** | Link web | Aceite registrado |
| 9 | Encerrar a conta na sessão | Dono do clube | App admin | Conta marcada como encerrada |

> ⚠️ Passos 1, 6 e 8 são **do jogador**. O passo 2 existe justamente para
> que a contagem não seja de um lado só.

## Decisões

| Se... | Então... |
|---|---|
| `saldo < 0` — **jogador deve ao clube** | Cobrar o valor. Formas: Pix, dinheiro ou cartão (parcelável) |
| `saldo > 0` — **clube deve ao jogador** | Pagar. Formas: Pix ou dinheiro (cartão não se aplica) |
| `saldo = 0` | Conta quitada sem movimentação financeira. Registrar mesmo assim |
| Jogador **contesta** uma linha do extrato | Abrir o aceite original: valor, horário e assinatura. A prova responde — não é palavra contra palavra |
| Jogador contesta linha **sem aceite** (contingência) | Escalar ao dono. Registrar o desfecho como exceção auditável |
| Jogador quer **ir embora devendo** | 🔴 Ver [[SOP-Cobranca-de-Jogador-Devedor]] — **processo ainda não definido** |
| Devolução **parcial** (jogador continua jogando) | **Não existe.** A devolução é sempre o fechamento · [[DEC-004-aceites-e-cadastro-de-dealer]] |

## Critério de conclusão

- [ ] Devolução registrada
- [ ] Extrato aceito pelo jogador (linha a linha, não só o total)
- [ ] Liquidação executada e registrada com forma de pagamento
- [ ] Aceite da liquidação registrado
- [ ] Conta do jogador marcada como encerrada na sessão

## Exceções

> ⚠️ **A conta do jogador só encerra com aceite do extrato.** Encerrar sem
> aceite reintroduz o problema que o sistema existe para resolver.

> ⚠️ Um jogador que sai devendo **não** encerra a conta — ele muda de
> estado. Enquanto o SOP de cobrança não existir, o registro fica em
> aberto e a dívida não tem tratamento definido.

## Lacunas resolvidas

- [x] **Aceite na devolução:** não é necessário. A contagem é dupla
      (jogador conta, dono confere) e o valor ainda passa pelo aceite do
      extrato · [[DEC-004-aceites-e-cadastro-de-dealer]]
- [x] **Devolução parcial:** não existe · [[DEC-004-aceites-e-cadastro-de-dealer]]

## Relacionado

- [[BRIEF-Sessao-Poker]] · etapas 8–10, gargalo G6
- [[SOP-Retirada-de-Fichas]]
- [[SOP-Conferencia-de-Caixa]]
- [[MOC-StackTrack]]
