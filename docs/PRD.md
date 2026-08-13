---
owner: Anderson
version: v1.11
updated: 2026-08-12
status: pendente de aprovação — v1.6 é a última aprovada
tipo: prd
produto: Caixa Vivo (StackTrack R1)
fonte: Anderson Playbook — BRIEF-Sessao-Poker, 7 SOPs, ARV-Limites-de-Autoridade, SPEC-Modelo-de-Dados-Supabase, QA-Playbook, PLANO-Adocao-StackTrack
---

# PRD — Caixa Vivo

> Release 1 do StackTrack. Última versão aprovada: v1.6, em 2026-08-11.
> Toda evidência citada vem do vault `Anderson Playbook/`.
>
> ⚠️ **As versões v1.7 a v1.9 ainda não foram aprovadas.** A v1.7 fechou seis
> desvios entre este documento e o protótipo. A v1.8 registrou onze desacordos
> novos (X1 a X11), achados na auditoria cruzada entre PRD, protótipo e app
> implementado. A v1.9 fecha as duas divergências que dependiam do dono:
>
> | | Ratificada em 2026-08-12 | Virou |
> |---|---|---|
> | **D4** | A mesa visual, construída contra o que estava escrito | **F13**, critério **A26** |
> | **D5** | A autenticação de verdade, construída contra a seção 13 | **F14**, critério **A27**, risco **R11** |
>
> **Sobrou uma pendência do dono, e é a mais cara das três:** a leitura da conta
> do checkpoint (seção 7). Ela segue marcada em 🔴 na seção — é a conta que
> decide se o caixa fecha, e se estiver errada muda o produto inteiro.
>
> Continua aberto também o item 4 da D4: o número do lugar na mesa precisa
> virar campo próprio da Participação. Esse não é decisão, é trabalho.
>
> 🔒 **A partir da v1.8 existe portão.** Nenhuma mudança de regra, escopo, dado
> ou tela pode ser dada por encerrada sem passar por este documento — a rotina
> está em `AGENTS.md`, na raiz, e é aplicada por um Stop hook nos dois
> repositórios de código. Ver **Registro de mudanças do sistema**, no fim.

---

## 1. Nome provisório

**Caixa Vivo.**

O nome diz o que a tela faz: o caixa deixa de ser um número apurado no fim
da noite e passa a ser um estado que dá para olhar a qualquer momento.

---

## 2. Usuário principal

**Quem opera o caixa de fichas durante a sessão.**

| Fase | Quem opera |
|---|---|
| Piloto silencioso | O dono do clube, sozinho, lançando em paralelo ao papel |
| Modo sombra | O responsável pelas fichas, com o papel ainda ao lado |

É a mesma pessoa na tela. O app não distingue papéis nesta versão.

**Limites da versão 1:** um operador por vez, um clube, uma sessão aberta.
Sem níveis de permissão.

**Quem não é usuário aqui:** o jogador e o dealer. Nesta versão eles não
recebem link, não instalam nada e não acessam o sistema. O jogador aparece
apenas confirmando um valor na tela do operador.

---

## 3. Problema

Toda sessão perde fichas sem que ninguém saiba de quem cobrar.

| Dimensão | Número |
|---|---|
| Valor por ocorrência | R$ 300 a R$ 1.000 |
| Frequência | Cerca de metade das sessões |
| Por clube, por ano | R$ 3.600 a R$ 12.000 |
| Na operação de 2 a 3 clubes | **R$ 7.200 a R$ 36.000 por ano** |

O que torna a perda irrecuperável não é o valor. É o **atraso**.

A conferência do caixa só acontece no fim da sessão, depois de cerca de
10 horas de jogo. Quando o furo aparece, os jogadores já foram embora e
não há mais como investigar. O prejuízo existe, mas não tem dono.

> Este é o único prejuízo em dinheiro da operação. A inadimplência de
> jogador é **zero** — todos pagam, define-se apenas prazo para o acerto.
> O crédito é um problema de controle e de escala, não de perda.

---

## 4. Situação atual

| Como é hoje | Consequência |
|---|---|
| Todo o controle em papel | Anotação some em horário de pico, sob concorrência |
| Jogador assina sem conferir | Contesta depois, de boa-fé. Sem prova útil, o clube cede |
| Conferência só no fim, contagem manual de 30 minutos | Furo descoberto cerca de 5 horas depois |
| Um único número para a noite inteira | Impossível saber em que momento aconteceu |
| Papel jogado fora depois do acerto | Nenhum histórico sobrevive à sessão |
| Soma do saldo feita à mão | Erro de conta não é detectável |

**Carga da sessão:** cerca de 2 horas de administração manual de fichas
dentro de uma sessão de 10 horas — 20% do tempo, e justamente durante o
jogo, sob pressão.

---

## 5. Proposta de valor

> **O caixa fecha sozinho. E quando não fecha, você sabe em qual meia hora
> e com qual dealer.**

O furo deixa de ser *"sumiu dinheiro essa noite"* e vira *"faltam R$ 480
entre 21h05 e 21h40, no turno do João"*.

Isso muda três coisas:

| Ganho | Antes | Depois |
|---|---|---|
| **Dá para investigar** | Janela de 10 horas, ninguém mais no local | Janela de 30 minutos, com as pessoas ainda lá |
| **Dá para provar** | — | No modo sombra: papel com furo de R$ 600 ao lado do app fechado em zero |
| **Dá para lembrar** | Papel descartado | Relatório da sessão guardado |

---

## 6. Jornada principal

Uma noite de trabalho, do começo ao fim.

### Abertura

1. Abrir a sessão e informar o caixa inicial de fichas.
2. Abrir o primeiro turno e escolher o dealer.

### Durante a sessão — repete a noite inteira

3. Jogador chega → cadastrar se for a primeira vez, e adicionar à mesa.
4. Jogador pede fichas → digitar o valor.
5. **Girar a tela** → o jogador vê o valor e confirma.
6. Entregar as fichas.
7. A cada 30 a 60 minutos o dealer entrega o rake → lançar o valor e a
   **hora em que o rake saiu da mesa**.
   → **Checkpoint:** a tela diz se o caixa fecha.
8. Troca de dealer → fechar o turno e abrir o próximo.

### Fechamento de cada jogador

9. Jogador sai → contar as fichas junto com ele.
10. Lançar a devolução.
11. Mostrar o extrato linha a linha na tela.
12. Encerrar a conta.

### Encerramento da sessão

13. Lançar o rake final.
14. Fechar o último turno.
15. Conferência final — o caixa fecha, ou a divergência fica registrada.
16. Encerrar a sessão. O relatório fica guardado.

**O passo 7 é o coração do produto.** É onde a conta fecha ou não fecha.

---

## 7. A ideia central — o checkpoint de rake

### A conta que precisa fechar

```
tudo que saiu  =  tudo que voltou  +  o rake
```

Somando o saldo de todos os jogadores da sessão, o resultado tem que ser
exatamente o rake recolhido, com o sinal invertido.

### ⚠️ Essa igualdade não fecha no meio da noite — e o PRD não dizia o que fazer

A fórmula acima só é verdadeira quando **ninguém está segurando ficha**. No
meio da sessão os jogadores têm fichas que saíram da caixa e não voltaram,
então a igualdade não pode fechar — e o checkpoint precisa comparar outra
coisa. Até a v1.6 o documento não dizia qual.

**A leitura adotada no protótipo:** o checkpoint compara o que deveria estar
**dentro da caixa de fichas** com o que está lá.

```
caixa esperada = caixa inicial
               − retiradas confirmadas
               + devoluções confirmadas
               + rake declarado

diferença      = caixa esperada − caixa contada − o que já foi registrado
```

As fichas que estão na mão dos jogadores não entram na conta: elas saíram da
caixa por um lançamento confirmado, e o app sabe exatamente quanto. O número
que sobra é **fichas em jogo** — esperado ser diferente de zero enquanto
houver gente na mesa, e que **não é furo**.

O trecho `− o que já foi registrado` existe para o checkpoint não cobrar duas
vezes a mesma falta: cada um registra apenas a diferença **nova** da janela
dele.

🔴 **Pendência: esta leitura precisa da confirmação do dono do processo.** Ela
não estava escrita, foi decidida na construção, e se estiver errada muda o
produto inteiro — é a conta que o app usa para dizer se o caixa fecha.

### O problema

O rake fica na mesa por 30 a 60 minutos antes de ser entregue ao dono.
Nesse intervalo a conta **não fecha, e está certo que não feche** — falta
declarar o rake que ainda está na mesa.

