import { createContext, useContext, type Dispatch } from 'react'
import { paraMinutos, participacoesAbertas, type Noite } from './modelo'
import { reducer, type Acao } from './reducer'
import { noiteVazia, roteiro, roteiroCompleto, type Passo } from './roteiroInicial'

/**
 * Resolve os atalhos do roteiro.
 *
 * `AUTO:jogadorId` vira a participacao aberta daquele jogador, e `ULTIMA` vira
 * a movimentacao recem-criada. Sem isso o roteiro precisaria conhecer ids que
 * so existem depois que o reducer roda.
 */
function resolver(noite: Noite, acao: Acao): Acao {
  if ('participacaoId' in acao && acao.participacaoId.startsWith('AUTO:')) {
    const jogadorId = acao.participacaoId.slice(5)
    const participacao = participacoesAbertas(noite).find(
      (p) => p.jogadorId === jogadorId
    )
    return { ...acao, participacaoId: participacao?.id ?? acao.participacaoId }
  }
  if ('movimentacaoId' in acao && acao.movimentacaoId === 'ULTIMA') {
    const ultima = noite.movimentacoes[noite.movimentacoes.length - 1]
    return { ...acao, movimentacaoId: ultima?.id ?? acao.movimentacaoId }
  }
  return acao
}

/** Roda uma sequencia de passos pelo mesmo reducer das telas. */
function rodar(passos: Passo[]): Noite {
  let noite = noiteVazia
  for (const passo of passos) {
    noite = { ...noite, agora: paraMinutos(passo.emAs) }
    for (const acao of passo.acoes) {
      noite = reducer(noite, resolver(noite, acao))
    }
  }
  return { ...noite, aviso: null }
}

/** A noite ate as 21h47 — o estado em que a simulacao abre. */
export function montarNoiteInicial(): Noite {
  return rodar(roteiro)
}

/**
 * A noite depois dos `quantos` primeiros passos do roteiro completo.
 *
 * A apresentacao anda para tras reconstruindo do zero em vez de desfazer acao
 * por acao. O reducer e deterministico, entao reconstruir e sempre exato — e
 * desfazer exigiria uma acao inversa para cada regra, que e onde este tipo de
 * codigo costuma criar estados que o produto nao consegue produzir.
 */
export function montarNoiteAte(quantos: number): Noite {
  return rodar(roteiroCompleto.slice(0, Math.max(0, quantos)))
}

/**
 * As acoes da demonstracao, que nao existem no produto.
 *
 * Ficam separadas de `Acao` de proposito: o reducer do produto nao conhece
 * "pular para o passo 12", e nada que a exportacao leve deve conhecer.
 */
export type AcaoDemo = Acao | { tipo: 'ir-para-passo'; passo: number }

export function reducerComReinicio(noite: Noite, acao: AcaoDemo): Noite {
  if (acao.tipo === 'reiniciar') return montarNoiteInicial()
  if (acao.tipo === 'ir-para-passo') return montarNoiteAte(acao.passo)
  return reducer(noite, acao)
}

export interface Contexto {
  noite: Noite
  despachar: Dispatch<AcaoDemo>
}

export const SimulacaoContexto = createContext<Contexto | null>(null)

export function useSimulacao(): Contexto {
  const contexto = useContext(SimulacaoContexto)
  if (!contexto) {
    throw new Error('useSimulacao precisa estar dentro de <SimulacaoProvider>')
  }
  return contexto
}
