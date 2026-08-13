import { describe, it, expect, beforeEach } from 'vitest'
import { comConexao, limparBanco, uma, CLUBE_TESTE, DEALER_JOAO } from './banco'
import { carregarNoite } from '../servidor/dados/carregarNoite'

describe('carregarNoite', () => {
  beforeEach(limparBanco)

  it('devolve uma noite vazia quando não há sessão aberta', async () => {
    const noite = await comConexao((c) => carregarNoite(c, CLUBE_TESTE))
    expect(noite.sessao).toBeNull()
    expect(noite.movimentacoes).toEqual([])
    expect(noite.dealers.length).toBeGreaterThan(0) // dealers existem entre sessões
  })

  it('monta a noite com sessão, turno e movimentação, em minutos', async () => {
    const abriu = new Date('2026-08-12T19:00:00-03:00')
    const s = await uma<{ id: string }>(
      `insert into sessao (clube_id, aberta_em, caixa_inicial) values ($1, $2, $3) returning id`,
      [CLUBE_TESTE, abriu.toISOString(), 20000]
    )
    const t = await uma<{ id: string }>(
      `insert into turno (sessao_id, dealer_id, numero, inicio) values ($1, $2, 1, 1140)
       returning id`,
      [s.id, DEALER_JOAO]
    )
    await uma(
      `insert into movimentacao
         (sessao_id, turno_id, tipo, valor, hora_ocorrencia, hora_digitacao, situacao, confirmacao)
       values ($1, $2, 'rake', 180, 1175, 1177, 'confirmada', 'presencial') returning id`,
      [s.id, t.id]
    )

    const noite = await comConexao((c) =>
      carregarNoite(c, CLUBE_TESTE, new Date('2026-08-12T21:47:00-03:00'))
    )

    expect(noite.sessao?.caixaInicial).toBe(20000)
    expect(noite.sessao?.abertaEm).toBe(1140)
    expect(noite.agora).toBe(1307)
    expect(noite.turnos).toHaveLength(1)
    expect(noite.movimentacoes[0].valor).toBe(180)
    expect(noite.movimentacoes[0].horaOcorrencia).toBe(1175)
  })
})
