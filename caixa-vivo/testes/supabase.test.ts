import { describe, it, expect } from 'vitest'
import { criarCliente } from '@/dados/supabase'

describe('cliente do Supabase', () => {
  it('recusa subir sem VITE_SUPABASE_URL, dizendo exatamente o que falta', () => {
    expect(() => criarCliente({ VITE_SUPABASE_ANON_KEY: 'chave' })).toThrowError(
      /VITE_SUPABASE_URL/
    )
  })

  it('recusa subir sem VITE_SUPABASE_ANON_KEY', () => {
    expect(() => criarCliente({ VITE_SUPABASE_URL: 'http://x' })).toThrowError(
      /VITE_SUPABASE_ANON_KEY/
    )
  })

  it('não oferece nenhum modo de demonstração como saída', () => {
    let mensagem = ''
    try {
      criarCliente({})
    } catch (e) {
      mensagem = (e as Error).message
    }
    expect(mensagem).not.toMatch(/demonstra|exemplo|mock|offline|amostra/i)
  })

  it('sobe quando as duas existem', () => {
    const c = criarCliente({
      VITE_SUPABASE_URL: 'http://127.0.0.1:54321',
      VITE_SUPABASE_ANON_KEY: 'chave-anonima',
    })
    expect(c.from).toBeTypeOf('function')
  })
})
