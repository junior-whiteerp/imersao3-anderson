/**
 * Prova dos defeitos de severidade média e baixa.
 *
 * Herdada de `product-plan/regras/provas/prova-medias.ts`, com a mesma
 * conversão: bloco vira `it()`, `checar` vira `expect`.
 */
import { describe, it, expect } from 'vitest'
import {
  caixaEsperado,
  checkpointsDaSessao,
  contingenciasDaSessao,
  paraMinutos,
  participacoesAbertas,
  type Noite,
} from '@/regras/modelo'
import { reducer, type Acao } from '@/regras/reducer'
import { noiteVazia, roteiro } from './roteiroInicial'

function resolver(noite: Noite, acao: Acao): Acao {
  if ('participacaoId' in acao && acao.participacaoId.startsWith('AUTO:')) {
    const jogadorId = acao.participacaoId.slice(5)
    const p = participacoesAbertas(noite).find((x) => x.jogadorId === jogadorId)
    return { ...acao, participacaoId: p?.id ?? acao.participacaoId }
  }
  if ('movimentacaoId' in acao && acao.movimentacaoId === 'ULTIMA') {
    const u = noite.movimentacoes[noite.movimentacoes.length - 1]
    return { ...acao, movimentacaoId: u?.id ?? acao.movimentacaoId }
  }
  return acao
}

function montarNoite(): Noite {
  let noite = noiteVazia
  for (const passo of roteiro) {
    noite = { ...noite, agora: paraMinutos(passo.emAs) }
    for (const acao of passo.acoes) noite = reducer(noite, resolver(noite, acao))
  }
  return { ...noite, aviso: null }
}

describe('A17 · mesmo WhatsApp com nome diferente', () => {
  it('para sem confirmação e passa com ela', () => {
    const base = montarNoite()
    const semConfirmar = reducer(base, {
      tipo: 'cadastrar-jogador',
      nome: 'Rafinha',
      whatsapp: '(11) 98812-4470', // o número do Rafa
      limite: 2000,
      sentar: true,
    })
    expect(
      semConfirmar.jogadores.length === base.jogadores.length &&
        semConfirmar.aviso?.includes('outra pessoa') === true,
      `aviso: ${semConfirmar.aviso}`
    ).toBe(true)
    const confirmando = reducer(base, {
      tipo: 'cadastrar-jogador',
      nome: 'Rafinha',
      whatsapp: '(11) 98812-4470',
      limite: 2000,
      sentar: true,
      confirmouOutraPessoa: true,
    })
    expect(
      confirmando.jogadores.length === base.jogadores.length + 1,
      `${base.jogadores.length} -> ${confirmando.jogadores.length}`
    ).toBe(true)
  })
})

describe('N16 · teto de contingência é da sessão, não do jogador', () => {
  it('o contador da sessão soma todos os jogadores', () => {
    const noite = montarNoite()
    const total = contingenciasDaSessao(noite)
    const doDede = noite.movimentacoes.filter((m) => m.confirmacao === 'contingencia').length
    expect(total === doDede && total >= 1, `sessao=${total} soma=${doDede}`).toBe(true)
  })
})

describe('N5/N7 · conta encerrada não recebe mais ficha', () => {
  it('recusa retirada e segunda devolução em conta encerrada', () => {
    let n = montarNoite()
    const p = participacoesAbertas(n)[0]
    n = reducer(n, { tipo: 'devolver-e-encerrar', participacaoId: p.id, valor: 1000 })
    const caixaDepoisDeFechar = caixaEsperado(n)

    const comRetirada = reducer(n, {
      tipo: 'lancar-retirada',
      participacaoId: p.id,
      valor: 900,
    })
    expect(
      comRetirada.movimentacoes.length === n.movimentacoes.length &&
        comRetirada.aviso?.includes('já foi encerrada') === true,
      `aviso: ${comRetirada.aviso}`
    ).toBe(true)

    const comSegundaDevolucao = reducer(n, {
      tipo: 'devolver-e-encerrar',
      participacaoId: p.id,
      valor: 500,
    })
    expect(
      caixaEsperado(comSegundaDevolucao) === caixaDepoisDeFechar,
      `${caixaDepoisDeFechar} -> ${caixaEsperado(comSegundaDevolucao)}`
    ).toBe(true)
  })
})

