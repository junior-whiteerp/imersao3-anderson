import { reais } from './formato'
import type { PainelFluxo } from './tipos'

export interface MostradorCaixaProps {
  fluxo: PainelFluxo
}

/**
 * A conta aberta em parcelas.
 *
 * O produto pede que o operador confie num numero. Por isso o numero precisa
 * poder ser conferido a mao, sem sair da tela: cada parcela com seu sinal, e a
 * barra dando a proporcao antes de a pessoa ler o valor.
 *
 * As barras sao monocromaticas de proposito. Verde, ambar e vermelho pertencem
 * ao veredito; gastar uma dessas cores aqui, onde nada esta errado, e o jeito
 * mais rapido de ensinar o operador a ignorar cor.
 */
export function MostradorCaixa({ fluxo }: MostradorCaixaProps) {
  const parcelas = [
    { rotulo: 'Caixa inicial de fichas', valor: fluxo.caixaInicial, sinal: '+', vivo: false },
    { rotulo: 'Retiradas confirmadas', valor: fluxo.retiradas, sinal: '−', vivo: false },
    { rotulo: 'Devoluções confirmadas', valor: fluxo.devolucoes, sinal: '+', vivo: false },
    // O rake e a unica parcela que dispara alguma coisa: e ela que abre o
    // checkpoint. Ciano marca isso sem invadir o canal do veredito.
    { rotulo: 'Rake declarado', valor: fluxo.rake, sinal: '+', vivo: true },
  ]

  const maior = Math.max(...parcelas.map((p) => p.valor), 1)

  return (
    <section className="cv-panel cv-rise cv-d2 overflow-hidden rounded-2xl">
      <header className="cv-line border-b px-5 py-3.5">
        <h2 className="cv-text-soft cv-engraved text-[9.5px] font-semibold tracking-[0.18em] uppercase">
          Como a conta fecha
        </h2>
      </header>

      <ul className="px-5 py-4">
        {parcelas.map((p) => (
          <li key={p.rotulo} className="py-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="cv-text-soft flex min-w-0 items-baseline gap-2 text-[12.5px]">
                <span
                  className={`font-cv-mono w-2 shrink-0 font-bold ${
                    p.vivo ? 'cv-live-text' : ''
                  }`}
                  aria-hidden="true"
                >
                  {p.sinal}
                </span>
                <span className="truncate">{p.rotulo}</span>
              </span>
              <span className="cv-text font-cv-mono cv-num shrink-0 text-[13.5px] font-semibold">
                {reais(p.valor)}
              </span>
            </div>
            <div className="mt-1.5 ml-4 h-[3px] overflow-hidden rounded-full">
              <span
                className={`block h-full rounded-full ${
                  p.vivo ? 'cv-live-text' : 'cv-text-soft'
                } bg-current ${p.vivo ? 'opacity-90' : 'opacity-30'}`}
                style={{ width: `${(p.valor / maior) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="cv-line border-t px-5 py-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="cv-text flex items-baseline gap-2 text-[13px] font-semibold">
            <span className="font-cv-mono w-2 shrink-0" aria-hidden="true">
              =
            </span>
            Caixa esperado agora
          </span>
          <span className="cv-text font-cv-mono cv-num text-[19px] font-bold">
            {reais(fluxo.caixaEsperado)}
          </span>
        </div>

        <p className="cv-panel-quiet cv-text-soft mt-3.5 rounded-xl p-3 text-[12px] leading-relaxed">
          Fichas em jogo agora:{' '}
          <span className="cv-text font-cv-mono cv-num font-semibold">
            {reais(fluxo.fichasEmJogo)}
          </span>
          . Saíram da caixa e ainda não voltaram. Esse número é esperado ser diferente de
          zero enquanto houver gente na mesa — <strong>ele não é furo</strong>. O furo só
          aparece quando alguém conta a caixa, e isso acontece no lançamento de rake.
        </p>
      </div>
    </section>
  )
}
