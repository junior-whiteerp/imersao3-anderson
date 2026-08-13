import { Clock3, Coins, EyeOff, HandCoins, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { reais } from './formato'
import type { PainelDaNoite } from './tipos'

interface Tile {
  rotulo: string
  valor: string
  nota?: string
  icone: LucideIcon
  /** Canal de cor. Sem canal, o mostrador fica no tom do painel. */
  canal?: string
}

export interface TilesDaNoiteProps {
  painel: PainelDaNoite
}

/**
 * Os quatro mostradores da noite.
 *
 * Nenhum deles e o veredito — o veredito tem a caixa grande la em cima. Estes
 * quatro sao contexto que o operador consulta de longe, sem tocar em nada.
 *
 * O de contingencia so aparece colorido quando ja houve alguma: um mostrador em
 * violeta a noite inteira sinalizando zero ensina a nao olhar para ele.
 */
export function TilesDaNoite({ painel }: TilesDaNoiteProps) {
  const { fluxo, jogadores, checkpoints, contingenciasNaSessao, tetoContingencias } =
    painel
  const aguardando = jogadores.reduce((s, j) => s + j.aguardando, 0)
  const noTeto = contingenciasNaSessao >= tetoContingencias

  const tiles: Tile[] = [
    {
      rotulo: 'Fichas em jogo',
      valor: reais(fluxo.fichasEmJogo),
      nota: aguardando > 0 ? `${reais(aguardando)} aguardando confirmação` : 'nada aguardando',
      icone: Coins,
    },
    {
      rotulo: 'Rake da noite',
      valor: reais(fluxo.rake),
      nota: painel.desdeUltimoRake
        ? `último há ${painel.desdeUltimoRake}`
        : 'nenhum lançado',
      icone: HandCoins,
      canal: 'cv-ch-live',
    },
    {
      rotulo: 'Na mesa',
      valor: String(jogadores.length),
      nota: `${checkpoints.length} ${
        checkpoints.length === 1 ? 'conferência' : 'conferências'
      } até agora`,
      icone: Users,
    },
    {
      rotulo: 'Contingências',
      valor: `${contingenciasNaSessao} de ${tetoContingencias}`,
      nota: noTeto ? 'a próxima ficha não sai' : 'jogador não olhou a tela',
      icone: EyeOff,
      canal: noTeto ? 'cv-ch-suspender' : contingenciasNaSessao > 0 ? 'cv-ch-chrome' : undefined,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((tile, i) => {
        const Icone = tile.icone
        return (
          <section
            key={tile.rotulo}
            className={`cv-panel cv-ticks cv-rise relative overflow-hidden rounded-2xl p-4 ${
              tile.canal ?? ''
            } cv-d${i + 1}`}
          >
            <p className="cv-text-soft cv-engraved flex items-center gap-1.5 text-[9px] font-semibold tracking-[0.16em] uppercase">
              <Icone
                className={`size-3 shrink-0 ${tile.canal ? 'cv-accent-text' : ''}`}
                aria-hidden="true"
              />
              {tile.rotulo}
            </p>
            <p
              className={`font-cv-mono cv-num mt-2.5 text-[22px] leading-none font-bold sm:text-[26px] ${
                tile.canal ? 'cv-accent-text' : 'cv-text'
              }`}
            >
              {tile.valor}
            </p>
            {tile.nota ? (
              <p className="cv-text-soft mt-1.5 flex items-center gap-1 text-[10.5px] leading-snug">
                {tile.rotulo === 'Rake da noite' ? (
                  <Clock3 className="size-2.5 shrink-0" aria-hidden="true" />
                ) : null}
                {tile.nota}
              </p>
            ) : null}
          </section>
        )
      })}
    </div>
  )
}
