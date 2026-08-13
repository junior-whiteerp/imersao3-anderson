/**
 * O contrato do Painel da Noite.
 *
 * O painel nao calcula nada e nao guarda numero proprio: ele recebe a noite
 * inteira ja derivada e desenha. E o que permite ele conviver com as outras
 * cinco secoes sem duplicar regra — se o reducer muda, o painel muda com ele.
 *
 * Espelha `product/sections/painel-da-noite/types.ts`.
 */

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
  diferenca: number
  veredito: Veredito
  janelaInicio: string
  janelaFim: string
  /**
   * Onde a ficha cai na espinha, de 0 a 1.
   *
   * Vem calculado de fora porque quem sabe a hora de abertura e a hora atual e
   * a camada de vistas, nao o componente. Passar minutos crus obrigaria o
   * painel a conhecer o modelo de tempo do produto.
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
