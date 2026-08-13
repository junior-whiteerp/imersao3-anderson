/**
 * Traduz a noite para o que cada componente de tela espera receber.
 *
 * Os componentes das secoes ja eram baseados em props. Esta camada e a prova
 * disso: nenhum deles precisou mudar para funcionar ligado ao estado real.
 */

import type { CaixaStatus } from '@/shell/components/CaixaStatusBar'
import type { Extrato, JogadorSelecionado } from '@/sections/fichas/components'
import type { JogadorNaMesa, LugarOcupado } from '@/sections/jogadores-e-mesa/components'
import type {
  JogadorNaMesa as NomeNaMesa,
  ResumoSessao,
  Sessao as SessaoVista,
  TurnoResumo,
} from '@/sections/sessao-e-caixa/components'
import type { LancamentoRake, TurnoAberto, TurnoFechado } from '@/sections/turnos-e-rake/components'
import type {
  Checkpoint as CheckpointVista,
  Relatorio,
} from '@/sections/conciliacao-e-relatorio/components'
import type { PainelDaNoite } from '@/sections/painel-da-noite/components'

import {
  TETO_CONTINGENCIAS,
  aguardando,
  caixaEsperado,
  checkpointsDaSessao,
  contingenciasDaSessao,
  contingenciasDe,
  dealerDo,
  vereditoDa,
  emMao,
  estadoDaFaixa,
  fichasEmJogo,
  formatarDuracao,
  formatarHora,
  jaRegistrado,
  jogadorDe,
  movimentacoesDaSessao,
  participacoesAbertas,
  rakeDeclarado,
  reais,
  somaDevolucoes,
  somaRetiradas,
  turnoAberto,
  turnosDaSessao,
  validouFicha,
  type Noite,
  type Participacao,
} from './modelo'

// ─── Shell ────────────────────────────────────────────────────────────────

/**
 * A faixa do topo.
 *
 * No estado neutro ela mostra as **fichas em jogo** — quanto saiu e ainda nao
 * voltou. Esse e o numero que o app realmente conhece entre dois checkpoints;
 * a diferenca da caixa so existe depois de alguem contar a caixa.
 */
export function statusDaFaixa(noite: Noite): CaixaStatus {
  const estado = estadoDaFaixa(noite)
  const turno = turnoAberto(noite)
  const checkpoints = checkpointsDaSessao(noite)
  const ultimo = checkpoints[checkpoints.length - 1]

  const base = {
    hora: formatarHora(noite.agora),
    turno: turno?.numero,
    dealer: dealerDo(noite, turno).split(' ')[0],
    jogadores: participacoesAbertas(noite).length,
  }

  if (estado === 'sem-sessao') {
    return { estado, valor: 'Abrir a noite' }
  }

  if (estado === 'neutro') {
    return {
      ...base,
      estado,
      rotulo: 'Fichas em jogo',
      valor: reais(fichasEmJogo(noite)),
      mensagem: ultimo
        ? `Rake não declarado desde ${formatarHora(ultimo.hora)}`
        : 'Nenhum rake lançado ainda',
    }
  }

  const janela = ultimo
    ? `${formatarHora(ultimo.janelaInicio)}–${formatarHora(ultimo.janelaFim)}`
    : ''

  if (estado === 'fechado') {
    return {
      ...base,
      estado,
      hora: formatarHora(ultimo.hora),
      valor: 'Caixa fechado',
      mensagem: `Checkpoint ${ultimo.numero} · ${janela}`,
    }
  }

  return {
    ...base,
    estado,
    hora: formatarHora(ultimo.hora),
    valor: `Faltam ${reais(ultimo.diferenca)}`,
    mensagem:
      estado === 'furo'
        ? `${janela} · suspender novas retiradas?`
        : `${janela} · revisar a janela agora`,
  }
}

// ─── Sessao e Caixa ───────────────────────────────────────────────────────

export function sessaoVista(noite: Noite): SessaoVista | null {
  if (!noite.sessao) return null
  return {
    id: noite.sessao.id,
    clube: noite.sessao.clube,
    abertaEm: formatarHora(noite.sessao.abertaEm),
    horaAtual: formatarHora(noite.agora),
    decorrido: formatarDuracao(noite.agora - noite.sessao.abertaEm),
    caixaInicial: noite.sessao.caixaInicial,
    situacao: noite.sessao.aberta ? 'aberta' : 'encerrada',
  }
}

