# Caixa Vivo — Instruções completas de implementação

---

## Sobre esta entrega

**O que você está recebendo:**
- Telas prontas (componentes React com estilo completo)
- Requisitos de produto e especificação dos fluxos
- Tokens do design system (cores, tipografia)
- Dados de amostra mostrando a forma que os componentes esperam
- Especificação de testes focada em comportamento visível

**O seu trabalho:**
- Integrar estes componentes na sua aplicação
- Ligar os callbacks ao seu roteamento e à sua regra de negócio
- Trocar os dados de amostra por dados reais do backend
- Implementar os estados de carregando, erro e vazio

Os componentes são baseados em props — recebem dados e disparam callbacks. Como você organiza backend, camada de dados e regra de negócio é decisão sua.

⚠️ **Leia `regras/README.md` antes de começar.** As regras do caixa não são detalhe de implementação: elas são o produto. Há uma implementação de referência delas ali, com as provas que a sustentam.

---


## Testes

Cada seção traz um `tests.md` com especificação de comportamento visível. Elas são **independentes de framework**.

Para cada seção: leia o `tests.md`, escreva os testes dos fluxos principais (caminho feliz e caminho de erro), implemente até passar, refatore mantendo verde.

---

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


---


# Milestone 1: Shell

> **Entregue junto:** `product-overview.md` e `regras/README.md`
> **Depende de:** nada



## Objetivo

Montar os tokens do design system e o shell — a moldura fixa que envolve todas as seções.

## 1. Tokens

- `product-plan/design-system/tokens.css` — as variáveis, prontas para colar
- `product-plan/design-system/tailwind-colors.md` — **leia a regra de cor antes de qualquer tela**
- `product-plan/design-system/fonts.md` — as três famílias e o import

⚠️ **A regra de cor não é estética.** Verde, âmbar e vermelho pertencem ao veredito do caixa e a mais nada. Um botão verde já gasta o canal que devia avisar do furo. Isso vem da regra N8 do PRD.

O tema do produto vive no atributo `data-cv-tema`, não numa classe global — duas aplicações disputando a mesma classe `dark` brigam.

## 2. As regras

Antes das telas, leia `product-plan/regras/README.md` e decida: usar a implementação de referência, traduzir para a sua linguagem, ou reimplementar mantendo as provas verdes.

**A conta do checkpoint tem uma premissa que o PRD não fecha.** Está documentada em `regras/README.md`. Confirme com o dono do processo antes de codar — se ela estiver errada, muda o produto inteiro.

## 3. O shell

Copie `product-plan/shell/components/` para o seu projeto.

**Navegação** — ligue ao seu roteamento:

| Aba | Rota | Seção |
|---|---|---|
| Painel | `/painel` | Painel da Noite |
| Sessão | `/sessao` | Sessão e Caixa |
| Mesa | `/mesa` | Jogadores e Mesa |
| Ao vivo | `/ao-vivo` | Jogadores e Mesa (desenho da mesa) |
| Fichas | `/fichas` | Fichas |
| Rake | `/rake` | Turnos e Rake |
| Caixa | `/caixa` | Conciliação e Relatório |

**A faixa de estado** é a peça que faz o produto ser o que é. Ela nunca sai da tela. Alimente-a com o estado derivado das regras (`estadoDaFaixa` em `regras/modelo.ts`).

**O menu do operador** precisa de: nome, callback de tema, callback de sair, callback de encerrar sessão.

## 4. A porta de entrada

⚠️ **`Login.tsx` é uma demonstração, não autenticação.** O par usuário/senha está no código que o navegador baixa e não protege nada. O PRD deixa login fora do escopo da release 1.

Ela existe para dar um começo à demo e para desenhar o lugar onde a autenticação real vai entrar. Quando você implementar de verdade: servidor, senha com hash, sessão. A tela vira só a camada visual.

O nome digitado vira o nome do operador — o PRD manda registrar "quem lançou" em cada movimentação.

## Pronto quando

- [ ] Os tokens estão configurados e a regra de cor está entendida pelo time
- [ ] As regras do caixa estão implementadas (ou a referência está integrada) e as provas passam
- [ ] O shell desenha com a navegação ligada ao roteamento
- [ ] A faixa de estado reage ao estado real e nunca some da tela
- [ ] A faixa continua sendo região viva para leitor de tela em **todos** os estados
- [ ] O menu do operador mostra quem está operando
- [ ] Funciona no celular, com alvos de toque de 44px


