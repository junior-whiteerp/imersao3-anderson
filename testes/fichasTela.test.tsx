import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FichasTela } from '@/telas/FichasTela'
import * as estado from '@/estado/NoiteProvider'

const base = {
  agora: 1150,
  sessao: { id: 'S', clube: 'Clube Paris', abertaEm: 1140, caixaInicial: 20000, aberta: true },
  sessoes: [],
  dealers: [{ id: 'd1', nome: 'João Ribeiro' }],
  jogadores: [{ id: 'j1', nome: 'Rafa', whatsapp: '11988124470', limite: 3000 }],
  participacoes: [{ id: 'p1', sessaoId: 'S', jogadorId: 'j1', entrouAs: 1145, encerrada: false }],
  turnos: [{ id: 't1', sessaoId: 'S', numero: 1, dealerId: 'd1', inicio: 1140 }],
  movimentacoes: [],
  checkpoints: [],
  furoOculto: 0,
  aviso: null,
  seq: 1,
}

function montar(noite: unknown, despachar = vi.fn()) {
  vi.spyOn(estado, 'useNoite').mockReturnValue({
    noite,
    estado: 'pronto',
    erro: null,
    recarregar: vi.fn(),
    despachar,
  } as never)
  render(<FichasTela participacaoId="p1" onSelecionar={vi.fn()} />)
  return despachar
}

describe('FichasTela', () => {
  it('N2 — a tela girada aparece com a retirada aguardando, e ocupa o aparelho', () => {
    montar({
      ...base,
      movimentacoes: [
        {
          id: 'm1',
          sessaoId: 'S',
          tipo: 'retirada',
          valor: 1000,
          participacaoId: 'p1',
          turnoId: 't1',
          horaOcorrencia: 1150,
          horaDigitacao: 1150,
          situacao: 'aguardando',
        },
      ],
    })
    expect(screen.getByText(/confira o valor/i)).toBeInTheDocument()
    expect(screen.getByText('R$ 1.000')).toBeInTheDocument()
  })

  it('confirmar despacha confirmação presencial', async () => {
    const despachar = montar({
      ...base,
      movimentacoes: [
        {
          id: 'm1',
          sessaoId: 'S',
          tipo: 'retirada',
          valor: 1000,
          participacaoId: 'p1',
          turnoId: 't1',
          horaOcorrencia: 1150,
          horaDigitacao: 1150,
          situacao: 'aguardando',
        },
      ],
    })
    await userEvent.click(screen.getByRole('button', { name: /^confirmar$/i }))
    expect(despachar).toHaveBeenCalledWith({
      tipo: 'confirmar',
      movimentacaoId: 'm1',
      confirmacao: 'presencial',
    })
  })

  it('A8/N10 — acima do limite não passa sem motivo escrito', async () => {
    const despachar = montar({
      ...base,
      movimentacoes: [
        {
          id: 'm0',
          sessaoId: 'S',
          tipo: 'retirada',
          valor: 2800,
          participacaoId: 'p1',
          turnoId: 't1',
          horaOcorrencia: 1146,
          horaDigitacao: 1146,
          situacao: 'confirmada',
          confirmacao: 'presencial',
          horaConfirmacao: 1146,
        },
      ],
    })
    // Rafa tem limite 3000 e já está com 2800. Mais 500 estoura.
    for (const t of ['5', '0', '0']) {
      await userEvent.click(screen.getByRole('button', { name: t }))
    }
    expect(screen.getByText(/valor acima do limite/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /liberar mesmo assim/i }))
    await userEvent.type(
      screen.getByLabelText(/motivo da liberação/i),
      'Cliente antigo, dono liberou.'
    )
    await userEvent.click(screen.getByRole('button', { name: /girar a tela/i }))

    expect(despachar).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: 'lancar-retirada',
        valor: 500,
        motivo: 'Cliente antigo, dono liberou.',
      })
    )
  })

  it('N16 — contingência só sai com motivo escrito', async () => {
    const despachar = montar({
      ...base,
      movimentacoes: [
        {
          id: 'm1',
          sessaoId: 'S',
          tipo: 'retirada',
          valor: 1000,
          participacaoId: 'p1',
          turnoId: 't1',
          horaOcorrencia: 1150,
          horaDigitacao: 1150,
          situacao: 'aguardando',
        },
      ],
    })
    await userEvent.click(screen.getByRole('button', { name: /o jogador não olhou/i }))
    const registrar = screen.getByRole('button', { name: /registrar contingência/i })
    expect(registrar).toBeDisabled()

    await userEvent.type(screen.getByLabelText(/motivo/i), 'Atendeu o telefone.')
    await userEvent.click(registrar)
    expect(despachar).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: 'confirmar',
        confirmacao: 'contingencia',
        motivo: 'Atendeu o telefone.',
      })
    )
  })
})
