/**
 * Cria (ou troca a senha de) a conta de um operador.
 *
 *   npm run banco:operador -- --email anderson@clube.com --nome "Anderson"
 *
 * A senha NUNCA vem por argumento: `ps` mostra a linha de comando inteira para
 * qualquer usuário da máquina, e o histórico do shell guarda. Ela é digitada
 * sem eco, ou vem por `SENHA_OPERADOR` no ambiente para uso em automação.
 *
 * É o que substitui a criação manual pelo painel do fornecedor, e é também a
 * resposta ao R12 do PRD: sem conta, ninguém abre o app quando a noite começa.
 */
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import pg from 'pg'
import { gerarHash } from '../servidor/auth/senha'

const CLUBE_PADRAO = '11111111-1111-1111-1111-111111111111'

const args = new Map<string, string>()
for (let i = 2; i < process.argv.length; i += 2) {
  args.set(process.argv[i].replace(/^--/, ''), process.argv[i + 1] ?? '')
}

const email = args.get('email')
const nome = args.get('nome')
const clubeId = args.get('clube') ?? CLUBE_PADRAO

if (!email || !nome) {
  console.error('Uso: npm run banco:operador -- --email <email> --nome "<nome>" [--clube <uuid>]')
  process.exit(1)
}

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Falta DATABASE_URL.')
  process.exit(1)
}

const senha = await lerSenha()
if (senha.length < 8) {
  console.error('A senha precisa de pelo menos 8 caracteres.')
  process.exit(1)
}

const cliente = new pg.Client({
  connectionString: url,
  ssl:
    /localhost|127\.0\.0\.1/.test(url) || process.env.PGSSL === '0'
      ? undefined
      : { rejectUnauthorized: false },
})

await cliente.connect()

const hash = await gerarHash(senha)

const r = await cliente.query<{ id: string; nova: boolean }>(
  `insert into operador (clube_id, nome, email, senha_hash)
   values ($1, $2, $3, $4)
   on conflict (lower(btrim(email))) do update
     set senha_hash = excluded.senha_hash, nome = excluded.nome
   returning id, (xmax = 0) as nova`,
  [clubeId, nome, email, hash]
)

console.log(
  r.rows[0].nova
    ? `Operador criado: ${nome} <${email}>`
    : `Senha trocada: ${nome} <${email}>`
)
await cliente.end()

async function lerSenha(): Promise<string> {
  const doAmbiente = process.env.SENHA_OPERADOR
  if (doAmbiente) return doAmbiente

  if (!stdin.isTTY) {
    console.error('Sem terminal para digitar. Passe a senha em SENHA_OPERADOR.')
    process.exit(1)
  }

  const rl = createInterface({ input: stdin, output: stdout, terminal: true })
  // Sem eco: a senha não fica na tela nem por cima do ombro de ninguém.
  const original = (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput
  ;(rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = function (s) {
    if (s.includes('Senha')) original.call(this, s)
  }
  const s = await rl.question('Senha do operador: ')
  rl.close()
  stdout.write('\n')
  return s
}
