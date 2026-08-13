import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { COOKIE, entrar, resolver, sair, type OperadorAutenticado } from '../auth/sessao'

const producao = process.env.NODE_ENV === 'production'

/**
 * Quem está falando, ou `null`.
 *
 * Usada pelas rotas de dados como porteiro. Fica aqui, junto do login, para o
 * formato do cookie ter um dono só.
 */
export async function operadorDaRequisicao(
  req: FastifyRequest
): Promise<OperadorAutenticado | null> {
  return resolver(req.cookies[COOKIE])
}

/** Responde 401 e devolve `null` quando não há sessão. */
export async function exigirOperador(
  req: FastifyRequest,
  resp: FastifyReply
): Promise<OperadorAutenticado | null> {
  const op = await operadorDaRequisicao(req)
  if (!op) {
    await resp.code(401).send({ erro: 'Faça login para continuar.' })
    return null
  }
  return op
}

export async function rotasDeAuth(app: FastifyInstance) {
  app.post('/api/entrar', async (req, resp) => {
    const corpo = req.body as { email?: unknown; senha?: unknown } | null
    const email = typeof corpo?.email === 'string' ? corpo.email : ''
    const senha = typeof corpo?.senha === 'string' ? corpo.senha : ''

    if (!email.trim() || !senha) {
      return resp.code(400).send({ erro: 'Informe e-mail e senha.' })
    }

    const r = await entrar(email, senha)
    if (!r) {
      // Uma frase só para e-mail errado e senha errada. Dizer qual dos dois
      // falhou entrega ao atacante a lista de quem tem conta.
      return resp.code(401).send({ erro: 'E-mail ou senha não confere.' })
    }

    resp.setCookie(COOKIE, r.token, {
      httpOnly: true, // JavaScript não alcança — um XSS não leva a sessão embora
      secure: producao, // em http local o cookie precisa viajar sem TLS
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 60 * 60,
    })
    return { id: r.operador.id, nome: r.operador.nome }
  })

  app.post('/api/sair', async (req, resp) => {
    await sair(req.cookies[COOKIE])
    resp.clearCookie(COOKIE, { path: '/' })
    return resp.code(204).send()
  })

  app.get('/api/sessao', async (req, resp) => {
    const op = await operadorDaRequisicao(req)
    if (!op) return resp.code(401).send({ erro: 'Sem sessão.' })
    return { id: op.id, nome: op.nome }
  })
}
