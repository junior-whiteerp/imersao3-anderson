---
owner: Anderson
version: v0.1
updated: 2026-08-11
status: rascunho
estado: TO-BE
sistema: Caixa Vivo (StackTrack R1)
corrige: relatorio-qa-v2 · F1 (crítico) · caso C3
---

# SOP: Contingência de Sistema

> Estado **TO-BE**. Procedimento para quando **o sistema não está
> disponível** — internet caiu, app não abre, celular morreu.
>
> ⚠️ Não confundir com a contingência de aceite da
> [[ARV-Limites-de-Autoridade]] A2. Aquela é o **jogador** indisponível.
> Esta é o **clube sem sistema**.
>
> Corrige a falha F1 do [[relatorio-qa-v2]], caso C3: *"internet cai às
> 23h, 6 jogadores na mesa, 3 lançamentos aguardando confirmação"*.

## Princípio

> **O jogo não para. O registro não some.**
>
> O clube operou anos em papel. Cair para o papel não é fracasso — é o
> plano. O que não pode acontecer é operar de memória e reconstruir
> depois "por alto".

## Gatilho

Qualquer um destes:

- O app não abre ou não salva
- A internet do clube caiu
- O celular ou tablet do operador morreu, quebrou ou sumiu
- A tela de conciliação para de atualizar

**Na dúvida, declare contingência.** Custa uma folha de papel. Não
declarar custa a noite inteira.

## Pré-requisito — o kit fica pronto antes da sessão

Sem isso, o procedimento não roda. Conferir na abertura da sessão.

| Item | Quantidade |
|---|---|
| Fichas de contingência impressas (modelo abaixo) | 20 |
| Caneta esferográfica | 2 |
| Prancheta ou pasta rígida | 1 |
| Relógio visível, ou celular com hora | 1 |

> ⚠️ Papel de contingência **não é o papel do processo antigo**. Ele tem
> campo de hora e campo de assinatura, e existe para ser digitado depois.
> Ele **não é descartado** no fim da noite.

## Responsáveis

| Papel | O que faz neste procedimento |
|---|---|
| Operador do caixa | Declara a contingência, anota em papel, reconcilia depois |
| **Jogador** | Confere o valor e **assina o papel** |
| Sistema | Nada. Está fora do ar — é essa a premissa |

---

## Passos — no momento da queda

| # | Passo | Responsável | Critério de conclusão |
|---|---|---|---|
| 1 | **Anotar a hora exata da queda** na primeira ficha de papel | Operador | Hora registrada |
| 2 | Anunciar em voz alta: *"sistema fora, vamos de papel"* | Operador | Todos na mesa sabem |
| 3 | **Anular os lançamentos que não chegaram a ser confirmados** | Operador | Ver a regra abaixo |
| 4 | Anotar o saldo de cada jogador na mesa, do jeito que a tela mostrava por último | Operador | Uma linha por jogador |

### Regra do passo 3 — a mais importante da queda

> **Lançamento sem confirmação registrada não existe.**
>
> Se a ficha ainda não saiu da bandeja, cancele e refaça no papel.
> Se a ficha já saiu mas a confirmação não foi registrada, **anote como
> lançamento de papel**, com a hora real, e peça a assinatura agora.
>
> Nunca assuma que "provavelmente salvou". Ou está confirmado na tela, ou
> vai para o papel.

---

## Passos — operando em papel

Enquanto o sistema estiver fora, cada movimentação vira uma ficha.

| # | Passo | Responsável | Critério de conclusão |
|---|---|---|---|
| 5 | Preencher a ficha **antes** de entregar as fichas de jogo | Operador | Todos os campos preenchidos |
| 6 | Mostrar a ficha ao jogador e **pedir a assinatura** | **Jogador** | Assinatura no papel |
| 7 | Só então entregar as fichas de jogo | Operador | Fichas entregues |
| 8 | A cada rake recebido, preencher uma ficha com a **hora da retirada** | Operador | Hora física anotada, não a hora de escrever |
| 9 | Guardar todas as fichas na prancheta, em ordem de hora | Operador | Nenhuma folha solta |

### Modelo da ficha de contingência

```
┌─────────────────────────────────────────────┐
│  CONTINGÊNCIA — Caixa Vivo        nº ____   │
├─────────────────────────────────────────────┤
│  Data ___/___/______                        │
│                                             │
│  Hora do evento      ____ : ____            │
│                                             │
│  Tipo   ( ) buy-in   ( ) recompra           │
│         ( ) devolução ( ) rake              │
│                                             │
│  Jogador / Dealer  ______________________   │
│                                             │
│  Valor   R$ ____________                    │
│                                             │
│  Turno do dealer   ______________________   │
│                                             │
│  Assinatura do jogador / dealer             │
│  __________________________________         │
│                                             │
│  Observação _____________________________   │
└─────────────────────────────────────────────┘
```

> ⚠️ **O campo "hora do evento" é o que salva a reconciliação.**
> É a hora em que o rake saiu da mesa, não a hora em que você escreveu.
> Sem ele, o rake é atribuído ao dealer errado quando o turno troca
> · ver [[DEC-003-uma-mesa-por-sessao]].

---

## Passos — quando o sistema volta

Não sair digitando. A ordem importa.