export function resumoVista(noite: Noite): ResumoSessao {
  const checkpoints = checkpointsDaSessao(noite)
  const ultimo = checkpoints[checkpoints.length - 1]
  const congelado = estadoDaFaixa(noite) !== 'neutro'
  return {
    retiradas: somaRetiradas(noite),
    devolucoes: somaDevolucoes(noite),
    rakeRecolhido: rakeDeclarado(noite),
    // Fora de um checkpoint, o numero honesto e o que saiu e nao voltou.
    diferenca: congelado ? ultimo.diferenca : fichasEmJogo(noite),
    rakePendente: !congelado,
    ultimoRakeEm: ultimo ? formatarHora(ultimo.hora) : undefined,
    checkpoints: checkpoints.length,
  }
}

export function turnosVista(noite: Noite): TurnoResumo[] {
  return turnosDaSessao(noite).map((turno) => ({
    id: turno.id,
    numero: turno.numero,
    dealer: dealerDo(noite, turno),
    inicio: formatarHora(turno.inicio),
    fim: turno.fim === undefined ? undefined : formatarHora(turno.fim),
    rakeDoTurno: movimentacoesDaSessao(noite)
      .filter((m) => m.tipo === 'rake' && m.turnoId === turno.id)
      .reduce((s, m) => s + m.valor, 0),
    aberto: turno.fim === undefined,
  }))
}

export function nomesNaMesa(noite: Noite): NomeNaMesa[] {
  return participacoesAbertas(noite).map((p) => ({
    id: p.id,
    nome: jogadorDe(noite, p.id)?.nome ?? '—',
  }))
}

// ─── Jogadores e Mesa ─────────────────────────────────────────────────────

export function mesaVista(noite: Noite): JogadorNaMesa[] {
  return participacoesAbertas(noite).map((p) => {
    const jogador = jogadorDe(noite, p.id)
    return {
      // O id que a tela usa e o da participacao: e ela que tem saldo e hora.
      id: p.id,
      nome: jogador?.nome ?? '—',
      whatsapp: jogador?.whatsapp ?? '',
      cpf: jogador?.cpf,
      entrouAs: formatarHora(p.entrouAs),
      limite: jogador?.limite ?? 0,
      emMao: emMao(noite, p.id),
      aguardando: aguardando(noite, p.id),
      contingencias: contingenciasDe(noite, p.id),
    }
  })
}

/**
 * A mesa vista de cima.
 *
 * O lugar e o campo `lugar` da Participacao, escolhido pelo operador — nao
 * mais a posicao num array ordenado por hora de confirmacao. Aquela derivacao
 * fazia todo mundo andar uma cadeira quando alguem fechava a conta.
 *
 * Quem tem cadeira e ainda nao confirmou ficha vem com `validou: false`: a
 * mesa desenha o lugar RESERVADO. Quem nao tem cadeira aparece "de pe".
 * Item 4 da divergencia D4 do PRD, criterio A26.
 */
export function mesaAoVivoVista(noite: Noite) {
  const abertas = participacoesAbertas(noite)

  const lugares: LugarOcupado[] = abertas
    .filter((p): p is typeof p & { lugar: number } => p.lugar !== undefined)
    .sort((a, b) => a.lugar - b.lugar)
    .map((participacao) => {
      const jogador = jogadorDe(noite, participacao.id)
      return {
        lugar: participacao.lugar,
        participacaoId: participacao.id,
        nome: jogador?.nome ?? '—',
        entrouAs: formatarHora(participacao.entrouAs),
        emMao: emMao(noite, participacao.id),
        limite: jogador?.limite ?? 0,
        aguardando: aguardando(noite, participacao.id),
        contingencias: contingenciasDe(noite, participacao.id),
        validou: validouFicha(noite, participacao.id),
      }
    })

  const emPe = abertas
    .filter((p) => p.lugar === undefined)
    .map((participacao) => ({
      participacaoId: participacao.id,
      nome: jogadorDe(noite, participacao.id)?.nome ?? '—',
    }))

  const turno = turnoAberto(noite)

  return {
    lugares,
    emPe,
    dealer: turno ? dealerDo(noite, turno) : undefined,
    turno: turno?.numero,
    fichasEmJogo: fichasEmJogo(noite),
  }
}

// ─── Fichas ───────────────────────────────────────────────────────────────

