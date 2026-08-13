import type { TurnoResumo } from './tipos'

function reais(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export interface LinhaDoTempoTurnosProps {
  turnos: TurnoResumo[]
  onVerTurno?: (turnoId: string) => void
}

/**
 * A noite dividida em turnos.
 *
 * O nome do dealer aparece como contexto do periodo, sempre no mesmo tom. O app
 * mostra a janela e quem estava operando; ele nao acusa ninguem.
 */
export function LinhaDoTempoTurnos({ turnos, onVerTurno }: LinhaDoTempoTurnosProps) {
  return (
    <section className="cv-panel cv-rise overflow-hidden rounded-2xl">
      <h2 className="cv-line cv-text-soft cv-engraved border-b px-5 py-3.5 text-[9.5px] font-semibold tracking-[0.18em] uppercase">
        Turnos da noite
      </h2>
      <ol className="cv-divide">
        {turnos.map((turno) => (
          <li key={turno.id} className={turno.aberto ? 'cv-ch-chrome' : 'cv-ch-neutro'}>
            <button
              type="button"
              onClick={() => onVerTurno?.(turno.id)}
              className="group flex w-full items-center gap-3.5 px-5 py-3 text-left transition-colors hover:bg-[var(--cv-panel-quiet)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none"
            >
              {/* Violeta marca o turno aberto: é chrome, não estado do caixa.
                  A ficha tracejada é a mesma forma da marca e do checkpoint. */}
              <span
                className="cv-accent-text relative flex size-9 shrink-0 items-center justify-center"
                aria-hidden="true"
              >
                <span
                  className={`absolute inset-0 rounded-full border ${
                    turno.aberto ? 'border-dashed opacity-90' : 'opacity-35'
                  }`}
                />
                <span className="cv-accent-fill absolute inset-[3px] rounded-full" />
                <span className="font-cv-mono relative text-[11px] font-bold">
                  T{turno.numero}
                </span>
              </span>

              <span className="min-w-0 flex-1">
                <span className="cv-text block truncate text-[13.5px] font-semibold">
                  {turno.dealer}
                </span>
                <span className="cv-text-soft font-cv-mono cv-num mt-0.5 block text-[11px]">
                  {turno.inicio}–{turno.fim ?? 'agora'}
                </span>
              </span>

              <span className="shrink-0 text-right">
                <span className="cv-text font-cv-mono cv-num block text-[14px] leading-none font-bold">
                  {reais(turno.rakeDoTurno)}
                </span>
                <span
                  className={`cv-engraved mt-1.5 block text-[9px] font-semibold tracking-[0.14em] uppercase ${
                    turno.aberto ? 'cv-accent-text' : 'cv-text-soft'
                  }`}
                >
                  {turno.aberto ? 'em aberto' : 'rake'}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}
