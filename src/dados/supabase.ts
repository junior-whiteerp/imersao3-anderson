import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * O cliente do banco.
 *
 * Sem credencial, isto explode no boot — de propósito. O Caixa Vivo não tem
 * modo de demonstração, e não pode ter: um app que cai para dados de exemplo
 * quando o banco some fica com cara de funcionando enquanto o caixa da noite
 * não está sendo registrado em lugar nenhum.
 */
export function criarCliente(env: Record<string, string | undefined>): SupabaseClient {
  const faltando = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'].filter((c) => !env[c])

  if (faltando.length > 0) {
    throw new Error(
      `Falta credencial do banco: ${faltando.join(' e ')}. ` +
        'Copie .env.example para .env.local e preencha com os valores do seu projeto ' +
        'Supabase (Project Settings → API). O app não abre sem banco.'
    )
  }

  return createClient(env.VITE_SUPABASE_URL!, env.VITE_SUPABASE_ANON_KEY!)
}

export const cliente = criarCliente(import.meta.env as unknown as Record<string, string>)