export function jogadorSelecionadoVista(
  noite: Noite,
  participacaoId: string
): JogadorSelecionado | null {
  const jogador = jogadorDe(noite, participacaoId)
  if (!jogador) return null
  return {
    id: participacaoId,
    nome: jogador.nome,
    limite: jogador.limite,
    emMao: emMao(noite, participacaoId),
    aguardando: aguardando(noite, participacaoId),
  }
}

export function extratoVista(noite: Noite, participacaoId: string): Extrato | null {
  const participacao = noite.participacoes.find((p) => p.id === participacaoId)
  const jogador = jogadorDe(noite, participacaoId)
  if (!participacao || !jogador) return null

  return {
    jogador: jogador.nome,
    entrouAs: formatarHora(participacao.entrouAs),
    saiuAs: participacao.saiuAs ? formatarHora(participacao.saiuAs) : 'agora',
    linhas: noite.movimentacoes
      // N13: recusadas e canceladas continuam existindo, mas nao entram no
      // extrato de fechamento — nenhuma ficha saiu por causa delas.
      .filter((m) => m.participacaoId === participacaoId && m.situacao === 'confirmada')
      .map((m) => ({
        id: m.id,
        hora: formatarHora(m.horaOcorrencia),
        tipo: m.tipo,
        valor: m.valor,
        confirmacao: m.confirmacao ?? 'presencial',
      })),
  }
}

// ─── Turnos e Rake ────────────────────────────────────────────────────────

export function turnoAbertoVista(noite: Noite): TurnoAberto | null {
  const turno = turnoAberto(noite)
  if (!turno) return null
  return {
    id: turno.id,
    numero: turno.numero,
    dealer: dealerDo(noite, turno),
    inicio: formatarHora(turno.inicio),
    decorrido: formatarDuracao(noite.agora - turno.inicio),
    rakeDoTurno: movimentacoesDaSessao(noite)
      .filter((m) => m.tipo === 'rake' && m.turnoId === turno.id)
      .reduce((s, m) => s + m.valor, 0),
  }
}

export function turnosFechadosVista(noite: Noite): TurnoFechado[] {
  return turnosVista(noite)
    .filter((t): t is TurnoResumo & { fim: string } => t.fim !== undefined)
    .map((t) => ({
      id: t.id,
      numero: t.numero,
      dealer: t.dealer,
      inicio: t.inicio,
      fim: t.fim,
      rakeDoTurno: t.rakeDoTurno,
    }))
}

export function rakesVista(noite: Noite): LancamentoRake[] {
  return movimentacoesDaSessao(noite)
    .filter((m) => m.tipo === 'rake')
    .map((m) => {
      const turno = noite.turnos.find((t) => t.id === m.turnoId)
      return {
        id: m.id,
        horaSaida: formatarHora(m.horaOcorrencia),
        horaDigitada: formatarHora(m.horaDigitacao),
        valor: m.valor,
        turno: turno?.numero ?? 0,
        dealer: dealerDo(noite, turno ?? null),
      }
    })
}

// ─── Conciliacao ──────────────────────────────────────────────────────────

export function checkpointsVista(noite: Noite): CheckpointVista[] {
  return checkpointsDaSessao(noite).map((c) => {
    const turno = noite.turnos.find((t) => t.id === c.turnoId)
    return {
      id: c.id,
      numero: c.numero,
      hora: formatarHora(c.hora),
      diferenca: c.diferenca,
      veredito: c.veredito,
      janelaInicio: formatarHora(c.janelaInicio),
      janelaFim: formatarHora(c.janelaFim),
      turno: turno?.numero ?? 0,
      dealer: dealerDo(noite, turno ?? null),
      turnosNaJanela: c.turnoIdsNaJanela
        .map((id) => noite.turnos.find((t) => t.id === id))
        .filter((t): t is NonNullable<typeof t> => Boolean(t))
        .map((t) => ({ numero: t.numero, dealer: dealerDo(noite, t) })),
      rakeAcumulado: c.rakeAcumulado,
    }
  })
}

// ─── Relatorio da sessao encerrada ────────────────────────────────────────

/**
 * O relatorio que sobrevive a noite (F9, A14).
 *
 * Devolve `null` enquanto a sessao esta aberta: nao existe relatorio de uma
 * noite que ainda esta acontecendo, e o estado vazio da tela e "a sessao ainda
 * esta aberta".
 */
