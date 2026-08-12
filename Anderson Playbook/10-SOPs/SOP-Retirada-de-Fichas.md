---
owner: Anderson
version: v0.7
updated: 2026-08-11
status: rascunho
estado: TO-BE
sistema: Caixa Vivo (StackTrack R1)
---

# SOP: Retirada de Fichas (buy-in e recompra)

> Estado **TO-BE** — processo com o **Caixa Vivo**, a release 1 do
> StackTrack. Corrige os gargalos G1 e G2 do [[BRIEF-Sessao-Poker]].
> Durante o modo sombra, roda em paralelo ao papel.
>
> ⚠️ **v0.2 mudou o modo de aceite.** O aceite deixou de ser por link no
> celular do jogador e passou a ser **presencial, na tela do operador**.
> A mudança está justificada na seção *Por que o aceite é presencial*
> e o que volta na release 2 está em *O que muda no R2*.
> Origem da decisão: `docs/PRD.md` (Caixa Vivo, seção 17).

## Gatilho

Jogador pede fichas ao responsável — seja o buy-in inicial (na chegada)
ou uma recompra durante a sessão.

## Responsáveis

| Papel | O que faz neste procedimento |
|---|---|
| Responsável pelas fichas | Lança o valor, gira a tela e entrega as fichas |
| **Jogador** | Confere o valor **na tela** e confirma com o próprio toque |
| Sistema | Confronta com o limite, registra a confirmação como presencial |

## Regra central

> **A ficha não sai da bandeja antes da confirmação registrada.**
> É isso que elimina G1: o registro deixa de competir com a atenção do
> responsável em horário de pico. Cada pedido vira uma transação com fila
> própria.

## Passos

| # | Passo | Responsável | Ferramenta | Critério de conclusão |
|---|---|---|---|---|
| 1 | Selecionar o jogador na mesa | Resp. fichas | App admin | Jogador consta como ativo na sessão |
| 2 | Lançar o valor solicitado | Resp. fichas | App admin | Valor conferido na tela antes de seguir |
| 3 | **Conferir a exposição contra o limite** | Sistema | Automático | Tela mostra quanto o jogador já retirou e qual o limite dele |
| 4 | **Girar a tela para o jogador** | Resp. fichas | App admin | Valor visível para o jogador, em tamanho legível |
| 5 | **Conferir o valor e confirmar** | **Jogador** | Tela do operador, toque do próprio jogador | Confirmação registrada |
| 6 | Registrar a confirmação com valor, horário e modo presencial | Sistema | Automático | Movimentação com status `confirmada` |
| 7 | **Só então** entregar as fichas | Resp. fichas | Bandeja | Status `confirmada` visível na tela do admin |

> ⚠️ **O passo 5 é do jogador, não do responsável pelas fichas.**
> Girar a tela é do responsável. **Tocar em confirmar é do jogador.**
> Se o responsável confirmar no lugar dele, a prova perde valor e o
> procedimento falha em silêncio — exatamente como acontecia com a
> assinatura no papel, feita sem olhar.

## Por que o aceite é presencial nesta versão

| Fator | Aceite por link (R2) | Aceite presencial (R1) |
|---|---|---|
| Depende do jogador ter celular, internet e atender | **Sim** | Não |
| Depende de envio por WhatsApp | Sim | Não |
| Custo de construção | Alto — token, expiração, assinatura, armazenamento, LGPD | Baixo |
| Jogador vê o valor antes de confirmar (M3) | Sim | **Sim** |
| Registro sobrevive à sessão (M5) | Sim | **Sim** |
| Prova contra contestação de **má-fé** | Sim | **Não** |

O modo de falha registrado no [[BRIEF-Sessao-Poker]] é contestação **de
boa-fé**: o jogador esquece que pegou e olha só o total no fechamento. O
que corrige isso é ele **ter olhado o número** — e olhar o número não
exige aparelho próprio.

