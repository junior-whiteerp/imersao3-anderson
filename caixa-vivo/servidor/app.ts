import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import Fastify, { type FastifyInstance } from 'fastify'
import cookie from '@fastify/cookie'
import estatico from '@fastify/static'
import { rotasDeAuth } from './rotas/auth'
import { rotasDaNoite } from './rotas/noite'
import { pool } from './banco'

const AQUI = dirname(fileURLToPath(import.meta.url))

/**
 * Monta o app sem escutar porta nenhuma.
 *
 * Separado de `index.ts` para o teste poder usar `app.inject()` — que exercita
 * o roteamento inteiro, middlewares incluídos, sem abrir socket. Foi assim que
 * o 403 na raiz apareceu: em desenvolvimento quem serve a tela é o Vite, então
 * a única forma de ver o bug era subir o servidor como produção sobe.
 */
export async function criarApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL ?? 'info' },
    // Atrás do proxy do provedor, é ele quem sabe se o cliente veio por https.
    trustProxy: true,
  })

  await app.register(cookie)
  await app.register(rotasDeAuth)
  await app.register(rotasDaNoite)

  /**
   * O React sai daqui mesmo.
   *
   * Um serviço só serve API e tela: sem CORS, sem segundo domínio, sem a
   * credencial do banco repetida em dois lugares.
   *
   * `index` fica no padrão de propósito: é ele que faz `GET /` entregar o
   * index.html. Com `index: false`, a raiz tentava listar o diretório e
   * devolvia 403 — as rotas internas funcionavam e só a porta de entrada
   * do app não abria.
   */
  const front = process.env.PASTA_DA_TELA ?? join(AQUI, '..', 'dist')
  await app.register(estatico, { root: front })

  app.get('/saude', async () => {
    await pool.query('select 1')
    return { ok: true }
  })

  /**
   * Rota que o servidor não conhece devolve o index, e quem decide o que
   * mostrar é o React. Menos `/api/`: ali um caminho errado é erro, não tela.
   */
  app.setNotFoundHandler(async (req, resp) => {
    if (req.url.startsWith('/api/')) {
      return resp.code(404).send({ erro: 'Rota não encontrada.' })
    }
    return resp.sendFile('index.html')
  })

  return app
}
