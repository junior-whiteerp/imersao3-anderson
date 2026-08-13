import { useState } from 'react'
import {
  LancarRake,
  ListaDeRakes,
  TurnoEmAberto,
} from '@/sections/turnos-e-rake/components'
import { TituloDeTela } from '@/shell/components/TituloDeTela'
import { useSimulacao } from '../contexto'
import { formatarHora, paraMinutosPertoDe } from '../modelo'
import { rakesVista, turnoAbertoVista, turnosFechadosVista } from '../vistas'

export function RakeConectada() {
  const { noite, despachar } = useSimulacao()
  const [valor, setValor] = useState('')
  // A hora vem preenchida com a atual e e editavel. O risco R5 e o operador
  // digitar a hora errada, e a hora errada manda o rake para o dealer errado.
  const [horaSaida, setHoraSaida] = useState(formatarHora(noite.agora))
  const [horaTocada, setHoraTocada] = useState(false)

  const aberto = turnoAbertoVista(noite)
  // Enquanto o operador nao mexer no campo, a hora acompanha o relogio.
  const horaEfetiva = horaTocada ? horaSaida : formatarHora(noite.agora)

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-7 sm:px-6">
      <TituloDeTela
        sobretitulo="Turnos e rake"
        titulo="Rake"
        descricao="O lançamento do rake é o passo que dispara o checkpoint. É aqui que a conta da noite fecha, ou não fecha."
      />

      <TurnoEmAberto
        turno={aberto}
        dealers={noite.dealers}
        onAbrirTurno={(dealerId) => despachar({ tipo: 'abrir-turno', dealerId })}
        onTrocarDealer={(dealerId) => despachar({ tipo: 'trocar-dealer', dealerId })}
      />

      {aberto ? (
        <LancarRake
          turnoAberto={aberto}
          turnosFechados={turnosFechadosVista(noite)}
          horaAtual={formatarHora(noite.agora)}
          valor={valor}
          horaSaida={horaEfetiva}
          onDigitarValor={setValor}
          onMudarHora={(hora) => {
            setHoraTocada(true)
            setHoraSaida(hora)
          }}
          onLancar={() => {
            despachar({
              tipo: 'lancar-rake',
              valor: Number(valor.replace(/\D/g, '') || '0'),
              // Ancorado em `agora` para a sessao sobreviver a meia-noite: as
              // 00h30 o texto "00h30" nao pode virar o minuto 30 do dia, que
              // seria antes de todos os turnos da noite.
              horaOcorrencia: paraMinutosPertoDe(noite.agora, horaEfetiva),
            })
            setValor('')
            setHoraTocada(false)
          }}
        />
      ) : null}

      {noite.movimentacoes.some((m) => m.tipo === 'rake') ? (
        <ListaDeRakes lancamentos={rakesVista(noite)} />
      ) : null}
    </div>
  )
}