Se o app alertar continuamente, ele alerta errado quase o tempo todo. O
operador desliga a notificação. E o detector de furo morre junto.

### A solução

O veredito não é contínuo. Ele é **congelado a cada lançamento de rake**.

| Momento | O que a tela mostra |
|---|---|
| Logo depois de lançar o rake | **Veredito.** "Caixa fechado" ou "Faltam R$ 480 · janela 21h05–21h40 · turno do João" |
| Entre um lançamento e outro | **Neutro.** "Rake não declarado desde 21h40 · diferença atual R$ 320" |

A noite ganha de 10 a 20 checkpoints, em vez de um único número no fim.
E o alerta só aparece quando ele pode estar certo.

### Ambiguidade herdada, resolvida aqui

O playbook usa "rake pendente" com dois sentidos diferentes:

| Sentido | Onde aparece |
|---|---|
| Rake que ainda está na mesa, não declarado | SOP-Conferencia-de-Caixa |
| Rake lançado que o dealer ainda não validou | SPEC-Modelo-de-Dados-Supabase |

Nesta versão não existe validação de dealer. Portanto **"pendente" quer
dizer rake que ainda não foi declarado**. Quando a validação do dealer
entrar, os dois sentidos vão precisar de nomes distintos.

---

## 8. Funcionalidades essenciais

| # | Funcionalidade | Para que serve |
|---|---|---|
| F1 | Abrir e encerrar sessão, com caixa inicial de fichas | Delimita a noite. Uma sessão aberta por clube |
| **F10** | **Cadastro do jogador** — nome, WhatsApp, CPF opcional, limite e consentimento | Cria a identidade. Sem ela não há mesa nem lançamento |
| F2 | Mesa: adicionar e encerrar jogador na sessão | Define quem está jogando agora |
| F3 | Lançar retirada com confirmação na tela | O jogador vê o valor antes de a ficha sair |
| **F11** | **Registro de contingência** — o operador marca quando confirmou sem o jogador olhar a tela | É o único sinal de que o aceite presencial foi burlado. A `DEC-006` depende dele para poder ser revogada |
| F4 | Lançar devolução e fechar a conta, com extrato linha a linha | Acaba a soma manual e a contestação sobre o total |
| F5 | Turnos de dealer, sem sobreposição | Dá nome a quem estava operando em cada janela |
| F6 | Lançar rake com a hora em que saiu da mesa | Atribui o rake ao turno certo |
| F7 | **Painel de conciliação com checkpoint** | Diz se fecha, quanto falta, em qual janela e com qual dealer |
| F8 | Limite de crédito por jogador, exibido no ato do lançamento | Tira o limite da cabeça do dono. ⚠️ **Depende de coleta prévia** — sem os limites cadastrados, a tela nasce vazia |
| F9 | Relatório da sessão, guardado | Substitui o papel jogado fora |
| **F12** | **Painel da noite** — a noite inteira numa tela: veredito do último checkpoint, os checkpoints em linha do tempo com os turnos, a conta aberta em parcelas e quem está com a caixa na mão | É a tela que fica aberta entre um lançamento e outro. Não pede ação nenhuma: responde "a conta está fechando?" de longe, sem navegar |
| **F13** | **Mesa ao vivo** — a mesa vista de cima, com dez lugares. O lugar só é ocupado quando o jogador **confirma a primeira ficha** na tela girada; quem entrou e ainda não validou nada aparece separado, "de pé" | Torna a **N2 visível de longe**: quem já reconheceu ficha e quem não. Não é o mesmo que a lista da F2 — a lista serve para operar, o desenho serve para olhar sem navegar |
| **F14** | **Autenticação do operador** — e-mail e senha contra um servidor, com sessão e saída. Nenhuma credencial no código que o navegador baixa | Sem ela, "quem lançou" em cada movimentação é um nome digitado, não uma identidade. E o registro da noite fica aberto para qualquer um que alcance o aparelho |

> **F10 a F14 estão fora de ordem de propósito.** O vault não renumera
> identificadores já usados — a mesma regra das decisões `DEC-NNN`. A
> ordem da tabela segue a jornada; o número segue a data de criação.

### O que pode cair se o prazo apertar

**F13 cai primeiro; depois F12; depois F8. Depois de F8, corta-se escopo, não
funcionalidade.**

F13 sai na frente porque foi a última a entrar e é a única que **mostra** uma
regra sem guardar nenhuma: tudo que a mesa exibe já existe na lista da F2. Ela
ganhou o escopo por ler a N2 de longe, não por ser necessária — e essa é
exatamente a definição de primeira a cair.

F12 sai na frente porque ele não guarda regra nenhuma: tudo que o painel
mostra existe espalhado nas outras telas. Cortá-lo custa conforto de leitura,
não capacidade. Nenhuma regra, nenhum critério e nenhum dado dependem dele.

⚠️ **Cortar F8 não corta só F8.** Caem junto as regras N6 e N10, os
critérios A8 e A9, metade do A15, uma linha do escopo do MVP — e o passo
3 do `SOP-Retirada-de-Fichas`, que a árvore de autoridade descreve como
*"a exposição do jogador contra o limite, na tela, no momento do
lançamento"*. É um corte de nove itens, não de um.

**Cinco coisas não são cortáveis, e cada uma por um motivo diferente:**

| Não cai | Por quê |
|---|---|
| **F7** — painel de conciliação | Sem ele não existe produto, só um caderno digital |
| **F10** — cadastro | Sem cadastro não existe ficha. É a regra N15 |
| **A tela de confirmação de F3** | Cortá-la deixa o produto na opção que a `DEC-006` rejeitou por escrito: *"entregar sem confirmação nenhuma reintroduz G2"*. Ela é o que cumpre a métrica M3 |
| **F11** — registro de contingência | Sem ele a `DEC-006` perde o gatilho 2 da própria cláusula de revogação. Ninguém saberia que o aceite presencial falhou |
| **F14** — autenticação | Ela já está construída, e voltar atrás custa mais do que manter. Cortá-la devolveria a credencial para dentro do código que o navegador baixa — e "quem lançou" voltaria a ser um nome digitado |

---

## 9. Dados necessários

Descritos em português. A modelagem técnica não faz parte deste documento.

| Coisa | O que guarda |
|---|---|
| **Clube** | Nome, percentual do rake que vai para o dealer |
| **Sessão** | Clube, hora de abertura, hora de encerramento, caixa inicial de fichas, situação |
| **Jogador** | Nome ou apelido e **WhatsApp** (obrigatórios), CPF (opcional), limite de crédito, data do consentimento, situação |
| **Participação** | Qual jogador, em qual sessão, quando entrou, quando saiu, e **em que lugar da mesa** — 1 a 10, vazio enquanto ele estiver de pé |
| **Dealer** | Nome |
| **Turno** | Qual dealer, em qual sessão, início e fim |
| **Movimentação** | Sessão, participação, turno, tipo, valor, hora em que aconteceu, hora em que foi digitada, situação, quem lançou, e **duas justificativas separadas** — ver abaixo |
| **Confirmação** | Qual movimentação, valor confirmado, hora, e se foi presencial normal ou **contingência** — o operador confirmou sem o jogador olhar |
| **Checkpoint** | Qual sessão, hora, soma dos saldos, rake acumulado, diferença, veredito, janela de horário e turno |

### Três pontos que merecem atenção

**Duas horas em toda movimentação.** A hora em que aconteceu e a hora em
que foi digitada. Sem essa distinção, o rake retirado às 21h05 e digitado
às 21h12 é atribuído ao dealer errado quando o turno troca às 21h10 — e o
dealer errado é quem responde pela janela.

**A identidade do jogador é o par nome + WhatsApp**, único dentro do
clube. Decisão do dono do processo em 2026-08-11.

| Campo | Obrigatório | Papel |
|---|:--:|---|
| **Nome ou apelido** | ✅ | Metade da chave. E é o que o operador lê na mesa |
| **WhatsApp** | ✅ | Outra metade da chave. E é o canal do link na release 2 |
| **CPF** | ❌ | Só quando o jogador quiser dar. Serve para cobrança e conferência formal |

**Mesmo WhatsApp com nome diferente é permitido** — casal, pai e filho,
quem divide o aparelho. O app pede confirmação de que é outra pessoa.

**O que isso ganha:** identidade resolvida sem exigir documento, e o canal
do R2 já cadastrado — a release 2 não precisa de uma nova rodada de
cadastro.

