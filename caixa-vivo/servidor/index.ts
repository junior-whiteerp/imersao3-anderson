import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import estatico from '@fastify/static'
import { rotasDeAuth } from './rotas/auth'
import { rotasDaNoite } from './rotas/noite'
import { pool } from './banco'

const AQUI = dirname(fileURLToPath(import.meta.url))
// O bundle vai para dist-servidor/, irmão de dist/.
const FRONT = join(AQUI, '..', 'dist')

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
 * Um serviço só serve API e tela: sem CORS, sem segundo domínio, sem a chave
 * do banco repetida em dois lugares. Para um app de um operador, CDN separado
 * não compra nada e custa configuração.
 */
await app.register(estatico, { root: FRONT, index: false })

app.get('/saude', async () => {
  await pool.query('select 1')
  return { ok: true }
})

/**
 * Rota que o servidor não conhece devolve o index, e quem decide o que mostrar
 * é o React. Menos `/api/`: ali um caminho errado é erro, não tela.
 */
app.setNotFoundHandler(async (req, resp) => {
  if (req.url.startsWith('/api/')) {
    return resp.code(404).send({ erro: 'Rota não encontrada.' })
  }
  return resp.sendFile('index.html')
})

const porta = Number(process.env.PORT ?? 3400)

try {
  await app.listen({ port: porta, host: '0.0.0.0' })
} catch (e) {
  app.log.error(e)
  process.exit(1)
}

for (const sinal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sinal, () => {
    void (async () => {
      await app.close()
      await pool.end()
      process.exit(0)
    })()
  })
}
