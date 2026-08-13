import { useEffect, useRef, useState } from 'react'

/**
 * O fundo da porta de entrada: uma mesa de poker vista de muito perto.
 *
 * Fichas empilhadas, duas cartas caídas e os quatro naipes, tudo desenhado em
 * SVG — nada de imagem baixada, que a exportação teria de carregar junto.
 *
 * A cena é **interativa por movimento do ponteiro**, e só por isso: cada camada
 * anda uma distância diferente, e o conjunto ganha profundidade quando a pessoa
 * mexe o mouse. Não há animação em laço. Foi decisão, não economia — uma página
 * que nunca fica parada consome bateria à toa no aparelho da mesa, e nem
 * screenshot dela é possível.
 *
 * Quem pediu menos movimento recebe a cena inteira, parada.
 */

/** Uma ficha de poker vista de frente, com as marcas da borda. */
function Ficha({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="3" />
      {/* As seis marcas da borda: é o que faz um círculo virar ficha. */}
      {[0, 60, 120, 180, 240, 300].map((angulo) => (
        <rect
          key={angulo}
          x="45"
          y="1"
          width="10"
          height="14"
          rx="2"
          fill="currentColor"
          transform={`rotate(${angulo} 50 50)`}
        />
      ))}
      <circle
        cx="50"
        cy="50"
        r="33"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="6 5"
      />
      <circle cx="50" cy="50" r="19" fill="none" stroke="currentColor" strokeWidth="3" />
    </svg>
  )
}

/** Uma carta de baralho, com o pip no canto. */
function Carta({
  naipe,
  className = '',
}: {
  naipe: '♠' | '♥' | '♦' | '♣'
  className?: string
}) {
  return (
    <svg viewBox="0 0 100 142" className={className} aria-hidden="true">
      <rect
        x="2"
        y="2"
        width="96"
        height="138"
        rx="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <rect
        x="10"
        y="10"
        width="80"
        height="122"
        rx="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <text
        x="50"
        y="86"
        textAnchor="middle"
        fontSize="52"
        fill="currentColor"
        aria-hidden="true"
      >
        {naipe}
      </text>
    </svg>
  )
}

interface Peca {
  chave: string
  /** Quanto a peça anda com o ponteiro. Maior = mais perto do olho. */
  profundidade: number
  /** Posição e tamanho, em classes utilitárias. */
  posicao: string
  /** Giro fixo, para nada ficar alinhado como grade. */
  giro: string
  cor: string
  opacidade: string
  conteudo: React.ReactNode
}

