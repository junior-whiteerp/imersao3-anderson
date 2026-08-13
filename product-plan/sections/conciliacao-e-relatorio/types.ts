/**
 * As faixas da regra N17, aplicadas depois de um checkpoint.
 * `fechado` = a conta bateu.
 * `registrar` = ate R$ 100, registra e segue.
 * `revisar` = entre R$ 100 e R$ 500, revisa a janela ainda na sessao.
 * `suspender` = acima de R$ 500, o app recomenda suspender novas retiradas.
 */
export type Veredito = 'fechado' | 'registrar' | 'revisar' | 'suspender'

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
