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
