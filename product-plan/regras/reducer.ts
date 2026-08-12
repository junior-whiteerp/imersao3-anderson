/**
 * As regras de negocio do Caixa Vivo, escritas uma vez.
 *
 * Cada regra do PRD que muda estado mora aqui, marcada pelo numero dela. As
 * telas nao decidem nada — elas despacham acoes e desenham o resultado.
 */

import {
  TETO_CONTINGENCIAS,
  TOTAL_DE_LUGARES,
  caixaEsperado,
  checkpointsDaSessao,
  comprometido,
  contingenciasDaSessao,
  formatarHora,
  jaRegistrado,
  jogadorPorIdentidade,
  participacaoNoLugar,
  participacoesAbertas,
  podeEncerrarSessao,
  reais,
  turnoAberto,
  turnoEm,
  turnosNaJanela,
  vereditoDa,
  whatsappJaUsado,
  type Checkpoint,
  type Minutos,
  type Movimentacao,
  type Noite,
  type TipoConfirmacao,
} from './modelo'

export type Acao =
  | { tipo: 'abrir-sessao'; clube: string; caixaInicial: number }
  | { tipo: 'encerrar-sessao'; caixaContado?: number }
  | { tipo: 'avancar-tempo'; minutos: number }
  | {
      tipo: 'cadastrar-jogador'
      nome: string
      whatsapp: string
      cpf?: string
      limite: number
      sentar: boolean
      /** A17: o operador confirmou que este WhatsApp é de outra pessoa. */
      confirmouOutraPessoa?: boolean
    }
  | { tipo: 'sentar'; jogadorId: string; lugar?: number }
  | { tipo: 'lancar-retirada'; participacaoId: string; valor: number; motivo?: string }
  | {
      tipo: 'confirmar'
      movimentacaoId: string
      confirmacao: TipoConfirmacao
      motivo?: string
    }
  | { tipo: 'recusar'; movimentacaoId: string }
  | { tipo: 'devolver-e-encerrar'; participacaoId: string; valor: number }
  | { tipo: 'abrir-turno'; dealerId: string }
  | { tipo: 'trocar-dealer'; dealerId: string }
  | { tipo: 'lancar-rake'; valor: number; horaOcorrencia: Minutos }
  | { tipo: 'injetar-furo'; valor: number }
  | { tipo: 'limpar-aviso' }
  | { tipo: 'reiniciar' }

function comAviso(noite: Noite, aviso: string): Noite {
  return { ...noite, aviso }
}

