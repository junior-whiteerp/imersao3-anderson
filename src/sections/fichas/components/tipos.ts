/**
 * Contrato de dados dos componentes desta secao.
 * Espelha `product/sections/fichas/types.ts`.
 */

export type TipoMovimentacao = 'retirada' | 'devolucao' | 'rake'

export type TipoConfirmacao = 'presencial' | 'contingencia'

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
