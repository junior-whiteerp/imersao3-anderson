import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  ChevronRight,
  CircleCheck,
  Minus,
  OctagonAlert,
  Power,
} from 'lucide-react'

/**
 * Os cinco estados do caixa, na ordem em que aparecem numa noite.
 *
 * A regra N8 do PRD manda que diferenca esperada nunca use vermelho: enquanto
 * o rake esta na mesa, a conta nao fecha e esta certo que nao feche. Se o app
 * alertar nessa hora, ele alerta errado quase o tempo todo, o operador desliga
 * a atencao, e o detector de furo morre junto.
 */
export type CaixaEstado = 'sem-sessao' | 'neutro' | 'fechado' | 'revisar' | 'furo'

export interface CaixaStatus {
  estado: CaixaEstado
  /** Hora atual da sessao, ex: "21h47" */
  hora?: string
  /** Numero do turno aberto */
  turno?: number
  /** Dealer do turno aberto */
  dealer?: string
  /** Quantos jogadores estao na mesa agora */
  jogadores?: number
  /** Linha de contexto: janela, hora do ultimo checkpoint, recomendacao */
  mensagem?: string
  /** Leitura principal: "Caixa fechado", "Faltam R$ 480", "R$ 320" */
  valor?: string
  /** Substitui o rotulo padrao do estado, quando o numero exibido pede outro nome. */
  rotulo?: string
}

interface EstadoStyle {
  /** Classe de canal: troca --cv-accent, e regua, brilho e numero leem dela. */
  canal: string
  icon: LucideIcon
  rotulo: string
}

const ESTADOS: Record<CaixaEstado, EstadoStyle> = {
  'sem-sessao': { canal: 'cv-ch-neutro', icon: Power, rotulo: 'Sem sessão' },
  neutro: { canal: 'cv-ch-neutro', icon: Minus, rotulo: 'Aguardando rake' },
  fechado: { canal: 'cv-ch-fecha', icon: CircleCheck, rotulo: 'Checkpoint' },
  revisar: { canal: 'cv-ch-revisar', icon: AlertTriangle, rotulo: 'Revisar a janela' },
  furo: { canal: 'cv-ch-suspender', icon: OctagonAlert, rotulo: 'Divergência' },
}

export interface CaixaStatusBarProps {
  status?: CaixaStatus
  /** Leva o operador ate a janela do checkpoint. So e oferecido em revisar e furo. */
  onStatusClick?: () => void
}

/**
 * A faixa de estado do caixa: a peca fixa que faz o Caixa Vivo ser o que e.
 *
 * Ela nunca sai da tela. O operador sabe se a noite esta fechando sem navegar
 * ate lugar nenhum, e a leitura e a mesma em todas as secoes.
 *
 * A regua da esquerda e a borda de uma ficha de poker vista de lado — o mesmo
 * tracejado da marca. Ela e o unico lugar do shell que muda de cor, e por isso
 * a cor ali significa alguma coisa.
 */
export function CaixaStatusBar({ status, onStatusClick }: CaixaStatusBarProps) {
  const estado = status?.estado ?? 'sem-sessao'
  const s = ESTADOS[estado]
  const Icon = s.icon

  // So faz sentido navegar ate a janela quando existe janela para revisar.
  const acionavel = Boolean(onStatusClick) && (estado === 'revisar' || estado === 'furo')
  const rodando = estado !== 'sem-sessao'
  const valor = status?.valor ?? '—'
  // "Caixa fechado" e um julgamento e vai na serifa; "R$ 480" e um fato e vai na
  // mono. A forma da letra diz qual dos dois o operador esta lendo.
  const ehNumero = /\d/.test(valor)

  const contexto = [
    status?.turno != null ? `Turno ${status.turno}` : null,
    status?.dealer,
    status?.jogadores != null ? `${status.jogadores} na mesa` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const conteudo = (
    <div className="flex min-h-[62px] flex-1 items-center gap-3 px-3 py-2 sm:gap-6 sm:px-5">
      {/* Contexto: hora, turno, dealer. Sempre em tom neutro, inclusive no furo.
          O app mostra a janela e quem estava no turno; ele nao acusa ninguem. */}
      <div className="flex min-w-0 flex-col gap-1">
        <span className="flex items-center gap-2">
          {rodando ? (
            <span
              className="cv-live-text relative flex size-1.5 shrink-0 items-center justify-center"
              aria-hidden="true"
            >
              <span className="cv-pulse absolute inset-0" />
              <span className="relative size-1.5 rounded-full bg-current" />
            </span>
          ) : null}
          <span className="cv-text cv-num font-cv-mono text-[19px] leading-none font-semibold">
            {status?.hora ?? '--h--'}
          </span>
        </span>
        <span className="cv-text-soft truncate text-[10.5px] leading-none font-medium tracking-[0.04em]">
          {contexto || 'Nenhum turno aberto'}
        </span>
      </div>

      <span className="cv-line h-9 w-px shrink-0 border-l" aria-hidden="true" />

      {/* Leitura principal: o veredito do ultimo checkpoint. */}
      <div className="flex min-w-0 flex-1 flex-col items-end gap-1 text-right">
        <span className="cv-accent-text cv-engraved flex items-center gap-1.5 text-[9.5px] leading-none font-semibold tracking-[0.16em] uppercase">
          <Icon className="size-3 shrink-0" aria-hidden="true" />
          {status?.rotulo ?? s.rotulo}
        </span>
        <span
          className={`cv-accent-text max-w-full truncate leading-none ${
            ehNumero
              ? 'cv-num font-cv-mono text-[17px] font-semibold sm:text-[19px]'
              : 'font-cv-display text-[21px] sm:text-[24px]'
          }`}
        >
          {valor}
        </span>
      </div>

      {status?.mensagem ? (
        <span className="cv-text-soft hidden max-w-72 truncate text-[11px] leading-snug lg:block">
          {status.mensagem}
        </span>
      ) : null}

      {acionavel ? (
        <span className="cv-accent-text flex shrink-0 items-center gap-1 text-[10px] font-semibold tracking-[0.1em] uppercase">
          <span className="hidden sm:inline">Ver janela</span>
          <ChevronRight className="size-4" aria-hidden="true" />
        </span>
      ) : null}
    </div>
  )

  // A regua de ficha, o filete de brilho e a chapa. O canal pinta os tres.
  const moldura = (
    <>
      <span
        className="cv-chip-rail cv-accent-text w-[4px] shrink-0 self-stretch"
        aria-hidden="true"
      />
      {conteudo}
    </>
  )

  const classeBase = `cv-panel cv-accent-fill cv-line flex items-stretch rounded-none border-x-0 border-t-0 backdrop-blur-xl ${s.canal}`

  const corpo = acionavel ? (
    <button
      type="button"
      onClick={onStatusClick}
      aria-label={`${status?.rotulo ?? s.rotulo}: ${status?.valor ?? ''}. Ver a janela do checkpoint.`}
      className={`${classeBase} w-full cursor-pointer text-left transition-[filter] duration-200 hover:brightness-[1.08] focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none`}
    >
      {moldura}
    </button>
  ) : (
    <div className={classeBase}>{moldura}</div>
  )

  // A regiao viva envolve os dois formatos.
  //
  // Antes ela existia so no estado neutro: quem usa leitor de tela ouvia a
  // noite inteira de banalidade e ficava mudo justamente quando o veredito de
  // furo chegava — porque ali a faixa virava botao e a regiao sumia junto.
  return (
    <div role="status" aria-live="polite" aria-atomic="true">
      {corpo}
    </div>
  )
}