---

# Milestone 2: Painel da Noite

> **Entregue junto:** `product-overview.md` e `regras/README.md`
> **Depende de:** Milestone 1 (Shell)



## Objetivo

Implementar a seção **Painel da Noite** — A tela que fica aberta. Responde, de longe e sem toque, a única pergunta que importa durante a noite: a conta está fechando?

## O que a interface permite

- Ver o veredito do último checkpoint em uma olhada, sem navegar
- Ver na espinha da noite em qual momento a conta começou a não fechar, e quem estava no turno
- Identificar o rake que ainda está na mesa pelo trecho hachurado no fim da espinha
- Conferir a conta parcela por parcela sem sair da tela
- Ver quem está com mais ficha da caixa na mão e quem está perto do limite
- Tocar num checkpoint e cair na Conciliação; tocar num jogador e cair nas Fichas

## Componentes entregues

Copie de `product-plan/sections/painel-da-noite/components/`:

- **`VereditoHero`** — O checkpoint congelado em tamanho de manchete, com janela, turnos e o rodapé neutro da regra N8
- **`EspinhaDaNoite`** — A noite inteira numa linha: uma ficha por checkpoint, uma faixa por turno, hachura no rake não declarado
- **`TilesDaNoite`** — Quatro mostradores: fichas em jogo, rake da noite, quantos na mesa, contingências usadas
- **`MostradorCaixa`** — A conta aberta em parcelas com barra de proporção
- **`MesaCompacta`** — A mesa ordenada por exposição, com barra de limite por jogador

## Callbacks a ligar

| Callback | Disparado quando |
|---|---|
| `onRevisarJanela` | O operador toca em "Ver os lançamentos dessa janela" no veredito |
| `onAbrirCheckpoint` | O operador toca numa ficha da espinha |
| `onAbrirJogador` | O operador toca num jogador da lista |

## Fluxos esperados

### Descobrir que a conta parou de fechar

1. O operador olha o painel entre lançamentos
2. O herói mostra o último veredito congelado, com valor e janela
3. Ele localiza na espinha a ficha com rótulo — as que fecharam não levam número
4. Ele toca na ficha e cai na Conciliação, naquela janela

**Resultado:** A investigação começa com as pessoas ainda no local, não dez horas depois

### Entender por que a conta não bate agora

1. O operador vê "fichas em jogo R$ 5.480" no mostrador
2. Ele lê o rodapé do herói: rake não declarado desde 21h40
3. Ele vê o trecho hachurado no fim da espinha

**Resultado:** Ele entende que a diferença é esperada e não interrompe a operação

## Estados vazios

- **Sem sessão:** "A noite ainda não começou", com um caminho para abrir a sessão. Nenhum número na tela
- **Sessão aberta, sem rake:** o herói diz que o primeiro checkpoint aparece no primeiro lançamento
- **Sessão encerrada:** o painel vira porta para o relatório — não há mais nada acontecendo para ele acompanhar

## Testes

Veja `product-plan/sections/painel-da-noite/tests.md`.

## Arquivos de referência

- `product-plan/sections/painel-da-noite/README.md`
- `product-plan/sections/painel-da-noite/types.ts`
- `product-plan/sections/painel-da-noite/sample-data.json`
- `painel.png`

## Pronto quando

- [ ] Os componentes desenham com dados reais
- [ ] Os estados vazios aparecem quando não há registro
- [ ] Todos os callbacks estão ligados a funcionalidade que funciona
- [ ] O operador completa os fluxos acima de ponta a ponta
- [ ] As regras de cor do PRD continuam valendo (ver `tests.md`)
- [ ] Funciona no celular


---

# Milestone 3: Sessão e Caixa

> **Entregue junto:** `product-overview.md` e `regras/README.md`
> **Depende de:** Milestone 1 (Shell)



## Objetivo

Implementar a seção **Sessão e Caixa** — Abrir a noite com o caixa inicial de fichas, acompanhar a sessão em andamento e encerrá-la — garantindo uma sessão aberta por clube e nenhum jogador na mesa no fechamento.

## O que a interface permite

