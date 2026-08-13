import type { Checkpoint, Veredito } from './tipos'

function reais(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

const CANAL: Record<Veredito, string> = {
  fechado: 'cv-ch-fecha',
  registrar: 'cv-ch-neutro',
  revisar: 'cv-ch-revisar',
  suspender: 'cv-ch-suspender',
}

export interface ListaCheckpointsProps {
  checkpoints: Checkpoint[]
  onAbrir?: (checkpointId: string) => void
}

/**
 * Os checkpoints da noite, em ordem.
 *
 * E aqui que a noite deixa de ser um numero unico no fim e vira 10 a 20 pontos
 * de conferencia. O operador percorre a lista para achar em qual deles a conta
 * comecou a nao fechar.
 *
 * Cada linha abre com a ficha do checkpoint: anel tracejado por fora, nucleo
 * cheio na cor do veredito. E a mesma forma da espinha do painel, para que a
 * lista e o desenho sejam obviamente a mesma coisa vista de dois jeitos.
 */
export function ListaCheckpoints({ checkpoints, onAbrir }: ListaCheckpointsProps) {
  return (
    <section className="cv-panel cv-rise overflow-hidden rounded-2xl">
      <header className="cv-line flex flex-wrap items-baseline justify-between gap-2 border-b px-5 py-3.5">
        <h2 className="cv-text-soft cv-engraved text-[9.5px] font-semibold tracking-[0.18em] uppercase">
          Checkpoints da noite
        </h2>
        <span className="cv-text-soft font-cv-mono cv-num text-[11px]">
          {checkpoints.length} de 10 a 20 esperados
        </span>
      </header>

      <ol className="cv-divide">
        {checkpoints.map((checkpoint) => {
          const fechou = checkpoint.diferenca === 0
          return (
            <li key={checkpoint.id} className={CANAL[checkpoint.veredito]}>
              <button
                type="button"
                onClick={() => onAbrir?.(checkpoint.id)}
                className="group flex w-full items-center gap-3.5 px-5 py-3 text-left transition-colors hover:bg-[var(--cv-accent-soft)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none"
              >
                <span
                  className="cv-accent-text relative flex size-4 shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-110"
                  aria-hidden="true"
                >
                  <span className="absolute inset-0 rounded-full border border-dashed opacity-80" />
                  <span className="cv-accent-bg absolute inset-[3px] rounded-full" />
                </span>

                <span className="cv-text font-cv-mono cv-num w-12 shrink-0 text-[13.5px] font-semibold">
                  {checkpoint.hora}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="cv-text-soft font-cv-mono cv-num block truncate text-[11.5px]">
                    {checkpoint.janelaInicio}–{checkpoint.janelaFim}
                  </span>
                  <span className="cv-text-soft mt-0.5 block truncate text-[11.5px]">
                    {(
                      checkpoint.turnosNaJanela ?? [
                        { numero: checkpoint.turno, dealer: checkpoint.dealer },
                      ]
                    )
                      .map((t) => `turno ${t.numero} · ${t.dealer}`)
                      .join(' · ')}
                  </span>
                </span>

                <span
                  className={`cv-accent-text shrink-0 ${
                    fechou
                      ? 'font-cv-display text-[17px] italic'
                      : 'font-cv-mono cv-num text-[14px] font-bold'
                  }`}
                >
                  {fechou ? 'fecha' : reais(checkpoint.diferenca)}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
