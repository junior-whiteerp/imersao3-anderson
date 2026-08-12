import { describe, it, expect, beforeEach } from 'vitest'
import { clienteDeTeste, limparBanco, CLUBE_TESTE, DEALER_JOAO } from './banco'
import { carregarNoite } from '@/dados/carregarNoite'
import { persistirDelta } from '@/dados/persistirDelta'
import { reducer } from '@/regras/reducer'

const db = clienteDeTeste()
const OPERADOR = null // sem auth nos testes de unidade; lancado_por aceita null

describe('persistirDelta', () => {
  beforeEach(limparBanco)

  it('insere a sessão criada pelo reducer, com uuid do banco', async () => {
    const antes = await carregarNoite(db, CLUBE_TESTE)
    const depois = reducer(antes, {
      tipo: 'abrir-sessao',
      clube: 'Clube Paris',
      caixaInicial: 20000,
    })

    await persistirDelta(db, antes, depois, OPERADOR)

    const { data } = await db.from('sessao').select('*')
    expect(data).toHaveLength(1)
    expect(data![0].caixa_inicial).toBe(20000)
    expect(data![0].aberta).toBe(true)
    // O id do reducer era "s1"; o que ficou no banco é uuid.
    expect(data![0].id).not.toBe('s1')
  })

  it('atualiza a movimentação que mudou de situação, sem duplicar', async () => {
    let noite = await carregarNoite(db, CLUBE_TESTE)
    let anterior = noite
    noite = reducer(noite, { tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 20000 })
    await persistirDelta(db, anterior, noite, OPERADOR)

    noite = await carregarNoite(db, CLUBE_TESTE)
    anterior = noite
    noite = reducer(noite, { tipo: 'abrir-turno', dealerId: DEALER_JOAO })
    await persistirDelta(db, anterior, noite, OPERADOR)

    noite = await carregarNoite(db, CLUBE_TESTE)
    anterior = noite
    noite = reducer(noite, { tipo: 'lancar-rake', valor: 180, horaOcorrencia: noite.agora })
    await persistirDelta(db, anterior, noite, OPERADOR)

    const { data: movs } = await db.from('movimentacao').select('*')
    const { data: cps } = await db.from('checkpoint').select('*')
    expect(movs).toHaveLength(1)
    expect(cps).toHaveLength(1)
    expect(cps![0].numero).toBe(1)
  })

  it('nunca apaga linha — N13', async () => {
    const antes = await carregarNoite(db, CLUBE_TESTE)
    const depois = reducer(antes, {
      tipo: 'abrir-sessao',
      clube: 'Clube Paris',
      caixaInicial: 20000,
    })
    await persistirDelta(db, antes, depois, OPERADOR)
    // "depois" sem a sessão: persistirDelta não pode interpretar como remoção
    await persistirDelta(db, depois, { ...depois, sessao: null, sessoes: [] }, OPERADOR)
    const { data } = await db.from('sessao').select('*')
    expect(data).toHaveLength(1)
  })
})
