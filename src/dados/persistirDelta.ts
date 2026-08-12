import type { SupabaseClient } from '@supabase/supabase-js'
import type { Noite } from '@/regras/modelo'

const CLUBE = '11111111-1111-1111-1111-111111111111'

/** Id de uuid vem do banco; qualquer outro foi o reducer que inventou agora. */
const ehDoBanco = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

/**
 * Grava a diferença entre duas noites.
 *
 * Insere o que nasceu, atualiza o que mudou, e **nunca apaga** (N13). A ordem
 * das inserções segue a dependência entre tabelas, e um mapa traduz o id
 * provisório do reducer para o uuid que o banco devolve — é o que permite uma
 * ação criar jogador e participação de uma vez.
 */
export async function persistirDelta(
  db: SupabaseClient,
  antes: Noite,
  depois: Noite,
  operadorId: string | null
): Promise<void> {
  const mapa = new Map<string, string>()
  const traduz = (id: string | undefined) => (id === undefined ? undefined : (mapa.get(id) ?? id))

  const erro = (e: { message: string } | null, o: string) => {
    if (e) throw new Error(`Não foi possível salvar ${o}: ${e.message}`)
  }

  // ── jogadores ───────────────────────────────────────────────────────────
  for (const j of depois.jogadores) {
    if (ehDoBanco(j.id)) continue
    const { data, error } = await db
      .from('jogador')
      .insert({
        clube_id: CLUBE,
        nome: j.nome,
        whatsapp: j.whatsapp,
        cpf: j.cpf ?? null,
        limite: j.limite,
        consentimento_em: new Date().toISOString(),
      })
      .select('id')
      .single()
    erro(error, 'o cadastro do jogador')
    mapa.set(j.id, data!.id)
  }

  // ── sessão ──────────────────────────────────────────────────────────────
  if (depois.sessao && !ehDoBanco(depois.sessao.id)) {
    const { data, error } = await db
      .from('sessao')
      .insert({
        clube_id: CLUBE,
        aberta_em: new Date().toISOString(),
        caixa_inicial: depois.sessao.caixaInicial,
        aberta: true,
      })
      .select('id')
      .single()
    erro(error, 'a abertura da sessão')
    mapa.set(depois.sessao.id, data!.id)
  } else if (depois.sessao && antes.sessao && depois.sessao.aberta !== antes.sessao.aberta) {
    const { error } = await db
      .from('sessao')
      .update({ aberta: depois.sessao.aberta, encerrada_em: new Date().toISOString() })
      .eq('id', depois.sessao.id)
    erro(error, 'o encerramento da sessão')
  }

  const sessaoId = traduz(depois.sessao?.id)

  // ── participações ───────────────────────────────────────────────────────
  for (const p of depois.participacoes) {
    const anterior = antes.participacoes.find((x) => x.id === p.id)
    if (!anterior) {
      const { data, error } = await db
        .from('participacao')
        .insert({
          sessao_id: traduz(p.sessaoId),
          jogador_id: traduz(p.jogadorId),
          entrou_as: p.entrouAs,
          saiu_as: p.saiuAs ?? null,
          encerrada: p.encerrada,
        })
        .select('id')
        .single()
      erro(error, 'a entrada do jogador na mesa')
      mapa.set(p.id, data!.id)
    } else if (anterior.encerrada !== p.encerrada || anterior.saiuAs !== p.saiuAs) {
      const { error } = await db
        .from('participacao')
        .update({ encerrada: p.encerrada, saiu_as: p.saiuAs ?? null })
        .eq('id', p.id)
      erro(error, 'a saída do jogador')
    }
  }

  // ── turnos ──────────────────────────────────────────────────────────────
  for (const t of depois.turnos) {
    const anterior = antes.turnos.find((x) => x.id === t.id)
    if (!anterior) {
      const { data, error } = await db
        .from('turno')
        .insert({
          sessao_id: traduz(t.sessaoId),
          dealer_id: traduz(t.dealerId),
          numero: t.numero,
          inicio: t.inicio,
          fim: t.fim ?? null,
        })
        .select('id')
        .single()
      erro(error, 'a abertura do turno')
      mapa.set(t.id, data!.id)
    } else if (anterior.fim !== t.fim) {
      const { error } = await db
        .from('turno')
        .update({ fim: t.fim ?? null })
        .eq('id', t.id)
      erro(error, 'o fechamento do turno')
    }
  }

  // ── movimentações ───────────────────────────────────────────────────────
  for (const m of depois.movimentacoes) {
    const anterior = antes.movimentacoes.find((x) => x.id === m.id)
    // O reducer guarda os dois motivos num campo só; o banco quer separados.
    const contingencia = m.confirmacao === 'contingencia'
    const partes = (m.motivo ?? '').split(' · ')
    const motivoLimite =
      contingencia && partes.length > 1 ? partes[0] : contingencia ? null : (m.motivo ?? null)
    const motivoContingencia = contingencia ? partes[partes.length - 1] : null

    if (!anterior) {
      const { data, error } = await db
        .from('movimentacao')
        .insert({
          sessao_id: traduz(m.sessaoId),
          participacao_id: traduz(m.participacaoId) ?? null,
          turno_id: traduz(m.turnoId),
          tipo: m.tipo,
          valor: m.valor,
          hora_ocorrencia: m.horaOcorrencia,
          hora_digitacao: m.horaDigitacao,
          hora_confirmacao: m.horaConfirmacao ?? null,
          situacao: m.situacao,
          confirmacao: m.confirmacao ?? null,
          motivo_limite: motivoLimite,
          motivo_contingencia: motivoContingencia,
          lancado_por: operadorId,
        })
        .select('id')
        .single()
      erro(error, 'o lançamento')
      mapa.set(m.id, data!.id)
    } else if (
      anterior.situacao !== m.situacao ||
      anterior.confirmacao !== m.confirmacao ||
      anterior.motivo !== m.motivo
    ) {
      const { error } = await db
        .from('movimentacao')
        .update({
          situacao: m.situacao,
          confirmacao: m.confirmacao ?? null,
          hora_confirmacao: m.horaConfirmacao ?? null,
          motivo_limite: motivoLimite,
          motivo_contingencia: motivoContingencia,
        })
        .eq('id', m.id)
      erro(error, 'a confirmação do lançamento')
    }
  }

  // ── checkpoints ─────────────────────────────────────────────────────────
  for (const c of depois.checkpoints) {
    if (antes.checkpoints.some((x) => x.id === c.id)) continue
    const { error } = await db.from('checkpoint').insert({
      sessao_id: traduz(c.sessaoId) ?? sessaoId,
      numero: c.numero,
      hora: c.hora,
      contado_em: c.contadoEm,
      caixa_esperado: c.caixaEsperado,
      caixa_contado: c.caixaContado,
      diferenca: c.diferenca,
      veredito: c.veredito,
      janela_inicio: c.janelaInicio,
      janela_fim: c.janelaFim,
      turno_id: traduz(c.turnoId),
      turno_ids_na_janela: c.turnoIdsNaJanela.map((i) => traduz(i)),
      rake_acumulado: c.rakeAcumulado,
      final: c.final ?? false,
    })
    erro(error, 'o checkpoint')
  }
}
