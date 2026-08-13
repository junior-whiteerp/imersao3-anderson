import type { ReactNode } from 'react'
import { Ban, Check, EyeOff, X } from 'lucide-react'

function reais(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export interface TelaConfirmacaoProps {
  jogador: string
  valor: number
  /** Quantas contingencias ja foram registradas nesta sessao */
  contingenciasNaSessao: number
  tetoContingencias: number
  /**
   * Ocupa a tela inteira, sem a navegacao nem a faixa de caixa por perto.
   *
   * E o modo real de uso: o aparelho gira e vai para a mao do jogador. Deixar o
   * painel do clube visivel ali mostra a exposicao de todo mundo na mesa para
   * quem so precisava conferir um numero.
   */
  plenaTela?: boolean
  /** Caminhos secundarios do operador, ancorados no pe da tela cheia. */
  rodape?: ReactNode
  onConfirmar?: () => void
  onRecusar?: () => void
  onContingencia?: () => void
}

/**
 * A tela girada para o jogador.
 *
 * E o que cumpre a metrica M3 e o que a DEC-006 escolheu no lugar de entregar
 * sem confirmacao nenhuma. Tudo aqui e desenhado para ser lido de frente, do
 * outro lado da mesa, por alguem que nao esta segurando o aparelho: um numero
 * so, do tamanho da tela, e dois botoes que nao dao para errar.
 */
export function TelaConfirmacao({
  jogador,
  valor,
  contingenciasNaSessao,
  tetoContingencias,
  plenaTela = false,
  rodape,
  onConfirmar,
  onRecusar,
  onContingencia,
}: TelaConfirmacaoProps) {
  const estourou = contingenciasNaSessao >= tetoContingencias
  const proxima = contingenciasNaSessao + 1

  /**
   * O valor cresce com a tela, mas o teto muda com o modo.
   *
   * Na tela cheia ele pode ocupar o aparelho inteiro. Embutido, ele vive dentro
   * de um cartao de 32rem — e com o teto da tela cheia o numero vazava pela
   * lateral em qualquer valor de quatro digitos.
   */
  const tamanhoDoValor = plenaTela
    ? 'text-[clamp(3rem,13vw,6.5rem)]'
    : 'text-[clamp(2.25rem,8vw,4rem)]'

  const miolo = (
    <div
      className={`relative flex w-full flex-col items-center text-center ${
        plenaTela ? 'max-w-2xl' : 'max-w-lg'
      }`}
    >
      {/* A ficha por tras do numero. Gira uma volta a cada 70 segundos: rapido
          o bastante para a tela parecer viva, lento o bastante para ninguem
          reparar enquanto le. */}
      <span
        className="cv-live-text pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[118%] max-w-[30rem] -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-[14px] border-dashed opacity-[0.13] [animation-duration:70s] motion-reduce:animate-none"
        aria-hidden="true"
      />
      <span
        className="cv-live-text pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[86%] max-w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-[0.18]"
        aria-hidden="true"
      />

      <p className="cv-text-soft cv-engraved relative text-[10px] font-semibold tracking-[0.24em] uppercase">
        Confira o valor
      </p>

      <p className="cv-text font-cv-display relative mt-3 text-[32px] leading-none sm:text-[40px]">
        {jogador}
      </p>

      {/* Corpo grande de proposito: precisa ser legivel do outro lado da mesa. */}
      <p
        className={`cv-text font-cv-mono cv-num cv-stamp relative mt-7 leading-[0.85] font-bold whitespace-nowrap ${tamanhoDoValor}`}
      >
        {reais(valor)}
      </p>

      <p className="cv-text-soft relative mt-7 max-w-xs text-[13.5px] leading-relaxed">
        Estas fichas entram na sua conta. Ao confirmar, você reconhece o valor.
      </p>

      <div className="relative mt-9 grid w-full grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onRecusar}
          className="cv-btn-quiet h-[4.5rem] text-[15px] hover:-translate-y-px focus-visible:ring-2 focus-visible:outline-none"
        >
          <X className="size-5 shrink-0" aria-hidden="true" />
          Não reconheço
        </button>
        <button
          type="button"
          onClick={onConfirmar}
          className="cv-ch-live cv-btn cv-shine h-[4.5rem] text-[15px] hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Check className="size-5 shrink-0" aria-hidden="true" />
          Confirmar
        </button>
      </div>

      {/* Discreto de proposito: e a excecao, nao o caminho. Mas precisa existir,
          senao ninguem saberia que o aceite presencial foi burlado. */}
      <div className="cv-line relative mt-7 w-full border-t pt-4">
        {estourou ? (
          <p className="cv-ch-suspender cv-accent-text flex items-center justify-center gap-2 text-[13px] font-semibold">
            <Ban className="size-4 shrink-0" aria-hidden="true" />
            {proxima}ª contingência desta sessão. A ficha não sai.
          </p>
        ) : (
          <button
            type="button"
            onClick={onContingencia}
            className="cv-text-soft hover:cv-text mx-auto flex items-center gap-2 rounded-md px-3 py-2 text-[13px] underline underline-offset-[6px] transition-colors"
          >
            <EyeOff className="size-4 shrink-0" aria-hidden="true" />O jogador não olhou
            <span className="font-cv-mono cv-num">
              ({proxima} de {tetoContingencias})
            </span>
          </button>
        )}
      </div>
    </div>
  )

  if (!plenaTela) {
    return (
      <section className="cv-panel cv-ticks cv-rise mx-auto flex max-w-lg flex-col items-center rounded-2xl px-6 py-10">
        {miolo}
      </section>
    )
  }

  return (
    <section
      className="cv-kiosk cv-grain cv-text fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto px-5 py-8"
      aria-label={`Confirmação de ${reais(valor)} para ${jogador}`}
    >
      {miolo}
      {rodape ? <div className="relative mt-7 w-full max-w-2xl">{rodape}</div> : null}
    </section>
  )
}
