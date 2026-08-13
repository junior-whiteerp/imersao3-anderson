import { useState } from 'react'
import { MolduraDaPrevia } from '@/shell/components/MolduraDaPrevia'
import dados from '@/../product/sections/turnos-e-rake/data.json'
import {
  LancarRake,
  ListaDeRakes,
  TurnoEmAberto,
  type Dealer,
  type LancamentoRake,
  type TurnoAberto,
  type TurnoFechado,
} from './components'

const turnoAberto = dados.turnoAberto as TurnoAberto
const turnosFechados = dados.turnosFechados as TurnoFechado[]
const dealers = dados.dealers as Dealer[]
const lancamentos = dados.lancamentos as LancamentoRake[]

export default function RakeView() {
  const [valor, setValor] = useState('300')
  // A hora vem preenchida com a atual e e editavel: o risco R5 e o operador
  // digitar a hora errada, nao esquecer de digitar.
  const [horaSaida, setHoraSaida] = useState(dados.horaAtual)

  return (
    <MolduraDaPrevia
      sobretitulo="Turnos e rake"
      titulo="Rake"
      descricao="O lançamento do rake é o passo que dispara o checkpoint. É aqui que a conta da noite fecha, ou não fecha."
    >
      <div className="space-y-4">
        <TurnoEmAberto turno={turnoAberto} dealers={dealers} />

        <LancarRake
          turnoAberto={turnoAberto}
          turnosFechados={turnosFechados}
          horaAtual={dados.horaAtual}
          valor={valor}
          horaSaida={horaSaida}
          onDigitarValor={setValor}
          onMudarHora={setHoraSaida}
        />

        <ListaDeRakes lancamentos={lancamentos} />
      </div>
    </MolduraDaPrevia>
  )
}
