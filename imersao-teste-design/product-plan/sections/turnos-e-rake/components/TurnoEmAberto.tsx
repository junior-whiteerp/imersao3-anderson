import { Repeat, UserCog } from 'lucide-react'
import type { Dealer, TurnoAberto } from './tipos'

function reais(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export interface TurnoEmAbertoProps {
  turno: TurnoAberto | null
  dealers: Dealer[]
  onTrocarDealer?: (dealerId: string) => void
  onAbrirTurno?: (dealerId: string) => void
}

/**
 * O turno que esta rodando agora.
 *
 * O nome do dealer aparece como contexto do periodo. Nunca como acusacao — a
 * regra N14 diz que o sistema mostra a janela e quem estava no turno; quem
 * investiga e gente.
 */
export function TurnoEmAberto({
  turno,
  dealers,
  onTrocarDealer,
  onAbrirTurno,
}: TurnoEmAbertoProps) {
  if (!turno) {
    return (
      <section className="cv-panel cv-ticks cv-rise rounded-2xl p-7 text-center">
        <UserCog className="cv-text-soft mx-auto size-7 opacity-50" aria-hidden="true" />
        <h2 className="cv-text font-cv-display mt-3 text-[26px] leading-tight">
          Nenhum turno aberto
        </h2>
        <p className="cv-text-soft mt-1.5 text-[13px]">Escolha o dealer para começar.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {dealers.map((dealer) => (
            <button
              key={dealer.id}
              type="button"
              onClick={() => onAbrirTurno?.(dealer.id)}
              className="cv-btn-quiet h-11 px-4 text-[13.5px] hover:-translate-y-px focus-visible:ring-2 focus-visible:outline-none"
            >
              {dealer.nome}
            </button>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="cv-ch-chrome cv-panel cv-ticks cv-accent-ring cv-rise relative overflow-hidden rounded-2xl">
      <div className="flex">
        <span
          className="cv-chip-rail cv-accent-text w-[4px] shrink-0 self-stretch"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="cv-accent-text cv-engraved flex items-center gap-1.5 text-[9.5px] font-semibold tracking-[0.18em] uppercase">
                <span
                  className="relative flex size-1.5 items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="cv-pulse absolute inset-0" />
                  <span className="relative size-1.5 rounded-full bg-current" />
                </span>
                Turno {turno.numero} · em aberto
              </p>
              <p className="cv-text font-cv-display mt-2 truncate text-[28px] leading-none">
                {turno.dealer}
              </p>
              <p className="cv-text-soft font-cv-mono cv-num mt-2 text-[11.5px]">
                desde {turno.inicio} · {turno.decorrido}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="cv-text font-cv-mono cv-num text-[22px] leading-none font-bold">
                {reais(turno.rakeDoTurno)}
              </p>
              <p className="cv-text-soft cv-engraved mt-1.5 text-[9px] font-semibold tracking-[0.14em] uppercase">
                rake no turno
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {dealers
              .filter((dealer) => dealer.nome !== turno.dealer)
              .map((dealer) => (
                <button
                  key={dealer.id}
                  type="button"
                  onClick={() => onTrocarDealer?.(dealer.id)}
                  className="cv-btn-quiet h-11 px-3.5 text-[13px] hover:-translate-y-px focus-visible:ring-2 focus-visible:outline-none"
                >
                  <Repeat className="size-3.5 shrink-0" aria-hidden="true" />
                  Passar para {dealer.nome}
                </button>
              ))}
          </div>
        </div>
      </div>
    </section>
  )
}
