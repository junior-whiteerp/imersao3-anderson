# O campo `lugar` da mesa ao vivo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar o número do lugar na mesa ao vivo — hoje a posição num array ordenado por hora de confirmação — por um campo próprio da Participação, escolhido pelo operador, para que ninguém ande de cadeira quando outro jogador fecha a conta.

**Architecture:** Um campo novo (`Participacao.lugar?: number`) e nada mais guardado. Os três estados da mesa — de pé, reservado, ocupado — são **derivados**: de pé é `lugar` ausente, e reservado/ocupado se separam por existir ou não retirada confirmada naquela participação. A ação `sentar` ganha um `lugar` opcional e passa a servir dois casos: criar participação nova, e dar cadeira a quem já está de pé. O `reducer` valida; o Postgres reforça com índice parcial, porque duas abas abertas na mesma noite podem sentar duas pessoas no mesmo lugar por corrida.

**Tech Stack:** TypeScript 5.9 · React 19 · Vitest 3 · Supabase (Postgres) · Tailwind CSS v4

**Spec:** `docs/superpowers/specs/2026-08-12-campo-lugar-mesa-ao-vivo-design.md`

## Global Constraints

- **As regras vivem em três cópias byte a byte.** `modelo.ts` e `reducer.ts` são idênticos em `caixa-vivo/src/regras/`, `imersao-teste-design/product-plan/regras/` e `imersao-teste-design/src/simulacao/`. O mesmo vale para `MesaVisual.tsx`, em `caixa-vivo/src/sections/`, `product-plan/sections/` e `imersao-teste-design/src/sections/`. Desenvolva em `caixa-vivo/` (é onde o Vitest roda) e copie. A Task 3 e a Task 5 provam a igualdade com `diff -q`.
- **Português** em nome de arquivo, função e variável.
- **Reais inteiros**, sem centavos. Horas em `Minutos` (inteiro desde a meia-noite da abertura, podendo passar de 1440).
- **A regra de cor.** Verde, âmbar e vermelho pertencem ao veredito do caixa e a mais nada. **Reservado é neutro** — é o estado normal de quem acabou de chegar, não alerta.
- **Tailwind CSS v4**, sem `tailwind.config.js`, sem cor customizada.
- **Dez lugares fixos.** `DEC-003` (uma mesa por sessão) e o PRD. O `check` do banco e a guarda do reducer gravam esse dez.
- **`npm`**, não pnpm, nos dois repositórios.
- Toda tarefa termina com commit, mensagem em português com prefixo convencional.
- **O portão do PRD** (`scripts/prd-gate.sh`) bloqueia o fim do turno enquanto houver arquivo de produto mais novo que `docs/PRD.md`. A **Task 8** é o que abre o portão — ela não é opcional, e não pode ser feita antes das outras.

---

## Estrutura de arquivos

| Arquivo | Responsabilidade | Task |
|---|---|---|
| `caixa-vivo/src/regras/modelo.ts` | O campo `lugar`, `TOTAL_DE_LUGARES`, e os dois helpers de leitura | 1 |
| `caixa-vivo/testes/lugarNaMesa.test.ts` | Os seis testes de regra | 1, 2 |
| `caixa-vivo/src/regras/reducer.ts` | A ação `sentar` com lugar, e suas seis guardas | 2 |
| as seis cópias em `product-plan/regras/` e `src/simulacao/` | Igualdade byte a byte | 3 |
| `caixa-vivo/supabase/migrations/0002_lugar_na_mesa.sql` | Coluna e índice parcial | 4 |
| `caixa-vivo/src/dados/tipos-banco.ts` | `LinhaParticipacao.lugar` | 4 |
| `caixa-vivo/src/dados/carregarNoite.ts` | Ler o lugar da linha | 4 |
| `caixa-vivo/src/dados/persistirDelta.ts` | Gravar o lugar na inserção **e na atualização** | 4 |
| `caixa-vivo/testes/banco.test.ts` | O índice parcial | 4 |
| `MesaVisual.tsx` (três cópias) | `validou`, e o desenho do reservado | 5 |
| `imersao-teste-design/src/simulacao/vistas.ts` | Ler o campo em vez de derivar da ordem | 6 |
| `imersao-teste-design/src/simulacao/telas/MesaAoVivoConectada.tsx` | Passar o lugar; listar quem está de pé | 6 |
| `product/sections/jogadores-e-mesa/{types.ts,data.json,spec.md}` + espelhos | Contrato e amostra | 7 |
| `docs/PRD.md` | A26 emendado, item 4 da D4 fechado, registro | 8 |

---

## Task 1: O campo e a leitura dos três estados

**Files:**
- Modify: `caixa-vivo/src/regras/modelo.ts`
- Test: `caixa-vivo/testes/lugarNaMesa.test.ts` (create)

**Interfaces:**
- Consumes: nada
- Produces:
  - `Participacao.lugar?: number`
  - `export const TOTAL_DE_LUGARES = 10`
  - `validouFicha(noite: Noite, participacaoId: string): boolean`
  - `participacaoNoLugar(noite: Noite, lugar: number): Participacao | null`

> **Por que `validouFicha` e não um booleano guardado.** Um campo `validou` seria um segundo lugar onde a mesma verdade mora, e os dois divergiriam na primeira recusa. As movimentações já sabem; a mesa só pergunta.

- [ ] **Step 1: Escrever os testes que falham**

`caixa-vivo/testes/lugarNaMesa.test.ts`:

