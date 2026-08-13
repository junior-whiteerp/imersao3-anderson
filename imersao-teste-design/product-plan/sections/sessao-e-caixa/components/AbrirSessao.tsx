import { useState } from 'react'
import { Play } from 'lucide-react'

export interface AbrirSessaoProps {
  clube: string
  onAbrir?: (caixaInicial: number) => void
}

/**
 * O estado vazio da secao: nenhuma sessao aberta.
 *
 * Uma pergunta so, um campo so, um botao so. E a primeira coisa que alguem ve
 * ao abrir o app, e a noite nao comeca sem o caixa inicial de fichas.
 */
export function AbrirSessao({ clube, onAbrir }: AbrirSessaoProps) {
  const [valor, setValor] = useState('')
  const numero = Number(valor.replace(/\D/g, ''))

  return (
    <section className="cv-panel cv-ticks cv-notch cv-rise relative mx-auto max-w-md overflow-hidden p-7 text-center">
      {/* A ficha, como marca d'água da tela que abre a noite. */}
      <span
        className="cv-live-text pointer-events-none absolute -top-16 left-1/2 aspect-square w-64 -translate-x-1/2 rounded-full border-[10px] border-dashed opacity-[0.1]"
        aria-hidden="true"
      />

      <p className="cv-text-soft cv-engraved relative text-[9.5px] font-semibold tracking-[0.22em] uppercase">
        {clube}
      </p>
      <h2 className="cv-text font-cv-display relative mt-3 text-[32px] leading-[1.05]">
        Nenhuma sessão aberta
      </h2>
      <p className="cv-text-soft relative mt-3 text-[13px] leading-relaxed">
        Conte o caixa de fichas antes de começar. Esse número é o ponto de partida da
        conferência da noite inteira.
      </p>

      <label
        htmlFor="caixa-inicial"
        className="cv-text-soft cv-engraved relative mt-7 block text-left text-[9.5px] font-semibold tracking-[0.16em] uppercase"
      >
        Caixa inicial de fichas
      </label>
      <div className="cv-panel-quiet cv-line relative mt-2 flex items-center rounded-xl border focus-within:ring-2">
        <span className="cv-text-soft font-cv-mono pl-3.5 text-[18px] font-semibold opacity-70">
          R$
        </span>
        <input
          id="caixa-inicial"
          inputMode="numeric"
          value={valor}
          onChange={(evento) => setValor(evento.target.value)}
          placeholder="0"
          className="cv-text font-cv-mono cv-num h-16 w-full bg-transparent px-3 text-right text-[28px] font-bold outline-none placeholder:opacity-25"
        />
      </div>

      <button
        type="button"
        disabled={numero <= 0}
        onClick={() => onAbrir?.(numero)}
        className="cv-ch-live cv-btn cv-shine relative mt-4 h-14 w-full text-[14.5px] hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-35 disabled:saturate-0 disabled:hover:translate-y-0"
      >
        <Play className="size-4 shrink-0" aria-hidden="true" />
        Abrir a noite
      </button>
    </section>
  )
}
