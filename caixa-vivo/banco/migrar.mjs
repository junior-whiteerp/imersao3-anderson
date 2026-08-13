// Aplica as migrations em ordem, uma vez cada.
//
// Substitui o `supabase db push`. Cada arquivo roda dentro de uma transação e
// fica anotado em `migracao` — rodar de novo não faz nada, o que torna seguro
// chamar isto no start do deploy.
//
//   node banco/migrar.mjs
//
// Lê DATABASE_URL do ambiente.

import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const AQUI = dirname(fileURLToPath(import.meta.url))
const PASTA = join(AQUI, 'migrations')

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Falta DATABASE_URL. Sem ela não há banco para migrar.')
  process.exit(1)
}

const cliente = new pg.Client({
  connectionString: url,
  ssl: precisaDeSsl(url) ? { rejectUnauthorized: false } : undefined,
})

function precisaDeSsl(u) {
  if (process.env.PGSSL === '0') return false
  return !/localhost|127\.0\.0\.1/.test(u)
}

await cliente.connect()

await cliente.query(`
  create table if not exists migracao (
    nome text primary key,
    aplicada_em timestamptz not null default now()
  )
`)

const jaAplicadas = new Set(
  (await cliente.query('select nome from migracao')).rows.map((r) => r.nome)
)

const arquivos = (await readdir(PASTA)).filter((f) => f.endsWith('.sql')).sort()

let aplicadas = 0
for (const arquivo of arquivos) {
  if (jaAplicadas.has(arquivo)) {
    console.log(`  · ${arquivo} (já aplicada)`)
    continue
  }
  const sql = await readFile(join(PASTA, arquivo), 'utf8')
  try {
    await cliente.query('begin')
    await cliente.query(sql)
    await cliente.query('insert into migracao (nome) values ($1)', [arquivo])
    await cliente.query('commit')
    console.log(`  ✓ ${arquivo}`)
    aplicadas++
  } catch (e) {
    await cliente.query('rollback')
    console.error(`  ✗ ${arquivo}\n${e.message}`)
    await cliente.end()
    process.exit(1)
  }
}

console.log(aplicadas === 0 ? 'Banco já estava em dia.' : `${aplicadas} migration(s) aplicada(s).`)
await cliente.end()
