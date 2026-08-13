import { useState } from 'react'
import { MolduraDaPrevia } from '@/shell/components/MolduraDaPrevia'
import dados from '@/../product/sections/sessao-e-caixa/data.json'
import {
  AbrirSessao,
  EncerrarSessao,
  LinhaDoTempoTurnos,
  ResumoCaixa,
  type JogadorNaMesa,
  type ResumoSessao,
  type Sessao,
  type TurnoResumo,
} from './components'

const sessao = dados.sessao as Sessao
const resumo = dados.resumo as ResumoSessao
const turnos = dados.turnos as TurnoResumo[]
const jogadoresNaMesa = dados.jogadoresNaMesa as JogadorNaMesa[]

export default function SessaoView() {
  // O estado vazio e metade da tela: e o que o operador ve ao chegar no clube.
  const [aberta, setAberta] = useState(true)

  return (
    <MolduraDaPrevia
      sobretitulo={`${sessao.clube} · aberta às ${sessao.abertaEm}`}
      titulo="Sessão e Caixa"
      acessorio={
        <button
          type="button"
          onClick={() => setAberta((v) => !v)}
          className="cv-btn-quiet h-10 px-3.5 text-[12px] focus-visible:ring-2 focus-visible:outline-none"
        >
          {aberta ? 'Ver estado vazio' : 'Ver sessão aberta'}
        </button>
      }
    >
      {aberta ? (
        <div className="space-y-4">
          <ResumoCaixa sessao={sessao} resumo={resumo} />
          <LinhaDoTempoTurnos turnos={turnos} />
          <EncerrarSessao jogadoresNaMesa={jogadoresNaMesa} />
        </div>
      ) : (
        <AbrirSessao clube={sessao.clube} onAbrir={() => setAberta(true)} />
      )}
    </MolduraDaPrevia>
  )
}
