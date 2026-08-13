/**
 * Prova das correcoes: roda o reducer real e checa cada defeito que a revisao
 * confirmou. Nao usa mock nenhum — e o mesmo codigo que as telas usam.
 */
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
} from '@/simulacao/modelo'
import { reducer, type Acao } from '@/simulacao/reducer'
import { noiteVazia, roteiro } from '@/simulacao/roteiroInicial'

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

let falhas = 0
function checar(nome: string, condicao: boolean, detalhe: string) {
  console.log(`${condicao ? '  OK  ' : ' FALHA'}  ${nome}${condicao ? '' : ` — ${detalhe}`}`)
  if (!condicao) falhas++
}

// ── 1. Dois relogios: rake retroativo nao apaga o proprio veredito ─────────
{
  const noite = montarAte('21h12')
  const cps = checkpointsDaSessao(noite)
  const cp3 = cps[cps.length - 1]
  checar(
    'checkpoint 3 nasce com R$ 480 de divergencia',
    cp3.diferenca === 480,
    `deu ${cp3.diferenca}`
  )
  checar(
    'a faixa mostra o veredito em vez de voltar a neutro',
    estadoDaFaixa(noite) === 'revisar',
    `deu "${estadoDaFaixa(noite)}"`
  )
  checar(
    'a hora de contagem e separada da hora de saida do rake',
    cp3.hora === paraMinutos('21h08') && cp3.contadoEm === paraMinutos('21h12'),
    `hora=${formatarHora(cp3.hora)} contadoEm=${formatarHora(cp3.contadoEm)}`
  )
}

// ── 2. Janela nao anda para tras ──────────────────────────────────────────
{
  const noite = montarAte()
  const antes = checkpointsDaSessao(noite).length
  const depois = reducer(noite, {
    tipo: 'lancar-rake',
    valor: 100,
    horaOcorrencia: paraMinutos('20h30'), // anterior ao checkpoint das 21h40
  })
  checar(
    'rake anterior ao ultimo checkpoint e recusado',
    checkpointsDaSessao(depois).length === antes && depois.aviso !== null,
    `criou checkpoint ou nao avisou (aviso: ${depois.aviso})`
  )
}

// ── 3. Meia-noite nao joga o rake para o dia anterior ─────────────────────
{
  const agora = paraMinutos('19h00') + 6 * 60 + 30 // 01h30 do dia seguinte
  checar(
    'hora digitada apos a meia-noite fica no dia certo',
    paraMinutosPertoDe(agora, '01h30') === agora,
    `deu ${paraMinutosPertoDe(agora, '01h30')} para agora=${agora}`
  )
  checar(
    'hora um pouco anterior a meia-noite tambem',
    paraMinutosPertoDe(agora, '23h50') === paraMinutos('19h00') + 4 * 60 + 50,
    `deu ${paraMinutosPertoDe(agora, '23h50')}`
  )
}

// ── 4. Encerrar faz conferencia final e grava a divergencia ───────────────
{
  let noite = montarAte()
  noite = reducer(noite, { tipo: 'injetar-furo', valor: 600 })
  for (const p of participacoesAbertas(noite)) {
    noite = reducer(noite, { tipo: 'devolver-e-encerrar', participacaoId: p.id, valor: 0 })
  }
  const antes = checkpointsDaSessao(noite).length
  noite = reducer(noite, { tipo: 'encerrar-sessao' })
  const cps = checkpointsDaSessao(noite)
  const final = cps[cps.length - 1]
  checar(
    'o encerramento cria uma conferencia final',
    cps.length === antes + 1 && final.final === true,
    `checkpoints ${antes} -> ${cps.length}`
  )
  checar(
    'a divergencia de R$ 600 fica registrada, nao some',
    final.diferenca === 600,
    `deu ${final.diferenca}`
  )
}

// ── 5. Segunda sessao nao herda a noite anterior ──────────────────────────
{
  let noite = montarAte()
  for (const p of participacoesAbertas(noite)) {
    noite = reducer(noite, { tipo: 'devolver-e-encerrar', participacaoId: p.id, valor: 0 })
  }
  noite = reducer(noite, { tipo: 'encerrar-sessao' })
  const contingenciasAntes = contingenciasDaSessao(noite)
  noite = reducer(noite, { tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 20000 })

  checar(
    'a caixa da sessao nova comeca no valor informado',
    caixaEsperado(noite) === 20000,
    `deu ${caixaEsperado(noite)}`
  )
  checar(
    'a sessao nova nasce sem checkpoints',
    checkpointsDaSessao(noite).length === 0,
    `deu ${checkpointsDaSessao(noite).length}`
  )
  checar(
    'o teto de contingencia zera por sessao',
    contingenciasAntes === 1 && contingenciasDaSessao(noite) === 0,
    `antes=${contingenciasAntes} depois=${contingenciasDaSessao(noite)}`
  )
  checar(
    'a sessao anterior continua guardada (N13)',
    noite.sessoes.length === 2 && noite.checkpoints.length > 0,
    `sessoes=${noite.sessoes.length} checkpoints totais=${noite.checkpoints.length}`
  )
}

// ── 6. A noite semeada continua coerente ──────────────────────────────────
{
  const noite = montarAte()
  const esperado = caixaEsperado(noite)
  checar('a caixa nunca fica negativa', esperado > 0, `deu ${esperado}`)
  checar(
    'os 4 checkpoints da noite estao la',
    checkpointsDaSessao(noite).length === 4,
    `deu ${checkpointsDaSessao(noite).length}`
  )
}

console.log(falhas === 0 ? '\nTudo passou.' : `\n${falhas} falha(s).`)
process.exit(falhas === 0 ? 0 : 1)
