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
import { cliente } from '@/dados/supabase'
import { carregarNoite } from '@/dados/carregarNoite'
import { aplicar } from '@/dados/aplicar'

const CLUBE = '11111111-1111-1111-1111-111111111111'

type Estado = 'carregando' | 'pronto' | 'erro'

interface Contexto {
  noite: Noite
  estado: Estado
  erro: string | null
  recarregar: () => Promise<void>
  despachar: (acao: Acao) => Promise<void>
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

export function NoiteProvider({
  children,
  operadorId = null,
  carregar = () => carregarNoite(cliente, CLUBE),
}: {
  children: ReactNode
  operadorId?: string | null
  carregar?: () => Promise<Noite>
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
      setNoite(await aplicar(cliente, CLUBE, operadorId, acao))
      setErro(null)
      setEstado('pronto')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar.')
      setEstado('erro')
    }
  }

  return (
    <Ctx.Provider value={{ noite, estado, erro, recarregar, despachar }}>{children}</Ctx.Provider>
  )
}

export function useNoite(): Contexto {
  const c = useContext(Ctx)
  if (!c) throw new Error('useNoite precisa estar dentro de <NoiteProvider>')
  return c
}
