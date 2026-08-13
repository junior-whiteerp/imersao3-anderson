import { describe, it, expect } from 'vitest'
import { gerarHash, conferirSenha } from '../servidor/auth/senha'

describe('senha', () => {
  it('confere a senha certa', async () => {
    const hash = await gerarHash('caixa-vivo-2026')
    expect(await conferirSenha('caixa-vivo-2026', hash)).toBe(true)
  })

  it('recusa a senha errada', async () => {
    const hash = await gerarHash('caixa-vivo-2026')
    expect(await conferirSenha('caixa-vivo-2027', hash)).toBe(false)
  })

  it('nunca guarda a senha em claro', async () => {
    const hash = await gerarHash('minha-senha-secreta')
    expect(hash).not.toContain('minha-senha-secreta')
  })

  it('dois hashes da mesma senha são diferentes — o sal é novo a cada vez', async () => {
    const a = await gerarHash('igual')
    const b = await gerarHash('igual')
    expect(a).not.toBe(b)
    // E os dois continuam conferindo.
    expect(await conferirSenha('igual', a)).toBe(true)
    expect(await conferirSenha('igual', b)).toBe(true)
  })

  it('grava os parâmetros junto, para poder encarecer depois sem invalidar', async () => {
    const hash = await gerarHash('x')
    expect(hash.startsWith('scrypt$16384$8$1$')).toBe(true)
    expect(hash.split('$')).toHaveLength(6)
  })

  it('recusa hash corrompido em vez de estourar', async () => {
    expect(await conferirSenha('x', 'não é um hash')).toBe(false)
    expect(await conferirSenha('x', 'scrypt$16384$8$1$')).toBe(false)
    expect(await conferirSenha('x', '')).toBe(false)
    // Formato certo, hash vazio: não pode passar por acaso.
    expect(await conferirSenha('x', 'scrypt$16384$8$1$c2FsdA==$')).toBe(false)
  })

  it('acento composto e pré-composto são a mesma senha', async () => {
    // "José" com é pronto (U+00E9) e com e + acento combinante (U+0065 U+0301).
    const hash = await gerarHash('José-do-clube')
    expect(await conferirSenha('José-do-clube', hash)).toBe(true)
  })
})
