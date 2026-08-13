/**
 * Contrato de dados dos componentes desta secao.
 * Espelha `product/sections/conciliacao-e-relatorio/types.ts`.
 */

export type Veredito = 'fechado' | 'registrar' | 'revisar' | 'suspender'

export interface TurnoDaJanela {
  numero: number
  dealer: string
}

export interface Checkpoint {
  id: string
  numero: number
  hora: string
  diferenca: number
  veredito: Veredito
  janelaInicio: string
  janelaFim: string
  /** O turno a que o rake pertence, pela hora em que saiu da mesa. */
  turno: number
  dealer: string
  /**
   * Todos os turnos que a janela cobre. Uma janela pode atravessar uma troca de
   * dealer — mostrar so um apontaria para a pessoa errada.
   */
  turnosNaJanela?: TurnoDaJanela[]
  rakeAcumulado: number
}

export interface VereditoAtual {
  estado: 'neutro' | 'sem-checkpoint'
  diferenca: number
  desdeHora: string
  horaAtual: string
}

// ─── Relatorio da sessao (F9, A13, A14) ────────────────────────────────────

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
 * Uma excecao registrada na noite.
 *
 * As duas que o PRD exige por escrito: a contingencia (N16) e a liberacao
 * acima do limite (N10). Ambas guardam motivo, e e o motivo que faz o registro
 * valer alguma coisa depois — por isso ele aparece inteiro, nao resumido.
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
   * Cada checkpoint registra apenas a falta nova daquela janela. Uma noite que
   * perdeu R$ 60 as 20h15 e R$ 480 as 21h08 e fechou no ultimo rake tem
   * divergencia de R$ 540 — dizer "o caixa fechou" porque a conferencia final
   * deu zero esconderia exatamente o que o produto existe para achar.
   *
   * Positiva significa que faltou ficha. Nunca arredondada nem apagada (N12).
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
