import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { MesaVisual } from '@/sections/jogadores-e-mesa/components'
import { TituloDeTela } from '@/shell/components/TituloDeTela'
import { useSimulacao } from '../contexto'
import { participacoesAbertas } from '../modelo'
import { mesaAoVivoVista } from '../vistas'

export interface MesaAoVivoConectadaProps {
  onAbrirJogador: (participacaoId: string) => void
}

export function MesaAoVivoConectada({ onAbrirJogador }: MesaAoVivoConectadaProps) {
  const { noite, despachar } = useSimulacao()
  const [sentando, setSentando] = useState<number | null>(null)

  const vista = mesaAoVivoVista(noite)
  const abertas = participacoesAbertas(noite)
  // Quem ja tem cadeira nao aparece na lista de sentar. Quem esta de pe
  // aparece: a acao `sentar` da a cadeira a ele sem criar participacao nova,
  // e sem isso quem entrou pela aba Mesa ficaria de pe para sempre.
  const sentados = new Set(abertas.filter((p) => p.lugar !== undefined).map((p) => p.jogadorId))
  const disponiveis = noite.jogadores.filter((j) => !sentados.has(j.id))

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-7 sm:px-6">
      <TituloDeTela
        sobretitulo="Jogadores e mesa"
        titulo="Mesa ao vivo"
        acessorio={
          <div className="text-right">
            <p className="cv-text-soft cv-engraved text-[9px] font-semibold tracking-[0.18em] uppercase">
              Lugares
            </p>
            <p className="cv-text font-cv-mono cv-num mt-1 text-[22px] leading-none font-bold">
              {vista.lugares.length}
              <span className="cv-text-soft text-[14px]">/10</span>
            </p>
          </div>
        }
      />

      <MesaVisual
        lugares={vista.lugares}
        emPe={vista.emPe}
        dealer={vista.dealer}
        turno={vista.turno}
        fichasEmJogo={vista.fichasEmJogo}
        onAbrirJogador={onAbrirJogador}
        onSentar={setSentando}
      />

      {sentando !== null ? (
        <section className="cv-panel cv-rise rounded-2xl p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="cv-text-soft cv-engraved text-[9.5px] font-semibold tracking-[0.18em] uppercase">
              Quem senta no lugar {sentando}?
            </h2>
            <button
              type="button"
              onClick={() => setSentando(null)}
              className="cv-text-soft hover:cv-text text-[12px] underline underline-offset-4 transition-colors"
            >
              Cancelar
            </button>
          </div>

          {disponiveis.length === 0 ? (
            <p className="cv-text-soft mt-2.5 text-[13px]">
              Todo mundo que está cadastrado já está na sessão. Cadastre alguém na aba
              Mesa.
            </p>
          ) : (
            <>
              <p className="cv-text-soft mt-1.5 text-[12px] leading-snug">
                A cadeira fica reservada para ele agora. Ela só passa a ocupada
                quando ele confirmar a primeira ficha na tela girada.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {disponiveis.map((jogador) => (
                  <button
                    key={jogador.id}
                    type="button"
                    onClick={() => {
                      despachar({ tipo: 'sentar', jogadorId: jogador.id, lugar: sentando })
                      setSentando(null)
                    }}
                    className="cv-btn-quiet h-11 px-3.5 text-[13px] hover:-translate-y-px focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <UserPlus className="size-3.5 shrink-0" aria-hidden="true" />
                    {jogador.nome}
                  </button>
                ))}
              </div>
            </>
          )}
        </section>
      ) : null}
    </div>
  )
}
