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
