import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Noite } from '@/regras/modelo'
import type { Acao } from '@/regras/reducer'
import * as api from '@/dados/api'

type Estado = 'carregando' | 'pronto' | 'erro'

interface Contexto {
  noite: Noite
  estado: Estado
  erro: string | null
  recarregar: () => Promise<void>
  despachar: (acao: Acao) => Promise<void>
  /** Apaga a fala do app depois que ela foi lida. */
  limparAviso: () => void
}

const Ctx = createContext<Contexto | null>(null)

/** Uma noite sem nada. Não é dado de exemplo: é a ausência de dado. */
const NOITE_VAZIA = {
  agora: 0,
  sessao: null,
  sessoes: [],
  jogadores: [],
  participacoes: [],
  dealers: [],
  turnos: [],
  movimentacoes: [],
  checkpoints: [],
  furoOculto: 0,
  aviso: null,
  seq: 1,
} as unknown as Noite

/**
 * O clube e o operador saíram daqui.
 *
 * Antes o clube era uma constante fixa no código do cliente e o id do operador
 * vinha por prop. Agora os dois saem do cookie de sessão, no servidor — o
 * navegador não escolhe em nome de quem escreve.
 */
export function NoiteProvider({
  children,
  carregar = () => api.lerNoite(),
  despacharAcao = (acao: Acao) => api.despacharAcao(acao),
}: {
  children: ReactNode
  carregar?: () => Promise<Noite>
  despacharAcao?: (acao: Acao) => Promise<Noite>
}) {
  const [noite, setNoite] = useState<Noite>(NOITE_VAZIA)
  const [estado, setEstado] = useState<Estado>('carregando')
  const [erro, setErro] = useState<string | null>(null)

  /**
   * `carregar` chega como função nova a cada render — o valor padrão é uma
   * arrow criada na própria assinatura. Se `recarregar` dependesse dela, o
   * efeito abaixo dispararia a cada render, e cada carga provocaria o render
   * seguinte: o app ficaria relendo a noite inteira em laço, sem parar, contra
   * o banco. Guardar a função numa ref mantém `recarregar` estável e ainda usa
   * sempre a versão mais recente.
   */
  const carregarRef = useRef(carregar)
  carregarRef.current = carregar
  const despacharRef = useRef(despacharAcao)
  despacharRef.current = despacharAcao

  const recarregar = useCallback(async () => {
    setEstado('carregando')
    try {
      setNoite(await carregarRef.current())
      setErro(null)
      setEstado('pronto')
    } catch (e) {
      // R2 do PRD: não há modo offline. A queda aparece, não vira fila silenciosa.
      setErro(e instanceof Error ? e.message : 'Falha ao falar com o banco.')
      setEstado('erro')
    }
  }, [])

  useEffect(() => {
    void recarregar()
  }, [recarregar])

  async function despachar(acao: Acao) {
    try {
      setNoite(await despacharRef.current(acao))
      setErro(null)
      setEstado('pronto')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar.')
      setEstado('erro')
    }
  }

  /**
   * O aviso é memória, não registro da noite — quem o cria é o `reducer`, e
   * `aplicar` o carrega de volta à mão depois de recarregar do banco.
   *
   * Por isso apagá-lo é estado local, e não a ação `limpar-aviso` do reducer
   * como na prévia do Design OS: lá o despacho é instantâneo, aqui ele custaria
   * uma ida inteira ao Postgres (ler a noite, reduzir, gravar delta, reler) só
   * para tirar uma tarja da tela.
   */
  const limparAviso = useCallback(() => {
    setNoite((n) => (n.aviso === null ? n : { ...n, aviso: null }))
  }, [])

  return (
    <Ctx.Provider value={{ noite, estado, erro, recarregar, despachar, limparAviso }}>
      {children}
    </Ctx.Provider>
  )
}

export function useNoite(): Contexto {
  const c = useContext(Ctx)
  if (!c) throw new Error('useNoite precisa estar dentro de <NoiteProvider>')
  return c
}