- Abrir a sessão informando o caixa inicial de fichas
- Acompanhar o tempo decorrido, retiradas, devoluções e rake da noite
- Ver a linha do tempo dos turnos, com o rake de cada um
- Encerrar a noite — bloqueado enquanto houver jogador na mesa

## Componentes entregues

Copie de `product-plan/sections/sessao-e-caixa/components/`:

- **`AbrirSessao`** — Estado vazio da seção: uma pergunta, um campo, um botão
- **`ResumoCaixa`** — O resumo da noite até agora, com o rótulo mudando conforme haja ou não rake na mesa
- **`LinhaDoTempoTurnos`** — Os turnos da noite com dealer, período e rake
- **`EncerrarSessao`** — O encerramento, com a lista de quem ainda falta sair

## Callbacks a ligar

| Callback | Disparado quando |
|---|---|
| `onAbrir(caixaInicial)` | O operador confirma o caixa inicial e abre a noite |
| `onVerTurno(turnoId)` | O operador toca num turno da linha do tempo |
| `onEncerrar` | O operador encerra a sessão com a mesa vazia |

## Fluxos esperados

### Abrir a noite

1. O operador conta o caixa de fichas
2. Digita o valor no campo "Caixa inicial de fichas"
3. Toca em "Abrir a noite"

**Resultado:** A sessão abre e o painel passa a acompanhar a conta

### Tentar encerrar com gente na mesa

1. O operador abre a seção Sessão
2. O bloco "Encerrar a noite" lista quem ainda está jogando
3. O botão "Encerrar sessão" está visível e desligado

**Resultado:** Ele sabe o que precisa resolver, não só que não pode (regra N11)

## Estados vazios

- **Nenhuma sessão aberta:** o formulário de abertura ocupa a tela, com o campo do caixa inicial
- **Sessão anterior encerrada:** uma linha informa que o relatório ficou guardado, com atalho para ele

## Testes

Veja `product-plan/sections/sessao-e-caixa/tests.md`.

## Arquivos de referência

- `product-plan/sections/sessao-e-caixa/README.md`
- `product-plan/sections/sessao-e-caixa/types.ts`
- `product-plan/sections/sessao-e-caixa/sample-data.json`
- `sessao.png`

## Pronto quando

- [ ] Os componentes desenham com dados reais
- [ ] Os estados vazios aparecem quando não há registro
- [ ] Todos os callbacks estão ligados a funcionalidade que funciona
- [ ] O operador completa os fluxos acima de ponta a ponta
- [ ] As regras de cor do PRD continuam valendo (ver `tests.md`)
- [ ] Funciona no celular


---

# Milestone 4: Jogadores e Mesa

> **Entregue junto:** `product-overview.md` e `regras/README.md`
> **Depende de:** Milestone 1 (Shell)



## Objetivo

Implementar a seção **Jogadores e Mesa** — Cadastrar o jogador com nome e WhatsApp obrigatórios, adicioná-lo à mesa da sessão e encerrar a participação dele quando sair.

## O que a interface permite

- Cadastrar jogador: nome e WhatsApp obrigatórios, CPF opcional, limite e consentimento
- Reconhecer um par nome + WhatsApp já cadastrado e oferecer sentar quem já existe
- Aceitar o mesmo WhatsApp com nome diferente, após confirmação explícita
- Ver a mesa como lista (para operar) e como desenho de cima (para olhar de longe)
- Ver o uso do limite de cada jogador, contando o confirmado mais o que aguarda confirmação

## Componentes entregues

Copie de `product-plan/sections/jogadores-e-mesa/components/`:

- **`ListaDaMesa`** — A mesa como lista, com busca e o contador de contingências da sessão
- **`CartaoJogador`** — Um jogador: saldo, hora de entrada, barra de limite e marca de contingência
- **`CadastroJogador`** — O cadastro — a única tela do app sem saída de exceção
- **`MesaVisual`** — A mesa vista de cima, com os dez lugares e quem ainda está de pé