export function relatorioVista(noite: Noite): Relatorio | null {
  const sessao = noite.sessao
  if (!sessao || sessao.aberta || sessao.encerradaEm === undefined) return null

  const checkpoints = checkpointsDaSessao(noite)
  const movimentacoes = movimentacoesDaSessao(noite)
  const final = checkpoints[checkpoints.length - 1]

  const esperado = final?.caixaEsperado ?? caixaEsperado(noite)
  const contado = final?.caixaContado ?? esperado
  // A divergencia do relatorio e a da NOITE, nao a da ultima conferencia: cada
  // checkpoint so registra a falta nova da janela dele.
  const divergencia = esperado - contado

  const participacoes = noite.participacoes.filter((p) => p.sessaoId === sessao.id)

  return {
    clube: sessao.clube,
    abertaEm: formatarHora(sessao.abertaEm),
    encerradaEm: formatarHora(sessao.encerradaEm),
    duracao: formatarDuracao(sessao.encerradaEm - sessao.abertaEm),
    totais: {
      caixaInicial: sessao.caixaInicial,
      retiradas: somaRetiradas(noite),
      devolucoes: somaDevolucoes(noite),
      rake: rakeDeclarado(noite),
      caixaEsperado: esperado,
      caixaContado: contado,
      divergencia,
    },
    vereditoFinal: vereditoDa(divergencia),
    // So quando a propria conferencia final acusou falta. Se ela fechou e a
    // noite nao, a tela diz isso com outras palavras — nao com uma janela.
    janelaFinal:
      final && final.final && final.diferenca !== 0
        ? {
            inicio: formatarHora(final.janelaInicio),
            fim: formatarHora(final.janelaFim),
            turnos: final.turnoIdsNaJanela
              .map((id) => noite.turnos.find((t) => t.id === id))
              .filter((t): t is NonNullable<typeof t> => Boolean(t))
              .map((t) => ({ numero: t.numero, dealer: dealerDo(noite, t) })),
          }
        : undefined,
    checkpoints: checkpointsVista(noite),
    turnos: turnosDaSessao(noite).map((turno) => ({
      id: turno.id,
      numero: turno.numero,
      dealer: dealerDo(noite, turno),
      inicio: formatarHora(turno.inicio),
      fim: formatarHora(turno.fim ?? sessao.encerradaEm!),
      rake: movimentacoes
        .filter((m) => m.tipo === 'rake' && m.turnoId === turno.id)
        .reduce((s, m) => s + m.valor, 0),
    })),
    jogadores: participacoes.map((p) => {
      const linhas = movimentacoes.filter(
        (m) => m.participacaoId === p.id && m.situacao === 'confirmada'
      )
      const retirado = linhas
        .filter((m) => m.tipo === 'retirada')
        .reduce((s, m) => s + m.valor, 0)
      const devolvido = linhas
        .filter((m) => m.tipo === 'devolucao')
        .reduce((s, m) => s + m.valor, 0)
      return {
        id: p.id,
        nome: jogadorDe(noite, p.id)?.nome ?? '—',
        entrouAs: formatarHora(p.entrouAs),
        saiuAs: p.saiuAs === undefined ? '—' : formatarHora(p.saiuAs),
        retirado,
        devolvido,
        resultado: devolvido - retirado,
        contingencias: contingenciasDe(noite, p.id),
      }
    }),
    /**
     * As excecoes com motivo escrito.
     *
     * ⚠️ Uma movimentacao que teve liberacao de limite E contingencia guarda os
     * dois motivos num campo so, juntos por " · " — o reducer concatena para
     * nao sobrescrever um com o outro. O relatorio mostra o texto inteiro, mas
     * classifica a linha pela contingencia. No produto de verdade os dois
     * motivos precisam de campos separados; anotado na spec da secao.
     */
    registros: movimentacoes
      .filter((m) => m.motivo?.trim())
      .map((m) => ({
        id: m.id,
        hora: formatarHora(m.horaConfirmacao ?? m.horaOcorrencia),
        tipo: m.confirmacao === 'contingencia' ? ('contingencia' as const) : ('limite' as const),
        jogador: m.participacaoId
          ? (jogadorDe(noite, m.participacaoId)?.nome ?? '—')
          : '—',
        valor: m.valor,
        motivo: m.motivo!,
      })),
  }
}

// ─── Painel da Noite ──────────────────────────────────────────────────────

