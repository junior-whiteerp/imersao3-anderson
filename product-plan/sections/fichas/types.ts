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