**O que isso custa:** o R1 guarda nome, telefone e histórico financeiro de
todos. Menos que CPF, mas ainda dado pessoal — ver riscos R7 a R9.

**As duas justificativas não podem dividir o mesmo campo.**

Uma retirada pode ter passado por **duas** exceções diferentes na mesma noite:
liberação acima do limite (N10) e confirmação sem o jogador olhar a tela
(N16). São autoridades diferentes e motivos diferentes.

| Campo | Regra | Quem escreve |
|---|---|---|
| **Motivo da liberação de limite** | N10 | O operador, no ato do lançamento |
| **Motivo da contingência** | N16 | O operador, no ato da confirmação |

⚠️ **O protótipo guarda os dois juntos num campo só**, separados por " · ",
porque o segundo chegava e sobrescrevia o primeiro. Guardar junto é melhor do
que perder um, mas não é o certo: uma auditoria vai querer filtrar contingência
sem trazer liberação de limite junto. **Campos separados no produto.**

**A movimentação tem quatro situações, e só uma delas espera alguém.**

| Situação | Quando entra | Como sai |
|---|---|---|
| **Aguardando confirmação** | O operador digita o valor e gira a tela | Pela confirmação, pela recusa, ou pelo encerramento da conta do jogador |
| **Confirmada** | O jogador toca em confirmar | Não sai. A ficha pode ser entregue |
| **Recusada** | O jogador não reconhece o valor | Não sai. A ficha não é entregue |
| **Cancelada** | A conta do jogador foi encerrada com ela ainda aguardando | Não sai |

No R1 a espera dura segundos, porque a confirmação é presencial. Mas ela
**existe** — e é ela que faz as regras N6 e N7 funcionarem. Sem essa
definição, os critérios A9 e A10 não teriam como ser testados.

---

## 10. Regras do negócio

| # | Regra |
|---|---|
| N1 | Só existe uma sessão aberta por clube ao mesmo tempo |
| N2 | A ficha só sai depois de o jogador confirmar o valor na tela |
| N3 | O rake é sempre atribuído a um turno, pela hora em que saiu da mesa |
| N4 | Turnos de dealer não se sobrepõem |
| N5 | Devolução é sempre fechamento de conta. Devolução parcial não existe |
| N6 | O limite de crédito conta o que já foi confirmado mais o que está aguardando confirmação |
| N7 | Ao encerrar a conta do jogador, lançamentos dele ainda não confirmados são cancelados |
| N8 | Diferença com rake ainda na mesa não é furo e não gera alerta |
| N9 | O veredito de furo só aparece logo depois de um lançamento de rake |
| N10 | Passar do limite exige liberação explícita, com motivo escrito e registrado |
| N11 | A sessão não encerra com jogador ainda na mesa |
| N12 | Divergência nunca é arredondada nem apagada. Fica registrada com valor, janela e turno |
| N13 | Nada é apagado. O relatório da sessão fica guardado |
| N14 | O sistema não acusa pessoa. Ele mostra a janela e quem estava no turno |
| N15 | 🔒 **Sem WhatsApp não há cadastro, e sem cadastro não há ficha.** Sem escalação e sem exceção |
| N16 | Confirmar sem o jogador olhar a tela é **contingência**: exige motivo escrito e conta no teto de 3 por sessão. Da 4ª em diante, a ficha não sai |
| N17 | Depois do checkpoint, a diferença tem três faixas: até R$ 100 registra e segue; entre R$ 100 e R$ 500 revisa a janela ainda na sessão; acima de R$ 500 o app **recomenda suspender novas retiradas** |
| N18 | Um lançamento aguardando confirmação **não expira por tempo**. Sai só por confirmação, recusa ou encerramento da conta |
| **N19** | A divergência da **noite** é a soma das diferenças de todos os checkpoints — não a da conferência final. Uma noite que perdeu R$ 60 às 20h15 e R$ 480 às 21h08 e fechou no último rake tem divergência de **R$ 540** |

### Origem das regras N6 e N7

Vêm de dois ajustes já registrados no playbook, descobertos em suíte de
casos de borda:

| Ajuste | Caso que revelou | O que corrige |
|---|---|---|
| N6 | Jogador com duas retiradas aguardando confirmação que, somadas, estouram o limite | Contar só o confirmado deixa a segunda passar |
| N7 | Jogador confirma uma retirada depois de já ter saído da mesa | Cria movimentação válida para ficha que nunca foi entregue |

Custam quase nada agora e custam caro depois.

### Adaptação consciente na regra N10

O playbook manda escalar para o dono quando o limite é ultrapassado. Nesta
versão o operador e o dono são a mesma pessoa, então **"escalar" vira
"assumir por escrito"**: a exceção fica registrada com motivo. Quando o app
tiver mais de um usuário, isso volta a ser uma escalação de verdade.

### Por que a N19 existe

Cada checkpoint registra apenas a falta **nova** da janela dele. Sem a N19, o
relatório poderia abrir com "o caixa fechou" porque a última conferência deu
zero — escondendo exatamente as duas janelas que o produto existe para achar.

O relatório mostra o número da noite no topo e, logo abaixo, cada janela que
não fechou. Quando a conferência final fecha mas a noite não, ele diz isso com
todas as letras.

### A regra N15 é a única sem escalação

Todas as outras regras têm um nível acima que pode liberar. Essa não tem —
nem o dono, nem ninguém. O WhatsApp é metade da identidade do jogador e o
canal do comprovante na release 2: sem ele o registro não existe, e o
produto perde o motivo de existir.

Confirmada pelo dono do processo em 2026-08-11. Mudar exige decisão nova
registrada — não uma exceção tomada na mesa.

**Como o operador explica ao jogador:** *"É o número que recebe o
comprovante das suas fichas. Sem ele, não consigo registrar."* Enquadrar
como proteção do jogador, não como exigência do clube.

### As regras N16 e N17 vêm da árvore de autoridade

| Regra | Origem | O que ela evita |
|---|---|---|
| N16 | `ARV` A2 · caso de borda B11 | Sem esse registro ninguém sabe que o aceite presencial foi burlado. Mesmo aparelho, mesmo dedo — não há outro sinal |
| N17 | `ARV` A3 | O operador vê "faltam R$ 480" e não sabe se para a sessão ou segue. A faixa responde por ele |

⚠️ **Na N17 o app recomenda, não bloqueia.** A árvore diz que a suspensão
é decisão do operador. Bloquear sozinho criaria um jeito novo de a sessão
travar — exatamente o que o ajuste ADJ-2 corrigiu no playbook.

⚠️ **A N16 registra a contingência; ela não diz se isso basta.** Se o
contador é defesa suficiente contra o operador confirmar no lugar do
jogador continua sendo pergunta aberta no `checklist-confirmacao-r1`.

---

## 11. Estados de tela

