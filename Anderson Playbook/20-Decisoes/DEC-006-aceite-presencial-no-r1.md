---
owner: Anderson
version: v1.4
updated: 2026-08-11
status: decidido
escopo: release 1 (Caixa Vivo) — decisão com prazo de validade
---

# DEC-006 — Aceite presencial na release 1: o meio muda, o princípio não

## Contexto

[[DEC-002-aceite-em-toda-movimentacao]] fixou o princípio: **nenhuma
movimentação de valor entra no sistema sem confirmação da contraparte.**
[[DEC-001-arquitetura-cliente-web]] definiu o meio: o jogador confirma por
**link web enviado ao celular dele**, sem instalar nada.

O recorte da release 1 (Caixa Vivo, `docs/PRD.md`) colocou o meio em
xeque. O link é a parte mais cara de construir — token, expiração,
armazenamento de assinatura, LGPD — e é a **única parte do caminho
crítico que não depende de quem está construindo**. Depende do jogador
ter celular com bateria, ter internet no clube e atender no meio do
horário de pico, 15 vezes por sessão.

A pergunta que forçou a escolha: **dá para provar o produto sem o link?**

A resposta veio de reler o próprio [[BRIEF-Sessao-Poker]]. A métrica M3
não pede assinatura no aparelho do jogador. Ela pede *"valor exibido antes
de assinar"*. E o modo de falha documentado (Modo A) é contestação **de
boa-fé** — o jogador esquece que pegou e olha só o total no fechamento.

> ✅ **Verificado com o dono do processo em 2026-08-11:** nunca houve
> contestação de má-fé no clube. Sempre foi esquecimento.

O que corrige boa-fé distraída é **ter olhado o número**. Olhar o número
não exige aparelho próprio.

## Opções consideradas

| Opção | Prós | Contras |
|---|---|---|
| Manter o link no R1 | Prova de posse desde o primeiro dia; nada a refazer depois | Metade do esforço da release inteira; depende do jogador responder no pico; se der atrito na mesa, derruba o app todo — inclusive a parte que funcionava |
| Entregar sem confirmação nenhuma | Release mínima, zero atrito | Reintroduz G2. O jogador volta a "assinar" sem ver. O produto perde o que o diferencia do papel |
| **Confirmação presencial na tela do operador** | Cumpre M3 e M5; zero dependência de terceiro; cabe no prazo; o operador gira a tela e o jogador toca | Não prova posse. Contra má-fé não segura. O sistema não detecta se o operador tocou no lugar do jogador |

## Decisão

**Na release 1, a contraparte confirma presencialmente, na tela do
operador, com o próprio toque.**

O princípio da [[DEC-002-aceite-em-toda-movimentacao]] permanece intacto:
nenhuma movimentação entra sem confirmação. O que muda é **o meio**.

O aceite por link não foi cancelado — foi **adiado para a release 2**,
onde volta a ser o modo padrão e o presencial retorna ao papel de
contingência que a [[ARV-Limites-de-Autoridade]] A2 já previa.

> ⚠️ **Esta decisão tem prazo de validade.** Ela vale enquanto o R1
> estiver em uso. Ao entrar o R2, ela se torna `arquivada` — e a
> [[DEC-001-arquitetura-cliente-web]] volta a valer sem ressalva.

## Motivo

Três razões, em ordem de peso.

**1. O risco maior não é a prova fraca, é o piloto não acontecer.**
O objetivo de 90 dias do briefing já não cabia no melhor caso. O clube
roda 2 sessões por mês — cada mês de desenvolvimento a mais custa duas
janelas de teste. Uma prova imperfeita rodando na mesa vale mais que uma
prova perfeita que chega depois do piloto.

**2. O modo de falha é distração, não fraude — ✅ confirmado.**
O briefing descrevia o jogador contestando **de boa-fé**. Em 2026-08-11 o
dono do processo confirmou: **sempre foi esquecimento, nunca houve
contestação de má-fé** · pergunta P4 do [[checklist-confirmacao-r1]].

A prova criptográfica defende contra uma ameaça que a operação real nunca
registrou. Este motivo deixa de ser hipótese e passa a ser **fato
histórico da operação**.

> ⚠️ Confirma o passado, não garante o futuro. Se aparecer má-fé no
> piloto, a cláusula de revogação abaixo dispara — e isso é informação,
> não fracasso.

**3. O caixa fecha independentemente de quem confirmou.**
O invariante `Σ saldos = −rake` só precisa que o lançamento exista. Dá
para provar o produto inteiro — que existe furo, onde ele está, e que o
app o encontra — antes de construir a parte cara.

## Consequências

### No processo

- [[SOP-Retirada-de-Fichas]] v0.2: o passo "enviar link" vira "girar a
  tela"; entra um passo de conferência de limite antes.
- [[ARV-Limites-de-Autoridade]] v3.0: a A2 muda de causa. Contingência
  deixa de ser "jogador sem celular" e passa a ser **"o operador confirmou
  sem o jogador ter olhado"**. O teto de 3 por sessão é mantido.
