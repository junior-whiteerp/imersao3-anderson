import { describe, it, expect, beforeEach } from 'vitest'
import { limparBanco, sql, uma, CLUBE_TESTE } from './banco'
import { entrar, resolver, sair } from '../servidor/auth/sessao'
import { gerarHash } from '../servidor/auth/senha'

const EMAIL = 'operador.sessao@clube.local'
const SENHA = 'senha-de-teste-123'

async function criarOperador() {
  const hash = await gerarHash(SENHA)
  return uma<{ id: string }>(
    `insert into operador (clube_id, nome, email, senha_hash) values ($1, 'Sessão', $2, $3)
     on conflict (lower(btrim(email))) do update set senha_hash = excluded.senha_hash
     returning id`,
    [CLUBE_TESTE, EMAIL, hash]
  )
}

describe('sessão do operador', () => {
  beforeEach(async () => {
    await limparBanco()
    await sql('delete from sessao_operador')
  })

  it('entra com a senha certa e devolve o clube junto', async () => {
    const op = await criarOperador()
    const r = await entrar(EMAIL, SENHA)

    expect(r).not.toBeNull()
    expect(r!.operador.id).toBe(op.id)
    expect(r!.operador.clubeId).toBe(CLUBE_TESTE)
    expect(r!.token.length).toBeGreaterThan(20)
  })

  it('recusa a senha errada', async () => {
    await criarOperador()
    expect(await entrar(EMAIL, 'errada')).toBeNull()
  })

  it('recusa e-mail que não existe — sem dizer que não existe', async () => {
    expect(await entrar('ninguem@clube.local', SENHA)).toBeNull()
  })

  it('não diferencia maiúsculas nem espaços no e-mail', async () => {
    await criarOperador()
    expect(await entrar(`  ${EMAIL.toUpperCase()}  `, SENHA)).not.toBeNull()
  })

  it('resolve o token para o dono dele', async () => {
    const op = await criarOperador()
    const r = await entrar(EMAIL, SENHA)
    const achado = await resolver(r!.token)
    expect(achado?.id).toBe(op.id)
  })

  it('não resolve token inventado nem ausente', async () => {
    expect(await resolver('token-que-eu-inventei')).toBeNull()
    expect(await resolver(undefined)).toBeNull()
  })

  it('sair invalida o token na hora', async () => {
    await criarOperador()
    const r = await entrar(EMAIL, SENHA)
    await sair(r!.token)
    expect(await resolver(r!.token)).toBeNull()
  })

  it('token vencido não resolve — e é varrido no login seguinte', async () => {
    await criarOperador()
    const r = await entrar(EMAIL, SENHA)

    // Empurra a validade para o passado, como se a noite tivesse acabado.
    await sql(`update sessao_operador set expira_em = now() - interval '1 minute' where token = $1`, [
      r!.token,
    ])
    expect(await resolver(r!.token)).toBeNull()

    // O próximo login limpa as mortas: sem cron, sem serviço de fundo.
    await entrar(EMAIL, SENHA)
    const sobrou = await sql('select token from sessao_operador where token = $1', [r!.token])
    expect(sobrou).toHaveLength(0)
  })

  it('dois logins geram tokens diferentes, e os dois valem', async () => {
    await criarOperador()
    const a = await entrar(EMAIL, SENHA)
    const b = await entrar(EMAIL, SENHA)
    expect(a!.token).not.toBe(b!.token)
    expect(await resolver(a!.token)).not.toBeNull()
    expect(await resolver(b!.token)).not.toBeNull()
  })
})
