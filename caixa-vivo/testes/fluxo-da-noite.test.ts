import { describe, it, expect, beforeEach } from 'vitest'
import {
  comConexao,
  limparBanco,
  uma,
  CLUBE_TESTE,
  DEALER_JOAO,
  DEALER_MARCOS,
  OPERADOR_TESTE,
} from './banco'
import { aplicar } from '../servidor/dados/aplicar'
import { carregarNoite } from '../servidor/dados/carregarNoite'
import { emMao, participacoesAbertas } from '@/regras/modelo'

const acao = (a: unknown) => aplicar(CLUBE_TESTE, OPERADOR_TESTE, a as never)
const noiteGravada = () => comConexao((c) => carregarNoite(c, CLUBE_TESTE))

describe('a noite do PRD, de ponta a ponta e persistida', () => {
  beforeEach(limparBanco)

  it('abre, senta, lança, confirma, troca dealer, lança rake e congela o veredito', async () => {
    // ── Vazio ────────────────────────────────────────────────────────────
    let noite = await noiteGravada()
    expect(noite.sessao).toBeNull()

    // ── Abertura ─────────────────────────────────────────────────────────
    noite = await acao({ tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 20000 })
    noite = await acao({ tipo: 'abrir-turno', dealerId: DEALER_JOAO })
    expect(noite.sessao!.caixaInicial).toBe(20000)
    expect(noite.turnos).toHaveLength(1)

    // ── Cadastro e mesa (F10, F2) ────────────────────────────────────────
    noite = await acao({
      tipo: 'cadastrar-jogador',
      nome: 'Rafa',
      whatsapp: '(11) 98812-4470',
      limite: 3000,
      sentar: true,
    })
    expect(participacoesAbertas(noite)).toHaveLength(1)
    const participacaoId = participacoesAbertas(noite)[0].id

    // ── Ficha com a tela girada (F3, N2) ─────────────────────────────────
    noite = await acao({ tipo: 'lancar-retirada', participacaoId, valor: 1000 })
    const pendente = noite.movimentacoes.find((m) => m.situacao === 'aguardando')!
    expect(emMao(noite, participacaoId)).toBe(0) // ficha não saiu ainda

    noite = await acao({
      tipo: 'confirmar',
      movimentacaoId: pendente.id,
      confirmacao: 'presencial',
    })
    expect(emMao(noite, participacaoId)).toBe(1000) // agora saiu

    // ── Contingência (F11, N16) ──────────────────────────────────────────
    noite = await acao({ tipo: 'lancar-retirada', participacaoId, valor: 500 })
    const segunda = noite.movimentacoes.find((m) => m.situacao === 'aguardando')!
    noite = await acao({
      tipo: 'confirmar',
      movimentacaoId: segunda.id,
      confirmacao: 'contingencia',
      motivo: 'Jogador atendeu o telefone.',
    })
    const comContingencia = noite.movimentacoes.find((m) => m.id === segunda.id)!
    expect(comContingencia.confirmacao).toBe('contingencia')

    // ── Troca de dealer (F5, N4) ─────────────────────────────────────────
    noite = await acao({ tipo: 'trocar-dealer', dealerId: DEALER_MARCOS })
    expect(noite.turnos.filter((t) => t.fim === undefined)).toHaveLength(1)

    // ── Rake e checkpoint (F6, F7 — o coração) ───────────────────────────
    noite = await acao({ tipo: 'lancar-rake', valor: 180, horaOcorrencia: noite.agora })
    expect(noite.checkpoints).toHaveLength(1)
    expect(noite.checkpoints[0].veredito).toBe('fechado')

    // ── Persistência real: recarregar devolve o mesmo ─────────────────────
    const recarregada = await noiteGravada()
    expect(recarregada.sessao!.id).toBe(noite.sessao!.id)
    expect(recarregada.movimentacoes).toHaveLength(3) // 2 retiradas + 1 rake
    expect(recarregada.checkpoints).toHaveLength(1)
    expect(emMao(recarregada, participacaoId)).toBe(1500)

    // ── Os dois motivos, em campos separados (PRD v1.7 §9) ───────────────
    const linha = await uma<{ motivo_contingencia: string | null; motivo_limite: string | null }>(
      'select motivo_contingencia, motivo_limite from movimentacao where id = $1',
      [segunda.id]
    )
    expect(linha.motivo_contingencia).toBe('Jogador atendeu o telefone.')
    expect(linha.motivo_limite).toBeNull()

    // ── Quem lançou fica registrado (PRD §9) ─────────────────────────────
    const autoria = await uma<{ lancado_por: string | null }>(
      'select lancado_por from movimentacao where id = $1',
      [segunda.id]
    )
    expect(autoria.lancado_por).toBe(OPERADOR_TESTE)
  })

  it('erro de banco aparece, não vira silêncio', async () => {
    await expect(
      aplicar('00000000-0000-0000-0000-0000000000ff', OPERADOR_TESTE, {
        tipo: 'abrir-sessao',
        clube: 'X',
        caixaInicial: 1000,
      } as never)
    ).rejects.toThrow()
  })
})
