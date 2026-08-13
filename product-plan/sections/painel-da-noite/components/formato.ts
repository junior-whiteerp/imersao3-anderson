/** Reais sem centavos: fichas de poker nao tem centavo, e o operador le de longe. */
export function reais(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

import type { EstadoDoCaixa, Veredito } from './tipos'

/**
 * O canal de cor de cada estado.
 *
 * Verde, ambar e vermelho pertencem ao veredito e a mais nada. A classe troca
 * `--cv-accent`, e regua, brilho, numero e borda leem dela — trocar o estado e
 * trocar uma classe.
 */
export const CANAL: Record<Veredito, string> = {
  fechado: 'cv-ch-fecha',
  registrar: 'cv-ch-neutro',
  revisar: 'cv-ch-revisar',
  suspender: 'cv-ch-suspender',
}

export const CANAL_DO_ESTADO: Record<EstadoDoCaixa, string> = {
  'sem-sessao': 'cv-ch-neutro',
  neutro: 'cv-ch-neutro',
  fechado: 'cv-ch-fecha',
  revisar: 'cv-ch-revisar',
  furo: 'cv-ch-suspender',
}
