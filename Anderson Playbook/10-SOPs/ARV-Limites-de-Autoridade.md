---
owner: Anderson
version: v3.5
updated: 2026-08-11
status: ativo
tipo: arvore-de-decisao
sistema: Caixa Vivo (StackTrack R1)
proxima-revisao: após 3 sessões em modo sombra
---

# Árvore de Decisão — Limites de Autoridade e Escalação

> Define **quem resolve o quê, em quanto tempo, sem chamar o dono**.
> É o que transforma delegação de execução em delegação real.
>
> A1–A5 confirmadas pelo dono do processo em 2026-08-11.
> v2.0 incorporou 2 ajustes revelados pela suíte de casos de borda.
> **v3.0 adapta a árvore ao regime de operador único do R1** e ao aceite
> presencial · ver [[SOP-Retirada-de-Fichas]] v0.2 e `docs/PRD.md`.

## Princípio

Todo SOP responde *o que fazer*. Esta árvore responde *quem pode decidir*
— com **limite**, **prazo** e **escalação** — para que uma sessão de 10h
não dependa do dono estar disponível a cada exceção.

## Níveis de escalação

| Nível | Quem | Autoridade | Prazo de resposta |
|---|---|---|---|
| **N1** | Responsável pelas fichas | Executa dentro dos limites pré-definidos | Imediato |
| **N2** | Dono do clube (na mesa) | Libera acima do limite, decide exceções | 5 min |
| **N3** | Administrador geral | Suspende sessão, altera limites, decide fraude | 30 min |

> N3 existe para o caso em que o dono do clube **é parte do problema**
> (divergência no rake que ele mesmo lançou) ou está indisponível.
> Sem N3, o processo trava quando o N2 falha.

---

## ⚠️ Regime de operador único (R1) — leia antes de tudo

O Caixa Vivo tem **um operador por sessão**, sem níveis de permissão. No
piloto silencioso esse operador é o próprio dono do clube.

Isso colapsa a escalação. **Enquanto o R1 estiver em uso, leia a árvore
com esta regra por cima:**

| Onde a árvore diz | No R1, leia |
|---|---|
| "Escalar para N2, 5 min" | **Bloquear.** Liberar só com **motivo escrito e registrado** no app |
| "Escalar para N3, 30 min" | **N3 não existe.** Registrar a ocorrência e resolver fora do sistema, depois da sessão |
| "N1 libera sozinho" | Vale igual — é o caminho normal |

**O que se perde:** o controle de duas pessoas. Uma decisão de exceção
passa a ser tomada e registrada pela mesma pessoa. O registro sobrevive
e é auditável — mas ninguém checa no momento.

**O que se ganha:** nada trava. A sessão não para esperando alguém que
não vai atender.

> 🔴 **Isto ainda não foi confirmado pelo dono do processo.** As A1–A5
> foram confirmadas por ele na v1.0; a adaptação de operador único vem do
> PRD do Caixa Vivo, aprovado no nível de produto. Confirmar antes do
> piloto.

### Linhas da árvore que dependem de módulo ainda não construído

| Bloco | Vale no R1? | Motivo |
|---|---|---|
| A1 | ✅ com adaptação | Limite existe no Caixa Vivo |
| A2 | ✅ com causa nova | Contingência mudou de causa · ver A2 |
| A3 | ✅ com adaptação | Conciliação é o núcleo do R1 |
| **A4** | 🔴 **Não** | Dívida e histórico entre sessões estão fora do escopo do R1. Continua na memória do dono |
| **A5** | ⚠️ parcial | Não há validação de rake pelo dealer no R1 |
| **A6** | ✅ integral | Cadastro do jogador · **única regra sem escalação** |

---

## A1 — Retirada de fichas

```
Jogador pede fichas
│
├─ (confirmadas + AGUARDANDO CONFIRMAÇÃO) ≤ limite_credito?
│  └─ SIM → N1 libera sozinho · imediato
│
└─ NÃO
   └─ N2 · dono decide em até 5 min · se não responder, não entrega
      └─ R1: bloquear · liberar só com motivo escrito e registrado
```

| Condição | Ação | Limite | Escalação | Prazo | No R1 |
|---|---|---|---|---|---|
| Dentro do limite | Liberar | `limite_credito` | — | imediato | igual |
| Acima do limite | Bloquear | — | N2 | 5 min | **Liberação com motivo escrito** |
| N2 indisponível > 5 min | Não entregar | — | N3 | 30 min | **Não entregar. Sem N3** |

