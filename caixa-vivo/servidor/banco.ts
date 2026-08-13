import pg from 'pg'

/**
 * O pool de conexões.
 *
 * Sem DATABASE_URL isto explode no boot — de propósito, pela mesma razão que o
 * cliente antigo explodia sem credencial: um app que sobe sem banco fica com
 * cara de funcionando enquanto o caixa da noite não é registrado em lugar
 * nenhum.
 */
function url(): string {
  const u = process.env.DATABASE_URL
  if (!u) {
    throw new Error(
      'Falta DATABASE_URL. Em desenvolvimento: `docker compose up -d` e ' +
        'DATABASE_URL=postgres://caixa:caixa@localhost:3432/caixa_vivo'
    )
  }
  return u
}

/** Provedor gerenciado exige TLS; Postgres local não tem certificado. */
function ssl(u: string) {
  if (process.env.PGSSL === '0') return undefined
  return /localhost|127\.0\.0\.1/.test(u) ? undefined : { rejectUnauthorized: false }
}

export const pool = new pg.Pool({
  connectionString: url(),
  ssl: ssl(url()),
  max: 10,
  idleTimeoutMillis: 30_000,
})

export type Conexao = pg.PoolClient

/**
 * Uma transação com a identidade do operador ligada.
 *
 * `set local role caixa_app` é o que faz o RLS valer: dono de tabela ignora
 * política no Postgres, e `caixa_app` não é dono de nada. Ele também não tem
 * `delete` — a N13 deixa de ser promessa do código e vira privilégio do banco.
 *
 * Os dois `set local` morrem junto com a transação, então uma requisição nunca
 * vaza identidade para a seguinte, mesmo reusando a conexão do pool.
 */
export async function comOperador<T>(
  operadorId: string,
  fn: (c: Conexao) => Promise<T>
): Promise<T> {
  const c = await pool.connect()
  try {
    await c.query('begin')
    await c.query('set local role caixa_app')
    // set_config em vez de `set local app.operador_id = $1`: SET não aceita
    // parâmetro, e interpolar o uuid na string seria injeção esperando acontecer.
    await c.query('select set_config($1, $2, true)', ['app.operador_id', operadorId])
    const r = await fn(c)
    await c.query('commit')
    return r
  } catch (e) {
    await c.query('rollback').catch(() => {})
    throw e
  } finally {
    c.release()
  }
}

/**
 * Transação sem RLS, como dono.
 *
 * Só para autenticação: descobrir quem é o operador a partir do e-mail ou do
 * token de sessão acontece ANTES de existir identidade, então não há
 * `app.operador_id` para a política consultar. Toda consulta aqui é
 * parametrizada e devolve só a linha do dono da credencial apresentada.
 */
export async function comoDono<T>(fn: (c: Conexao) => Promise<T>): Promise<T> {
  const c = await pool.connect()
  try {
    await c.query('begin')
    const r = await fn(c)
    await c.query('commit')
    return r
  } catch (e) {
    await c.query('rollback').catch(() => {})
    throw e
  } finally {
    c.release()
  }
}
