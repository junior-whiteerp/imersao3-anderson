/**
 * A identidade do jogador e o par nome + WhatsApp.
 *
 * Quando dois jogadores na mesa tem o mesmo nome — pai e filho, o caso que o
 * PRD cita —, o nome sozinho nao identifica ninguem. E o WhatsApp que separa.
 */

/** So os quatro ultimos digitos: chega para distinguir e nao expoe o numero. */
export function finalDoWhatsapp(whatsapp: string) {
  const digitos = whatsapp.replace(/\D/g, '')
  return digitos ? `···${digitos.slice(-4)}` : ''
}
