import { describe, it, expect, beforeEach } from 'vitest'
import { limparBanco, sql, uma, CLUBE_TESTE, OPERADOR_TESTE } from './banco'
import { aplicar } from '../servidor/dados/aplicar'

describe('aplicar', () => {
  beforeEach(limparBanco)

  it('devolve a noite recarregada do banco, não a de memória', async () => {
    const noite = await aplicar(CLUBE_TESTE, OPERADOR_TESTE, {
      tipo: 'abrir-sessao',
      clube: 'Clube Paris',
      caixaInicial: 20000,
    })
    // Se viesse da memória, o id seria "s1".
    expect(noite.sessao!.id).toMatch(/^[0-9a-f]{8}-/)
  })

  it('quando a regra recusa, nada é gravado e o aviso volta', async () => {
    await aplicar(CLUBE_TESTE, OPERADOR_TESTE, {
      tipo: 'abrir-sessao',
      clube: 'Clube Paris',
      caixaInicial: 20000,
    })
    const noite = await aplicar(CLUBE_TESTE, OPERADOR_TESTE, {
      tipo: 'abrir-sessao',
      clube: 'Clube Paris',
      caixaInicial: 9000,
    })

    expect(await sql('select * from sessao')).toHaveLength(1) // N1 respeitada
    expect(noite.aviso).toMatch(/já existe uma sessão aberta/i)
  })

  it('propaga o erro do banco em vez de fingir que salvou', async () => {
    await expect(
      aplicar('00000000-0000-0000-0000-0000000000ff', OPERADOR_TESTE, {
        tipo: 'abrir-sessao',
        clube: 'Clube Paris',
        caixaInicial: 20000,
      })
    ).rejects.toThrow()
  })

  /**
   * A razão de existir da DEC-007.
   *
   * `aplicar` abre a transação com `set local role caixa_app`, e a política de
   * `sessao` amarra tudo ao clube do operador. Escrever no clube alheio não é
   * recusado por um `if` do servidor — é recusado pelo Postgres.
   */
  it('não deixa o operador escrever no clube de outro', async () => {
    const outro = await uma<{ id: string }>(
      `insert into clube (nome) values ('Clube do Vizinho') returning id`
    )

    await expect(
      aplicar(outro.id, OPERADOR_TESTE, {
        tipo: 'abrir-sessao',
        clube: 'Clube do Vizinho',
        caixaInicial: 20000,
      })
    ).rejects.toThrow()

    expect(await sql('select * from sessao where clube_id = $1', [outro.id])).toHaveLength(0)
  })
})
