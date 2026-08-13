import { useState } from 'react'
import { Users, X } from 'lucide-react'
import {
  ExtratoFechamento,
  LancarRetirada,
  TelaConfirmacao,
} from '@/sections/fichas/components'
import { finalDoWhatsapp } from '@/sections/jogadores-e-mesa/components'
import { TituloDeTela } from '@/shell/components/TituloDeTela'
import { useSimulacao } from '../contexto'
import {
  TETO_CONTINGENCIAS,
  contingenciasDaSessao,
  emMao,
  jogadorDe,
  participacoesAbertas,
  reais,
} from '../modelo'
import { extratoVista, jogadorSelecionadoVista } from '../vistas'

export interface FichasConectadaProps {
  participacaoId: string | null
  onSelecionar: (participacaoId: string | null) => void
}

export function FichasConectada({ participacaoId, onSelecionar }: FichasConectadaProps) {
  const { noite, despachar } = useSimulacao()
  const [valor, setValor] = useState('')
  const [motivoLimite, setMotivoLimite] = useState<string | null>(null)
  const [motivoContingencia, setMotivoContingencia] = useState<string | null>(null)
  // So a recusa para numa tela de resultado. A confirmacao volta direto para o
  // seletor: a proxima ficha quase sempre e de outra pessoa, e numa noite de
  // dezenas de lancamentos um toque a menos em cada um pesa.
  const [resultado, setResultado] = useState<'recusado' | null>(null)
  const [fechando, setFechando] = useState(false)
  const [contagem, setContagem] = useState('')
  // Lancar outra ficha com uma ja esperando confirmacao. Sem este caminho, a
  // metade "aguardando" do limite (N6) e o criterio A9 nunca aconteciam na tela.
  const [lancandoOutra, setLancandoOutra] = useState(false)

  const abertas = participacoesAbertas(noite)
  const atual = participacaoId
    ? (abertas.find((p) => p.id === participacaoId) ?? null)
    : null

  function limpar() {
    setValor('')
    setMotivoLimite(null)
    setMotivoContingencia(null)
    setContagem('')
    setFechando(false)
    setLancandoOutra(false)
  }

  // ── Ninguem escolhido ────────────────────────────────────────────────────
  if (!atual) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6">
        <TituloDeTela sobretitulo="Fichas" titulo="Para quem é a ficha?" />
        {abertas.length === 0 ? (
          <p className="cv-panel cv-text-soft cv-rise rounded-2xl p-10 text-center text-[13px]">
            Ninguém na mesa. Adicione um jogador antes de lançar fichas.
          </p>
        ) : (
          <section className="cv-panel cv-ticks cv-rise rounded-2xl p-5">
            <h2 className="cv-text-soft cv-engraved flex items-center gap-1.5 text-[9.5px] font-semibold tracking-[0.18em] uppercase">
              <Users className="size-3" aria-hidden="true" />
              Na mesa agora
            </h2>
            <div className="mt-3.5 flex flex-wrap gap-2">
              {abertas.map((p) => {
                const dele = jogadorDe(noite, p.id)
                // A18: com homonimos na mesa, o nome sozinho nao identifica.
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
                    className="cv-btn-quiet h-12 px-3.5 text-[13.5px] font-semibold hover:-translate-y-px focus-visible:ring-2 focus-visible:outline-none"
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
          </section>
        )}
      </div>
    )
  }

  const jogador = jogadorSelecionadoVista(noite, atual.id)!
  // O lancamento que espera o jogador. Ele nao expira por tempo (N18): sai por
  // confirmacao, recusa, ou encerramento da conta.
  const pendentes = noite.movimentacoes.filter(
    (m) =>
      m.participacaoId === atual.id &&
      m.tipo === 'retirada' &&
      m.situacao === 'aguardando'
  )
  // O MAIS ANTIGO vai para a tela girada: e o que o jogador viu primeiro. Antes
  // mostrava o mais novo, e o anterior ficava invisivel e sem saida.
  const pendente = pendentes[0]
  const outrosPendentes = pendentes.slice(1)

  const cabecalho = (
    <TituloDeTela
      sobretitulo="Fichas"
      titulo={jogador.nome}
      acessorio={
        <div className="flex gap-2">
          {/* Fechar a conta continua disponivel mesmo com lancamento aguardando.
              E justamente ai que a regra N7 existe: o jogador saiu da mesa com um
              valor ainda na tela, e encerrar a conta cancela o que esta pendente.
              Esconder o botao deixava a regra sem caminho na interface. */}
          {!fechando ? (
            <button
              type="button"
              onClick={() => setFechando(true)}
              className="cv-btn-quiet h-10 px-3.5 text-[12px] focus-visible:ring-2 focus-visible:outline-none"
            >
              Fechar a conta
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              limpar()
              setResultado(null)
              onSelecionar(null)
            }}
            className="cv-btn-quiet h-10 px-3.5 text-[12px] focus-visible:ring-2 focus-visible:outline-none"
          >
            Trocar jogador
          </button>
        </div>
      }
    />
  )

  // ── Tela girada para o jogador ───────────────────────────────────────────
  // O fechamento vem antes: se o operador pediu para fechar a conta, e porque o
  // jogador saiu — e a retirada pendente na tela precisa ser cancelada, nao
  // confirmada.
  if (pendente && !fechando && !lancandoOutra) {
    // Tudo que NAO e do jogador vai para o rodape da tela cheia. O aparelho
    // esta na mao dele: o painel do clube nao pode estar por perto, mas os
    // caminhos do operador tambem nao podem sumir.
    const rodape = (
      <div className="space-y-3">
        {/* O jogador pediu mais fichas antes de confirmar a primeira. E o caso
            de borda que fez a regra N6 nascer: o limite precisa contar as duas.
            Sem este botao, a tela nunca conseguia criar a segunda. */}
        {motivoContingencia === null ? (
          <button
            type="button"
            onClick={() => setLancandoOutra(true)}
            className="cv-btn-quiet h-11 w-full text-[13px] focus-visible:ring-2 focus-visible:outline-none"
          >
            Ele pediu mais fichas antes de confirmar
          </button>
        ) : null}

        {/* Nada de pendente pode ficar invisivel: o que nao esta na tela girada
            aparece aqui, com saida propria. */}
        {outrosPendentes.length > 0 ? (
          <section className="cv-ch-chrome cv-panel cv-accent-ring rounded-2xl p-3.5">
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
                    onClick={() => despachar({ tipo: 'recusar', movimentacaoId: m.id })}
                    className="cv-btn-quiet h-9 px-2.5 text-[12px]"
                  >
                    Recusar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      despachar({
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
              Contingência {contingenciasDaSessao(noite) + 1} de {TETO_CONTINGENCIAS} ·
              motivo
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
                onClick={() => {
                  despachar({
                    tipo: 'confirmar',
                    movimentacaoId: pendente.id,
                    confirmacao: 'contingencia',
                    motivo: motivoContingencia,
                  })
                  limpar()
                  if (outrosPendentes.length === 0) onSelecionar(null)
                }}
                className="cv-btn h-11 flex-1 text-[13px] disabled:cursor-not-allowed disabled:opacity-35 disabled:saturate-0"
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
        onConfirmar={() => {
          despachar({
            tipo: 'confirmar',
            movimentacaoId: pendente.id,
            confirmacao: 'presencial',
          })
          limpar()
          // Se ainda sobrou pendente, fica no jogador para confirmar o
          // proximo — senao ele ficaria escondido no seletor.
          if (outrosPendentes.length === 0) onSelecionar(null)
        }}
        onRecusar={() => {
          despachar({ tipo: 'recusar', movimentacaoId: pendente.id })
          // Recusa exige relancar para o MESMO jogador. Nao volta ao seletor.
          setResultado('recusado')
          limpar()
        }}
        onContingencia={() => setMotivoContingencia('')}
      />
    )
  }

  // ── Fechamento de conta ──────────────────────────────────────────────────
  if (fechando) {
    const extrato = extratoVista(noite, atual.id)
    const contado = Number(contagem.replace(/\D/g, '') || '0')
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6">
        {cabecalho}
        <section className="cv-panel cv-ticks cv-rise mx-auto mb-3 max-w-md rounded-2xl p-5">
          <label
            htmlFor="contagem"
            className="cv-text-soft cv-engraved block text-[9.5px] font-semibold tracking-[0.16em] uppercase"
          >
            Fichas contadas com o jogador
          </label>
          <div className="cv-panel-quiet cv-line mt-2.5 flex items-center rounded-xl border focus-within:ring-2">
            <span className="cv-text-soft font-cv-mono pl-3.5 opacity-70">R$</span>
            <input
              id="contagem"
              inputMode="numeric"
              value={contagem}
              onChange={(e) => setContagem(e.target.value)}
              placeholder="0"
              className="cv-text font-cv-mono cv-num h-14 w-full bg-transparent px-3 text-right text-[24px] font-bold outline-none placeholder:opacity-25"
            />
          </div>
          {/* N7: o que estava esperando o jogador vai ser cancelado. O operador
              precisa saber disso ANTES de encerrar, nao depois. */}
          {pendente ? (
            <p className="cv-ch-chrome cv-accent-text cv-accent-fill mt-3.5 rounded-xl p-3 text-[12px] leading-snug">
              Há uma retirada de{' '}
              <strong className="font-cv-mono cv-num">{reais(pendente.valor)}</strong>{' '}
              esperando a confirmação dele. Ao encerrar a conta ela é cancelada — a ficha
              não saiu.
            </p>
          ) : null}
          <p className="cv-text-soft mt-2.5 text-[11px] leading-snug">
            Ele tirou <span className="font-cv-mono cv-num">{reais(jogador.emMao)}</span>{' '}
            da caixa. O que ele devolve agora é o que está na mão dele — pode ser mais ou
            menos.
          </p>
        </section>

        {extrato ? (
          <ExtratoFechamento
            extrato={extrato}
            onEncerrarConta={() => {
              despachar({
                tipo: 'devolver-e-encerrar',
                participacaoId: atual.id,
                valor: contado,
              })
              limpar()
              onSelecionar(null)
            }}
          />
        ) : null}
      </div>
    )
  }

  // ── Recusa ───────────────────────────────────────────────────────────────
  // A confirmacao nao passa por aqui: ela volta direto ao seletor, e o aviso do
  // topo diz que pode entregar. A recusa para, porque ela pede uma acao — o
  // operador precisa conferir o valor e lancar de novo para a MESMA pessoa.
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
            className="cv-btn-quiet h-12 flex-1 text-[13.5px] focus-visible:ring-2 focus-visible:outline-none"
          >
            Trocar de jogador
          </button>
          <button
            type="button"
            onClick={() => setResultado(null)}
            className="cv-ch-live cv-btn cv-shine h-12 flex-1 text-[13.5px] focus-visible:ring-2 focus-visible:outline-none"
          >
            Lançar de novo
          </button>
        </div>
      </div>
    )
  }

  // ── Lancamento ───────────────────────────────────────────────────────────
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
        jogador={jogador}
        valor={valor}
        liberado={motivoLimite !== null && motivoLimite.trim().length > 0}
        onLiberar={() => setMotivoLimite('')}
        onDigitar={(tecla) =>
          setValor((v) => (tecla === 'apagar' ? v.slice(0, -1) : v + tecla))
        }
        onGirarTela={() => {
          despachar({
            tipo: 'lancar-retirada',
            participacaoId: atual.id,
            valor: Number(valor.replace(/\D/g, '') || '0'),
            motivo: motivoLimite?.trim() || undefined,
          })
          // Volta para a tela girada. Se o reducer recusar (limite sem motivo),
          // o pendente antigo reassume e o aviso explica por que.
          setValor('')
          setMotivoLimite(null)
          setLancandoOutra(false)
        }}
      >
        {motivoLimite !== null ? (
          <input
            value={motivoLimite}
            onChange={(e) => setMotivoLimite(e.target.value)}
            placeholder="Motivo da liberação — fica registrado"
            aria-label="Motivo da liberação acima do limite"
            className="cv-text mt-2.5 h-11 w-full rounded-lg bg-[var(--cv-panel)] px-3 text-[13px] ring-1 ring-amber-500/40 ring-inset outline-none focus:ring-2 focus:ring-amber-500"
          />
        ) : null}
      </LancarRetirada>
    </div>
  )
}
