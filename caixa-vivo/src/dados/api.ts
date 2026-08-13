import type { Noite } from '@/regras/modelo'
import type { Acao } from '@/regras/reducer'

/**
 * O único ponto do navegador que fala com o servidor.
 *
 * Antes deste arquivo, `src/dados/` carregava a noite e gravava o delta direto
 * no banco, com a chave que vinha no bundle. Agora ele só pede — quem carrega,
 * reduz e grava é o servidor (DEC-007), e a regra deixou de ser algo que o
 * cliente escolhe honrar.
 *
 * Caminhos relativos de propósito: em produção o mesmo processo serve a API e
 * a tela, e em desenvolvimento o Vite encaminha `/api` para a porta 3402. Nos
 * dois casos não há origem para configurar nem CORS para acertar.
 */

export interface OperadorSessao {
  id: string
  nome: string
}

export async function lerNoite(): Promise<Noite> {
  return pedir<Noite>('/api/noite')
}

export async function despacharAcao(acao: Acao): Promise<Noite> {
  return pedir<Noite>('/api/acao', { metodo: 'POST', corpo: acao })
}

export async function entrar(email: string, senha: string): Promise<OperadorSessao> {
  return pedir<OperadorSessao>('/api/entrar', { metodo: 'POST', corpo: { email, senha } })
}

export async function sair(): Promise<void> {
  await pedir<void>('/api/sair', { metodo: 'POST' })
}

/** O operador da sessão atual, ou `null` se não há sessão. */
export async function sessaoAtual(): Promise<OperadorSessao | null> {
  try {
    return await pedir<OperadorSessao>('/api/sessao')
  } catch (e) {
    if (e instanceof ErroDaApi && e.status === 401) return null
    throw e
  }
}

export class ErroDaApi extends Error {
  // Campo declarado e atribuído à mão: `erasableSyntaxOnly` recusa parâmetro
  // de construtor com modificador, porque isso não é apagável na compilação.
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ErroDaApi'
    this.status = status
  }
}

async function pedir<T>(
  caminho: string,
  opcoes: { metodo?: string; corpo?: unknown } = {}
): Promise<T> {
  const { metodo = 'GET', corpo } = opcoes

  let resposta: Response
  try {
    resposta = await fetch(caminho, {
      method: metodo,
      // O cookie de sessão é httpOnly: o JavaScript não o lê nem o escreve.
      // Ele viaja porque o navegador o anexa, e só para a própria origem.
      credentials: 'same-origin',
      headers: corpo === undefined ? undefined : { 'content-type': 'application/json' },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    })
  } catch {
    // R2 e R11 do PRD: não há modo offline. A queda aparece na tela, não vira
    // fila silenciosa que faz o operador achar que a noite está registrada.
    throw new ErroDaApi('Sem conexão com o servidor. Enquanto isso, use o papel.', 0)
  }

  if (resposta.status === 204) return undefined as T

  const texto = await resposta.text()
  const dado = texto ? seguroJson(texto) : null

  if (!resposta.ok) {
    const erro =
      dado && typeof dado === 'object' && 'erro' in dado && typeof dado.erro === 'string'
        ? dado.erro
        : `O servidor respondeu ${resposta.status}.`
    throw new ErroDaApi(erro, resposta.status)
  }

  return dado as T
}

function seguroJson(texto: string): unknown {
  try {
    return JSON.parse(texto)
  } catch {
    return null
  }
}
