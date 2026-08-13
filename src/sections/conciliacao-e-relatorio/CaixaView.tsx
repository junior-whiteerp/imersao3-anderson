import { useState } from 'react'
import { MolduraDaPrevia } from '@/shell/components/MolduraDaPrevia'
import dados from '@/../product/sections/conciliacao-e-relatorio/data.json'
import {
  ListaCheckpoints,
  PainelVeredito,
  RelatorioDaSessao,
  type Checkpoint,
  type Relatorio,
  type VereditoAtual,
} from './components'

const atual = dados.vereditoAtual as VereditoAtual
const checkpoints = dados.checkpoints as Checkpoint[]
const relatorio = dados.relatorio as unknown as Relatorio

export default function CaixaView() {
  // Qual checkpoint esta no topo. Por padrao, o ultimo da noite.
  const [selecionado, setSelecionado] = useState(checkpoints[checkpoints.length - 1].id)
  // A secao tem dois estados de tela bem diferentes: a noite acontecendo e a
  // noite guardada. O seletor existe so na previa — no app quem decide e a
  // sessao estar aberta ou nao.
  const [encerrada, setEncerrada] = useState(false)
  const checkpoint = checkpoints.find((c) => c.id === selecionado) ?? null

  return (
    <MolduraDaPrevia
      sobretitulo="Conciliação e relatório"
      titulo={encerrada ? 'Relatório da sessão' : 'Conciliação'}
      descricao={
        encerrada
          ? 'A sessão foi encerrada. Isto é o que substitui o papel que ia para o lixo depois do acerto.'
          : 'O veredito congela a cada lançamento de rake. Entre um e outro, a diferença é esperada — e o app diz isso em vez de alarmar.'
      }
      acessorio={
        <button
          type="button"
          onClick={() => setEncerrada((v) => !v)}
          className="cv-btn-quiet h-10 px-3.5 text-[12px] focus-visible:ring-2 focus-visible:outline-none"
        >
          {encerrada ? 'Ver a noite em andamento' : 'Ver o relatório'}
        </button>
      }
    >
      {encerrada ? (
        <RelatorioDaSessao relatorio={relatorio} />
      ) : (
        <div className="space-y-4">
          <PainelVeredito atual={atual} ultimoCheckpoint={checkpoint} />

          <ListaCheckpoints checkpoints={checkpoints} onAbrir={setSelecionado} />

          <p className="cv-text-soft px-1 text-[12px] leading-relaxed">
            Toque em um checkpoint para ver o veredito daquele momento. O relatório
            completo da sessão fica guardado depois que a noite é encerrada.
          </p>
        </div>
      )}
    </MolduraDaPrevia>
  )
}
