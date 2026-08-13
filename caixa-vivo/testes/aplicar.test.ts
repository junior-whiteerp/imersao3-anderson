import { describe, it, expect, beforeEach } from 'vitest'
import { clienteDeTeste, limparBanco, CLUBE_TESTE } from './banco'
import { aplicar } from '@/dados/aplicar'

const db = clienteDeTeste()

describe('aplicar', () => {
  beforeEach(limparBanco)

  it('devolve a noite recarregada do banco, não a de memória', async () => {
    const noite = await aplicar(db, CLUBE_TESTE, null, {
      tipo: 'abrir-sessao',
      clube: 'Clube Paris',
      caixaInicial: 20000,
    })
    // Se viesse da memória, o id seria "s1".
    expect(noite.sessao!.id).toMatch(/^[0-9a-f]{8}-/)
  })

  it('quando a regra recusa, nada é gravado e o aviso volta', async () => {
    await aplicar(db, CLUBE_TESTE, null, {
      tipo: 'abrir-sessao',
      clube: 'Clube Paris',
      caixaInicial: 20000,
    })
    const noite = await aplicar(db, CLUBE_TESTE, null, {
      tipo: 'abrir-sessao',
      clube: 'Clube Paris',
      caixaInicial: 9000,
    })

    const { data } = await db.from('sessao').select('*')
    expect(data).toHaveLength(1) // N1 respeitada
    expect(noite.aviso).toMatch(/já existe uma sessão aberta/i)
  })

  it('propaga o erro do banco em vez de fingir que salvou', async () => {
    await expect(
      aplicar(db, 'clube-que-nao-existe', null, {
        tipo: 'abrir-sessao',
        clube: 'Clube Paris',
        caixaInicial: 20000,
      })
    ).rejects.toThrow()
  })
})
