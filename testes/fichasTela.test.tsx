import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
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

function montar(noite: unknown, despachar = vi.fn(), participacaoId: string | null = 'p1') {
  vi.spyOn(estado, 'useNoite').mockReturnValue({
    noite,
    estado: 'pronto',
    erro: null,
    recarregar: vi.fn(),
    despachar,
    limparAviso: vi.fn(),
  } as never)
  render(<FichasTela participacaoId={participacaoId} onSelecionar={vi.fn()} />)
  return despachar
}

/** Uma retirada aguardando confirmação, do jeito que o reducer a produz. */
const aguardandoDe = (id: string, valor: number) => ({
  id,
  sessaoId: 'S',
  tipo: 'retirada',
  valor,
  participacaoId: 'p1',
  turnoId: 't1',
  horaOcorrencia: 1150,
  horaDigitacao: 1150,
  situacao: 'aguardando',
})

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

  it('N6/A9 — dá para lançar outra ficha com uma já esperando confirmação', async () => {
    const despachar = montar({ ...base, movimentacoes: [aguardandoDe('m1', 1000)] })

    // Sem este caminho a tela girada ocupa o aparelho e a metade "aguardando"
    // do limite nunca acontece na interface.
    await userEvent.click(screen.getByRole('button', { name: /pediu mais fichas/i }))
    expect(screen.getByText(/já há/i)).toHaveTextContent(/R\$ 1\.000/)

    for (const t of ['5', '0', '0']) {
      await userEvent.click(screen.getByRole('button', { name: t }))
    }
    await userEvent.click(screen.getByRole('button', { name: /girar a tela/i }))

    expect(despachar).toHaveBeenCalledWith(
      expect.objectContaining({ tipo: 'lancar-retirada', valor: 500 })
    )
  })

  it('nenhum pendente fica invisível: o segundo aparece com saída própria', async () => {
    const despachar = montar({
      ...base,
      movimentacoes: [aguardandoDe('m1', 1000), aguardandoDe('m2', 500)],
    })

    // O mais antigo ocupa a tela girada; o outro não pode sumir.
    const outros = screen.getByRole('region', { name: /também esperando/i })
    expect(outros).toHaveTextContent(/R\$ 500/)

    await userEvent.click(within(outros).getByRole('button', { name: /^confirmar$/i }))
    expect(despachar).toHaveBeenCalledWith({
      tipo: 'confirmar',
      movimentacaoId: 'm2',
      confirmacao: 'presencial',
    })
  })

  it('recusar não volta em silêncio: a tela para e pede o relançamento', async () => {
    // Mock vivo: `aplicar` recarrega a noite do banco depois de cada ação, e a
    // recusa tira a movimentação de "aguardando". Com um mock estático a tela
    // girada nunca sairia — e o teste estaria medindo o mock, não a tela.
    let noiteAtual: Record<string, unknown> = {
      ...base,
      movimentacoes: [aguardandoDe('m1', 1000)],
    }
    const despachar = vi.fn(async (acao: { tipo: string; movimentacaoId?: string }) => {
      if (acao.tipo !== 'recusar') return
      noiteAtual = {
        ...noiteAtual,
        movimentacoes: (noiteAtual.movimentacoes as { id: string }[]).map((m) =>
          m.id === acao.movimentacaoId ? { ...m, situacao: 'recusada' } : m
        ),
      }
    })
    vi.spyOn(estado, 'useNoite').mockImplementation(
      () =>
        ({
          noite: noiteAtual,
          estado: 'pronto',
          erro: null,
          recarregar: vi.fn(),
          despachar,
          limparAviso: vi.fn(),
        }) as never
    )
    render(<FichasTela participacaoId="p1" onSelecionar={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /não reconheço/i }))

    expect(await screen.findByText(/^recusado$/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /lançar de novo/i })).toBeInTheDocument()
    // E não volta ao seletor: relançar é para a MESMA pessoa.
    expect(screen.getByRole('heading', { name: 'Rafa' })).toBeInTheDocument()
  })

  it('A18 — com dois nomes iguais na mesa, o WhatsApp separa os dois', () => {
    montar(
      {
        ...base,
        jogadores: [
          { id: 'j1', nome: 'Rafa', whatsapp: '11988124470', limite: 3000 },
          { id: 'j2', nome: 'Rafa', whatsapp: '11977003311', limite: 2000 },
        ],
        participacoes: [
          { id: 'p1', sessaoId: 'S', jogadorId: 'j1', entrouAs: 1145, encerrada: false },
          { id: 'p2', sessaoId: 'S', jogadorId: 'j2', entrouAs: 1146, encerrada: false },
        ],
      },
      vi.fn(),
      null // seletor: ninguém escolhido ainda
    )

    expect(screen.getByText('···4470')).toBeInTheDocument()
    expect(screen.getByText('···3311')).toBeInTheDocument()
  })

  it('nome único na mesa não expõe o WhatsApp de ninguém', () => {
    montar(base, vi.fn(), null)
    expect(screen.queryByText(/···/)).not.toBeInTheDocument()
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
