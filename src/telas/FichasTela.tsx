import { useState } from 'react'
import { LancarRetirada, TelaConfirmacao } from '@/sections/fichas/components'
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

  const abertas = participacoesAbertas(noite)
  const atual = participacaoId ? abertas.find((p) => p.id === participacaoId) : undefined

  function limpar() {
    setValor('')
    setMotivoLimite(null)
    setMotivoContingencia(null)
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
              {abertas.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    limpar()
                    onSelecionar(p.id)
                  }}
                  className="cv-btn-quiet h-12 px-3.5 text-[13.5px] font-semibold"
                >
                  {jogadorDe(noite, p.id)?.nome}
                  <span className="cv-text-soft font-cv-mono cv-num text-[11px]">
                    {reais(emMao(noite, p.id))}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const jogador = jogadorDe(noite, atual.id)!
  // O MAIS ANTIGO vai para a tela girada: é o que o jogador viu primeiro.
  const pendente = noite.movimentacoes.find(
    (m) => m.participacaoId === atual.id && m.tipo === 'retirada' && m.situacao === 'aguardando'
  )

  // ── A tela girada para o jogador (F3, N2) ──────────────────────────────
  if (pendente) {
    return (
      <TelaConfirmacao
        plenaTela
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
          onSelecionar(null)
        }}
        onRecusar={async () => {
          await despachar({ tipo: 'recusar', movimentacaoId: pendente.id })
          limpar()
        }}
        onContingencia={() => setMotivoContingencia('')}
        rodape={
          motivoContingencia !== null ? (
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
                  onSelecionar(null)
                }}
                className="cv-btn mt-3 h-11 w-full text-[13px] disabled:opacity-35 disabled:saturate-0"
              >
                Registrar contingência
              </button>
            </section>
          ) : null
        }
      />
    )
  }

  // ── Lançamento (F3, F8, N6, N10) ───────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6">
      <TituloDeTela
        sobretitulo="Fichas"
        titulo={jogador.nome}
        acessorio={
          <button
            type="button"
            onClick={() => {
              limpar()
              onSelecionar(null)
            }}
            className="cv-btn-quiet h-10 px-3.5 text-[12px]"
          >
            Trocar jogador
          </button>
        }
      />
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
          setValor('')
          setMotivoLimite(null)
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
