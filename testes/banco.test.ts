import { describe, it, expect, beforeEach } from 'vitest'
import { clienteDeTeste, limparBanco, CLUBE_TESTE, DEALER_JOAO } from './banco'

const db = clienteDeTeste()

describe('invariantes do banco', () => {
  beforeEach(limparBanco)

  it('N1 — recusa uma segunda sessão aberta no mesmo clube', async () => {
    const primeira = await db
      .from('sessao')
      .insert({ clube_id: CLUBE_TESTE, aberta_em: new Date().toISOString(), caixa_inicial: 20000 })
    expect(primeira.error).toBeNull()

    const segunda = await db
      .from('sessao')
      .insert({ clube_id: CLUBE_TESTE, aberta_em: new Date().toISOString(), caixa_inicial: 5000 })
    expect(segunda.error?.code).toBe('23505')
  })

  it('N4 — recusa dois turnos abertos na mesma sessão', async () => {
    const { data: s } = await db
      .from('sessao')
      .insert({ clube_id: CLUBE_TESTE, aberta_em: new Date().toISOString(), caixa_inicial: 20000 })
      .select()
      .single()

    await db.from('turno').insert({ sessao_id: s!.id, dealer_id: DEALER_JOAO, numero: 1, inicio: 1140 })
    const segundo = await db
      .from('turno')
      .insert({ sessao_id: s!.id, dealer_id: DEALER_JOAO, numero: 2, inicio: 1200 })
    expect(segundo.error?.code).toBe('23505')
  })

  it('N15 — recusa jogador sem dígito no WhatsApp', async () => {
    const r = await db.from('jogador').insert({
      clube_id: CLUBE_TESTE,
      nome: 'Sem Zap',
      whatsapp: 'não informou',
      limite: 3000,
      consentimento_em: new Date().toISOString(),
    })
    expect(r.error?.code).toBe('23514')
  })

  it('N16 — recusa contingência sem motivo escrito', async () => {
    const { data: s } = await db
      .from('sessao')
      .insert({ clube_id: CLUBE_TESTE, aberta_em: new Date().toISOString(), caixa_inicial: 20000 })
      .select()
      .single()
    const { data: t } = await db
      .from('turno')
      .insert({ sessao_id: s!.id, dealer_id: DEALER_JOAO, numero: 1, inicio: 1140 })
      .select()
      .single()

    const r = await db.from('movimentacao').insert({
      sessao_id: s!.id,
      turno_id: t!.id,
      tipo: 'rake',
      valor: 180,
      hora_ocorrencia: 1175,
      hora_digitacao: 1177,
      situacao: 'confirmada',
      confirmacao: 'contingencia',
      motivo_contingencia: '   ',
    })
    expect(r.error?.code).toBe('23514')
  })

  it('nenhuma janela de checkpoint nasce invertida', async () => {
    const { data: s } = await db
      .from('sessao')
      .insert({ clube_id: CLUBE_TESTE, aberta_em: new Date().toISOString(), caixa_inicial: 20000 })
      .select()
      .single()
    const { data: t } = await db
      .from('turno')
      .insert({ sessao_id: s!.id, dealer_id: DEALER_JOAO, numero: 1, inicio: 1140 })
      .select()
      .single()

    const r = await db.from('checkpoint').insert({
      sessao_id: s!.id,
      numero: 1,
      hora: 1175,
      contado_em: 1175,
      caixa_esperado: 20000,
      caixa_contado: 20000,
      diferenca: 0,
      veredito: 'fechado',
      janela_inicio: 1200,
      janela_fim: 1140,
      turno_id: t!.id,
      rake_acumulado: 180,
    })
    expect(r.error?.code).toBe('23514')
  })
})