| Tela | Vazio | Carregando | Sucesso | Erro |
|---|---|---|---|---|
| **Entrada** | Os dois campos vazios, o fundo da mesa de pôquer e o botão desligado | Botão vira "Entrando…" e recusa um segundo toque | A noite abre na tela que o operador deixou | A mensagem **do provedor, sem tradução** — "e-mail não confirmado" não vira "senha não confere". A senha é limpa; o e-mail fica |
| **Painel** | "A noite ainda não começou", com caminho para abrir a sessão | Esqueleto dos mostradores | A noite inteira: veredito, linha do tempo dos checkpoints, a conta em parcelas e quem está com a caixa | Encerrada a sessão, vira porta para o relatório |
| **Sessão** | "Nenhuma sessão aberta. Abrir agora?" com o campo do caixa inicial | Esqueleto do painel | Painel da sessão com o cronômetro rodando | "Já existe sessão aberta neste clube" com link para ela |
| **Mesa** | "Ninguém na mesa ainda. Adicionar jogador" | Lista em cinza | Jogador aparece na lista com saldo zero | "Esse jogador já está na mesa" |
| **Ao vivo** | A mesa no salão, com as dez cadeiras vazias e os dez lugares tocáveis. No centro, "Nenhum turno aberto" | Feltro em cinza, sem lugares | Lugares ocupados com nome, fichas em mão e barra de limite; **cadeira reservada em tracejado, sem valor**; no centro, turno, dealer e fichas em jogo; embaixo, quem entrou e ainda não tem cadeira | "Todo mundo que está cadastrado já está na sessão" ao tentar sentar num lugar livre |
| **Cadastro** | Campos de nome e WhatsApp, com o CPF marcado como opcional | Botão vira indicador de espera | Jogador cadastrado e já adicionado à mesa | "Sem WhatsApp não é possível cadastrar" — **sem botão de liberar**. É a única tela do app sem saída de exceção |
| **Lançamento** | Campo de valor em branco, teclado numérico aberto | Botão vira indicador de espera | Segue direto para a tela de confirmação | "Valor acima do limite: R$ 3.100 de R$ 3.000" com botão "Liberar mesmo assim", que pede o motivo |
| **Confirmação** | "Gire a tela para o jogador", com o valor em destaque | Aguardando o toque do jogador | "Confirmado às 22h14. Pode entregar as fichas" | "Recusado. Ficha não sai. Confira o valor e lance de novo" |
| **Contingência** | Link discreto na tela de confirmação: "o jogador não olhou" | — | "Contingência 2 de 3 registrada", com o motivo salvo | "4ª contingência desta sessão. A ficha não sai" |
| **Rake e turnos** | "Nenhum turno aberto. Escolher o dealer" | — | Rake lançado, e o checkpoint abre em seguida | "Esse horário está dentro de um turno já fechado. Confirma?" |
| **Conciliação** | "Nenhum rake lançado ainda. O primeiro checkpoint aparece no primeiro lançamento" | Números em cinza | "Caixa fechado" ou "Faltam R$ 480 · 21h05–21h40 · João · **revisar a janela agora**" | "Não foi possível calcular. Últimos números salvos: ..." |
| **Relatório** | "A sessão ainda está aberta" | — | Relatório completo, com todos os checkpoints da noite | "Sessão encerrada com divergência de R$ 480 registrada" — isso é resultado, não falha |

### Duas escolhas de linguagem, explícitas

**Diferença esperada nunca usa vermelho.** Cor de alerta em situação normal
é o caminho mais rápido para o operador ignorar o alerta de verdade.

**O sistema nunca acusa pessoa.** Ele diz a janela e quem estava no turno.
Quem investiga é gente. Se o app parecer vigilância, a equipe sabota a
adoção.

---

## 12. Escopo do MVP

- Abrir e encerrar sessão, com caixa inicial de fichas.
- **Cadastrar jogador:** nome e WhatsApp obrigatórios, CPF opcional,
  limite de crédito e consentimento.
- Adicionar e encerrar jogador na mesa.
- Lançar retirada, com confirmação na tela girada para o jogador.
- Registrar contingência quando o jogador não olha a tela, com teto de
  3 por sessão.
- Lançar devolução e fechar conta, com extrato linha a linha.
- Abrir e trocar turno de dealer, sem sobreposição.
- Lançar rake com a hora da retirada, podendo ser retroativa.
- Painel de conciliação com checkpoint a cada lançamento de rake.
- Limite de crédito por jogador, com aviso e liberação registrada.
- Relatório da sessão, guardado depois de encerrada.
- Painel da noite: a noite inteira numa tela, sem pedir ação.
- Mesa ao vivo: dez lugares, ocupados só por quem confirmou a primeira ficha.
- Autenticação do operador: e-mail e senha contra servidor, com sessão e saída.

**Um clube. Um operador. Uma sessão por vez.**

**Um operador continua sendo um operador.** A autenticação não traz níveis de
permissão nem troca de usuário — ela só garante que o nome registrado em cada
movimentação é de quem entrou, e não de quem digitou.

---

## 13. Fora do escopo — explicitamente

| Fica de fora | Por quê |
|---|---|
| Link e token para o jogador, assinatura no celular dele | É a metade cara. Depende do jogador responder no meio do aperto |
| Validação do rake pelo dealer | Mesmo aparato técnico, outro ator |
| Cálculo e pagamento do dealer, obrigações acumuladas | Depende da validação acima |
| Dívidas, acordos, tentativas de cobrança, histórico entre sessões | Precisa de dado que ainda não existe |
| Envio de mensagem por WhatsApp | Nada é enviado nesta versão |
| Vários usuários, níveis de permissão, isolamento entre clubes | Um operador, um clube |
| Liquidação e parcelamento em cartão | O circuito financeiro fica fora; só o circuito das fichas entra |
| Painel do administrador geral | Não há mais de um clube ainda |
| App nativo e publicação em loja | Atrasa o piloto |
| Rotina de expurgo de dados por prazo | Registrado como pendência de LGPD · risco R8. Vale para nome, telefone e histórico financeiro. O CPF é opcional desde a v1.2 |
| Funcionamento sem internet | Registrado como risco R2 |
| ~~Autenticação de verdade~~ | ✅ **Saiu daqui na v1.9.** Foi construída contra este item e o dono ratificou em 2026-08-12. Virou a **F14**, na seção 8. O que continua fora é o que ela **não** trouxe: níveis de permissão, troca de usuário, e isolamento entre clubes |
| **Recuperação de senha e criação de conta pela tela** | A conta do operador é criada à mão no painel do provedor. Uma tela de "esqueci minha senha" precisa de e-mail transacional, e nada é enviado nesta versão |

---

## 14. Riscos e hipóteses

### Hipóteses que o produto assume

| # | Hipótese | Como ela cai |
|---|---|---|
| ~~H1~~ | ✅ **CONFIRMADA em 2026-08-11.** O dono do processo verificou: sempre foi esquecimento, nunca houve contestação de má-fé | Deixou de ser hipótese. Vira fato histórico da operação — mas a cláusula de revogação da DEC-006 segue ativa se aparecer má-fé no piloto |
| H2 | O operador vai lembrar de lançar o rake toda vez | Se esquecer, o checkpoint não dispara e o produto fica cego |
| H3 | Os tempos ainda não medidos do processo estão corretos | Só a sessão real diz |
| H4 | O operador tem cerca de 10 horas por semana para tocar isso | Está no playbook como suposição, não como resposta confirmada |
| H5 | O custo até o piloto cabe no que não se paga: Supabase no plano gratuito, sem publicação em loja, sem API paga de WhatsApp | Premissa R6 do briefing, ainda **não confirmada**. Se algum desses custar, muda o prazo ou o escopo |

### Riscos

| # | Risco | Tamanho | O que fazer |
|---|---|---|---|
| R1 | Girar a tela atrasa a entrega em horário de pico | **Alto** | Medir o tempo da retirada contra o papel. Se piorar, o piloto falhou mesmo com o caixa fechando |
| R2 | Internet do clube cair no meio da sessão | **Alto** | Não há modo offline. Precisa de procedimento de papel para a queda |
| R3 | Confirmação na tela do operador é prova mais fraca que no celular do jogador | Médio | Registrar honestamente como presencial. Nunca tratar como se fosse igual |
| R4 | Contagem física do caixa continua sendo necessária | Médio | O app confere o registro, não conta fichas. Isso precisa estar claro para o dono |
| R5 | Operador digita a hora errada da retirada do rake | Médio | Sugerir a hora atual por padrão e permitir corrigir |
| R6 | Só 2 sessões por mês por clube | Médio | Cada sessão perdida atrasa a validação em duas semanas |
| **R7** | **CPF guardado em texto legível, quando informado** | Médio | Pendência já aberta na spec de dados. Vale só para quem der o número — o campo é opcional |
| **R8** | **Retenção declarada, sem rotina de expurgo** | **Alto** | Bloqueio B2 do QA do playbook. Vale para nome, telefone e histórico financeiro, mesmo sem CPF. Guardar 5 anos e nunca apagar não é política de retenção — é acúmulo |
| **R9** | **Quem enxerga o limite de crédito e o histórico** | Médio | Bloqueio B1 do QA. Se o operador for o responsável pelas fichas, ele vê o de todos os jogadores |
| **R10** | **Duas pessoas dividindo o mesmo WhatsApp** | Baixo no R1 | Sem efeito aqui — a confirmação é presencial. **No R2, os dois links chegam no mesmo aparelho** e quem confirma pode ser o jogador errado. Caso B16 |
| **R11** | **A sessão do operador cair no meio da noite** | **Alto** | Nasce com a F14. Não há modo offline: uma queda de rede que impeça a renovação do token devolve o operador para a tela de entrada às 2 da manhã, com jogadores na mesa. Duas providências: a sessão precisa durar mais que uma noite inteira de 10 horas, e o procedimento de papel do risco R2 passa a cobrir também "não consigo entrar", não só "o app não salva" |
| **R12** | **A conta do operador não existe quando a sessão vai abrir** | Médio | Nasce com a F14. A conta é criada à mão no painel do provedor, e **não há caminho de bypass** — de propósito. Se ninguém criou antes, a noite não começa. Criar a conta entra no checklist de adoção, antes do piloto |

