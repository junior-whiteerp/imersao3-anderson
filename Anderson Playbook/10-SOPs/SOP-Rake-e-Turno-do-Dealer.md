---
owner: Anderson
version: v0.1
updated: 2026-08-11
status: rascunho
estado: TO-BE
---

# SOP: Rake e Turno do Dealer

> Estado **TO-BE**. Cobre as etapas 5, 6, 7 e 12 do [[BRIEF-Sessao-Poker]].
> Corrige G3 (entrega de rake sem validação).

## Gatilho

- Início da sessão ou troca de dealer → abrir turno
- A cada 30–60 min → retirada de rake da mesa

## Responsáveis

| Papel | O que faz neste procedimento |
|---|---|
| **Dealer** | Retira o rake do pote, entrega ao dono e valida o valor lançado. Não é usuário do sistema — acessa por link |
| Dono do clube | Abre turnos e lança o rake recebido |
| Sistema | Atribui o rake ao turno correto e concilia |

## Passos — abertura de turno

| # | Passo | Responsável | Ferramenta | Critério de conclusão |
|---|---|---|---|---|
| 1 | Selecionar o dealer que assume a mesa | Dono do clube | App admin | Dealer cadastrado **e vinculado ao clube** |
| 2 | Registrar a hora de início do turno | Dono do clube | App admin | Turno aberto com horário |
| 3 | Encerrar o turno anterior | Sistema | Automático | Turnos sem sobreposição na sessão |

## Passos — lançamento de rake

| # | Passo | Responsável | Ferramenta | Critério de conclusão |
|---|---|---|---|---|
| 4 | Retirar o rake do pote | **Dealer** | — | Fichas separadas da mesa |
| 5 | Entregar o rake ao dono | **Dealer** | — | Fichas entregues em mãos |
| 6 | Lançar o valor informando a **hora da retirada** | Dono do clube | App admin | `hora_retirada` e `hora_lancamento` gravadas |
| 7 | Enviar link de validação ao dealer | Sistema | Automático | Link entregue, dentro da validade |
| 8 | **Conferir o valor e validar** | **Dealer** | Link web | Validação registrada |
| 9 | Atribuir o rake ao turno vigente na `hora_retirada` | Sistema | Automático | Rake vinculado ao turno correto |
| 10 | Executar a conciliação de caixa | Sistema | Automático | Estado calculado · ver [[SOP-Conferencia-de-Caixa]] |

> ⚠️ Passos 4, 5 e 8 são **do dealer**, não do dono. O passo 8 é o que
> protege o pagamento dele — executá-lo no lugar do dealer anula a prova.

## Passos — apuração do dealer (fim da sessão)

| # | Passo | Responsável | Ferramenta | Critério de conclusão |
|---|---|---|---|---|
| 11 | Somar o rake atribuído a cada turno do dealer | Sistema | Automático | Total por dealer apurado |
| 12 | Aplicar o percentual configurado no clube | Sistema | Automático | Valor devido calculado |
| 13 | Apresentar o demonstrativo ao dealer (turnos, rake, %, total) | Dono do clube | App admin | Demonstrativo visualizado pelo dealer |
| 14 | Registrar a obrigação em aberto | Sistema | Automático | Obrigação criada, vinculada ao cadastro permanente |

> O pagamento é **diferido** e tem procedimento próprio:
> [[SOP-Pagamento-Diferido-ao-Dealer]]. Esta sessão apenas **gera a
> obrigação** — não a quita.

## Decisões

| Se... | Então... |
|---|---|
| Rake retirado às 21:05, lançado às 21:12, turno trocou às 21:10 | Atribuir ao turno das **21:05** (`hora_retirada`), não ao do lançamento. Ver [[DEC-003-uma-mesa-por-sessao]] |
| Dealer **recusa** o valor lançado | Lançamento fica pendente. Dono e dealer conferem juntos. Nenhum rake entra sem validação |
| Dealer **não valida** até o fim da sessão | Bloqueia o cálculo do pagamento dele. Registrar como pendência, nunca aprovar por omissão |
| Rake retirado durante troca de turno | Vale a hora física da retirada |

## Critério de conclusão

**Por lançamento:**
- [ ] Valor lançado com `hora_retirada` e `hora_lancamento`
- [ ] Validação do dealer registrada
- [ ] Rake atribuído ao turno correto
- [ ] Conciliação executada

**Por sessão:**
- [ ] Todos os turnos encerrados
- [ ] Todo rake validado
- [ ] Pagamento de cada dealer calculado e efetuado

## Exceções

> ⚠️ Rake é a receita do clube **e** a base do pagamento do dealer.
> Lançamento sem validação deixa o dealer exposto a erro de pagamento —
> foi exatamente o buraco que [[DEC-002-aceite-em-toda-movimentacao]] fechou.

> ⚠️ A cadência de 30–60 min existe para que o registro aconteça em
> momento de calma. **Não** migrar para lançamento por mão: registro sob
> pressão é a causa raiz de G1.

## Relacionado

- [[BRIEF-Sessao-Poker]] · etapas 5–7 e 12, gargalo G3
- [[DEC-002-aceite-em-toda-movimentacao]]
- [[DEC-003-uma-mesa-por-sessao]]
- [[SOP-Conferencia-de-Caixa]]
- [[MOC-StackTrack]]
