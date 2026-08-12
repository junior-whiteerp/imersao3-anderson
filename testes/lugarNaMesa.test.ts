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