| # | Passo | Responsável | Critério de conclusão |
|---|---|---|---|
| 10 | **Conferir o que já está no app** antes de digitar qualquer coisa | Operador | Lista da tela comparada com as fichas de papel |
| 11 | Separar as fichas que **já constam** no app | Operador | Pilha de duplicatas identificada |
| 12 | Lançar as fichas restantes, **em ordem de hora do evento** | Operador | Todas digitadas |
| 13 | Em cada lançamento, informar a **hora do evento** do papel, não a hora atual | Operador | Horas retroativas corretas |
| 14 | Marcar cada lançamento como **contingência**, com a justificativa *"sistema fora das HH:MM às HH:MM"* | Operador | Justificativa registrada em todos |
| 15 | Rodar a conciliação | Operador | Estado calculado · ver [[SOP-Conferencia-de-Caixa]] |
| 16 | **Guardar as fichas de papel** até o encerramento da sessão | Operador | Prancheta intacta |

### Regra do passo 11 — evitar o lançamento duplicado

> O risco maior da volta não é esquecer de digitar. É **digitar duas
> vezes**. Um lançamento duplicado desequilibra o caixa e cria um furo
> que não existiu.
>
> Confira a lista do app contra as fichas **antes** de digitar a primeira.

---

## O que acontece com a conciliação durante a queda

| Situação | O que vale |
|---|---|
| Durante a contingência | **A conciliação fica cega.** O app não tem os lançamentos. Não olhe o painel — ele vai mostrar diferença falsa |
| Logo após a reconciliação | O primeiro checkpoint válido é o **próximo lançamento de rake depois de tudo digitado** |
| Divergência aparecendo após a reconciliação | Pode ser furo real **ou** ficha de papel não digitada. Conferir a prancheta antes de acusar furo |

> ⚠️ Uma sessão com contingência de sistema **não serve como sessão limpa
> do modo sombra**. Registrar isso no relatório. O critério de aceitação
> do piloto pede 3 sessões consecutivas — essa não conta.

---

## Decisões

| Se... | Então... |
|---|---|
| A queda dura menos de 5 minutos | Ainda assim declare. Uma recompra cabe em 5 minutos |
| O jogador se recusa a assinar o papel | Não entregar as fichas. Mesma regra do sistema no ar |
| Acabaram as fichas de contingência | Qualquer papel serve, desde que tenha **hora, tipo, nome, valor e assinatura**. Nunca abrir mão da hora |
| A sessão encerra com o sistema ainda fora | Fechar a noite no papel, como no processo antigo. Digitar tudo depois, com as horas reais, e **registrar a sessão como reconstruída** |
| Alguém sugere "depois a gente lança tudo junto" | **Não.** Ficha por ficha, com a hora de cada uma. Lançamento em bloco perde a janela e destrói a atribuição do furo |
| O app volta no meio de um lançamento | Terminar aquele no papel. Não misturar meia transação |

## Critério de conclusão

- [ ] Hora da queda e hora da volta registradas
- [ ] Toda movimentação da janela tem ficha de papel assinada
- [ ] Fichas conferidas contra o app antes de digitar
- [ ] Todos os lançamentos digitados com a hora do evento correta
- [ ] Todos marcados como contingência, com justificativa
- [ ] Conciliação rodada depois da reconciliação
- [ ] Fichas de papel guardadas, **não descartadas**
- [ ] Sessão marcada no relatório como tendo tido contingência de sistema

## Exceções

> ⚠️ **Nada é descartado.** As fichas de papel são a prova daquela janela.
> Descartar reintroduz exatamente o gargalo G5 que o produto existe para
> resolver · ver [[BRIEF-Sessao-Poker]].

> ⚠️ **Contingência de sistema não tem teto por sessão**, ao contrário da
> contingência de aceite (3 por sessão). Se a internet do clube cair
> cinco vezes, cai cinco vezes. Mas **cada ocorrência entra no relatório**
> — se acontecer sempre, o problema é a internet do clube, e isso é uma
> conversa a ter antes de culpar o app.

## Fora do escopo deste procedimento

- Jogador sem celular ou sem internet → não é caso aqui. No R1 nada
  depende do aparelho do jogador · ver [[SOP-Retirada-de-Fichas]] v0.2
- Modo offline dentro do app → não existe no R1. É risco R2 do PRD
- Recuperação de dado perdido no servidor → fora do alcance do operador

## Relacionado

- [[relatorio-qa-v2]] · falha F1, caso C3
- [[SOP-Retirada-de-Fichas]] v0.2
- [[SOP-Conferencia-de-Caixa]]
- [[SOP-Abertura-e-Encerramento-de-Sessao]] · o kit entra na checklist de abertura
- [[ARV-Limites-de-Autoridade]] v3.0 · A2, contingência de **aceite**
- [[DEC-003-uma-mesa-por-sessao]] · hora do evento × hora do lançamento
- [[MOC-StackTrack]]
- `docs/PRD.md` · risco R2

## Pendências

- [ ] Imprimir e plastificar o modelo de ficha; deixar 20 no kit
- [ ] Incluir a conferência do kit no passo de abertura de
      [[SOP-Abertura-e-Encerramento-de-Sessao]]
- [ ] Rodar o caso C3 do [[relatorio-qa-v2]] com este SOP em mãos, e o
      executor concluir **sem consultar ninguém** — é o critério de
      aceitação de F1

## Histórico de mudanças

| Versão | Data | Autor | O que mudou |
|---|---|---|---|
| v0.1 | 2026-08-11 | Anderson | Criação. Corrige F1 do relatório de QA v2 |
