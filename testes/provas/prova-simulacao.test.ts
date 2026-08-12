/**
 * Prova das correcoes: roda o reducer real e checa cada defeito que a revisao
 * confirmou. Nao usa mock nenhum — e o mesmo codigo que as telas usam.
 *
 * Herdada de `product-plan/regras/provas/prova-simulacao.ts`, com a mesma
 * conversão: bloco vira `it()`, `checar` vira `expect`.
 */
import { describe, it, expect } from 'vitest'
import {
  caixaEsperado,
  checkpointsDaSessao,
  contingenciasDaSessao,
  estadoDaFaixa,
  formatarHora,
  paraMinutos,
  paraMinutosPertoDe,
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

/** Roda o roteiro ate um horario e devolve o estado ali. */
function montarAte(limite?: string): Noite {
  let noite = noiteVazia
  for (const passo of roteiro) {
    if (limite && paraMinutos(passo.emAs) > paraMinutos(limite)) break
    noite = { ...noite, agora: paraMinutos(passo.emAs) }
    for (const acao of passo.acoes) noite = reducer(noite, resolver(noite, acao))
  }
  return noite
}

describe('1. Dois relogios: rake retroativo nao apaga o proprio veredito', () => {
  it('o checkpoint 3 guarda divergência, veredito e as duas horas', () => {
    const noite = montarAte('21h12')
    const cps = checkpointsDaSessao(noite)
    const cp3 = cps[cps.length - 1]
    expect(cp3.diferenca === 480, `deu ${cp3.diferenca}`).toBe(true)
    expect(estadoDaFaixa(noite) === 'revisar', `deu "${estadoDaFaixa(noite)}"`).toBe(true)
    expect(
      cp3.hora === paraMinutos('21h08') && cp3.contadoEm === paraMinutos('21h12'),
      `hora=${formatarHora(cp3.hora)} contadoEm=${formatarHora(cp3.contadoEm)}`
    ).toBe(true)
  })
})

describe('2. Janela nao anda para tras', () => {
  it('rake anterior ao ultimo checkpoint e recusado', () => {
    const noite = montarAte()
    const antes = checkpointsDaSessao(noite).length
    const depois = reducer(noite, {
      tipo: 'lancar-rake',
      valor: 100,
      horaOcorrencia: paraMinutos('20h30'), // anterior ao checkpoint das 21h40
    })
    expect(
      checkpointsDaSessao(depois).length === antes && depois.aviso !== null,
      `criou checkpoint ou nao avisou (aviso: ${depois.aviso})`
    ).toBe(true)
  })
})

describe('3. Meia-noite nao joga o rake para o dia anterior', () => {
  it('a hora digitada depois da meia-noite fica no dia certo', () => {
    const agora = paraMinutos('19h00') + 6 * 60 + 30 // 01h30 do dia seguinte
    expect(
      paraMinutosPertoDe(agora, '01h30') === agora,
      `deu ${paraMinutosPertoDe(agora, '01h30')} para agora=${agora}`
    ).toBe(true)
    expect(
      paraMinutosPertoDe(agora, '23h50') === paraMinutos('19h00') + 4 * 60 + 50,
      `deu ${paraMinutosPertoDe(agora, '23h50')}`
    ).toBe(true)
  })
})

describe('4. Encerrar faz conferencia final e grava a divergencia', () => {
  it('a conferência final nasce e guarda os R$ 600', () => {
    let noite = montarAte()
    noite = reducer(noite, { tipo: 'injetar-furo', valor: 600 })
    for (const p of participacoesAbertas(noite)) {
      noite = reducer(noite, { tipo: 'devolver-e-encerrar', participacaoId: p.id, valor: 0 })
    }
    const antes = checkpointsDaSessao(noite).length
    noite = reducer(noite, { tipo: 'encerrar-sessao' })
    const cps = checkpointsDaSessao(noite)
    const final = cps[cps.length - 1]
    expect(
      cps.length === antes + 1 && final.final === true,
      `checkpoints ${antes} -> ${cps.length}`
    ).toBe(true)
    expect(final.diferenca === 600, `deu ${final.diferenca}`).toBe(true)
  })
})

describe('5. Segunda sessao nao herda a noite anterior', () => {
  it('caixa, checkpoints e teto de contingência recomeçam; a anterior fica', () => {
    let noite = montarAte()
    for (const p of participacoesAbertas(noite)) {
      noite = reducer(noite, { tipo: 'devolver-e-encerrar', participacaoId: p.id, valor: 0 })
    }
    noite = reducer(noite, { tipo: 'encerrar-sessao' })
    const contingenciasAntes = contingenciasDaSessao(noite)
    noite = reducer(noite, { tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 20000 })

    expect(caixaEsperado(noite) === 20000, `deu ${caixaEsperado(noite)}`).toBe(true)
    expect(
      checkpointsDaSessao(noite).length === 0,
      `deu ${checkpointsDaSessao(noite).length}`
    ).toBe(true)
    expect(
      contingenciasAntes === 1 && contingenciasDaSessao(noite) === 0,
      `antes=${contingenciasAntes} depois=${contingenciasDaSessao(noite)}`
    ).toBe(true)
    expect(
      noite.sessoes.length === 2 && noite.checkpoints.length > 0,
      `sessoes=${noite.sessoes.length} checkpoints totais=${noite.checkpoints.length}`
    ).toBe(true)
  })
})

describe('6. A noite semeada continua coerente', () => {
  it('caixa positiva e os 4 checkpoints da noite', () => {
    const noite = montarAte()
    const esperado = caixaEsperado(noite)
    expect(esperado > 0, `deu ${esperado}`).toBe(true)
    expect(
      checkpointsDaSessao(noite).length === 4,
      `deu ${checkpointsDaSessao(noite).length}`
    ).toBe(true)
  })
})
