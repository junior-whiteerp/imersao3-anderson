import { criarApp } from './app'
import { pool } from './banco'

const app = await criarApp()
const porta = Number(process.env.PORT ?? 3402)

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
