import { ChevronRight, EyeOff, Users } from 'lucide-react'
import { reais } from './formato'
import type { PainelJogador } from './tipos'

export interface MesaCompactaProps {
  jogadores: PainelJogador[]
  onAbrirJogador?: (participacaoId: string) => void
}

/**
 * A mesa por exposicao, do maior para o menor.
 *
 * Aqui a ordem nao e a de chegada: e a de quanto cada um tem da caixa na mao.
 * O painel serve para olhar, e quem esta com mais ficha e quem o operador olha
 * primeiro.
 *
 * A barra de limite conta o confirmado mais o que aguarda confirmacao — regra
 * N6. Contar so o confirmado deixa passar a segunda retirada de quem ja
 * estourou o limite com a primeira ainda na tela.
 */
export function MesaCompacta({ jogadores, onAbrirJogador }: MesaCompactaProps) {
  const ordenados = [...jogadores].sort(
    (a, b) => b.emMao + b.aguardando - (a.emMao + a.aguardando)
  )
  const total = jogadores.reduce((s, j) => s + j.emMao, 0)

  return (
    <section className="cv-panel cv-rise cv-d3 overflow-hidden rounded-2xl">
      <header className="cv-line flex flex-wrap items-baseline justify-between gap-2 border-b px-5 py-3.5">
        <h2 className="cv-text-soft cv-engraved flex items-center gap-1.5 text-[9.5px] font-semibold tracking-[0.18em] uppercase">
          <Users className="size-3 shrink-0" aria-hidden="true" />
          Quem está com a caixa
        </h2>
        <p className="cv-text font-cv-mono cv-num text-[11.5px] font-semibold">
          {reais(total)}
        </p>
      </header>

      {ordenados.length === 0 ? (
        <p className="cv-text-soft px-5 py-8 text-center text-[13px]">
          Ninguém na mesa. A noite começa quando o primeiro jogador senta.
        </p>
      ) : (
        <ul className="cv-divide">
          {ordenados.map((j) => {
            const comprometido = j.emMao + j.aguardando
            const uso = j.limite > 0 ? Math.min(comprometido / j.limite, 1) : 0
            const apertado = uso >= 0.8

            return (
              <li key={j.id}>
                <button
                  type="button"
                  onClick={() => onAbrirJogador?.(j.id)}
                  className="group flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-[var(--cv-panel-quiet)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="cv-text truncate text-[13.5px] font-semibold">
                        {j.nome}
                      </span>
                      {/* Violeta e chrome: contingencia nao e erro do caixa, e o
                          registro de que o aceite presencial foi burlado. */}
                      {j.contingencias > 0 ? (
                        <span
                          className="cv-ch-chrome cv-accent-text cv-accent-fill flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold"
                          title="Vezes em que o operador confirmou sem este jogador olhar a tela"
                        >
                          <EyeOff className="size-2.5" aria-hidden="true" />
                          {j.contingencias}
                        </span>
                      ) : null}
                    </span>

                    {/* A barra de limite. Ambar só no aperto — e ambar aqui é
                        aviso de limite, não veredito de caixa: ele mora dentro
                        do cartão do jogador, nunca na faixa do topo. */}
                    <span className="mt-2 block">
                      <span className="cv-panel-quiet block h-[3px] overflow-hidden rounded-full">
                        <span
                          className={`block h-full rounded-full bg-current ${
                            apertado ? 'cv-ch-limite cv-accent-bg' : 'cv-text-soft bg-current opacity-45'
                          }`}
                          style={{ width: `${uso * 100}%` }}
                        />
                      </span>
                      <span className="cv-text-soft mt-1.5 flex items-baseline gap-1.5 text-[10px]">
                        <span className="font-cv-mono cv-num">
                          {Math.round(uso * 100)}% de {reais(j.limite)}
                        </span>
                        {j.aguardando > 0 ? (
                          <span className="cv-ch-chrome cv-accent-text font-cv-mono cv-num font-semibold">
                            · {reais(j.aguardando)} aguardando
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </span>

                  <span className="shrink-0 text-right">
                    <span className="cv-text font-cv-mono cv-num block text-[15px] leading-none font-bold">
                      {reais(j.emMao)}
                    </span>
                    <span className="cv-text-soft font-cv-mono cv-num mt-1.5 block text-[9.5px]">
                      desde {j.entrouAs}
                    </span>
                  </span>

                  <ChevronRight
                    className="cv-text-soft size-4 shrink-0 opacity-50 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
