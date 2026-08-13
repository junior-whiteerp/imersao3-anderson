import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { AppShell } from '@/shell/components/AppShell'
import { Login } from '@/shell/components/Login'
import { NAVEGACAO_PADRAO } from '@/shell/components/navigation'
import { Apresentacao, TOTAL_DE_PASSOS, capituloDe } from './Apresentacao'
import { PainelSimulacao } from './PainelSimulacao'
import { SimulacaoProvider } from './estado'
import { useSimulacao } from './contexto'
import { CLUBE } from './roteiroInicial'
import { statusDaFaixa } from './vistas'
import { CaixaConectada } from './telas/CaixaConectada'
import { FichasConectada } from './telas/FichasConectada'
import { MesaAoVivoConectada } from './telas/MesaAoVivoConectada'
import { MesaConectada } from './telas/MesaConectada'
import { PainelConectado } from './telas/PainelConectado'
import { RakeConectada } from './telas/RakeConectada'
import { SessaoConectada } from './telas/SessaoConectada'

/** Quanto cada capítulo fica na tela no modo automático. */
const SEGUNDOS_POR_CAPITULO = 9

/** O aviso que o app acabou de dar. Some sozinho, mas nunca engole um erro. */
function Aviso() {
  const { noite, despachar } = useSimulacao()

  useEffect(() => {
    if (!noite.aviso) return
    const id = setTimeout(() => despachar({ tipo: 'limpar-aviso' }), 6000)
    return () => clearTimeout(id)
  }, [noite.aviso, despachar])

  if (!noite.aviso) return null

  return (
    // Fica no topo, logo abaixo da faixa: o rodape ja e do painel de simulacao
    // e das abas, e dois elementos fixos brigando na mesma borda escondem um ao
    // outro. Aqui ele tambem nasce perto de onde o operador acabou de tocar.
    <div
      role="status"
      className="cv-panel cv-rise fixed inset-x-3 top-[120px] z-[60] mx-auto flex max-w-md items-start gap-3 rounded-2xl p-3.5 backdrop-blur-xl md:top-[80px] md:right-3 md:left-auto md:mx-0"
    >
      <span
        className="cv-live-text cv-chip-rail w-[3px] shrink-0 self-stretch rounded-full"
        aria-hidden="true"
      />
      <p className="cv-text flex-1 text-[12.5px] leading-snug">{noite.aviso}</p>
      <button
        type="button"
        onClick={() => despachar({ tipo: 'limpar-aviso' })}
        aria-label="Fechar aviso"
        className="cv-text-soft hover:cv-text shrink-0 rounded p-0.5 transition-colors"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

function Conteudo({ operador, onSair }: { operador: string; onSair: () => void }) {
  const { noite, despachar } = useSimulacao()
  // O painel e a tela de descanso: e nela que o app fica aberto entre um
  // lancamento e outro, e e ela que responde "a noite esta fechando?".
  const [rota, setRota] = useState('/painel')
  const [participacaoId, setParticipacaoId] = useState<string | null>(null)

  // `null` = apresentacao desligada. Ela vive aqui, e nao no reducer, porque e
  // chrome de demonstracao: o produto exportado nao leva nada disto.
  const [passo, setPasso] = useState<number | null>(null)
  const [tocando, setTocando] = useState(false)

  // Cada mudanca de capitulo reconstroi a noite do zero ate ali e leva o olho
  // para a tela daquele momento. Reconstruir e o que garante que a apresentacao
  // nunca mostre um estado que o app nao conseguiria produzir.
  useEffect(() => {
    if (passo === null) return
    despachar({ tipo: 'ir-para-passo', passo })
    setParticipacaoId(null)
    setRota(capituloDe(passo).rota)
  }, [passo, despachar])

  useEffect(() => {
    if (passo === null || !tocando) return
    if (passo >= TOTAL_DE_PASSOS - 1) {
      setTocando(false)
      return
    }
    const id = setTimeout(() => setPasso((p) => (p === null ? p : p + 1)), SEGUNDOS_POR_CAPITULO * 1000)
    return () => clearTimeout(id)
  }, [passo, tocando])

  function comecarApresentacao() {
    setPasso(0)
    setTocando(true)
  }

  function sairDaApresentacao() {
    setTocando(false)
    setPasso(null)
    despachar({ tipo: 'reiniciar' })
    setRota('/painel')
  }

  const itens = NAVEGACAO_PADRAO.map((item) => ({
    ...item,
    isActive: item.href === rota,
  }))

  const apresentando = passo !== null

  return (
    <AppShell
      navigationItems={itens}
      user={{ name: operador }}
      status={statusDaFaixa(noite)}
      onNavigate={setRota}
      onStatusClick={() => setRota('/caixa')}
      // O shell e dono do proprio tema (`data-cv-tema`). Nao mexemos na classe
      // `.dark` do documento: ela pertence ao Design OS, que a reaplica sozinho.
      onEndSession={() => setRota('/sessao')}
      onLogout={onSair}
    >
      {rota === '/painel' ? (
        <PainelConectado
          onAbrirCaixa={() => setRota('/caixa')}
          onAbrirSessao={() => setRota('/sessao')}
          onAbrirJogador={(id) => {
            setParticipacaoId(id)
            setRota('/fichas')
          }}
        />
      ) : null}
      {rota === '/sessao' ? (
        <SessaoConectada onVerRelatorio={() => setRota('/caixa')} />
      ) : null}
      {rota === '/mesa' ? (
        <MesaConectada
          onAbrirJogador={(id) => {
            setParticipacaoId(id)
            setRota('/fichas')
          }}
        />
      ) : null}
      {rota === '/ao-vivo' ? (
        <MesaAoVivoConectada
          onAbrirJogador={(id) => {
            setParticipacaoId(id)
            setRota('/fichas')
          }}
        />
      ) : null}
      {rota === '/fichas' ? (
        <FichasConectada
          participacaoId={participacaoId}
          onSelecionar={setParticipacaoId}
        />
      ) : null}
      {rota === '/rake' ? <RakeConectada /> : null}
      {rota === '/caixa' ? <CaixaConectada /> : null}

      {/* Espaco para a barra de baixo nao cobrir o fim do conteudo. */}
      <div className={apresentando ? 'h-52' : 'h-24'} aria-hidden="true" />

      <Aviso />

      {/* Os dois nunca aparecem juntos: brigariam pela mesma borda da tela. */}
      {apresentando ? (
        <Apresentacao
          passo={passo}
          tocando={tocando}
          onIr={(p) => {
            setTocando(false)
            setPasso(Math.min(Math.max(p, 0), TOTAL_DE_PASSOS - 1))
          }}
          onTocar={setTocando}
          onSair={sairDaApresentacao}
        />
      ) : (
        <PainelSimulacao onApresentar={comecarApresentacao} />
      )}
    </AppShell>
  )
}

/**
 * As secoes rodando juntas, sobre um estado so.
 *
 * Lancar uma ficha na Mesa muda o caixa na Sessao. Lancar um rake cria um
 * checkpoint na Conciliacao e muda a faixa do topo. Nenhuma tela guarda numero
 * proprio — todas leem a mesma noite.
 */
export default function AppSimulado() {
  const [operador, setOperador] = useState<string | null>(null)

  if (!operador) {
    return (
      <Login
        clube={CLUBE}
        // ⚠️ Esta previa NAO autentica: ela nao tem servidor para perguntar.
        // O `Login` deixou de decidir quem entra na v1.9 do PRD (F14) — quem
        // decide e quem passa o `onEntrar`. No produto isso e o Supabase Auth;
        // aqui e este aceite, que serve so para a previa ter porta de entrada.
        //
        // O PRD registra "quem lancou" em cada movimentacao. O nome digitado e
        // o que vai para o registro, por isso ele vira o do operador.
        onEntrar={async (usuario) => {
          setOperador(usuario.charAt(0).toUpperCase() + usuario.slice(1))
        }}
      />
    )
  }

  return (
    <SimulacaoProvider>
      <Conteudo operador={operador} onSair={() => setOperador(null)} />
    </SimulacaoProvider>
  )
}
