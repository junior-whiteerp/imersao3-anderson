import type { Minutos } from '@/regras/modelo'

/**
 * Minutos desde a meia-noite do dia em que a sessão abriu.
 *
 * Pode passar de 1440: uma sessão que começa às 19h e vai até as 3h da manhã
 * termina no minuto 1620. É esse o espaço de tempo em que o `reducer` trabalha,
 * e é o que permite comparar a hora de um rake com o início de um turno sem
 * precisar de data.
 */
export function agoraEmMinutos(abertaEm: Date, agora: Date): Minutos {
  const meiaNoiteDaAbertura = new Date(abertaEm)
  meiaNoiteDaAbertura.setHours(0, 0, 0, 0)
  return Math.floor((agora.getTime() - meiaNoiteDaAbertura.getTime()) / 60000)
}