```ts
/**
 * O lugar na mesa ao vivo (F13 do PRD, item 4 da divergencia D4).
 *
 * O lugar era a posicao num array ordenado por hora da primeira confirmacao.
 * Quem fechava a conta fazia todo mundo andar uma cadeira. Aqui ele e campo.
 */
import { describe, it, expect } from 'vitest'
import {
  participacoesAbertas,
  participacaoNoLugar,
  validouFicha,
  type Noite,
} from '@/regras/modelo'
import { reducer, type Acao } from '@/regras/reducer'
import { noiteVazia } from './provas/roteiroInicial'

function rodar(noite: Noite, acoes: Acao[]): Noite {
  return acoes.reduce(reducer, noite)
}

/** Sessao e turno abertos: sentar exige sessao, e lancar ficha exige turno. */
const ABRIR: Acao[] = [
  { tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 20000 },
  { tipo: 'abrir-turno', dealerId: 'd-joao' },
]

function participacaoDe(noite: Noite, jogadorId: string) {
  const p = participacoesAbertas(noite).find((x) => x.jogadorId === jogadorId)
  if (!p) throw new Error(`Sem participacao aberta para ${jogadorId}`)
  return p
}

/** Lanca e confirma uma retirada, que e o que ocupa o lugar de verdade. */
function confirmarRetirada(noite: Noite, participacaoId: string, valor: number): Noite {
  const comLancamento = reducer(noite, { tipo: 'lancar-retirada', participacaoId, valor })
  const ultima = comLancamento.movimentacoes[comLancamento.movimentacoes.length - 1]
  return reducer(comLancamento, {
    tipo: 'confirmar',
    movimentacaoId: ultima.id,
    confirmacao: 'presencial',
  })
}

/**
 * Poe alguem numa cadeira mexendo no estado direto, sem passar pela acao.
 *
 * De proposito: esta suite prova os LEITORES do campo, e a acao `sentar` com
 * lugar so chega na Task 2. Se o teste do leitor dependesse da acao, as duas
 * quebrariam juntas e nao daria para saber qual das duas esta errada.
 */
function comLugar(noite: Noite, participacaoId: string, lugar: number): Noite {
  return {
    ...noite,
    participacoes: noite.participacoes.map((p) =>
      p.id === participacaoId ? { ...p, lugar } : p
    ),
  }
}

describe('a leitura dos tres estados da mesa', () => {
  it('quem tem lugar e nao confirmou ficha esta reservado, nao ocupado', () => {
    let noite = rodar(noiteVazia, [...ABRIR, { tipo: 'sentar', jogadorId: 'j-bia' }])
    const bia = participacaoDe(noite, 'j-bia')
    noite = comLugar(noite, bia.id, 3)

    expect(participacaoDe(noite, 'j-bia').lugar).toBe(3)
    expect(validouFicha(noite, bia.id)).toBe(false)
  })

  it('confirmar a primeira ficha vira o lugar de reservado para ocupado', () => {
    let noite = rodar(noiteVazia, [...ABRIR, { tipo: 'sentar', jogadorId: 'j-bia' }])
    const bia = participacaoDe(noite, 'j-bia')
    noite = comLugar(noite, bia.id, 3)

    noite = confirmarRetirada(noite, bia.id, 500)

    expect(validouFicha(noite, bia.id)).toBe(true)
  })

  it('quem confirmou e devolveu tudo continua ocupado, nao volta a reservado', () => {
    let noite = rodar(noiteVazia, [...ABRIR, { tipo: 'sentar', jogadorId: 'j-bia' }])
    const bia = participacaoDe(noite, 'j-bia')
    noite = comLugar(noite, bia.id, 3)
    noite = confirmarRetirada(noite, bia.id, 500)

    // Devolveu tudo: emMao volta a zero, mas ele validou ficha nesta noite.
    // Usar `emMao > 0` como teste faria a cadeira dele piscar de volta para
    // reservado no fechamento — que e justamente quando ele ainda esta la.
    noite = reducer(noite, { tipo: 'devolver-e-encerrar', participacaoId: bia.id, valor: 500 })

    expect(validouFicha(noite, bia.id)).toBe(true)
  })

  it('quem esta de pe nao tem lugar', () => {
    const noite = rodar(noiteVazia, [...ABRIR, { tipo: 'sentar', jogadorId: 'j-tiago' }])

    expect(participacaoDe(noite, 'j-tiago').lugar).toBeUndefined()
  })

  it('participacaoNoLugar acha quem esta sentado, e ignora conta encerrada', () => {
    let noite = rodar(noiteVazia, [...ABRIR, { tipo: 'sentar', jogadorId: 'j-rafa' }])
    const rafa = participacaoDe(noite, 'j-rafa')
    noite = comLugar(noite, rafa.id, 7)

    expect(participacaoNoLugar(noite, 7)?.id).toBe(rafa.id)
    expect(participacaoNoLugar(noite, 8)).toBeNull()

    noite = reducer(noite, { tipo: 'devolver-e-encerrar', participacaoId: rafa.id, valor: 0 })

    // A cadeira volta ao pool, mas a participacao encerrada guarda o numero (N13).
    expect(participacaoNoLugar(noite, 7)).toBeNull()
    expect(noite.participacoes.find((p) => p.id === rafa.id)?.lugar).toBe(7)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

```bash
cd caixa-vivo
npm test -- testes/lugarNaMesa.test.ts
```
Expected: FAIL — `participacaoNoLugar` e `validouFicha` não existem em `@/regras/modelo`, e `sentar` não aceita `lugar`.

- [ ] **Step 3: Acrescentar o campo `lugar` à `Participacao`**

Em `caixa-vivo/src/regras/modelo.ts`, a interface hoje é:

```ts
export interface Participacao {
  id: string
  /** A sessao a que esta participacao pertence. O PRD define isso na entidade. */
  sessaoId: string
  jogadorId: string
  entrouAs: Minutos
  saiuAs?: Minutos
  encerrada: boolean
}
```

Passa a ser:

```ts
export interface Participacao {
  id: string
  /** A sessao a que esta participacao pertence. O PRD define isso na entidade. */
  sessaoId: string
  jogadorId: string
  entrouAs: Minutos
  saiuAs?: Minutos
  encerrada: boolean
  /**
   * O lugar na mesa, de 1 a TOTAL_DE_LUGARES. Ausente = o jogador entrou na
   * sessao mas ainda nao tem cadeira: ele aparece "de pe".
   *
   * O numero e escolhido pelo operador, nao derivado de ordem — senao todo
   * mundo anda uma cadeira quando alguem fecha a conta. Item 4 da D4 do PRD.
   */
  lugar?: number
}
```

- [ ] **Step 4: Acrescentar a constante**

Ainda em `modelo.ts`, junto das outras constantes de regra. Hoje elas são:

```ts
export const TETO_CONTINGENCIAS = 3
```

Acrescente logo abaixo:

```ts
/**
 * A mesa tem dez lugares. Nao e configuravel: o R1 tem uma mesa por sessao
 * (DEC-003) e o PRD diz dez. O `check` da migration 0002 grava o mesmo numero,
 * e os dois so mudam juntos.
 */
export const TOTAL_DE_LUGARES = 10
```

- [ ] **Step 5: Acrescentar os dois helpers de leitura**

Ainda em `modelo.ts`, logo **depois** da função `aguardando`, que termina assim:

```ts
/** Lancamentos ainda aguardando confirmacao. Contam no limite pela regra N6. */
export function aguardando(noite: Noite, participacaoId: string): number {
  return movimentacoesDe(noite, participacaoId)
    .filter((m) => m.situacao === 'aguardando' && m.tipo === 'retirada')
    .reduce((s, m) => s + m.valor, 0)
}
```

Acrescente:

```ts
/**
 * O jogador ja validou ficha nesta participacao?
 *
 * O teste e existir retirada CONFIRMADA — nao `emMao > 0`. Quem confirmou
 * R$ 500 e devolveu tudo continua tendo validado: a cadeira dele nao pode
 * piscar de volta para reservado no fechamento, que e justamente quando ele
 * ainda esta na mesa. E o que separa lugar reservado de lugar ocupado (A26).
 */
export function validouFicha(noite: Noite, participacaoId: string): boolean {
  return movimentacoesDe(noite, participacaoId).some(
    (m) => m.tipo === 'retirada' && m.situacao === 'confirmada'
  )
}

/**
 * Quem esta sentado neste lugar agora, se alguem.
 *
 * So conta participacao ABERTA: e isso que devolve a cadeira ao pool quando
 * alguem fecha a conta, sem apagar o numero da participacao encerrada (N13).
 */
