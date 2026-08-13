import type { Noite } from '@/regras/modelo'
import type { Conexao } from '../banco'
import { agoraEmMinutos } from './relogio'
import type {
  LinhaCheckpoint,
  LinhaDealer,
  LinhaJogador,
  LinhaMovimentacao,
  LinhaParticipacao,
  LinhaSessao,
  LinhaTurno,
} from './tipos-banco'

/**
 * Monta o objeto `Noite` a partir das linhas do banco.
 *
 * O `Noite` é o que o `reducer` sabe ler, e ele é 100% derivado das linhas —
 * nunca guardado. Isso é o que garante que recarregar a página devolva
 * exatamente o mesmo estado, e que duas abas não divirjam por muito tempo.
 *
 * O `clube_id` no WHERE é redundante: quem chama já está numa transação com
 * RLS, e a política filtra pelo clube do operador. Ele fica porque defesa em
 * duas camadas custa nada aqui, e porque deixa a consulta legível sozinha.
 */
export async function carregarNoite(
  c: Conexao,
  clubeId: string,
  agora: Date = new Date()
): Promise<Noite> {
  // Uma consulta de cada vez, de propósito. Uma conexão do Postgres atende um
  // comando por vez: `Promise.all` aqui não paralelizaria nada — só enfileiraria
  // por baixo do pano, com aviso de depreciação, e quebraria no pg 9.
  const jogadores = await c.query<LinhaJogador>('select * from jogador where clube_id = $1', [
    clubeId,
  ])
  const dealers = await c.query<LinhaDealer>('select * from dealer where clube_id = $1', [clubeId])
  const sessoes = await c.query<LinhaSessao>(
    'select * from sessao where clube_id = $1 order by aberta_em',
    [clubeId]
  )

  const linhasSessao = sessoes.rows
  // A sessão corrente é a aberta; se não há, é a última encerrada (N13: ela fica).
  const corrente =
    linhasSessao.find((s) => s.aberta) ?? linhasSessao[linhasSessao.length - 1] ?? null

  const base = {
    jogadores: jogadores.rows.map((j) => ({
      id: j.id,
      nome: j.nome,
      whatsapp: j.whatsapp,
      cpf: j.cpf ?? undefined,
      limite: j.limite,
    })),
    dealers: dealers.rows.map((d) => ({ id: d.id, nome: d.nome })),
    sessoes: linhasSessao.map((s) => paraSessao(s)),
    aviso: null,
    // Os ids do banco são uuid; os que o reducer cria são "s1", "m2"...
    // Nunca colidem, então a contagem pode recomeçar do 1 a cada carga.
    seq: 1,
    furoOculto: 0,
  }

  if (!corrente) {
    return {
      ...base,
      agora: agoraEmMinutos(agora, agora),
      sessao: null,
      participacoes: [],
      turnos: [],
      movimentacoes: [],
      checkpoints: [],
    } as Noite
  }

  const abertaEm = new Date(corrente.aberta_em)
  const participacoes = await c.query<LinhaParticipacao>(
    'select * from participacao where sessao_id = $1 order by entrou_as',
    [corrente.id]
  )
  const turnos = await c.query<LinhaTurno>(
    'select * from turno where sessao_id = $1 order by numero',
    [corrente.id]
  )
  const movimentacoes = await c.query<LinhaMovimentacao>(
    'select * from movimentacao where sessao_id = $1 order by criada_em',
    [corrente.id]
  )
  const checkpoints = await c.query<LinhaCheckpoint>(
    'select * from checkpoint where sessao_id = $1 order by numero',
    [corrente.id]
  )

  return {
    ...base,
    agora: agoraEmMinutos(abertaEm, agora),
    sessao: paraSessao(corrente),
    participacoes: participacoes.rows.map((p) => ({
      id: p.id,
      sessaoId: p.sessao_id,
      jogadorId: p.jogador_id,
      entrouAs: p.entrou_as,
      saiuAs: p.saiu_as ?? undefined,
      encerrada: p.encerrada,
      lugar: p.lugar ?? undefined,
    })),
    turnos: turnos.rows.map((t) => ({
      id: t.id,
      sessaoId: t.sessao_id,
      numero: t.numero,
      dealerId: t.dealer_id,
      inicio: t.inicio,
      fim: t.fim ?? undefined,
    })),
    movimentacoes: movimentacoes.rows.map((m) => ({
      id: m.id,
      sessaoId: m.sessao_id,
      tipo: m.tipo,
      valor: m.valor,
      participacaoId: m.participacao_id ?? undefined,
      turnoId: m.turno_id,
      horaOcorrencia: m.hora_ocorrencia,
      horaDigitacao: m.hora_digitacao,
      horaConfirmacao: m.hora_confirmacao ?? undefined,
      situacao: m.situacao,
      confirmacao: m.confirmacao ?? undefined,
      // O `reducer` conhece um campo `motivo` só. O banco guarda dois (PRD v1.7
      // §9); aqui eles voltam juntos para o formato que a regra espera.
      motivo: [m.motivo_limite, m.motivo_contingencia].filter(Boolean).join(' · ') || undefined,
    })),
    checkpoints: checkpoints.rows.map((c) => ({
      id: c.id,
      sessaoId: c.sessao_id,
      numero: c.numero,
      hora: c.hora,
      contadoEm: c.contado_em,
      caixaEsperado: c.caixa_esperado,
      caixaContado: c.caixa_contado,
      diferenca: c.diferenca,
      veredito: c.veredito,
      janelaInicio: c.janela_inicio,
      janelaFim: c.janela_fim,
      turnoId: c.turno_id,
      turnoIdsNaJanela: c.turno_ids_na_janela ?? [],
      rakeAcumulado: c.rake_acumulado,
      final: c.final,
    })),
  } as Noite
}

function paraSessao(s: LinhaSessao) {
  const abertaEm = new Date(s.aberta_em)
  return {
    id: s.id,
    clube: 'Clube Paris',
    abertaEm: agoraEmMinutos(abertaEm, abertaEm),
    encerradaEm: s.encerrada_em ? agoraEmMinutos(abertaEm, new Date(s.encerrada_em)) : undefined,
    caixaInicial: s.caixa_inicial,
    aberta: s.aberta,
  }
}