> ⚠️ **Ajuste ADJ-1 (v2.0):** o limite conta movimentações **confirmadas +
> aguardando confirmação**. Antes contava só as confirmadas — ver caso de
> borda B4. Continua valendo integralmente no R1.

> ⚠️ **Novo na v3.0:** o Caixa Vivo mostra a exposição do jogador contra o
> limite **na tela, no momento do lançamento** — passo 3 de
> [[SOP-Retirada-de-Fichas]]. A decisão deixa de depender da memória do
> operador dentro da sessão. **Entre sessões, continua dependendo** — o
> histórico de dívida é do R3.

---

## A2 — Contingência de aceite

> 🔄 **Causa reescrita na v3.0.** O aceite deixou de ser por link no
> celular do jogador e passou a ser presencial, na tela do operador.

**No R1, contingência é uma situação só: o operador confirma sem o
jogador ter olhado a tela.**

As causas antigas — jogador sem celular, sem internet, sem resposta —
**deixaram de existir**, porque nada depende do aparelho dele.

| Condição | Ação | Limite | Escalação | Prazo |
|---|---|---|---|---|
| 1ª a 3ª contingência na sessão | N1 autoriza com justificativa registrada | 3 por sessão | — | imediato |
| 4ª em diante | Bloquear | — | N2 → **R1: motivo escrito** | 5 min |
| Jogador **se recusa** a olhar ou a confirmar | Não entregar fichas | — | N2 → **R1: motivo escrito** | 5 min |
| Jogador **não está presente** — outra pessoa pede por ele | Não entregar. Sem exceção | — | — | imediato |

> ⚠️ **O buraco novo do R1, e ele é sério.**
> Com o aceite por link, o sistema conseguia distinguir o aparelho do
> jogador do aparelho do operador. Com o aceite presencial, **tudo vem do
> mesmo aparelho** — e o sistema **não tem como detectar** se foi o
> operador que tocou em confirmar no lugar do jogador.
>
> A única defesa é procedimental, e o único sinal é o **contador de
> contingências**. Contingência baixa demais numa sessão movimentada é
> tão suspeito quanto contingência alta.
>
> Isso volta a ser detectável no R2, quando o aparelho do jogador entrar
> na jogada.

> ✅ **Novo na v3.5: o contador deixou de ser intenção.** Até aqui a A2
> mandava registrar contingência e **nenhum produto registrava**. O Caixa
> Vivo passou a ter a funcionalidade **F11** e a regra **N16** — motivo
> escrito, contador visível na tela, bloqueio na 4ª — com os critérios
> **A20** e **A21** · `docs/PRD.md` v1.6 · procedimento em
> [[SOP-Retirada-de-Fichas]] v0.7, seção *Caminho de contingência*.
>
> ⚠️ **Isso fecha o registro, não a detecção.** Continua sem haver como
> saber se o operador tocou no lugar do jogador — ele simplesmente não
> marca a contingência. O contador é sinal indireto, e continua sendo a
> pergunta P6 do [[checklist-confirmacao-r1]].

### O que muda no R2

As causas antigas voltam: sem celular, sem internet, sem resposta em
2 min. O aceite presencial volta a ser exceção, como era na v2.0.

---

## A3 — Divergência de caixa

| Condição | Ação | Limite | Escalação | Prazo | No R1 |
|---|---|---|---|---|---|
| Divergência com rake **ainda não declarado** | Nenhuma — estado esperado | — | — | — | igual |
| ≤ R$ 100 após lançamento de rake | Registrar e seguir | R$ 100 | — | revisar no encerramento | igual |
| R$ 100 – R$ 500 | Revisar a janela ainda na sessão | R$ 500 | N2 | 5 min | **O próprio operador revisa e registra** |
| > R$ 500 | **Suspender novas retiradas** até apurar | — | N2 | imediato | igual — a suspensão é decisão do operador |
| Divergência na janela em que o rake foi lançado pelo próprio operador | Apurar com terceiro | — | **N3** | 30 min | 🔴 **Sem N3.** Registrar e apurar depois da sessão, com outra pessoa |

> Rationale: o furo típico é R$ 300–1.000. Piso de R$ 100 evita parar por
> ruído; teto de R$ 500 força apuração antes de todo mundo ir embora — o
> gargalo G4 de [[BRIEF-Sessao-Poker]].