---

## 15. Critérios de aceitação

Escritos como coisas que dá para observar acontecendo.

| # | Critério |
|---|---|
| A1 | Ao lançar um rake, o painel mostra um veredito em menos de 2 segundos |
| A2 | Quando as contas batem, o veredito é "caixa fechado" |
| A3 | Quando falta ficha, o veredito mostra o valor, a janela de horário e o nome do dealer do turno |
| A4 | Entre dois lançamentos de rake, a tela mostra a diferença em tom neutro, sem alerta e sem vermelho |
| A5 | Rake retirado às 21h05 e digitado às 21h12, com troca de turno às 21h10, é atribuído ao dealer das 21h05 |
| A6 | Não é possível abrir dois turnos que se sobreponham na mesma sessão |
| A7 | Não é possível abrir uma segunda sessão no mesmo clube com uma já aberta |
| A8 | Um lançamento que ultrapassa o limite do jogador não passa sem uma liberação com motivo escrito |
| A9 | Dois lançamentos aguardando confirmação que, somados, estouram o limite disparam o aviso no segundo |
| A10 | Encerrar a conta do jogador cancela os lançamentos dele que estavam aguardando confirmação |
| A11 | O extrato do fechamento mostra todas as linhas, não só o total |
| A12 | A sessão não encerra com jogador ainda na mesa |
| A13 | Encerrar uma sessão que não fecha grava a divergência com valor, janela e turno |
| A14 | O relatório da sessão continua acessível depois de encerrada, com todos os checkpoints da noite |
| A15 | O cadastro não conclui sem nome, WhatsApp, limite e consentimento. Sem CPF, conclui |
| A16 | O par nome + WhatsApp já cadastrado no clube não cria um segundo jogador — o app mostra o existente |
| A17 | Mesmo WhatsApp com nome diferente é aceito, após confirmação de que é outra pessoa |
| A18 | Nome repetido com WhatsApp diferente é aceito, e a lista da mesa distingue os dois por hora de entrada e saldo |
| A19 | A tela de cadastro **não oferece nenhum botão de liberar sem WhatsApp** — não existe caminho de exceção na interface |
| A20 | Confirmar sem o jogador olhar só é possível registrando um motivo, e a tela mostra qual contingência da sessão é aquela |
| A21 | A 4ª contingência da mesma sessão é bloqueada: a ficha não sai |
| A22 | Um lançamento aguardando confirmação continua aguardando até o jogador confirmar, recusar, ou a conta dele ser encerrada. Não expira sozinho |
| A23 | Uma diferença acima de R$ 500 depois do checkpoint faz o painel recomendar suspender novas retiradas, **sem bloquear** a operação |
| **A24** | O relatório de uma noite com duas janelas em falta abre mostrando a **soma das duas**, e não o resultado da conferência final — mesmo quando ela fechou em zero |
| **A25** | O painel da noite mostra, sem nenhum toque, o veredito do último checkpoint, em que momento cada falta apareceu e qual dealer estava no turno |
| **A26** | Na mesa ao vivo, o jogador que entrou na sessão e ainda **não confirmou nenhuma ficha** aparece "de pé", fora dos dez lugares. Ele passa a ocupar um lugar no momento em que confirma a primeira retirada na tela girada |
| **A27** | Não existe nenhuma credencial no código que o navegador baixa, e não existe caminho de entrada sem o servidor aceitar. Quando ele recusa, a tela mostra **a mensagem dele**, sem tradução |

---

## 16. Definição de pronto

O Caixa Vivo está pronto quando:

- [ ] Os 27 critérios de aceitação passam.
- [ ] Uma sessão inteira foi simulada do começo ao fim, com pelo menos
      3 jogadores, 2 turnos de dealer e 4 lançamentos de rake.
- [ ] Um furo foi criado de propósito na simulação e o app apontou a
      janela e o dealer certos.
- [ ] O caso do rake na troca de turno foi testado com hora retroativa.
- [ ] O caso do jogador errado foi testado: lançar ficha na conta de
      outra pessoa, conferir que **o caixa fecha mesmo assim**, e que só
      o extrato linha a linha revela o erro.
- [ ] O app roda no celular que vai ser usado na mesa, não só no computador.
- [ ] Existe um procedimento escrito de uma página para o caso de a
      internet cair.
- [ ] O relatório de uma sessão encerrada abre e mostra os checkpoints.
- [ ] As divergências em relação ao playbook estão registradas nele.

---

## 17. Divergências em relação ao playbook

Não são detalhes de implementação. São mudanças de regra escrita, e
precisam voltar para o vault.

### D1 — Confirmação presencial vira o padrão, não a exceção

O playbook trata o aceite presencial como contingência: exige
justificativa e limita a 3 por sessão. Aqui ele é o modo normal de
operação.

É uma decisão consciente para tirar o jogador do caminho crítico. Mas
contraria o que está escrito, e precisa entrar no registro como uma coisa
**diferente** do aceite feito no aparelho do jogador. Senão, quando a
versão 2 chegar, não haverá como medir se a prova melhorou.

**Consequência:** ✅ **já aplicada.** `SOP-Retirada-de-Fichas` v0.6 e
`ARV-Limites-de-Autoridade` v3.4 já descrevem o processo com aceite
presencial. A decisão está registrada em `DEC-006`, com cláusula de
revogação.

### D2 — "Escalar para o dono" vira "assumir por escrito"

Com um operador só, não há para quem escalar. A intenção da regra é
preservada — a exceção fica registrada com motivo — mas o controle de
duas pessoas não existe nesta versão.

### D3 — "Rake pendente" tem dois sentidos no playbook

Resolvido aqui como "rake ainda não declarado". Precisa de nomes distintos
quando a validação do dealer entrar.

### ✅ D4 — A mesa visual entrou contra o que estava escrito, e foi ratificada

Até a v1.6 a "mesa visual com 10 lugares" estava na lista de fora do escopo,
com a justificativa *"enfeite antes da prova"*. Ela foi construída mesmo
assim, como a tela **Ao vivo**.

Ela ganhou uma função que o desenho original não tinha: **o lugar só é ocupado
quando o jogador confirma a primeira ficha na tela girada**. Quem entrou na
sessão e ainda não validou nada aparece separado, "de pé". Isso transforma a
mesa num mostrador da regra N2 — quem já reconheceu ficha e quem não — em vez
de um desenho decorativo.

> ✅ **RATIFICADA em 2026-08-12 pelo dono do processo.** A mesa ao vivo entra no
> escopo como **F13**, com o critério **A26**, e é a **primeira a cair** se o
> prazo apertar — antes de F12.

**O que a ratificação obriga.** Ela não fecha sozinha: a tela nasceu no código
e nunca voltou para os documentos. Enquanto os quatro itens abaixo não forem
feitos, o desacordo continua vivo mesmo com a decisão tomada.

| # | O que falta | Onde | Estado |
|---|---|---|---|
| 1 | A mesa não existia na spec da seção nem na do shell — a navegação do shell listava seis abas | `product/sections/jogadores-e-mesa/spec.md`, `product/shell/spec.md` | ✅ feito em 2026-08-12 |
| 2 | O componente saiu no pacote **sem dado de amostra**: não havia array `lugares`, então ele não desenhava | `product/sections/jogadores-e-mesa/data.json` e o `sample-data.json` exportado | ✅ feito em 2026-08-12 |
| 3 | O tipo `LugarOcupado` era prometido nos contratos e não estava no `types.ts` da seção nem no `overview.ts` | `product-plan/data-shapes/`, `types.ts` da seção | ✅ feito em 2026-08-12 |
| 4 | **Não existia origem para o número do lugar.** No protótipo ele era derivado da ordem de confirmação (`src/simulacao/vistas.ts`), arquivo que fica fora do pacote — e assim dois jogadores trocavam de lugar sozinhos quando um fechava a conta | `product-plan/regras/modelo.ts`, `caixa-vivo/supabase/migrations/` | 🟡 **em andamento** — a regra e o banco estão prontos; falta a camada visual. Ver abaixo |

#### Onde o item 4 está, em 2026-08-12

Plano em `docs/superpowers/plans/2026-08-12-campo-lugar-na-mesa.md`, oito
tarefas. Quatro fecharam, com revisão independente em cada uma.

