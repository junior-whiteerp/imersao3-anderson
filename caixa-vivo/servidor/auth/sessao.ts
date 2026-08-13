import { randomBytes } from 'node:crypto'
import { comoDono } from '../banco'
import { conferirSenha } from './senha'

export const COOKIE = 'caixa_vivo_sessao'

/**
 * Doze horas. É a duração de uma noite de clube com folga nas duas pontas —
 * o operador abre o caixa às 19h e fecha às 4h sem ser deslogado no meio.
 * Ataca de frente a R11 do PRD, que é a sessão cair no meio da noite.
 */
const HORAS = 12

export interface OperadorAutenticado {
  id: string
  nome: string
  clubeId: string
}

/**
 * Confere e-mail e senha e abre sessão.
 *
 * Roda como dono, sem RLS: descobrir quem é o operador acontece antes de
 * existir identidade, então não há `app.operador_id` para a política consultar.
 *
 * Devolve `null` tanto para e-mail inexistente quanto para senha errada, e o
 * hash falso mantém o tempo de resposta parecido nos dois casos — senão a
 * demora responderia "este e-mail existe" para quem estivesse medindo.
 */
export async function entrar(
  email: string,
  senha: string
): Promise<{ operador: OperadorAutenticado; token: string } | null> {
  return comoDono(async (c) => {
    const r = await c.query<{
      id: string
      nome: string
      clube_id: string
      senha_hash: string
    }>(
      `select id, nome, clube_id, senha_hash from operador
       where lower(btrim(email)) = lower(btrim($1))`,
      [email]
    )

    const linha = r.rows[0]
    const hash = linha?.senha_hash ?? HASH_FALSO
    const confere = await conferirSenha(senha, hash)
    if (!linha || !confere) return null

    const token = randomBytes(32).toString('base64url')
    await c.query(
      `insert into sessao_operador (token, operador_id, expira_em)
       values ($1, $2, now() + ($3 || ' hours')::interval)`,
      [token, linha.id, String(HORAS)]
    )

    // Sessão nova é bom momento para varrer as mortas: sem cron, sem serviço.
    await c.query('delete from sessao_operador where expira_em < now()')

    return { operador: { id: linha.id, nome: linha.nome, clubeId: linha.clube_id }, token }
  })
}

/** Quem é o dono deste token, se ele ainda vale. */
export async function resolver(token: string | undefined): Promise<OperadorAutenticado | null> {
  if (!token) return null
  return comoDono(async (c) => {
    const r = await c.query<{ id: string; nome: string; clube_id: string }>(
      `select o.id, o.nome, o.clube_id
         from sessao_operador s join operador o on o.id = s.operador_id
        where s.token = $1 and s.expira_em > now()`,
      [token]
    )
    const l = r.rows[0]
    return l ? { id: l.id, nome: l.nome, clubeId: l.clube_id } : null
  })
}

export async function sair(token: string | undefined): Promise<void> {
  if (!token) return
  await comoDono((c) => c.query('delete from sessao_operador where token = $1', [token]))
}

/**
 * Hash de uma senha que não é de ninguém.
 *
 * Serve só para gastar o mesmo tempo de scrypt quando o e-mail não existe.
 */
const HASH_FALSO =
  'scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=='
