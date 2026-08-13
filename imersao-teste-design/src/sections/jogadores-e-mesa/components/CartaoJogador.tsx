import { ChevronRight, Clock, EyeOff } from 'lucide-react'
import { finalDoWhatsapp } from './identidade'
import type { JogadorNaMesa } from './tipos'

function reais(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export interface CartaoJogadorProps {
  jogador: JogadorNaMesa
  /**
   * Há outro jogador na mesa com o mesmo nome (A18).
   * Quando há, o WhatsApp aparece — é a outra metade da identidade, e sem ele
   * pai e filho ficam dois cartões idênticos até a primeira ficha sair.
   */
  desambiguar?: boolean
  onAbrir?: (jogadorId: string) => void
}

/**
 * Um jogador na mesa.
 *
 * O uso do limite conta o confirmado mais o que esta aguardando confirmacao —
 * e a regra N6, que nasceu de um caso de borda: duas retiradas pendentes que,
 * somadas, estouram o limite. Contar so o confirmado deixa a segunda passar.
 */
export function CartaoJogador({ jogador, desambiguar, onAbrir }: CartaoJogadorProps) {
  const comprometido = jogador.emMao + jogador.aguardando
  const uso = jogador.limite > 0 ? Math.min(comprometido / jogador.limite, 1) : 0
  const apertado = uso >= 0.8
  const esperando = jogador.aguardando > 0

  return (
    <li className={esperando ? 'cv-ch-chrome' : 'cv-ch-neutro'}>
      <button
        type="button"
        onClick={() => onAbrir?.(jogador.id)}
        className={`cv-panel group w-full rounded-2xl p-4 text-left transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:outline-none ${
          esperando ? 'cv-accent-ring' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="cv-text flex items-center gap-2 truncate text-[15px] font-semibold">
              {jogador.nome}
              {jogador.contingencias > 0 ? (
                // Violeta, nao ambar: contingencia nao e erro do caixa, e um
                // registro de que o aceite presencial foi burlado.
                //
                // O numero e o DESTE jogador. O teto de 3 e da sessao inteira e
                // aparece no topo da lista — juntar os dois aqui fazia o cartao
                // dizer "1 de 3" quando a sessao ja tinha gastado as tres.
                <span
                  className="cv-ch-chrome cv-accent-text cv-accent-fill flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-semibold"
                  title="Vezes em que o operador confirmou sem este jogador olhar a tela"
                >
                  <EyeOff className="size-2.5" aria-hidden="true" />
                  {jogador.contingencias === 1
                    ? '1 contingência'
                    : `${jogador.contingencias} contingências`}
                </span>
              ) : null}
            </p>
            <p className="cv-text-soft font-cv-mono cv-num mt-1 flex items-center gap-1 text-[10.5px]">
              <Clock className="size-3 shrink-0" aria-hidden="true" />
              desde {jogador.entrouAs}
              {desambiguar ? (
                <span className="opacity-70"> · {finalDoWhatsapp(jogador.whatsapp)}</span>
              ) : null}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="cv-text font-cv-mono cv-num text-[19px] leading-none font-bold">
              {reais(jogador.emMao)}
            </p>
            <p className="cv-text-soft cv-engraved mt-1.5 text-[9px] font-semibold tracking-[0.14em] uppercase">
              em fichas
            </p>
          </div>

          <ChevronRight
            className="cv-text-soft mt-1 size-4 shrink-0 opacity-40 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>

        <div className="mt-3.5">
          <div className="flex items-baseline justify-between gap-2 text-[10.5px]">
            <span className="cv-text-soft truncate">
              Limite <span className="font-cv-mono cv-num">{reais(jogador.limite)}</span>
              {esperando ? (
                <span className="cv-accent-text font-cv-mono cv-num font-semibold">
                  {' '}
                  · {reais(jogador.aguardando)} aguardando
                </span>
              ) : null}
            </span>
            <span
              className={`font-cv-mono cv-num shrink-0 font-semibold ${
                apertado ? 'cv-ch-limite cv-accent-text' : 'cv-text-soft'
              }`}
            >
              {Math.round(uso * 100)}%
            </span>
          </div>
          <div className="cv-panel-quiet mt-2 h-1.5 overflow-hidden rounded-full">
            <div
              className={`h-full rounded-full ${
                apertado ? 'cv-ch-limite cv-accent-bg' : 'cv-text-soft bg-current opacity-45'
              }`}
              style={{ width: `${uso * 100}%` }}
            />
          </div>
        </div>
      </button>
    </li>
  )
}
