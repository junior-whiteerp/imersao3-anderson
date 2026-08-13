import { ArrowDownLeft, ArrowUpRight, HandCoins, Timer } from 'lucide-react'
import type { ResumoSessao, Sessao } from './tipos'

function reais(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export interface ResumoCaixaProps {
  sessao: Sessao
  resumo: ResumoSessao
}

/**
 * O resumo da noite ate agora.
 *
 * A diferenca segue a regra N8: enquanto houver rake na mesa, ela e esperada e
 * aparece em cinza. Vermelho aqui ensinaria o operador a ignorar vermelho.
 */
export function ResumoCaixa({ sessao, resumo }: ResumoCaixaProps) {
  const numeros = [
    { rotulo: 'Retiradas', valor: resumo.retiradas, icone: ArrowUpRight },
    { rotulo: 'Devoluções', valor: resumo.devolucoes, icone: ArrowDownLeft },
    { rotulo: 'Rake recolhido', valor: resumo.rakeRecolhido, icone: HandCoins },
  ]

  // Enquanto o rake está na mesa o app não conhece diferença nenhuma — só
  // fichas que saíram. O canal fica neutro, e é isso que a regra N8 pede.
  const canal = resumo.rakePendente
    ? 'cv-ch-neutro'
    : resumo.diferenca === 0
      ? 'cv-ch-fecha'
      : 'cv-ch-suspender'

  return (
    <section className="cv-panel cv-ticks cv-rise overflow-hidden rounded-2xl">
      <header className="cv-line flex flex-wrap items-end justify-between gap-5 border-b px-5 py-4">
        <div className="min-w-0">
          <p className="cv-text-soft cv-engraved text-[9.5px] font-semibold tracking-[0.18em] uppercase">
            {sessao.clube} · aberta às {sessao.abertaEm}
          </p>
          <p className="cv-text font-cv-mono cv-num mt-2 flex items-center gap-2.5 text-[34px] leading-none font-bold">
            <Timer className="cv-live-text size-5 shrink-0" aria-hidden="true" />
            {sessao.decorrido}
          </p>
        </div>
        <div className="text-right">
          <p className="cv-text-soft cv-engraved text-[9.5px] font-semibold tracking-[0.18em] uppercase">
            Caixa inicial de fichas
          </p>
          <p className="cv-text font-cv-mono cv-num mt-2 text-[22px] leading-none font-bold">
            {reais(sessao.caixaInicial)}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4">
        {numeros.map(({ rotulo, valor, icone: Icone }, i) => (
          <div
            key={rotulo}
            className={`cv-line p-4 ${i > 0 ? 'sm:border-l' : ''} ${i >= 2 ? 'border-t sm:border-t-0' : ''} ${i === 1 ? 'border-l' : ''}`}
          >
            <p className="cv-text-soft cv-engraved flex items-center gap-1.5 text-[9px] font-semibold tracking-[0.14em] uppercase">
              <Icone className="size-3 shrink-0" aria-hidden="true" />
              {rotulo}
            </p>
            <p className="cv-text font-cv-mono cv-num mt-2 text-[17px] leading-none font-bold">
              {reais(valor)}
            </p>
          </div>
        ))}

        <div className={`cv-line border-t border-l p-4 sm:border-t-0 ${canal}`}>
          {/* O rotulo muda com o estado, e nao por capricho: enquanto o rake
              esta na mesa o app nao conhece diferenca nenhuma — ele conhece as
              fichas que sairam e nao voltaram. Chamar isso de "diferenca" seria
              dar ao operador um numero que o app nao pode saber. */}
          <p className="cv-accent-text cv-engraved text-[9px] font-semibold tracking-[0.14em] uppercase">
            {resumo.rakePendente ? 'Fichas em jogo' : 'Diferença no checkpoint'}
          </p>
          {/* "Fecha" é veredito, e veredito só existe depois de alguém contar a
              caixa. Enquanto há rake na mesa o rótulo é "fichas em jogo" e o
              valor precisa ser o número — mesmo quando ele é zero, porque zero
              ficha em jogo não quer dizer que a conta fechou. */}
          <p
            className={`cv-accent-text mt-2 leading-none ${
              !resumo.rakePendente && resumo.diferenca === 0
                ? 'font-cv-display text-[22px]'
                : 'font-cv-mono cv-num text-[17px] font-bold'
            }`}
          >
            {!resumo.rakePendente && resumo.diferenca === 0
              ? 'Fecha'
              : reais(resumo.diferenca)}
          </p>
          {resumo.rakePendente && resumo.ultimoRakeEm ? (
            <p className="cv-text-soft mt-2 text-[10.5px] leading-snug">
              Saiu da caixa e ainda não voltou. Rake não declarado desde{' '}
              <span className="font-cv-mono cv-num">{resumo.ultimoRakeEm}</span> — a conta
              não fecha, e está certo que não feche.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
