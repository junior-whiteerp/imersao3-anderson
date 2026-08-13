// Insere o clube e os dealers de partida. Rodar de novo não duplica nada.
//
//   node banco/semear.mjs

import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const AQUI = dirname(fileURLToPath(import.meta.url))

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Falta DATABASE_URL.')
  process.exit(1)
}

const cliente = new pg.Client({
  connectionString: url,
  ssl: /localhost|127\.0\.0\.1/.test(url) || process.env.PGSSL === '0'
    ? undefined
    : { rejectUnauthorized: false },
})

await cliente.connect()
await cliente.query(await readFile(join(AQUI, 'seed.sql'), 'utf8'))
const { rows } = await cliente.query(
  'select (select count(*) from clube) as clubes, (select count(*) from dealer) as dealers'
)
console.log(`Clubes: ${rows[0].clubes} · Dealers: ${rows[0].dealers}`)
await cliente.end()
