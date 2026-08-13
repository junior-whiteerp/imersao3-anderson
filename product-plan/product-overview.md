# Caixa Vivo — Visão do Produto

## Resumo

O Caixa Vivo controla o caixa de fichas de um clube de poker **durante** a sessão, em vez de só no fim da noite. A cada rake lançado, o app diz se o caixa fecha — e quando não fecha, mostra o valor que falta, a janela de 30 minutos em que aconteceu e qual dealer estava no turno.

É a release 1 do StackTrack: **um clube, um operador, uma sessão por vez.**

### O problema, em uma frase

Toda sessão perde fichas sem que ninguém saiba de quem cobrar. O que torna a perda irrecuperável não é o valor — é o **atraso**: a conferência só acontece depois de dez horas de jogo, quando os jogadores já foram embora.

### A proposta de valor

> O caixa fecha sozinho. E quando não fecha, você sabe em qual meia hora e com qual dealer.

O furo deixa de ser *"sumiu dinheiro essa noite"* e vira *"faltam R$ 480 entre 21h05 e 21h40, no turno do João"*.

## Seções planejadas

1. **Painel da Noite** — A tela que fica aberta. Responde, de longe e sem toque, a única pergunta que importa durante a noite: a conta está fechando?
2. **Sessão e Caixa** — Abrir a noite com o caixa inicial de fichas, acompanhar a sessão em andamento e encerrá-la — garantindo uma sessão aberta por clube e nenhum jogador na mesa no fechamento.
3. **Jogadores e Mesa** — Cadastrar o jogador com nome e WhatsApp obrigatórios, adicioná-lo à mesa da sessão e encerrar a participação dele quando sair.
4. **Fichas** — Lançar retirada com confirmação na tela girada para o jogador, registrar contingência quando ele não olha, checar o limite no ato e fechar a conta com devolução e extrato linha a linha.
5. **Turnos e Rake** — Abrir e trocar turno de dealer sem sobreposição, e lançar o rake com a hora em que ele saiu da mesa — inclusive retroativa — para atribuí-lo ao turno certo.
6. **Conciliação e Relatório** — Mostrar o veredito do caixa a cada lançamento de rake — com valor, janela e dealer quando falta ficha — e guardar o relatório da sessão com todos os checkpoints da noite.

## Entidades do produto

| Entidade | O que guarda |
|---|---|
| **Clube** | Nome, percentual do rake que vai para o dealer |
| **Sessão** | Clube, abertura, encerramento, caixa inicial de fichas, situação |
| **Jogador** | Nome ou apelido e WhatsApp (obrigatórios), CPF (opcional), limite de crédito, consentimento |
| **Participação** | Qual jogador, em qual sessão, quando entrou, quando saiu |
| **Dealer** | Nome |
| **Turno** | Qual dealer, em qual sessão, início e fim |
| **Movimentação** | Sessão, participação, turno, tipo, valor, hora em que aconteceu, hora em que foi digitada, situação, quem lançou, justificativa |
| **Confirmação** | Qual movimentação, valor confirmado, hora, e se foi presencial normal ou contingência |
| **Checkpoint** | Qual sessão, hora, soma dos saldos, rake acumulado, diferença, veredito, janela e turno |

### Três pontos que mudam a modelagem

**Toda movimentação tem duas horas.** A hora em que aconteceu e a hora em que foi digitada. Sem essa distinção, o rake retirado às 21h05 e digitado às 21h12 é atribuído ao dealer errado quando o turno troca às 21h10 — e o dealer errado é quem responde pela janela.

**A identidade do jogador é o par nome + WhatsApp**, único dentro do clube. O mesmo WhatsApp com nome diferente é permitido (casal, pai e filho), mediante confirmação explícita.

**A movimentação tem quatro situações**, e só uma delas espera alguém: `aguardando`, `confirmada`, `recusada`, `cancelada`. A que espera **não expira por tempo** — sai por confirmação, recusa ou encerramento da conta.

## Design System

**Cores**

| Papel | Cor |
|---|---|
| Primária (ação e "ao vivo") | `cyan` |
| Secundária (chrome: contingência, turno aberto) | `violet` |
| Neutra | `zinc` |

Verde, âmbar e vermelho **não** estão nessa lista de propósito: eles pertencem ao veredito do caixa e a mais nada. Ver `design-system/tailwind-colors.md`.

**Tipografia**

| Papel | Fonte |
|---|---|
| Julgamento (veredito, títulos) | Instrument Serif |
| Instrução (rótulos, botões, texto) | Instrument Sans |
| Fato (dinheiro, hora, contagem) | Azeret Mono |

## Sequência de implementação

1. **Shell** — Tokens do design system, marca, porta de entrada e a faixa de estado do caixa
2. **Painel da Noite** — A tela que fica aberta.
3. **Sessão e Caixa** — Abrir a noite com o caixa inicial de fichas, acompanhar a sessão em andamento e encerrá-la — garantindo uma sessão aberta por clube e nenhum jogador na mesa no fechamento.
4. **Jogadores e Mesa** — Cadastrar o jogador com nome e WhatsApp obrigatórios, adicioná-lo à mesa da sessão e encerrar a participação dele quando sair.
5. **Fichas** — Lançar retirada com confirmação na tela girada para o jogador, registrar contingência quando ele não olha, checar o limite no ato e fechar a conta com devolução e extrato linha a linha.
6. **Turnos e Rake** — Abrir e trocar turno de dealer sem sobreposição, e lançar o rake com a hora em que ele saiu da mesa — inclusive retroativa — para atribuí-lo ao turno certo.
7. **Conciliação e Relatório** — Mostrar o veredito do caixa a cada lançamento de rake — com valor, janela e dealer quando falta ficha — e guardar o relatório da sessão com todos os checkpoints da noite.

Cada milestone tem um documento próprio em `instructions/incremental/`.
