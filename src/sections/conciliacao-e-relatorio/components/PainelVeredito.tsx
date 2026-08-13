import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, CircleCheck, Minus, OctagonAlert, Search } from 'lucide-react'
import type { Checkpoint, Veredito, VereditoAtual } from './tipos'

function reais(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

interface Estilo {
  /** Canal de cor: troca --cv-accent, e painel, régua e número leem dela. */
  canal: string
  icone: LucideIcon
  rotulo: string
  acao?: string
}

const ESTILOS: Record<Veredito, Estilo> = {
  fechado: { canal: 'cv-ch-fecha', icone: CircleCheck, rotulo: 'Caixa fechado' },
  registrar: {
    canal: 'cv-ch-neutro',
    icone: Minus,
    rotulo: 'Registrado',
    acao: 'Diferença pequena. Fica registrada e a sessão segue.',
  },
  revisar: {
    canal: 'cv-ch-revisar',
    icone: AlertTriangle,
    rotulo: 'Revisar a janela agora',
    acao: 'As pessoas ainda estão no local. Depois não dá mais.',
  },
  suspender: {
    canal: 'cv-ch-suspender',
    icone: OctagonAlert,
    rotulo: 'Recomendo suspender novas retiradas',
    acao: 'A decisão é sua. O app não bloqueia a operação.',
  },
}

export interface PainelVereditoProps {
  atual: VereditoAtual
  ultimoCheckpoint: Checkpoint | null
  onRevisarJanela?: (checkpointId: string) => void
}

/**
 * O veredito congelado no ultimo lancamento de rake.
 *
 * Entre um checkpoint e outro o painel fica neutro e cinza: a diferenca ali e
 * esperada, porque falta declarar o rake que ainda esta na mesa. Alertar nessa
 * hora e alertar errado quase o tempo todo.
 */
export function PainelVeredito({
  atual,
  ultimoCheckpoint,
  onRevisarJanela,
}: PainelVereditoProps) {
  if (!ultimoCheckpoint) {
    return (
      <section className="cv-panel cv-ticks cv-rise rounded-2xl p-8 text-center">
        <h2 className="cv-text font-cv-display text-[26px] leading-tight">
          Nenhum rake lançado ainda
        </h2>
        <p className="cv-text-soft mx-auto mt-2 max-w-sm text-[13px] leading-relaxed">
          O primeiro checkpoint aparece no primeiro lançamento.
        </p>
      </section>
    )
  }

  const estilo = ESTILOS[ultimoCheckpoint.veredito]
  const Icone = estilo.icone
  const fechou = ultimoCheckpoint.diferenca === 0

  return (
    <section
      className={`cv-panel cv-ticks cv-notch cv-accent-ring cv-rise relative overflow-hidden ${estilo.canal}`}
    >
      <span
        className="cv-accent-text font-cv-display pointer-events-none absolute -top-5 -right-2 text-[150px] leading-none opacity-[0.07] select-none"
        aria-hidden="true"
      >
        {ultimoCheckpoint.numero}
      </span>

      <div className="relative flex">
        <span
          className="cv-chip-rail cv-accent-text w-[5px] shrink-0 self-stretch"
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1 p-5 sm:p-6">
          <p className="cv-accent-text cv-engraved flex items-center gap-2 text-[9.5px] font-semibold tracking-[0.18em] uppercase">
            <Icone className="size-3.5 shrink-0" aria-hidden="true" />
            Checkpoint {ultimoCheckpoint.numero} · {ultimoCheckpoint.hora}
          </p>

          {/* Serifa para o julgamento, mono para o dinheiro. */}
          <p className="cv-accent-text cv-stamp mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {fechou ? (
              <span className="font-cv-display text-[38px] leading-[0.95] sm:text-[46px]">
                Caixa fechado
              </span>
            ) : (
              <>
                <span className="font-cv-display text-[30px] leading-[0.95] sm:text-[36px]">
                  Faltam
                </span>
                <span className="font-cv-mono cv-num text-[30px] leading-[0.95] font-bold sm:text-[40px]">
                  {reais(ultimoCheckpoint.diferenca)}
                </span>
              </>
            )}
          </p>

          <span
            className="cv-accent-bg cv-sweep mt-3.5 block h-px w-full max-w-sm opacity-40"
            aria-hidden="true"
          />

          {/* A janela e os turnos sao contexto, sempre em tom neutro. O sistema
              nao acusa pessoa: ele mostra onde olhar, e quem investiga e gente.
              Quando a janela atravessa uma troca de dealer, os dois aparecem — o
              furo pode ter acontecido em qualquer ponto dela. */}
          <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="cv-text font-cv-mono cv-num text-[14px] font-semibold">
              {ultimoCheckpoint.janelaInicio}–{ultimoCheckpoint.janelaFim}
            </span>
            <span className="cv-line h-3.5 w-px border-l" aria-hidden="true" />
            {(
              ultimoCheckpoint.turnosNaJanela ?? [
                { numero: ultimoCheckpoint.turno, dealer: ultimoCheckpoint.dealer },
              ]
            ).map((t) => (
              <span
                key={`${t.numero}-${t.dealer}`}
                className="cv-text-soft cv-panel-quiet rounded-full px-2.5 py-1 text-[11.5px] font-medium"
              >
                <span className="font-cv-mono">T{t.numero}</span> · {t.dealer}
              </span>
            ))}
          </div>

          {estilo.acao ? (
            <p className="cv-accent-text mt-3.5 max-w-lg text-[13px] leading-relaxed">
              {estilo.acao}
            </p>
          ) : null}

          {!fechou ? (
            <button
              type="button"
              onClick={() => onRevisarJanela?.(ultimoCheckpoint.id)}
              className="cv-btn cv-shine mt-4 h-12 w-full text-[13.5px] hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Search className="size-4 shrink-0" aria-hidden="true" />
              Ver os lançamentos dessa janela
            </button>
          ) : null}

          <div className="cv-rule mt-5 pt-3.5">
            <p className="cv-text-soft text-[12px] leading-relaxed">
              Agora são{' '}
              <span className="cv-text font-cv-mono cv-num font-semibold">
                {atual.horaAtual}
              </span>
              . Rake não declarado desde{' '}
              <span className="cv-text font-cv-mono cv-num font-semibold">
                {atual.desdeHora}
              </span>{' '}
              · diferença atual{' '}
              <span className="cv-text font-cv-mono cv-num font-semibold">
                {reais(atual.diferenca)}
              </span>
              . Essa diferença é esperada e não é furo.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
