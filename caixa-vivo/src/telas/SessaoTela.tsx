import { AbrirSessao, LinhaDoTempoTurnos, ResumoCaixa } from '@/sections/sessao-e-caixa/components'
import { TituloDeTela } from '@/shell/components'
import { useNoite } from '@/estado/NoiteProvider'
import {
  checkpointsDaSessao,
  dealerDo,
  estadoDaFaixa,
  fichasEmJogo,
  formatarDuracao,
  formatarHora,
  movimentacoesDaSessao,
  rakeDeclarado,
  somaDevolucoes,
  somaRetiradas,
  turnosDaSessao,
} from '@/regras/modelo'

const CLUBE = 'Clube Paris'

export function SessaoTela() {
  const { noite, despachar } = useNoite()

  if (!noite.sessao?.aberta) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6">
        <TituloDeTela sobretitulo={CLUBE} titulo="Sessão e Caixa" />
        <AbrirSessao
          clube={CLUBE}
          onAbrir={(caixaInicial) =>
            void despachar({ tipo: 'abrir-sessao', clube: CLUBE, caixaInicial })
          }
        />
      </div>
    )
  }

  const s = noite.sessao
  const checkpoints = checkpointsDaSessao(noite)
  const ultimo = checkpoints[checkpoints.length - 1]
  const congelado = estadoDaFaixa(noite) !== 'neutro'

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-7 sm:px-6">
      <TituloDeTela
        sobretitulo={`${CLUBE} · aberta às ${formatarHora(s.abertaEm)}`}
        titulo="Sessão e Caixa"
      />
      <ResumoCaixa
        sessao={{
          id: s.id,
          clube: CLUBE,
          abertaEm: formatarHora(s.abertaEm),
          horaAtual: formatarHora(noite.agora),
          decorrido: formatarDuracao(noite.agora - s.abertaEm),
          caixaInicial: s.caixaInicial,
          situacao: 'aberta',
        }}
        resumo={{
          retiradas: somaRetiradas(noite),
          devolucoes: somaDevolucoes(noite),
          rakeRecolhido: rakeDeclarado(noite),
          diferenca: congelado ? ultimo.diferenca : fichasEmJogo(noite),
          rakePendente: !congelado,
          ultimoRakeEm: ultimo ? formatarHora(ultimo.hora) : undefined,
          checkpoints: checkpoints.length,
        }}
      />
      <LinhaDoTempoTurnos
        turnos={turnosDaSessao(noite).map((t) => ({
          id: t.id,
          numero: t.numero,
          dealer: dealerDo(noite, t),
          inicio: formatarHora(t.inicio),
          fim: t.fim === undefined ? undefined : formatarHora(t.fim),
          rakeDoTurno: movimentacoesDaSessao(noite)
            .filter((m) => m.tipo === 'rake' && m.turnoId === t.id)
            .reduce((soma, m) => soma + m.valor, 0),
          aberto: t.fim === undefined,
        }))}
      />
    </div>
  )
}
