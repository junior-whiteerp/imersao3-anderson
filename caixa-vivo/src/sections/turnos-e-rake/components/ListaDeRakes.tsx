import type { LancamentoRake } from './tipos'

function reais(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export interface ListaDeRakesProps {
  lancamentos: LancamentoRake[]
}

/**
 * Os rakes da noite.
 *
 * A hora de saida e a que manda; a hora digitada aparece ao lado, menor, so
 * quando as duas sao diferentes — e quando elas divergem que o turno pode ter
 * sido atribuido errado.
 */
export function ListaDeRakes({ lancamentos }: ListaDeRakesProps) {
  const total = lancamentos.reduce((soma, item) => soma + item.valor, 0)
  const maior = Math.max(...lancamentos.map((l) => l.valor), 1)

  return (
    <section className="cv-panel cv-rise cv-d2 overflow-hidden rounded-2xl">
      <header className="cv-line flex items-baseline justify-between border-b px-5 py-3.5">
        <h2 className="cv-text-soft cv-engraved text-[9.5px] font-semibold tracking-[0.18em] uppercase">
          Rakes da noite
        </h2>
        <span className="cv-text font-cv-mono cv-num text-[13.5px] font-bold">
          {reais(total)}
        </span>
      </header>

      <ul className="cv-divide">
        {lancamentos.map((item) => (
          <li key={item.id} className="flex items-center gap-3.5 px-5 py-3">
            <span className="shrink-0">
              <span className="cv-text font-cv-mono cv-num block text-[13.5px] font-semibold">
                {item.horaSaida}
              </span>
              {item.horaSaida !== item.horaDigitada ? (
                <span
                  className="cv-text-soft font-cv-mono cv-num mt-0.5 block text-[9.5px] opacity-80"
                  title="Hora em que o operador digitou"
                >
                  dig. {item.horaDigitada}
                </span>
              ) : null}
            </span>

            <span className="min-w-0 flex-1">
              <span className="cv-text block truncate text-[13px]">{item.dealer}</span>
              {/* A barra dá a proporção do lançamento antes de o olho chegar no
                  número. Numa noite de 15 rakes, é o que revela o fora da curva. */}
              <span className="cv-panel-quiet mt-1.5 block h-[3px] overflow-hidden rounded-full">
                <span
                  className="cv-live-text block h-full rounded-full bg-current opacity-60"
                  style={{ width: `${(item.valor / maior) * 100}%` }}
                />
              </span>
              <span className="cv-text-soft font-cv-mono cv-num mt-1.5 block text-[10px]">
                turno {item.turno}
              </span>
            </span>

            <span className="cv-text font-cv-mono cv-num shrink-0 text-[14px] font-bold">
              {reais(item.valor)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