| Feito | O que ficou de pé |
|---|---|
| `Participacao.lugar?: number` — 1 a 10, ausente = de pé | O operador escolhe a cadeira; ela não é mais derivada de ordem |
| A ação `sentar` aceita `lugar`, com seis guardas | Quem está de pé ganha cadeira **sem virar participação nova** — é o caminho de quem entrou pela aba Mesa |
| Coluna, `check (1..10)` e **índice parcial** no Postgres | Um jogador por cadeira entre contas **abertas**. Encerrar libera a cadeira e a linha encerrada guarda o número (N13) |
| As três cópias de `modelo.ts` e `reducer.ts` idênticas de novo | A regra de cópia do plano da fatia vertical, restaurada e provada por hash |

**Falta a camada visual**, e por isso o critério **A26 ainda não foi emendado**:
o estado *reservado* — cadeira com dono que ainda não confirmou ficha — está
desenhado no plano mas **não existe em tela**. Enquanto não existir, o A26
segue valendo como está escrito na seção 15.

Suíte do `caixa-vivo` inteira verde: 19 arquivos, 83 testes, 0 falhas.

**A lição, que vale além da D4.** O desacordo não foi construir a tela — foi
construí-la **só no código**. O `/export-product` gera o pacote a partir do que
existe em `src/`, então uma tela que não voltou para `product/` sai no pacote
como entregável obrigatório, sem a ressalva que o PRD tinha escrito. Foi assim
que as instruções passaram a mandar construir uma coisa que este documento
tinha rejeitado. A regra que fecha essa fresta está em `AGENTS.md`.

---

### ✅ D5 — A autenticação de verdade entrou contra a seção 13, e foi ratificada

A seção 13 listava "Autenticação de verdade" como fora de escopo, com o motivo
escrito: um operador, sem níveis de permissão. Ela descrevia uma **porta de
demonstração** no lugar, marcada como algo que não protege nada.

O app implementado tem login de verdade: e-mail e senha no Supabase Auth,
sessão, logout, e o perfil do operador carregado de uma tabela. Existe até um
teste exigindo que nenhuma senha continue no código.

> ✅ **RATIFICADA em 2026-08-12 pelo dono do processo.** A autenticação entra no
> escopo como **F14**, com o critério **A27**, e é **não cortável** — voltar
> atrás devolveria a credencial para dentro do código que o navegador baixa.

**O que a ratificação trouxe junto.** Ela não é só uma tela a mais: muda o que
a operação precisa fazer antes da noite começar, e cria um jeito novo de a
noite parar. Os dois riscos estão registrados na seção 14.

| # | O que muda | Onde |
|---|---|---|
| 1 | A conta do operador é criada **à mão** no painel do provedor, antes da primeira sessão. Sem ela a noite não começa, e não há bypass | Risco **R12**, checklist de adoção |
| 2 | Sem modo offline, uma queda de rede que derrube a sessão devolve o operador para a tela de entrada **no meio da noite**. A sessão precisa durar mais que 10 horas, e o procedimento de papel do R2 passa a cobrir "não consigo entrar" | Risco **R11** |
| 3 | ✅ O componente `Login` deixou de decidir quem entra: ele pede, e quem responde é quem recebe o `onEntrar(usuario, senha)`. É o único callback do shell que devolve `Promise` | `product-plan/shell/components/Login.tsx` |
| 4 | ✅ A credencial saiu do protótipo e do pacote. Os três `Login.tsx` — protótipo, pacote e app — voltaram a ser byte a byte idênticos | Feito em 2026-08-12 |
| 5 | ✅ A prévia do Design OS não autentica, e agora diz isso: ela não tem servidor para perguntar, e o aceite dela existe só para a prévia ter porta de entrada | `src/simulacao/AppSimulado.tsx` |

**A lição, que é a mesma da D4 e por outro caminho.** Aqui o código não
inventou uma tela — ele **melhorou** uma. E mesmo uma melhora precisa de
decisão, porque ela carrega consequência que a interface não mostra: os riscos
R11 e R12 não existiam ontem, e ninguém teria olhado para eles se a mudança
tivesse passado como detalhe de implementação.

---

## 18. O que este produto não resolve

Registrado para não haver expectativa errada.

| Continua em aberto | Onde é tratado |
|---|---|
| Prova contra contestação de má-fé | Versão 2 — link no celular do jogador. ✅ O dono do processo confirmou que isso **nunca ocorreu** no clube (hipótese H1) |
| Dealer pago sobre valor que não pode conferir | Versão 2 — validação de rake |
| Limite de crédito e dívida entre sessões | Versão 3 — depende de histórico acumulado |
| Quem é bom pagador | Versão 3 |
| Controle de acesso por papel no vault | Bloqueio aberto no QA do playbook · risco R9 |
| Expurgo de dados por prazo de retenção | Bloqueio aberto no QA do playbook · risco R8 |
| Proteção do CPF, para quem informar | Pendência aberta na spec de dados · risco R7 |
| Dois jogadores dividindo o mesmo WhatsApp no R2 | Sem efeito no R1 · risco R10, caso B16 |

---

## Rastreabilidade

| Item deste PRD | Origem no playbook |
|---|---|
| Problema e números | BRIEF-Sessao-Poker, blocos 2 e 7 |
| A conta que fecha | BRIEF-Sessao-Poker, invariante de integridade |
| Checkpoint de rake | SOP-Conferencia-de-Caixa, regra de alerta |
| Duas horas na movimentação | DEC-003, remuneração do dealer |
| Regra N5 (sem devolução parcial) | DEC-004 |
| Regras N6 e N7 | ARV-Limites-de-Autoridade, ajustes ADJ-1 e ADJ-3 |
| Regra N10 | ARV-Limites-de-Autoridade, A1 |
| Regras N11 e N12 | SOP-Abertura-e-Encerramento-de-Sessao |
| Extrato linha a linha | SOP-Devolucao-e-Fechamento |
| Risco R1 | Critério de aceitação do piloto |
| Risco R2 | PLANO-Adocao-StackTrack, riscos de adoção |
| Regra N14 | SOP-Conferencia-de-Caixa, exceções |
| Confirmação presencial, F3 e F11 | DEC-006, com cláusula de revogação |
| Regra N15 e critérios A15 a A19 | ARV-Limites-de-Autoridade, bloco A6 · SOP-Retirada-de-Fichas v0.6 |
| Regra N16 e critérios A20, A21 | ARV-Limites-de-Autoridade, A2 · caso de borda B11 |
| Regra N17 e critério A23 | ARV-Limites-de-Autoridade, A3 |
| Regras N6 e N18, critérios A9 e A22 | ARV-Limites-de-Autoridade, ajuste ADJ-1 |
| Teste do jogador errado, na definição de pronto | ARV-Limites-de-Autoridade, caso de borda B14 |
| Riscos R7 a R9 | QA-Playbook, bloqueios B1 e B2 |
| Risco R10 | ARV-Limites-de-Autoridade, caso de borda B16 |
| Hipótese H5 | BRIEF-Sessao-Poker, restrição R6 |
| Procedimento de queda de internet, na definição de pronto | SOP-Contingencia-de-Sistema |
| A conta do checkpoint, seção 7 | ⚠️ Sem origem no vault. Decidida na construção do protótipo, pendente de confirmação |
| Regra N19 e critério A24 | ⚠️ Sem origem no vault. Consequência da conta acima |
| Funcionalidade F12 e critério A25 | ⚠️ Sem origem no vault. Nasceu do protótipo |
| Divergência D4 (mesa visual) | Contradiz a própria seção 13 da v1.6. **Ratificada em 2026-08-12** |
| Funcionalidade F13 e critério A26 | ⚠️ Sem origem no vault. Nasceu do protótipo, ratificada na v1.8. A leitura da N2 que ela mostra vem da `DEC-006` |
| Divergência D5 (autenticação) | Contradizia a seção 13 deste documento. **Ratificada em 2026-08-12** |
| Funcionalidade F14, critério A27, riscos R11 e R12 | ⚠️ Sem origem no vault. Nasceu da construção, ratificada na v1.9. A `DEC-001` já previa servidor; o que ela não previa era o operador precisar de conta antes da noite |
| Dois motivos separados, seção 9 | ARV-Limites-de-Autoridade A1 (N10) e A2 (N16) |

---

## Registro de mudanças do sistema

