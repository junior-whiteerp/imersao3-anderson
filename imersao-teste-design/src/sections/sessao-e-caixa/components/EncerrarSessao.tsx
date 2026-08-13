import { PowerOff, Users } from 'lucide-react'
import type { JogadorNaMesa } from './tipos'

export interface EncerrarSessaoProps {
  jogadoresNaMesa: JogadorNaMesa[]
  onEncerrar?: () => void
}

/**
 * O encerramento da noite.
 *
 * A regra N11 diz que a sessao nao encerra com jogador na mesa. Em vez de
 * esconder o botao, ele fica visivel e desligado, com a lista de quem falta —
 * o operador precisa saber o que resolver, nao so que nao pode.
 */
export function EncerrarSessao({ jogadoresNaMesa, onEncerrar }: EncerrarSessaoProps) {
  const bloqueado = jogadoresNaMesa.length > 0

  return (
    <section className="cv-panel cv-rise rounded-2xl p-5">
      <h2 className="cv-text-soft cv-engraved text-[9.5px] font-semibold tracking-[0.18em] uppercase">
        Encerrar a noite
      </h2>

      {bloqueado ? (
        <div className="cv-panel-quiet mt-3.5 rounded-xl p-3.5">
          <p className="cv-text flex items-center gap-2 text-[13.5px] font-semibold">
            <Users className="cv-text-soft size-4 shrink-0" aria-hidden="true" />
            {jogadoresNaMesa.length}{' '}
            {jogadoresNaMesa.length === 1 ? 'jogador ainda na mesa' : 'jogadores ainda na mesa'}
          </p>
          <p className="cv-text-soft mt-1.5 text-[12.5px] leading-relaxed">
            Conte as fichas e feche a conta de cada um antes de encerrar. A sessão não
            encerra com jogador na mesa.
          </p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {jogadoresNaMesa.map((jogador) => (
              <li
                key={jogador.id}
                className="cv-panel cv-text rounded-full px-2.5 py-1 text-[11.5px] font-medium"
              >
                {jogador.nome}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="cv-text-soft mt-3 text-[12.5px] leading-relaxed">
          A mesa está vazia. Ao encerrar, a conferência final é gravada e o relatório da
          sessão fica guardado. Se houver divergência, ela é registrada com valor, janela
          e turno — <strong className="cv-text">nunca arredondada nem apagada</strong>.
        </p>
      )}

      {/* Contorno, não chapa cheia. Encerrar é raro e irreversível: um botão
          vermelho sólido do tamanho da tela puxa o dedo para a ação que menos
          deveria acontecer por engano — e gasta o vermelho, que neste produto
          pertence ao veredito do caixa. */}
      <button
        type="button"
        disabled={bloqueado}
        onClick={onEncerrar}
        className="cv-ch-suspender cv-accent-text cv-accent-border mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border text-[13.5px] font-semibold transition-colors hover:bg-[var(--cv-accent-soft)] focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-30 disabled:saturate-0"
      >
        <PowerOff className="size-4 shrink-0" aria-hidden="true" />
        Encerrar sessão
      </button>
    </section>
  )
}
