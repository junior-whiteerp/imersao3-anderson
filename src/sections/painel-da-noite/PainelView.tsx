import { MolduraDaPrevia } from '@/shell/components/MolduraDaPrevia'
import dados from '@/../product/sections/painel-da-noite/data.json'
import {
  EspinhaDaNoite,
  MesaCompacta,
  MostradorCaixa,
  TilesDaNoite,
  VereditoHero,
  type PainelDaNoite,
} from './components'

const painel = dados.painel as PainelDaNoite

/**
 * O desenho de referencia do Painel da Noite, com dado de amostra.
 *
 * A versao ligada ao estado real vive em `src/simulacao/telas/PainelConectado`.
 * As duas usam exatamente os mesmos componentes — esta so troca a fonte do dado,
 * que e o teste pratico de que eles sao mesmo baseados em props.
 */
export default function PainelView() {
  const sessao = painel.sessao
  const ultimo = painel.checkpoints[painel.checkpoints.length - 1] ?? null
  if (!sessao) return null

  return (
    <MolduraDaPrevia
      largura="largo"
      sobretitulo={`${sessao.clube} · aberta às ${sessao.abertaEm}`}
      titulo="Painel da noite"
      acessorio={
        <div className="text-right">
          <p className="cv-text-soft cv-engraved text-[9px] font-semibold tracking-[0.18em] uppercase">
            Em sessão há
          </p>
          <p className="cv-text font-cv-mono cv-num mt-1 text-[24px] leading-none font-bold">
            {sessao.decorrido}
          </p>
        </div>
      }
    >
      <div className="space-y-4">
        <VereditoHero
          sessao={sessao}
          fluxo={painel.fluxo}
          checkpoint={ultimo}
          rakeNaoDeclaradoDesde={painel.rakeNaoDeclaradoDesde}
          desdeUltimoRake={painel.desdeUltimoRake}
        />
        <TilesDaNoite painel={painel} />
        <EspinhaDaNoite
          turnos={painel.turnos}
          checkpoints={painel.checkpoints}
          agora={painel.agora}
          abertaEm={sessao.abertaEm}
          horaAtual={sessao.horaAtual}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <MostradorCaixa fluxo={painel.fluxo} />
          <MesaCompacta jogadores={painel.jogadores} />
        </div>
      </div>
    </MolduraDaPrevia>
  )
}
