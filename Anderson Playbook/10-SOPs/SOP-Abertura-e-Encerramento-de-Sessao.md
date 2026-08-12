---
owner: Anderson
version: v0.1
updated: 2026-08-11
status: rascunho
estado: TO-BE
---

# SOP: Abertura e Encerramento de Sessão

> Estado **TO-BE**. Cobre as etapas 1 e 13 do [[BRIEF-Sessao-Poker]].
> A etapa 13 do AS-IS era **descartar o papel** — corrigida por G5.

## Gatilho

Início e fim da noite de jogo. Uma sessão = uma mesa
(ver [[DEC-003-uma-mesa-por-sessao]]).

## Responsáveis

| Papel | O que faz neste procedimento |
|---|---|
| Dono do clube | Abre e encerra a sessão; confere o caixa físico |
| **Dealer** | Valida o rake final antes do encerramento |
| Sistema | Concilia, apura obrigações e gera o relatório |

## Passos — abertura

| # | Passo | Responsável | Ferramenta | Critério de conclusão |
|---|---|---|---|---|
| 1 | Criar a sessão (clube, data, hora) | Dono do clube | App admin | Sessão aberta — única aberta no clube |
| 2 | Registrar o caixa inicial de fichas | Dono do clube | App admin | Valor registrado |
| 3 | Abrir o primeiro turno de dealer | Dono do clube | App admin | Turno aberto · ver [[SOP-Rake-e-Turno-do-Dealer]] |
| 4 | Conferir o percentual de rake do clube | Dono do clube | App admin | Percentual confirmado antes do primeiro lançamento |

## Passos — encerramento

| # | Passo | Responsável | Ferramenta | Critério de conclusão |
|---|---|---|---|---|
| 5 | Encerrar a conta de cada jogador | Dono do clube | App admin | Todas as contas resolvidas · ver [[SOP-Devolucao-e-Fechamento]] |
| 6 | Lançar o rake final | Dono do clube | App admin | Lançamento registrado |
| 7 | **Validar o rake final** | **Dealer** | Link web | Validação registrada |
| 8 | Encerrar o último turno de dealer | Dono do clube | App admin | Turno fechado |
| 9 | Executar a conferência final | Sistema | Automático | Estado calculado · ver [[SOP-Conferencia-de-Caixa]] |
| 10 | Conferir a contagem física do caixa contra o sistema | Dono do clube | Contagem manual | Valores batem, ou divergência registrada |
| 11 | Apurar a obrigação de cada dealer | Sistema | Automático | Obrigações criadas · ver [[SOP-Pagamento-Diferido-ao-Dealer]] |
| 12 | Gerar o relatório da sessão | Sistema | Automático | Relatório persistido |
| 13 | Encerrar a sessão | Dono do clube | App admin | Nenhuma conta em aberto ou pendência registrada |

## Decisões

| Se... | Então... |
|---|---|
| Jogador ainda na mesa no encerramento | Não encerrar. Sessão só fecha com todas as contas resolvidas |
| Jogador foi embora **devendo** | Conta não encerra — muda de estado. Ver [[SOP-Cobranca-de-Jogador-Devedor]] 🔴 |
| Caixa **não fecha** no encerramento | Encerrar com divergência **registrada**: valor, janela e dealer. Nunca "arredondar" |
| Rake pendente de validação do dealer | Bloqueia o cálculo do pagamento. Resolver antes de encerrar |

## Critério de conclusão

- [ ] Todas as contas de jogador encerradas ou com estado definido
- [ ] Todo rake validado
- [ ] Todos os dealers pagos
- [ ] Conferência de caixa executada — fechada ou divergência registrada
- [ ] **Relatório da sessão persistido** (substitui o descarte do papel)

## Exceções

> ⚠️ **Nada é descartado.** O ganho central do StackTrack sobre o papel é
> a memória: o registro sobrevive à sessão. Isso é o que corrige G5 e
> torna possível cobrar, auditar e identificar padrão de perda.

> ⚠️ Retenção sob LGPD (restrição R4): guardar não é "guardar para sempre".
> O prazo de retenção precisa estar definido e o consentimento coletado
> no cadastro do jogador.

## Relacionado

- [[BRIEF-Sessao-Poker]] · etapas 1 e 13, gargalo G5
- [[SOP-Conferencia-de-Caixa]]
- [[SOP-Rake-e-Turno-do-Dealer]]
- [[MOC-StackTrack]]
