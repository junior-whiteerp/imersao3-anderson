import { describe, it, expect, beforeEach } from 'vitest'
import { limparBanco, sql, uma, CLUBE_TESTE, DEALER_JOAO } from './banco'

/**
 * Os invariantes que o banco garante sozinho.
 *
 * O código de erro do Postgres vem no campo `code` da exceção: `23505` é
 * unicidade violada e `23514` é `check` violado. Conferir o código, e não o
 * texto, mantém o teste válido em qualquer idioma do servidor.
 */
async function codigoDoErro(fn: () => Promise<unknown>): Promise<string | null> {
  try {
    await fn()
    return null
  } catch (e) {
    return (e as { code?: string }).code ?? 'sem-codigo'
  }
}

const abrirSessao = () =>
  uma<{ id: string }>(
    `insert into sessao (clube_id, aberta_em, caixa_inicial) values ($1, now(), 20000)
     returning id`,
    [CLUBE_TESTE]
  )

const criarJogador = (nome: string, whatsapp: string) =>
  uma<{ id: string }>(
    `insert into jogador (clube_id, nome, whatsapp, limite, consentimento_em)
     values ($1, $2, $3, 3000, now()) returning id`,
    [CLUBE_TESTE, nome, whatsapp]
  )

describe('invariantes do banco', () => {
  beforeEach(limparBanco)

  it('N1 — recusa uma segunda sessão aberta no mesmo clube', async () => {
    await abrirSessao()
    expect(await codigoDoErro(abrirSessao)).toBe('23505')
  })

  it('N4 — recusa dois turnos abertos na mesma sessão', async () => {
    const s = await abrirSessao()
    await sql(
      `insert into turno (sessao_id, dealer_id, numero, inicio) values ($1, $2, 1, 1140)`,
      [s.id, DEALER_JOAO]
    )
    const codigo = await codigoDoErro(() =>
      sql(`insert into turno (sessao_id, dealer_id, numero, inicio) values ($1, $2, 2, 1200)`, [
        s.id,
        DEALER_JOAO,
      ])
    )
    expect(codigo).toBe('23505')
  })

  it('N15 — recusa jogador sem dígito no WhatsApp', async () => {
    expect(await codigoDoErro(() => criarJogador('Sem Zap', 'não informou'))).toBe('23514')
  })

  it('N16 — recusa contingência sem motivo escrito', async () => {
    const s = await abrirSessao()
    const t = await uma<{ id: string }>(
      `insert into turno (sessao_id, dealer_id, numero, inicio) values ($1, $2, 1, 1140)
       returning id`,
      [s.id, DEALER_JOAO]
    )

    const codigo = await codigoDoErro(() =>
      sql(
        `insert into movimentacao
           (sessao_id, turno_id, tipo, valor, hora_ocorrencia, hora_digitacao,
            situacao, confirmacao, motivo_contingencia)
         values ($1, $2, 'rake', 180, 1175, 1177, 'confirmada', 'contingencia', '   ')`,
        [s.id, t.id]
      )
    )
    expect(codigo).toBe('23514')
  })

  it('nenhuma janela de checkpoint nasce invertida', async () => {
    const s = await abrirSessao()
    const t = await uma<{ id: string }>(
      `insert into turno (sessao_id, dealer_id, numero, inicio) values ($1, $2, 1, 1140)
       returning id`,
      [s.id, DEALER_JOAO]
    )

    const codigo = await codigoDoErro(() =>
      sql(
        `insert into checkpoint
           (sessao_id, numero, hora, contado_em, caixa_esperado, caixa_contado, diferenca,
            veredito, janela_inicio, janela_fim, turno_id, rake_acumulado)
         values ($1, 1, 1175, 1175, 20000, 20000, 0, 'fechado', 1200, 1140, $2, 180)`,
        [s.id, t.id]
      )
    )
    expect(codigo).toBe('23514')
  })

  it('recusa duas participacoes abertas no mesmo lugar, e aceita depois de encerrar', async () => {
    const s = await abrirSessao()
    const j1 = await criarJogador('Um', '11999990001')
    const j2 = await criarJogador('Dois', '11999990002')

    const sentar = (jogadorId: string, entrouAs: number) =>
      sql(
        `insert into participacao (sessao_id, jogador_id, entrou_as, lugar)
         values ($1, $2, $3, 7)`,
        [s.id, jogadorId, entrouAs]
      )

    await sentar(j1.id, 1140)
    expect(await codigoDoErro(() => sentar(j2.id, 1150))).toBe('23505')

    // Encerrar a conta devolve a cadeira ao pool — sem apagar o numero (N13).
    await sql(
      `update participacao set encerrada = true, saiu_as = 1200
       where sessao_id = $1 and jogador_id = $2`,
      [s.id, j1.id]
    )

    expect(await codigoDoErro(() => sentar(j2.id, 1210))).toBeNull()

    // A cadeira liberada continua gravada na conta encerrada.
    const encerrada = await uma<{ lugar: number }>(
      'select lugar from participacao where jogador_id = $1',
      [j1.id]
    )
    expect(encerrada.lugar).toBe(7)
  })

  it('recusa lugar fora da mesa', async () => {
    const s = await abrirSessao()
    const j = await criarJogador('Onze', '11999990011')

    const codigo = await codigoDoErro(() =>
      sql(
        `insert into participacao (sessao_id, jogador_id, entrou_as, lugar)
         values ($1, $2, 1140, 11)`,
        [s.id, j.id]
      )
    )
    expect(codigo).toBe('23514')
  })
})