> ✅ **Novo na v3.5: as três faixas chegam à tela.** Antes elas viviam só
> aqui, e o operador via *"faltam R$ 480"* sem saber qual das três coisas
> fazer. O painel de conciliação passa a exibir a ação recomendada junto
> do valor · regra **N17** e critério **A23** do `docs/PRD.md` v1.6.
>
> ⚠️ **O app recomenda, não bloqueia.** A suspensão de novas retiradas
> continua sendo decisão do operador, como esta tabela sempre disse.
> Bloquear sozinho criaria um jeito novo de a sessão travar — exatamente
> o que o ajuste **ADJ-2** corrigiu.

> ⚠️ **"Rake pendente" tem dois sentidos no vault.** Em
> [[SOP-Conferencia-de-Caixa]] significa rake que ainda está na mesa, não
> declarado. Em [[SPEC-Modelo-de-Dados-Supabase]] significa rake lançado
> que o dealer ainda não validou. **No R1 vale o primeiro sentido** — não
> existe validação de dealer. Quando o R2 entrar, os dois precisam de
> nomes distintos.

> ⚠️ **A última linha é a mais frágil do R1.** A árvore criou o N3
> justamente para o caso em que o dono é parte do problema. No regime de
> operador único, esse caso fica sem resposta dentro do sistema. O que
> resta é o registro — o Caixa Vivo grava a divergência com valor, janela
> e turno, e ela não pode ser arredondada nem apagada.

---

## A4 — Jogador devedor querendo jogar

> 🔴 **Não executável no R1.** Dívida, acordos e histórico entre sessões
> estão explicitamente fora do escopo do Caixa Vivo — dependem de dado que
> só passa a existir depois de várias sessões registradas. Entra no R3.
>
> **Até lá, esta decisão continua onde está hoje: na memória do dono.**
> A árvore descreve o alvo, não o presente.

| Condição | Ação | Limite | Escalação | Prazo |
|---|---|---|---|---|
| Sem dívida em aberto | Liberar | limite do jogador | — | imediato |
| Dívida com **acordo em dia** | Liberar | limite do jogador | — | imediato |
| Dívida com **acordo vencido** | Bloquear | — | N2 | 5 min |
| Dívida ≥ 2 sessões em aberto | Bloquear | — | N2 | 5 min |

---

## A5 — Pagamento e rake

| Condição | Ação | Limite | Escalação | Prazo | No R1 |
|---|---|---|---|---|---|
| Dealer recusa o valor lançado | Conferir juntos e relançar | 1 relançamento | N2 se persistir | 5 min | 🔴 **Não se aplica** — não há validação de dealer |
| Rake sem validação no encerramento | **Encerrar com pendência registrada** | — | N2 informado | — | 🔴 **Não se aplica** — o rake entra validado no lançamento |
| Jogador contesta linha **com confirmação registrada** | Abrir a prova | — | ver abaixo | imediato | ⚠️ **Mudou** |
| Jogador contesta linha **sem confirmação** (contingência) | Registrar como exceção | — | N2 → **R1: motivo escrito** | 5 min | igual |

> ⚠️ **Ajuste ADJ-2 (v2.0):** encerramento de sessão **não trava** por
> rake não validado. Antes travava — ver caso de borda B5. Fica dormente
> no R1 e volta a valer no R2.

> ⚠️ **Mudança da v3.0 na contestação com prova.**
> A v2.0 dizia: abrir a prova e **decisão encerrada**. Isso valia porque a
> assinatura vinha do aparelho do jogador.
>
> Com a confirmação presencial, a prova mostra **valor e horário**, mas
> **não prova posse**. Contra um jogador insistindo de má-fé, ela não
> encerra a discussão sozinha.
>
> **Nova regra:** abrir a prova. Se o jogador aceitar, encerrado. Se
> insistir, é decisão do dono, e o desfecho é registrado como exceção.
> Cada ocorrência dessas é argumento direto para acelerar o R2.

---

## A6 — Cadastro do jogador

> 🆕 **Novo na v3.4.** Confirmado pelo dono do processo em 2026-08-11
> · pergunta P10 do [[checklist-confirmacao-r1]].