> ⚠️ **Sobre a `MesaVisual` (F13 do PRD), leia antes de implementar.**
>
> Ela é a **primeira funcionalidade a cair** se o prazo apertar — antes até do
> Painel da Noite. Ela mostra uma regra sem guardar nenhuma: tudo que ela exibe
> já existe na `ListaDaMesa`.
>
> **O número do lugar precisa de origem no seu dado.** `LugarOcupado.lugar` não
> pode ser o índice do array nem a ordem de chegada: se for, dois jogadores
> trocam de lugar sozinhos assim que um deles fecha a conta. `lugar` tem que
> ser **campo próprio da Participação**, gravado quando o jogador confirma a
> primeira ficha. O que decide a ocupação é a confirmação, não a entrada na
> sessão — critério **A26**.

## Callbacks a ligar

| Callback | Disparado quando |
|---|---|
| `onCadastrar(jogador)` | O formulário está completo e o operador confirma |
| `onUsarExistente(nome, whatsapp)` | O par já existe e o operador escolhe sentar quem já está cadastrado |
| `onAbrirJogador(id)` | O operador toca num jogador da mesa |
| `onSentar(lugar)` | O operador toca num lugar livre no desenho da mesa |
| `onBuscar(termo)` | O operador digita na busca |

## Fluxos esperados

### Cadastrar e sentar um jogador novo

1. O operador toca em adicionar
2. Preenche nome, WhatsApp e limite, e marca o consentimento
3. Toca em "Cadastrar e sentar"

**Resultado:** O jogador entra na sessão e aparece na mesa com saldo zero

### Tentar cadastrar sem WhatsApp

1. O operador preenche só o nome
2. Procura um jeito de seguir sem o número

**Resultado:** O botão continua desligado e **não existe nenhum botão de liberar** — é a regra N15, a única sem escalação (critério A19)

### Mesmo WhatsApp, outra pessoa

1. O operador digita um número que já pertence a outro jogador
2. A tela avisa de quem é o número e pede confirmação de que é outra pessoa
3. Ele marca a confirmação e conclui

**Resultado:** Os dois cadastros coexistem, e a lista da mesa os distingue (critérios A17 e A18)

## Estados vazios

- **Ninguém na mesa:** "A noite começa quando o primeiro jogador senta", com o botão de adicionar
- **Sem sessão aberta:** o cadastro fica desligado, com a explicação de que sem noite aberta não há mesa
- **Busca sem resultado:** "Ninguém na mesa com esse nome"

## Testes

Veja `product-plan/sections/jogadores-e-mesa/tests.md`.

## Arquivos de referência

- `product-plan/sections/jogadores-e-mesa/README.md`
- `product-plan/sections/jogadores-e-mesa/types.ts`
- `product-plan/sections/jogadores-e-mesa/sample-data.json`
- `mesa.png`

## Pronto quando

- [ ] Os componentes desenham com dados reais
- [ ] Os estados vazios aparecem quando não há registro
- [ ] Todos os callbacks estão ligados a funcionalidade que funciona
- [ ] O operador completa os fluxos acima de ponta a ponta
- [ ] As regras de cor do PRD continuam valendo (ver `tests.md`)
- [ ] Funciona no celular


---

# Milestone 5: Fichas

> **Entregue junto:** `product-overview.md` e `regras/README.md`
> **Depende de:** Milestone 1 (Shell)



## Objetivo

Implementar a seção **Fichas** — Lançar retirada com confirmação na tela girada para o jogador, registrar contingência quando ele não olha, checar o limite no ato e fechar a conta com devolução e extrato linha a linha.

## O que a interface permite

- Lançar retirada com teclado numérico e limite exposto no ato
- Girar a tela para o jogador confirmar — em tela cheia, sem o painel do clube à vista
- Registrar contingência com motivo escrito quando o jogador não olha a tela
- Liberar acima do limite com motivo escrito e registrado
- Fechar a conta com devolução e extrato linha a linha

## Componentes entregues

Copie de `product-plan/sections/fichas/components/`:

- **`LancarRetirada`** — O lançamento, com medidor de limite e teclado numérico de alvo grande
- **`TelaConfirmacao`** — A tela girada para o jogador. Aceita `plenaTela` para ocupar o aparelho inteiro
- **`ExtratoFechamento`** — O extrato linha a linha, com a contingência marcada e o resultado da noite

## Callbacks a ligar

