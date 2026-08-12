import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessaoTela } from '@/telas/SessaoTela'
import * as estado from '@/estado/NoiteProvider'

const noiteVazia = {
  agora: 1140,
  sessao: null,
  sessoes: [],
  jogadores: [],
  participacoes: [],
  dealers: [{ id: 'd1', nome: 'João Ribeiro' }],
  turnos: [],
  movimentacoes: [],
  checkpoints: [],
  furoOculto: 0,
  aviso: null,
  seq: 1,
} as never

describe('SessaoTela', () => {
  it('estado vazio: convida a abrir a noite, sem inventar número', () => {
    vi.spyOn(estado, 'useNoite').mockReturnValue({
      noite: noiteVazia,
      estado: 'pronto',
      erro: null,
      recarregar: vi.fn(),
      despachar: vi.fn(),
    } as never)
    render(<SessaoTela />)
    expect(screen.getByText(/nenhuma sessão aberta/i)).toBeInTheDocument()
    expect(screen.queryByText(/20\.000/)).not.toBeInTheDocument()
  })

  it('despacha abrir-sessao com o valor digitado', async () => {
    const despachar = vi.fn()
    vi.spyOn(estado, 'useNoite').mockReturnValue({
      noite: noiteVazia,
      estado: 'pronto',
      erro: null,
      recarregar: vi.fn(),
      despachar,
    } as never)
    render(<SessaoTela />)

    await userEvent.type(screen.getByLabelText(/caixa inicial/i), '20000')
    await userEvent.click(screen.getByRole('button', { name: /abrir a noite/i }))

    expect(despachar).toHaveBeenCalledWith({
      tipo: 'abrir-sessao',
      clube: 'Clube Paris',
      caixaInicial: 20000,
    })
  })
})