const PECAS: Peca[] = [
  // ── Fichas: a pilha do produto, espalhada pela mesa ────────────────────
  {
    chave: 'ficha-1',
    profundidade: 26,
    posicao: 'left-[6%] top-[14%] w-40 sm:w-56',
    giro: 'rotate(-12deg)',
    cor: 'text-cyan-300',
    opacidade: 'opacity-[0.16]',
    conteudo: <Ficha className="size-full" />,
  },
  {
    chave: 'ficha-2',
    profundidade: 16,
    posicao: 'left-[16%] top-[52%] w-24 sm:w-36',
    giro: 'rotate(8deg)',
    cor: 'text-teal-300',
    opacidade: 'opacity-[0.11]',
    conteudo: <Ficha className="size-full" />,
  },
  {
    chave: 'ficha-3',
    profundidade: 34,
    posicao: 'right-[8%] top-[62%] w-48 sm:w-64',
    giro: 'rotate(15deg)',
    cor: 'text-cyan-200',
    opacidade: 'opacity-[0.13]',
    conteudo: <Ficha className="size-full" />,
  },
  {
    chave: 'ficha-4',
    profundidade: 10,
    posicao: 'right-[24%] top-[8%] w-20 sm:w-28',
    giro: 'rotate(-22deg)',
    cor: 'text-sky-200',
    opacidade: 'opacity-[0.09]',
    conteudo: <Ficha className="size-full" />,
  },
  // ── Cartas: caídas nos cantos, como quem largou a mão ──────────────────
  {
    chave: 'carta-1',
    profundidade: 30,
    posicao: 'left-[10%] bottom-[8%] w-28 sm:w-40',
    giro: 'rotate(-18deg)',
    cor: 'text-stone-200',
    opacidade: 'opacity-[0.12]',
    conteudo: <Carta naipe="♠" className="size-full" />,
  },
  {
    chave: 'carta-2',
    profundidade: 22,
    posicao: 'left-[19%] bottom-[6%] w-28 sm:w-40',
    giro: 'rotate(-4deg)',
    cor: 'text-rose-200',
    opacidade: 'opacity-[0.1]',
    conteudo: <Carta naipe="♥" className="size-full" />,
  },
  {
    chave: 'carta-3',
    profundidade: 38,
    posicao: 'right-[9%] top-[10%] w-28 sm:w-40',
    giro: 'rotate(16deg)',
    cor: 'text-stone-200',
    opacidade: 'opacity-[0.11]',
    conteudo: <Carta naipe="♣" className="size-full" />,
  },
  {
    chave: 'carta-4',
    profundidade: 28,
    posicao: 'right-[17%] top-[12%] w-28 sm:w-40',
    giro: 'rotate(4deg)',
    cor: 'text-rose-200',
    opacidade: 'opacity-[0.09]',
    conteudo: <Carta naipe="♦" className="size-full" />,
  },
  // ── Naipes soltos: o vocabulário do jogo, em marca d'água ──────────────
  {
    chave: 'naipe-1',
    profundidade: 44,
    posicao: 'left-[38%] top-[6%] text-[110px] sm:text-[160px]',
    giro: 'rotate(-10deg)',
    cor: 'text-cyan-200',
    opacidade: 'opacity-[0.06]',
    conteudo: <span className="leading-none">♠</span>,
  },
  {
    chave: 'naipe-2',
    profundidade: 52,
    posicao: 'right-[36%] bottom-[8%] text-[120px] sm:text-[180px]',
    giro: 'rotate(12deg)',
    cor: 'text-rose-200',
    opacidade: 'opacity-[0.05]',
    conteudo: <span className="leading-none">♥</span>,
  },
  {
    chave: 'naipe-3',
    profundidade: 18,
    posicao: 'left-[4%] top-[42%] text-[80px] sm:text-[120px]',
    giro: 'rotate(18deg)',
    cor: 'text-teal-200',
    opacidade: 'opacity-[0.05]',
    conteudo: <span className="leading-none">♣</span>,
  },
  {
    chave: 'naipe-4',
    profundidade: 40,
    posicao: 'right-[6%] top-[38%] text-[90px] sm:text-[130px]',
    giro: 'rotate(-14deg)',
    cor: 'text-rose-200',
    opacidade: 'opacity-[0.05]',
    conteudo: <span className="leading-none">♦</span>,
  },
]

export function FundoDePoker() {
  const [ponteiro, setPonteiro] = useState({ x: 0, y: 0 })
  const quadro = useRef<number | null>(null)

  useEffect(() => {
    const paradoDePreferencia = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (paradoDePreferencia) return

    function aoMover(evento: PointerEvent) {
      // Uma atualização por quadro. Sem isto, um movimento rápido de mouse
      // dispara centenas de renders por segundo e a cena engasga.
      if (quadro.current !== null) return
      quadro.current = requestAnimationFrame(() => {
        quadro.current = null
        setPonteiro({
          x: (evento.clientX / window.innerWidth - 0.5) * 2,
          y: (evento.clientY / window.innerHeight - 0.5) * 2,
        })
      })
    }

    window.addEventListener('pointermove', aoMover, { passive: true })
    return () => {
      window.removeEventListener('pointermove', aoMover)
      if (quadro.current !== null) cancelAnimationFrame(quadro.current)
    }
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {PECAS.map((peca) => (
        <div
          key={peca.chave}
          className={`absolute ${peca.posicao} ${peca.cor} ${peca.opacidade} transition-transform duration-500 ease-out will-change-transform`}
          style={{
            transform: `translate3d(${(-ponteiro.x * peca.profundidade).toFixed(1)}px, ${(
              -ponteiro.y * peca.profundidade
            ).toFixed(1)}px, 0) ${peca.giro}`,
          }}
        >
          {peca.conteudo}
        </div>
      ))}

      {/* Véu por cima da cena: sem ele, os desenhos brigam com o formulário
          justamente onde o olho precisa pousar. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(58% 46% at 50% 46%, var(--cv-room) 0%, transparent 78%)',
        }}
      />
    </div>
  )
}
