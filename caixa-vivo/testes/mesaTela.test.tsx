import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MesaTela } from '@/telas/MesaTela'
import * as estado from '@/estado/NoiteProvider'

const comSessao = {
  agora: 1145,
  sessao: {
    id: 'S',
    clube: 'Clube Paris',
    abertaEm: 1140,
    caixaInicial: 20000,
    aberta: true,
  },
  sessoes: [],
  jogadores: [],
  participacoes: [],
  dealers: [],
  turnos: [],
  movimentacoes: [],
  checkpoints: [],
  furoOculto: 0,
  aviso: null,
  seq: 1,
} as never

function montar(despachar = vi.fn()) {
  vi.spyOn(estado, 'useNoite').mockReturnValue({
    noite: comSessao,
    estado: 'pronto',
    erro: null,
    recarregar: vi.fn(),
    despachar,
  } as never)
  render(<MesaTela onAbrirJogador={vi.fn()} />)
  return despachar
}

describe('MesaTela', () => {
  it('mesa vazia diz que a noite começa quando o primeiro senta', () => {
    montar()
    expect(screen.getByText(/ninguém na mesa ainda/i)).toBeInTheDocument()
  })

  it('A19 — o cadastro não oferece nenhum botão de liberar sem WhatsApp', async () => {
    montar()
    await userEvent.click(screen.getByRole('button', { name: /adicionar jogador/i }))
    expect(screen.queryByRole('button', { name: /liberar/i })).not.toBeInTheDocument()
  })

  it('despacha cadastrar-jogador com sentar', async () => {
    const despachar = montar()
    await userEvent.click(screen.getByRole('button', { name: /adicionar jogador/i }))
    await userEvent.type(screen.getByLabelText(/nome ou apelido/i), 'Rafa')
    // Exato: o rótulo do consentimento também fala "WhatsApp".
    await userEvent.type(screen.getByLabelText(/^whatsapp$/i), '11988124470')
    await userEvent.type(screen.getByLabelText(/limite de crédito/i), '3000')
    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: /cadastrar e sentar/i }))

    expect(despachar).toHaveBeenCalledWith(
      expect.objectContaining({ tipo: 'cadastrar-jogador', nome: 'Rafa', sentar: true })
    )
  })
})
