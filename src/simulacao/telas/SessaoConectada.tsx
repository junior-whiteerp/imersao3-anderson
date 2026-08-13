import { FileText } from 'lucide-react'
import {
  AbrirSessao,
  EncerrarSessao,
  LinhaDoTempoTurnos,
  ResumoCaixa,
} from '@/sections/sessao-e-caixa/components'
import { TituloDeTela } from '@/shell/components/TituloDeTela'
import { useSimulacao } from '../contexto'
import { CLUBE } from '../roteiroInicial'
import { nomesNaMesa, resumoVista, sessaoVista, turnosVista } from '../vistas'

export interface SessaoConectadaProps {
  /** Leva ao relatorio da noite encerrada, que vive na secao de Conciliacao. */
  onVerRelatorio?: () => void
}

export function SessaoConectada({ onVerRelatorio }: SessaoConectadaProps) {
  const { noite, despachar } = useSimulacao()
  const sessao = sessaoVista(noite)

  if (!sessao || !noite.sessao?.aberta) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6">
        <TituloDeTela sobretitulo={CLUBE} titulo="Sessão e Caixa" />
        <AbrirSessao
          clube={CLUBE}
          onAbrir={(caixaInicial) =>
            despachar({ tipo: 'abrir-sessao', clube: CLUBE, caixaInicial })
          }
        />
        {sessao ? (
          <div className="mx-auto mt-4 max-w-md text-center">
            <p className="cv-text-soft text-[12px] leading-relaxed">
              A sessão anterior foi encerrada e o relatório ficou guardado. Nada foi
              apagado.
            </p>
            {onVerRelatorio ? (
              <button
                type="button"
                onClick={onVerRelatorio}
                className="cv-btn-quiet mx-auto mt-3 h-11 px-4 text-[13px] hover:-translate-y-px focus-visible:ring-2 focus-visible:outline-none"
              >
                <FileText className="size-4 shrink-0" aria-hidden="true" />
                Ver o relatório da noite anterior
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-7 sm:px-6">
      <TituloDeTela
        sobretitulo={`${sessao.clube} · aberta às ${sessao.abertaEm}`}
        titulo="Sessão e Caixa"
      />
      <ResumoCaixa sessao={sessao} resumo={resumoVista(noite)} />
      <LinhaDoTempoTurnos turnos={turnosVista(noite)} />
      <EncerrarSessao
        jogadoresNaMesa={nomesNaMesa(noite)}
        onEncerrar={() => despachar({ tipo: 'encerrar-sessao' })}
      />
    </div>
  )
}
