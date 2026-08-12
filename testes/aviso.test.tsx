import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Aviso } from '@/telas/Aviso'
import * as estado from '@/estado/NoiteProvider'

function montar(aviso: string | null, limparAviso = vi.fn()) {
  vi.spyOn(estado, 'useNoite').mockReturnValue({
    noite: { aviso } as never,
    estado: 'pronto',
    erro: null,
    recarregar: vi.fn(),
    despachar: vi.fn(),
    limparAviso,
  } as never)
  render(<Aviso />)
  return limparAviso
}

afterEach(() => {
  vi.useRealTimers()
})

describe('Aviso', () => {
  it('não ocupa espaço nenhum quando o app não tem nada a dizer', () => {
    montar(null)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('mostra a recusa da regra em vez de engolir', () => {
    montar('Já existe uma sessão aberta neste clube.')
    expect(screen.getByRole('status')).toHaveTextContent(/já existe uma sessão aberta/i)
  })

  it('o operador pode fechar na mão', async () => {
    const limparAviso = montar('Nenhum turno estava aberto às 19h10.')
    await userEvent.click(screen.getByRole('button', { name: /fechar aviso/i }))
    expect(limparAviso).toHaveBeenCalled()
  })

  it('some sozinho depois de 6 segundos, sem o operador precisar mirar no X', () => {
    vi.useFakeTimers()
    const limparAviso = montar('Valor acima do limite.')
    expect(limparAviso).not.toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(6000)
    })
    expect(limparAviso).toHaveBeenCalledTimes(1)
  })
})
