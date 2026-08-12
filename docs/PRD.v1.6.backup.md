---
owner: Anderson
version: v1.6
updated: 2026-08-11
status: aprovado
tipo: prd
produto: Caixa Vivo (StackTrack R1)
fonte: Anderson Playbook — BRIEF-Sessao-Poker, 7 SOPs, ARV-Limites-de-Autoridade, SPEC-Modelo-de-Dados-Supabase, QA-Playbook, PLANO-Adocao-StackTrack
---

# PRD — Caixa Vivo

> Release 1 do StackTrack. Documento aprovado em 2026-08-11.
> Toda evidência citada vem do vault `Anderson Playbook/`.

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

> **F10 e F11 estão fora de ordem de propósito.** O vault não renumera
> identificadores já usados — a mesma regra das decisões `DEC-NNN`. A
> ordem da tabela segue a jornada; o número segue a data de criação.

### O que pode cair se o prazo apertar

**F8 cai primeiro. Depois de F8, corta-se escopo, não funcionalidade.**

⚠️ **Cortar F8 não corta só F8.** Caem junto as regras N6 e N10, os
critérios A8 e A9, metade do A15, uma linha do escopo do MVP — e o passo
3 do `SOP-Retirada-de-Fichas`, que a árvore de autoridade descreve como
*"a exposição do jogador contra o limite, na tela, no momento do
lançamento"*. É um corte de nove itens, não de um.

**Quatro coisas não são cortáveis, e cada uma por um motivo diferente:**

| Não cai | Por quê |
|---|---|
| **F7** — painel de conciliação | Sem ele não existe produto, só um caderno digital |
| **F10** — cadastro | Sem cadastro não existe ficha. É a regra N15 |
| **A tela de confirmação de F3** | Cortá-la deixa o produto na opção que a `DEC-006` rejeitou por escrito: *"entregar sem confirmação nenhuma reintroduz G2"*. Ela é o que cumpre a métrica M3 |
| **F11** — registro de contingência | Sem ele a `DEC-006` perde o gatilho 2 da própria cláusula de revogação. Ninguém saberia que o aceite presencial falhou |

---

## 9. Dados necessários

Descritos em português. A modelagem técnica não faz parte deste documento.

| Coisa | O que guarda |
|---|---|
| **Clube** | Nome, percentual do rake que vai para o dealer |
| **Sessão** | Clube, hora de abertura, hora de encerramento, caixa inicial de fichas, situação |
| **Jogador** | Nome ou apelido e **WhatsApp** (obrigatórios), CPF (opcional), limite de crédito, data do consentimento, situação |
| **Participação** | Qual jogador, em qual sessão, quando entrou, quando saiu |
| **Dealer** | Nome |
| **Turno** | Qual dealer, em qual sessão, início e fim |
| **Movimentação** | Sessão, participação, turno, tipo, valor, hora em que aconteceu, hora em que foi digitada, situação, quem lançou, justificativa quando houver |
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
| **Sessão** | "Nenhuma sessão aberta. Abrir agora?" com o campo do caixa inicial | Esqueleto do painel | Painel da sessão com o cronômetro rodando | "Já existe sessão aberta neste clube" com link para ela |
| **Mesa** | "Ninguém na mesa ainda. Adicionar jogador" | Lista em cinza | Jogador aparece na lista com saldo zero | "Esse jogador já está na mesa" |
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

**Um clube. Um operador. Uma sessão por vez.**

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
| Mesa visual com 10 lugares | Enfeite antes da prova |
| Liquidação e parcelamento em cartão | O circuito financeiro fica fora; só o circuito das fichas entra |
| Painel do administrador geral | Não há mais de um clube ainda |
| App nativo e publicação em loja | Atrasa o piloto |
| Rotina de expurgo de dados por prazo | Registrado como pendência de LGPD · risco R8. Vale para nome, telefone e histórico financeiro. O CPF é opcional desde a v1.2 |
| Funcionamento sem internet | Registrado como risco R2 |

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

---

## 16. Definição de pronto

O Caixa Vivo está pronto quando:

- [ ] Os 23 critérios de aceitação passam.
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

---

## Histórico de versões

| Versão | Data | O que mudou |
|---|---|---|
| v1.0 | 2026-08-11 | Versão inicial, aprovada após brainstorm de 3 alternativas |
| v1.1 | 2026-08-11 | **WhatsApp e CPF passam a ser coletados sempre**, por determinação do dono do processo. Critérios A15 a A17 adicionados; riscos R7 a R10 de LGPD e política de recusa; nota de que o argumento de "menos dado pessoal" caiu |
| v1.2 | 2026-08-11 | **Obrigatórios: nome e WhatsApp. CPF volta a opcional.** A identidade passa a ser o par nome + WhatsApp. Mesmo WhatsApp com nome diferente é permitido. Critérios A15 a A18 reescritos; riscos R7, R9 e R10 recalibrados |
| v1.3 | 2026-08-11 | **Regra N15: sem WhatsApp não joga**, sem escalação e sem exceção — confirmada pelo dono do processo. Tela de cadastro adicionada aos estados; critério A19 |
| v1.4 | 2026-08-11 | ✅ **Hipótese H1 confirmada** pelo dono do processo: o modo de falha é esquecimento, nunca má-fé. A escolha do aceite presencial passa a se apoiar em histórico verificado, não em suposição |
| v1.6 | 2026-08-11 | **Segunda auditoria — 10 achados fechados.** Definido o ciclo de vida da movimentação (N18, A22), que faltava para N6, N7, A9 e A10 fazerem sentido; criada a **F11, registro de contingência** (N16, A20, A21), que a `DEC-006` e a `ARV` A2 exigiam e o produto não tinha; faixas de divergência da `ARV` A3 chegam ao painel (N17, A23); cadastro e contingência entram no escopo do MVP; cascata do corte de F8 documentada; cadastro entra na jornada; resíduo de "CPF obrigatório" removido; hipótese H5 (orçamento); teste do caso B14 na definição de pronto; rastreabilidade atualizada |
| v1.5 | 2026-08-11 | Revisão de consistência: **F10 (cadastro do jogador)** adicionada — havia 5 critérios sem funcionalidade; ordem dos critérios A15–A19 corrigida; ordem de corte deixa de contradizer a DEC-006; consequência de D1 marcada como aplicada; dependência de coleta anotada em F8 |