| Callback | Disparado quando |
|---|---|
| `onDigitar(tecla)` | O operador toca no teclado numérico |
| `onGirarTela` | O valor está pronto e o aparelho vai para o jogador |
| `onLiberar` | O valor passa do limite e o operador abre o campo de motivo |
| `onConfirmar` | O jogador toca em "Confirmar" |
| `onRecusar` | O jogador toca em "Não reconheço" |
| `onContingencia` | O operador registra que o jogador não olhou a tela |
| `onEncerrarConta` | A devolução está contada e a conta fecha |

## Fluxos esperados

### Entregar fichas

1. O operador escolhe o jogador e digita o valor
2. Toca em "Girar a tela para o jogador"
3. O aparelho vai para o jogador, que lê o valor e toca em "Confirmar"

**Resultado:** A movimentação fica confirmada e a ficha pode ser entregue (regra N2)

### Jogador não reconhece o valor

1. O jogador toca em "Não reconheço"

**Resultado:** A ficha não sai. A tela para no resultado e pede para conferir e lançar de novo — não volta ao seletor

### Jogador não olha a tela

1. O operador toca em "O jogador não olhou"
2. Escreve o motivo
3. Confirma a contingência

**Resultado:** A movimentação é confirmada e marcada como contingência. Da 4ª da sessão em diante, a ficha não sai (regras N16, critérios A20 e A21)

### Fechar a conta

1. O operador conta as fichas junto com o jogador
2. Digita o total contado
3. Confere o extrato linha a linha e encerra a conta

**Resultado:** A conta fecha, e lançamentos que ainda aguardavam confirmação são cancelados (regra N7, critério A10)

## Estados vazios

- **Ninguém escolhido:** a lista de quem está na mesa, para escolher de quem é a ficha
- **Ninguém na mesa:** "Adicione um jogador antes de lançar fichas"

## Testes

Veja `product-plan/sections/fichas/tests.md`.

## Arquivos de referência

- `product-plan/sections/fichas/README.md`
- `product-plan/sections/fichas/types.ts`
- `product-plan/sections/fichas/sample-data.json`
- `fichas-confirmacao.png`
- `fichas-extrato.png`
- `fichas-lancar.png`

## Pronto quando

- [ ] Os componentes desenham com dados reais
- [ ] Os estados vazios aparecem quando não há registro
- [ ] Todos os callbacks estão ligados a funcionalidade que funciona
- [ ] O operador completa os fluxos acima de ponta a ponta
- [ ] As regras de cor do PRD continuam valendo (ver `tests.md`)
- [ ] Funciona no celular


---

# Milestone 6: Turnos e Rake

> **Entregue junto:** `product-overview.md` e `regras/README.md`
> **Depende de:** Milestone 1 (Shell)



## Objetivo

Implementar a seção **Turnos e Rake** — Abrir e trocar turno de dealer sem sobreposição, e lançar o rake com a hora em que ele saiu da mesa — inclusive retroativa — para atribuí-lo ao turno certo.

## O que a interface permite

- Abrir turno escolhendo o dealer, e trocar de dealer sem sobreposição
- Lançar o rake com duas horas visíveis e separadas: a de saída e a de digitação
- Ver a qual turno o rake será atribuído, antes de confirmar
- Ser avisado quando a hora escolhida cai num turno já fechado

## Componentes entregues

Copie de `product-plan/sections/turnos-e-rake/components/`:

- **`TurnoEmAberto`** — O turno rodando agora, com o rake acumulado e os botões de troca
- **`LancarRake`** — O lançamento que dispara o checkpoint, com as duas horas lado a lado
- **`ListaDeRakes`** — Os rakes da noite, com barra de proporção e a hora digitada quando difere

## Callbacks a ligar

| Callback | Disparado quando |
|---|---|
| `onAbrirTurno(dealerId)` | O operador escolhe o dealer do primeiro turno |
| `onTrocarDealer(dealerId)` | O operador passa o turno para outro dealer |
| `onDigitarValor(valor)` | O operador digita o valor do rake |
| `onMudarHora(hora)` | O operador corrige a hora em que o rake saiu da mesa |
| `onLancar` | O rake é lançado e o checkpoint abre em seguida |

## Fluxos esperados

### Lançar o rake da meia hora

1. O dealer entrega o rake
2. O operador digita o valor
3. Confere a hora em que ele saiu da mesa (vem preenchida com a atual)
4. Toca em "Lançar e conferir o caixa"

**Resultado:** O checkpoint abre em seguida com o veredito (critério A1: menos de 2 segundos)

