import { ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react'
import { ABERTURA, roteiroCompleto } from './roteiroInicial'

/** Quantos "lugares" a apresentação tem: a abertura mais um por passo. */
export const TOTAL_DE_PASSOS = roteiroCompleto.length + 1

/** O capítulo de uma posição. A posição 0 é a abertura, antes de qualquer ação. */
export function capituloDe(passo: number) {
  if (passo <= 0) return ABERTURA
  const p = roteiroCompleto[Math.min(passo, roteiroCompleto.length) - 1]
  return { titulo: p.titulo, narracao: p.narracao, rota: p.rota, emAs: p.emAs }
}

export interface ApresentacaoProps {
  passo: number
  tocando: boolean
  onIr: (passo: number) => void
  onTocar: (tocando: boolean) => void
  onSair: () => void
}

/**
 * O modo apresentacao: a noite inteira contada em capitulos.
 *
 * Ele existe porque a promessa do produto nao cabe numa tela parada. O furo so
 * significa alguma coisa depois que a pessoa viu as fichas sumirem sem registro
 * e o checkpoint achar a janela — e isso e uma sequencia, nao uma imagem.
 *
 * Nada aqui existe no produto. A barra se veste como legenda de filme, fora da
 * linguagem do app, para que ninguem confunda a narracao com a interface.
 */
export function Apresentacao({
  passo,
  tocando,
  onIr,
  onTocar,
  onSair,
}: ApresentacaoProps) {
  const capitulo = capituloDe(passo)
  const primeiro = passo <= 0
  const ultimo = passo >= TOTAL_DE_PASSOS - 1
  const hora = 'emAs' in capitulo ? capitulo.emAs : null

  return (
    <div
      className="cv-panel cv-ch-live fixed inset-x-0 bottom-14 z-40 border-x-0 border-b-0 backdrop-blur-xl md:inset-x-4 md:bottom-4 md:rounded-2xl md:border"
      role="region"
      aria-label="Apresentação da noite"
    >
      <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3 sm:px-5">
        <span
          className="cv-chip-rail cv-accent-text hidden w-[4px] shrink-0 self-stretch sm:block"
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1">
          <p className="cv-accent-text cv-engraved flex items-center gap-2 text-[9px] font-semibold tracking-[0.18em] uppercase">
            <span className="font-cv-mono cv-num">
              {String(passo).padStart(2, '0')}/{TOTAL_DE_PASSOS - 1}
            </span>
            {hora ? (
              <>
                <span className="opacity-40" aria-hidden="true">
                  ·
                </span>
                <span className="font-cv-mono cv-num">{hora}</span>
              </>
            ) : null}
          </p>
          <p className="cv-text font-cv-display mt-1 truncate text-[19px] leading-tight">
            {capitulo.titulo}
          </p>
          <p className="cv-text-soft mt-1 line-clamp-2 text-[12.5px] leading-snug">
            {capitulo.narracao}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => onIr(passo - 1)}
            disabled={primeiro}
            aria-label="Capítulo anterior"
            className="cv-btn-quiet size-11 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onTocar(!tocando)}
            aria-label={tocando ? 'Pausar' : 'Tocar a noite'}
            className="cv-btn cv-shine size-12"
          >
            {tocando ? (
              <Pause className="size-5" aria-hidden="true" />
            ) : (
              <Play className="size-5" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onIr(passo + 1)}
            disabled={ultimo}
            aria-label="Próximo capítulo"
            className="cv-btn-quiet size-11 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onSair}
            aria-label="Sair da apresentação"
            className="cv-btn-quiet ml-1 size-11"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* A régua de capítulos. Cada traço é um passo; dá para pular direto. */}
      <div className="cv-line mx-auto flex max-w-4xl gap-[3px] border-t px-4 py-2.5 sm:px-5">
        {Array.from({ length: TOTAL_DE_PASSOS }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onIr(i)}
            aria-label={`Ir ao capítulo ${i}: ${capituloDe(i).titulo}`}
            title={capituloDe(i).titulo}
            className="group flex h-4 flex-1 items-center focus-visible:outline-none"
          >
            <span
              className={`block h-[3px] w-full rounded-full transition-all duration-200 group-hover:h-[5px] ${
                i <= passo ? 'cv-accent-bg' : 'cv-text-soft bg-current opacity-25'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