> ⚠️ **O que se perde precisa ficar claro.** A confirmação na tela do
> operador é prova mais fraca do que a confirmação no aparelho do jogador.
> Ela não prova posse. Contra um jogador agindo de má-fé, ela não segura.
> Por isso o registro guarda o modo **presencial** de forma explícita — e
> não como se fosse a mesma coisa. Quando o R2 chegar, os dois modos
> precisam ser distinguíveis no dado, senão não há como medir se a prova
> melhorou.

## Decisões

| Se... | Então... |
|---|---|
| Jogador **recusa** o lançamento | Transação cancelada. Ficha não sai. Responsável confere o valor e relança. Isso é o sistema funcionando, não uma falha |
| Jogador **se recusa a olhar** a tela ou a confirmar | **Não entregar.** Se ainda assim for preciso entregar, é liberação com **motivo escrito** — não é contingência · [[ARV-Limites-de-Autoridade]] A2 |
| O operador confirma **sem o jogador ter olhado** | **Isso é contingência.** Registrar com motivo, teto de 3 por sessão · ver *Caminho de contingência* abaixo |
| Jogador **não está presente** — alguém pede fichas por ele | Não entregar. A confirmação exige o jogador na frente da tela |
| É o **primeiro** lançamento do jogador | Precede o cadastro: **nome e WhatsApp** (obrigatórios), CPF (opcional), limite de crédito e consentimento · ver *Identificação do jogador* abaixo |
| Jogador **se recusa** a informar o CPF | Prosseguir. **O campo é opcional** |
| Jogador **se recusa** a informar o WhatsApp | **Não cadastra, não joga.** Sem escalação e sem exceção · ver *Regra do WhatsApp* abaixo |
| O par **nome + WhatsApp já existe** no clube | É a mesma pessoa. Usar o cadastro existente, nunca criar um segundo |
| Mesmo WhatsApp, **nome diferente** | Permitido — casal, pai e filho. O app pede confirmação de que é outra pessoa |
| Valor faz o jogador **passar do limite** | Bloquear. Liberação exige ação explícita, com **motivo escrito e registrado** — ver limitação abaixo |
| Jogador tem lançamentos **aguardando confirmação** | Contam para o limite, somados aos já confirmados. Dois pedidos que juntos estouram o limite bloqueiam o segundo |
| Jogador **encerra a conta** com lançamento aguardando confirmação | O lançamento é cancelado automaticamente. Ficha não sai |
| Lançamento fica **aguardando confirmação** por muito tempo | Continua aguardando. **Não expira por tempo** nesta versão — sai só por confirmação, recusa ou encerramento da conta · regra N18 do `docs/PRD.md` |
| Pedidos **simultâneos** de vários jogadores | Cada um vira transação independente. Ordem de entrega segue a ordem de confirmação, não a ordem do pedido |

> ⚠️ **Limitação desta versão na liberação acima do limite.**
> A [[ARV-Limites-de-Autoridade]] manda escalar para o dono (N2). No R1
> existe **um operador só**, e na fase de piloto ele é o próprio dono.
> Então "escalar" vira **"assumir por escrito"**: a exceção fica
> registrada com motivo, mas não há controle de duas pessoas.
> Volta a ser escalação de verdade quando o app tiver mais de um usuário.

## Caminho de contingência — quando o jogador não olha a tela

> 🆕 **Novo na v0.7.** O Caixa Vivo passou a ter registro próprio para
> isso · funcionalidade **F11** e regra **N16** do `docs/PRD.md`. Antes a
> regra existia na [[ARV-Limites-de-Autoridade]] A2 e **não tinha onde ser
> registrada**.

Contingência aqui é **uma situação só**: o operador confirma sem o jogador
ter olhado a tela. É o que acontece no pico, quando o jogador diz "pode
ir, confio".

| # | Passo | Responsável | Ferramenta | Critério de conclusão |
|---|---|---|---|---|
| 5a | Marcar *"o jogador não olhou"* na tela de confirmação | Resp. fichas | App admin | Contingência aberta |
| 5b | Escrever o motivo | Resp. fichas | App admin | Motivo salvo junto da movimentação |
| 5c | Conferir o contador da sessão | Sistema | Automático | Tela mostra "contingência N de 3" |

