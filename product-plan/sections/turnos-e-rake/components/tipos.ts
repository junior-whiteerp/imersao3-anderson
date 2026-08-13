/**
 * Contrato de dados dos componentes desta secao.
 * Espelha `product/sections/turnos-e-rake/types.ts`.
 */

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
  horaSaida: string
  horaDigitada: string
  valor: number
  turno: number
  dealer: string
}