| Condição | Ação | Limite | Escalação | Prazo |
|---|---|---|---|---|
| Nome e WhatsApp informados | Cadastrar e liberar até o limite | `limite_credito` | — | imediato |
| **Jogador se recusa a informar o WhatsApp** | 🔒 **Não cadastra, não joga** | — | **Nenhuma** | — |
| Jogador se recusa a informar o CPF | Cadastrar assim mesmo | — | — | imediato |
| Par nome + WhatsApp já existe no clube | É a mesma pessoa. Usar o cadastro existente | — | — | imediato |
| Mesmo WhatsApp, nome diferente | Permitido, com confirmação de que é outra pessoa | — | — | imediato |

> ⚠️ **A2ª linha é a única regra da árvore inteira sem escalação.**
> Todas as outras têm um nível acima que pode liberar. Essa não tem — nem
> o N2, nem o N3. Não é julgamento sobre a pessoa, é condição de entrada.
>
> Mudar exige **decisão nova registrada** em `20-Decisoes/`. Não se muda
> na mesa, nem "só dessa vez".

> ⚠️ **Não confundir com contingência.** Sistema fora do ar não libera
> cadastro sem WhatsApp — a ficha de papel de
> [[SOP-Contingencia-de-Sistema]] também exige o número.

---

# Suíte de casos de borda

10 casos testados contra a árvore em 2026-08-11. `Resultado` = o que a
árvore produziu na leitura. `Veredito` = correto ou exigiu ajuste.
Coluna `R1` adicionada na v3.0.

| # | Caso | Esperado | Resultado da árvore | Veredito | R1 |
|---|---|---|---|---|---|
| B1 | Jogador confirma retirada **depois** de sair da mesa | Confirmação inválida; fichas não saem | Árvore não cobria — token só expirava por tempo | 🔴 **Ajuste** → ADJ-3 | ✅ vale |
| B2 | Rake lançado no minuto exato da troca de turno | Atribuir ao turno da hora da retirada | Correto — [[DEC-003-uma-mesa-por-sessao]] resolve | ✅ | ✅ **núcleo do R1** |
| B3 | Caixa não fecha **e** houve contingência na mesma janela | Investigar a contingência primeiro | Árvore mandava só escalar por valor | 🟡 Refinado em A3 | ✅ vale |
| B4 | Jogador com 2 retiradas **aguardando confirmação** que juntas estouram o limite | Bloquear a segunda | Árvore liberava — contava só as confirmadas | 🔴 **ADJ-1** | ✅ vale |
| B5 | Dealer some antes de validar o rake do último turno | Encerrar sessão com pendência registrada | Árvore travava o encerramento — **deadlock** | 🔴 **ADJ-2** | 🔴 dormente |
| B6 | Dois jogadores com o mesmo WhatsApp | Não duplicar; conferir se é a mesma pessoa | Correto — índice único no banco | ✅ | ⚠️ **Regra mudou na v3.3.** A chave passou a ser o par nome + WhatsApp. Mesmo WhatsApp com nome diferente é **permitido**, com confirmação — casal, pai e filho |
| B7 | Divergência de R$ 480 na janela em que o próprio dono lançou o rake | Escalar para N3, não para o N2 envolvido | Árvore mandava para N2 | 🟡 Refinado em A3 | 🔴 **sem N3** |
| B8 | 4ª contingência da sessão, dono indisponível | Não entregar fichas | Correto — A2 escala e bloqueia | ✅ | ✅ vale |
| B9 | Jogador quita dívida no meio da sessão | Voltar a adimplente e liberar até o limite | Correto — A4 + [[SOP-Cobranca-de-Jogador-Devedor]] | ✅ | 🔴 A4 fora do R1 |
| B10 | Sessão encerra com jogador ainda na mesa | Não encerrar | Correto — [[SOP-Abertura-e-Encerramento-de-Sessao]] | ✅ | ✅ vale |

**Placar v2.0:** 6 corretos · 2 refinamentos · 3 ajustes estruturais.
**No R1:** 6 valem · 4 dormentes por dependerem de módulo fora do escopo.

## Casos de borda novos do R1 — não testados

Nascem do aceite presencial e do operador único. **Nenhum foi rodado
contra a árvore ainda.**

