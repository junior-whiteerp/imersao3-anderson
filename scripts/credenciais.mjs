/**
 * Escreve `.env` a partir do Supabase local que está rodando.
 *
 * As chaves do `supabase start` são fixas e públicas — é banco de
 * desenvolvimento em Docker, não produção. O `.env` fica fora do git assim
 * mesmo, para ninguém adquirir o hábito de versionar credencial.
 *
 * As de produção não saem daqui: elas vêm do painel do Supabase e vão para
 * `.env.local`, como diz o `.env.example`.
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

let bruto
try {
  bruto = execFileSync('supabase', ['status', '-o', 'json'], { encoding: 'utf8' })
} catch {
  console.error(
    'O Supabase local não está de pé. Rode `npm run banco:subir` antes.\n' +
      'Sem banco não há o que escrever no .env — e um .env com valor inventado ' +
      'faria o app subir mentindo.'
  )
  process.exit(1)
}

const s = JSON.parse(bruto)

writeFileSync(
  '.env',
  [
    '# Gerado por `npm run banco:credenciais`. Não versionado.',
    '# Supabase local — é para onde o `npm run dev` aponta.',
    `VITE_SUPABASE_URL=${s.API_URL}`,
    `VITE_SUPABASE_ANON_KEY=${s.ANON_KEY}`,
    '',
    '# Os testes de banco usam a chave de serviço de propósito: o que eles provam',
    '# são as CONSTRAINTS, não as políticas de RLS.',
    `SUPABASE_URL_TESTE=${s.API_URL}`,
    `SUPABASE_SERVICE_ROLE_TESTE=${s.SERVICE_ROLE_KEY}`,
    '',
  ].join('\n')
)

console.log('.env escrito a partir do Supabase local.')
