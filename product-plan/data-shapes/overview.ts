// =============================================================================
// Contratos de dados da interface — referência combinada
//
// Estes tipos definem o que os componentes esperam receber via props. São um
// contrato de frontend, não um esquema de banco. Como você modela, guarda e
// busca esses dados é decisão de implementação.
// =============================================================================


// -----------------------------------------------------------------------------
// De: sections/painel-da-noite
// -----------------------------------------------------------------------------

/**
 * O contrato do Painel da Noite.
 *
 * O painel nao calcula nada e nao guarda numero proprio: ele recebe a noite
 * inteira ja derivada e desenha. E o que permite ele conviver com as outras
 * seis secoes sem duplicar regra — se a regra muda, o painel muda com ela.
 */

/** As faixas da regra N17, aplicadas depois de um checkpoint. */
export type Veredito = 'fechado' | 'registrar' | 'revisar' | 'suspender'

/** Os mesmos cinco estados da faixa do shell. O painel usa a mesma leitura. */
export type EstadoDoCaixa = 'sem-sessao' | 'neutro' | 'fechado' | 'revisar' | 'furo'

export interface PainelSessao {
  clube: string
  abertaEm: string
  horaAtual: string
  /** "2h47" — duracao, nao horario. */
  decorrido: string
  caixaInicial: number
  aberta: boolean
}

export interface PainelCheckpoint {
  id: string
  numero: number
  hora: string
  /** Quanto falta. Zero significa que o caixa fechou. */
  diferenca: number
  veredito: Veredito
  janelaInicio: string
  janelaFim: string
  /**
   * Onde a ficha cai na espinha, de 0 a 1.
   *
   * Vem calculado de fora: quem sabe a hora de abertura e a hora atual e a
   * camada de dados, nao o componente. Passar minutos crus obrigaria o painel a
   * conhecer o modelo de tempo do produto.
   */
  posicao: number
  /** Todos os turnos que a janela atravessa. O furo pode estar em qualquer um. */
  turnos: { numero: number; dealer: string }[]
}

export interface PainelTurno {
  id: string
  numero: number
  dealer: string
  inicio: string
  fim?: string
  /** Inicio e fim na espinha, de 0 a 1. */
  de: number
  ate: number
  rakeDoTurno: number
  aberto: boolean
}

/** A conta que precisa fechar, aberta em parcelas. */
export interface PainelFluxo {
  caixaInicial: number
  retiradas: number
  devolucoes: number
  rake: number
  caixaEsperado: number
  /** Saiu da caixa e ainda nao voltou. Nao e furo. */
  fichasEmJogo: number
}

export interface PainelJogador {
  id: string
  nome: string
  emMao: number
  aguardando: number
  limite: number
  entrouAs: string
  contingencias: number
}

export interface PainelDaNoite {
  sessao: PainelSessao | null
  estado: EstadoDoCaixa
  fluxo: PainelFluxo
  checkpoints: PainelCheckpoint[]
  turnos: PainelTurno[]
  jogadores: PainelJogador[]
  contingenciasNaSessao: number
  tetoContingencias: number
  /** Hora do ultimo rake declarado. Ausente antes do primeiro. */
  rakeNaoDeclaradoDesde?: string
  /** "1h07" desde o ultimo rake. O operador esquecer e a hipotese H2 do PRD. */
  desdeUltimoRake?: string
  /** Onde o "agora" cai na espinha, de 0 a 1. */
  agora: number
}


// -----------------------------------------------------------------------------
// De: sections/sessao-e-caixa
// -----------------------------------------------------------------------------

/** Situacao da sessao. A release 1 tem uma sessao aberta por clube. */
export type SituacaoSessao = 'aberta' | 'encerrada'

export interface Sessao {
  id: string
  clube: string
  /** Hora de abertura, ex: "19h00" */
  abertaEm: string
  /** Hora atual da sessao, ex: "21h47" */
  horaAtual: string
  /** Tempo decorrido, ex: "2h47" */
  decorrido: string
  /** Caixa inicial de fichas, em reais */
  caixaInicial: number
  situacao: SituacaoSessao
}

export interface ResumoSessao {
  /** Tudo que saiu do caixa */
  retiradas: number
  /** Tudo que voltou pelo fechamento de conta */
  devolucoes: number
  /** Rake ja declarado */
  rakeRecolhido: number
  /** Diferenca atual, em reais. Positiva significa que falta ficha. */
  diferenca: number
  /** Se ha rake na mesa ainda nao declarado, a diferenca e esperada e nao e furo. */
  rakePendente: boolean
  /** Hora do ultimo rake declarado, ex: "21h40" */
  ultimoRakeEm?: string
  checkpoints: number
}

