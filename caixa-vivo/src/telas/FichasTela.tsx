import { useState } from 'react'
import { X } from 'lucide-react'
import { LancarRetirada, TelaConfirmacao } from '@/sections/fichas/components'
import { finalDoWhatsapp } from '@/sections/jogadores-e-mesa/components'
import { TituloDeTela } from '@/shell/components'
import { useNoite } from '@/estado/NoiteProvider'
import {
  TETO_CONTINGENCIAS,
  aguardando,
  contingenciasDaSessao,
  emMao,
  jogadorDe,
  participacoesAbertas,
  reais,
} from '@/regras/modelo'

export function FichasTela({
  participacaoId,
  onSelecionar,
}: {
  participacaoId: string | null
  onSelecionar: (id: string | null) => void
}) {
  const { noite, despachar } = useNoite()
  const [valor, setValor] = useState('')
  const [motivoLimite, setMotivoLimite] = useState<string | null>(null)
  const [motivoContingencia, setMotivoContingencia] = useState<string | null>(null)
  // Só a recusa para numa tela de resultado. A confirmação volta direto ao
  // seletor: a próxima ficha quase sempre é de outra pessoa, e numa noite de
  // dezenas de lançamentos um toque a menos em cada um pesa.
  const [resultado, setResultado] = useState<'recusado' | null>(null)
  // Lançar outra ficha com uma já esperando confirmação. Sem este caminho, a
  // metade "aguardando" do limite (N6) e o critério A9 nunca aconteciam na tela.
  const [lancandoOutra, setLancandoOutra] = useState(false)

  const abertas = participacoesAbertas(noite)
  const atual = participacaoId ? abertas.find((p) => p.id === participacaoId) : undefined

  function limpar() {
    setValor('')
    setMotivoLimite(null)
    setMotivoContingencia(null)
    setLancandoOutra(false)
  }

  // ── Ninguém escolhido ───────────────────────────────────────────────────
  if (!atual) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6">
        <TituloDeTela sobretitulo="Fichas" titulo="Para quem é a ficha?" />
        {abertas.length === 0 ? (
          <p className="cv-panel cv-text-soft rounded-2xl p-10 text-center text-[13px]">
            Ninguém na mesa. Adicione um jogador antes de lançar fichas.
          </p>
        ) : (
          <div className="cv-panel cv-ticks rounded-2xl p-5">
            <div className="flex flex-wrap gap-2">
              {abertas.map((p) => {
                const dele = jogadorDe(noite, p.id)
                // A18: com homônimos na mesa, o nome sozinho não identifica
                // ninguém — é o caso de pai e filho que o PRD cita. Só nesses o
                // WhatsApp aparece; mostrar em todos exporia o número à toa.
                const homonimo =
                  abertas.filter(
                    (outra) =>
                      jogadorDe(noite, outra.id)?.nome.trim().toLowerCase() ===
                      dele?.nome.trim().toLowerCase()
                  ).length > 1
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      limpar()
                      setResultado(null)
                      onSelecionar(p.id)
                    }}
                    className="cv-btn-quiet h-12 px-3.5 text-[13.5px] font-semibold"
                  >
                    {dele?.nome}
                    {homonimo && dele ? (
                      <span className="cv-text-soft font-cv-mono cv-num text-[10px]">
                        {finalDoWhatsapp(dele.whatsapp)}
                      </span>
                    ) : null}
                    <span className="cv-text-soft font-cv-mono cv-num text-[11px]">
                      {reais(emMao(noite, p.id))}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  const jogador = jogadorDe(noite, atual.id)!
  // O lançamento não expira por tempo (N18): sai por confirmação, recusa ou
  // encerramento da conta. O MAIS ANTIGO vai para a tela girada — é o que o
  // jogador viu primeiro.
  const pendentes = noite.movimentacoes.filter(
    (m) => m.participacaoId === atual.id && m.tipo === 'retirada' && m.situacao === 'aguardando'
  )
  const pendente = pendentes[0]
  const outrosPendentes = pendentes.slice(1)

  const cabecalho = (
    <TituloDeTela
      sobretitulo="Fichas"
      titulo={jogador.nome}
      acessorio={
        <button
          type="button"
          onClick={() => {
            limpar()
            setResultado(null)
            onSelecionar(null)
          }}
          className="cv-btn-quiet h-10 px-3.5 text-[12px]"
        >
          Trocar jogador
        </button>
      }
    />
  )

  // ── A tela girada para o jogador (F3, N2) ──────────────────────────────
  if (pendente && !lancandoOutra) {
    // Tudo que NÃO é do jogador vai para o rodapé. O aparelho está na mão dele:
    // o painel do clube não pode estar por perto, mas os caminhos do operador
    // também não podem sumir.
    const rodape = (
      <div className="space-y-3">
        {/* O jogador pediu mais fichas antes de confirmar a primeira. É o caso
            de borda que fez a regra N6 nascer: o limite precisa contar as duas.
            Sem este botão, a tela nunca conseguia criar a segunda. */}
        {motivoContingencia === null ? (
          <button
            type="button"
            onClick={() => setLancandoOutra(true)}
            className="cv-btn-quiet h-11 w-full text-[13px]"
          >
            Ele pediu mais fichas antes de confirmar
          </button>
        ) : null}

        {/* Nada de pendente pode ficar invisível: o que não está na tela girada
            aparece aqui, com saída própria. */}
        {outrosPendentes.length > 0 ? (
          <section
            aria-label="Também esperando confirmação"
            className="cv-ch-chrome cv-panel cv-accent-ring rounded-2xl p-3.5"
          >
            <h2 className="cv-accent-text cv-engraved text-[9.5px] font-semibold tracking-[0.16em] uppercase">
              Também esperando confirmação
            </h2>
            <ul className="mt-2.5 space-y-2">
              {outrosPendentes.map((m) => (
                <li key={m.id} className="flex items-center gap-2">
                  <span className="cv-text font-cv-mono cv-num flex-1 text-[14px] font-bold">
                    {reais(m.valor)}
                  </span>
                  <button
                    type="button"
                    onClick={() => void despachar({ tipo: 'recusar', movimentacaoId: m.id })}
                    className="cv-btn-quiet h-9 px-2.5 text-[12px]"
                  >
                    Recusar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void despachar({
                        tipo: 'confirmar',
                        movimentacaoId: m.id,
                        confirmacao: 'presencial',
                      })
                    }
                    className="cv-ch-live cv-btn h-9 px-3 text-[12px]"
                  >
                    Confirmar
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {motivoContingencia !== null ? (
          <section className="cv-ch-chrome cv-panel cv-accent-ring rounded-2xl p-4">
            <label
              htmlFor="motivo-contingencia"
              className="cv-accent-text cv-engraved block text-[9.5px] font-semibold tracking-[0.16em] uppercase"
            >
              Contingência {contingenciasDaSessao(noite) + 1} de {TETO_CONTINGENCIAS} · motivo
            </label>
            <input
              id="motivo-contingencia"
              value={motivoContingencia}
              onChange={(e) => setMotivoContingencia(e.target.value)}
              placeholder="Por que o jogador não olhou a tela?"
              className="cv-panel-quiet cv-line cv-text mt-2.5 h-12 w-full rounded-xl border px-3.5 text-[14.5px] outline-none focus:ring-2"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setMotivoContingencia(null)}
                className="cv-btn-quiet h-11 flex-1 text-[13px]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!motivoContingencia.trim()}
                onClick={async () => {
                  await despachar({
                    tipo: 'confirmar',
                    movimentacaoId: pendente.id,
                    confirmacao: 'contingencia',
                    motivo: motivoContingencia,
                  })
                  limpar()
                  if (outrosPendentes.length === 0) onSelecionar(null)
                }}
                className="cv-btn h-11 flex-1 text-[13px] disabled:opacity-35 disabled:saturate-0"
              >
                Registrar contingência
              </button>
            </div>
          </section>
        ) : null}
      </div>
    )

    return (
      <TelaConfirmacao
        plenaTela
        rodape={rodape}
        jogador={jogador.nome}
        valor={pendente.valor}
        contingenciasNaSessao={contingenciasDaSessao(noite)}
        tetoContingencias={TETO_CONTINGENCIAS}
        onConfirmar={async () => {
          await despachar({
            tipo: 'confirmar',
            movimentacaoId: pendente.id,
            confirmacao: 'presencial',
          })
          limpar()
          // Sobrou pendente? Fica no jogador para confirmar o próximo — senão
          // ele ficaria escondido atrás do seletor.
          if (outrosPendentes.length === 0) onSelecionar(null)
        }}
        onRecusar={async () => {
          await despachar({ tipo: 'recusar', movimentacaoId: pendente.id })
          // Recusa exige relançar para a MESMA pessoa. Não volta ao seletor.
          limpar()
          setResultado('recusado')
        }}
        onContingencia={() => setMotivoContingencia('')}
      />
    )
  }

  // ── Recusa ─────────────────────────────────────────────────────────────
  // A confirmação não passa por aqui: ela volta direto ao seletor. A recusa
  // para, porque ela pede uma ação — o operador precisa conferir o valor e
  // lançar de novo. Sem esta tela ele volta ao teclado sem saber o que houve.
  if (resultado === 'recusado') {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6">
        {cabecalho}
        <section className="cv-panel cv-ticks cv-rise mx-auto max-w-md rounded-2xl p-9 text-center">
          <X className="cv-text-soft mx-auto size-10 opacity-50" aria-hidden="true" />
          <p className="cv-text font-cv-display mt-4 text-[30px] leading-none">Recusado</p>
          <p className="cv-text-soft mt-2 text-[13px]">
            A ficha não sai. Confira o valor e lance de novo.
          </p>
        </section>
        <div className="mx-auto mt-3 flex max-w-md gap-2">
          <button
            type="button"
            onClick={() => {
              setResultado(null)
              onSelecionar(null)
            }}
            className="cv-btn-quiet h-12 flex-1 text-[13.5px]"
          >
            Trocar de jogador
          </button>
          <button
            type="button"
            onClick={() => setResultado(null)}
            className="cv-ch-live cv-btn cv-shine h-12 flex-1 text-[13.5px]"
          >
            Lançar de novo
          </button>
        </div>
      </div>
    )
  }

  // ── Lançamento (F3, F8, N6, N10) ───────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6">
      {cabecalho}

      {pendente ? (
        <div className="cv-ch-chrome cv-panel cv-accent-ring cv-rise mx-auto mb-3 flex max-w-md items-center gap-3 rounded-2xl p-3.5">
          <p className="cv-text flex-1 text-[12px] leading-snug">
            Já há{' '}
            <strong className="cv-accent-text font-cv-mono cv-num">
              {reais(pendentes.reduce((s, m) => s + m.valor, 0))}
            </strong>{' '}
            esperando a confirmação dele. O limite já conta esse valor.
          </p>
          <button
            type="button"
            onClick={() => setLancandoOutra(false)}
            className="cv-btn-quiet h-10 shrink-0 px-3 text-[12px]"
          >
            Voltar
          </button>
        </div>
      ) : null}
      <LancarRetirada
        jogador={{
          id: atual.id,
          nome: jogador.nome,
          limite: jogador.limite,
          emMao: emMao(noite, atual.id),
          aguardando: aguardando(noite, atual.id),
        }}
        valor={valor}
        liberado={motivoLimite !== null && motivoLimite.trim().length > 0}
        onLiberar={() => setMotivoLimite('')}
        onDigitar={(tecla) => setValor((v) => (tecla === 'apagar' ? v.slice(0, -1) : v + tecla))}
        onGirarTela={async () => {
          await despachar({
            tipo: 'lancar-retirada',
            participacaoId: atual.id,
            valor: Number(valor.replace(/\D/g, '') || '0'),
            // N10: sem motivo escrito, o reducer recusa e o aviso explica.
            motivo: motivoLimite?.trim() || undefined,
          })
          // Volta para a tela girada. Se o reducer recusar (limite sem motivo),
          // o pendente antigo reassume e o aviso do topo explica por quê.
          limpar()
        }}
      >
        {motivoLimite !== null ? (
          <input
            value={motivoLimite}
            onChange={(e) => setMotivoLimite(e.target.value)}
            aria-label="Motivo da liberação acima do limite"
            placeholder="Motivo da liberação — fica registrado"
            className="cv-text mt-2.5 h-11 w-full rounded-lg bg-[var(--cv-panel)] px-3 text-[13px] ring-1 ring-amber-500/40 ring-inset outline-none"
          />
        ) : null}
      </LancarRetirada>
    </div>
  )
}
