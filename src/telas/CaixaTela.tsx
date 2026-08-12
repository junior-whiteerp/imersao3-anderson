import { ListaCheckpoints, PainelVeredito } from '@/sections/conciliacao-e-relatorio/components'
import type { Checkpoint as CheckpointDaTela } from '@/sections/conciliacao-e-relatorio/components/tipos'
import { TituloDeTela } from '@/shell/components'
import { useNoite } from '@/estado/NoiteProvider'
import {
  checkpointsDaSessao,
  dealerDo,
  fichasEmJogo,
  formatarHora,
  turnosDaSessao,
  type Noite,
} from '@/regras/modelo'

/** Uma linha do checkpoint, no formato que a seção de conciliação desenha. */
function paraTela(noite: Noite, c: ReturnType<typeof checkpointsDaSessao>[number]): CheckpointDaTela {
  const turnos = turnosDaSessao(noite)
  const doRake = turnos.find((t) => t.id === c.turnoId)
  return {
    id: c.id,
    numero: c.numero,
    hora: formatarHora(c.hora),
    diferenca: c.diferenca,
    veredito: c.veredito,
    janelaInicio: formatarHora(c.janelaInicio),
    janelaFim: formatarHora(c.janelaFim),
    turno: doRake?.numero ?? 0,
    dealer: dealerDo(noite, doRake ?? null),
    // A janela pode atravessar uma troca de dealer. Mostrar só um apontaria
    // para a pessoa errada — N14.
    turnosNaJanela: c.turnoIdsNaJanela
      .map((id) => turnos.find((t) => t.id === id))
      .filter((t): t is NonNullable<typeof t> => Boolean(t))
      .map((t) => ({ numero: t.numero, dealer: dealerDo(noite, t) })),
    rakeAcumulado: c.rakeAcumulado,
  }
}

export function CaixaTela() {
  const { noite } = useNoite()

  const checkpoints = checkpointsDaSessao(noite)
  const ultimo = checkpoints[checkpoints.length - 1]

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-7 sm:px-6">
      <TituloDeTela sobretitulo="Conciliação" titulo="Caixa" />
      <PainelVeredito
        atual={{
          estado: ultimo ? 'neutro' : 'sem-checkpoint',
          // Entre dois checkpoints o que o app conhece é ficha em jogo, não
          // divergência: a diferença só existe depois de alguém contar a caixa.
          diferenca: fichasEmJogo(noite),
          desdeHora: ultimo ? formatarHora(ultimo.hora) : formatarHora(noite.sessao?.abertaEm ?? 0),
          horaAtual: formatarHora(noite.agora),
        }}
        ultimoCheckpoint={ultimo ? paraTela(noite, ultimo) : null}
      />
      <ListaCheckpoints checkpoints={checkpoints.map((c) => paraTela(noite, c))} />
    </div>
  )
}