export function reducer(noite: Noite, acao: Acao): Noite {
  switch (acao.tipo) {
    // ── Sessao ────────────────────────────────────────────────────────────

    case 'abrir-sessao': {
      // N1: so existe uma sessao aberta por clube ao mesmo tempo.
      if (noite.sessao?.aberta) {
        return comAviso(noite, 'Já existe uma sessão aberta neste clube.')
      }
      if (acao.caixaInicial <= 0) {
        return comAviso(noite, 'Informe o caixa inicial de fichas.')
      }

      const nova = {
        id: `s${noite.seq}`,
        clube: acao.clube,
        abertaEm: noite.agora,
        caixaInicial: acao.caixaInicial,
        aberta: true,
      }

      return {
        ...noite,
        sessao: nova,
        // N13: a sessao anterior nao e apagada — ela sai de cena, mas fica.
        // Movimentacoes, turnos e checkpoints continuam no estado, carimbados
        // com o id da sessao a que pertencem, e as consultas filtram por ela.
        sessoes: [...noite.sessoes, nova],
        // O furo e ficha fisica, nao registro. A noite nova comeca com a caixa
        // que o operador acabou de contar.
        furoOculto: 0,
        seq: noite.seq + 1,
        aviso: null,
      }
    }

    case 'encerrar-sessao': {
      // N11: a sessao nao encerra com jogador ainda na mesa.
      if (!podeEncerrarSessao(noite)) {
        const faltam = participacoesAbertas(noite).length
        return comAviso(
          noite,
          `A sessão não encerra com ${faltam} jogador${faltam > 1 ? 'es' : ''} na mesa.`
        )
      }

      const aberto = turnoAberto(noite)
      const comTurnoFechado: Noite = {
        ...noite,
        // N4: o ultimo turno fecha junto com a noite.
        turnos: aberto
          ? noite.turnos.map((t) => (t.id === aberto.id ? { ...t, fim: noite.agora } : t))
          : noite.turnos,
      }

      // A13 e N12: o encerramento faz a conferencia final. Toda diferenca que
      // apareceu depois do ultimo rake seria perdida em silencio sem isto —
      // e a regra diz que divergencia nunca e arredondada nem apagada.
      const anteriores = checkpointsDaSessao(comTurnoFechado)
      const anterior = anteriores[anteriores.length - 1]
      const esperado = caixaEsperado(comTurnoFechado)
      const contado = acao.caixaContado ?? esperado - comTurnoFechado.furoOculto
      const diferenca = esperado - contado - jaRegistrado(comTurnoFechado)
      const janelaInicio = anterior?.hora ?? comTurnoFechado.sessao!.abertaEm

      const conferenciaFinal: Checkpoint = {
        id: `c${comTurnoFechado.seq}`,
        sessaoId: comTurnoFechado.sessao!.id,
        numero: anteriores.length + 1,
        hora: comTurnoFechado.agora,
        contadoEm: comTurnoFechado.agora,
        caixaEsperado: esperado,
        caixaContado: contado,
        diferenca,
        veredito: vereditoDa(diferenca),
        janelaInicio,
        janelaFim: comTurnoFechado.agora,
        turnoId: aberto?.id ?? anterior?.turnoId ?? '',
        turnoIdsNaJanela: turnosNaJanela(
          comTurnoFechado,
          janelaInicio,
          comTurnoFechado.agora
        ).map((t) => t.id),
        rakeAcumulado: comTurnoFechado.movimentacoes
          .filter(
            (m) => m.tipo === 'rake' && m.sessaoId === comTurnoFechado.sessao!.id
          )
          .reduce((s, m) => s + m.valor, 0),
        final: true,
      }

      return {
        ...comTurnoFechado,
        sessao: { ...comTurnoFechado.sessao!, aberta: false, encerradaEm: noite.agora },
        sessoes: comTurnoFechado.sessoes.map((s) =>
          s.id === comTurnoFechado.sessao!.id
            ? { ...s, aberta: false, encerradaEm: noite.agora }
            : s
        ),
        checkpoints: [...comTurnoFechado.checkpoints, conferenciaFinal],
        seq: comTurnoFechado.seq + 1,
        aviso:
          diferenca === 0
            ? 'Conferência final: o caixa fechou. Relatório guardado.'
            : `Conferência final: faltam ${reais(diferenca)}. A divergência ficou registrada.`,
      }
    }

    case 'avancar-tempo':
      return { ...noite, agora: noite.agora + acao.minutos }

    // ── Jogadores e mesa ──────────────────────────────────────────────────

    case 'cadastrar-jogador': {
      // N15: sem WhatsApp nao ha cadastro. Sem escalacao e sem excecao.
      if (!acao.whatsapp.replace(/\D/g, '')) {
        return comAviso(noite, 'Sem WhatsApp não é possível cadastrar.')
      }
      if (!acao.nome.trim()) {
        return comAviso(noite, 'O nome ou apelido é obrigatório.')
      }
      // A16: o par nome + WhatsApp ja cadastrado nao cria um segundo jogador.
      const existente = jogadorPorIdentidade(noite, acao.nome, acao.whatsapp)
      if (existente) {
        return comAviso(noite, `${existente.nome} já está cadastrado com esse WhatsApp.`)
      }

      // A17: mesmo WhatsApp com nome diferente e permitido — casal, pai e filho,
      // quem divide o aparelho — mas so DEPOIS de o operador confirmar que e
      // outra pessoa. Sem essa parada, um erro de digitacao no nome cria um
      // jogador novo em silencio e o historico do primeiro se parte em dois.
      const donoDoNumero = whatsappJaUsado(noite, acao.whatsapp)
      if (donoDoNumero && !acao.confirmouOutraPessoa) {
        return comAviso(
          noite,
          `Esse WhatsApp já é de ${donoDoNumero.nome}. Confirme que ${acao.nome.trim()} é outra pessoa.`
        )
      }

      const jogador = {
        id: `j${noite.seq}`,
        nome: acao.nome.trim(),
        whatsapp: acao.whatsapp,
        cpf: acao.cpf?.trim() || undefined,
        limite: acao.limite,
      }

      const comJogador: Noite = {
        ...noite,
        jogadores: [...noite.jogadores, jogador],
        seq: noite.seq + 1,
        aviso: null,
      }

      if (!acao.sentar) return comJogador
      return reducer(comJogador, { tipo: 'sentar', jogadorId: jogador.id })
    }

    case 'sentar': {
      if (!noite.sessao?.aberta) {
        return comAviso(noite, 'Abra a sessão antes de sentar alguém na mesa.')
      }

      // A mesa tem dez cadeiras e nao e configuravel (DEC-003).
      if (acao.lugar !== undefined) {
        const dentroDaMesa =
          Number.isInteger(acao.lugar) && acao.lugar >= 1 && acao.lugar <= TOTAL_DE_LUGARES
        if (!dentroDaMesa) {
          return comAviso(noite, `A mesa tem ${TOTAL_DE_LUGARES} lugares.`)
        }
      }

      const dele = participacoesAbertas(noite).find((p) => p.jogadorId === acao.jogadorId)

      // A cadeira so esta tomada se for de OUTRO jogador. Sentar a Bia no
      // lugar em que a Bia ja esta tem de dizer "ja esta na mesa" — a mensagem
      // aponta para o que o operador precisa corrigir.
      if (acao.lugar !== undefined) {
        const ocupante = participacaoNoLugar(noite, acao.lugar)
        if (ocupante && ocupante.id !== dele?.id) {
          return comAviso(noite, `O lugar ${acao.lugar} já está ocupado.`)
        }
      }

      // Ja esta na mesa e ainda de pe: ele ganha a cadeira, e NAO vira uma
      // segunda participacao. Sem este caminho, quem entra pela aba Mesa —
      // que nao tem desenho para tocar — fica de pe para sempre.
      if (dele) {
        if (dele.lugar === undefined && acao.lugar !== undefined) {
          return {
            ...noite,
            participacoes: noite.participacoes.map((p) =>
              p.id === dele.id ? { ...p, lugar: acao.lugar } : p
            ),
            aviso: null,
          }
        }
        return comAviso(noite, 'Esse jogador já está na mesa.')
      }

      return {
        ...noite,
        participacoes: [
          ...noite.participacoes,
          {
            id: `p${noite.seq}`,
            sessaoId: noite.sessao.id,
            jogadorId: acao.jogadorId,
            entrouAs: noite.agora,
            encerrada: false,
            lugar: acao.lugar,
          },
        ],
        seq: noite.seq + 1,
        aviso: null,
      }
    }

    // ── Fichas ────────────────────────────────────────────────────────────

    case 'lancar-retirada': {
      const turno = turnoAberto(noite)
      if (!turno) return comAviso(noite, 'Abra um turno antes de lançar fichas.')
      if (acao.valor <= 0) return comAviso(noite, 'Informe o valor da retirada.')

      const participacao = noite.participacoes.find((p) => p.id === acao.participacaoId)
      // N5 e N7: a conta encerrada nao recebe mais ficha. Hoje as telas nao
      // oferecem esse caminho, mas a regra vive aqui e nao na tela.
      if (!participacao || participacao.encerrada) {
        return comAviso(noite, 'A conta desse jogador já foi encerrada.')
      }

      const jogador = noite.jogadores.find((j) => j.id === participacao.jogadorId)
      if (!jogador) return comAviso(noite, 'Jogador não encontrado.')

      // N6 e N10: o limite conta o confirmado mais o que aguarda confirmacao.
      // Passar dele nao bloqueia — exige liberacao com motivo escrito.
      // O motivo precisa ter conteudo: espaco em branco nao e justificativa.
      const total = comprometido(noite, acao.participacaoId) + acao.valor
      if (total > jogador.limite && !acao.motivo?.trim()) {
        return comAviso(
          noite,
          `Valor acima do limite: ${reais(total)} de ${reais(jogador.limite)}. Liberar exige motivo escrito.`
        )
      }

      // N2: a ficha so sai depois de o jogador confirmar. Nasce aguardando.
      const movimentacao: Movimentacao = {
        id: `m${noite.seq}`,
        sessaoId: noite.sessao!.id,
        tipo: 'retirada',
        valor: acao.valor,
        participacaoId: acao.participacaoId,
        turnoId: turno.id,
        horaOcorrencia: noite.agora,
        horaDigitacao: noite.agora,
        situacao: 'aguardando',
        motivo: acao.motivo,
      }

      return {
        ...noite,
        movimentacoes: [...noite.movimentacoes, movimentacao],
        seq: noite.seq + 1,
        aviso: null,
      }
    }

    case 'confirmar': {
      const movimentacao = noite.movimentacoes.find((m) => m.id === acao.movimentacaoId)
      if (!movimentacao || movimentacao.situacao !== 'aguardando') return noite

      const jaUsadas = contingenciasDaSessao(noite)

      // N16: confirmar sem o jogador olhar e contingencia. Exige motivo escrito
      // e conta no teto de 3 POR SESSAO. Da 4a em diante, a ficha nao sai.
      if (acao.confirmacao === 'contingencia') {
        if (jaUsadas >= TETO_CONTINGENCIAS) {
          return comAviso(
            noite,
            `${jaUsadas + 1}ª contingência desta sessão. A ficha não sai.`
          )
        }
        if (!acao.motivo?.trim()) {
          return comAviso(noite, 'A contingência exige um motivo escrito.')
        }
      }

      const contingencia = acao.confirmacao === 'contingencia'

      return {
        ...noite,
        movimentacoes: noite.movimentacoes.map((m) =>
          m.id === acao.movimentacaoId
            ? {
                ...m,
                situacao: 'confirmada' as const,
                confirmacao: acao.confirmacao,
                // N2: e agora que a ficha sai da caixa, nao quando foi digitada.
                horaConfirmacao: noite.agora,
                // N10: o motivo da liberacao acima do limite ja esta guardado e
                // nao pode ser sobrescrito pelo motivo da contingencia — sao
                // duas excecoes diferentes, cada uma com sua justificativa.
                motivo: [m.motivo, acao.motivo].filter(Boolean).join(' · ') || undefined,
              }
            : m
        ),
        aviso: contingencia
          ? `Contingência ${jaUsadas + 1} de ${TETO_CONTINGENCIAS} registrada.`
          : `Confirmado às ${formatarHora(noite.agora)}. Pode entregar as fichas.`,
      }
    }

    case 'recusar': {
      const movimentacao = noite.movimentacoes.find((m) => m.id === acao.movimentacaoId)
      if (!movimentacao || movimentacao.situacao !== 'aguardando') return noite
      return {
        ...noite,
        movimentacoes: noite.movimentacoes.map((m) =>
          m.id === acao.movimentacaoId ? { ...m, situacao: 'recusada' as const } : m
        ),
        aviso: 'Recusado. A ficha não sai. Confira o valor e lance de novo.',
      }
    }

    case 'devolver-e-encerrar': {
      const turno = turnoAberto(noite)
      if (!turno) return comAviso(noite, 'Abra um turno antes de fechar a conta.')
      if (acao.valor < 0) return comAviso(noite, 'A contagem não pode ser negativa.')

      // N5: devolucao e sempre fechamento de conta, e conta so fecha uma vez.
      // Sem esta guarda, uma segunda devolucao entrava como ficha fantasma.
      const conta = noite.participacoes.find((p) => p.id === acao.participacaoId)
      if (!conta || conta.encerrada) {
        return comAviso(noite, 'A conta desse jogador já foi encerrada.')
      }

      const devolucao: Movimentacao = {
        id: `m${noite.seq}`,
        sessaoId: noite.sessao!.id,
        tipo: 'devolucao',
        valor: acao.valor,
        participacaoId: acao.participacaoId,
        turnoId: turno.id,
        horaOcorrencia: noite.agora,
        horaDigitacao: noite.agora,
        horaConfirmacao: noite.agora,
        situacao: 'confirmada',
        confirmacao: 'presencial',
      }

      return {
        ...noite,
        // N7: encerrar a conta cancela os lancamentos ainda aguardando dele.
        movimentacoes: [
          ...noite.movimentacoes.map((m) =>
            m.participacaoId === acao.participacaoId && m.situacao === 'aguardando'
              ? { ...m, situacao: 'cancelada' as const }
              : m
          ),
          devolucao,
        ],
        // N5: devolucao e sempre fechamento de conta. Parcial nao existe.
        participacoes: noite.participacoes.map((p) =>
          p.id === acao.participacaoId
            ? { ...p, encerrada: true, saiuAs: noite.agora }
            : p
        ),
        seq: noite.seq + 1,
        aviso: 'Conta encerrada.',
      }
    }

    // ── Turnos e rake ─────────────────────────────────────────────────────

    case 'abrir-turno': {
      if (!noite.sessao?.aberta) {
        return comAviso(noite, 'Abra a sessão antes de abrir um turno.')
      }
      if (turnoAberto(noite)) {
        return comAviso(noite, 'Já existe um turno aberto. Feche-o antes.')
      }
      return {
        ...noite,
        turnos: [
          ...noite.turnos,
          {
            id: `t${noite.seq}`,
            sessaoId: noite.sessao.id,
            numero: noite.turnos.filter((t) => t.sessaoId === noite.sessao!.id).length + 1,
            dealerId: acao.dealerId,
            inicio: noite.agora,
          },
        ],
        seq: noite.seq + 1,
        aviso: null,
      }
    }

    case 'trocar-dealer': {
      const aberto = turnoAberto(noite)
      if (!aberto) {
        return reducer(noite, { tipo: 'abrir-turno', dealerId: acao.dealerId })
      }
      if (aberto.dealerId === acao.dealerId) {
        return comAviso(noite, 'Esse dealer já está no turno.')
      }
      // N4: turnos nao se sobrepoem. O anterior fecha no mesmo minuto em que
      // o proximo abre.
      return {
        ...noite,
        turnos: [
          ...noite.turnos.map((t) => (t.id === aberto.id ? { ...t, fim: noite.agora } : t)),
          {
            id: `t${noite.seq}`,
            sessaoId: noite.sessao!.id,
            numero: noite.turnos.filter((t) => t.sessaoId === noite.sessao!.id).length + 1,
            dealerId: acao.dealerId,
            inicio: noite.agora,
          },
        ],
        seq: noite.seq + 1,
        aviso: null,
      }
    }

    case 'lancar-rake': {
      if (!noite.sessao?.aberta) return comAviso(noite, 'Nenhuma sessão aberta.')
      if (acao.valor <= 0) return comAviso(noite, 'Informe o valor do rake.')

      const anteriores = checkpointsDaSessao(noite)
      const anterior = anteriores[anteriores.length - 1]

      // A hora de saida tem de caber na janela que ainda esta aberta: depois do
      // ultimo checkpoint (ou da abertura da sessao) e nao adiante do relogio.
      //
      // Faltavam os dois extremos. Sem o piso, o primeiro rake da noite aceitava
      // uma hora anterior a abertura e gravava janela invertida. Sem o teto, um
      // dedo errado ("21h30" no lugar de "19h30") criava um checkpoint no futuro
      // e travava TODOS os rakes seguintes por horas — e nada apaga checkpoint
      // (N13), entao a noite ficava sem conferencia nenhuma.
      const piso = anterior?.hora ?? noite.sessao.abertaEm
      if (acao.horaOcorrencia < piso) {
        return comAviso(
          noite,
          anterior
            ? `Esse horário é anterior ao último checkpoint, das ${formatarHora(anterior.hora)}. Corrija a hora de saída.`
            : `A sessão abriu às ${formatarHora(piso)}. O rake não pode ter saído antes disso.`
        )
      }
      if (acao.horaOcorrencia > noite.agora) {
        return comAviso(
          noite,
          `São ${formatarHora(noite.agora)}. O rake não pode ter saído da mesa às ${formatarHora(acao.horaOcorrencia)}.`
        )
      }

      // N3: o rake e atribuido ao turno pela hora em que saiu da mesa, nunca
      // pela hora em que foi digitado.
      //
      // Sem turno cobrindo a hora, o lancamento e recusado. Antes ele caia no
      // turno aberto, e o painel acabava nomeando um dealer para uma janela em
      // que ele nem tinha comecado — exatamente o que a regra N14 proibe.
      const turno = turnoEm(noite, acao.horaOcorrencia)
      if (!turno) {
        return comAviso(
          noite,
          `Nenhum turno estava aberto às ${formatarHora(acao.horaOcorrencia)}. Corrija a hora de saída.`
        )
      }

      const movimentacao: Movimentacao = {
        id: `m${noite.seq}`,
        sessaoId: noite.sessao.id,
        tipo: 'rake',
        valor: acao.valor,
        turnoId: turno.id,
        horaOcorrencia: acao.horaOcorrencia,
        horaDigitacao: noite.agora,
        situacao: 'confirmada',
      }

      const comRake: Noite = {
        ...noite,
        movimentacoes: [...noite.movimentacoes, movimentacao],
        seq: noite.seq + 1,
      }

      // N9: o veredito de furo so aparece logo depois de um lancamento de rake.
      const esperado = caixaEsperado(comRake)
      const contado = esperado - comRake.furoOculto
      // A diferenca do checkpoint e o que apareceu NESTA janela — o que ja foi
      // registrado antes nao volta a ser cobrado (N12: registra, nao acumula).
      const diferenca = comRake.furoOculto - jaRegistrado(comRake)
      const janelaInicio = anterior?.hora ?? comRake.sessao!.abertaEm

      const checkpoint: Checkpoint = {
        id: `c${comRake.seq}`,
        sessaoId: comRake.sessao!.id,
        numero: anteriores.length + 1,
        hora: acao.horaOcorrencia,
        // A contagem acontece agora, na digitacao. Guardar as duas horas evita
        // que o checkpoint trate como posterior uma ficha que ele ja contou.
        contadoEm: comRake.agora,
        caixaEsperado: esperado,
        caixaContado: contado,
        diferenca,
        veredito: vereditoDa(diferenca),
        janelaInicio,
        janelaFim: acao.horaOcorrencia,
        turnoId: turno.id,
        // N14: a janela pode atravessar uma troca de dealer. O app mostra todos
        // os turnos que ela cobre, para nao apontar para a pessoa errada.
        turnoIdsNaJanela: turnosNaJanela(comRake, janelaInicio, acao.horaOcorrencia).map(
          (t) => t.id
        ),
        rakeAcumulado: comRake.movimentacoes
          .filter((m) => m.tipo === 'rake' && m.sessaoId === comRake.sessao!.id)
          .reduce((s, m) => s + m.valor, 0),
      }

      return {
        ...comRake,
        checkpoints: [...comRake.checkpoints, checkpoint],
        seq: comRake.seq + 1,
        aviso:
          diferenca === 0
            ? 'Caixa fechado.'
            : `Faltam ${reais(diferenca)} · ${formatarHora(checkpoint.janelaInicio)}–${formatarHora(checkpoint.janelaFim)}`,
      }
    }

    // ── Controles da simulacao ────────────────────────────────────────────

    case 'injetar-furo':
      return {
        ...noite,
        furoOculto: Math.max(0, noite.furoOculto + acao.valor),
        aviso: null,
      }

    case 'limpar-aviso':
      return noite.aviso === null ? noite : { ...noite, aviso: null }

    case 'reiniciar':
      return noite

    default:
      return noite
  }
}
