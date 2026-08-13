/**
 * Prova dos defeitos de severidade média e baixa.
 * Roda com `npm run prova-medias`.
 */
import {
  caixaEsperado,
  checkpointsDaSessao,
  contingenciasDaSessao,
  paraMinutos,
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

function montarNoite(): Noite {
  let noite = noiteVazia
  for (const passo of roteiro) {
    noite = { ...noite, agora: paraMinutos(passo.emAs) }
    for (const acao of passo.acoes) noite = reducer(noite, resolver(noite, acao))
  }
  return { ...noite, aviso: null }
}

let falhas = 0
function checar(nome: string, ok: boolean, detalhe: string) {
  console.log(`${ok ? '  OK  ' : ' FALHA'}  ${nome}${ok ? '' : ` — ${detalhe}`}`)
  if (!ok) falhas++
}

console.log('\n── A17 · mesmo WhatsApp com nome diferente ──')
{
  const base = montarNoite()
  const semConfirmar = reducer(base, {
    tipo: 'cadastrar-jogador',
    nome: 'Rafinha',
    whatsapp: '(11) 98812-4470', // o número do Rafa
    limite: 2000,
    sentar: true,
  })
  checar(
    'sem confirmar que é outra pessoa, o cadastro para',
    semConfirmar.jogadores.length === base.jogadores.length &&
      semConfirmar.aviso?.includes('outra pessoa') === true,
    `aviso: ${semConfirmar.aviso}`
  )
  const confirmando = reducer(base, {
    tipo: 'cadastrar-jogador',
    nome: 'Rafinha',
    whatsapp: '(11) 98812-4470',
    limite: 2000,
    sentar: true,
    confirmouOutraPessoa: true,
  })
  checar(
    'confirmando, o cadastro passa (é o caso do pai e filho)',
    confirmando.jogadores.length === base.jogadores.length + 1,
    `${base.jogadores.length} -> ${confirmando.jogadores.length}`
  )
}

console.log('\n── N16 · teto de contingência é da sessão, não do jogador ──')
{
  const noite = montarNoite()
  const total = contingenciasDaSessao(noite)
  const doDede = noite.movimentacoes.filter(
    (m) => m.confirmacao === 'contingencia'
  ).length
  checar(
    'o contador da sessão soma todos os jogadores',
    total === doDede && total >= 1,
    `sessao=${total} soma=${doDede}`
  )
}

console.log('\n── N5/N7 · conta encerrada não recebe mais ficha ──')
{
  let n = montarNoite()
  const p = participacoesAbertas(n)[0]
  n = reducer(n, { tipo: 'devolver-e-encerrar', participacaoId: p.id, valor: 1000 })
  const caixaDepoisDeFechar = caixaEsperado(n)

  const comRetirada = reducer(n, {
    tipo: 'lancar-retirada',
    participacaoId: p.id,
    valor: 900,
  })
  checar(
    'retirada em conta encerrada é recusada',
    comRetirada.movimentacoes.length === n.movimentacoes.length &&
      comRetirada.aviso?.includes('já foi encerrada') === true,
    `aviso: ${comRetirada.aviso}`
  )

  const comSegundaDevolucao = reducer(n, {
    tipo: 'devolver-e-encerrar',
    participacaoId: p.id,
    valor: 500,
  })
  checar(
    'segunda devolução é recusada e o caixa não muda',
    caixaEsperado(comSegundaDevolucao) === caixaDepoisDeFechar,
    `${caixaDepoisDeFechar} -> ${caixaEsperado(comSegundaDevolucao)}`
  )
}

console.log('\n── N10 · motivo só de espaços não é justificativa ──')
{
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
  checar(
    'espaço em branco não libera acima do limite',
    comEspacos.movimentacoes.length === n.movimentacoes.length &&
      comEspacos.aviso?.includes('acima do limite') === true,
    `aviso: ${comEspacos.aviso}`
  )
}

console.log('\n── N3/N14 · rake em hora sem turno ──')
{
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
  checar(
    'rake numa hora sem turno é recusado, não carimbado no turno errado',
    checkpointsDaSessao(semTurno).length === 0 &&
      semTurno.aviso?.includes('Nenhum turno') === true,
    `aviso: ${semTurno.aviso}`
  )
  const comTurno = reducer(n, {
    tipo: 'lancar-rake',
    valor: 200,
    horaOcorrencia: paraMinutos('19h30'),
  })
  const cp = checkpointsDaSessao(comTurno)[0]
  checar(
    'com turno cobrindo a hora, o checkpoint lista o turno certo',
    cp.turnoIdsNaJanela.length > 0,
    `turnosNaJanela vazio na janela ${cp.janelaInicio}–${cp.janelaFim}`
  )
}

console.log('\n── A13 · conferência final não grava janela invertida ──')
{
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
  checar(
    'nenhuma janela nasce invertida, nem a do encerramento',
    cps.every((c) => c.janelaInicio <= c.janelaFim),
    cps.map((c) => `${c.janelaInicio}–${c.janelaFim}`).join(', ')
  )
  const final = cps[cps.length - 1]
  checar(
    'a conferência final pega o furo que apareceu depois do último rake',
    final.final === true && final.diferenca === 800,
    `final=${final.final} dif=${final.diferenca}`
  )
}

console.log(falhas === 0 ? '\nTudo passou.' : `\n${falhas} falha(s).`)
process.exit(falhas === 0 ? 0 : 1)
