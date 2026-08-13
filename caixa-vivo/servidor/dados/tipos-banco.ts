/**
 * As linhas do Postgres, exatamente como elas voltam.
 *
 * Snake_case, nulos de verdade e `Date` onde o Postgres devolve timestamptz —
 * este arquivo é a fronteira. Depois dele,
 * tudo é `Noite` em camelCase, e nenhuma tela precisa saber que existe um
 * `hora_ocorrencia` em algum lugar.
 */
import type { Minutos, SituacaoMovimentacao, TipoConfirmacao, TipoMovimentacao, Veredito } from '@/regras/modelo'

export interface LinhaClube {
  id: string
  nome: string
  percentual_rake_dealer: number
}

export interface LinhaDealer {
  id: string
  clube_id: string
  nome: string
}

export interface LinhaJogador {
  id: string
  clube_id: string
  nome: string
  whatsapp: string
  cpf: string | null
  limite: number
  consentimento_em: Date
}

export interface LinhaSessao {
  id: string
  clube_id: string
  aberta_em: Date
  encerrada_em: Date | null
  caixa_inicial: number
  aberta: boolean
}

export interface LinhaParticipacao {
  id: string
  sessao_id: string
  jogador_id: string
  entrou_as: Minutos
  saiu_as: Minutos | null
  encerrada: boolean
  /** 1 a 10, ou null enquanto o jogador estiver de pe. */
  lugar: number | null
}

export interface LinhaTurno {
  id: string
  sessao_id: string
  dealer_id: string
  numero: number
  inicio: Minutos
  fim: Minutos | null
}

export interface LinhaMovimentacao {
  id: string
  sessao_id: string
  participacao_id: string | null
  turno_id: string
  tipo: TipoMovimentacao
  valor: number
  hora_ocorrencia: Minutos
  hora_digitacao: Minutos
  hora_confirmacao: Minutos | null
  situacao: SituacaoMovimentacao
  confirmacao: TipoConfirmacao | null
  motivo_limite: string | null
  motivo_contingencia: string | null
  lancado_por: string | null
  criada_em: Date
}

export interface LinhaCheckpoint {
  id: string
  sessao_id: string
  numero: number
  hora: Minutos
  contado_em: Minutos
  caixa_esperado: number
  caixa_contado: number
  diferenca: number
  veredito: Veredito
  janela_inicio: Minutos
  janela_fim: Minutos
  turno_id: string
  turno_ids_na_janela: string[] | null
  rake_acumulado: number
  final: boolean
}
