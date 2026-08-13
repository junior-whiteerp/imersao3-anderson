import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const derivar = promisify(scrypt) as (
  senha: string,
  sal: Buffer,
  tamanho: number,
  opcoes: { N: number; r: number; p: number; maxmem: number }
) => Promise<Buffer>

/**
 * Parâmetros do scrypt. N=16384 leva ~50 ms num laptop — caro o bastante para
 * inviabilizar força bruta, barato o bastante para um login não travar.
 * Eles vão gravados junto do hash, então subir o custo depois não invalida as
 * senhas que já existem.
 */
const N = 16384
const R = 8
const P = 1
const TAMANHO = 64
// 128 * N * r = 16 MB. A folga evita "memory limit exceeded" em imagem magra.
const MAXMEM = 64 * 1024 * 1024

/**
 * Por que scrypt do `node:crypto` e não bcrypt ou argon2: os dois exigem
 * compilação nativa, que quebra em imagem de deploy sem toolchain. Este vem
 * com o Node e é resistente a hardware dedicado por consumir memória.
 *
 * Formato: `scrypt$N$r$p$sal$hash`, os dois últimos em base64.
 */
export async function gerarHash(senha: string): Promise<string> {
  const sal = randomBytes(16)
  const chave = await derivar(normalizar(senha), sal, TAMANHO, { N, r: R, p: P, maxmem: MAXMEM })
  return ['scrypt', N, R, P, sal.toString('base64'), chave.toString('base64')].join('$')
}

export async function conferirSenha(senha: string, hash: string): Promise<boolean> {
  const partes = hash.split('$')
  if (partes.length !== 6 || partes[0] !== 'scrypt') return false

  const [, n, r, p, salB64, chaveB64] = partes
  const sal = Buffer.from(salB64, 'base64')
  const esperado = Buffer.from(chaveB64, 'base64')
  if (esperado.length === 0) return false

  const calculado = await derivar(normalizar(senha), sal, esperado.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: MAXMEM,
  })

  // timingSafeEqual exige tamanhos iguais e, mais importante, não devolve cedo
  // no primeiro byte diferente — comparar com === vazaria o hash byte a byte.
  return calculado.length === esperado.length && timingSafeEqual(calculado, esperado)
}

/**
 * Acento composto e acento pré-composto são a mesma letra para quem digita e
 * bytes diferentes para o scrypt. Sem normalizar, a senha "José" cadastrada num
 * teclado entra e no outro não.
 */
function normalizar(senha: string): string {
  return senha.normalize('NFKC')
}