export function participacaoNoLugar(noite: Noite, lugar: number): Participacao | null {
  return participacoesAbertas(noite).find((p) => p.lugar === lugar) ?? null
}
```

- [ ] **Step 6: Rodar e ver passar**

```bash
npm test -- testes/lugarNaMesa.test.ts
```
Expected: PASS — 5 testes.

Esta tarefa fecha verde sozinha: ela entrega o campo e os dois leitores, e os
testes exercitam os leitores mexendo no estado direto pelo `comLugar`. A ação
que grava o campo é a Task 2 — se ela quebrar depois, é ela que está errada, e
não o leitor.

- [ ] **Step 6b: Rodar a suíte inteira, para provar que nada quebrou**

```bash
npm test
```
Expected: nenhuma falha nova. `lugar` é opcional, então tudo que já existia continua compilando e passando.

- [ ] **Step 7: Commit**

```bash
git add src/regras/modelo.ts testes/lugarNaMesa.test.ts
git commit -m "feat: o lugar na mesa vira campo da participacao"
```

---

## Task 2: A ação `sentar` escolhe o lugar

**Files:**
- Modify: `caixa-vivo/src/regras/reducer.ts`
- Test: `caixa-vivo/testes/lugarNaMesa.test.ts` (acrescentar um `describe`)

**Interfaces:**
- Consumes: `Participacao.lugar`, `TOTAL_DE_LUGARES`, `participacaoNoLugar` da Task 1
- Produces: `{ tipo: 'sentar'; jogadorId: string; lugar?: number }`

- [ ] **Step 1: Escrever os testes que falham**

Acrescente ao fim de `caixa-vivo/testes/lugarNaMesa.test.ts`:

```ts
describe('sentar com lugar escolhido', () => {
  it('o lugar sobrevive a saida de outro jogador — o bug original', () => {
    let noite = rodar(noiteVazia, [
      ...ABRIR,
      { tipo: 'sentar', jogadorId: 'j-rafa', lugar: 1 },
      { tipo: 'sentar', jogadorId: 'j-dede', lugar: 4 },
    ])
    const rafa = participacaoDe(noite, 'j-rafa')
    expect(participacaoDe(noite, 'j-dede').lugar).toBe(4)

    noite = reducer(noite, { tipo: 'devolver-e-encerrar', participacaoId: rafa.id, valor: 0 })

    // Antes deste plano o Dede virava lugar 1 sem ter se mexido, porque o
    // lugar era a posicao no array ordenado por hora de confirmacao.
    expect(participacaoDe(noite, 'j-dede').lugar).toBe(4)
  })

  it('recusa dois jogadores no mesmo lugar, e nao cria participacao', () => {
    const antes = rodar(noiteVazia, [...ABRIR, { tipo: 'sentar', jogadorId: 'j-rafa', lugar: 5 }])
    const depois = reducer(antes, { tipo: 'sentar', jogadorId: 'j-bia', lugar: 5 })

    expect(depois.aviso).toBe('O lugar 5 já está ocupado.')
    expect(participacoesAbertas(depois)).toHaveLength(1)
  })

  it('quem esta de pe recebe lugar sem virar participacao nova', () => {
    const antes = rodar(noiteVazia, [...ABRIR, { tipo: 'sentar', jogadorId: 'j-tiago' }])
    expect(participacaoDe(antes, 'j-tiago').lugar).toBeUndefined()

    const depois = reducer(antes, { tipo: 'sentar', jogadorId: 'j-tiago', lugar: 7 })

    // Sem este caso, quem entra pela aba Mesa fica de pe para sempre: a unica
    // acao que existe recusaria com "ja esta na mesa".
    expect(participacaoDe(depois, 'j-tiago').lugar).toBe(7)
    expect(participacoesAbertas(depois)).toHaveLength(1)
    expect(participacaoDe(depois, 'j-tiago').id).toBe(participacaoDe(antes, 'j-tiago').id)
  })

  it('quem ja esta sentado recebe o aviso do jogador, nao o do lugar', () => {
    const antes = rodar(noiteVazia, [...ABRIR, { tipo: 'sentar', jogadorId: 'j-bia', lugar: 3 }])
    const depois = reducer(antes, { tipo: 'sentar', jogadorId: 'j-bia', lugar: 3 })

    // A guarda do lugar ignora a participacao do proprio jogador: a mensagem
    // tem de apontar para o que o operador precisa corrigir.
    expect(depois.aviso).toBe('Esse jogador já está na mesa.')
  })

  it('recusa lugar fora da mesa', () => {
    const antes = rodar(noiteVazia, ABRIR)

    expect(reducer(antes, { tipo: 'sentar', jogadorId: 'j-bia', lugar: 0 }).aviso).toBe(
      'A mesa tem 10 lugares.'
    )
    expect(reducer(antes, { tipo: 'sentar', jogadorId: 'j-bia', lugar: 11 }).aviso).toBe(
      'A mesa tem 10 lugares.'
    )
    expect(participacoesAbertas(reducer(antes, { tipo: 'sentar', jogadorId: 'j-bia', lugar: 11 })))
      .toHaveLength(0)
  })

  it('encerrar a conta libera a cadeira para outra pessoa', () => {
    let noite = rodar(noiteVazia, [...ABRIR, { tipo: 'sentar', jogadorId: 'j-rafa', lugar: 2 }])
    const rafa = participacaoDe(noite, 'j-rafa')

    noite = reducer(noite, { tipo: 'devolver-e-encerrar', participacaoId: rafa.id, valor: 0 })
    noite = reducer(noite, { tipo: 'sentar', jogadorId: 'j-nando', lugar: 2 })

    expect(participacaoDe(noite, 'j-nando').lugar).toBe(2)
    expect(noite.participacoes.find((p) => p.id === rafa.id)?.lugar).toBe(2)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

```bash
npm test -- testes/lugarNaMesa.test.ts
```
Expected: FAIL — o TypeScript recusa `lugar` na ação `sentar`.

- [ ] **Step 3: Acrescentar `lugar` à ação**

Em `caixa-vivo/src/regras/reducer.ts`, a linha da união hoje é:

```ts
  | { tipo: 'sentar'; jogadorId: string }
```

Passa a ser:

```ts
  | { tipo: 'sentar'; jogadorId: string; lugar?: number }
```

- [ ] **Step 4: Reescrever o caso `sentar`**

Ainda em `reducer.ts`, o caso hoje é:

```ts
    case 'sentar': {
      if (!noite.sessao?.aberta) {
        return comAviso(noite, 'Abra a sessão antes de sentar alguém na mesa.')
      }
      const jaNaMesa = participacoesAbertas(noite).some(
        (p) => p.jogadorId === acao.jogadorId
      )
      if (jaNaMesa) return comAviso(noite, 'Esse jogador já está na mesa.')

      return {
        ...noite,
        participacoes: [
          ...noite.participacoes,
          {
            id: `p${noite.seq}`,
            sessaoId: noite.sessao.id,
            jogadorId: acao.jogadorId,
            entrouAs: noite.agora,
            encerrada: false,
          },
        ],
        seq: noite.seq + 1,
        aviso: null,
      }
    }
```

Passa a ser:

```ts
    case 'sentar': {
      if (!noite.sessao?.aberta) {
        return comAviso(noite, 'Abra a sessão antes de sentar alguém na mesa.')
      }

      // A mesa tem dez cadeiras e nao e configuravel (DEC-003).
      if (acao.lugar !== undefined) {
        const dentroDaMesa =
          Number.isInteger(acao.lugar) && acao.lugar >= 1 && acao.lugar <= TOTAL_DE_LUGARES
        if (!dentroDaMesa) {
          return comAviso(noite, `A mesa tem ${TOTAL_DE_LUGARES} lugares.`)
        }
      }

      const dele = participacoesAbertas(noite).find((p) => p.jogadorId === acao.jogadorId)

      // A cadeira so esta tomada se for de OUTRO jogador. Sentar a Bia no
      // lugar em que a Bia ja esta tem de dizer "ja esta na mesa" — a mensagem
      // aponta para o que o operador precisa corrigir.
      if (acao.lugar !== undefined) {
        const ocupante = participacaoNoLugar(noite, acao.lugar)
        if (ocupante && ocupante.id !== dele?.id) {
          return comAviso(noite, `O lugar ${acao.lugar} já está ocupado.`)
        }
      }

      // Ja esta na mesa e ainda de pe: ele ganha a cadeira, e NAO vira uma
      // segunda participacao. Sem este caminho, quem entra pela aba Mesa —
      // que nao tem desenho para tocar — fica de pe para sempre.
      if (dele) {
        if (dele.lugar === undefined && acao.lugar !== undefined) {
          return {
            ...noite,
            participacoes: noite.participacoes.map((p) =>
              p.id === dele.id ? { ...p, lugar: acao.lugar } : p
            ),
            aviso: null,
          }
        }
        return comAviso(noite, 'Esse jogador já está na mesa.')
      }

      return {
        ...noite,
        participacoes: [
          ...noite.participacoes,
          {
            id: `p${noite.seq}`,
            sessaoId: noite.sessao.id,
            jogadorId: acao.jogadorId,
            entrouAs: noite.agora,
            encerrada: false,
            lugar: acao.lugar,
          },
        ],
        seq: noite.seq + 1,
        aviso: null,
      }
    }
```

- [ ] **Step 5: Importar o que o caso passou a usar**

No topo de `reducer.ts`, o import hoje é:

```ts
import {
  TETO_CONTINGENCIAS,
  caixaEsperado,
  checkpointsDaSessao,
  comprometido,
  contingenciasDaSessao,
  formatarHora,
  jaRegistrado,
  jogadorPorIdentidade,
  participacoesAbertas,
  podeEncerrarSessao,
  reais,
  turnoAberto,
  turnoEm,
  turnosNaJanela,
  vereditoDa,
  whatsappJaUsado,
  type Checkpoint,
  type Minutos,
  type Movimentacao,
  type Noite,
  type TipoConfirmacao,
} from './modelo'
```

Passa a ser (duas linhas novas — a lista segue a ordem que já estava: as
constantes em maiúscula primeiro, depois as funções em ordem alfabética):

```ts
import {
  TETO_CONTINGENCIAS,
  TOTAL_DE_LUGARES,
  caixaEsperado,
  checkpointsDaSessao,
  comprometido,
  contingenciasDaSessao,
  formatarHora,
  jaRegistrado,
  jogadorPorIdentidade,
  participacaoNoLugar,
  participacoesAbertas,
  podeEncerrarSessao,
  reais,
  turnoAberto,
  turnoEm,
  turnosNaJanela,
  vereditoDa,
  whatsappJaUsado,
  type Checkpoint,
  type Minutos,
  type Movimentacao,
  type Noite,
  type TipoConfirmacao,
} from './modelo'
```

- [ ] **Step 6: Rodar e ver passar**

```bash
npm test -- testes/lugarNaMesa.test.ts
```
Expected: PASS — 11 testes (5 da Task 1 + 6 desta).

- [ ] **Step 7: Rodar a suíte inteira, para provar que nada quebrou**

```bash
npm test
```
Expected: 12 arquivos passam; 6 falham por falta do Supabase local (`Banco de teste indisponível`), que é o estado conhecido. **Nenhuma falha nova.** Em particular, `testes/provas/` tem de continuar verde: `sentar` sem `lugar` mantém o comportamento antigo.

- [ ] **Step 8: Commit**

```bash
git add src/regras/reducer.ts testes/lugarNaMesa.test.ts
git commit -m "feat: o operador escolhe o lugar, e quem esta de pe ganha cadeira"
```

---

## Task 3: As três cópias das regras voltam a ser idênticas

**Files:**
- Modify: `imersao-teste-design/product-plan/regras/{modelo,reducer}.ts`
- Modify: `imersao-teste-design/src/simulacao/{modelo,reducer}.ts`

**Interfaces:**
- Consumes: os arquivos da Task 1 e da Task 2
- Produces: nada de novo — restaura o invariante de cópia

> **Por que isto é uma tarefa e não um detalhe.** A regra de cópia byte a byte é o que impede o protótipo, o pacote exportado e o app divergirem. Foi a quebra dela que a auditoria de 2026-08-12 procurou primeiro. Se as três não voltarem iguais no mesmo dia, a próxima auditoria acha divergência e ninguém lembra por quê.

- [ ] **Step 1: Copiar**

```bash
cd /Users/juniorcesar/imersao3
for f in modelo.ts reducer.ts; do
  cp "caixa-vivo/src/regras/$f" "imersao-teste-design/product-plan/regras/$f"
  cp "caixa-vivo/src/regras/$f" "imersao-teste-design/src/simulacao/$f"
done
```

- [ ] **Step 2: Provar a igualdade**

```bash
cd /Users/juniorcesar/imersao3
for f in modelo.ts reducer.ts; do
  printf "%-12s " "$f"
  diff -q "caixa-vivo/src/regras/$f" "imersao-teste-design/product-plan/regras/$f" >/dev/null \
    && printf "pacote=igual " || printf "pacote=DIFERE "
  diff -q "caixa-vivo/src/regras/$f" "imersao-teste-design/src/simulacao/$f" >/dev/null \
    && echo "simulacao=igual" || echo "simulacao=DIFERE"
done
```
Expected: `modelo.ts pacote=igual simulacao=igual` e `reducer.ts pacote=igual simulacao=igual`.

- [ ] **Step 3: Ver o que o Design OS acusa**

```bash
cd /Users/juniorcesar/imersao3/imersao-teste-design
npx tsc -b --noEmit
```
Expected: **FAIL**, em `src/simulacao/vistas.ts` — `LugarOcupado` ainda não tem `validou`, e a vista ainda deriva o lugar da ordem. Isso é esperado e é o trabalho das Tasks 5 e 6. Anote os erros; eles são a lista do que falta.

- [ ] **Step 4: Commit**

```bash
cd /Users/juniorcesar/imersao3/imersao-teste-design
git add product-plan/regras src/simulacao/modelo.ts src/simulacao/reducer.ts
git commit -m "chore: as tres copias das regras voltam a ser identicas"
```

---

## Task 4: O banco guarda o lugar

**Files:**
- Create: `caixa-vivo/supabase/migrations/0002_lugar_na_mesa.sql`
- Modify: `caixa-vivo/src/dados/tipos-banco.ts`
- Modify: `caixa-vivo/src/dados/carregarNoite.ts`
- Modify: `caixa-vivo/src/dados/persistirDelta.ts`
- Test: `caixa-vivo/testes/banco.test.ts` (acrescentar um `it`)

**Interfaces:**
- Consumes: `Participacao.lugar` da Task 1
- Produces: a coluna `participacao.lugar` e o índice `participacao_um_por_lugar`

> **Por que constraint no banco se o `reducer` já valida.** Mesmo critério da Task 2 do plano da fatia vertical: o `reducer` roda no navegador, e duas abas abertas na mesma noite podem sentar duas pessoas no lugar 7 por corrida. Aqui não corrompe a conta do caixa — corrompe a leitura da mesa, que é o que a F13 existe para dar.

- [ ] **Step 1: Escrever o teste que falha**

Acrescente ao `describe('invariantes do banco', ...)` de `caixa-vivo/testes/banco.test.ts`:

```ts
  it('recusa duas participacoes abertas no mesmo lugar, e aceita depois de encerrar', async () => {
    const { data: s } = await db
      .from('sessao')
      .insert({ clube_id: CLUBE_TESTE, aberta_em: new Date().toISOString(), caixa_inicial: 20000 })
      .select()
      .single()

    const { data: j1 } = await db
      .from('jogador')
      .insert({
        clube_id: CLUBE_TESTE, nome: 'Um', whatsapp: '11999990001',
        limite: 3000, consentimento_em: new Date().toISOString(),
      })
      .select().single()
    const { data: j2 } = await db
      .from('jogador')
      .insert({
        clube_id: CLUBE_TESTE, nome: 'Dois', whatsapp: '11999990002',
        limite: 3000, consentimento_em: new Date().toISOString(),
      })
      .select().single()

    const primeira = await db.from('participacao').insert({
      sessao_id: s!.id, jogador_id: j1!.id, entrou_as: 1140, lugar: 7,
    })
    expect(primeira.error).toBeNull()

    const segunda = await db.from('participacao').insert({
      sessao_id: s!.id, jogador_id: j2!.id, entrou_as: 1150, lugar: 7,
    })
    expect(segunda.error?.code).toBe('23505')

    // Encerrar a conta devolve a cadeira ao pool — sem apagar o numero (N13).
    await db
      .from('participacao')
      .update({ encerrada: true, saiu_as: 1200 })
      .eq('sessao_id', s!.id)
      .eq('jogador_id', j1!.id)

    const terceira = await db.from('participacao').insert({
      sessao_id: s!.id, jogador_id: j2!.id, entrou_as: 1210, lugar: 7,
    })
    expect(terceira.error).toBeNull()
  })

  it('recusa lugar fora da mesa', async () => {
    const { data: s } = await db
      .from('sessao')
      .insert({ clube_id: CLUBE_TESTE, aberta_em: new Date().toISOString(), caixa_inicial: 20000 })
      .select().single()
    const { data: j } = await db
      .from('jogador')
      .insert({
        clube_id: CLUBE_TESTE, nome: 'Onze', whatsapp: '11999990011',
        limite: 3000, consentimento_em: new Date().toISOString(),
      })
      .select().single()

    const r = await db.from('participacao').insert({
      sessao_id: s!.id, jogador_id: j!.id, entrou_as: 1140, lugar: 11,
    })
    expect(r.error?.code).toBe('23514')
  })
```

- [ ] **Step 2: Rodar e ver falhar**

```bash
cd caixa-vivo
npx supabase start
export SUPABASE_URL_TESTE=http://127.0.0.1:54321
export SUPABASE_SERVICE_ROLE_TESTE="$(npx supabase status --output json | jq -r .SERVICE_ROLE_KEY)"
npm test -- testes/banco.test.ts
```
Expected: FAIL — `column "lugar" of relation "participacao" does not exist`.

Se o Docker não estiver rodando, o erro é `Banco de teste indisponível`. Suba o Docker; **não pule o teste**.

- [ ] **Step 3: Escrever a migration**

`caixa-vivo/supabase/migrations/0002_lugar_na_mesa.sql`:

```sql
-- O lugar na mesa ao vivo (F13, item 4 da divergencia D4 do PRD).
--
-- Ate aqui o numero do lugar nao existia como dado: era a posicao num array
-- ordenado por hora da primeira confirmacao. Quem fechava a conta fazia todo
-- mundo andar uma cadeira, e o lugar que o operador tocava era descartado.

alter table participacao
  add column lugar integer check (lugar between 1 and 10);

-- Um jogador por lugar, entre as contas ABERTAS.
--
-- Parcial de proposito: a conta encerrada guarda o lugar que teve (N13, nada e
-- apagado) e mesmo assim devolve a cadeira ao pool. O reducer ja valida isto;
-- o indice existe porque o reducer roda no navegador, e duas abas na mesma
-- noite podem sentar duas pessoas no lugar 7 por corrida.
create unique index participacao_um_por_lugar
  on participacao (sessao_id, lugar)
  where lugar is not null and not encerrada;
```

- [ ] **Step 4: Aplicar e ver passar**

```bash
npx supabase db reset
npm test -- testes/banco.test.ts
```
Expected: PASS — 7 testes (os 5 que já existiam + os 2 novos).

- [ ] **Step 5: Ler o lugar do banco**

Em `caixa-vivo/src/dados/tipos-banco.ts`, a linha hoje é:

```ts
export interface LinhaParticipacao {
  id: string
  sessao_id: string
  jogador_id: string
  entrou_as: Minutos
  saiu_as: Minutos | null
  encerrada: boolean
}
```

Passa a ser:

```ts
export interface LinhaParticipacao {
  id: string
  sessao_id: string
  jogador_id: string
  entrou_as: Minutos
  saiu_as: Minutos | null
  encerrada: boolean
  /** 1 a 10, ou null enquanto o jogador estiver de pe. */
  lugar: number | null
}
```

Em `caixa-vivo/src/dados/carregarNoite.ts`, o mapeamento hoje é:

```ts
    participacoes: ((participacoes.data ?? []) as LinhaParticipacao[]).map((p) => ({
      id: p.id,
      sessaoId: p.sessao_id,
      jogadorId: p.jogador_id,
      entrouAs: p.entrou_as,
      saiuAs: p.saiu_as ?? undefined,
      encerrada: p.encerrada,
    })),
```

Passa a ser:

```ts
    participacoes: ((participacoes.data ?? []) as LinhaParticipacao[]).map((p) => ({
      id: p.id,
      sessaoId: p.sessao_id,
      jogadorId: p.jogador_id,
      entrouAs: p.entrou_as,
      saiuAs: p.saiu_as ?? undefined,
      encerrada: p.encerrada,
      lugar: p.lugar ?? undefined,
    })),
```

- [ ] **Step 6: Gravar o lugar, na inserção e na atualização**

Em `caixa-vivo/src/dados/persistirDelta.ts`, o bloco hoje é:

```ts
  // ── participações ───────────────────────────────────────────────────────
  for (const p of depois.participacoes) {
    const anterior = antes.participacoes.find((x) => x.id === p.id)
    if (!anterior) {
      const { data, error } = await db
        .from('participacao')
        .insert({
          sessao_id: traduz(p.sessaoId),
          jogador_id: traduz(p.jogadorId),
          entrou_as: p.entrouAs,
          saiu_as: p.saiuAs ?? null,
          encerrada: p.encerrada,
        })
        .select('id')
        .single()
      erro(error, 'a entrada do jogador na mesa')
      mapa.set(p.id, data!.id)
    } else if (anterior.encerrada !== p.encerrada || anterior.saiuAs !== p.saiuAs) {
      const { error } = await db
        .from('participacao')
        .update({ encerrada: p.encerrada, saiu_as: p.saiuAs ?? null })
        .eq('id', p.id)
      erro(error, 'a saída do jogador')
    }
  }
```

Passa a ser:

```ts
  // ── participações ───────────────────────────────────────────────────────
  for (const p of depois.participacoes) {
    const anterior = antes.participacoes.find((x) => x.id === p.id)
    if (!anterior) {
      const { data, error } = await db
        .from('participacao')
        .insert({
          sessao_id: traduz(p.sessaoId),
          jogador_id: traduz(p.jogadorId),
          entrou_as: p.entrouAs,
          saiu_as: p.saiuAs ?? null,
          encerrada: p.encerrada,
          lugar: p.lugar ?? null,
        })
        .select('id')
        .single()
      erro(error, 'a entrada do jogador na mesa')
      mapa.set(p.id, data!.id)
    } else if (
      anterior.encerrada !== p.encerrada ||
      anterior.saiuAs !== p.saiuAs ||
      // Sentar quem estava de pe muda uma participacao que JA existe. Sem esta
      // condicao a cadeira escolhida sumia no recarregar da pagina.
      anterior.lugar !== p.lugar
    ) {
      const { error } = await db
        .from('participacao')
        .update({
          encerrada: p.encerrada,
          saiu_as: p.saiuAs ?? null,
          lugar: p.lugar ?? null,
        })
        .eq('id', p.id)
      erro(error, 'a saída do jogador')
    }
  }
```

- [ ] **Step 7: Rodar a suíte de dados**

```bash
npm test -- testes/carregarNoite.test.ts testes/persistirDelta.test.ts testes/banco.test.ts
```
Expected: PASS — todos.

- [ ] **Step 8: Commit**

```bash
git add supabase/migrations/0002_lugar_na_mesa.sql src/dados testes/banco.test.ts
git commit -m "feat: o banco guarda o lugar, com um jogador por cadeira aberta"
```

---

## Task 5: O `MesaVisual` desenha o lugar reservado

**Files:**
- Modify: `caixa-vivo/src/sections/jogadores-e-mesa/components/MesaVisual.tsx`
- Copy: para `imersao-teste-design/src/sections/jogadores-e-mesa/components/MesaVisual.tsx` e `imersao-teste-design/product-plan/sections/jogadores-e-mesa/components/MesaVisual.tsx`

**Interfaces:**
- Consumes: nada do código — só o conceito dos três estados
- Produces: `LugarOcupado.validou: boolean`

> **Um array com um booleano, não dois arrays.** Um segundo `reservados` dobraria a superfície pública e faria o anel de dez cadeiras ser montado de duas leituras. `validou` mantém uma leitura só.

- [ ] **Step 1: Acrescentar o campo ao tipo**

Em `MesaVisual.tsx`, a interface hoje termina assim:

```ts
export interface LugarOcupado {
  /** Numero do lugar, de 1 a 10. */
  lugar: number
  participacaoId: string
  nome: string
  entrouAs: string
  emMao: number
  limite: number
  /** Retirada esperando o jogador confirmar. O lugar fica marcado ate sair. */
  aguardando: number
  contingencias: number
}
```

Acrescente o campo, com a explicação:

```ts
export interface LugarOcupado {
  /** Numero do lugar, de 1 a 10. Escolhido pelo operador, nao derivado de ordem. */
  lugar: number
  participacaoId: string
  nome: string
  entrouAs: string
  emMao: number
  limite: number
  /** Retirada esperando o jogador confirmar. O lugar fica marcado ate sair. */
  aguardando: number
  contingencias: number
  /**
   * Ja confirmou a primeira ficha na tela girada?
   *
   * `false` = lugar RESERVADO: a cadeira tem dono, mas ele ainda nao reconheceu
   * ficha nenhuma. E a leitura da N2 que a F13 existe para dar (criterio A26).
   */
  validou: boolean
}
```

- [ ] **Step 2: Desenhar o reservado**

Ainda em `MesaVisual.tsx`, dentro do `Array.from({ length: totalDeLugares }, ...)`, o ramo do lugar ocupado hoje começa assim:

```tsx
          const comprometido = jogador.emMao + jogador.aguardando
          const uso = jogador.limite > 0 ? Math.min(comprometido / jogador.limite, 1) : 0
          const apertado = uso >= 0.8
          const esperando = jogador.aguardando > 0
```

Acrescente uma linha logo depois:

```tsx
          const comprometido = jogador.emMao + jogador.aguardando
          const uso = jogador.limite > 0 ? Math.min(comprometido / jogador.limite, 1) : 0
          const apertado = uso >= 0.8
          const esperando = jogador.aguardando > 0
          // Cadeira com dono que ainda nao reconheceu ficha. Neutra de
          // proposito: e o estado normal de quem acabou de chegar, nao alerta.
          const reservado = !jogador.validou
```

Depois, dentro do `<button>` do lugar ocupado:

**(a)** No `className`, acrescente o tracejado do reservado. Hoje:

```tsx
              className={`${molduraDoLugar} cv-panel hover:scale-105 focus-visible:ring-2 focus-visible:outline-none ${
                esperando
                  ? // Violeta: chrome, nao estado do caixa. Marca "esperando ele olhar".
                    'cv-ch-chrome cv-accent-ring'
                  : ''
              }`}
```

Passa a ser:

```tsx
              className={`${molduraDoLugar} hover:scale-105 focus-visible:ring-2 focus-visible:outline-none ${
                reservado
                  ? // Tracejado e sem chapa: a cadeira tem dono, mas nada
                    // aconteceu nela ainda.
                    'border border-dashed border-[var(--cv-hairline)] bg-[var(--cv-panel-quiet)]'
                  : 'cv-panel'
              } ${
                esperando
                  ? // Violeta: chrome, nao estado do caixa. Marca "esperando ele olhar".
                    'cv-ch-chrome cv-accent-ring'
                  : ''
              }`}
```

**(b)** O `aria-label` hoje é:

```tsx
              aria-label={`Lugar ${numero}: ${jogador.nome}, ${reais(jogador.emMao)} em fichas, desde ${jogador.entrouAs}.`}
```

Passa a ser:

```tsx
              aria-label={
                reservado
                  ? `Lugar ${numero}: ${jogador.nome}, reservado, aguardando a primeira ficha.`
                  : `Lugar ${numero}: ${jogador.nome}, ${reais(jogador.emMao)} em fichas, desde ${jogador.entrouAs}.`
              }
```

**(c)** O valor em fichas e a barra de limite hoje são:

```tsx
              <span className="cv-text font-cv-mono cv-num mt-1 block text-[13px] leading-none font-bold">
                {reais(jogador.emMao)}
              </span>

              <span className="cv-panel-quiet mt-1.5 block h-1 overflow-hidden rounded-full">
                <span
                  className={`block h-full rounded-full bg-current ${
                    apertado ? 'cv-ch-limite cv-accent-bg' : 'cv-text-soft bg-current opacity-45'
                  }`}
                  style={{ width: `${uso * 100}%` }}
                />
              </span>

              {esperando ? (
                <span className="cv-accent-text font-cv-mono cv-num mt-1.5 block text-[9px] leading-tight font-semibold">
                  aguardando {reais(jogador.aguardando)}
                </span>
              ) : (
                <span className="cv-text-soft font-cv-mono cv-num mt-1.5 flex items-center justify-center gap-0.5 text-[9px] opacity-80">
                  <Clock className="size-2.5" aria-hidden="true" />
                  {jogador.entrouAs}
                </span>
              )}
```

Passam a ser:

```tsx
              {/* O reservado nao mostra valor nem barra: ele nao tem nem um nem
                  outro. Mostrar R$ 0 com barra vazia faria a cadeira parecer um
                  jogador zerado, que e coisa bem diferente de nao ter comecado. */}
              {reservado ? (
                <span className="cv-text-soft mt-1 block text-[10px] leading-tight">
                  reservado
                </span>
              ) : (
                <>
                  <span className="cv-text font-cv-mono cv-num mt-1 block text-[13px] leading-none font-bold">
                    {reais(jogador.emMao)}
                  </span>

                  <span className="cv-panel-quiet mt-1.5 block h-1 overflow-hidden rounded-full">
                    <span
                      className={`block h-full rounded-full bg-current ${
                        apertado ? 'cv-ch-limite cv-accent-bg' : 'cv-text-soft bg-current opacity-45'
                      }`}
                      style={{ width: `${uso * 100}%` }}
                    />
                  </span>
                </>
              )}

              {reservado ? (
                <span className="cv-text-soft font-cv-mono cv-num mt-1.5 block text-[9px] leading-tight opacity-80">
                  aguarda a 1ª ficha
                </span>
              ) : esperando ? (
                <span className="cv-accent-text font-cv-mono cv-num mt-1.5 block text-[9px] leading-tight font-semibold">
                  aguardando {reais(jogador.aguardando)}
                </span>
              ) : (
                <span className="cv-text-soft font-cv-mono cv-num mt-1.5 flex items-center justify-center gap-0.5 text-[9px] opacity-80">
                  <Clock className="size-2.5" aria-hidden="true" />
                  {jogador.entrouAs}
                </span>
              )}
```

**(d)** Atualize o comentário do bloco "de pé", no fim do componente. Hoje:

```tsx
          <p className="cv-text-soft mt-1.5 text-[12px] leading-snug">
            O lugar é ocupado quando o jogador confirma a primeira ficha na tela girada.
          </p>
```

Passa a ser:

```tsx
          <p className="cv-text-soft mt-1.5 text-[12px] leading-snug">
            Ainda sem cadeira. Toque num lugar livre para sentar alguém — o lugar
            fica reservado até ele confirmar a primeira ficha na tela girada.
          </p>
```

- [ ] **Step 3: Copiar para as outras duas cópias e provar a igualdade**

```bash
cd /Users/juniorcesar/imersao3
A=caixa-vivo/src/sections/jogadores-e-mesa/components/MesaVisual.tsx
cp "$A" imersao-teste-design/src/sections/jogadores-e-mesa/components/MesaVisual.tsx
cp "$A" imersao-teste-design/product-plan/sections/jogadores-e-mesa/components/MesaVisual.tsx
md5 -q "$A" \
  imersao-teste-design/src/sections/jogadores-e-mesa/components/MesaVisual.tsx \
  imersao-teste-design/product-plan/sections/jogadores-e-mesa/components/MesaVisual.tsx \
  | sort -u | wc -l
```
Expected: `1` — um hash só para os três arquivos.

- [ ] **Step 4: Conferir que o app compila**

```bash
cd /Users/juniorcesar/imersao3/caixa-vivo && npx tsc -b --noEmit
```
Expected: PASS — o app não renderiza `MesaVisual` em nenhuma tela (a tela Ao vivo é fatia própria), então o campo novo não quebra nada lá.

- [ ] **Step 5: Commit nos dois repositórios**

```bash
cd /Users/juniorcesar/imersao3/caixa-vivo
git add src/sections/jogadores-e-mesa/components/MesaVisual.tsx
git commit -m "feat: a mesa desenha a cadeira reservada"

cd /Users/juniorcesar/imersao3/imersao-teste-design
git add src/sections/jogadores-e-mesa/components/MesaVisual.tsx \
        product-plan/sections/jogadores-e-mesa/components/MesaVisual.tsx
git commit -m "feat: a mesa desenha a cadeira reservada"
```

---

## Task 6: O protótipo lê o campo em vez de derivar da ordem

**Files:**
- Modify: `imersao-teste-design/src/simulacao/vistas.ts`
- Modify: `imersao-teste-design/src/simulacao/telas/MesaAoVivoConectada.tsx`

**Interfaces:**
- Consumes: `Participacao.lugar`, `validouFicha` (Task 1); `LugarOcupado.validou` (Task 5)
- Produces: `mesaAoVivoVista(noite)` com `lugares` vindos do campo

- [ ] **Step 1: Reescrever `mesaAoVivoVista`**

Em `imersao-teste-design/src/simulacao/vistas.ts`, a função hoje é:

```ts
/**
 * A mesa vista de cima.
 *
 * O lugar e derivado da ordem em que cada jogador validou a PRIMEIRA ficha na
 * tela girada — e nao da ordem em que ele entrou na sessao. Quem ainda nao
 * validou nada aparece "de pe", fora dos lugares.
 *
 * ⚠️ Derivar o lugar assim serve para a previa. Num produto de verdade o lugar
 * precisa ser um campo proprio da Participacao: o operador vai querer escolher
 * onde a pessoa senta, e o lugar tem de sobreviver a uma troca de mesa.
 */
export function mesaAoVivoVista(noite: Noite) {
  const movimentacoes = movimentacoesDaSessao(noite)

  const comHoraDeSentar = participacoesAbertas(noite).map((p) => {
    const validadas = movimentacoes
      .filter(
        (m) =>
          m.participacaoId === p.id && m.tipo === 'retirada' && m.situacao === 'confirmada'
      )
      .map((m) => m.horaOcorrencia)
    return {
      participacao: p,
      sentouAs: validadas.length > 0 ? Math.min(...validadas) : null,
    }
  })

  const sentados = comHoraDeSentar
    .filter((x): x is typeof x & { sentouAs: number } => x.sentouAs !== null)
    .sort((a, b) => a.sentouAs - b.sentouAs)

  const lugares: LugarOcupado[] = sentados.map(({ participacao }, indice) => {
    const jogador = jogadorDe(noite, participacao.id)
    return {
      lugar: indice + 1,
      participacaoId: participacao.id,
      nome: jogador?.nome ?? '—',
      entrouAs: formatarHora(participacao.entrouAs),
      emMao: emMao(noite, participacao.id),
      limite: jogador?.limite ?? 0,
      aguardando: aguardando(noite, participacao.id),
      contingencias: contingenciasDe(noite, participacao.id),
    }
  })

  const emPe = comHoraDeSentar
    .filter((x) => x.sentouAs === null)
    .map(({ participacao }) => ({
      participacaoId: participacao.id,
      nome: jogadorDe(noite, participacao.id)?.nome ?? '—',
    }))

  const turno = turnoAberto(noite)

  return {
    lugares,
    emPe,
    dealer: turno ? dealerDo(noite, turno) : undefined,
    turno: turno?.numero,
    fichasEmJogo: fichasEmJogo(noite),
  }
}
```

Passa a ser:

```ts
/**
 * A mesa vista de cima.
 *
 * O lugar e o campo `lugar` da Participacao, escolhido pelo operador — nao
 * mais a posicao num array ordenado por hora de confirmacao. Aquela derivacao
 * fazia todo mundo andar uma cadeira quando alguem fechava a conta.
 *
 * Quem tem cadeira e ainda nao confirmou ficha vem com `validou: false`: a
 * mesa desenha o lugar RESERVADO. Quem nao tem cadeira aparece "de pe".
 * Item 4 da divergencia D4 do PRD, criterio A26.
 */
export function mesaAoVivoVista(noite: Noite) {
  const abertas = participacoesAbertas(noite)

  const lugares: LugarOcupado[] = abertas
    .filter((p): p is typeof p & { lugar: number } => p.lugar !== undefined)
    .sort((a, b) => a.lugar - b.lugar)
    .map((participacao) => {
      const jogador = jogadorDe(noite, participacao.id)
      return {
        lugar: participacao.lugar,
        participacaoId: participacao.id,
        nome: jogador?.nome ?? '—',
        entrouAs: formatarHora(participacao.entrouAs),
        emMao: emMao(noite, participacao.id),
        limite: jogador?.limite ?? 0,
        aguardando: aguardando(noite, participacao.id),
        contingencias: contingenciasDe(noite, participacao.id),
        validou: validouFicha(noite, participacao.id),
      }
    })

  const emPe = abertas
    .filter((p) => p.lugar === undefined)
    .map((participacao) => ({
      participacaoId: participacao.id,
      nome: jogadorDe(noite, participacao.id)?.nome ?? '—',
    }))

  const turno = turnoAberto(noite)

  return {
    lugares,
    emPe,
    dealer: turno ? dealerDo(noite, turno) : undefined,
    turno: turno?.numero,
    fichasEmJogo: fichasEmJogo(noite),
  }
}
```

- [ ] **Step 2: Arrumar o import de `vistas.ts`**

O import de `./modelo` hoje termina assim:

```ts
  somaRetiradas,
  turnoAberto,
  turnosDaSessao,
  type Noite,
  type Participacao,
} from './modelo'
```

Passa a ser:

```ts
  somaRetiradas,
  turnoAberto,
  turnosDaSessao,
  validouFicha,
  type Noite,
  type Participacao,
} from './modelo'
```

**Não remova `movimentacoesDaSessao`** do import: `mesaAoVivoVista` deixa de usá-lo, mas outras seis funções deste arquivo continuam usando.

- [ ] **Step 3: Passar o lugar no despacho**

Em `imersao-teste-design/src/simulacao/telas/MesaAoVivoConectada.tsx`, o cálculo de quem pode sentar hoje é:

```tsx
  const vista = mesaAoVivoVista(noite)
  const naMesa = new Set(participacoesAbertas(noite).map((p) => p.jogadorId))
  const disponiveis = noite.jogadores.filter((j) => !naMesa.has(j.id))
```

Passa a ser:

```tsx
  const vista = mesaAoVivoVista(noite)
  const abertas = participacoesAbertas(noite)
  // Quem ja tem cadeira nao aparece na lista de sentar. Quem esta de pe
  // aparece: a acao `sentar` da a cadeira a ele sem criar participacao nova,
  // e sem isso quem entrou pela aba Mesa ficaria de pe para sempre.
  const sentados = new Set(abertas.filter((p) => p.lugar !== undefined).map((p) => p.jogadorId))
  const disponiveis = noite.jogadores.filter((j) => !sentados.has(j.id))
```

E o botão que senta hoje é:

```tsx
                    onClick={() => {
                      despachar({ tipo: 'sentar', jogadorId: jogador.id })
                      setSentando(null)
                    }}
```

Passa a ser:

```tsx
                    onClick={() => {
                      despachar({ tipo: 'sentar', jogadorId: jogador.id, lugar: sentando })
                      setSentando(null)
                    }}
```

- [ ] **Step 4: Ajustar o texto do painel de sentar**

No mesmo arquivo, o texto hoje é:

```tsx
              <p className="cv-text-soft mt-1.5 text-[12px] leading-snug">
                Ele entra na sessão agora, mas só ocupa o lugar quando confirmar a
                primeira ficha na tela girada.
              </p>
```

Passa a ser:

```tsx
              <p className="cv-text-soft mt-1.5 text-[12px] leading-snug">
                A cadeira fica reservada para ele agora. Ela só passa a ocupada
                quando ele confirmar a primeira ficha na tela girada.
              </p>
```

- [ ] **Step 5: Compilar e ver passar**

```bash
cd /Users/juniorcesar/imersao3/imersao-teste-design
npx tsc -b --noEmit
```
Expected: PASS, sem nenhum erro. Os erros que a Task 3 Step 3 anotou devem ter todos sumido.

- [ ] **Step 6: Olhar a mesa no navegador**

```bash
npm start
```
Abra `http://localhost:3300`, entre na simulação e vá em **Ao vivo**. Confira, com os olhos:

1. Um lugar livre aceita sentar alguém, e a pessoa aparece **naquele lugar** — não no primeiro livre em ordem.
2. A cadeira dela fica **tracejada**, escrito "reservado" e "aguarda a 1ª ficha", **sem valor e sem barra**.
3. Depois de lançar e confirmar uma ficha para ela, a cadeira vira chapa cheia, com valor e barra.
4. Fechar a conta de outro jogador **não move ninguém de cadeira**.
5. Nada da mesa usa verde, âmbar ou vermelho.

- [ ] **Step 7: Commit**

```bash
git add src/simulacao/vistas.ts src/simulacao/telas/MesaAoVivoConectada.tsx
git commit -m "feat: a mesa da previa le o lugar do campo, e o toque do operador decide"
```

---

## Task 7: O contrato e o dado de amostra

**Files:**
- Modify: `imersao-teste-design/product/sections/jogadores-e-mesa/types.ts`
- Modify: `imersao-teste-design/product/sections/jogadores-e-mesa/data.json`
- Modify: `imersao-teste-design/product/sections/jogadores-e-mesa/spec.md`
- Modify: `imersao-teste-design/product-plan/sections/jogadores-e-mesa/{types.ts,sample-data.json}`
- Modify: `imersao-teste-design/product-plan/data-shapes/overview.ts`

**Interfaces:**
- Consumes: `LugarOcupado.validou` da Task 5
- Produces: contrato e amostra alinhados com o componente

> **Por que isto não é detalhe.** Quem recebe o pacote monta a tela a partir do `types.ts` e do `sample-data.json`. Um `LugarOcupado` sem `validou` faz o `MesaVisual` desenhar todo mundo como reservado — `undefined` é falso.

- [ ] **Step 1: Acrescentar `validou` ao tipo, nos três arquivos**

Em `product/sections/jogadores-e-mesa/types.ts`, `product-plan/sections/jogadores-e-mesa/types.ts` e `product-plan/data-shapes/overview.ts`, a interface `LugarOcupado` termina hoje com:

```ts
  /** Retirada esperando o jogador confirmar. O lugar fica marcado ate sair. */
  aguardando: number
  contingencias: number
}
```

Passa a ser, nos três:

```ts
  /** Retirada esperando o jogador confirmar. O lugar fica marcado ate sair. */
  aguardando: number
  contingencias: number
  /**
   * Ja confirmou a primeira ficha na tela girada?
   *
   * `false` = lugar RESERVADO: a cadeira tem dono, mas ele ainda nao reconheceu
   * ficha nenhuma. E a leitura da N2 que a F13 existe para dar (criterio A26).
   */
  validou: boolean
}
```

- [ ] **Step 2: Corrigir o aviso do `overview.ts`**

Em `product-plan/data-shapes/overview.ts`, o bloco de `LugarOcupado` hoje avisa:

```ts
 * ATENCAO: `lugar` nao pode ser o indice do array nem a ordem de chegada. Se
 * for, dois jogadores trocam de lugar sozinhos quando um deles fecha a conta.
 * No produto, `lugar` e campo proprio da Participacao, gravado no momento da
 * primeira confirmacao.
```

Passa a ser:

```ts
 * `lugar` e campo proprio da Participacao, escolhido pelo operador quando ele
 * senta alguem — nao o indice do array nem a ordem de chegada. Se fosse
 * derivado, dois jogadores trocariam de lugar sozinhos quando um deles
 * fechasse a conta.
```

- [ ] **Step 3: Acrescentar `validou` ao dado de amostra**

Os dois arquivos de amostra hoje têm cinco entradas em `lugares`, todas sem `validou`, e um jogador `j6` em `emPe`. Rode:

```bash
cd /Users/juniorcesar/imersao3/imersao-teste-design
python3 - <<'PY'
import json, collections

for caminho in ["product/sections/jogadores-e-mesa/data.json",
                "product-plan/sections/jogadores-e-mesa/sample-data.json"]:
    d = json.load(open(caminho), object_pairs_hook=collections.OrderedDict)
    for l in d["lugares"]:
        # Bia (lugar 7) entra como reservada: a amostra precisa mostrar os DOIS
        # estados, senao ninguem descobre o desenho tracejado ate a producao.
        l["validou"] = l["lugar"] != 7
    # A Bia reservada nao tem fichas nem retirada aguardando.
    for l in d["lugares"]:
        if not l["validou"]:
            l["emMao"] = 0
            l["aguardando"] = 0
    d["fichasEmJogo"] = sum(l["emMao"] for l in d["lugares"])
    with open(caminho, "w") as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print("ok:", caminho, "fichasEmJogo =", d["fichasEmJogo"])
PY
```
Expected: `fichasEmJogo = 5980` nos dois arquivos (7380 menos os 1400 da Bia).

- [ ] **Step 4: Reescrever o bloco da mesa ao vivo na spec da seção**

Em `product/sections/jogadores-e-mesa/spec.md`, a seção "Mesa ao vivo — a segunda vista (F13)" hoje tem estes dois itens:

```markdown
- **O lugar só é ocupado quando o jogador confirma a primeira ficha na tela girada.** Isso é a regra, não detalhe visual: a mesa é o mostrador da N2 — quem já reconheceu ficha e quem não
- Quem entrou na sessão e ainda não validou nada aparece separado, embaixo, em "Na sessão, ainda de pé". Critério **A26**
```

Passam a ser:

```markdown
- **O lugar é escolhido pelo operador**, tocando numa cadeira livre. Ele é campo próprio da Participação — não a ordem de chegada nem a de confirmação. Derivar de ordem fazia todo mundo andar uma cadeira quando alguém fechava a conta
- **A cadeira fica reservada até o jogador confirmar a primeira ficha na tela girada.** Reservada desenha tracejada, sem valor e sem barra de limite, escrito "aguarda a 1ª ficha", e não aceita outra pessoa. Isso é a regra, não detalhe visual: a mesa é o mostrador da N2 — quem já reconheceu ficha e quem não
- Quem entrou na sessão e **ainda não tem cadeira** aparece separado, embaixo, em "Na sessão, ainda de pé" — é quem foi cadastrado pela aba Mesa, que não tem desenho para tocar. Tocar numa cadeira livre e escolher essa pessoa dá a cadeira a ela, sem criar participação nova. Critério **A26**
- Encerrar a conta devolve a cadeira ao pool. A participação encerrada guarda o número que teve (N13)
```

E o aviso do fim da seção, que hoje é:

```markdown
⚠️ **O número do lugar precisa de origem no dado.** No protótipo ele é derivado da ordem em que cada jogador confirmou a primeira ficha. Isso serve para a prévia; no produto, `lugar` tem que ser **campo próprio da Participação** — senão dois jogadores trocam de lugar sozinhos quando um deles fecha a conta. Item 4 da divergência D4 do PRD, ainda aberto.
```

Passa a ser:

```markdown
✅ **O número do lugar tem origem no dado** desde 2026-08-12: `Participacao.lugar`, com índice no banco garantindo um jogador por cadeira entre as contas abertas. Fecha o item 4 da divergência D4 do PRD.
```

- [ ] **Step 5: Provar que os contratos compilam**

```bash
cd /Users/juniorcesar/imersao3/imersao-teste-design
for f in product-plan/data-shapes/overview.ts product-plan/sections/*/types.ts product/sections/jogadores-e-mesa/types.ts; do
  printf "%-58s " "$f"
  o=$(npx tsc --noEmit --skipLibCheck "$f" 2>&1)
  [ -z "$o" ] && echo ok || { echo ERRO; echo "$o"; }
done
npx tsc -b --noEmit
```
Expected: todos `ok`, e o build do repositório passa.

- [ ] **Step 6: Commit**

```bash
git add product/sections/jogadores-e-mesa product-plan/sections/jogadores-e-mesa product-plan/data-shapes/overview.ts
git commit -m "feat: o contrato e a amostra da mesa carregam a cadeira reservada"
```

---

## Task 8: O PRD fecha o item 4 da D4

**Files:**
- Modify: `/Users/juniorcesar/imersao3/docs/PRD.md`

**Interfaces:**
- Consumes: tudo que as Tasks 1 a 7 entregaram
- Produces: o portão do PRD aberto

> **Esta tarefa é o que deixa o turno encerrar.** O Stop hook compara a mudança mais recente em código de produto contra a data do PRD. Depois das Tasks 1 a 7 ele está fechado, e com razão: mudou regra e mudou tela.

- [ ] **Step 1: Ver o portão fechado**

```bash
/Users/juniorcesar/imersao3/scripts/prd-gate.sh --relatorio
```
Expected: `Portão FECHADO`, listando os arquivos das Tasks 1 a 7.

- [ ] **Step 2: Emendar o critério A26**

Em `docs/PRD.md`, seção 15, o critério hoje é:

```markdown
| **A26** | Na mesa ao vivo, o jogador que entrou na sessão e ainda **não confirmou nenhuma ficha** aparece "de pé", fora dos dez lugares. Ele passa a ocupar um lugar no momento em que confirma a primeira retirada na tela girada |
```

Passa a ser:

```markdown
| **A26** | Na mesa ao vivo, quem entrou na sessão e ainda **não tem lugar** aparece "de pé", fora dos dez lugares. Quem tem lugar e ainda **não confirmou nenhuma ficha** aparece no lugar dele, **reservado** — sem valor em fichas, e a cadeira não aceita outra pessoa. O lugar vira ocupado no momento em que ele confirma a primeira retirada na tela girada |
```

E, **depois do A27** (a última linha da tabela, a da autenticação), acrescente
o critério novo:

```markdown
| **A28** | O lugar de um jogador **não muda** quando outro fecha a conta. A cadeira liberada volta a ficar livre, e a participação encerrada guarda o número que teve |
```

O A28 vai no fim, não junto do A26: a tabela de critérios segue a ordem de
criação, e enfiar um A28 antes do A27 faria a lista ler A26, A28, A27.

- [ ] **Step 3: Ajustar a contagem na definição de pronto**

Na seção 16, a linha hoje é:

```markdown
- [ ] Os 27 critérios de aceitação passam.
```

Passa a ser:

```markdown
- [ ] Os 28 critérios de aceitação passam.
```

- [ ] **Step 4: Fechar o item 4 da tabela da D4**

Na seção 17, dentro da D4, a linha 4 hoje termina com:

```markdown
| 🔴 **aberto** — muda o `reducer` e o esquema do banco, precisa de plano próprio |
```

Passa a ser:

```markdown
| ✅ **feito em 2026-08-12** — `Participacao.lugar`, escolhido pelo operador, com índice parcial no banco garantindo um jogador por cadeira entre contas abertas. Plano em `docs/superpowers/plans/2026-08-12-campo-lugar-na-mesa.md` |
```

E, logo abaixo da tabela, acrescente:

```markdown
> ✅ **A D4 está fechada.** Os quatro itens que a ratificação obrigava foram
> feitos. A tela Ao vivo no app `caixa-vivo` continua sendo fatia própria — o
> dado está pronto para ela, e a regra também.
```

- [ ] **Step 5: Atualizar o cabeçalho do documento**

No topo, o aviso hoje diz:

```markdown
> Continua aberto também o item 4 da D4: o número do lugar na mesa precisa
> virar campo próprio da Participação. Esse não é decisão, é trabalho.
```

Passa a ser:

```markdown
> O item 4 da D4 — o número do lugar na mesa — foi fechado em 2026-08-12.
```

- [ ] **Step 6: Registrar a mudança**

Na seção "Registro de mudanças do sistema", acrescente à tabela "Mudanças que não mexeram no produto":

```markdown
| 2026-08-12 | `modelo.ts` e `reducer.ts` mudaram nas três cópias no mesmo passo; `MesaVisual.tsx` também | **Isto muda produto** — é o item 4 da D4, e está registrado na D4 e no A26, não aqui. A linha fica para marcar que as cópias voltaram a ser byte a byte idênticas, e que a igualdade foi provada com `diff -q` e `md5` |
```

- [ ] **Step 7: Acrescentar o dado à seção 9**

Na seção 9, a linha da Participação hoje é:

```markdown
| **Participação** | Qual jogador, em qual sessão, quando entrou, quando saiu |
```

Passa a ser:

```markdown
| **Participação** | Qual jogador, em qual sessão, quando entrou, quando saiu, e **em que lugar da mesa** — 1 a 10, vazio enquanto ele estiver de pé |
```

- [ ] **Step 8: Subir a versão e escrever o histórico**

No frontmatter, `version: v1.9` passa a `version: v1.10`.

Na tabela "Histórico de versões", acrescente como primeira linha:

```markdown
| **v1.10** | 2026-08-12 | **O item 4 da D4 fechado — a D4 inteira agora está.** O número do lugar na mesa deixa de ser a posição num array ordenado por hora de confirmação e vira **campo próprio da Participação**, escolhido pelo operador. Com a derivação antiga, quem fechava a conta fazia todo mundo andar uma cadeira, e o lugar que o operador tocava era descartado. A mesa ganha um terceiro estado, **reservado**: cadeira com dono que ainda não confirmou ficha, desenhada tracejada e sem valor. O **A26** é emendado — "de pé" passa a querer dizer **sem lugar** — e nasce o **A28**, que prova que ninguém anda de cadeira. O banco recebe a coluna e um índice parcial: um jogador por cadeira entre as contas abertas, com a participação encerrada guardando o número que teve (N13). ⚠️ **Pendente de aprovação** |
```

- [ ] **Step 9: Ver o portão abrir**

```bash
/Users/juniorcesar/imersao3/scripts/prd-gate.sh --relatorio
```
Expected: `Portão ABERTO — nenhum arquivo de produto é mais novo que o PRD.`

- [ ] **Step 10: Commit no repositório de governança**

```bash
cd /Users/juniorcesar/imersao3
git add docs/PRD.md
git commit -m "docs: PRD v1.10 — o lugar vira campo, e a D4 fecha inteira

O numero do lugar era a posicao num array ordenado por hora da primeira
confirmacao. Quem fechava a conta fazia todo mundo andar uma cadeira, e o
lugar que o operador tocava era descartado — onSentar(lugar) viajava pelo
contrato publico e morria.

Agora e campo da Participacao, escolhido pelo operador. A mesa ganha o estado
reservado: cadeira com dono que ainda nao confirmou ficha. A26 emendado, A28
novo, e o banco garante um jogador por cadeira entre contas abertas."
```

---

## Fechamento

- [ ] **Rodar tudo, nos dois repositórios**

```bash
cd /Users/juniorcesar/imersao3/caixa-vivo && npx tsc -b --noEmit && npm test
cd /Users/juniorcesar/imersao3/imersao-teste-design && npx tsc -b --noEmit
```

Expected no `caixa-vivo`: com o Supabase local no ar, **todas** as suítes passam. Sem ele, 6 arquivos falham com `Banco de teste indisponível` — o estado conhecido, e **nenhuma falha nova**.

- [ ] **Conferir os invariantes de cópia uma última vez**

```bash
cd /Users/juniorcesar/imersao3
for f in modelo.ts reducer.ts; do
  md5 -q "caixa-vivo/src/regras/$f" \
    "imersao-teste-design/product-plan/regras/$f" \
    "imersao-teste-design/src/simulacao/$f" | sort -u | wc -l
done
md5 -q caixa-vivo/src/sections/jogadores-e-mesa/components/MesaVisual.tsx \
  imersao-teste-design/src/sections/jogadores-e-mesa/components/MesaVisual.tsx \
  imersao-teste-design/product-plan/sections/jogadores-e-mesa/components/MesaVisual.tsx \
  | sort -u | wc -l
```
Expected: `1`, `1`, `1` — um hash por arquivo.

- [ ] **Rodar `/prd-sync`** para conferir que nenhum desacordo novo nasceu.
