import type { Noite } from '@/regras/modelo'
import { reducer, type Acao } from '@/regras/reducer'
import { comOperador } from '../banco'
import { carregarNoite } from './carregarNoite'
import { persistirDelta } from './persistirDelta'

/**
 * O único caminho de escrita do app.
 *
 * Carrega a noite do banco, roda a regra já provada em cima dela, grava o que
 * mudou e recarrega. Recarregar no fim não é desperdício: é o que faz o estado
 * da tela ser sempre o que está gravado, e não o que o navegador achou que
 * gravou.
 *
 * Quando o `reducer` recusa a ação (regra de negócio), ele devolve a mesma
 * noite com um `aviso`. Nesse caso não há delta, nada é gravado, e o aviso
 * chega à tela.
 *
 * **Isto roda no servidor, e é o ponto da DEC-007.** Antes o reducer rodava no
 * navegador e o navegador escrevia no banco: o limite da N6, o teto de
 * contingências e a exigência de aceite eram sugestões que só o cliente
 * honrava. Agora a regra é do servidor, e não há caminho que a contorne.
 *
 * Ganho de troco: os quatro passos acontecem numa transação só. Antes cada
 * chamada ia sozinha, e uma queda no meio deixava a noite meio escrita.
 */
export async function aplicar(
  clubeId: string,
  operadorId: string,
  acao: Acao
): Promise<Noite> {
  return comOperador(operadorId, async (c) => {
    const antes = await carregarNoite(c, clubeId)
    const depois = reducer(antes, acao)

    await persistirDelta(c, clubeId, antes, depois, operadorId)

    const recarregada = await carregarNoite(c, clubeId)
    // O aviso vive só em memória — ele é a fala do app, não registro da noite.
    return { ...recarregada, aviso: depois.aviso }
  })
}

/** A noite como está gravada, sem mexer em nada. */
export async function lerNoite(clubeId: string, operadorId: string): Promise<Noite> {
  return comOperador(operadorId, (c) => carregarNoite(c, clubeId))
}
