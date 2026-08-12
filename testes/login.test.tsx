import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Login } from '@/shell/components/Login'

describe('Login', () => {
  it('não carrega mais senha nenhuma no código', async () => {
    const fonte = await import('@/shell/components/Login?raw')
    expect(fonte.default).not.toMatch(/3129/)
    expect(fonte.default).not.toMatch(/CREDENCIAL_DA_DEMO/)
  })

  it('mostra o erro real quando a autenticação recusa', async () => {
    const entrar = vi.fn().mockRejectedValue(new Error('Invalid login credentials'))
    render(<Login onEntrar={entrar} />)

    await userEvent.type(screen.getByLabelText(/operador/i), 'anderson@clube.com')
    // `/senha/i` sozinho casaria também com o botão "Mostrar a senha".
    await userEvent.type(screen.getByLabelText(/^senha$/i), 'errada')
    await userEvent.click(screen.getByRole('button', { name: /entrar no caixa/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid login credentials/i)
  })
})
