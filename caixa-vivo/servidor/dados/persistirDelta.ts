import type { Noite } from '@/regras/modelo'
import type { Conexao } from '../banco'

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
 *
 * O `clubeId` chega por parâmetro. Antes era constante fixa no código do
 * cliente — o clube de demonstração, em produção.
 */
export async function persistirDelta(
  c: Conexao,
  clubeId: string,
  antes: Noite,
  depois: Noite,
  operadorId: string | null
): Promise<void> {
  const mapa = new Map<string, string>()
  const traduz = (id: string | undefined) => (id === undefined ? undefined : (mapa.get(id) ?? id))

  /** Erro do Postgres vira frase que o operador entende, sem perder a causa. */
  const tentar = async <T>(o: string, fn: () => Promise<T>): Promise<T> => {
    try {
      return await fn()
    } catch (e) {
      throw new Error(`Não foi possível salvar ${o}: ${e instanceof Error ? e.message : e}`)
    }
  }

  // ── jogadores ───────────────────────────────────────────────────────────
  for (const j of depois.jogadores) {
    if (ehDoBanco(j.id)) continue
    const r = await tentar('o cadastro do jogador', () =>
      c.query<{ id: string }>(
        `insert into jogador (clube_id, nome, whatsapp, cpf, limite, consentimento_em)
         values ($1, $2, $3, $4, $5, now()) returning id`,
        [clubeId, j.nome, j.whatsapp, j.cpf ?? null, j.limite]
      )
    )
    mapa.set(j.id, r.rows[0].id)
  }

  // ── sessão ──────────────────────────────────────────────────────────────
  if (depois.sessao && !ehDoBanco(depois.sessao.id)) {
    const r = await tentar('a abertura da sessão', () =>
      c.query<{ id: string }>(
        `insert into sessao (clube_id, aberta_em, caixa_inicial, aberta)
         values ($1, now(), $2, true) returning id`,
        [clubeId, depois.sessao!.caixaInicial]
      )
    )
    mapa.set(depois.sessao.id, r.rows[0].id)
  } else if (depois.sessao && antes.sessao && depois.sessao.aberta !== antes.sessao.aberta) {
    await tentar('o encerramento da sessão', () =>
      c.query('update sessao set aberta = $1, encerrada_em = now() where id = $2', [
        depois.sessao!.aberta,
        depois.sessao!.id,
      ])
    )
  }

  const sessaoId = traduz(depois.sessao?.id)

  // ── participações ───────────────────────────────────────────────────────
  for (const p of depois.participacoes) {
    const anterior = antes.participacoes.find((x) => x.id === p.id)
    if (!anterior) {
      const r = await tentar('a entrada do jogador na mesa', () =>
        c.query<{ id: string }>(
          `insert into participacao (sessao_id, jogador_id, entrou_as, saiu_as, encerrada, lugar)
           values ($1, $2, $3, $4, $5, $6) returning id`,
          [
            traduz(p.sessaoId),
            traduz(p.jogadorId),
            p.entrouAs,
            p.saiuAs ?? null,
            p.encerrada,
            p.lugar ?? null,
          ]
        )
      )
      mapa.set(p.id, r.rows[0].id)
    } else if (
      anterior.encerrada !== p.encerrada ||
      anterior.saiuAs !== p.saiuAs ||
      // Sentar quem estava de pe muda uma participacao que JA existe. Sem esta
      // condicao a cadeira escolhida sumia no recarregar da pagina.
      anterior.lugar !== p.lugar
    ) {
      await tentar('a saída do jogador', () =>
        c.query('update participacao set encerrada = $1, saiu_as = $2, lugar = $3 where id = $4', [
          p.encerrada,
          p.saiuAs ?? null,
          p.lugar ?? null,
          p.id,
        ])
      )
    }
  }

  // ── turnos ──────────────────────────────────────────────────────────────
  for (const t of depois.turnos) {
    const anterior = antes.turnos.find((x) => x.id === t.id)
    if (!anterior) {
      const r = await tentar('a abertura do turno', () =>
        c.query<{ id: string }>(
          `insert into turno (sessao_id, dealer_id, numero, inicio, fim)
           values ($1, $2, $3, $4, $5) returning id`,
          [traduz(t.sessaoId), traduz(t.dealerId), t.numero, t.inicio, t.fim ?? null]
        )
      )
      mapa.set(t.id, r.rows[0].id)
    } else if (anterior.fim !== t.fim) {
      await tentar('o fechamento do turno', () =>
        c.query('update turno set fim = $1 where id = $2', [t.fim ?? null, t.id])
      )
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
      const r = await tentar('o lançamento', () =>
        c.query<{ id: string }>(
          `insert into movimentacao (
             sessao_id, participacao_id, turno_id, tipo, valor,
             hora_ocorrencia, hora_digitacao, hora_confirmacao,
             situacao, confirmacao, motivo_limite, motivo_contingencia, lancado_por
           ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning id`,
          [
            traduz(m.sessaoId),
            traduz(m.participacaoId) ?? null,
            traduz(m.turnoId),
            m.tipo,
            m.valor,
            m.horaOcorrencia,
            m.horaDigitacao,
            m.horaConfirmacao ?? null,
            m.situacao,
            m.confirmacao ?? null,
            motivoLimite,
            motivoContingencia,
            operadorId,
          ]
        )
      )
      mapa.set(m.id, r.rows[0].id)
    } else if (
      anterior.situacao !== m.situacao ||
      anterior.confirmacao !== m.confirmacao ||
      anterior.motivo !== m.motivo
    ) {
      await tentar('a confirmação do lançamento', () =>
        c.query(
          `update movimentacao set situacao = $1, confirmacao = $2, hora_confirmacao = $3,
                                   motivo_limite = $4, motivo_contingencia = $5
           where id = $6`,
          [
            m.situacao,
            m.confirmacao ?? null,
            m.horaConfirmacao ?? null,
            motivoLimite,
            motivoContingencia,
            m.id,
          ]
        )
      )
    }
  }

  // ── checkpoints ─────────────────────────────────────────────────────────
  for (const cp of depois.checkpoints) {
    if (antes.checkpoints.some((x) => x.id === cp.id)) continue
    await tentar('o checkpoint', () =>
      c.query(
        `insert into checkpoint (
           sessao_id, numero, hora, contado_em, caixa_esperado, caixa_contado, diferenca,
           veredito, janela_inicio, janela_fim, turno_id, turno_ids_na_janela,
           rake_acumulado, final
         ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [
          traduz(cp.sessaoId) ?? sessaoId,
          cp.numero,
          cp.hora,
          cp.contadoEm,
          cp.caixaEsperado,
          cp.caixaContado,
          cp.diferenca,
          cp.veredito,
          cp.janelaInicio,
          cp.janelaFim,
          traduz(cp.turnoId),
          cp.turnoIdsNaJanela.map((i) => traduz(i)),
          cp.rakeAcumulado,
          cp.final ?? false,
        ]
      )
    )
  }
}