describe('N10 · motivo só de espaços não é justificativa', () => {
  it('espaço em branco não libera acima do limite', () => {
    const n = montarNoite()
    const bia = participacoesAbertas(n).find(
      (p) => n.jogadores.find((j) => j.id === p.jogadorId)?.nome === 'Bia'
    )!
    const comEspacos = reducer(n, {
      tipo: 'lancar-retirada',
      participacaoId: bia.id,
      valor: 500,
      motivo: '   ',
    })
    expect(
      comEspacos.movimentacoes.length === n.movimentacoes.length &&
        comEspacos.aviso?.includes('acima do limite') === true,
      `aviso: ${comEspacos.aviso}`
    ).toBe(true)
  })
})

describe('N3/N14 · rake em hora sem turno', () => {
  it('recusa a hora sem turno e carimba o turno certo quando ele existe', () => {
    let n: Noite = { ...noiteVazia, agora: paraMinutos('19h00') }
    n = reducer(n, { tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 20000 })
    // O turno só abre às 19h20: das 19h00 às 19h20 não há turno nenhum.
    n = { ...n, agora: paraMinutos('19h20') }
    n = reducer(n, { tipo: 'abrir-turno', dealerId: 'd-marcos' })
    n = { ...n, agora: paraMinutos('19h40') }
    const semTurno = reducer(n, {
      tipo: 'lancar-rake',
      valor: 200,
      horaOcorrencia: paraMinutos('19h10'),
    })
    expect(
      checkpointsDaSessao(semTurno).length === 0 &&
        semTurno.aviso?.includes('Nenhum turno') === true,
      `aviso: ${semTurno.aviso}`
    ).toBe(true)
    const comTurno = reducer(n, {
      tipo: 'lancar-rake',
      valor: 200,
      horaOcorrencia: paraMinutos('19h30'),
    })
    const cp = checkpointsDaSessao(comTurno)[0]
    expect(
      cp.turnoIdsNaJanela.length > 0,
      `turnosNaJanela vazio na janela ${cp.janelaInicio}–${cp.janelaFim}`
    ).toBe(true)
  })
})

describe('A13 · conferência final não grava janela invertida', () => {
  it('nenhuma janela invertida e o furo tardio fica registrado', () => {
    let n: Noite = { ...noiteVazia, agora: paraMinutos('19h00') }
    n = reducer(n, { tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 20000 })
    n = reducer(n, { tipo: 'abrir-turno', dealerId: 'd-joao' })
    n = { ...n, agora: paraMinutos('19h30') }
    // A hora futura agora é recusada, então nenhum checkpoint fica adiante do relógio.
    n = reducer(n, { tipo: 'lancar-rake', valor: 200, horaOcorrencia: paraMinutos('21h30') })
    n = reducer(n, { tipo: 'lancar-rake', valor: 200, horaOcorrencia: paraMinutos('19h30') })
    n = reducer(n, { tipo: 'injetar-furo', valor: 800 })
    n = { ...n, agora: paraMinutos('20h00') }
    n = reducer(n, { tipo: 'encerrar-sessao' })
    const cps = checkpointsDaSessao(n)
    expect(
      cps.every((c) => c.janelaInicio <= c.janelaFim),
      cps.map((c) => `${c.janelaInicio}–${c.janelaFim}`).join(', ')
    ).toBe(true)
    const final = cps[cps.length - 1]
    expect(
      final.final === true && final.diferenca === 800,
      `final=${final.final} dif=${final.diferenca}`
    ).toBe(true)
  })
})
