import {
  EspinhaDaNoite,
  MesaCompacta,
  MostradorCaixa,
  TilesDaNoite,
  VereditoHero,
} from '@/sections/painel-da-noite/components'
import { TituloDeTela } from '@/shell/components/TituloDeTela'
import { useSimulacao } from '../contexto'
import { painelVista } from '../vistas'

export interface PainelConectadoProps {
  onAbrirCaixa?: () => void
  onAbrirJogador?: (participacaoId: string) => void
  onAbrirSessao?: () => void
}

/**
 * O painel da noite ligado ao estado real.
 *
 * Nenhum numero desta tela e proprio: todos saem do mesmo reducer que as outras
 * seis secoes usam. Lancar uma ficha na Mesa move a barra daqui; lancar um rake
 * acende uma ficha nova na espinha. E por isso que o painel nao consegue mentir.
 */
export function PainelConectado({
  onAbrirCaixa,
  onAbrirJogador,
  onAbrirSessao,
}: PainelConectadoProps) {
  const { noite } = useSimulacao()
  const painel = painelVista(noite)

  if (!painel.sessao) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6">
        <TituloDeTela
          sobretitulo="Painel"
          titulo="A noite ainda não começou"
          descricao="Abra a sessão com o caixa inicial de fichas. É esse número que serve de ponto de partida para a conferência da noite inteira."
        />
        <button
          type="button"
          onClick={onAbrirSessao}
          className="cv-panel cv-ticks cv-rise cv-live-text w-full rounded-2xl px-6 py-10 text-left transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:outline-none"
        >
          <span className="font-cv-display block text-[26px] leading-tight">
            Abrir a noite
          </span>
          <span className="cv-text-soft mt-1.5 block text-[13px]">
            Leva você para a seção Sessão e Caixa.
          </span>
        </button>
      </div>
    )
  }

  const ultimo = painel.checkpoints[painel.checkpoints.length - 1] ?? null
  const encerrada = !painel.sessao.aberta

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-7 sm:px-6">
      <TituloDeTela
        sobretitulo={`${painel.sessao.clube} · aberta às ${painel.sessao.abertaEm}`}
        titulo={encerrada ? 'A noite terminou' : 'Painel da noite'}
        acessorio={
          <div className="text-right">
            <p className="cv-text-soft cv-engraved text-[9px] font-semibold tracking-[0.18em] uppercase">
              {encerrada ? 'Durou' : 'Em sessão há'}
            </p>
            <p className="cv-text font-cv-mono cv-num mt-1 text-[24px] leading-none font-bold">
              {painel.sessao.decorrido}
            </p>
          </div>
        }
      />

      {/* Encerrada a noite, o painel deixa de ser instrumento e vira porta para
          o relatório: não há mais nada acontecendo para ele acompanhar. */}
      {encerrada ? (
        <button
          type="button"
          onClick={onAbrirCaixa}
          className="cv-panel cv-ticks cv-rise cv-live-text w-full rounded-2xl px-6 py-6 text-left transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:outline-none"
        >
          <span className="font-cv-display block text-[24px] leading-tight">
            Abrir o relatório da sessão
          </span>
          <span className="cv-text-soft mt-1.5 block text-[13px]">
            Todos os checkpoints da noite, a conta fechada, quem passou pela mesa e cada
            exceção com o motivo escrito.
          </span>
        </button>
      ) : null}

      <VereditoHero
        sessao={painel.sessao}
        fluxo={painel.fluxo}
        checkpoint={ultimo}
        rakeNaoDeclaradoDesde={painel.rakeNaoDeclaradoDesde}
        desdeUltimoRake={painel.desdeUltimoRake}
        onRevisarJanela={() => onAbrirCaixa?.()}
      />

      <TilesDaNoite painel={painel} />

      <EspinhaDaNoite
        turnos={painel.turnos}
        checkpoints={painel.checkpoints}
        agora={painel.agora}
        abertaEm={painel.sessao.abertaEm}
        horaAtual={painel.sessao.horaAtual}
        onAbrirCheckpoint={() => onAbrirCaixa?.()}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <MostradorCaixa fluxo={painel.fluxo} />
        <MesaCompacta jogadores={painel.jogadores} onAbrirJogador={onAbrirJogador} />
      </div>
    </div>
  )
}
