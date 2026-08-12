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

  it('carrega a noite uma vez só, mesmo com o pai renderizando de novo', async () => {
    // Com `carregar` na lista de dependências do efeito, o app entrava em laço:
    // cada carga provocava um render, e cada render uma carga nova, contra o
    // banco, para sempre. Nos testes anteriores isso passava despercebido
    // porque o provider renderizava uma vez só.
    const vazia = {
      sessao: null, jogadores: [], dealers: [], sessoes: [], participacoes: [],
      turnos: [], movimentacoes: [], checkpoints: [], agora: 0, aviso: null,
      seq: 1, furoOculto: 0,
    }
    const carregar = vi.fn().mockResolvedValue(vazia as never)

    const { rerender } = render(
      <NoiteProvider carregar={carregar}>
        <Sonda />
      </NoiteProvider>
    )
    await screen.findByText(/pronto::sem-sessao/)

    // Três renders do pai, cada um passando uma `carregar` recém-criada.
    for (let i = 0; i < 3; i++) {
      rerender(
        <NoiteProvider carregar={(...a) => carregar(...a)}>
          <Sonda />
        </NoiteProvider>
      )
    }
    await screen.findByText(/pronto::sem-sessao/)

    expect(carregar).toHaveBeenCalledTimes(1)
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
