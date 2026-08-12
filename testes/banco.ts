import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const CLUBE_TESTE = '11111111-1111-1111-1111-111111111111'
export const DEALER_JOAO = '22222222-2222-2222-2222-222222222221'
export const DEALER_MARCOS = '22222222-2222-2222-2222-222222222222'

/**
 * Cliente de teste com a chave de serviço do Supabase local.
 *
 * Ele ignora RLS de propósito: o que estamos provando aqui são as CONSTRAINTS,
 * não as políticas. As políticas são exercidas pelo app, com a chave anônima.
 */
export function clienteDeTeste(): SupabaseClient {
  const url = process.env.SUPABASE_URL_TESTE
  const chave = process.env.SUPABASE_SERVICE_ROLE_TESTE
  if (!url || !chave) {
    throw new Error(
      'Banco de teste indisponível. Rode `npx supabase start` e exporte ' +
        'SUPABASE_URL_TESTE e SUPABASE_SERVICE_ROLE_TESTE (aparecem na saída do comando). ' +
        'Sem banco, estes testes não podem passar — e não devem ser pulados.'
    )
  }
  return createClient(url, chave, { auth: { persistSession: false } })
}

export async function limparBanco() {
  const db = clienteDeTeste()
  // Ordem por dependência. `clube` e `dealer` vêm do seed e ficam.
  for (const tabela of ['checkpoint', 'movimentacao', 'participacao', 'turno', 'sessao', 'jogador']) {
    const { error } = await db.from(tabela).delete().not('id', 'is', null)
    if (error) throw new Error(`Falhou ao limpar ${tabela}: ${error.message}`)
  }
}
