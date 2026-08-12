---
owner: Anderson
version: v0.1
updated: 2026-08-11
status: rascunho
estado: TO-BE
---

# SOP: Cobrança de Jogador Devedor

> Estado **TO-BE**. Processo que **não existe** no papel nem no produto,
> e que responde pela maior perda financeira da operação.

## Dimensionamento

| Métrica | Valor |
|---|---|
| Jogadores que saem devendo | **3 por sessão** |
| Dívida média | **R$ 2.000** |
| Crédito concedido por sessão | R$ 6.000 |
| Crédito concedido por clube/mês | R$ 12.000 |
| Crédito concedido por clube/ano | ~R$ 144.000 |
| **Taxa de perda** | **0%** — todos pagam; define-se prazo para o acerto |

> **Não é um problema de perda financeira.** É um problema de **controle
> e capital de giro**: R$ 144.000/ano por clube circulam como crédito
> sem registro que sobreviva à sessão.

### Por que ainda importa

Os 0% de perda hoje são produto da **memória e das relações do dono** —
ele conhece os jogadores, sabe quem é bom pagador e lembra dos acordos.
Funciona em 2–3 clubes, com ele presente em todas as sessões.

O que não escala é isso. Com mais clubes, mais jogadores, ou o dono
ausente de uma noite, o 0% passa a depender de alguém lembrar.

> **O StackTrack não reduz a inadimplência — ele preserva os 0% quando a
> operação crescer.**

## Gatilho

Jogador encerra a conta com saldo devedor e não quita à vista.

## Responsáveis

| Papel | O que faz neste procedimento |
|---|---|
| Dono do clube | Decide a condição, registra o acordo e cobra |
| **Jogador** | Aceita o acordo e confirma a quitação |
| Sistema | Atualiza estados e mantém o histórico |

## Princípio

> **A condição é discricionária; o registro é obrigatório.**
> Dar prazo é julgamento sobre a pessoa — histórico, relação, confiança.
> Isso deve continuar sendo do dono. O sistema não decide: ele registra
> o que foi combinado e mostra o histórico antes da decisão.

## Passos — abertura da dívida

| # | Passo | Responsável | Ferramenta | Critério de conclusão |
|---|---|---|---|---|
| 1 | Encerrar a conta com saldo devedor | Dono do clube | App admin | Valor vem do extrato já aceito pelo jogador |
| 2 | Definir a condição (à vista, prazo, parcelamento) | Dono do clube | — | Condição definida — decisão discricionária |
| 3 | Registrar o acordo: valor, forma e prazo | Dono do clube | App admin | Acordo gravado com data de vencimento |
| 4 | **Aceitar o acordo** | **Jogador** | Link web | Aceite assinado, com o extrato anexado |
| 5 | Marcar o jogador como `devedor` | Sistema | Automático | Estado atualizado no cadastro permanente |

## Passos — cobrança

| # | Passo | Responsável | Ferramenta | Critério de conclusão |
|---|---|---|---|---|
| 6 | Consultar dívidas vencidas | Dono do clube | App admin | Lista de vencidos disponível |
| 7 | Acionar o jogador com o extrato assinado anexado | Dono do clube | WhatsApp | Mensagem enviada |
| 8 | Registrar a tentativa de contato | Dono do clube | App admin | Tentativa gravada com data e canal |
| 9 | Renegociar, quando necessário | Dono do clube | App admin | **Novo acordo com novo aceite** — nunca alterar o anterior |

## Passos — quitação

| # | Passo | Responsável | Ferramenta | Critério de conclusão |
|---|---|---|---|---|
| 10 | Receber o pagamento | Dono do clube | Pix / dinheiro / cartão | Valor recebido |
| 11 | Registrar a baixa com a forma de pagamento | Dono do clube | App admin | Baixa gravada |
| 12 | **Confirmar a quitação** | **Jogador** | Link web | Aceite de quitação registrado |
| 13 | Atualizar o estado do jogador | Sistema | Automático | Volta a `adimplente`; histórico permanece |

## Decisões

| Se... | Então... |
|---|---|
| Jogador pede prazo | Dono decide. Registrar valor, prazo e forma **com aceite** |
| Jogador devedor volta a jogar | **Dono decide — informado.** Sistema exibe: valor devido, sessões em aberto, acordos vencidos, histórico de quitação |
| Jogador se aproxima do limite de crédito | Alertar antes de estourar. Limite **varia por jogador** — campo no cadastro |
| Jogador estoura o limite | Bloquear nova retirada até liberação explícita do dono, registrada |
| Acordo vence sem pagamento | Marcar como vencido. Nova tentativa exige novo acordo aceito |
| Dívida entra na taxa de perda (10%) | Registrar a baixa como perda, com motivo. Alimenta o histórico do jogador |

## Critério de conclusão

- [ ] Dívida registrada com extrato assinado
- [ ] Acordo registrado e aceito pelo jogador
- [ ] Tentativas de cobrança registradas
- [ ] Quitação registrada com aceite — ou baixa como perda, com motivo

## Gargalos do processo atual

| # | Gargalo | Tipo | Frequência | Impacto |
|---|---|---|---|---|
| C1 | **Decisão de crédito sem informação** — o dono libera ficha a devedor sem ver a dívida, porque o papel foi descartado | Dependência | Toda sessão | Crédito concedido às cegas sobre R$ 6.000/sessão |
| C2 | **Limite de crédito só na memória** — varia por jogador, em 2–3 clubes, dezenas de jogadores | Dependência | Toda sessão | Limite estourado sem ninguém perceber |
| C3 | **Acordo sem registro** — prazo combinado na conversa, comprovante descartado no mesmo dia | Retrabalho / disputa | A cada acordo | "Combinamos 15 dias" × "você disse 30" |
| C4 | **Dívida sem histórico entre sessões** | Perda de informação | Toda sessão | Impossível saber quem é bom pagador sem depender da memória do dono |

**Mais crítico: C2.** Os 0% de perda dependem de o dono lembrar o limite
de cada jogador — valor diferente por pessoa, em 2–3 clubes. C1, C3 e C4
degradam a qualidade da decisão; C2 é o que **torna o resultado atual
dependente de uma única pessoa estar presente e lembrando**. É o gargalo
que impede a operação de crescer sem perder o controle que ela tem hoje.

## TO-BE

| Gargalo | Mudança | Métrica |
|---|---|---|
| C1 | Ficha do jogador exibe dívida, sessões em aberto e histórico **no momento do cadastro na mesa** | Decisões de crédito com informação: 0% → **100%** |
| C2 | Limite de crédito como campo por jogador, com alerta ao se aproximar e bloqueio ao estourar | Limites estourados sem detecção → **0** |
| C3 | Acordo registrado com valor, prazo, forma e **aceite assinado** do jogador | Acordos com prova: 0% → **100%** |
| C4 | Histórico de dívida e quitação persistente, por jogador, entre sessões | Taxa de perda mantida em **0%** com a operação crescendo, sem depender da memória do dono |

## Relacionado

- [[BRIEF-Sessao-Poker]]
- [[SOP-Devolucao-e-Fechamento]] · origem da dívida
- [[SOP-Pagamento-Diferido-ao-Dealer]] · mesmo problema, direção oposta
- [[MOC-StackTrack]]
