import type { SupabaseClient } from '@supabase/supabase-js'
import type { Noite } from '@/regras/modelo'
import { reducer, type Acao } from '@/regras/reducer'
import { carregarNoite } from './carregarNoite'
import { persistirDelta } from './persistirDelta'

/**
 * O único caminho de escrita do app.
 *
 * Carrega a noite do banco, roda a regra já provada em cima dela, grava o que
 * mudou e recarrega. Recarregar no fim não é desperdício: é o que faz o estado
 * da tela ser sempre o que está gravado, e não o que o navegador achou que
 * gravou. Se a rede caiu no meio, a tela mostra a verdade.
 *
 * Quando o `reducer` recusa a ação (regra de negócio), ele devolve a mesma
 * noite com um `aviso`. Nesse caso não há delta, nada é gravado, e o aviso
 * chega à tela.
 */
export async function aplicar(
  db: SupabaseClient,
  clubeId: string,
  operadorId: string | null,
  acao: Acao
): Promise<Noite> {
  const antes = await carregarNoite(db, clubeId)
  const depois = reducer(antes, acao)

  await persistirDelta(db, antes, depois, operadorId)

  const recarregada = await carregarNoite(db, clubeId)
  // O aviso vive só em memória — ele é a fala do app, não registro da noite.
  return { ...recarregada, aviso: depois.aviso }
}