export interface TurnoResumo {
  id: string
  numero: number
  dealer: string
  inicio: string
  /** Ausente quando o turno esta aberto */
  fim?: string
  rakeDoTurno: number
  aberto: boolean
}

export interface JogadorNaMesa {
  id: string
  nome: string
}

export interface SessaoData {
  sessao: Sessao | null
  resumo: ResumoSessao
  turnos: TurnoResumo[]
  jogadoresNaMesa: JogadorNaMesa[]
}


// -----------------------------------------------------------------------------
// De: sections/jogadores-e-mesa
// -----------------------------------------------------------------------------

export interface JogadorNaMesa {
  id: string
  /** Metade da identidade. A outra metade e o WhatsApp. */
  nome: string
  /** Obrigatorio. Regra N15: sem WhatsApp nao ha cadastro. */
  whatsapp: string
  /** Opcional desde a v1.2 do PRD. So quando o jogador quiser dar. */
  cpf?: string
  entrouAs: string
  limite: number
  /** Fichas em poder do jogador: retirado menos devolvido */
  emMao: number
  /** Lancamentos ainda aguardando confirmacao. Contam no limite pela regra N6. */
  aguardando: number
  /** Quantas vezes o operador confirmou sem o jogador olhar. Teto de 3 na sessao. */
  contingencias: number
}

export interface JogadorEncerrado {
  id: string
  nome: string
  whatsapp: string
  entrouAs: string
  saiuAs: string
  limite: number
  /** Resultado da noite: positivo se o jogador saiu ganhando */
  resultado: number
}

export interface MesaData {
  jogadores: JogadorNaMesa[]
  encerrados: JogadorEncerrado[]
}

/**
 * Um lugar ocupado na mesa ao vivo (F13).
 *
 * O lugar so e ocupado quando o jogador confirma a primeira ficha na tela
 * girada — criterio A26. Quem entrou e ainda nao validou nada aparece em
 * `emPe`, fora do anel de lugares.
 *
 * `lugar` e campo proprio da Participacao, escolhido pelo operador quando ele
 * senta alguem — nao o indice do array nem a ordem de chegada. Se fosse
 * derivado, dois jogadores trocariam de lugar sozinhos quando um deles
 * fechasse a conta.
 */
export interface LugarOcupado {
  /** Numero do lugar, de 1 a 10. */
  lugar: number
  participacaoId: string
  nome: string
  entrouAs: string
  emMao: number
  limite: number
  /** Retirada esperando o jogador confirmar. O lugar fica marcado ate sair. */
  aguardando: number
  contingencias: number
  /**
   * Ja confirmou a primeira ficha na tela girada?
   *
   * `false` = lugar RESERVADO: a cadeira tem dono, mas ele ainda nao reconheceu
   * ficha nenhuma. E a leitura da N2 que a F13 existe para dar (criterio A26).
   */
  validou: boolean
}

export interface MesaAoVivoData {
  lugares: LugarOcupado[]
  /** Quem entrou na sessao mas ainda nao validou nenhuma ficha. */
  emPe: { participacaoId: string; nome: string }[]
  dealer: string
  turno: number
  /** Soma do que saiu da caixa e ainda nao voltou. */
  fichasEmJogo: number
}


// -----------------------------------------------------------------------------
// De: sections/fichas
// -----------------------------------------------------------------------------

export type TipoMovimentacao = 'retirada' | 'devolucao' | 'rake'

/** Como o aceite aconteceu. Contingencia e o operador confirmando sem o jogador olhar. */
export type TipoConfirmacao = 'presencial' | 'contingencia'

/**
 * As quatro situacoes de uma movimentacao. So `aguardando` espera alguem, e no
 * R1 essa espera dura segundos — mas ela existe, e e ela que faz as regras
 * N6 e N7 funcionarem.
 */
export type SituacaoMovimentacao = 'aguardando' | 'confirmada' | 'recusada' | 'cancelada'

export interface JogadorSelecionado {
  id: string
  nome: string
  limite: number
  emMao: number
  aguardando: number
}

export interface LinhaExtrato {
  id: string
  hora: string
  tipo: TipoMovimentacao
  valor: number
  confirmacao: TipoConfirmacao
}

export interface Extrato {
  jogador: string
  entrouAs: string
  saiuAs: string
  linhas: LinhaExtrato[]
}

export interface FichasData {
  jogadorSelecionado: JogadorSelecionado
  contingenciasNaSessao: number
  tetoContingencias: number
  extrato: Extrato
}


// -----------------------------------------------------------------------------
// De: sections/turnos-e-rake
// -----------------------------------------------------------------------------

export interface TurnoAberto {
  id: string
  numero: number
  dealer: string
  inicio: string
  decorrido: string
  rakeDoTurno: number
}

