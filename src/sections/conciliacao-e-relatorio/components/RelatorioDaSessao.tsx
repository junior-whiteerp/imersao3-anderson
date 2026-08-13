import { Archive, EyeOff, ShieldAlert } from 'lucide-react'
import type { Relatorio, Veredito } from './tipos'

function reais(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

const CANAL: Record<Veredito, string> = {
  fechado: 'cv-ch-fecha',
  registrar: 'cv-ch-neutro',
  revisar: 'cv-ch-revisar',
  suspender: 'cv-ch-suspender',
}

/** Cabeçalho de bloco. Repetido seis vezes; vale existir uma vez. */
function Bloco({
  titulo,
  acessorio,
  children,
}: {
  titulo: string
  acessorio?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="cv-line border-t px-5 py-5 sm:px-7">
      <header className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="cv-text-soft cv-engraved text-[9.5px] font-semibold tracking-[0.18em] uppercase">
          {titulo}
        </h2>
        {acessorio}
      </header>
      {children}
    </section>
  )
}

export interface RelatorioDaSessaoProps {
  relatorio: Relatorio
}

/**
 * O relatorio da sessao encerrada.
 *
 * E o que substitui o papel jogado fora depois do acerto — a funcionalidade F9
 * e o criterio A14. Ele nao resume: mostra a conta inteira, todos os
 * checkpoints, os turnos, quem passou pela mesa, e cada excecao com o motivo
 * escrito.
 *
 * A regra N12 manda que divergencia nunca seja arredondada nem apagada, e a
 * N13 que nada seja apagado. Por isso o bloco de divergencias vem ANTES dos
 * totais: num relatorio que abre pelo resultado, o que nao fechou vira nota de
 * rodape — e era justamente ele o motivo de o produto existir.
 */
export function RelatorioDaSessao({ relatorio }: RelatorioDaSessaoProps) {
  const { totais } = relatorio
  const fechou = totais.divergencia === 0
  const canal = CANAL[relatorio.vereditoFinal]

  const divergentes = relatorio.checkpoints.filter((c) => c.diferenca !== 0)
  const somaDivergencias = divergentes.reduce((s, c) => s + c.diferenca, 0)

  const parcelas = [
    { rotulo: 'Caixa inicial de fichas', valor: totais.caixaInicial, sinal: '+' },
    { rotulo: 'Retiradas confirmadas', valor: totais.retiradas, sinal: '−' },
    { rotulo: 'Devoluções confirmadas', valor: totais.devolucoes, sinal: '+' },
    { rotulo: 'Rake recolhido', valor: totais.rake, sinal: '+' },
  ]

  return (
    <section className={`cv-panel cv-rise overflow-hidden rounded-2xl ${canal}`}>
      {/* Picote de comprovante: isto substitui um pedaço de papel. */}
      <span
        className="cv-text-soft cv-chip-rail-x block h-[3px] w-full opacity-40"
        aria-hidden="true"
      />

      {/* ── Capa ────────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden px-5 pt-6 pb-5 sm:px-7">
        <span
          className="cv-accent-text font-cv-display pointer-events-none absolute -top-4 -right-2 text-[130px] leading-none opacity-[0.06] select-none"
          aria-hidden="true"
        >
          {relatorio.checkpoints.length}
        </span>

        <p className="cv-text-soft cv-engraved relative flex items-center gap-1.5 text-[9.5px] font-semibold tracking-[0.2em] uppercase">
          <Archive className="size-3 shrink-0" aria-hidden="true" />
          Relatório guardado · {relatorio.clube}
        </p>

        <h1 className="cv-text font-cv-display relative mt-2.5 text-[32px] leading-[1.05] sm:text-[40px]">
          A noite de {relatorio.abertaEm} às {relatorio.encerradaEm}
        </h1>

        <p className="cv-text-soft font-cv-mono cv-num relative mt-2.5 text-[12px]">
          {relatorio.duracao} de sessão · {relatorio.turnos.length}{' '}
          {relatorio.turnos.length === 1 ? 'turno' : 'turnos'} ·{' '}
          {relatorio.checkpoints.length}{' '}
          {relatorio.checkpoints.length === 1 ? 'conferência' : 'conferências'} ·{' '}
          {relatorio.jogadores.length}{' '}
          {relatorio.jogadores.length === 1 ? 'jogador' : 'jogadores'}
        </p>

        {/* O veredito final, no tamanho de manchete. */}
        <p className="cv-accent-text cv-stamp relative mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {fechou ? (
            <span className="font-cv-display text-[38px] leading-[0.95] sm:text-[48px]">
              O caixa fechou
            </span>
          ) : (
            <>
              <span className="font-cv-display text-[30px] leading-[0.95] sm:text-[38px]">
                Faltaram
              </span>
              <span className="font-cv-mono cv-num text-[30px] leading-[0.95] font-bold sm:text-[42px]">
                {reais(totais.divergencia)}
              </span>
            </>
          )}
        </p>

        {/* O número do topo é o da noite inteira, não o da conferência final.
            Quando a última conferência fecha mas a noite não, dizer só "fechou"
            esconderia justamente o que o produto existe para achar. */}
        {!fechou ? (
          relatorio.janelaFinal ? (
            <p className="cv-text-soft relative mt-3 text-[12.5px] leading-relaxed">
              A conferência final também não fechou, entre{' '}
              <span className="cv-text font-cv-mono cv-num font-semibold">
                {relatorio.janelaFinal.inicio}–{relatorio.janelaFinal.fim}
              </span>
              {relatorio.janelaFinal.turnos.length > 0
                ? `, com ${relatorio.janelaFinal.turnos
                    .map((t) => `${t.dealer} no turno ${t.numero}`)
                    .join(' e ')}`
                : null}
              . Cada divergência ficou registrada com valor, janela e turno — nenhuma foi
              arredondada nem apagada.
            </p>
          ) : (
            <p className="cv-text-soft relative mt-3 text-[12.5px] leading-relaxed">
              A conferência final fechou. As faltas apareceram <strong>durante</strong> a
              noite, cada uma numa janela de meia hora — é o que está logo abaixo. Sem os
              checkpoints, a noite teria terminado com um único número e ninguém saberia
              quando o dinheiro sumiu.
            </p>
          )
        ) : null}
      </header>

      {/* ── O que não fechou ─────────────────────────────────────────────── */}
      <Bloco
        titulo="O que não fechou na noite"
        acessorio={
          divergentes.length > 0 ? (
            <span className="cv-text font-cv-mono cv-num text-[12px] font-bold">
              {reais(somaDivergencias)} em {divergentes.length}{' '}
              {divergentes.length === 1 ? 'janela' : 'janelas'}
            </span>
          ) : null
        }
      >
        {divergentes.length === 0 ? (
          <p className="cv-text-soft text-[13px] leading-relaxed">
            Nenhuma conferência da noite acusou falta de ficha. Todas as{' '}
            {relatorio.checkpoints.length} fecharam.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {divergentes.map((c) => (
              <li
                key={c.id}
                className={`cv-panel-quiet rounded-xl p-3.5 ${CANAL[c.veredito]}`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="cv-text font-cv-mono cv-num text-[14px] font-bold">
                    {c.janelaInicio}–{c.janelaFim}
                  </span>
                  <span className="cv-accent-text font-cv-mono cv-num text-[16px] font-bold">
                    {reais(c.diferenca)}
                  </span>
                </div>
                <p className="cv-text-soft mt-1.5 text-[12px]">
                  Checkpoint {c.numero}, às {c.hora} ·{' '}
                  {(c.turnosNaJanela ?? [{ numero: c.turno, dealer: c.dealer }])
                    .map((t) => `turno ${t.numero} · ${t.dealer}`)
                    .join('   ·   ')}
                </p>
              </li>
            ))}
            <li className="cv-text-soft pt-1 text-[11.5px] leading-relaxed">
              O sistema mostra a janela e quem estava no turno. Ele não acusa ninguém —
              quem investiga é gente.
            </li>
          </ul>
        )}
      </Bloco>

      {/* ── A conta ──────────────────────────────────────────────────────── */}
      <Bloco titulo="A conta da noite">
        <ul className="space-y-2">
          {parcelas.map((p) => (
            <li key={p.rotulo} className="flex items-baseline justify-between gap-4">
              <span className="cv-text-soft text-[12.5px]">
                <span className="font-cv-mono mr-2">{p.sinal}</span>
                {p.rotulo}
              </span>
              <span className="cv-text font-cv-mono cv-num text-[13.5px] font-semibold">
                {reais(p.valor)}
              </span>
            </li>
          ))}
          <li className="cv-line flex items-baseline justify-between gap-4 border-t pt-2.5">
            <span className="cv-text text-[13px] font-semibold">
              <span className="font-cv-mono mr-2">=</span>Caixa esperado no fechamento
            </span>
            <span className="cv-text font-cv-mono cv-num text-[15px] font-bold">
              {reais(totais.caixaEsperado)}
            </span>
          </li>
          <li className="flex items-baseline justify-between gap-4">
            <span className="cv-text-soft text-[12.5px]">Caixa contado</span>
            <span className="cv-text font-cv-mono cv-num text-[13.5px] font-semibold">
              {reais(totais.caixaContado)}
            </span>
          </li>
          <li className="cv-line flex items-baseline justify-between gap-4 border-t pt-2.5">
            <span className="cv-accent-text text-[13px] font-semibold">Divergência</span>
            <span className="cv-accent-text font-cv-mono cv-num text-[15px] font-bold">
              {reais(totais.divergencia)}
            </span>
          </li>
        </ul>
      </Bloco>

      {/* ── Checkpoints ──────────────────────────────────────────────────── */}
      <Bloco
        titulo="Checkpoints da noite"
        acessorio={
          <span className="cv-text-soft font-cv-mono cv-num text-[11px]">
            {relatorio.checkpoints.length} conferências
          </span>
        }
      >
        <ol className="cv-divide">
          {relatorio.checkpoints.map((c) => (
            <li
              key={c.id}
              className={`flex items-center gap-3 py-2.5 ${CANAL[c.veredito]}`}
            >
              <span
                className="cv-accent-text relative flex size-3 shrink-0 items-center justify-center"
                aria-hidden="true"
              >
                <span className="absolute inset-0 rounded-full border border-dashed opacity-80" />
                <span className="cv-accent-bg absolute inset-[2px] rounded-full" />
              </span>
              <span className="cv-text font-cv-mono cv-num w-12 shrink-0 text-[12.5px] font-semibold">
                {c.hora}
              </span>
              <span className="cv-text-soft font-cv-mono cv-num min-w-0 flex-1 truncate text-[11.5px]">
                {c.janelaInicio}–{c.janelaFim}
              </span>
              <span
                className={`cv-accent-text shrink-0 ${
                  c.diferenca === 0
                    ? 'font-cv-display text-[15px] italic'
                    : 'font-cv-mono cv-num text-[13px] font-bold'
                }`}
              >
                {c.diferenca === 0 ? 'fecha' : reais(c.diferenca)}
              </span>
            </li>
          ))}
        </ol>
      </Bloco>

      {/* ── Turnos ───────────────────────────────────────────────────────── */}
      <Bloco titulo="Turnos e rake">
        <ul className="cv-divide">
          {relatorio.turnos.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-2.5">
              <span className="cv-text-soft font-cv-mono cv-num w-8 shrink-0 text-[11.5px]">
                T{t.numero}
              </span>
              <span className="cv-text min-w-0 flex-1 truncate text-[13px]">
                {t.dealer}
              </span>
              <span className="cv-text-soft font-cv-mono cv-num shrink-0 text-[11.5px]">
                {t.inicio}–{t.fim}
              </span>
              <span className="cv-text font-cv-mono cv-num w-20 shrink-0 text-right text-[13px] font-semibold">
                {reais(t.rake)}
              </span>
            </li>
          ))}
        </ul>
      </Bloco>

      {/* ── Jogadores ────────────────────────────────────────────────────── */}
      <Bloco titulo="Quem passou pela mesa">
        <ul className="cv-divide">
          {relatorio.jogadores.map((j) => (
            <li key={j.id} className="flex items-center gap-3 py-2.5">
              <span className="min-w-0 flex-1">
                <span className="cv-text flex items-center gap-1.5 truncate text-[13px] font-semibold">
                  {j.nome}
                  {j.contingencias > 0 ? (
                    <span
                      className="cv-ch-chrome cv-accent-text cv-accent-fill flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                      title="Vezes em que o operador confirmou sem este jogador olhar a tela"
                    >
                      <EyeOff className="size-2.5" aria-hidden="true" />
                      {j.contingencias}
                    </span>
                  ) : null}
                </span>
                <span className="cv-text-soft font-cv-mono cv-num mt-0.5 block text-[10.5px]">
                  {j.entrouAs}–{j.saiuAs} · tirou {reais(j.retirado)} · devolveu{' '}
                  {reais(j.devolvido)}
                </span>
              </span>
              {/* Zero não leva sinal: "+R$ 0" faz o olho procurar um ganho que
                  não existe. Quem empatou devolveu o que tirou, e é só isso. */}
              <span
                className={`font-cv-mono cv-num shrink-0 text-[13px] font-bold ${
                  j.resultado > 0 ? 'cv-ch-fecha cv-accent-text' : 'cv-text'
                }`}
              >
                {j.resultado > 0 ? '+' : j.resultado < 0 ? '−' : ''}
                {reais(Math.abs(j.resultado))}
              </span>
            </li>
          ))}
        </ul>
      </Bloco>

      {/* ── Exceções ─────────────────────────────────────────────────────── */}
      <Bloco
        titulo="Exceções registradas"
        acessorio={
          <span className="cv-text-soft font-cv-mono cv-num text-[11px]">
            {relatorio.registros.length}
          </span>
        }
      >
        {relatorio.registros.length === 0 ? (
          <p className="cv-text-soft text-[13px]">
            Nenhuma exceção. Todo lançamento saiu com o jogador olhando a tela e dentro do
            limite dele.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {relatorio.registros.map((r) => (
              <li
                key={r.id}
                className={`cv-panel-quiet rounded-xl p-3.5 ${
                  r.tipo === 'contingencia' ? 'cv-ch-chrome' : 'cv-ch-limite'
                }`}
              >
                <p className="cv-accent-text flex items-center gap-1.5 text-[11px] font-semibold">
                  {r.tipo === 'contingencia' ? (
                    <EyeOff className="size-3 shrink-0" aria-hidden="true" />
                  ) : (
                    <ShieldAlert className="size-3 shrink-0" aria-hidden="true" />
                  )}
                  {r.tipo === 'contingencia'
                    ? 'Confirmado sem o jogador olhar a tela'
                    : 'Liberado acima do limite'}
                  <span className="cv-text-soft font-cv-mono cv-num font-normal">
                    · {r.hora} · {r.jogador} · {reais(r.valor)}
                  </span>
                </p>
                {/* O motivo aparece inteiro. Ele é o registro; resumi-lo seria
                    apagá-lo pela metade. */}
                <p className="cv-text mt-1.5 text-[12.5px] leading-relaxed italic">
                  "{r.motivo}"
                </p>
              </li>
            ))}
          </ul>
        )}
      </Bloco>

      <footer className="cv-line border-t px-5 py-4 sm:px-7">
        <p className="cv-text-soft text-[11.5px] leading-relaxed">
          Nada foi apagado. Lançamentos recusados e cancelados continuam no registro da
          sessão, fora do extrato — nenhuma ficha saiu por causa deles.
        </p>
      </footer>

      <span
        className="cv-text-soft cv-chip-rail-x block h-[3px] w-full opacity-40"
        aria-hidden="true"
      />
    </section>
  )
}