| # | Caso | Esperado | Situação |
|---|---|---|---|
| **B11** | Operador toca em confirmar no lugar do jogador | Não deveria acontecer | 🔴 **Sem detecção possível.** Mesmo aparelho, mesmo dedo. 🟡 **Parcial na v3.5:** o contador de contingências passou a existir de fato (F11/N16 do PRD). Dá sinal indireto — nos dois sentidos, alto demais e baixo demais numa sessão movimentada |
| **B12** | Dois jogadores com o mesmo apelido na mesma mesa | Não duplicar; distinguir na hora do cadastro | ✅ **Resolvido** em [[SOP-Retirada-de-Fichas]] v0.5: a chave é o **par nome + WhatsApp**, único no clube. Nome pode repetir com WhatsApp diferente, exigindo distintivo real. Na mesa, a lista distingue por hora de entrada e saldo |
| **B13** | Jogador confirma R$ 500 e o operador entrega valor diferente | Divergência aparece no próximo checkpoint de rake | 🟡 O invariante pega, mas só na próxima janela — não no ato |
| **B14** | Operador seleciona o jogador errado na mesa | Extrato de dois jogadores fica errado | 🔴 **O invariante não detecta.** O total fecha, porque a ficha saiu de verdade. A única detecção é o extrato linha a linha no fechamento. 🟡 **v3.5:** virou teste obrigatório na definição de pronto do `docs/PRD.md` — provar que o caixa fecha mesmo com o erro |
| **B15** | Jogador se recusa a informar o CPF | Prosseguir — campo opcional | ✅ **Fechado na v3.3.** O CPF voltou a ser opcional em [[SOP-Retirada-de-Fichas]] v0.5. O caso B3 do [[relatorio-qa-v2]] volta a passar |
| **B16** | Duas pessoas dividem o mesmo WhatsApp | R1: sem efeito. R2: os dois links chegam no mesmo aparelho | 🔴 **Aberto para o R2.** No R1 a confirmação é presencial, então não há problema. No R2, quem confirma pode ser o jogador errado |

---

## Ajustes aplicados na v2.0

### ADJ-1 — Limite deve contar o que aguarda confirmação (caso B4)

**Falha:** duas retiradas lançadas, cada uma dentro do limite, mas somadas
o estouram. A árvore liberava as duas porque só contava movimentações
já confirmadas.

**Correção:** a verificação de limite passa a somar
`confirmadas + aguardando confirmação`.

**Impacto além da árvore:** afeta o modelo de dados. A query de exposição
em [[SPEC-Modelo-de-Dados-Supabase]] precisa incluir o que está pendente.
Sem isso, a regra escrita não é a regra executada.

### ADJ-2 — Encerramento não trava por rake pendente (caso B5)

**Falha:** [[SOP-Rake-e-Turno-do-Dealer]] bloqueia a apuração sem
validação do dealer, e [[SOP-Abertura-e-Encerramento-de-Sessao]] exige
todo rake validado para encerrar. Dealer que vai embora sem validar
**trava a sessão indefinidamente** — deadlock entre dois SOPs.

**Correção:** a sessão encerra com a pendência registrada. O que fica
bloqueado é o **pagamento daquele dealer**, não a operação do clube.

**No R1:** dormente. Volta a valer quando a validação do dealer entrar.

### ADJ-3 — Confirmação expira ao encerrar a participação (caso B1)

**Falha:** o token de aceite só expirava por tempo. Jogador que sai da
mesa e confirma depois criaria movimentação válida para fichas que nunca
foram entregues.

**Correção:** ao encerrar a participação, todas as movimentações
aguardando confirmação daquele jogador são canceladas.

**Impacto além da árvore:** exige regra no banco — cancelamento em
cascata no encerramento da participação. Vale integralmente no R1.

---

## Pendências

- [x] ~~Aplicar ADJ-1 e ADJ-3 na spec de dados~~ · continuam pendentes de
      implementação, mas agora estão no PRD do Caixa Vivo como regras
      N6 e N7 e como critérios A9 e A10. **v3.5:** o PRD passou a definir
      também o **ciclo de vida** da movimentação — regra N18 e critério
      A22 — sem o qual as duas não tinham como ser testadas
- [ ] 🔴 **Confirmar o regime de operador único com o dono do processo.**
      As A1–A5 foram confirmadas por ele; a adaptação do R1 não.
      Roteiro pronto em [[checklist-confirmacao-r1]] · é a falha **F4** do
      [[relatorio-qa-v2]]
- [x] ~~B12 — definir como distinguir dois jogadores de mesmo apelido~~ ·
      resolvido em [[SOP-Retirada-de-Fichas]] v0.3
