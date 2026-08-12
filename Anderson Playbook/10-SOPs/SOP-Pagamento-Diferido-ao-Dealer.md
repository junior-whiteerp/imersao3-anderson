---
owner: Anderson
version: v0.1
updated: 2026-08-11
status: rascunho
estado: TO-BE
---

# SOP: Pagamento Diferido ao Dealer

> Estado **TO-BE**. Processo descoberto em
> [[DEC-004-aceites-e-cadastro-de-dealer]] — não existia no mapeamento
> original nem no produto.

## Gatilho

Encerramento da sessão gera a obrigação. O pagamento acontece depois,
em momento combinado entre clube e dealer.

## Responsáveis

| Papel | O que faz neste procedimento |
|---|---|
| Dono do clube | Define a condição, paga e baixa a obrigação |
| **Dealer** | Aceita o acordo e confirma o recebimento |
| Sistema | Apura, acumula entre sessões e registra os aceites |

## Princípio

> **A condição é discricionária; o registro é obrigatório.**
> O clube combina com cada dealer como e quando paga. O sistema não
> impõe regra — mas o que foi combinado, e o que foi pago, ficam
> registrados com aceite.

## Passos — apuração (fim da sessão)

| # | Passo | Responsável | Ferramenta | Critério de conclusão |
|---|---|---|---|---|
| 1 | Somar o rake por turno do dealer | Sistema | Automático | Total apurado · ver [[SOP-Rake-e-Turno-do-Dealer]] |
| 2 | Aplicar o percentual do clube | Sistema | Automático | Valor devido calculado |
| 3 | Apresentar o demonstrativo ao dealer | Dono do clube | App admin | Turnos, rake e percentual visualizados pelo dealer |
| 4 | Registrar a obrigação em aberto | Sistema | Automático | Obrigação vinculada ao cadastro permanente |

## Passos — acordo de pagamento

| # | Passo | Responsável | Ferramenta | Critério de conclusão |
|---|---|---|---|---|
| 5 | Definir a condição (à vista, prazo, acúmulo) | Dono do clube | — | Condição definida — decisão discricionária |
| 6 | Registrar o acordo: valor, forma e prazo | Dono do clube | App admin | Acordo gravado |
| 7 | **Aceitar o acordo** | **Dealer** | Link web | Aceite registrado |

## Passos — pagamento

| # | Passo | Responsável | Ferramenta | Critério de conclusão |
|---|---|---|---|---|
| 8 | Consultar o saldo devido acumulado entre sessões | Dono do clube | App admin | Saldo por clube exibido |
| 9 | Efetuar o pagamento | Dono do clube | Pix / dinheiro | Valor pago |
| 10 | **Confirmar o recebimento** | **Dealer** | Link web | Aceite de recebimento registrado |
| 11 | Baixar a obrigação | Sistema | Automático | `quitada_em` preenchido |

## Decisões

| Se... | Então... |
|---|---|
| Dealer trabalhou várias sessões sem receber | Saldo acumula no cadastro permanente. O sistema mostra o total devido, por sessão |
| Dono e dealer combinam prazo | Registrar o acordo com aceite. Discricionário na condição, obrigatório no registro |
| Dealer contesta o valor apurado | Abrir o demonstrativo: turnos, rake por turno validado, percentual. A prova responde |
| Rake de um turno não foi validado pelo dealer | Bloqueia a apuração daquele turno. Resolver antes de fechar |

## Critério de conclusão

- [ ] Obrigação registrada no fim da sessão
- [ ] Acordo de pagamento registrado e aceito (quando houver prazo)
- [ ] Pagamento efetuado
- [ ] Recebimento confirmado pelo dealer
- [ ] Saldo devedor zerado ou atualizado

## Exceções

> ⚠️ Dealer freela roda entre clubes e trabalha poucas noites por mês.
> Sem registro acumulado, ninguém lembra o que ficou de três sessões
> atrás — nem o clube, nem ele.

## Relacionado

- [[DEC-004-aceites-e-cadastro-de-dealer]]
- [[SOP-Rake-e-Turno-do-Dealer]]
- [[SOP-Cobranca-de-Jogador-Devedor]] — mesmo problema, direção oposta
- [[MOC-StackTrack]]