**Teto: 3 por sessão.** Da 4ª em diante o app bloqueia e a ficha não sai
· [[ARV-Limites-de-Autoridade]] A2.

> ⚠️ **Contingência baixa demais também é sinal.** Numa sessão movimentada,
> zero contingência pode significar que o operador está confirmando no
> lugar do jogador **sem registrar** — o caso B11, que o sistema não
> detecta. O número serve nos dois sentidos: alto demais e baixo demais.

## Identificação do jogador

> 🔄 **Reescrito na v0.5.** Obrigatórios: **nome e WhatsApp**. O CPF volta
> a ser opcional. Resolve o caso de borda B12 da
> [[ARV-Limites-de-Autoridade]].

### A chave de identidade é o par

> **nome + WhatsApp**, único dentro do clube.
>
> Duas pessoas não repetem essa combinação. É isso que diz se dois
> cadastros são o mesmo ser humano.

| Campo | Obrigatório | Papel |
|---|:--:|---|
| **Nome ou apelido** | ✅ | Metade da chave. E é o que o operador lê na mesa às 23h |
| **WhatsApp** | ✅ | Outra metade da chave. E é por onde o link vai chegar na release 2 |
| **CPF** | ❌ | Só quando o jogador quiser dar. Serve para cobrança e para conferência formal |

> **Separação importante:** a chave resolve a identidade **no banco de
> dados**. Ela não resolve a escolha errada **na mesa** — ninguém confere
> WhatsApp no meio de uma recompra. Por isso a regra de seleção abaixo
> continua valendo.

### Regra de cadastro

| # | Regra |
|---|---|
| 1 | Cadastro exige nome, WhatsApp, limite de crédito e consentimento. **CPF é opcional** |
| 2 | **O par nome + WhatsApp é único no clube.** Se já existir, é a mesma pessoa: usar o cadastro que já está lá |
| 3 | Mesmo WhatsApp com **nome diferente é permitido** — casal, pai e filho, quem divide o aparelho. O app pede confirmação de que é outra pessoa mesmo |
| 4 | Nome repetido com WhatsApp diferente: são pessoas diferentes. **Acrescentar um distintivo que sirva na mesa** — sobrenome, apelido do clube, o que a turma usa |
| 5 | ❌ **Proibido numerar.** "João 2" não distingue ninguém às 23h — o operador não sabe qual João está na frente dele |
| 6 | **Sem WhatsApp não há cadastro, e sem cadastro não há ficha.** Regra dura · ver abaixo |

### Regra do WhatsApp

> 🔒 **Sem WhatsApp não joga.**
> Confirmado pelo dono do processo em 2026-08-11 · pergunta P10 do
> [[checklist-confirmacao-r1]].

| Ponto | Como fica |
|---|---|
| **Escalação** | Não existe. Não é caso de chamar o dono — é regra do clube |
| **Exceção** | Nenhuma. Nem para jogador conhecido, nem para o primeiro buy-in |
| **Contingência** | Não se aplica. Contingência é para o **sistema** fora do ar, não para cadastro incompleto · ver [[SOP-Contingencia-de-Sistema]] |
| **Sistema fora do ar** | A ficha de papel também exige o WhatsApp. O cadastro é digitado na reconciliação |
| **Como mudar** | Só com decisão nova registrada em `20-Decisoes/`. Não se muda na mesa |

**Como explicar ao jogador, em uma frase:**

> *"É o número que recebe o comprovante das suas fichas. Sem ele, não
> consigo registrar."*

Enquadrar como **proteção dele**, não como exigência do clube. O número é
o que vai levar o comprovante ao celular dele na release 2.

### O que isso adianta para a release 2

Coletar o WhatsApp agora significa que o link de aceite do R2 **não precisa
de uma nova rodada de cadastro**. Quando a release 2 entrar, o canal já
está lá, para todo mundo.

> ⚠️ **Consequência a resolver no R2:** se duas pessoas dividem o mesmo
> WhatsApp, os dois links chegam no mesmo aparelho. Quem confirma pode ser
> o jogador errado. Não é problema no R1 — a confirmação é presencial —
> mas precisa de resposta antes do R2.

