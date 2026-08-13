import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { MolduraDaPrevia } from '@/shell/components/MolduraDaPrevia'
import dados from '@/../product/sections/fichas/data.json'
import {
  ExtratoFechamento,
  LancarRetirada,
  TelaConfirmacao,
  type Extrato,
  type JogadorSelecionado,
} from './components'

const jogador = dados.jogadorSelecionado as JogadorSelecionado
const extrato = dados.extrato as Extrato

type Passo = 'lancar' | 'confirmar' | 'confirmado' | 'recusado' | 'extrato'

const PASSOS: { id: Passo; rotulo: string }[] = [
  { id: 'lancar', rotulo: 'Lançar' },
  { id: 'confirmar', rotulo: 'Girar a tela' },
  { id: 'confirmado', rotulo: 'Confirmado' },
  { id: 'recusado', rotulo: 'Recusado' },
  { id: 'extrato', rotulo: 'Fechar conta' },
]

export default function FichasView() {
  const [passo, setPasso] = useState<Passo>('lancar')
  const [valor, setValor] = useState('1200')
  const [contingencias, setContingencias] = useState(dados.contingenciasNaSessao)

  function digitar(tecla: string) {
    if (tecla === 'apagar') setValor((v) => v.slice(0, -1))
    else setValor((v) => (v === '0' ? tecla : v + tecla))
  }

  const numero = Number(valor.replace(/\D/g, '') || '0')

  return (
    <MolduraDaPrevia sobretitulo="Fichas" titulo={jogador.nome}>
      {/* Estas abas sao do desenho, nao do produto: no app o passo e decidido
          pelo estado do lancamento, nunca por um seletor na tela. */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        {PASSOS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPasso(p.id)}
            className={
              passo === p.id
                ? 'cv-ch-live cv-btn h-9 px-3 text-[12px]'
                : 'cv-btn-quiet h-9 px-3 text-[12px]'
            }
          >
            {p.rotulo}
          </button>
        ))}
      </div>

      {passo === 'lancar' ? (
        <LancarRetirada
          jogador={jogador}
          valor={valor}
          onDigitar={digitar}
          onGirarTela={() => setPasso('confirmar')}
        />
      ) : null}

      {passo === 'confirmar' ? (
        <TelaConfirmacao
          jogador={jogador.nome}
          valor={numero}
          contingenciasNaSessao={contingencias}
          tetoContingencias={dados.tetoContingencias}
          onConfirmar={() => setPasso('confirmado')}
          onRecusar={() => setPasso('recusado')}
          onContingencia={() => {
            setContingencias((c) => c + 1)
            setPasso('confirmado')
          }}
        />
      ) : null}

      {passo === 'confirmado' ? (
        <section className="cv-ch-fecha cv-panel cv-accent-ring cv-rise mx-auto max-w-md rounded-2xl p-9 text-center">
          <Check className="cv-accent-text mx-auto size-10" aria-hidden="true" />
          <p className="cv-accent-text font-cv-display mt-4 text-[30px] leading-none">
            Confirmado às 22h14
          </p>
          <p className="cv-text-soft mt-2 text-[13px]">Pode entregar as fichas.</p>
        </section>
      ) : null}

      {passo === 'recusado' ? (
        <section className="cv-panel cv-ticks cv-rise mx-auto max-w-md rounded-2xl p-9 text-center">
          <X className="cv-text-soft mx-auto size-10 opacity-50" aria-hidden="true" />
          <p className="cv-text font-cv-display mt-4 text-[30px] leading-none">Recusado</p>
          <p className="cv-text-soft mt-2 text-[13px]">
            A ficha não sai. Confira o valor e lance de novo.
          </p>
          <button
            type="button"
            onClick={() => setPasso('lancar')}
            className="cv-ch-live cv-btn cv-shine mt-6 h-12 w-full text-[13.5px]"
          >
            Lançar de novo
          </button>
        </section>
      ) : null}

      {passo === 'extrato' ? <ExtratoFechamento extrato={extrato} /> : null}
    </MolduraDaPrevia>
  )
}
