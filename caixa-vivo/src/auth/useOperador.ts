import { useCallback, useEffect, useState } from 'react'
import { cliente } from '@/dados/supabase'

export interface Operador {
  id: string
  nome: string
}

export function useOperador() {
  const [operador, setOperador] = useState<Operador | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const carregarPerfil = useCallback(async (id: string) => {
    const { data, error } = await cliente.from('operador').select('id, nome').eq('id', id).single()
    if (error) throw new Error(`Sessão válida, mas sem cadastro de operador: ${error.message}`)
    setOperador(data as Operador)
  }, [])

  useEffect(() => {
    cliente.auth.getSession().then(async ({ data }) => {
      if (data.session) await carregarPerfil(data.session.user.id).catch((e) => setErro(e.message))
      setCarregando(false)
    })
    const { data: sub } = cliente.auth.onAuthStateChange((_e, s) => {
      if (!s) setOperador(null)
    })
    return () => sub.subscription.unsubscribe()
  }, [carregarPerfil])

  async function entrar(email: string, senha: string) {
    setErro(null)
    const { data, error } = await cliente.auth.signInWithPassword({ email, password: senha })
    // O erro do Supabase sobe como está. Traduzi-lo aqui esconderia
    // "e-mail não confirmado" atrás de "usuário ou senha não confere".
    if (error) throw error
    await carregarPerfil(data.user.id)
  }

  async function sair() {
    await cliente.auth.signOut()
    setOperador(null)
  }

  return { operador, carregando, erro, entrar, sair }
}
