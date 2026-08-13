import { useState } from 'react'
import { MolduraDaPrevia } from '@/shell/components/MolduraDaPrevia'
import dados from '@/../product/sections/jogadores-e-mesa/data.json'
import { CadastroJogador, ListaDaMesa, type JogadorNaMesa } from './components'

const jogadores = dados.jogadores as JogadorNaMesa[]

export default function MesaView() {
  const [busca, setBusca] = useState('')
  const [cadastrando, setCadastrando] = useState(false)

  return (
    <MolduraDaPrevia
      sobretitulo="Jogadores e mesa"
      titulo={cadastrando ? 'Novo jogador' : 'Mesa'}
      descricao={
        cadastrando
          ? undefined
          : 'Quem está jogando agora, quanto cada um tem da caixa na mão, e quanto falta para o limite.'
      }
    >
      {cadastrando ? (
        <CadastroJogador
          onCadastrar={() => setCadastrando(false)}
          onCancelar={() => setCadastrando(false)}
        />
      ) : (
        <ListaDaMesa
          jogadores={jogadores}
          busca={busca}
          onBuscar={setBusca}
          onAdicionar={() => setCadastrando(true)}
        />
      )}
    </MolduraDaPrevia>
  )
}