export interface TurnoFechado {
  id: string
  numero: number
  dealer: string
  inicio: string
  fim: string
  rakeDoTurno: number
}

export interface Dealer {
  id: string
  nome: string
}

export interface LancamentoRake {
  id: string
  /** Hora em que o rake saiu da mesa. E ela que define o turno. */
  horaSaida: string
  /** Hora em que o operador digitou. Guardada, mas nao atribui turno. */
  horaDigitada: string
  valor: number
  turno: number
  dealer: string
}

export interface RakeData {
  turnoAberto: TurnoAberto | null
  turnosFechados: TurnoFechado[]
  dealers: Dealer[]
  lancamentos: LancamentoRake[]
  horaAtual: string
}


// -----------------------------------------------------------------------------
// De: sections/conciliacao-e-relatorio
// -----------------------------------------------------------------------------

/**
 * As faixas da regra N17, ja declaradas acima no bloco de `painel-da-noite`.
 *
 * `fechado` = a conta bateu.
 * `registrar` = ate R$ 100, registra e segue.
 * `revisar` = entre R$ 100 e R$ 500, revisa a janela ainda na sessao.
 * `suspender` = acima de R$ 500, o app recomenda suspender novas retiradas.
 *
 * Este arquivo junta os types.ts de todas as secoes. O mesmo nome vindo de
 * duas delas viraria declaracao duplicada, e o arquivo nao compilaria — por
 * isso aqui fica so a nota. O tipo por secao esta em cada `types.ts`.
 */

/** Um turno que atravessa a janela de um checkpoint. Quem estava operando. */
export interface TurnoDaJanela {
  numero: number
  dealer: string
}

export interface Checkpoint {
  id: string
  numero: number
  /** Hora em que o veredito foi congelado — sempre um lancamento de rake */
  hora: string
  /** Quanto falta. Zero significa que o caixa fechou. */
  diferenca: number
  veredito: Veredito
  janelaInicio: string
  janelaFim: string
  turno: number
  dealer: string
  rakeAcumulado: number
}

/** O estado entre dois checkpoints. Diferenca esperada nao e furo. */
export interface VereditoAtual {
  estado: 'neutro' | 'sem-checkpoint'
  diferenca: number
  /** Desde quando o rake nao e declarado */
  desdeHora: string
  horaAtual: string
}

// ─── Relatorio da sessao encerrada (F9, A13, A14) ──────────────────────────

export interface RelatorioTurno {
  id: string
  numero: number
  dealer: string
  inicio: string
  fim: string
  rake: number
}

export interface RelatorioJogador {
  id: string
  nome: string
  entrouAs: string
  saiuAs: string
  retirado: number
  devolvido: number
  /** Devolvido menos retirado. Positivo: ele ganhou na noite. */
  resultado: number
  contingencias: number
}

/**
 * Uma excecao registrada na noite: contingencia (N16) ou liberacao acima do
 * limite (N10). O motivo escrito e o que faz o registro valer alguma coisa
 * depois, entao ele aparece inteiro.
 *
 * ⚠️ Pendencia de modelagem: uma movimentacao que teve as DUAS excecoes guarda
 * os dois motivos num campo so. Precisam de campos separados no produto.
 */
export interface RelatorioRegistro {
  id: string
  hora: string
  tipo: 'contingencia' | 'limite'
  jogador: string
  valor: number
  motivo: string
}

export interface RelatorioTotais {
  caixaInicial: number
  retiradas: number
  devolucoes: number
  rake: number
  caixaEsperado: number
  caixaContado: number
  /**
   * O que faltou na NOITE INTEIRA, nao so na conferencia final.
   *
   * Cada checkpoint registra apenas a falta nova da janela dele. Uma noite que
   * perdeu R$ 60 as 20h15 e R$ 480 as 21h08 e fechou no ultimo rake tem
   * divergencia de R$ 540 — dizer "o caixa fechou" porque a conferencia final
   * deu zero esconderia exatamente o que o produto existe para achar.
   */
  divergencia: number
}

export interface Relatorio {
  clube: string
  abertaEm: string
  encerradaEm: string
  duracao: string
  totais: RelatorioTotais
  vereditoFinal: Veredito
  /** A janela e os turnos da conferencia final, quando ela nao fechou. */
  janelaFinal?: { inicio: string; fim: string; turnos: TurnoDaJanela[] }
  checkpoints: Checkpoint[]
  turnos: RelatorioTurno[]
  jogadores: RelatorioJogador[]
  registros: RelatorioRegistro[]
}

export interface ConciliacaoData {
  vereditoAtual: VereditoAtual
  ultimoCheckpoint: Checkpoint | null
  checkpoints: Checkpoint[]
  /** Existe so depois de a sessao ser encerrada. */
  relatorio: Relatorio | null
}
