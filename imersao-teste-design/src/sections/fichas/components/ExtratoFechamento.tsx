import { EyeOff } from 'lucide-react'
import type { Extrato, TipoMovimentacao } from './tipos'

/** O tipo cru e identificador; o rotulo e o que o operador le. */
const ROTULO: Record<TipoMovimentacao, string> = {
  retirada: 'Retirada',
  devolucao: 'Devolução',
  rake: 'Rake',
}

function reais(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export interface ExtratoFechamentoProps {
  extrato: Extrato
  onEncerrarConta?: () => void
}

/**
 * O extrato linha a linha do fechamento.
 *
 * Mostrar so o total e o que faz o jogador contestar. Cada linha aparece com
 * hora, tipo e valor — e a contingencia fica marcada, porque ela e a unica
 * linha em que o jogador nao olhou a tela.
 *
 * O papel picotado no topo e no pe nao e enfeite: e o que diz, sem legenda, que
 * isto substitui o pedaco de papel que ia para o lixo depois do acerto.
 */
export function ExtratoFechamento({ extrato, onEncerrarConta }: ExtratoFechamentoProps) {
  const retirado = extrato.linhas
    .filter((linha) => linha.tipo === 'retirada')
    .reduce((soma, linha) => soma + linha.valor, 0)
  const devolvido = extrato.linhas
    .filter((linha) => linha.tipo === 'devolucao')
    .reduce((soma, linha) => soma + linha.valor, 0)
  const resultado = devolvido - retirado

  return (
    <section className="cv-panel cv-rise mx-auto max-w-md overflow-hidden rounded-2xl">
      {/* Picote de comprovante. */}
      <span
        className="cv-text-soft cv-chip-rail-x block h-[3px] w-full opacity-40"
        aria-hidden="true"
      />

      <header className="cv-line border-b px-5 py-4">
        <p className="cv-text font-cv-display text-[24px] leading-none">
          {extrato.jogador}
        </p>
        <p className="cv-text-soft font-cv-mono cv-num mt-2 text-[11px]">
          {extrato.entrouAs}–{extrato.saiuAs}
        </p>
      </header>

      <ul className="cv-divide">
        {extrato.linhas.map((linha) => {
          const devolucao = linha.tipo === 'devolucao'
          return (
            <li key={linha.id} className="flex items-center gap-3 px-5 py-2.5">
              <span className="cv-text-soft font-cv-mono cv-num w-12 shrink-0 text-[11.5px]">
                {linha.hora}
              </span>
              <span className="cv-text flex min-w-0 flex-1 items-center gap-1.5 text-[13px]">
                {ROTULO[linha.tipo]}
                {linha.confirmacao === 'contingencia' ? (
                  <span
                    className="cv-ch-chrome cv-accent-text cv-accent-fill flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold"
                    title="O jogador não olhou a tela"
                  >
                    <EyeOff className="size-2.5" aria-hidden="true" />
                    contingência
                  </span>
                ) : null}
              </span>
              <span className="cv-text font-cv-mono cv-num shrink-0 text-[13px] font-semibold">
                {devolucao ? '+' : '−'}
                {reais(linha.valor).replace('R$', 'R$ ')}
              </span>
            </li>
          )
        })}
      </ul>

      <div
        className={`cv-line border-t px-5 py-4 ${
          resultado >= 0 ? 'cv-ch-fecha' : 'cv-ch-neutro'
        }`}
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="cv-text-soft cv-engraved text-[9.5px] font-semibold tracking-[0.16em] uppercase">
            Resultado da noite
          </span>
          {/* Zero não leva sinal: "+R$ 0" faz o olho procurar um ganho que não
              existe. Quem empatou devolveu o que tirou, e é só isso. */}
          <span className="cv-accent-text font-cv-mono cv-num text-[22px] font-bold">
            {resultado > 0 ? '+' : resultado < 0 ? '−' : ''}
            {reais(Math.abs(resultado))}
          </span>
        </div>

        <button
          type="button"
          onClick={onEncerrarConta}
          className="cv-ch-live cv-btn cv-shine mt-4 h-13 w-full text-[14px] hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Encerrar a conta
        </button>
        <p className="cv-text-soft mt-2.5 text-center text-[11px] leading-snug">
          Devolução é sempre fechamento de conta. Lançamentos ainda aguardando
          confirmação serão cancelados.
        </p>
      </div>

      <span
        className="cv-text-soft cv-chip-rail-x block h-[3px] w-full opacity-40"
        aria-hidden="true"
      />
    </section>
  )
}
