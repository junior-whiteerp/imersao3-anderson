import { describe, it, expect, beforeEach } from 'vitest'
import { comConexao, limparBanco, sql, CLUBE_TESTE, DEALER_JOAO } from './banco'
import { carregarNoite } from '../servidor/dados/carregarNoite'
import { persistirDelta } from '../servidor/dados/persistirDelta'
import { reducer } from '@/regras/reducer'
import type { Noite } from '@/regras/modelo'

const OPERADOR = null // sem auth nos testes de unidade; lancado_por aceita null

/** Carrega, reduz e grava numa conexão só — o que `aplicar` faz por dentro. */
async function passo(acao: Parameters<typeof reducer>[1]): Promise<Noite> {
  return comConexao(async (c) => {
    const antes = await carregarNoite(c, CLUBE_TESTE)
    const depois = reducer(antes, acao)
    await persistirDelta(c, CLUBE_TESTE, antes, depois, OPERADOR)
    return depois
  })
}

describe('persistirDelta', () => {
  beforeEach(limparBanco)

  it('insere a sessão criada pelo reducer, com uuid do banco', async () => {
    await passo({ tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 20000 })

    const linhas = await sql<{ id: string; caixa_inicial: number; aberta: boolean }>(
      'select * from sessao'
    )
    expect(linhas).toHaveLength(1)
    expect(linhas[0].caixa_inicial).toBe(20000)
    expect(linhas[0].aberta).toBe(true)
    // O id do reducer era "s1"; o que ficou no banco é uuid.
    expect(linhas[0].id).not.toBe('s1')
  })

  it('atualiza a movimentação que mudou de situação, sem duplicar', async () => {
    await passo({ tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 20000 })
    await passo({ tipo: 'abrir-turno', dealerId: DEALER_JOAO })
    const noite = await comConexao((c) => carregarNoite(c, CLUBE_TESTE))
    await passo({ tipo: 'lancar-rake', valor: 180, horaOcorrencia: noite.agora })

    const movs = await sql('select * from movimentacao')
    const cps = await sql<{ numero: number }>('select * from checkpoint')
    expect(movs).toHaveLength(1)
    expect(cps).toHaveLength(1)
    expect(cps[0].numero).toBe(1)
  })

  it('nunca apaga linha — N13', async () => {
    const depois = await passo({
      tipo: 'abrir-sessao',
      clube: 'Clube Paris',
      caixaInicial: 20000,
    })

    // "depois" sem a sessão: persistirDelta não pode interpretar como remoção.
    await comConexao((c) =>
      persistirDelta(c, CLUBE_TESTE, depois, { ...depois, sessao: null, sessoes: [] }, OPERADOR)
    )

    expect(await sql('select * from sessao')).toHaveLength(1)
  })
})
