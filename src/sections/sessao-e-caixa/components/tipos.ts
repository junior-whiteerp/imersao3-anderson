/**
 * Contrato de dados dos componentes desta secao.
 * Espelha `product/sections/sessao-e-caixa/types.ts` e viaja junto com os
 * componentes na exportacao, para que eles nao dependam do Design OS.
 */

export type SituacaoSessao = 'aberta' | 'encerrada'

export interface Sessao {
  id: string
  clube: string
  abertaEm: string
  horaAtual: string
  decorrido: string
  caixaInicial: number
  situacao: SituacaoSessao
}

export interface ResumoSessao {
  retiradas: number
  devolucoes: number
  rakeRecolhido: number
  diferenca: number
  rakePendente: boolean
  ultimoRakeEm?: string
  checkpoints: number
}

export interface TurnoResumo {
  id: string
  numero: number
  dealer: string
  inicio: string
  fim?: string
  rakeDoTurno: number
  aberto: boolean
}

export interface JogadorNaMesa {
  id: string
  nome: string
}
