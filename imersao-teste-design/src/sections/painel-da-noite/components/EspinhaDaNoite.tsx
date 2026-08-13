import { CANAL, reais } from './formato'
import type { PainelCheckpoint, PainelTurno } from './tipos'

export interface EspinhaDaNoiteProps {
  turnos: PainelTurno[]
  checkpoints: PainelCheckpoint[]
  /** Onde o "agora" cai na noite, de 0 a 1. */
  agora: number
  abertaEm: string
  horaAtual: string
  onAbrirCheckpoint?: (checkpointId: string) => void
}

/**
 * A noite inteira numa linha.
 *
 * Esta e a tela que responde a pergunta que o papel nunca respondeu: *em que
 * momento* a conta parou de fechar. Cada ficha e um checkpoint, cada faixa e um
 * turno de dealer, e o trecho hachurado no fim e o rake que ainda esta na mesa —
 * o unico pedaco da noite sobre o qual o app honestamente nao sabe nada.
 *
 * Uma noite real tem de 10 a 20 fichas aqui. Por isso so os checkpoints que
 * NAO fecharam levam rotulo: com vinte rotulos, nenhum deles e legivel.
 */
export function EspinhaDaNoite({
  turnos,
  checkpoints,
  agora,
  abertaEm,
  horaAtual,
  onAbrirCheckpoint,
}: EspinhaDaNoiteProps) {
  const pct = (v: number) => `${Math.min(Math.max(v, 0), 1) * 100}%`
  const ultimo = checkpoints[checkpoints.length - 1]
  // O vao desde o ultimo rake: a conta nao fecha ali, e esta certo que nao feche.
  const vaoDe = ultimo ? ultimo.posicao : 0
  const temVao = agora - vaoDe > 0.005

  return (
    <section className="cv-panel cv-rise cv-d1 overflow-hidden rounded-2xl">
      <header className="cv-line flex flex-wrap items-baseline justify-between gap-2 border-b px-5 py-3.5">
        <h2 className="cv-text-soft cv-engraved text-[9.5px] font-semibold tracking-[0.18em] uppercase">
          A noite, de ponta a ponta
        </h2>
        <p className="cv-text-soft font-cv-mono cv-num text-[11px]">
          {checkpoints.length} {checkpoints.length === 1 ? 'checkpoint' : 'checkpoints'} ·
          10 a 20 numa noite
        </p>
      </header>

      <div className="px-5 pt-9 pb-5 sm:px-7">
        <div className="relative">
          {/* ── Os turnos ─────────────────────────────────────────────────
              A faixa e o periodo, e o nome embaixo e quem estava operando.
              Sempre no mesmo tom: a regra N14 diz que o app mostra a janela e
              quem estava no turno, nunca uma acusacao. */}
          <div className="cv-panel-quiet relative h-3 overflow-hidden rounded-full">
            {turnos.map((turno, i) => (
              <span
                key={turno.id}
                className="absolute inset-y-0"
                style={{ left: pct(turno.de), width: pct(turno.ate - turno.de) }}
              >
                <span
                  className={`cv-text-soft absolute inset-0 ${
                    i % 2 === 0 ? 'opacity-[0.22]' : 'opacity-[0.12]'
                  } bg-current`}
                  aria-hidden="true"
                />
                {/* Divisa entre turnos: a troca de dealer e o instante que a
                    hora de ocorrencia do rake precisa resolver. */}
                {i > 0 ? (
                  <span
                    className="cv-text absolute inset-y-0 left-0 w-px bg-current opacity-40"
                    aria-hidden="true"
                  />
                ) : null}
              </span>
            ))}

            {/* O vao sem rake declarado, hachurado. */}
            {temVao ? (
              <span
                className="cv-live-text absolute inset-y-0 opacity-50"
                style={{
                  left: pct(vaoDe),
                  width: pct(agora - vaoDe),
                  backgroundImage:
                    'repeating-linear-gradient(115deg, currentColor 0 2px, transparent 2px 7px)',
                }}
                aria-hidden="true"
              />
            ) : null}
          </div>

          {/* ── Os checkpoints ────────────────────────────────────────────── */}
          {checkpoints.map((c) => {
            const fechou = c.diferenca === 0
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onAbrirCheckpoint?.(c.id)}
                title={`Checkpoint ${c.numero} às ${c.hora}: ${
                  fechou ? 'caixa fechado' : `faltam ${reais(c.diferenca)}`
                } · janela ${c.janelaInicio}–${c.janelaFim}`}
                className={`${CANAL[c.veredito]} group absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full p-1.5 focus-visible:ring-2 focus-visible:outline-none`}
                style={{ left: pct(c.posicao) }}
              >
                {/* A ficha: anel tracejado por fora, nucleo cheio por dentro. */}
                <span
                  className="cv-accent-text relative flex size-4 items-center justify-center transition-transform duration-200 group-hover:scale-125"
                  aria-hidden="true"
                >
                  <span className="absolute inset-0 rounded-full border border-dashed opacity-80" />
                  <span className="cv-accent-bg absolute inset-[3px] rounded-full" />
                </span>

                {/* Rotulo so no que nao fechou: e o que o operador procura. */}
                {!fechou ? (
                  <span className="cv-accent-text font-cv-mono cv-num absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] font-bold whitespace-nowrap">
                    {reais(c.diferenca)}
                  </span>
                ) : null}
              </button>
            )
          })}

          {/* ── Agora ──────────────────────────────────────────────────────── */}
          <span
            className="cv-live-text pointer-events-none absolute -top-8 bottom-[-1.15rem] flex flex-col items-center"
            style={{ left: pct(agora) }}
            aria-hidden="true"
          >
            <span className="relative flex size-2 shrink-0 items-center justify-center">
              <span className="cv-pulse absolute inset-0" />
              <span className="relative size-2 rounded-full bg-current" />
            </span>
            <span
              className="w-px flex-1 bg-current opacity-45"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(180deg, currentColor 0 3px, transparent 3px 6px)',
                backgroundColor: 'transparent',
              }}
            />
          </span>
        </div>

        {/* Os nomes dos dealers, sob a faixa. Só quando o turno é largo o
            bastante para o nome caber sem virar reticências. */}
        <div className="relative mt-4 h-8">
          {turnos.map((turno) => {
            const largura = turno.ate - turno.de
            if (largura < 0.11) return null
            return (
              <span
                key={turno.id}
                className="absolute top-0 flex flex-col gap-0.5 overflow-hidden pr-2"
                style={{ left: pct(turno.de), width: pct(largura) }}
              >
                <span
                  className={`truncate text-[11.5px] leading-none font-semibold ${
                    turno.aberto ? 'cv-live-text' : 'cv-text'
                  }`}
                >
                  {turno.dealer}
                </span>
                <span className="cv-text-soft font-cv-mono cv-num truncate text-[10px] leading-none">
                  T{turno.numero} · {turno.inicio}–{turno.fim ?? 'agora'} ·{' '}
                  {reais(turno.rakeDoTurno)}
                </span>
              </span>
            )
          })}
        </div>

        <div className="cv-line mt-2 flex items-baseline justify-between border-t pt-3">
          <span className="cv-text-soft font-cv-mono cv-num text-[10.5px]">
            {abertaEm}
          </span>
          {temVao ? (
            <span className="cv-live-text text-[10.5px] font-medium">
              hachurado = rake ainda na mesa
            </span>
          ) : null}
          <span className="cv-text font-cv-mono cv-num text-[10.5px] font-semibold">
            {horaAtual}
          </span>
        </div>
      </div>
    </section>
  )
}
