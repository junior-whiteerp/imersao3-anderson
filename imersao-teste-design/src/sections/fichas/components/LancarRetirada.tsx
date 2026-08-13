import { AlertTriangle, Delete, RotateCcw } from 'lucide-react'
import type { JogadorSelecionado } from './tipos'

function reais(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'apagar']

export interface LancarRetiradaProps {
  jogador: JogadorSelecionado
  valor: string
  onDigitar?: (tecla: string) => void
  onGirarTela?: () => void
  /** Abre o campo de motivo escrito exigido pela regra N10. */
  onLiberar?: () => void
  /** Ja liberado com motivo: o aviso deixa de bloquear o giro da tela. */
  liberado?: boolean
  /** Campo de motivo, quando a tela conectada quiser exibi-lo aqui dentro. */
  children?: React.ReactNode
}

/**
 * O lancamento da retirada.
 *
 * O limite fica exposto no ato, e conta o que ja foi confirmado mais o que
 * ainda aguarda confirmacao — regra N6. Passar do limite nao bloqueia: exige
 * liberacao com motivo escrito, que fica registrada (regra N10).
 */
export function LancarRetirada({
  jogador,
  valor,
  onDigitar,
  onGirarTela,
  onLiberar,
  liberado = false,
  children,
}: LancarRetiradaProps) {
  const numero = Number(valor.replace(/\D/g, '') || '0')
  const comprometido = jogador.emMao + jogador.aguardando
  const excede = comprometido + numero > jogador.limite
  const excedente = comprometido + numero - jogador.limite
  // A barra mostra o que JA esta comprometido e, em cima, o que este
  // lancamento acrescenta. Ver os dois pedacos separados e o que faz a regra
  // N6 aparecer na tela em vez de so no aviso.
  const usoAtual = jogador.limite > 0 ? Math.min(comprometido / jogador.limite, 1) : 0
  const usoNovo =
    jogador.limite > 0 ? Math.min((comprometido + numero) / jogador.limite, 1) : 0

  return (
    <section className="mx-auto max-w-md">
      <div className="cv-panel cv-ticks cv-rise overflow-hidden rounded-2xl p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="cv-text truncate text-[15px] font-semibold">{jogador.nome}</p>
          <p className="cv-text-soft font-cv-mono cv-num shrink-0 text-[11px]">
            {reais(comprometido)} de {reais(jogador.limite)}
          </p>
        </div>

        {/* O medidor de limite. Cinza é o comprometido; âmbar é o que este
            lançamento acrescenta — e âmbar aqui é aviso de limite do jogador,
            não veredito de caixa. */}
        <div
          className={`cv-panel-quiet relative mt-2.5 h-1 overflow-hidden rounded-full ${
            excede ? 'cv-ch-limite' : 'cv-ch-live'
          }`}
        >
          <span
            className="cv-accent-bg absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${usoNovo * 100}%` }}
          />
          <span
            className="cv-text-soft absolute inset-y-0 left-0 rounded-full bg-current opacity-45"
            style={{ width: `${usoAtual * 100}%` }}
          />
        </div>

        <p className="cv-text font-cv-mono cv-num mt-6 flex items-baseline justify-end gap-2 text-[52px] leading-none font-bold">
          <span className="cv-text-soft text-[22px] opacity-60">R$</span>
          {valor || '0'}
        </p>

        {/* O canal `limite` é âmbar e é do crédito do jogador — nunca do caixa.
            Ele vive dentro do cartão dele; a faixa do topo continua sendo a
            única dona do âmbar de "revisar a janela". */}
        {excede ? (
          <div className="cv-ch-limite cv-accent-fill cv-accent-ring mt-5 rounded-xl p-3.5">
            <p className="cv-accent-text flex items-start gap-2 text-[13px] leading-snug">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                Valor acima do limite:{' '}
                <strong className="font-cv-mono cv-num">
                  {reais(comprometido + numero)}
                </strong>{' '}
                de <strong className="font-cv-mono cv-num">{reais(jogador.limite)}</strong>.
                Excede <strong className="font-cv-mono cv-num">{reais(excedente)}</strong>.
              </span>
            </p>
            {liberado ? (
              <p className="cv-accent-text mt-2.5 text-[12px] font-semibold">
                Liberado com motivo registrado.
              </p>
            ) : (
              <button
                type="button"
                onClick={onLiberar}
                className="cv-accent-text cv-accent-border mt-2.5 h-10 w-full rounded-lg border text-[12px] font-semibold transition-colors hover:bg-[var(--cv-accent-soft)]"
              >
                Liberar mesmo assim — exige motivo
              </button>
            )}
            {children}
          </div>
        ) : null}

        {/* Teclado de instrumento: teclas fundas, mono, alvo de 56px. O app é
            operado de pé, com uma mão, sob pressão. */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {TECLAS.map((tecla) => (
            <button
              key={tecla}
              type="button"
              onClick={() => onDigitar?.(tecla)}
              aria-label={tecla === 'apagar' ? 'Apagar' : tecla}
              className="cv-btn-quiet font-cv-mono cv-num h-14 text-[19px] font-semibold transition-transform active:scale-[0.97] hover:bg-[var(--cv-panel)] focus-visible:ring-2 focus-visible:outline-none"
            >
              {tecla === 'apagar' ? (
                <Delete className="size-5" aria-hidden="true" />
              ) : (
                tecla
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={numero <= 0}
        onClick={onGirarTela}
        className="cv-ch-live cv-btn cv-shine cv-rise cv-d1 mt-3 h-16 w-full text-[15px] hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-35 disabled:saturate-0 disabled:hover:translate-y-0"
      >
        <RotateCcw className="size-5 shrink-0" aria-hidden="true" />
        Girar a tela para o jogador
      </button>
    </section>
  )
}
