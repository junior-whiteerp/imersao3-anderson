import { AlertTriangle, Clock, HandCoins, PenLine } from 'lucide-react'
import type { TurnoAberto, TurnoFechado } from './tipos'

function reais(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

/** "21h05" -> 1265 minutos. So para comparar horas dentro da mesma noite. */
function emMinutos(hora: string) {
  const [h, m] = hora.split('h')
  return Number(h) * 60 + Number(m || 0)
}

export interface LancarRakeProps {
  turnoAberto: TurnoAberto
  turnosFechados: TurnoFechado[]
  horaAtual: string
  valor: string
  horaSaida: string
  onDigitarValor?: (valor: string) => void
  onMudarHora?: (hora: string) => void
  onLancar?: () => void
}

/**
 * O lancamento do rake — o passo que dispara o checkpoint.
 *
 * As duas horas ficam visiveis e separadas. Sem essa distincao, um rake
 * retirado as 21h05 e digitado as 21h12, com troca de turno as 21h10, e
 * atribuido ao dealer errado — e o dealer errado e quem responde pela janela.
 */
export function LancarRake({
  turnoAberto,
  turnosFechados,
  horaAtual,
  valor,
  horaSaida,
  onDigitarValor,
  onMudarHora,
  onLancar,
}: LancarRakeProps) {
  const numero = Number(valor.replace(/\D/g, '') || '0')
  const minutos = emMinutos(horaSaida)

  // A hora escolhida caiu num turno que ja foi fechado?
  const turnoRetroativo = turnosFechados.find(
    (turno) => minutos >= emMinutos(turno.inicio) && minutos < emMinutos(turno.fim)
  )
  const retroativo = Boolean(turnoRetroativo)
  const dealerAtribuido = turnoRetroativo?.dealer ?? turnoAberto.dealer
  const turnoAtribuido = turnoRetroativo?.numero ?? turnoAberto.numero

  return (
    <section className="cv-panel cv-ticks cv-rise cv-d1 overflow-hidden rounded-2xl p-5">
      <h2 className="cv-text flex items-center gap-2 text-[15px] font-semibold">
        <HandCoins className="cv-live-text size-4 shrink-0" aria-hidden="true" />
        Lançar rake
      </h2>

      <div className="cv-panel-quiet cv-line mt-4 flex items-center rounded-xl border focus-within:ring-2">
        <span className="cv-text-soft font-cv-mono pl-3.5 text-[20px] opacity-70">R$</span>
        <input
          inputMode="numeric"
          value={valor}
          onChange={(e) => onDigitarValor?.(e.target.value)}
          aria-label="Valor do rake"
          placeholder="0"
          className="cv-text font-cv-mono cv-num h-18 w-full bg-transparent px-3.5 text-right text-[34px] font-bold outline-none placeholder:opacity-25"
        />
      </div>

      {/* As duas horas, lado a lado. Elas existem separadas porque a hora de
          ocorrência é que decide o turno — e é a única que o operador digita. */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="hora-saida"
            className="cv-text-soft cv-engraved block text-[9px] font-semibold tracking-[0.16em] uppercase"
          >
            Saiu da mesa
          </label>
          <div className="cv-panel-quiet cv-line mt-2 flex items-center rounded-xl border focus-within:ring-2">
            <Clock className="cv-live-text ml-3 size-4 shrink-0" aria-hidden="true" />
            <input
              id="hora-saida"
              value={horaSaida}
              onChange={(e) => onMudarHora?.(e.target.value)}
              className="cv-text font-cv-mono cv-num h-12 w-full bg-transparent px-2.5 text-[16px] font-bold outline-none"
            />
          </div>
        </div>

        <div>
          <p className="cv-text-soft cv-engraved text-[9px] font-semibold tracking-[0.16em] uppercase">
            Digitado agora
          </p>
          <div className="cv-panel-quiet mt-2 flex h-12 items-center gap-2 rounded-xl px-3">
            <PenLine className="cv-text-soft size-4 shrink-0 opacity-60" aria-hidden="true" />
            <span className="cv-text-soft font-cv-mono cv-num text-[16px] font-semibold">
              {horaAtual}
            </span>
          </div>
        </div>
      </div>

      <div className="cv-panel-quiet mt-4 rounded-xl p-3.5">
        <p className="cv-text text-[13px] leading-snug">
          Será atribuído ao{' '}
          <strong className="cv-live-text">
            turno {turnoAtribuido} · {dealerAtribuido}
          </strong>
          , pela hora em que saiu da mesa.
        </p>
        {retroativo ? (
          <p className="cv-ch-limite cv-accent-text mt-2.5 flex items-start gap-2 text-[12.5px] leading-snug">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Esse horário está dentro de um turno já fechado. Confirma?
          </p>
        ) : null}
      </div>

      <button
        type="button"
        disabled={numero <= 0}
        onClick={onLancar}
        className="cv-ch-live cv-btn cv-shine mt-4 h-14 w-full text-[14px] hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-35 disabled:saturate-0 disabled:hover:translate-y-0"
      >
        Lançar {numero > 0 ? reais(numero) : 'rake'} e conferir o caixa
      </button>
      <p className="cv-text-soft mt-2.5 text-center text-[11px] leading-snug">
        O checkpoint abre em seguida. É aqui que a conta fecha ou não fecha.
      </p>
    </section>
  )
}
