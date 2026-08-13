import { AlertTriangle, CircleCheck, Minus, OctagonAlert, Search } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { CANAL, reais } from './formato'
import type { PainelCheckpoint, PainelFluxo, PainelSessao, Veredito } from './tipos'

const FALA: Record<Veredito, { rotulo: string; acao?: string; icone: LucideIcon }> = {
  fechado: { rotulo: 'Caixa fechado', icone: CircleCheck },
  registrar: {
    rotulo: 'Registrado',
    acao: 'Diferença pequena. Fica registrada e a sessão segue.',
    icone: Minus,
  },
  revisar: {
    rotulo: 'Revisar a janela agora',
    acao: 'As pessoas ainda estão no local. Depois não dá mais.',
    icone: AlertTriangle,
  },
  suspender: {
    rotulo: 'Recomendo suspender novas retiradas',
    acao: 'A decisão é sua. O app não bloqueia a operação.',
    icone: OctagonAlert,
  },
}

export interface VereditoHeroProps {
  sessao: PainelSessao
  fluxo: PainelFluxo
  /** O checkpoint congelado. Ausente antes do primeiro lançamento de rake. */
  checkpoint: PainelCheckpoint | null
  /** Hora do último rake declarado, quando existe. */
  rakeNaoDeclaradoDesde?: string
  desdeUltimoRake?: string
  onRevisarJanela?: (checkpointId: string) => void
}

/**
 * O veredito, do tamanho que ele merece.
 *
 * Este e o produto. Toda a diferenca entre o Caixa Vivo e um caderno digital
 * cabe nesta caixa: um julgamento congelado no ultimo lancamento de rake, com a
 * janela e o turno ao lado.
 *
 * O julgamento vai na serifa e o dinheiro na mono, de proposito. O operador
 * distingue "o que o app decidiu" de "o que o app contou" pela forma da letra,
 * antes de terminar de ler.
 */
export function VereditoHero({
  sessao,
  fluxo,
  checkpoint,
  rakeNaoDeclaradoDesde,
  desdeUltimoRake,
  onRevisarJanela,
}: VereditoHeroProps) {
  if (!checkpoint) {
    return (
      <section className="cv-panel cv-ticks cv-notch cv-ch-neutro cv-rise relative overflow-hidden p-7 sm:p-9">
        <p className="cv-text-soft cv-engraved text-[9.5px] font-semibold tracking-[0.18em] uppercase">
          Nenhum rake lançado ainda
        </p>
        <p className="cv-text font-cv-display mt-3 text-[34px] leading-[1.05] sm:text-[42px]">
          O primeiro checkpoint aparece
          <br />
          no primeiro lançamento.
        </p>
        <p className="cv-text-soft mt-4 max-w-md text-[13px] leading-relaxed">
          Até então o app conhece as fichas que saíram e não voltaram, mas não conhece
          diferença nenhuma — ninguém contou a caixa ainda.
        </p>
      </section>
    )
  }

  const fala = FALA[checkpoint.veredito]
  const Icone = fala.icone
  const fechou = checkpoint.diferenca === 0

  return (
    <section
      className={`cv-panel cv-ticks cv-notch cv-accent-ring cv-rise relative overflow-hidden ${CANAL[checkpoint.veredito]}`}
    >
      {/* O numero do checkpoint como marca d'agua. Editorial, nao decorativo:
          e a unica pista visual de quantas vezes a caixa ja foi conferida. */}
      <span
        className="cv-accent-text font-cv-display pointer-events-none absolute -top-6 -right-3 text-[190px] leading-none opacity-[0.07] select-none sm:text-[240px]"
        aria-hidden="true"
      >
        {checkpoint.numero}
      </span>

      <div className="relative flex">
        {/* A borda da ficha, de cima a baixo. */}
        <span
          className="cv-chip-rail cv-accent-text w-[5px] shrink-0 self-stretch"
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1 p-6 sm:p-8">
          <p className="cv-accent-text cv-engraved flex items-center gap-2 text-[9.5px] font-semibold tracking-[0.18em] uppercase">
            <Icone className="size-3.5 shrink-0" aria-hidden="true" />
            Checkpoint {checkpoint.numero} · {checkpoint.hora}
          </p>

          {/* O veredito. Serifa para a palavra, mono para o valor. */}
          <p className="cv-accent-text cv-stamp mt-3 flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
            {fechou ? (
              <span className="font-cv-display text-[42px] leading-[0.95] sm:text-[60px]">
                Caixa fechado
              </span>
            ) : (
              <>
                <span className="font-cv-display text-[34px] leading-[0.95] sm:text-[46px]">
                  Faltam
                </span>
                <span className="font-cv-mono cv-num text-[34px] leading-[0.95] font-bold sm:text-[52px]">
                  {reais(checkpoint.diferenca)}
                </span>
              </>
            )}
          </p>

          <span
            className="cv-accent-bg cv-sweep mt-4 block h-px w-full max-w-md opacity-40"
            aria-hidden="true"
          />

          {/* A janela e os turnos sao contexto, sempre em tom neutro. O sistema
              nao acusa pessoa: ele mostra onde olhar, e quem investiga e gente.
              Quando a janela atravessa uma troca de dealer, os dois aparecem — o
              furo pode ter acontecido em qualquer ponto dela. */}
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="cv-text font-cv-mono cv-num text-[15px] font-semibold">
              {checkpoint.janelaInicio}–{checkpoint.janelaFim}
            </span>
            <span className="cv-line h-3.5 w-px border-l" aria-hidden="true" />
            {checkpoint.turnos.map((t) => (
              <span
                key={`${t.numero}-${t.dealer}`}
                className="cv-text-soft cv-panel-quiet rounded-full px-2.5 py-1 text-[11.5px] font-medium"
              >
                <span className="font-cv-mono">T{t.numero}</span> · {t.dealer}
              </span>
            ))}
          </div>

          {fala.acao ? (
            <p className="cv-accent-text mt-4 max-w-lg text-[13.5px] leading-relaxed">
              {fala.acao}
            </p>
          ) : null}

          {!fechou ? (
            <button
              type="button"
              onClick={() => onRevisarJanela?.(checkpoint.id)}
              className="cv-btn cv-shine mt-5 h-12 px-5 text-[13.5px] hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Search className="size-4 shrink-0" aria-hidden="true" />
              Ver os lançamentos dessa janela
            </button>
          ) : null}

          {/* O rodape neutro. Ele existe para a regra N8: entre dois rakes a
              diferenca e esperada, e chamar isso de furo ensinaria o operador a
              ignorar o alerta que importa. */}
          <div className="cv-rule mt-6 pt-4">
            <p className="cv-text-soft max-w-xl text-[12.5px] leading-relaxed">
              Agora são{' '}
              <span className="cv-text font-cv-mono cv-num font-semibold">
                {sessao.horaAtual}
              </span>
              .{' '}
              {rakeNaoDeclaradoDesde ? (
                <>
                  Rake não declarado desde{' '}
                  <span className="cv-text font-cv-mono cv-num font-semibold">
                    {rakeNaoDeclaradoDesde}
                  </span>
                  {desdeUltimoRake ? ` (${desdeUltimoRake})` : null} ·{' '}
                </>
              ) : null}
              fichas em jogo{' '}
              <span className="cv-text font-cv-mono cv-num font-semibold">
                {reais(fluxo.fichasEmJogo)}
              </span>
              . Saíram da caixa e ainda não voltaram — essa diferença é esperada e não é
              furo.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
