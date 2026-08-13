import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { FastifyInstance } from 'fastify'
import { criarApp } from '../servidor/app'
import { limparBanco, sql, uma, CLUBE_TESTE } from './banco'
import { gerarHash } from '../servidor/auth/senha'

const EMAIL = 'servidor@clube.local'
const SENHA = 'senha-do-servidor-1'

let app: FastifyInstance

beforeAll(async () => {
  // Uma "tela" de mentira: o teste prova o roteamento, não o React.
  const pasta = mkdtempSync(join(tmpdir(), 'caixa-tela-'))
  writeFileSync(join(pasta, 'index.html'), '<!doctype html><title>Caixa Vivo</title>')
  writeFileSync(join(pasta, 'app.js'), 'console.log(1)')
  process.env.PASTA_DA_TELA = pasta

  app = await criarApp()
  await app.ready()
})

afterAll(async () => {
  await app.close()
  delete process.env.PASTA_DA_TELA
})

beforeEach(async () => {
  await limparBanco()
  await sql('delete from sessao_operador')
  await sql(
    `insert into operador (clube_id, nome, email, senha_hash) values ($1, 'Servidor', $2, $3)
     on conflict (lower(btrim(email))) do update set senha_hash = excluded.senha_hash`,
    [CLUBE_TESTE, EMAIL, await gerarHash(SENHA)]
  )
})

async function entrar(): Promise<string> {
  const r = await app.inject({
    method: 'POST',
    url: '/api/entrar',
    payload: { email: EMAIL, senha: SENHA },
  })
  return r.headers['set-cookie']!.toString().split(';')[0]
}

describe('o servidor serve a tela', () => {
  /**
   * A regressão que motivou este arquivo.
   *
   * Com `index: false` no @fastify/static, `GET /` tentava listar o diretório e
   * devolvia 403. As rotas internas continuavam funcionando, então nada em
   * desenvolvimento acusava — lá quem serve a tela é o Vite. O app subia em
   * produção com a porta de entrada fechada.
   */
  it('a raiz entrega o index — não 403', async () => {
    const r = await app.inject({ method: 'GET', url: '/' })
    expect(r.statusCode).toBe(200)
    expect(r.body).toContain('Caixa Vivo')
  })

  it('rota do react-router cai no index, para recarregar não dar 404', async () => {
    for (const url of ['/mesa', '/fichas', '/caixa/qualquer/coisa']) {
      const r = await app.inject({ method: 'GET', url })
      expect(r.statusCode).toBe(200)
      expect(r.body).toContain('Caixa Vivo')
    }
  })

  it('arquivo que existe é servido como arquivo', async () => {
    const r = await app.inject({ method: 'GET', url: '/app.js' })
    expect(r.statusCode).toBe(200)
    expect(r.body).toContain('console.log')
  })

  it('caminho de API que não existe é 404, nunca a tela', async () => {
    const r = await app.inject({ method: 'GET', url: '/api/nao-existe' })
    expect(r.statusCode).toBe(404)
    expect(r.body).not.toContain('Caixa Vivo')
  })

  it('a saúde responde, e ela toca o banco de verdade', async () => {
    const r = await app.inject({ method: 'GET', url: '/saude' })
    expect(r.statusCode).toBe(200)
    expect(r.json()).toEqual({ ok: true })
  })
})

describe('o porteiro da API', () => {
  it('sem sessão, ler a noite é 401', async () => {
    expect((await app.inject({ method: 'GET', url: '/api/noite' })).statusCode).toBe(401)
  })

  it('sem sessão, despachar ação é 401 — mesmo com ação válida', async () => {
    const r = await app.inject({
      method: 'POST',
      url: '/api/acao',
      payload: { tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 20000 },
    })
    expect(r.statusCode).toBe(401)
    expect(await sql('select * from sessao')).toHaveLength(0)
  })

  it('o cookie de sessão é httpOnly e SameSite=Lax', async () => {
    const r = await app.inject({
      method: 'POST',
      url: '/api/entrar',
      payload: { email: EMAIL, senha: SENHA },
    })
    const cookie = r.headers['set-cookie']!.toString()
    expect(cookie).toMatch(/HttpOnly/i)
    expect(cookie).toMatch(/SameSite=Lax/i)
  })

  it('com sessão, a noite vem', async () => {
    const cookie = await entrar()
    const r = await app.inject({ method: 'GET', url: '/api/noite', headers: { cookie } })
    expect(r.statusCode).toBe(200)
    expect(r.json().sessao).toBeNull()
  })

  it.each(['reiniciar', 'injetar-furo', 'avancar-tempo'])(
    'recusa a ferramenta de simulação "%s" com 400, mesmo autenticado',
    async (tipo) => {
      const cookie = await entrar()
      const r = await app.inject({
        method: 'POST',
        url: '/api/acao',
        headers: { cookie },
        payload: { tipo, valor: 99999, minutos: 60 },
      })
      expect(r.statusCode).toBe(400)
    }
  )

  it('a recusa de regra volta 200 com aviso — não é erro de HTTP', async () => {
    const cookie = await entrar()
    const abrir = () =>
      app.inject({
        method: 'POST',
        url: '/api/acao',
        headers: { cookie },
        payload: { tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 20000 },
      })

    expect((await abrir()).statusCode).toBe(200)
    const segunda = await abrir()
    expect(segunda.statusCode).toBe(200)
    expect(segunda.json().aviso).toMatch(/já existe uma sessão aberta/i)
    expect(await sql('select * from sessao')).toHaveLength(1)
  })

  it('sair invalida a sessão na hora', async () => {
    const cookie = await entrar()
    await app.inject({ method: 'POST', url: '/api/sair', headers: { cookie } })
    expect(
      (await app.inject({ method: 'GET', url: '/api/noite', headers: { cookie } })).statusCode
    ).toBe(401)
  })

  it('quem lançou fica gravado — vem da sessão, não do corpo do pedido', async () => {
    const cookie = await entrar()
    const op = await uma<{ id: string }>(
      'select id from operador where lower(btrim(email)) = $1',
      [EMAIL]
    )

    await app.inject({
      method: 'POST',
      url: '/api/acao',
      headers: { cookie },
      payload: { tipo: 'abrir-sessao', clube: 'Clube Paris', caixaInicial: 20000 },
    })
    const dealer = await uma<{ id: string }>('select id from dealer limit 1')
    const comTurno = await app.inject({
      method: 'POST',
      url: '/api/acao',
      headers: { cookie },
      payload: { tipo: 'abrir-turno', dealerId: dealer.id },
    })

    // A hora vem da noite, não de um número fixo: o turno começa no relógio de
    // verdade, e um minuto anterior a ele cairia fora da janela (N3).
    const agora = comTurno.json().agora
    const comRake = await app.inject({
      method: 'POST',
      url: '/api/acao',
      headers: { cookie },
      payload: { tipo: 'lancar-rake', valor: 180, horaOcorrencia: agora },
    })
    expect(comRake.json().movimentacoes.filter((m: { tipo: string }) => m.tipo === 'rake')).toHaveLength(1)

    const m = await uma<{ lancado_por: string }>(
      "select lancado_por from movimentacao where tipo = 'rake'"
    )
    expect(m.lancado_por).toBe(op.id)
  })
})
