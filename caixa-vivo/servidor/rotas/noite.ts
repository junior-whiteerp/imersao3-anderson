import type { FastifyInstance } from 'fastify'
import { aplicar, lerNoite } from '../dados/aplicar'
import { validarAcao } from '../dados/validarAcao'
import { exigirOperador } from './auth'

export async function rotasDaNoite(app: FastifyInstance) {
  app.get('/api/noite', async (req, resp) => {
    const op = await exigirOperador(req, resp)
    if (!op) return

    try {
      return await lerNoite(op.clubeId, op.id)
    } catch (e) {
      req.log.error(e)
      return resp.code(500).send({ erro: mensagem(e, 'Falhou ao ler o caixa.') })
    }
  })

  app.post('/api/acao', async (req, resp) => {
    const op = await exigirOperador(req, resp)
    if (!op) return

    const v = validarAcao(req.body)
    if (!v.ok) return resp.code(400).send({ erro: v.motivo })

    try {
      return await aplicar(op.clubeId, op.id, v.acao)
    } catch (e) {
      // A recusa de regra NÃO passa por aqui: o reducer devolve a noite com um
      // `aviso` e a resposta é 200. O que cai aqui é falha de banco de verdade.
      req.log.error(e)
      return resp.code(500).send({ erro: mensagem(e, 'Não foi possível salvar.') })
    }
  })
}

/**
 * O texto do erro do Postgres sobe para a tela.
 *
 * É de propósito: as mensagens de `persistirDelta` já vêm escritas para o
 * operador ("Não foi possível salvar a entrada do jogador na mesa: ..."), e o
 * app não tem modo offline — quando falha, quem está no clube precisa saber o
 * que aconteceu para decidir se continua no papel.
 */
function mensagem(e: unknown, padrao: string): string {
  return e instanceof Error && e.message ? e.message : padrao
}
