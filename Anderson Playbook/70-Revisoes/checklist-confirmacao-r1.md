---
owner: Anderson
version: v1.5
updated: 2026-08-11
status: ativo
tipo: checklist
alvo: dono do processo (dono do clube)
duracao: 25 min
corrige: relatorio-qa-v2 · F4 (crítico) · caso D3
---

# Checklist de Confirmação — Release 1 (Caixa Vivo)

> **Isto não é um documento para arquivar. É um roteiro de conversa.**
>
> Onze perguntas para o dono do clube, com **o que muda em cada resposta**.
> Sem essas respostas, o piloto sai com premissas fingindo ser fatos.
>
> Fecha a falha **F4** do [[relatorio-qa-v2]] (caso D3) e as pendências
> abertas em [[ARV-Limites-de-Autoridade]] v3.1 e [[BRIEF-Sessao-Poker]].

## Como usar

1. Marcar 20 minutos com o dono do clube. Não fazer por mensagem.
2. Perguntar na ordem. As três primeiras destravam as outras.
3. Anotar a resposta **na hora**, na coluna certa.
4. Depois da conversa, atualizar os documentos listados em cada pergunta.

---

## Bloco 1 — Papéis (falha F4, crítica)

### P1 · O responsável pelas fichas e o dono do clube são a mesma pessoa?

**Por que importa:** sete SOPs falam em "resp. fichas" e "dono" como se
fossem duas pessoas. A [[ARV-Limites-de-Autoridade]] inteira depende
disso — se for a mesma pessoa, ela escala para si mesma.

| Resposta | O que muda |
|---|---|
| **Pessoas diferentes** | A árvore funciona como escrita. Mas o Caixa Vivo tem **um login só** → responder a P2 |
| **Mesma pessoa** | N1 e N2 colapsam. O "assumir por escrito" da v3.0 vira o modo permanente, não uma adaptação temporária |
| **Depende da noite** | Pior caso. A árvore precisa dizer o que vale em cada configuração |

**Atualizar depois:** [[BRIEF-Sessao-Poker]] bloco 4b · [[ARV-Limites-de-Autoridade]]

---

### P2 · Se são duas pessoas, quem opera o app na sessão?

**Por que importa:** o R1 não tem múltiplos usuários. Quem segura o
celular é quem lança tudo.

| Resposta | O que muda |
|---|---|
| **O responsável pelas fichas** | Ele passa a ver o limite de crédito de todos os jogadores. É o bloqueio B1 do [[QA-Playbook-2026-08-11]] virando realidade |
| **O dono** | O resp. fichas continua no papel. É o cenário F1 do [[PLANO-Adocao-StackTrack]] — piloto silencioso |
| **Os dois revezam o mesmo aparelho** | Não dá para saber quem lançou o quê. Registrar como limitação conhecida |

**Atualizar depois:** [[SOP-Retirada-de-Fichas]] · [[PLANO-Adocao-StackTrack]]

---

### P3 · Quando existir o nível 3, quem é?

**Por que importa:** o N3 existe para quando o dono do clube **é parte do
problema** — divergência na janela do rake que ele mesmo lançou. No R1
ele não existe. Precisa existir na vida real, mesmo fora do sistema.

| Resposta | O que muda |
|---|---|
| **Um sócio ou administrador geral** | Nomear. Vira o destino da linha vermelha de A3 |
| **Ninguém, sou só eu** | Registrar honestamente: **o caso A3/N3 não tem resposta**. A divergência fica só registrada, sem apuração independente |

**Atualizar depois:** [[ARV-Limites-de-Autoridade]] A3

---

## Bloco 2 — A hipótese que sustenta a release 1

### ✅ P4 · Já houve jogador contestando de má-fé, ou sempre foi esquecimento?

> **RESPONDIDA em 2026-08-11 pelo dono do processo.**
> Era a pergunta mais importante da lista.

**Resposta:** **Sempre foi esquecimento.** Nunca houve contestação de
má-fé.

| Opção considerada | Escolhida? |
|---|:--:|
| **Sempre foi esquecimento** | ✅ |
| Já teve gente forçando a barra | ❌ |
| Não sei dizer | ❌ |

### O que isso destrava

A hipótese **H1** do PRD deixa de ser suposição e passa a ser **confirmada
pelo histórico da operação**. Com ela, a
[[DEC-006-aceite-presencial-no-r1]] se sustenta:

> Se o jogador contesta porque esqueceu, e não porque quer levar vantagem,
> o que corrige é **ele ter olhado o número**. Olhar o número não exige
> aparelho próprio.

O aceite presencial resolve o problema documentado. O link no celular
continua sendo release 2, como planejado.

### O que isso **não** destrava

⚠️ Confirma o passado, não garante o futuro. A cláusula de revogação da
DEC-006 **continua valendo**: se aparecer contestação de má-fé durante o
piloto, o link deixa de ser release 2 e vira correção urgente.

⚠️ Também não responde a **P5** — aceitar a troca é decisão separada de
constatar que ela resolve o problema.

**Já aplicada em:** [[DEC-006-aceite-presencial-no-r1]] v1.3 ·
`docs/PRD.md` hipótese H1