### Rake retroativo, com troca de turno no meio

1. O rake saiu da mesa às 21h05 e está sendo digitado às 21h12
2. A troca de turno aconteceu às 21h10
3. O operador corrige a hora de saída para 21h05

**Resultado:** O rake é atribuído ao dealer das 21h05, não ao das 21h12 (critério A5)

## Estados vazios

- **Nenhum turno aberto:** "Escolha o dealer para começar", com a lista de dealers
- **Nenhum rake lançado:** a lista de rakes não aparece

## Testes

Veja `product-plan/sections/turnos-e-rake/tests.md`.

## Arquivos de referência

- `product-plan/sections/turnos-e-rake/README.md`
- `product-plan/sections/turnos-e-rake/types.ts`
- `product-plan/sections/turnos-e-rake/sample-data.json`
- `rake.png`

## Pronto quando

- [ ] Os componentes desenham com dados reais
- [ ] Os estados vazios aparecem quando não há registro
- [ ] Todos os callbacks estão ligados a funcionalidade que funciona
- [ ] O operador completa os fluxos acima de ponta a ponta
- [ ] As regras de cor do PRD continuam valendo (ver `tests.md`)
- [ ] Funciona no celular


---

# Milestone 7: Conciliação e Relatório

> **Entregue junto:** `product-overview.md` e `regras/README.md`
> **Depende de:** Milestone 1 (Shell)



## Objetivo

Implementar a seção **Conciliação e Relatório** — Mostrar o veredito do caixa a cada lançamento de rake — com valor, janela e dealer quando falta ficha — e guardar o relatório da sessão com todos os checkpoints da noite.

## O que a interface permite

- Ver o veredito congelado do último checkpoint
- Ver a diferença atual em tom neutro entre um checkpoint e outro
- Percorrer os checkpoints da noite para achar em qual a conta começou a não fechar
- Conferir a conta parcela por parcela, à mão
- Abrir o relatório da sessão depois de encerrada, com tudo que aconteceu

## Componentes entregues

Copie de `product-plan/sections/conciliacao-e-relatorio/components/`:

- **`PainelVeredito`** — O veredito congelado, com janela, turnos e o rodapé neutro
- **`ListaCheckpoints`** — Os checkpoints da noite, em ordem, cada um com sua ficha
- **`RelatorioDaSessao`** — O relatório da noite encerrada: veredito, o que não fechou, a conta, checkpoints, turnos, jogadores e exceções

## Callbacks a ligar

| Callback | Disparado quando |
|---|---|
| `onRevisarJanela(checkpointId)` | O operador quer ver os lançamentos da janela que não fechou |
| `onAbrir(checkpointId)` | O operador toca num checkpoint da lista |

## Fluxos esperados

### Investigar um furo

1. O veredito mostra "Faltam R$ 480" com a janela 20h15–21h08
2. O operador toca em "Ver os lançamentos dessa janela"
3. Ele vê os turnos que a janela atravessa

**Resultado:** Ele sabe onde olhar e quem estava operando — o app mostra a janela, não acusa pessoa (regra N14)

### Abrir o relatório da noite

1. A sessão é encerrada
2. A seção passa a mostrar o relatório

**Resultado:** Todos os checkpoints, a conta, quem passou pela mesa e cada exceção com motivo escrito (critério A14)

## Estados vazios

- **Nenhum rake lançado:** "O primeiro checkpoint aparece no primeiro lançamento"
- **Sessão ainda aberta:** o relatório não existe. A tela mostra a conciliação ao vivo

## Testes

Veja `product-plan/sections/conciliacao-e-relatorio/tests.md`.

## Arquivos de referência

- `product-plan/sections/conciliacao-e-relatorio/README.md`
- `product-plan/sections/conciliacao-e-relatorio/types.ts`
- `product-plan/sections/conciliacao-e-relatorio/sample-data.json`
- `conciliacao.png`

## Pronto quando

- [ ] Os componentes desenham com dados reais
- [ ] Os estados vazios aparecem quando não há registro
- [ ] Todos os callbacks estão ligados a funcionalidade que funciona
- [ ] O operador completa os fluxos acima de ponta a ponta
- [ ] As regras de cor do PRD continuam valendo (ver `tests.md`)
- [ ] Funciona no celular
