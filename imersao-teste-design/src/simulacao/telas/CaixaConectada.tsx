import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  ListaCheckpoints,
  PainelVeredito,
  RelatorioDaSessao,
} from '@/sections/conciliacao-e-relatorio/components'
import { TituloDeTela } from '@/shell/components/TituloDeTela'
import { useSimulacao } from '../contexto'
import { estadoDaFaixa, fichasEmJogo, formatarHora, reais } from '../modelo'
import { checkpointsVista, contabilidade, relatorioVista } from '../vistas'

export function CaixaConectada() {
  const { noite } = useSimulacao()
  const [selecionado, setSelecionado] = useState<string | null>(null)
  const [mostrarConta, setMostrarConta] = useState(false)

  // A14: encerrada a sessao, esta tela vira o relatorio. Ele nao e uma aba nova
  // nem um lugar escondido — e o que sobra da noite, no mesmo lugar onde o
  // operador acompanhou a conta a noite inteira.
  const relatorio = relatorioVista(noite)
  if (relatorio) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-7 sm:px-6">
        <TituloDeTela
          sobretitulo="Conciliação e relatório"
          titulo="Relatório da sessão"
          descricao="A sessão foi encerrada. Isto é o que substitui o papel que ia para o lixo depois do acerto."
        />
        <RelatorioDaSessao relatorio={relatorio} />
      </div>
    )
  }

  const checkpoints = checkpointsVista(noite)
  const emFoco =
    checkpoints.find((c) => c.id === selecionado) ??
    checkpoints[checkpoints.length - 1] ??
    null

  const ultimo = noite.checkpoints[noite.checkpoints.length - 1]
  const c = contabilidade(noite)

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-7 sm:px-6">
      <TituloDeTela
        sobretitulo="Conciliação e relatório"
        titulo="Conciliação"
        descricao="O veredito congela a cada lançamento de rake. Entre um e outro, a diferença é esperada — e o app diz isso em vez de alarmar."
      />

      <PainelVeredito
        atual={{
          estado: ultimo ? 'neutro' : 'sem-checkpoint',
          diferenca: fichasEmJogo(noite),
          desdeHora: ultimo ? formatarHora(ultimo.hora) : '—',
          horaAtual: formatarHora(noite.agora),
        }}
        ultimoCheckpoint={emFoco}
      />

      {checkpoints.length > 0 ? (
        <ListaCheckpoints checkpoints={checkpoints} onAbrir={setSelecionado} />
      ) : null}

      {/* A conta aberta. O produto pede que o operador confie no numero, entao
          o numero precisa poder ser conferido a mao. */}
      <section className="cv-panel cv-rise cv-d2 overflow-hidden rounded-2xl">
        <button
          type="button"
          onClick={() => setMostrarConta((v) => !v)}
          aria-expanded={mostrarConta}
          className="cv-text-soft cv-engraved flex w-full items-center gap-2 px-5 py-3.5 text-left text-[9.5px] font-semibold tracking-[0.18em] uppercase transition-colors hover:bg-[var(--cv-panel-quiet)]"
        >
          <ChevronDown
            className={`size-3.5 shrink-0 transition-transform duration-200 ${
              mostrarConta ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
          Como esta conta é feita
        </button>

        {mostrarConta ? (
          <div className="cv-line border-t p-5">
            <ul className="space-y-2 text-[13px]">
              {[
                ['Caixa inicial', c.caixaInicial, '+'],
                ['Retiradas confirmadas', c.retiradas, '−'],
                ['Devoluções confirmadas', c.devolucoes, '+'],
                ['Rake declarado', c.rake, '+'],
              ].map(([rotulo, valor, sinal]) => (
                <li key={rotulo as string} className="flex justify-between gap-4">
                  <span className="cv-text-soft">
                    <span className="font-cv-mono mr-2">{sinal}</span>
                    {rotulo}
                  </span>
                  <span className="cv-text font-cv-mono cv-num font-semibold">
                    {reais(valor as number)}
                  </span>
                </li>
              ))}
              <li className="cv-line flex justify-between gap-4 border-t pt-2.5">
                <span className="cv-text font-semibold">
                  <span className="font-cv-mono mr-2">=</span>Caixa esperado
                </span>
                <span className="cv-text font-cv-mono cv-num font-bold">
                  {reais(c.caixaEsperado)}
                </span>
              </li>
            </ul>

            <p className="cv-text-soft mt-5 text-[12px] leading-relaxed">
              Fichas em jogo agora:{' '}
              <span className="cv-text font-cv-mono cv-num font-semibold">
                {reais(c.fichasEmJogo)}
              </span>{' '}
              — saíram da caixa e ainda não voltaram. Esse número é esperado ser diferente
              de zero enquanto houver gente na mesa. Ele não é furo.
            </p>

            <p className="cv-panel-quiet cv-text-soft mt-3 rounded-xl p-3.5 text-[12px] leading-relaxed">
              O furo só aparece quando o operador conta a caixa, e ele conta no lançamento
              de rake — que é a hora em que ele já está com a mão nela. Por isso o veredito
              congela ali, e não o tempo todo.
            </p>
          </div>
        ) : null}
      </section>

      {estadoDaFaixa(noite) === 'neutro' && ultimo ? (
        <p className="cv-text-soft px-1 text-[12px] leading-relaxed">
          O veredito acima é do checkpoint {ultimo.numero}, congelado às{' '}
          <span className="font-cv-mono cv-num">{formatarHora(ultimo.hora)}</span>. Fichas
          se moveram depois disso — o próximo lançamento de rake abre o próximo checkpoint.
        </p>
      ) : null}
    </div>
  )
}