/**
 * A noite inteira num objeto so, pronta para o painel desenhar.
 *
 * As posicoes (0 a 1) sao calculadas aqui e nao no componente: quem sabe a hora
 * de abertura e a hora atual e esta camada. Passar minutos crus obrigaria o
 * painel a conhecer o modelo de tempo do produto — e ele nao deve conhecer.
 */
export function painelVista(noite: Noite): PainelDaNoite {
  const sessao = noite.sessao
  const checkpoints = checkpointsDaSessao(noite)
  const ultimo = checkpoints[checkpoints.length - 1]

  const inicio = sessao?.abertaEm ?? noite.agora
  const fim = sessao?.encerradaEm ?? noite.agora
  // Uma sessao recem-aberta tem duracao zero; dividir por ela joga tudo para o
  // infinito e a espinha nasce vazia.
  const vao = Math.max(fim - inicio, 1)
  const posicao = (minuto: number) =>
    Math.min(Math.max((minuto - inicio) / vao, 0), 1)

  return {
    sessao: sessao
      ? {
          clube: sessao.clube,
          abertaEm: formatarHora(sessao.abertaEm),
          horaAtual: formatarHora(noite.agora),
          decorrido: formatarDuracao(noite.agora - sessao.abertaEm),
          caixaInicial: sessao.caixaInicial,
          aberta: sessao.aberta,
        }
      : null,
    estado: estadoDaFaixa(noite),
    fluxo: {
      caixaInicial: sessao?.caixaInicial ?? 0,
      retiradas: somaRetiradas(noite),
      devolucoes: somaDevolucoes(noite),
      rake: rakeDeclarado(noite),
      caixaEsperado: caixaEsperado(noite),
      fichasEmJogo: fichasEmJogo(noite),
    },
    checkpoints: checkpoints.map((c) => ({
      id: c.id,
      numero: c.numero,
      hora: formatarHora(c.hora),
      diferenca: c.diferenca,
      veredito: c.veredito,
      janelaInicio: formatarHora(c.janelaInicio),
      janelaFim: formatarHora(c.janelaFim),
      posicao: posicao(c.hora),
      turnos: c.turnoIdsNaJanela
        .map((id) => noite.turnos.find((t) => t.id === id))
        .filter((t): t is NonNullable<typeof t> => Boolean(t))
        .map((t) => ({ numero: t.numero, dealer: dealerDo(noite, t) })),
    })),
    turnos: turnosDaSessao(noite).map((turno) => ({
      id: turno.id,
      numero: turno.numero,
      dealer: dealerDo(noite, turno),
      inicio: formatarHora(turno.inicio),
      fim: turno.fim === undefined ? undefined : formatarHora(turno.fim),
      de: posicao(turno.inicio),
      ate: posicao(turno.fim ?? fim),
      rakeDoTurno: movimentacoesDaSessao(noite)
        .filter((m) => m.tipo === 'rake' && m.turnoId === turno.id)
        .reduce((s, m) => s + m.valor, 0),
      aberto: turno.fim === undefined,
    })),
    jogadores: participacoesAbertas(noite).map((p) => {
      const jogador = jogadorDe(noite, p.id)
      return {
        id: p.id,
        nome: jogador?.nome ?? '—',
        emMao: emMao(noite, p.id),
        aguardando: aguardando(noite, p.id),
        limite: jogador?.limite ?? 0,
        entrouAs: formatarHora(p.entrouAs),
        contingencias: contingenciasDe(noite, p.id),
      }
    }),
    contingenciasNaSessao: contingenciasDaSessao(noite),
    tetoContingencias: TETO_CONTINGENCIAS,
    rakeNaoDeclaradoDesde: ultimo ? formatarHora(ultimo.hora) : undefined,
    desdeUltimoRake: ultimo
      ? formatarDuracao(Math.max(noite.agora - ultimo.hora, 0))
      : undefined,
    agora: posicao(fim),
  }
}

// ─── Numeros crus, para o painel de auditoria ─────────────────────────────

export function contabilidade(noite: Noite) {
  return {
    caixaInicial: noite.sessao?.caixaInicial ?? 0,
    retiradas: somaRetiradas(noite),
    devolucoes: somaDevolucoes(noite),
    rake: rakeDeclarado(noite),
    caixaEsperado: caixaEsperado(noite),
    fichasEmJogo: fichasEmJogo(noite),
    furoOculto: noite.furoOculto,
    jaRegistrado: jaRegistrado(noite),
  }
}

export type { Participacao }
