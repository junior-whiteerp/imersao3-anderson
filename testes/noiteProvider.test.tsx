import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NoiteProvider, useNoite } from '@/estado/NoiteProvider'

function Sonda() {
  const { estado, erro, noite } = useNoite()
  return (
    <div>
      {estado}:{erro ?? ''}:{noite.sessao ? 'com-sessao' : 'sem-sessao'}
    </div>
  )
}

describe('NoiteProvider', () => {
  it('mostra carregando antes da primeira resposta do banco', () => {
    render(
      <NoiteProvider carregar={() => new Promise(() => {})}>
        <Sonda />
      </NoiteProvider>
    )
    expect(screen.getByText(/^carregando/)).toBeInTheDocument()
  })

  it('mostra o erro do banco em vez de uma tela vazia', async () => {
    const carregar = vi.fn().mockRejectedValue(new Error('conexão recusada'))
    render(
      <NoiteProvider carregar={carregar}>
        <Sonda />
      </NoiteProvider>
    )
    expect(await screen.findByText(/erro:conexão recusada/)).toBeInTheDocument()
  })

  it('vazio é vazio: banco sem sessão não vira noite de exemplo', async () => {
    const vazia = {
      sessao: null,
      jogadores: [],
      dealers: [],
      sessoes: [],
      participacoes: [],
      turnos: [],
      movimentacoes: [],
      checkpoints: [],
      agora: 0,
      aviso: null,
      seq: 1,
      furoOculto: 0,
    }
    render(
      <NoiteProvider carregar={async () => vazia as never}>
        <Sonda />
      </NoiteProvider>
    )
    expect(await screen.findByText(/pronto::sem-sessao/)).toBeInTheDocument()
  })
})