---

### P5 · Você aceita que, na release 1, o jogador confirme na tela do operador?

**Por que importa:** é uma troca consciente. O jogador vê o valor antes de
confirmar — isso continua. O que se perde é a prova de que foi **ele**
quem confirmou.

| Resposta | O que muda |
|---|---|
| **Aceito** | Seguir. A DEC-006 fica confirmada pelo dono, não só pelo produto |
| **Não aceito** | O R1 muda de escopo. Voltar ao PRD antes de construir qualquer coisa |

**Atualizar depois:** [[DEC-006-aceite-presencial-no-r1]] — status passa de decidido por produto a confirmado pela operação

---

### P6 · Você aceita que o operador possa confirmar no lugar do jogador sem o sistema detectar?

**Por que importa:** caso B11 da árvore. Com a tela girada, tudo vem do
mesmo aparelho. O único sinal indireto é o contador de contingências.

| Resposta | O que muda |
|---|---|
| **Aceito, confio na equipe** | Registrar como risco assumido. Acompanhar o contador de contingências em toda sessão |
| **Não aceito** | Antecipa o R2. O link vira requisito |
| **Aceito se eu vir o número toda sessão** | O contador de contingências entra no relatório da sessão como item de destaque, não como nota de rodapé |

> ✅ **Mudou desde a v1.4 deste checklist.** O contador de contingências
> **passou a existir** — funcionalidade **F11** do `docs/PRD.md` v1.6, com
> motivo escrito, contador na tela e bloqueio na 4ª da sessão.
>
> A terceira opção acima **já está construída**. O que resta perguntar é
> só a primeira coisa: **você aceita o risco?**

**Atualizar depois:** [[ARV-Limites-de-Autoridade]] A2, caso B11

---

## Bloco 3 — Premissas do briefing marcadas (P)

### P7 · Quantas horas por semana você realmente tem para isso?

**Por que importa:** a restrição R5 do [[BRIEF-Sessao-Poker]] assume 10
horas por semana, **como premissa, não como resposta**. O prazo de 90
dias depende disso.

| Resposta | O que muda |
|---|---|
| **10h ou mais** | A premissa vira fato. R5 sai de (P) |
| **Menos de 10h** | 🔴 O prazo de 90 dias cai. Recalcular, ou cortar escopo |

**Atualizar depois:** [[BRIEF-Sessao-Poker]] restrição R5 · remover a marca (P)

---

### P8 · Existe algum dinheiro disponível antes de o piloto provar valor?

**Por que importa:** a restrição R6 assume custo mínimo — camada gratuita,
distribuição interna, nada de serviço pago. Também é premissa.

| Resposta | O que muda |
|---|---|
| **Nenhum, só depois de provar** | R6 confirmada. Sem envio automático por WhatsApp, sem loja de aplicativo |
| **Tem uma verba pequena** | Abre a opção de envio automático no R2 |

**Atualizar depois:** [[BRIEF-Sessao-Poker]] restrição R6 · remover a marca (P) · `docs/PRD.md` hipótese **H5**

---

## Bloco 4 — O dado que precisa sair da cabeça dele

### P9 · Qual o limite de crédito de cada jogador, hoje?

**Por que importa:** não é pergunta de sim ou não — é **coleta**. O gargalo
C2 do [[SOP-Cobranca-de-Jogador-Devedor]] diz que esse número existe só na
memória do dono. Sem ele preenchido, a funcionalidade F8 do Caixa Vivo
nasce vazia e inútil.

**Como fazer:** listar os jogadores recorrentes e anotar o limite de cada
um. Vinte minutos de conversa valem mais que qualquer tela.

| Situação | O que fazer |
|---|---|
| Ele sabe de cabeça | Anotar. É o cadastro inicial |
| Ele diz "depende do dia" | Anotar o teto de cada um e registrar que há discricionariedade |
| Ele não quer definir | F8 sai do escopo do R1. Registrar a decisão — ⚠️ ver o custo abaixo |

> ⚠️ **Tirar a F8 custa nove itens, não um.** Caem junto as regras N6 e
> N10, os critérios A8, A9 e metade do A15, uma linha do escopo do MVP —
> e o passo 3 do [[SOP-Retirada-de-Fichas]], que mostra a exposição contra
> o limite na hora do lançamento. Está mapeado na seção 8 do
> `docs/PRD.md` v1.6.

**Atualizar depois:** cadastro inicial de jogadores · `docs/PRD.md` F8

---

---

### ✅ P10 · O que fazer quando o jogador se recusa a dar o WhatsApp?

> **RESPONDIDA em 2026-08-11 pelo dono do processo.**

**Resposta:** 🔒 **Sem WhatsApp não joga.**

Sem escalação, sem exceção e sem cadastro provisório. Não é caso de chamar
o dono na mesa — é regra do clube. Mudar exige decisão nova registrada em
`20-Decisoes/`.

| Opção considerada | Escolhida? |
|---|:--:|
| **Sem WhatsApp não joga** | ✅ |
| O dono libera caso a caso, com cadastro provisório | ❌ |
| Aceita o telefone de outra pessoa | ❌ |

