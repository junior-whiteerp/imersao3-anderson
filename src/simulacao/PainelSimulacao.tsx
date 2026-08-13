import { useState } from 'react'
import { ChevronDown, EyeOff, FlaskConical, Play, RotateCcw } from 'lucide-react'
import { useSimulacao } from './contexto'
import { formatarHora, reais } from './modelo'
import { contabilidade } from './vistas'

/**
 * Os controles da simulacao.
 *
 * Nada aqui existe no produto. Sao as alavancas que permitem ver, em minutos,
 * o que numa noite real levaria dez horas: o relogio andando e fichas sumindo
 * sem registro.
 *
 * O painel se veste como instrumento de bancada — fora da linguagem do app, de
 * proposito. Quem esta vendo a demo precisa saber, sem perguntar, que este
 * canto da tela nao vai existir no clube.
 */
export interface PainelSimulacaoProps {
  /** Entra no modo apresentação: a noite inteira, contada em capítulos. */
  onApresentar?: () => void
}

export function PainelSimulacao({ onApresentar }: PainelSimulacaoProps) {
  const { noite, despachar } = useSimulacao()
  // Comeca fechado: o painel nao pode cobrir os numeros que ele serve para testar.
  const [aberto, setAberto] = useState(false)
  const c = contabilidade(noite)
  const naoRegistrado = c.furoOculto - c.jaRegistrado

  const tecla =
    'cv-btn-quiet font-cv-mono cv-num h-9 text-[11px] font-semibold transition-transform active:scale-95 hover:-translate-y-px focus-visible:ring-2 focus-visible:outline-none'

  return (
    <>
      {/* No celular o painel aberto viraria um tapa-olho sobre o teclado. Com o
          fundo escurecido ele fica obviamente modal — e um toque fora fecha. */}
      {aberto ? (
        <button
          type="button"
          aria-label="Fechar o painel de simulação"
          onClick={() => setAberto(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] md:hidden"
        />
      ) : null}

      <aside
        className={`cv-ch-chrome cv-panel fixed z-40 overflow-hidden backdrop-blur-xl ${
          aberto
            ? 'inset-x-0 bottom-14 rounded-t-2xl md:inset-x-auto md:right-3 md:bottom-3 md:w-72 md:rounded-2xl'
            : 'right-3 bottom-20 w-auto rounded-2xl md:bottom-3'
        }`}
      >
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-[var(--cv-panel-quiet)]"
        >
          <FlaskConical className="cv-accent-text size-4 shrink-0" aria-hidden="true" />
          <span className="cv-accent-text cv-engraved flex-1 text-[9.5px] font-semibold tracking-[0.16em] uppercase">
            Simulação
          </span>
          <span className="cv-text font-cv-mono cv-num text-[14px] font-bold">
            {formatarHora(noite.agora)}
          </span>
          <ChevronDown
            className={`cv-text-soft size-4 shrink-0 transition-transform duration-200 ${
              aberto ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        {aberto ? (
          <div className="cv-line space-y-3.5 border-t p-3.5">
            {/* Fica no topo porque é a alavanca que a maioria das pessoas quer:
                ver a noite inteira sem ter que operar o app. */}
            {onApresentar ? (
              <button
                type="button"
                onClick={onApresentar}
                className="cv-ch-live cv-btn cv-shine h-11 w-full text-[12.5px] hover:-translate-y-px focus-visible:ring-2 focus-visible:outline-none"
              >
                <Play className="size-4 shrink-0" aria-hidden="true" />
                Tocar a noite inteira
              </button>
            ) : null}

            <div>
              <p className="cv-text-soft cv-engraved text-[9px] font-semibold tracking-[0.16em] uppercase">
                Adiantar o relógio
              </p>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {[5, 15, 30].map((minutos) => (
                  <button
                    key={minutos}
                    type="button"
                    onClick={() => despachar({ tipo: 'avancar-tempo', minutos })}
                    className={tecla}
                  >
                    +{minutos}min
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="cv-text-soft cv-engraved flex items-center gap-1.5 text-[9px] font-semibold tracking-[0.16em] uppercase">
                <EyeOff className="size-3" aria-hidden="true" />
                Sumir ficha sem registro
              </p>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {[60, 300, 600].map((valor) => (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => despachar({ tipo: 'injetar-furo', valor })}
                    className={tecla}
                  >
                    {valor}
                  </button>
                ))}
              </div>
              <p className="cv-text-soft mt-2 text-[11px] leading-snug">
                {naoRegistrado > 0 ? (
                  <>
                    <strong className="cv-text font-cv-mono cv-num">
                      {reais(naoRegistrado)}
                    </strong>{' '}
                    sumiram e o app ainda não sabe. Lance um rake para ele contar a caixa.
                  </>
                ) : (
                  'Nada sumiu desde o último checkpoint.'
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() => despachar({ tipo: 'reiniciar' })}
              className="cv-btn-quiet h-10 w-full text-[12px] focus-visible:ring-2 focus-visible:outline-none"
            >
              <RotateCcw className="size-3.5 shrink-0" aria-hidden="true" />
              Recomeçar a noite
            </button>
          </div>
        ) : null}
      </aside>
    </>
  )
}