- [ ] 🔴 **B11 — decidir se o contador de contingências é defesa
      suficiente** contra o operador confirmar no lugar do jogador, ou se
      isso antecipa o R2 · pergunta **P6** do [[checklist-confirmacao-r1]].
      ✅ O contador **existe** desde a v3.5 (F11 do PRD); o que falta é o
      dono do processo dizer se aceita o risco
- [x] ~~🔴 **B14 — a troca de jogador é invisível ao invariante.** Decidir
      se o extrato no fechamento é detecção suficiente~~ · **decidido: é
      a única detecção que existe**, e por isso virou teste obrigatório na
      definição de pronto do `docs/PRD.md` v1.6. O passo do extrato não
      pode ser pulado · [[SOP-Retirada-de-Fichas]] *Regra de seleção na mesa*
- [ ] 🔴 **B16 — dois links no mesmo aparelho.** Sem efeito no R1; precisa
      de resposta antes do R2
- [ ] Rodar B11, B13, B14 e B16 contra a árvore
- [ ] Revalidar a suíte após 3 sessões em modo sombra
- [ ] Definir quem exerce o N3 na prática quando o app tiver mais de um
      usuário (sócio? administrador geral?)

## Relacionado

- [[SOP-Retirada-de-Fichas]] v0.2 · [[SOP-Conferencia-de-Caixa]]
- [[SOP-Cobranca-de-Jogador-Devedor]] · [[SOP-Rake-e-Turno-do-Dealer]]
- [[SOP-Abertura-e-Encerramento-de-Sessao]]
- [[SPEC-Modelo-de-Dados-Supabase]] · [[BRIEF-Sessao-Poker]] · [[MOC-StackTrack]]
- `docs/PRD.md` — PRD do Caixa Vivo, origem das mudanças da v3.0

## Histórico de mudanças

| Versão | Data | Autor | O que mudou |
|---|---|---|---|
| v0.1 | 2026-08-11 | Anderson | Criação. A1 confirmado; A2–A5 propostos |
| v1.0 | 2026-08-11 | Anderson | A2–A5 confirmadas. Promovida a `ativo` |
| v2.0 | 2026-08-11 | Anderson | 3 níveis de escalação com prazos; suíte de 10 casos de borda; ADJ-1, ADJ-2 e ADJ-3 aplicados |
| v3.0 | 2026-08-11 | Anderson | Regime de operador único do R1; A2 com causa de contingência reescrita; A4 marcada como não executável no R1; A5 com contestação reaberta por prova mais fraca; coluna `R1` na suíte; casos novos B11, B12 e B13 |
| v3.1 | 2026-08-11 | Anderson | B12 fechado por [[SOP-Retirada-de-Fichas]] v0.3; caso B14 aberto (troca de jogador é invisível ao invariante); pendências ligadas ao [[checklist-confirmacao-r1]] |
| v3.2 | 2026-08-11 | Anderson | CPF e WhatsApp voltam ao cadastro como obrigatórios. B12 passa a ser resolvido pelo **CPF como chave**; **B6 restaurado**; caso novo B15 (recusa de CPF) |
| v3.3 | 2026-08-11 | Anderson | **Obrigatórios passam a ser nome e WhatsApp; CPF volta a opcional.** Chave de identidade = **par nome + WhatsApp**. B6 muda de regra (mesmo WhatsApp com nome diferente é permitido); **B15 fechado**; caso novo B16 (dois links no mesmo aparelho, no R2) |
| v3.5 | 2026-08-11 | Anderson | **A árvore virou produto em três pontos.** A2: o contador de contingências deixou de ser intenção e virou a F11/N16 do PRD v1.6, com bloqueio na 4ª. A3: as três faixas de divergência passam a aparecer no painel como **recomendação**, não bloqueio (N17/A23). ADJ-1 e ADJ-3 ganham o ciclo de vida da movimentação que faltava (N18/A22). B14 fechado: o extrato é a única detecção, e virou teste obrigatório. B11 segue aberto — o registro existe, a detecção não |
| v3.4 | 2026-08-11 | Anderson | **Bloco A6 — Cadastro do jogador.** Registra a política confirmada pelo dono do processo: *sem WhatsApp não joga*, sem escalação e sem exceção. É a única regra da árvore sem nível acima que possa liberar |