**Já aplicada em:** [[SOP-Retirada-de-Fichas]] v0.6, seção *Regra do
WhatsApp* · [[ARV-Limites-de-Autoridade]] v3.4, bloco A6

---

### P11 · Quem pode ver o limite de crédito e o histórico dos jogadores?

**Por que importa:** bloqueio B1 do [[QA-Playbook-2026-08-11]], que já
bloqueia a publicação do playbook. Se o operador do app for o responsável
pelas fichas, ele passa a ver o limite de crédito e o histórico financeiro
de todos os jogadores do clube.

| Resposta | O que muda |
|---|---|
| **Só o dono** | Então o dono é quem opera o app no piloto — confirma o cenário da P2 |
| **Quem estiver operando** | Registrar como risco aceito. O R1 não tem controle de acesso |

**Atualizar depois:** [[QA-Playbook-2026-08-11]] bloqueio B1 · `docs/PRD.md` risco R9

---

## Folha de respostas

| # | Pergunta | Resposta | Documento a atualizar | Feito |
|---|---|---|---|:--:|
| P1 | Resp. fichas = dono? | | BRIEF 4b · ARV | ☐ |
| P2 | Quem opera o app? | | SOP-Retirada · PLANO-Adocao | ☐ |
| P3 | Quem é o N3? | | ARV A3 | ☐ |
| ~~P4~~ | ~~Má-fé ou esquecimento?~~ | ✅ **Sempre foi esquecimento** | DEC-006 v1.3 · PRD H1 | ☑ |
| P5 | Aceita confirmação na tela do operador? | | DEC-006 | ☐ |
| P6 | Aceita o risco do B11? | | ARV A2 | ☐ |
| P7 | Horas por semana | | BRIEF R5 | ☐ |
| P8 | Orçamento | | BRIEF R6 | ☐ |
| P9 | Limites de crédito | | Cadastro · PRD F8 | ☐ |
| ~~P10~~ | ~~Jogador recusa o WhatsApp — e daí?~~ | ✅ **Sem WhatsApp não joga** | SOP-Retirada v0.6 · ARV v3.4 A6 | ☑ |
| **P11** | Quem vê limite e histórico? | | QA-Playbook B1 · PRD R9 | ☐ |

## Critério de conclusão

- [ ] As 11 perguntas respondidas, por escrito — **2 de 11 fechadas (P4, P10)**
- [ ] As marcas **(P)** removidas de R5 e R6 no [[BRIEF-Sessao-Poker]]
- [ ] O caso D3 do [[relatorio-qa-v2]] reexecutado e passando
- [ ] A [[DEC-006-aceite-presencial-no-r1]] confirmada ou derrubada
- [ ] Limites de crédito coletados para os jogadores recorrentes

## ✅ A P4 veio "sempre foi esquecimento"

O R1 segue como desenhado. A [[DEC-006-aceite-presencial-no-r1]] está de
pé, com a hipótese H1 confirmada pelo histórico da operação.

⚠️ **A cláusula de revogação continua ativa.** Se aparecer contestação de
má-fé durante o piloto, o link deixa de ser release 2 e vira correção
urgente — mesmo com esta resposta.

## Relacionado

- [[relatorio-qa-v2]] · falha F4, caso D3
- [[QA-Playbook-2026-08-11]] · bloqueio B1, controle de acesso
- [[BRIEF-Sessao-Poker]] · restrições R5 e R6
- [[ARV-Limites-de-Autoridade]] v3.1 · casos B11 e B14
- [[DEC-006-aceite-presencial-no-r1]]
- [[PLANO-Adocao-StackTrack]]
- [[MOC-StackTrack]]
- `docs/PRD.md` · hipóteses H1 e H4

## Histórico de mudanças

| Versão | Data | Autor | O que mudou |
|---|---|---|---|
| v1.0 | 2026-08-11 | Anderson | Criação. Corrige F4 do relatório de QA v2 |
| v1.1 | 2026-08-11 | Anderson | Perguntas P10 (recusa de CPF) e P11 (quem vê CPF e limite), abertas pela obrigatoriedade de CPF e WhatsApp no cadastro |
| v1.2 | 2026-08-11 | Anderson | CPF volta a opcional; obrigatórios são nome e WhatsApp. P10 vira a recusa do **WhatsApp**; P11 passa a tratar limite e histórico |
| v1.3 | 2026-08-11 | Anderson | **P10 respondida: sem WhatsApp não joga.** Sem escalação, sem exceção. Aplicada no SOP v0.6 e na árvore v3.4 |
| v1.4 | 2026-08-11 | Anderson | **P4 respondida: sempre foi esquecimento, nunca má-fé.** Hipótese H1 confirmada; a DEC-006 se sustenta. Cláusula de revogação segue valendo |
| v1.5 | 2026-08-11 | Anderson | Ajustes vindos do PRD v1.6. **P6 encolheu:** o contador de contingências foi construído (F11), então resta só perguntar se o dono aceita o risco. **P8** passa a apontar a hipótese H5. **P9** ganha o custo real de tirar a F8 — nove itens, não um |
