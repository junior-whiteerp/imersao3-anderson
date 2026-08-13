import { useEffect, useState } from 'react'
import * as api from '@/dados/api'

export interface Operador {
  id: string
  nome: string
}

/**
 * A sessão do operador.
 *
 * O token não passa por aqui: ele vive num cookie `httpOnly`, que o JavaScript
 * não alcança. O que este hook sabe é se existe sessão e de quem ela é — e
 * descobre isso perguntando ao servidor, nunca lendo `localStorage`.
 */
export function useOperador() {
  const [operador, setOperador] = useState<Operador | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let vivo = true
    api
      .sessaoAtual()
      .then((o) => {
        if (vivo) setOperador(o)
      })
      .catch((e: unknown) => {
        if (vivo) setErro(e instanceof Error ? e.message : 'Falha ao conferir a sessão.')
      })
      .finally(() => {
        if (vivo) setCarregando(false)
      })
    return () => {
      vivo = false
    }
  }, [])

  async function entrar(email: string, senha: string) {
    setErro(null)
    // O erro sobe como está: a tela de Login sabe mostrá-lo, e o servidor já
    // devolve uma frase escrita para o operador.
    setOperador(await api.entrar(email, senha))
  }

  async function sair() {
    await api.sair()
    setOperador(null)
  }

  return { operador, carregando, erro, entrar, sair }
}
