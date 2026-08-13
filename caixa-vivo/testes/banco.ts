import pg from 'pg'

export const CLUBE_TESTE = '11111111-1111-1111-1111-111111111111'
export const DEALER_JOAO = '22222222-2222-2222-2222-222222222221'
export const DEALER_MARCOS = '22222222-2222-2222-2222-222222222222'
export const OPERADOR_TESTE = '33333333-3333-3333-3333-333333333333'

/**
 * Pool dos testes, conectado como DONO do banco.
 *
 * Dono ignora RLS no Postgres, e isso é o que queremos aqui: o que estes
 * arquivos provam são as CONSTRAINTS — chaves, índices parciais, `check`. As
 * políticas são exercidas pelo caminho de verdade, quando o teste chama
 * `aplicar`, que abre a transação com `set local role caixa_app`.
 *
 * É também o único jeito de `limparBanco` funcionar: `caixa_app` não tem
 * `delete`, de propósito (N13).
 */
const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ?? 'postgres://caixa:caixa@localhost:3432/caixa_vivo',
  max: 4,
})

export type ConexaoDeTeste = pg.PoolClient

/** Uma consulta solta. Devolve as linhas. */
export async function sql<T extends pg.QueryResultRow = pg.QueryResultRow>(
  texto: string,
  params: unknown[] = []
): Promise<T[]> {
  const r = await pool.query<T>(texto, params)
  return r.rows
}

/** Uma linha só. Estoura se vierem zero — o teste quer saber na hora. */
export async function uma<T extends pg.QueryResultRow = pg.QueryResultRow>(
  texto: string,
  params: unknown[] = []
): Promise<T> {
  const linhas = await sql<T>(texto, params)
  if (linhas.length === 0) throw new Error(`Nenhuma linha voltou de: ${texto}`)
  return linhas[0]
}

/** Uma conexão do pool, para quem precisa passar `Conexao` adiante. */
export async function comConexao<T>(fn: (c: ConexaoDeTeste) => Promise<T>): Promise<T> {
  const c = await pool.connect()
  try {
    return await fn(c)
  } finally {
    c.release()
  }
}

/**
 * Zera a noite e garante o piso: clube, dealers e o operador dos testes.
 *
 * `clube`, `dealer` e `operador` não são apagados — eles são o cenário, não o
 * que está sendo testado, e recriá-los a cada teste custaria mais que mantê-los.
 */
export async function limparBanco(): Promise<void> {
  // Ordem por dependência.
  await sql(
    'delete from checkpoint; delete from movimentacao; delete from participacao; ' +
      'delete from turno; delete from sessao; delete from jogador'
  )
  await garantirBase()
}

export async function garantirBase(): Promise<void> {
  await sql(
    `insert into clube (id, nome, percentual_rake_dealer)
     values ($1, 'Clube Paris', 0) on conflict (id) do nothing`,
    [CLUBE_TESTE]
  )
  await sql(
    `insert into dealer (id, clube_id, nome) values
       ($1, $4, 'João Ribeiro'), ($2, $4, 'Marcos Lima'), ($3, $4, 'Cris Andrade')
     on conflict (id) do nothing`,
    [DEALER_JOAO, DEALER_MARCOS, '22222222-2222-2222-2222-222222222223', CLUBE_TESTE]
  )
  await sql(
    `insert into operador (id, clube_id, nome, email, senha_hash)
     values ($1, $2, 'Operador de Teste', 'teste@clube.local', 'scrypt$0$0$0$x$x')
     on conflict (id) do nothing`,
    [OPERADOR_TESTE, CLUBE_TESTE]
  )
}

export async function fecharPool(): Promise<void> {
  await pool.end()
}
