import { describe, it, expect } from 'vitest'
import { validarAcao } from '../servidor/dados/validarAcao'

describe('validarAcao — o porteiro da API', () => {
  it('deixa passar uma ação de operador bem formada', () => {
    const r = validarAcao({ tipo: 'lancar-retirada', participacaoId: 'p1', valor: 1000 })
    expect(r.ok).toBe(true)
  })

  /**
   * O motivo desta lista existir.
   *
   * As três são ferramentas da simulação do Design OS. Se a API aceitasse
   * qualquer `Acao` do reducer, um `curl` apagaria a noite ou inventaria uma
   * divergência de caixa que nunca aconteceu.
   */
  it.each(['reiniciar', 'injetar-furo', 'avancar-tempo', 'limpar-aviso'])(
    'recusa "%s", que é ferramenta de simulação e não ação de operador',
    (tipo) => {
      const r = validarAcao({ tipo, valor: 999_999, minutos: 60 })
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.motivo).toMatch(/não existe ou não é permitida/)
    }
  )

  it('recusa tipo desconhecido', () => {
    expect(validarAcao({ tipo: 'apagar-tudo' }).ok).toBe(false)
  })

  it('recusa corpo que não é objeto', () => {
    expect(validarAcao(null).ok).toBe(false)
    expect(validarAcao('abrir-sessao').ok).toBe(false)
    expect(validarAcao([{ tipo: 'reiniciar' }]).ok).toBe(false)
  })

  it('recusa quando falta campo obrigatório', () => {
    expect(validarAcao({ tipo: 'lancar-retirada', valor: 1000 }).ok).toBe(false)
    expect(validarAcao({ tipo: 'abrir-turno' }).ok).toBe(false)
  })

  it('recusa valor que não é inteiro positivo — nem string, nem negativo, nem quebrado', () => {
    const base = { tipo: 'lancar-retirada', participacaoId: 'p1' }
    for (const valor of ['1000', -1, 0, 10.5, null, NaN, Infinity]) {
      expect(validarAcao({ ...base, valor }).ok).toBe(false)
    }
  })

  it('recusa lugar fora da mesa antes mesmo de o banco recusar', () => {
    expect(validarAcao({ tipo: 'sentar', jogadorId: 'j1', lugar: 11 }).ok).toBe(false)
    expect(validarAcao({ tipo: 'sentar', jogadorId: 'j1', lugar: 0 }).ok).toBe(false)
    expect(validarAcao({ tipo: 'sentar', jogadorId: 'j1', lugar: 10 }).ok).toBe(true)
    // Sem lugar é válido: o jogador entra de pé (A26).
    expect(validarAcao({ tipo: 'sentar', jogadorId: 'j1' }).ok).toBe(true)
  })

  it('só aceita os dois tipos de confirmação que existem', () => {
    const base = { tipo: 'confirmar', movimentacaoId: 'm1' }
    expect(validarAcao({ ...base, confirmacao: 'presencial' }).ok).toBe(true)
    expect(validarAcao({ ...base, confirmacao: 'contingencia' }).ok).toBe(true)
    expect(validarAcao({ ...base, confirmacao: 'automatica' }).ok).toBe(false)
  })

  it('devolução aceita zero — jogador pode sair sem ficha nenhuma', () => {
    expect(validarAcao({ tipo: 'devolver-e-encerrar', participacaoId: 'p1', valor: 0 }).ok).toBe(
      true
    )
  })
})