- A A5 perde uma certeza: contestação de linha **com** confirmação
  registrada não encerra mais a discussão sozinha, porque a prova não
  demonstra posse.

### No registro

- A confirmação precisa gravar o modo **presencial** de forma
  distinguível do aceite no aparelho do jogador. Sem essa distinção, o R2
  não terá como medir se a prova melhorou.
- ⚠️ **Corrigido em v1.2.** A v1.0 desta decisão dizia que o CPF sairia do
  cadastro; a v1.1 tornou CPF e WhatsApp obrigatórios. **A regra final é
  outra:** obrigatórios são **nome e WhatsApp**; o **CPF é opcional**.
  A identidade do jogador é o **par nome + WhatsApp**, único no clube
  · ver [[SOP-Retirada-de-Fichas]] v0.5.
- Consequência sobre a LGPD: o argumento de "menos dado pessoal" **cai
  parcialmente**. O R1 guarda telefone e histórico financeiro de todos —
  menos que CPF obrigatório, mais que só o apelido. O motivo que sustenta
  a decisão continua sendo o outro: não depender do jogador responder no
  pico.

### O que se perde — registrado sem enfeite

| # | O que se perde | Gravidade |
|---|---|---|
| 1 | **Prova de posse.** A confirmação vem do aparelho do operador | Alta contra má-fé; nula contra distração |
| 2 | **Detecção de fraude do operador.** Se ele tocar em confirmar no lugar do jogador, o sistema não tem como saber — mesmo aparelho, mesmo dedo | **Alta.** Único sinal indireto: o contador de contingências — que **passou a existir de fato** na v1.6 do PRD, como funcionalidade F11 |
| 3 | ~~**Identificação do jogador.** Sem WhatsApp e sem CPF, o apelido vira o único identificador~~ | ✅ **Deixou de existir na v1.2** — a identidade é o par **nome + WhatsApp** |

### Como esta decisão se revoga

Ela cai se **qualquer uma** destas acontecer:

1. Aparecer contestação de **má-fé** no piloto. ⚠️ O histórico diz que
   nunca houve — mas histórico não é garantia, e é justamente por isso
   que esta cláusula continua ativa mesmo com a P4 respondida.
2. O contador de contingências ficar suspeito — ou alto demais, ou baixo
   demais numa sessão movimentada.
   > ✅ **Este gatilho só passou a ser mensurável em 2026-08-11.** Até a
   > v1.6 do PRD o contador era exigido pela [[ARV-Limites-de-Autoridade]]
   > A2 e **não existia em lugar nenhum**. A funcionalidade F11 registra
   > cada contingência com motivo, bloqueia na 4ª da sessão e as lista no
   > relatório. Antes disso, esta cláusula não tinha como disparar.
3. O R2 entrar em operação.

Nos casos 1 e 2, o link deixa de ser release 2 e vira correção urgente.

## Relacionado

- [[DEC-002-aceite-em-toda-movimentacao]] · **princípio mantido**, meio trocado
- [[DEC-001-arquitetura-cliente-web]] · **suspensa no R1**, volta no R2
- [[SOP-Retirada-de-Fichas]] v0.7 · seção *Caminho de contingência*
- [[ARV-Limites-de-Autoridade]] v3.5 · A2 e A5, casos B11 e B12
- [[BRIEF-Sessao-Poker]] · métrica M3, Modo A
- [[checklist-confirmacao-r1]] · perguntas P4, P5, P6 e P10
- [[MOC-StackTrack]]
- `docs/PRD.md` — PRD do Caixa Vivo, seções 7 e 17

## Histórico de mudanças

| Versão | Data | Autor | O que mudou |
|---|---|---|---|
| v1.0 | 2026-08-11 | Anderson | Criação. Aceite presencial no R1, com prazo de validade |
| v1.1 | 2026-08-11 | Anderson | **CPF e WhatsApp voltam ao cadastro, como obrigatórios**, por determinação do dono do processo. Perda nº 3 (identificação do jogador) deixa de existir. Registrado que o argumento de "menos dado pessoal" caiu |
| v1.2 | 2026-08-11 | Anderson | Regra final do cadastro: **obrigatórios nome e WhatsApp; CPF opcional**. Identidade = par nome + WhatsApp. Argumento de "menos dado pessoal" cai só parcialmente |
| v1.4 | 2026-08-11 | Anderson | ✅ **O gatilho 2 da revogação virou mensurável.** O contador de contingências, que esta decisão apontava como "único sinal indireto", passou a existir como funcionalidade **F11** do PRD v1.6. A perda nº 2 continua alta — o registro existe, a detecção não |
| v1.3 | 2026-08-11 | Anderson | ✅ **Motivo 2 confirmado pelo dono do processo** (P4): nunca houve contestação de má-fé, sempre foi esquecimento. A hipótese central da decisão vira fato histórico. Cláusula de revogação mantida |
