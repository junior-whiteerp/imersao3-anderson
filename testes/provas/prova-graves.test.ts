/**
 * Prova dos 3 defeitos graves que os testes acharam.
 *
 * Cada bloco reproduz o caminho relatado e checa que ele agora se comporta.
 *
 * Herdada de `product-plan/regras/provas/prova-graves.ts`. A lógica é a mesma,
 * asserção por asserção: o que mudou foi a casca — cada bloco `── TÍTULO ──`
 * virou um `it()`, e `checar(nome, ok, detalhe)` virou `expect(ok, detalhe)`.
 */
import { describe, it, expect } from 'vitest'
import {
  caixaEsperado,
  checkpointsDaSessao,
  estadoDaFaixa,
  formatarHora,
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

describe('GRAVE 1 · hora do rake adiante travava a noite inteira', () => {
  it('recusa o rake adiante e segue abrindo checkpoints', () => {
    // Noite curta, do zero, como no relato.
    let n: Noite = { ...noiteVazia, agora: paraMinutos('19h00') }
    n = reducer(n, { tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 20000 })
    n = reducer(n, { tipo: 'abrir-turno', dealerId: 'd-joao' })
    n = reducer(n, { tipo: 'sentar', jogadorId: 'j-paulo' })
    const p = participacoesAbertas(n)[0]
    n = reducer(n, { tipo: 'lancar-retirada', participacaoId: p.id, valor: 3000 })
    n = reducer(n, {
      tipo: 'confirmar',
      movimentacaoId: n.movimentacoes[n.movimentacoes.length - 1].id,
      confirmacao: 'presencial',
    })

    // O dedo errado: 21h30 no lugar de 19h30.
    n = { ...n, agora: paraMinutos('19h30') }
    const comFuturo = reducer(n, {
      tipo: 'lancar-rake',
      valor: 200,
      horaOcorrencia: paraMinutos('21h30'),
    })
    expect(
      checkpointsDaSessao(comFuturo).length === 0 && comFuturo.aviso !== null,
      `criou ${checkpointsDaSessao(comFuturo).length} checkpoint(s); aviso: ${comFuturo.aviso}`
    ).toBe(true)

    // A noite segue funcionando: nada travou.
    n = reducer(n, { tipo: 'lancar-rake', valor: 200, horaOcorrencia: paraMinutos('19h30') })
    n = reducer(n, { tipo: 'injetar-furo', valor: 800 })
    n = { ...n, agora: paraMinutos('20h00') }
    n = reducer(n, { tipo: 'lancar-rake', valor: 250, horaOcorrencia: paraMinutos('20h00') })
    const cps = checkpointsDaSessao(n)
    const ultimo = cps[cps.length - 1]
    expect(cps.length === 2, `deu ${cps.length}`).toBe(true)
    expect(
      ultimo.diferenca === 800 &&
        formatarHora(ultimo.janelaInicio) === '19h30' &&
        formatarHora(ultimo.janelaFim) === '20h00',
      `dif=${ultimo.diferenca} janela=${formatarHora(ultimo.janelaInicio)}–${formatarHora(ultimo.janelaFim)}`
    ).toBe(true)
  })
})

describe('GRAVE 1b · janela invertida no primeiro checkpoint', () => {
  it('recusa rake anterior à abertura e nunca inverte a janela', () => {
    let n: Noite = { ...noiteVazia, agora: paraMinutos('19h00') }
    n = reducer(n, { tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 20000 })
    n = reducer(n, { tipo: 'abrir-turno', dealerId: 'd-joao' })
    n = { ...n, agora: paraMinutos('19h25') }
    const antes = reducer(n, {
      tipo: 'lancar-rake',
      valor: 180,
      horaOcorrencia: paraMinutos('18h50'),
    })
    expect(
      checkpointsDaSessao(antes).length === 0 && antes.aviso !== null,
      `aviso: ${antes.aviso}`
    ).toBe(true)
    const todos = checkpointsDaSessao(
      reducer(n, { tipo: 'lancar-rake', valor: 180, horaOcorrencia: paraMinutos('19h20') })
    )
    expect(
      todos.every((c) => c.janelaInicio <= c.janelaFim),
      'alguma janela tem inicio depois do fim'
    ).toBe(true)
  })
})

describe('GRAVE 2 · veredito congelado x pendente confirmado depois', () => {
  it('a ficha confirmada depois da contagem quebra o congelamento', () => {
    let n = montarNoite()
    // O roteiro deixa a retirada de R$ 300 do Dede aguardando desde 21h45.
    const pendente = n.movimentacoes.find((m) => m.situacao === 'aguardando')!
    n = { ...n, agora: paraMinutos('21h50') }
    n = reducer(n, { tipo: 'lancar-rake', valor: 150, horaOcorrencia: paraMinutos('21h50') })
    const caixaNoCheckpoint = caixaEsperado(n)
    expect(estadoDaFaixa(n) === 'fechado', `deu "${estadoDaFaixa(n)}"`).toBe(true)

    // O jogador confirma cinco minutos DEPOIS da contagem.
    n = { ...n, agora: paraMinutos('21h55') }
    n = reducer(n, {
      tipo: 'confirmar',
      movimentacaoId: pendente.id,
      confirmacao: 'presencial',
    })
    expect(
      estadoDaFaixa(n) === 'neutro',
      `deu "${estadoDaFaixa(n)}" com caixa de ${caixaNoCheckpoint} para ${caixaEsperado(n)}`
    ).toBe(true)
    expect(
      caixaEsperado(n) === caixaNoCheckpoint - 300,
      `${caixaNoCheckpoint} -> ${caixaEsperado(n)}`
    ).toBe(true)
  })
})

describe('GRAVE 3 · segundo lancamento aguardando (N6/A9)', () => {
  it('dois pendentes convivem, mas o que estoura o limite avisa', () => {
    let n = montarNoite()
    const nando = participacoesAbertas(n).find(
      (p) => n.jogadores.find((j) => j.id === p.jogadorId)?.nome === 'Nando'
    )!
    // Nando: R$ 1.200 em mao, limite R$ 3.000.
    n = reducer(n, { tipo: 'lancar-retirada', participacaoId: nando.id, valor: 1000 })
    const umPendente = n.movimentacoes.filter(
      (m) => m.participacaoId === nando.id && m.situacao === 'aguardando'
    ).length
    expect(umPendente === 1, `deu ${umPendente}`).toBe(true)

    // O segundo, que somado estoura o limite, tem de avisar (A9).
    const comSegundo = reducer(n, {
      tipo: 'lancar-retirada',
      participacaoId: nando.id,
      valor: 900,
    })
    expect(
      comSegundo.aviso?.includes('acima do limite') === true &&
        comSegundo.movimentacoes.length === n.movimentacoes.length,
      `aviso: ${comSegundo.aviso}`
    ).toBe(true)

    // Um segundo que cabe no limite passa e vira dois pendentes.
    const cabendo = reducer(n, {
      tipo: 'lancar-retirada',
      participacaoId: nando.id,
      valor: 700,
    })
    const doisPendentes = cabendo.movimentacoes.filter(
      (m) => m.participacaoId === nando.id && m.situacao === 'aguardando'
    )
    expect(doisPendentes.length === 2, `deu ${doisPendentes.length}`).toBe(true)
    expect(doisPendentes[0].valor === 1000, `o primeiro e ${doisPendentes[0].valor}`).toBe(true)
  })
})

describe('Bonus · motivo do limite nao e apagado pelo da contingencia', () => {
  it('os dois motivos sobrevivem juntos', () => {
    let n = montarNoite()
    const bia = participacoesAbertas(n).find(
      (p) => n.jogadores.find((j) => j.id === p.jogadorId)?.nome === 'Bia'
    )!
    n = reducer(n, {
      tipo: 'lancar-retirada',
      participacaoId: bia.id,
      valor: 500,
      motivo: 'Dono liberou, jogador de casa.',
    })
    const mov = n.movimentacoes[n.movimentacoes.length - 1]
    n = reducer(n, {
      tipo: 'confirmar',
      movimentacaoId: mov.id,
      confirmacao: 'contingencia',
      motivo: 'Nao olhou a tela.',
    })
    const final = n.movimentacoes.find((m) => m.id === mov.id)!
    expect(
      final.motivo?.includes('Dono liberou') === true &&
        final.motivo?.includes('Nao olhou') === true,
      `motivo final: ${final.motivo}`
    ).toBe(true)
  })
})
