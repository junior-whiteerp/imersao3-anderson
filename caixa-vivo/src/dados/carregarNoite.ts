import type { SupabaseClient } from '@supabase/supabase-js'
import type { Noite } from '@/regras/modelo'
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
 */
export async function carregarNoite(
  db: SupabaseClient,
  clubeId: string,
  agora: Date = new Date()
): Promise<Noite> {
  const [jogadores, dealers, sessoes] = await Promise.all([
    db.from('jogador').select('*').eq('clube_id', clubeId),
    db.from('dealer').select('*').eq('clube_id', clubeId),
    db.from('sessao').select('*').eq('clube_id', clubeId).order('aberta_em'),
  ])

  for (const r of [jogadores, dealers, sessoes]) {
    if (r.error) throw new Error(`Falhou ao ler o caixa: ${r.error.message}`)
  }

  const linhasSessao = (sessoes.data ?? []) as LinhaSessao[]
  // A sessão corrente é a aberta; se não há, é a última encerrada (N13: ela fica).
  const corrente =
    linhasSessao.find((s) => s.aberta) ?? linhasSessao[linhasSessao.length - 1] ?? null

  const base = {
    jogadores: ((jogadores.data ?? []) as LinhaJogador[]).map((j) => ({
      id: j.id,
      nome: j.nome,
      whatsapp: j.whatsapp,
      cpf: j.cpf ?? undefined,
      limite: j.limite,
    })),
    dealers: ((dealers.data ?? []) as LinhaDealer[]).map((d) => ({ id: d.id, nome: d.nome })),
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
  const [participacoes, turnos, movimentacoes, checkpoints] = await Promise.all([
    db.from('participacao').select('*').eq('sessao_id', corrente.id).order('entrou_as'),
    db.from('turno').select('*').eq('sessao_id', corrente.id).order('numero'),
    db.from('movimentacao').select('*').eq('sessao_id', corrente.id).order('criada_em'),
    db.from('checkpoint').select('*').eq('sessao_id', corrente.id).order('numero'),
  ])

  for (const r of [participacoes, turnos, movimentacoes, checkpoints]) {
    if (r.error) throw new Error(`Falhou ao ler o caixa: ${r.error.message}`)
  }

  return {
    ...base,
    agora: agoraEmMinutos(abertaEm, agora),
    sessao: paraSessao(corrente),
    participacoes: ((participacoes.data ?? []) as LinhaParticipacao[]).map((p) => ({
      id: p.id,
      sessaoId: p.sessao_id,
      jogadorId: p.jogador_id,
      entrouAs: p.entrou_as,
      saiuAs: p.saiu_as ?? undefined,
      encerrada: p.encerrada,
      lugar: p.lugar ?? undefined,
    })),
    turnos: ((turnos.data ?? []) as LinhaTurno[]).map((t) => ({
      id: t.id,
      sessaoId: t.sessao_id,
      numero: t.numero,
      dealerId: t.dealer_id,
      inicio: t.inicio,
      fim: t.fim ?? undefined,
    })),
    movimentacoes: ((movimentacoes.data ?? []) as LinhaMovimentacao[]).map((m) => ({
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
    checkpoints: ((checkpoints.data ?? []) as LinhaCheckpoint[]).map((c) => ({
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
