/**
 * A marca do StackTrack.
 *
 * O símbolo diz o nome sem precisar do nome: uma **pilha de fichas** (stack) e
 * o **rastro** que sobe a partir dela (track). É a leitura literal do produto —
 * ele acompanha uma pilha de fichas ao longo da noite.
 *
 * A borda tracejada da ficha de cima é a mesma forma que reaparece no
 * checkpoint, no turno aberto e no avatar do operador. A marca não é um
 * desenho à parte: é o vocabulário do app na sua forma mais curta.
 *
 * A cor aqui é a mais intensa do produto de propósito, e só aqui. Dentro do
 * app, verde, âmbar e vermelho pertencem ao veredito do caixa; na porta de
 * entrada não há veredito nenhum na tela, então a marca pode brilhar sem
 * roubar significado de nada.
 */

import { useId } from 'react'

export type TamanhoDaMarca = 'sm' | 'md' | 'lg'

const SIMBOLO: Record<TamanhoDaMarca, string> = {
  sm: 'size-7',
  md: 'size-10',
  lg: 'size-16',
}

const PALAVRA: Record<TamanhoDaMarca, string> = {
  sm: 'text-[15px]',
  md: 'text-[22px]',
  lg: 'text-[38px]',
}

/**
 * O halo da marca, em valor literal.
 *
 * Aqui não entra `color-mix()` nem `var()`: dentro de `filter` e `text-shadow`
 * eles obrigam o navegador a recalcular a cada quadro, e a página com a marca
 * grande girando nunca chega a ficar parada. Custou uma captura de tela
 * travada para descobrir.
 */
const HALO = 'rgba(103, 232, 249, 0.45)'

export interface SimboloStackTrackProps {
  tamanho?: TamanhoDaMarca
  /** Halo em volta do símbolo. Ligado na porta de entrada, desligado no chrome. */
  brilho?: boolean
  className?: string
}

export function SimboloStackTrack({
  tamanho = 'md',
  brilho = false,
  className = '',
}: SimboloStackTrackProps) {
  // O gradiente precisa de id único por instância. A marca aparece duas vezes
  // no shell (lateral e topo do celular), e dois `<linearGradient>` com o mesmo
  // id deixam o Chrome remoendo qual dos dois vale — a página nunca fica parada,
  // e capturar a tela dela trava.
  const tinta = `stacktrack-${useId()}`

  return (
    <svg
      viewBox="0 0 44 44"
      role="img"
      aria-label="StackTrack"
      className={`${SIMBOLO[tamanho]} shrink-0 ${className}`}
      style={brilho ? { filter: `drop-shadow(0 0 14px ${HALO})` } : undefined}
    >
      <defs>
        <linearGradient id={tinta} x1="4" y1="40" x2="40" y2="4">
          <stop offset="0%" stopColor="var(--color-teal-400)" />
          <stop offset="55%" stopColor="var(--color-cyan-300)" />
          <stop offset="100%" stopColor="var(--color-sky-200)" />
        </linearGradient>
      </defs>

      {/* A pilha. A de baixo é a mais opaca: o olho lê profundidade antes de
          contar quantas são. */}
      <g stroke={`url(#${tinta})`} fill="none" strokeWidth="2.4">
        <ellipse cx="16" cy="34" rx="12" ry="4.2" opacity="0.4" />
        <ellipse cx="16" cy="28.5" rx="12" ry="4.2" opacity="0.68" />
        <ellipse cx="16" cy="23" rx="12" ry="4.2" strokeDasharray="3.4 3.2" />
      </g>

      {/* O rastro: sai da ficha de cima e sobe. */}
      <path
        d="M25.5 19.5 L31 13.5 L37 7"
        stroke={`url(#${tinta})`}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="37.5" cy="6.5" r="3.4" fill={`url(#${tinta})`} />
    </svg>
  )
}

export interface MarcaStackTrackProps {
  tamanho?: TamanhoDaMarca
  brilho?: boolean
  /** Linha de apoio sob a palavra. Ex: a release em que o app está. */
  legenda?: string
  /** Empilha símbolo e palavra em vez de deixá-los lado a lado. */
  empilhada?: boolean
}

export function MarcaStackTrack({
  tamanho = 'md',
  brilho = false,
  legenda,
  empilhada = false,
}: MarcaStackTrackProps) {
  return (
    <div
      className={`flex ${
        empilhada ? 'flex-col items-center gap-4 text-center' : 'items-center gap-3'
      }`}
    >
      <SimboloStackTrack tamanho={tamanho} brilho={brilho} />
      <div className={empilhada ? '' : 'min-w-0'}>
        {/* "Stack" em tinta comum, "Track" na cor da marca: o rastro é a parte
            que o produto adiciona ao que o clube já tinha. */}
        <p
          className={`cv-text font-cv-sans leading-none font-semibold tracking-[-0.02em] ${PALAVRA[tamanho]}`}
        >
          Stack
          <span
            className="cv-live-text"
            style={brilho ? { textShadow: `0 0 22px ${HALO}` } : undefined}
          >
            Track
          </span>
        </p>
        {legenda ? (
          <p className="cv-text-soft cv-engraved mt-2 text-[9.5px] font-semibold tracking-[0.22em] uppercase">
            {legenda}
          </p>
        ) : null}
      </div>
    </div>
  )
}
