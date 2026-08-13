import type { ReactNode } from 'react'
import { AppShell } from './AppShell'
import { NAVEGACAO_PADRAO } from './navigation'
import type { CaixaStatus } from './CaixaStatusBar'

/**
 * Envolve o desenho de uma secao com o shell, para visualizacao no Design OS.
 *
 * O Design OS renderiza `<ShellWrapper>{tela}</ShellWrapper>` sem passar nada.
 * Sem este arquivo ele cairia direto no AppShell vazio, e o shell apareceria
 * sem estado, sem icones e sem operador — o que nao representa o produto.
 *
 * ⚠️ Isto e um invólucro de previa. Ele traz dados de exemplo embutidos e le a
 * URL do Design OS para saber qual aba destacar. Na exportacao, use `AppShell`
 * direto, alimentado pelo estado real da aplicacao.
 */

/**
 * O estado mais comum de uma noite: rake na mesa, diferenca esperada.
 *
 * O numero precisa bater com o `data.json` das secoes. Ele apareceu em 320 e o
 * painel em 5.480 na mesma imagem, e a incoerencia salta na captura — quem
 * olha a tela nao sabe que sao dois arquivos de amostra diferentes.
 */
const STATUS_EXEMPLO: CaixaStatus = {
  estado: 'neutro',
  hora: '21h47',
  turno: 3,
  dealer: 'João',
  jogadores: 5,
  rotulo: 'Fichas em jogo',
  mensagem: 'Rake não declarado desde 21h40',
  valor: 'R$ 5.480',
}

/** Liga o id da secao no Design OS ao caminho da aba correspondente. */
const SECAO_PARA_ABA: Record<string, string> = {
  'painel-da-noite': '/painel',
  'sessao-e-caixa': '/sessao',
  'jogadores-e-mesa': '/mesa',
  fichas: '/fichas',
  'turnos-e-rake': '/rake',
  'conciliacao-e-relatorio': '/caixa',
}

function abaAtiva(): string | null {
  if (typeof window === 'undefined') return null
  const encontrado = window.location.pathname.match(/\/sections\/([^/]+)/)
  return encontrado ? (SECAO_PARA_ABA[encontrado[1]] ?? null) : null
}

export interface ShellWrapperProps {
  children?: ReactNode
}

export function ShellWrapper({ children }: ShellWrapperProps) {
  const ativa = abaAtiva()

  const itens = NAVEGACAO_PADRAO.map((item) => ({
    ...item,
    isActive: item.href === ativa,
  }))

  return (
    <AppShell
      navigationItems={itens}
      user={{ name: 'Anderson Paris' }}
      status={STATUS_EXEMPLO}
    >
      {children}
    </AppShell>
  )
}

export default ShellWrapper