> 🔒 **Esta seção é obrigatória.** Toda mudança em código de produto entra aqui,
> ou numa seção acima, ou num `DEC-NNN`. Nenhuma mudança tem uma quarta saída.
>
> O portão (`scripts/prd-gate.sh`, Stop hook nos dois repositórios) impede
> encerrar o turno enquanto houver arquivo de produto mais novo que este
> documento. A rotina completa está em `AGENTS.md`, na raiz.

### Desacordos abertos, achados na auditoria de 2026-08-12

Auditoria cruzada entre este PRD, o protótipo do Design OS e o app
implementado. Cada linha tem evidência dos dois lados e sobreviveu a uma
tentativa de refutação. As entradas caem daqui quando forem fechadas.

| # | Desacordo | Gravidade | Estado |
|---|---|---|---|
| **X1** | O pacote exportado mandava construir a mesa ao vivo e a rota `/ao-vivo` **sem repassar a pendência** aberta aqui — `instructions/incremental/04-jogadores-e-mesa.md:49`, `instructions/incremental/01-shell.md:61`, `shell/components/navigation.ts:18` | Alta | ✅ **fechado** pela ratificação da **D4**. As instruções agora dizem que F13 é a primeira a cair e que `lugar` precisa de campo próprio |
| **X2** | Autenticação de verdade implementada (`caixa-vivo/src/auth/useOperador.ts:33`) contra a seção 13 | Alta | ✅ **fechado** pela ratificação da **D5** em 2026-08-12. Virou F14/A27, com os riscos R11 e R12. A credencial saiu do protótipo e do pacote; os três `Login.tsx` voltaram a ser idênticos |
| **X3** | `product-plan/design-system/tokens.css` tinha 69 linhas e trazia **só variáveis**. As regras `.cv-*` que os componentes aplicam (`.cv-panel`, `.cv-btn`, `.cv-num`, `.cv-engraved`…) e as três fontes não vinham. O app subiu sem folha de estilo e colou 506 linhas do `index.css` do Design OS | Crítica | ✅ **fechado** em 2026-08-12: o arquivo exportado passou a 520 linhas. Conferido — os **53** nomes `cv-*` usados pelos componentes estão definidos |
| **X4** | Os dois motivos de exceção (N10 e N16) continuam num campo só. `reducer.ts:336` junta com `' · '`; `persistirDelta.ts:131` separa por chute. Motivo com `·` dentro perde o pedaço do meio | Média | 🟠 aberto. Já mandado pela seção 9. Falta implementar |
| **X5** | O **consentimento** nunca sai da tela: a ação `cadastrar-jogador` não tem o campo, e `persistirDelta.ts:42` carimba `consentimento_em` em todo cadastro. Quem chamar a regra direto registra consentimento que ninguém deu. Quebra a **A15** | Média | 🟠 aberto. Já mandado pela seção 9. Falta implementar |
| **X6** | Doze dos vinte e seis critérios não têm teste nenhum: A1, A10, A11, A12, A14, A16, A21, A22, A23, A24, A25, A26. A21 e A23 estão no código e ninguém prova | Média | 🟠 aberto. Definição de pronto. Falta escrever teste |
| **X7** | O estado de erro da Conciliação — *"Não foi possível calcular. Últimos números salvos: …"* — não existe na spec, nem no componente, nem no pacote | Média | 🟠 aberto. Já mandado pela seção 11. Falta desenhar |
| **X8** | A tela de Caixa do app perdeu o painel "Como esta conta é feita" e o `onAbrir` da lista: nenhum checkpoint da noite pode ser aberto. Não está em nenhuma tabela de corte do plano | Alta | 🟠 aberto. Não muda regra. Falta reimplementar |
| **X9** | A mesa do app perdeu o atalho "Já cadastrados": quem já jogou precisa ser digitado de novo. Também não está nos cortes | Média | 🟠 aberto. Não muda regra. Falta reimplementar |
| **X10** | Documentos internos desalinhados: `product-overview.md` listava 11 funcionalidades e este PRD tem 13; `product/shell/spec.md` dizia "cinco abas fixas na base" e listava seis destinos, contra sete no código | Baixa | ✅ **fechado** em 2026-08-12 |
| **X11** | **Os contratos de dados exportados não compilavam.** `data-shapes/overview.ts` declarava `Veredito` duas vezes (o gerador concatena os `types.ts` das seções sem deduplicar) e usava `TurnoDaJanela` sem defini-lo. O `types.ts` de `conciliacao-e-relatorio` — que a README chama de "o contrato completo" — também não compilava sozinho | Alta | ✅ **fechado** em 2026-08-12. Os 7 arquivos de contrato passam no `tsc`. ⚠️ **A causa está no gerador do `/export-product`, não nos arquivos** — a próxima exportação traz o defeito de volta |

### Mudanças que não mexeram no produto

| Data | O que mudou | Por que não é mudança de produto |
|---|---|---|
| 2026-08-12 | `caixa-vivo/src/tokens.css` recebeu 506 linhas vindas do `index.css` do Design OS | Conserto de entrega, não de desenho: o app subia preto no branco porque o pacote exportou só as variáveis. O visual é o mesmo que a spec já descrevia. Ver **X3** |
| 2026-08-12 | `caixa-vivo/src/telas/Aviso.tsx` e o teste dele | Superfície nova para uma recusa de regra que já existia no `reducer`. Nenhuma regra mudou — antes o operador não via o motivo da recusa |
| 2026-08-12 | Repositório de governança criado na raiz; `AGENTS.md`, `scripts/prd-gate.sh`, `/prd-sync` e `AGENTS.md` do `caixa-vivo` | Processo, não produto. É a rotina desta seção |
| 2026-08-12 | `product-plan/design-system/tokens.css` foi de 69 para 520 linhas | Entrega, não desenho: o pacote passou a carregar as classes que os componentes já usavam. Nenhum pixel mudou. Fecha **X3** |
| 2026-08-12 | `TurnoDaJanela` definido em `conciliacao-e-relatorio/types.ts`; `Veredito` deixou de ser declarado duas vezes em `data-shapes/overview.ts` | Correção de contrato quebrado. Os tipos já eram esses — eles só não compilavam. Fecha **X11** |
| 2026-08-12 | `lugares`, `emPe`, `dealer`, `turno` e `fichasEmJogo` entraram no dado de amostra da mesa; jogador `Léo Bastos` acrescentado sem ficha confirmada | Dado de amostra, não regra. O Léo existe para a amostra mostrar a **A26** acontecendo: entrou na sessão, tem retirada aguardando, e por isso está de pé |
| 2026-08-12 | `product-overview.md` ganhou F12, F13 e a ordem de corte | Alinhamento de documento com este PRD. Fecha **X10** |
| 2026-08-12 | O `Login.tsx` do protótipo e do pacote virou cópia do app: sem `CREDENCIAL_DA_DEMO`, com `onEntrar` devolvendo `Promise` e estado de "Entrando…" | **Isto muda produto** — é a F14, e está registrado na seção 8, não aqui. A linha fica para marcar que os três arquivos voltaram a ser byte a byte idênticos, restaurando a regra de cópia do plano |
| 2026-08-12 | `src/simulacao/AppSimulado.tsx` passou a fornecer um `onEntrar` assíncrono que aceita qualquer nome | Prévia, não produto. Ela não tem servidor para perguntar, e o comentário diz isso. O que decide no produto é o Supabase |
| 2026-08-12 | `product/shell/spec.md`, `product-plan/README.md` e `product-plan/shell/README.md` pararam de descrever a porta de demonstração | Alinhamento de documento com a F14. Sem essa passada, quem recebesse o pacote construiria a versão que o app já abandonou |
| 2026-08-12 | Os comentários de `LugarOcupado` e do campo `emPe`, nos três arquivos de contrato, pararam de descrever a semântica antiga | **Não muda produto** — corrige documentação que induzia ao erro. Desde que o lugar virou campo, `emPe` quer dizer **sem cadeira**; os comentários ainda diziam "quem não validou ficha", e um deles contradizia o campo `validou` declarado oito linhas abaixo, no mesmo arquivo. Quem implementasse lendo só o contrato colocaria o jogador reservado em dois lugares da tela ao mesmo tempo. Achado da revisão, não do plano — o brief não mandou corrigir isso |
| 2026-08-12 | A **Mesa ao vivo ganhou matéria**: carpete, mogno envernizado, feltro acolchoado, cadeiras de couro e porta-fichas — tudo em CSS, sem imagem. E a demo passou a sentar os jogadores em cadeiras espalhadas (1, 4, 6, 8, 10) | **Isto muda tela**, e está registrado na seção 11 e na spec da seção. A linha fica aqui para marcar o que a decisão **não** mudou: nenhuma regra, nenhum critério, nenhum dado. E para registrar o limite que ela respeitou — o realismo vem de luz e textura, nunca de pigmento saturado, senão a mesa engoliria o canal âmbar do aviso de limite |
| 2026-08-12 | O campo `lugar` na Participação, a ação `sentar` com lugar, a migration `0002` e a camada de dados | **Isto muda regra e dado** — está registrado na seção 9 e na D4, não aqui. A linha fica para marcar que `modelo.ts` e `reducer.ts` mudaram nas três cópias no mesmo passo, com igualdade provada por hash |