### Regra de seleção na mesa

Quando dois jogadores da sessão tiverem nomes que começam igual, a lista
da mesa mostra, ao lado de cada um:

- **hora em que entrou** na sessão;
- **saldo atual**.

O operador distingue por contexto, não por nome.

> ⚠️ **Selecionar o jogador errado não quebra o caixa.** O total continua
> fechando — o valor saiu de verdade. O que fica errado é o **extrato de
> duas pessoas**: uma leva ficha que não pegou, a outra não leva a que
> pegou.
>
> O invariante `Σ saldos = −rake` **não detecta esse erro.** A única
> detecção é o **extrato linha a linha no fechamento**, quando o jogador
> confere e reclama · ver [[SOP-Devolucao-e-Fechamento]] passo 5.
>
> Por isso o passo do extrato **não pode ser pulado**, nem para o jogador
> apressado que "só quer o total".

## Critério de conclusão

- [ ] Confirmação registrada com valor, horário e modo presencial
- [ ] Fichas fisicamente entregues ao jogador
- [ ] Saldo do jogador atualizado na mesa
- [ ] Exposição total da sessão atualizada

## Exceções

> ⚠️ **Contingência mudou de causa.** No desenho anterior, contingência
> era o jogador sem celular ou sem internet. **Isso deixou de existir** —
> nada depende do aparelho dele.
>
> Contingência agora é uma só situação: **o operador confirma sem o
> jogador ter olhado**. Exige justificativa registrada, e vale o mesmo
> teto da [[ARV-Limites-de-Autoridade]] A2 — **3 por sessão**, depois
> disso bloqueia.
>
> ✅ A A2 foi reescrita na v3.0 da árvore. O **procedimento** está na
> seção *Caminho de contingência* acima; o **registro** existe no produto
> desde a F11 do `docs/PRD.md`.

> ⚠️ Se as contingências forem muitas, o processo está sendo burlado e a
> prova volta a ser frágil. O relatório da sessão lista todas.

> ⚠️ Recompra é a etapa de maior volume — **15×/sessão (C)**, a 3 min cada.
> Se o tempo por lançamento piorar em relação ao papel, o piloto falhou
> mesmo com o caixa fechando. Girar a tela adiciona um gesto: **medir
> isso é o teste mais importante do modo sombra.**

## O que muda no R2

A release 2 devolve o aceite ao aparelho do jogador. Quando isso
acontecer, este SOP muda assim:

| Passo | R1 (hoje) | R2 |
|---|---|---|
| 4 | Girar a tela para o jogador | Sistema envia link ao WhatsApp do jogador |
| 5 | Jogador confirma na tela do operador | Jogador confere e assina no próprio celular |
| 6 | Registro como **presencial** | Registro com assinatura, dispositivo e endereço de origem |
| Contingência | Jogador não olhou | Volta a ser: sem celular, sem internet, sem resposta |

O aceite presencial **não desaparece no R2** — ele volta ao papel de
contingência que a A2 já previa.

## Relacionado

- [[BRIEF-Sessao-Poker]] · etapas 3 e 4 do AS-IS, gargalos G1 e G2
- [[DEC-001-arquitetura-cliente-web]]
- [[DEC-002-aceite-em-toda-movimentacao]] · **tensionada nesta versão:**
  a movimentação continua exigindo confirmação da contraparte, mas o meio
  mudou
- [[ARV-Limites-de-Autoridade]] v3.5 · A1, A2 e A3 · ✅ sincronizadas
- [[SOP-Devolucao-e-Fechamento]]
- [[SOP-Conferencia-de-Caixa]]
- [[MOC-StackTrack]]
- `docs/PRD.md` — PRD do Caixa Vivo, origem desta mudança

## Pendências abertas por esta versão

- [x] ~~Atualizar [[ARV-Limites-de-Autoridade]]~~ · feito na v3.0 da árvore
- [x] ~~Revisar [[DEC-002-aceite-em-toda-movimentacao]] ou registrar
      decisão nova~~ · registrada em [[DEC-006-aceite-presencial-no-r1]]
