# O campo `lugar` da mesa ao vivo — Design

> Fecha o **item 4 da divergência D4** do PRD do Caixa Vivo, o último aberto
> depois da ratificação da mesa ao vivo (F13) em 2026-08-12.
>
> **Aprovado pelo dono do processo em 2026-08-12.**

---

## O problema

Hoje o número do lugar não existe como dado. Ele é calculado toda vez que a
mesa é desenhada, em `src/simulacao/vistas.ts`:

```ts
const sentados = comHoraDeSentar
  .filter((x) => x.sentouAs !== null)
  .sort((a, b) => a.sentouAs - b.sentouAs)

const lugares = sentados.map(({ participacao }, indice) => ({
  lugar: indice + 1,   // ← o defeito
  ...
}))
```

O lugar é a **posição no array ordenado por hora da primeira confirmação**.
Duas consequências, e as duas são erradas na mesa de verdade:

| O que acontece | O que o operador vê |
|---|---|
| O primeiro jogador a confirmar fecha a conta e sai | **Todo mundo anda uma cadeira.** Quem estava no 4 aparece no 3, sem ter se mexido |
| O operador toca no lugar 7 para sentar alguém | A pessoa aparece no primeiro lugar livre em ordem, não no 7. O toque dele não decide nada |

O segundo é o mais silencioso: `MesaVisual` expõe `onSentar(lugar)` no contrato
público, as instruções do pacote mandam ligá-lo, e o número chega em
`MesaAoVivoConectada` — que o guarda em `setSentando` só para desenhar o
painel, e depois despacha `{ tipo: 'sentar', jogadorId }` **sem ele**. O
argumento existe, viaja, e morre.

O próprio comentário do protótipo já dizia a resposta:

> ⚠️ Derivar o lugar assim serve para a previa. Num produto de verdade o lugar
> precisa ser um campo proprio da Participacao: o operador vai querer escolher
> onde a pessoa senta, e o lugar tem de sobreviver a uma troca de mesa.

## O que este design faz

Um campo, e o resto derivado dele.

---

## 1. O dado

```ts
export interface Participacao {
  id: string
  sessaoId: string
  jogadorId: string
  entrouAs: Minutos
  saiuAs?: Minutos
  encerrada: boolean
  /**
   * O lugar na mesa, de 1 a 10. Ausente = o jogador entrou na sessao mas
   * ainda nao tem cadeira: ele aparece "de pe".
   *
   * O numero e escolhido pelo operador, nao derivado de ordem — senao todo
   * mundo anda uma cadeira quando alguem fecha a conta.
   */
  lugar?: number
}
```

**É o único dado novo.** Nada mais é guardado: reservado e ocupado são leituras.

### Os três estados da mesa, e como cada um se sabe

| Estado | Como se sabe | Onde aparece |
|---|---|---|
| **De pé** | `lugar` indefinido | Na lista "Na sessão, ainda de pé", embaixo |
| **Reservado** | tem `lugar`, e **nenhuma** retirada confirmada | No lugar, tracejado, sem valor |
| **Ocupado** | tem `lugar`, e **existe** retirada confirmada | No lugar, como hoje |

O teste de "já validou" é **existir movimentação de retirada confirmada nesta
participação** — não `emMao > 0`. Um jogador que confirmou R$ 500 e devolveu
tudo continua tendo validado ficha; ele não volta a ser reservado.

> **Por que não guardar um booleano `validou`.** Ele seria um segundo lugar
> onde a mesma verdade mora, e os dois divergiriam na primeira recusa. As
> movimentações já sabem; a mesa só pergunta.

---

## 2. A ação

```ts
| { tipo: 'sentar'; jogadorId: string; lugar?: number }
```

O `lugar` é **opcional** porque a aba Mesa não tem desenho para tocar: quem
cadastra por lá entra de pé, e ganha cadeira depois na tela Ao vivo.

### O que o `reducer` faz, em ordem

| # | Guarda | Aviso |
|---|---|---|
| 1 | Sessão fechada | "Abra a sessão antes de sentar alguém na mesa." |
| 2 | `lugar` informado fora de 1 a 10 | "A mesa tem 10 lugares." |
| 3 | `lugar` informado e já tomado por participação **aberta de outro jogador** | "O lugar 5 já está ocupado." |
| 4 | Jogador já na mesa **com** lugar | "Esse jogador já está na mesa." |
| 5 | Jogador já na mesa **sem** lugar, e `lugar` informado | ✅ **Recebe o lugar. Não cria participação nova.** |
| 6 | Jogador já na mesa sem lugar, e `lugar` **não** informado | "Esse jogador já está na mesa." |
| 7 | Jogador fora da mesa | Cria a participação, com `lugar` se veio |