### Dois achados de reprodutibilidade, abertos

Nenhum dos dois é regra de produto. Os dois são a mesma doença do **X3**: o
sistema funciona na máquina de hoje por causa de estado que o repositório não
carrega. Quem clonar amanhã não recebe o que está funcionando aqui.

| # | Achado | Onde |
|---|---|---|
| **X12** | **O banco não é reprodutível a partir das migrations.** Não existe nenhum `grant` em `caixa-vivo/supabase/migrations/`. Os privilégios que o banco local tem vieram de comando aplicado à mão. Verificado: a ausência dos grants. Não verificado de forma independente: se um ambiente limpo de fato quebra — exigiria outro `db reset` destrutivo | `caixa-vivo/supabase/migrations/` |
| **X13** | **O Design OS não versiona o produto que desenha.** 137 arquivos fora do git: `product/`, `product-plan/`, `src/sections/`, `src/shell/`, `src/simulacao/`. Nada num `.gitignore` os exclui — nunca foram adicionados. É por isso que a auditoria não conseguiu datar a entrada da tela "Ao vivo": o arquivo nunca teve histórico | `imersao-teste-design/` |

---

## Histórico de versões

| Versão | Data | O que mudou |
|---|---|---|
| **v1.11** | 2026-08-12 | **A Mesa ao vivo vira uma mesa de verdade.** Decisão do dono do processo, a partir de uma foto de referência: o desenho de cima, abstrato, dá lugar a um salão — carpete de pelo cortado, trilho de mogno envernizado com o brilho varrendo a elipse, feltro de argila acolchoado, cadeiras de couro giradas para o centro e porta-fichas recuados no trilho. Tudo em CSS, sem imagem. A cadeira de quem está sentado ganha um filete quente na costura: de longe, o anel de cadeiras conta quantos lugares foram tomados antes de o operador ler um nome. ⚠️ **O limite que a decisão respeitou:** a foto de referência tem feltro laranja saturado, e reproduzi-lo gastaria o canal âmbar do aviso de limite — o realismo veio de **luz e textura, não de pigmento**. Seção 11 e a spec da seção atualizadas. Nenhuma regra, critério ou dado mudou. ⚠️ **Pendente de aprovação** |
| **v1.10** | 2026-08-12 | **O item 4 da D4 sai do papel: o lugar na mesa vira campo.** O número do lugar deixa de ser a posição num array ordenado por hora de confirmação — quem fechava a conta fazia todo mundo andar uma cadeira, e o lugar que o operador tocava era descartado. Agora `lugar` é campo próprio da Participação (seção 9), a ação de sentar aceita a cadeira escolhida, e o banco garante um jogador por lugar entre as contas **abertas**, com a conta encerrada guardando o número que teve (N13). ⚠️ **Meio caminho, de propósito:** a camada visual não entrou, então o estado *reservado* ainda não existe em tela e o critério **A26 continua como está** — ele só muda quando a cadeira reservada for desenhada. Registrados também dois achados de reprodutibilidade, **X12** (banco sem grants versionados) e **X13** (o Design OS não versiona o produto que desenha). ⚠️ **Pendente de aprovação** |
| **v1.9** | 2026-08-12 | ✅ **D5 ratificada** pelo dono do processo: a autenticação de verdade entra como **F14**, com o critério **A27** e o estado de tela **Entrada**, e é **não cortável** — voltar atrás devolveria a credencial para dentro do código que o navegador baixa. Ela sai de "fora do escopo" na seção 13, onde ficam agora só os itens que ela **não** trouxe: níveis de permissão, troca de usuário e recuperação de senha pela tela. Dois riscos novos, que são a consequência honesta da decisão: **R11**, a sessão cair no meio da noite sem modo offline, e **R12**, a conta do operador não existir quando a noite vai começar. A credencial de demonstração saiu do protótipo e do pacote, e os três `Login.tsx` voltaram a ser byte a byte idênticos. Fecha o desacordo **X2**. ⚠️ **Pendente de aprovação** |
| **v1.8** | 2026-08-12 | **Auditoria cruzada entre PRD, protótipo e app implementado, e a rotina que impede isso de acontecer de novo.** ✅ **D4 ratificada** pelo dono do processo: a mesa ao vivo entra como **F13**, com o critério **A26** e o estado de tela próprio, e passa a ser a primeira a cair na ordem de corte — a D4 lista os quatro itens que a ratificação ainda obriga, porque a tela nasceu no código e nunca voltou para as specs. 🔴 Nasce a **D5**: a autenticação de verdade foi construída contra a seção 13 e espera decisão. Criada a seção **Registro de mudanças do sistema**, com os dez desacordos abertos (X1 a X10) e as mudanças que não mexeram no produto. O PRD entra em **git** pela primeira vez, e um **Stop hook** passa a impedir que código de produto fique mais novo que este documento. ⚠️ **Pendente de aprovação** |
| **v1.7** | 2026-08-12 | **Auditoria contra o protótipo — 6 desvios fechados.** A conta do checkpoint foi escrita (seção 7), com a pendência de confirmação marcada em vermelho; os dois motivos de exceção ganharam campos separados na seção 9; **N19** e **A24** definem a divergência da noite como a soma dos checkpoints; **F12** e **A25** registram o painel da noite, que existia sem documento; a autenticação entra explicitamente em fora de escopo, com a porta de demonstração descrita; **D4** registra que a mesa visual foi construída contra o que estava escrito, e devolve a decisão ao dono do processo. Ordem de corte atualizada. ⚠️ **Pendente de aprovação** |
| v1.0 | 2026-08-11 | Versão inicial, aprovada após brainstorm de 3 alternativas |
| v1.1 | 2026-08-11 | **WhatsApp e CPF passam a ser coletados sempre**, por determinação do dono do processo. Critérios A15 a A17 adicionados; riscos R7 a R10 de LGPD e política de recusa; nota de que o argumento de "menos dado pessoal" caiu |
| v1.2 | 2026-08-11 | **Obrigatórios: nome e WhatsApp. CPF volta a opcional.** A identidade passa a ser o par nome + WhatsApp. Mesmo WhatsApp com nome diferente é permitido. Critérios A15 a A18 reescritos; riscos R7, R9 e R10 recalibrados |
| v1.3 | 2026-08-11 | **Regra N15: sem WhatsApp não joga**, sem escalação e sem exceção — confirmada pelo dono do processo. Tela de cadastro adicionada aos estados; critério A19 |
| v1.4 | 2026-08-11 | ✅ **Hipótese H1 confirmada** pelo dono do processo: o modo de falha é esquecimento, nunca má-fé. A escolha do aceite presencial passa a se apoiar em histórico verificado, não em suposição |
| v1.6 | 2026-08-11 | **Segunda auditoria — 10 achados fechados.** Definido o ciclo de vida da movimentação (N18, A22), que faltava para N6, N7, A9 e A10 fazerem sentido; criada a **F11, registro de contingência** (N16, A20, A21), que a `DEC-006` e a `ARV` A2 exigiam e o produto não tinha; faixas de divergência da `ARV` A3 chegam ao painel (N17, A23); cadastro e contingência entram no escopo do MVP; cascata do corte de F8 documentada; cadastro entra na jornada; resíduo de "CPF obrigatório" removido; hipótese H5 (orçamento); teste do caso B14 na definição de pronto; rastreabilidade atualizada |
| v1.5 | 2026-08-11 | Revisão de consistência: **F10 (cadastro do jogador)** adicionada — havia 5 critérios sem funcionalidade; ordem dos critérios A15–A19 corrigida; ordem de corte deixa de contradizer a DEC-006; consequência de D1 marcada como aplicada; dependência de coleta anotada em F8 |
