import { describe, it, expect, beforeEach } from 'vitest'
import { clienteDeTeste, limparBanco, CLUBE_TESTE, DEALER_JOAO } from './banco'
import { carregarNoite } from '@/dados/carregarNoite'

const db = clienteDeTeste()

describe('carregarNoite', () => {
  beforeEach(limparBanco)

  it('devolve uma noite vazia quando não há sessão aberta', async () => {
    const noite = await carregarNoite(db, CLUBE_TESTE)
    expect(noite.sessao).toBeNull()
    expect(noite.movimentacoes).toEqual([])
    expect(noite.dealers.length).toBeGreaterThan(0) // dealers existem entre sessões
  })

  it('monta a noite com sessão, turno e movimentação, em minutos', async () => {
    const abriu = new Date('2026-08-12T19:00:00-03:00')
    const { data: s } = await db
      .from('sessao')
      .insert({ clube_id: CLUBE_TESTE, aberta_em: abriu.toISOString(), caixa_inicial: 20000 })
      .select()
      .single()
    const { data: t } = await db
      .from('turno')
      .insert({ sessao_id: s!.id, dealer_id: DEALER_JOAO, numero: 1, inicio: 1140 })
      .select()
      .single()
    await db.from('movimentacao').insert({
      sessao_id: s!.id,
      turno_id: t!.id,
      tipo: 'rake',
      valor: 180,
      hora_ocorrencia: 1175,
      hora_digitacao: 1177,
      situacao: 'confirmada',
      confirmacao: 'presencial',
    })

    const noite = await carregarNoite(db, CLUBE_TESTE, new Date('2026-08-12T21:47:00-03:00'))

    expect(noite.sessao?.caixaInicial).toBe(20000)
    expect(noite.sessao?.abertaEm).toBe(1140)
    expect(noite.agora).toBe(1307)
    expect(noite.turnos).toHaveLength(1)
    expect(noite.movimentacoes[0].valor).toBe(180)
    expect(noite.movimentacoes[0].horaOcorrencia).toBe(1175)
  })
})
