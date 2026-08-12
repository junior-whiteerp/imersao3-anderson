/**
 * Contrato de dados dos componentes desta secao.
 * Espelha `product/sections/jogadores-e-mesa/types.ts`.
 */

export interface JogadorNaMesa {
  id: string
  nome: string
  whatsapp: string
  cpf?: string
  entrouAs: string
  limite: number
  emMao: number
  aguardando: number
  contingencias: number
}

export interface JogadorEncerrado {
  id: string
  nome: string
  whatsapp: string
  entrouAs: string
  saiuAs: string
  limite: number
  resultado: number
}
