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
 * O lugar e ocupado quando o operador senta alguem numa cadeira livre —
 * campo proprio da Participacao, nao ordem de chegada. `validou: false`
 * marca a cadeira RESERVADA: tem dono, mas ele ainda nao confirmou ficha
 * nenhuma (criterio A26). Quem nao tem cadeira nenhuma aparece em `emPe`,
 * fora do anel de lugares.
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
  /** Quem entrou na sessao e ainda NAO TEM CADEIRA. Nao e "quem nao validou". */
  emPe: { participacaoId: string; nome: string }[]
  dealer: string
  turno: number
  /** Soma do que saiu da caixa e ainda nao voltou. */
  fichasEmJogo: number
}