- [x] ~~Definir como identificar dois jogadores de mesmo nome~~ · resolvido
      na v0.5 pelo par **nome + WhatsApp** (caso B12)
- [x] ~~Política quando o jogador recusa o CPF~~ · campo é opcional, o
      cadastro segue. O caso B3 do [[relatorio-qa-v2]] volta a passar
- [ ] 🔴 **Dois links no mesmo aparelho.** Se duas pessoas dividem o
      WhatsApp, o R2 manda os dois aceites para o mesmo celular. Sem efeito
      no R1; precisa de resposta antes do R2
- [ ] **CPF exige proteção quando informado.** Pendência aberta na
      [[SPEC-Modelo-de-Dados-Supabase]] — vale para os jogadores que derem
      o número, não para todos
- [ ] 🔴 **Retenção sem expurgo** — bloqueio B2 do [[QA-Playbook-2026-08-11]].
      Vale para nome, WhatsApp e histórico financeiro, mesmo sem CPF
- [ ] 🔴 **Quem enxerga o limite de crédito e o histórico?** Se o operador
      for o responsável pelas fichas, ele vê o de todos · bloqueio B1 do QA
- [x] ~~Definir como o registro marca `presencial` de forma distinguível do
      aceite no aparelho do jogador~~ · a Confirmação guarda o modo, e a
      contingência é registro à parte · `docs/PRD.md` seção 9 e F11
- [ ] Medir o tempo da etapa 4 no modo sombra, contra os 3 min (C) do papel
- [ ] Rodar o teste de clareza: entregar este SOP impresso ao responsável
      pelas fichas, sem explicar nada, e contar as perguntas
      · ver [[QA-Playbook-2026-08-11]]

## Histórico de mudanças

| Versão | Data | Autor | O que mudou |
|---|---|---|---|
| v0.1 | 2026-08-11 | Anderson | Criação. Aceite por link no celular do jogador |
| v0.2 | 2026-08-11 | Anderson | Aceite passa a ser **presencial na tela do operador**; passo de conferência de limite adicionado; contingência muda de causa; CPF sai do cadastro; correção de `~20×/sessão (H)` para `15×/sessão (C)` conforme o briefing; seção *O que muda no R2* |
| v0.3 | 2026-08-11 | Anderson | Seção *Identificação do jogador* — resolve o caso B12 (nome único por clube, distintivo real em vez de numeração, distinção por hora de entrada e saldo na mesa); registrada a cegueira do invariante à troca de jogador |
| v0.4 | 2026-08-11 | Anderson | **WhatsApp e CPF passam a ser coletados sempre.** CPF vira a chave de identidade; WhatsApp vira o canal já pronto para o R2 e restaura o caso B6. Consentimento passa a cobrir o CPF explicitamente. ⚠️ Quebra o caso B3 do [[relatorio-qa-v2]], que passava por o CPF ser opcional |
| v0.5 | 2026-08-11 | Anderson | **Obrigatórios: nome e WhatsApp. CPF volta a ser opcional.** A chave de identidade passa a ser o **par nome + WhatsApp**, único no clube. Mesmo WhatsApp com nome diferente passa a ser permitido (casal, pai e filho). ✅ O caso B3 do [[relatorio-qa-v2]] volta a passar. ⚠️ Aberta a questão de dois links no mesmo aparelho no R2 |
| v0.6 | 2026-08-11 | Anderson | Seção *Regra do WhatsApp*: **sem WhatsApp não joga**, sem escalação e sem exceção. Política confirmada pelo dono do processo — fecha a pergunta P10 do [[checklist-confirmacao-r1]] |
| v0.7 | 2026-08-11 | Anderson | Seção *Caminho de contingência* — o registro da contingência passou a existir no produto (**F11** e **N16** do PRD v1.6). Recusa do jogador deixa de ser confundida com contingência: recusa bloqueia, contingência registra. Lançamento aguardando confirmação **não expira por tempo** (N18). Marcas 🔴 vencidas sobre a A2 removidas — a árvore está sincronizada desde a v3.0 |