**O caso 5 é obrigatório, não conveniência.** Sem ele, quem entra pela aba
Mesa fica de pé para sempre: a única ação que existe recusaria com "já está na
mesa". Ele é a diferença entre a tela Ao vivo funcionar e ser decorativa.

O caso 3 olha **só participações abertas** — é o que devolve a cadeira ao pool
quando alguém fecha a conta. E ele ignora a participação do próprio jogador:
sentar a Bia no lugar 3, onde a Bia já está, deve dizer "esse jogador já está
na mesa" (caso 4), não "o lugar 3 já está ocupado". A mensagem tem de apontar
para o que o operador precisa corrigir.

**Os dez lugares são fixos.** `MesaVisual` aceita `totalDeLugares` como prop,
mas o produto tem uma mesa só (`DEC-003`) e o PRD diz dez. O `check` do banco
e a guarda 2 gravam esse dez. Se um dia a mesa mudar de tamanho, os dois mudam
juntos — e é bom que doa, para ninguém fazer isso sem querer.

### O que NÃO muda no reducer

`confirmar` fica intacto. Como "validou" é derivado das movimentações, a
confirmação da primeira ficha já muda o estado da mesa sozinha, sem escrever
nada na participação. Uma regra a menos para manter em dia.

---

## 3. O componente

`LugarOcupado` ganha um campo:

```ts
export interface LugarOcupado {
  lugar: number
  participacaoId: string
  nome: string
  entrouAs: string
  emMao: number
  limite: number
  aguardando: number
  contingencias: number
  /** false enquanto o jogador nao confirmou a primeira ficha (A26). */
  validou: boolean
}
```

Um array só, com um booleano — em vez de um segundo array `reservados`. Menos
superfície pública, e o anel de dez lugares continua sendo uma leitura só.

**Como o reservado é desenhado:** borda tracejada em vez de chapa, o nome
visível, **sem** valor em fichas e **sem** barra de limite (ele não tem nem um
nem outro), e a linha de baixo diz `aguarda a 1ª ficha` no lugar da hora de
entrada. Ele **não** é tocável para sentar outra pessoa — a cadeira tem dono.

O canal de cor continua neutro. Reservado não é alerta: é o estado normal de
quem acabou de chegar.

---

## 4. O banco

```sql
alter table participacao
  add column lugar integer check (lugar between 1 and 10);

-- Um jogador por lugar, entre as contas abertas. Parcial de propósito:
-- a conta encerrada guarda o lugar que teve (N13) e libera a cadeira.
create unique index participacao_um_por_lugar
  on participacao (sessao_id, lugar)
  where lugar is not null and not encerrada;
```

Entra como migration nova (`0002_lugar_na_mesa.sql`), não editando a 0001 —
o banco de produção já rodou a primeira.

**Por que constraint no banco se o reducer já valida.** Mesmo critério da
Task 2 do plano da fatia vertical: o reducer roda no navegador, e duas abas
abertas na mesma noite podem sentar duas pessoas no lugar 7 por corrida. Aqui
não corrompe a conta do caixa — corrompe a leitura da mesa, que é o que a
F13 existe para dar. Vale a constraint.

---

## 5. Onde isso cai

`modelo.ts` e `reducer.ts` são **byte a byte idênticos** em três lugares hoje.
A mudança tem de cair nos três no mesmo passo, senão a regra de cópia do plano
quebra e a próxima auditoria acha divergência.

| Arquivo | O que muda |
|---|---|
| `product-plan/regras/modelo.ts` | campo `lugar`, helper de leitura |
| `product-plan/regras/reducer.ts` | ação `sentar` com `lugar` |
| `caixa-vivo/src/regras/{modelo,reducer}.ts` | cópia dos dois acima |
| `imersao-teste-design/src/simulacao/{modelo,reducer}.ts` | cópia dos dois acima |
| `caixa-vivo/supabase/migrations/0002_lugar_na_mesa.sql` | coluna e índice |
| `caixa-vivo/src/dados/carregarNoite.ts` | ler `lugar` da linha |
| `caixa-vivo/src/dados/persistirDelta.ts` | gravar `lugar` na inserção **e na atualização** — o caso 5 muda uma participação que já existe |
| `imersao-teste-design/src/simulacao/vistas.ts` | ler o campo em vez de derivar da ordem |
| `imersao-teste-design/src/simulacao/telas/MesaAoVivoConectada.tsx` | passar o lugar no despacho; listar quem está de pé entre os que podem sentar |
| `MesaVisual.tsx` (nos três lugares) | `validou`, e o desenho do reservado |
| `product/sections/jogadores-e-mesa/{data.json,types.ts,spec.md}` | amostra, tipo, e o texto dos três estados |
| `product-plan/sections/jogadores-e-mesa/*` | espelho do acima |
| `product-plan/data-shapes/overview.ts` | `LugarOcupado.validou` |
| `docs/PRD.md` | A26 emendado, item 4 da D4 fechado, registro da mudança |

