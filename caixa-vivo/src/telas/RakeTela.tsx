import { useState } from 'react'
import { LancarRake, TurnoEmAberto } from '@/sections/turnos-e-rake/components'
import { TituloDeTela } from '@/shell/components'
import { useNoite } from '@/estado/NoiteProvider'
import {
  dealerDo,
  formatarDuracao,
  formatarHora,
  movimentacoesDaSessao,
  paraMinutosPertoDe,
  turnoAberto,
  turnosDaSessao,
} from '@/regras/modelo'

export function RakeTela() {
  const { noite, despachar } = useNoite()
  const [valor, setValor] = useState('')
  const [horaSaida, setHoraSaida] = useState<string | null>(null)

  const aberto = turnoAberto(noite)
  const horaAtual = formatarHora(noite.agora)
  // Enquanto o operador não mexe na hora, ela acompanha o relógio. Fixá-la no
  // primeiro render deixaria o campo envelhecendo em silêncio na tela.
  const horaEfetiva = horaSaida ?? horaAtual

  const rakeDoTurno = (turnoId: string) =>
    movimentacoesDaSessao(noite)
      .filter((m) => m.tipo === 'rake' && m.turnoId === turnoId)
      .reduce((soma, m) => soma + m.valor, 0)

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-7 sm:px-6">
      <TituloDeTela sobretitulo="Turnos e rake" titulo="Rake" />

      <TurnoEmAberto
        turno={
          aberto
            ? {
                id: aberto.id,
                numero: aberto.numero,
                dealer: dealerDo(noite, aberto),
                inicio: formatarHora(aberto.inicio),
                decorrido: formatarDuracao(noite.agora - aberto.inicio),
                rakeDoTurno: rakeDoTurno(aberto.id),
              }
            : null
        }
        dealers={noite.dealers.map((d) => ({ id: d.id, nome: d.nome }))}
        onAbrirTurno={(dealerId) => void despachar({ tipo: 'abrir-turno', dealerId })}
        onTrocarDealer={(dealerId) => void despachar({ tipo: 'trocar-dealer', dealerId })}
      />

      {aberto ? (
        <LancarRake
          turnoAberto={{
            id: aberto.id,
            numero: aberto.numero,
            dealer: dealerDo(noite, aberto),
            inicio: formatarHora(aberto.inicio),
            decorrido: formatarDuracao(noite.agora - aberto.inicio),
            rakeDoTurno: rakeDoTurno(aberto.id),
          }}
          turnosFechados={turnosDaSessao(noite)
            .filter((t) => t.fim !== undefined)
            .map((t) => ({
              id: t.id,
              numero: t.numero,
              dealer: dealerDo(noite, t),
              inicio: formatarHora(t.inicio),
              fim: formatarHora(t.fim!),
              rakeDoTurno: rakeDoTurno(t.id),
            }))}
          horaAtual={horaAtual}
          valor={valor}
          horaSaida={horaEfetiva}
          onDigitarValor={setValor}
          onMudarHora={setHoraSaida}
          onLancar={async () => {
            await despachar({
              tipo: 'lancar-rake',
              valor: Number(valor.replace(/\D/g, '') || '0'),
              // Ancorado em `agora` para a sessão sobreviver à meia-noite.
              horaOcorrencia: paraMinutosPertoDe(noite.agora, horaEfetiva),
            })
            setValor('')
            setHoraSaida(null)
          }}
        />
      ) : null}
    </div>
  )
}