---

## 6. A emenda no A26

O critério ratificado hoje diz:

> **A26** — Na mesa ao vivo, o jogador que entrou na sessão e ainda **não
> confirmou nenhuma ficha** aparece "de pé", fora dos dez lugares.

Isso deixa de ser verdade: com lugar escolhido e sem ficha confirmada, ele
aparece **no lugar**, reservado. O critério passa a ser:

> **A26** — Na mesa ao vivo, quem entrou na sessão e ainda não tem lugar
> aparece "de pé", fora dos dez lugares. Quem tem lugar e ainda **não
> confirmou nenhuma ficha** aparece no lugar dele, **reservado** — sem valor em
> fichas, e a cadeira não aceita outra pessoa. O lugar vira ocupado no momento
> em que ele confirma a primeira retirada na tela girada.

A distinção que a F13 existe para mostrar — quem reconheceu ficha e quem não —
**continua de pé**, e fica mais precisa: agora ela é visível na própria
cadeira, em vez de exigir olhar a lista de baixo.

---

## 7. O que fica de fora, e por quê

| Não entra | Motivo |
|---|---|
| **Trocar um jogador já sentado de lugar** | Uma mesa por sessão no R1 (`DEC-003`), e não existe tela para isso. Se aparecer necessidade, é ação nova — não um caso escondido dentro de `sentar` |
| **A tela Ao vivo no app `caixa-vivo`** | O item 4 da D4 aponta para `regras/` e `migrations/`. A tela é fatia própria, com plano próprio. Este design deixa o dado pronto para ela |
| **Migrar participações antigas** | Não há sessão encerrada em produção. Se houvesse, `lugar` nulo é exatamente o certo: elas não tinham cadeira |

---

## 8. Testes que provam

Cada um existe porque um caminho real quebra sem ele.

| # | O teste | O que ele pega |
|---|---|---|
| 1 | Rafa no 1 e Dedé no 4; Rafa fecha a conta; **Dedé continua no 4** | O bug original — todo mundo andava uma cadeira |
| 2 | Sentar alguém no lugar 5 já tomado devolve aviso e **não** cria participação | O reducer deixando dois no mesmo lugar |
| 3 | Jogador de pé + `sentar` com lugar 7 → ele ganha o 7, e o total de participações **não sobe** | O caso 5. Sem ele, quem entra pela aba Mesa nunca senta |
| 4 | Participação sem retirada confirmada tem `validou: false`; depois de confirmar, `true` | A leitura dos três estados |
| 5 | Jogador que confirmou e devolveu tudo continua `validou: true` | O erro de usar `emMao > 0` como teste |
| 6 | Encerrar a conta libera o lugar para outra pessoa, **e a participação encerrada mantém o número** | A cadeira presa para sempre, e a N13 |
| 7 | Banco recusa duas participações abertas com o mesmo lugar na mesma sessão (`23505`), e aceita quando a primeira está encerrada | O índice parcial, contra a corrida entre duas abas |

Os testes **1 a 6 rodam no reducer**, sem banco. Só o **7** precisa do Supabase
local — e ele **falha com a razão** quando o Docker não está rodando, como os
demais testes de banco. Um teste pulado passando de verde é mentira.

---

## 9. Como isso volta para o PRD

Pela rotina de `AGENTS.md`, esta mudança usa **duas** das três saídas:

1. **Mudou regra e tela** → A26 emendado, item 4 da D4 marcado como fechado,
   e a seção 9 (Dados necessários) ganha o `lugar` na Participação.
2. **Registro de mudanças do sistema** → a linha das cópias de `modelo.ts` e
   `reducer.ts`, que mudaram nos três lugares no mesmo passo.

Não abre `DEC-NNN`: a decisão de produto já foi tomada na ratificação da D4.
Este design é como ela é cumprida, não uma escolha nova.
