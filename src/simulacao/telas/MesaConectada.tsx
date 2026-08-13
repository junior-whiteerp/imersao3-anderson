import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { CadastroJogador, ListaDaMesa } from '@/sections/jogadores-e-mesa/components'
import { TituloDeTela } from '@/shell/components/TituloDeTela'
import { useSimulacao } from '../contexto'
import {
  TETO_CONTINGENCIAS,
  contingenciasDaSessao,
  jogadorPorIdentidade,
  participacoesAbertas,
  whatsappJaUsado,
} from '../modelo'
import { mesaVista } from '../vistas'

export interface MesaConectadaProps {
  /** Abrir um jogador leva direto para o lancamento de fichas dele. */
  onAbrirJogador: (participacaoId: string) => void
}

export function MesaConectada({ onAbrirJogador }: MesaConectadaProps) {
  const { noite, despachar } = useSimulacao()
  const [busca, setBusca] = useState('')
  /**
   * Quantos estavam na mesa quando o formulario abriu.
   *
   * O formulario fecha sozinho quando alguem senta — e so entao. Antes ele
   * fechava no clique, desse certo ou nao, e um cadastro recusado levava junto
   * nome, WhatsApp, limite e consentimento ja digitados.
   */
  const [abertoCom, setAbertoCom] = useState<number | null>(null)

  const abertas = participacoesAbertas(noite)
  const naMesa = new Set(abertas.map((p) => p.jogadorId))
  const disponiveis = noite.jogadores.filter((j) => !naMesa.has(j.id))
  const sessaoAberta = Boolean(noite.sessao?.aberta)
  const cadastrando = abertoCom !== null && abertas.length === abertoCom

  function sentar(jogadorId: string) {
    despachar({ tipo: 'sentar', jogadorId })
  }

  if (cadastrando) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6">
        <TituloDeTela sobretitulo="Mesa" titulo="Novo jogador" />
        <CadastroJogador
          jaCadastrado={(nome, whatsapp) =>
            jogadorPorIdentidade(noite, nome, whatsapp)?.nome ?? null
          }
          donoDoWhatsapp={(whatsapp) => whatsappJaUsado(noite, whatsapp)?.nome ?? null}
          onUsarExistente={(nome, whatsapp) => {
            const jogador = jogadorPorIdentidade(noite, nome, whatsapp)
            if (jogador) sentar(jogador.id)
          }}
          onCadastrar={(jogador) =>
            despachar({ tipo: 'cadastrar-jogador', ...jogador, sentar: true })
          }
          onCancelar={() => setAbertoCom(null)}
        />

        {disponiveis.length > 0 ? (
          <section className="cv-panel cv-rise cv-d1 mx-auto mt-4 max-w-md rounded-2xl p-4">
            <h2 className="cv-text-soft cv-engraved text-[9.5px] font-semibold tracking-[0.18em] uppercase">
              Já cadastrados
            </h2>
            <p className="cv-text-soft mt-1.5 text-[12px]">
              Quem já jogou aqui antes não precisa cadastrar de novo.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {disponiveis.map((jogador) => (
                <button
                  key={jogador.id}
                  type="button"
                  onClick={() => sentar(jogador.id)}
                  className="cv-btn-quiet h-11 px-3.5 text-[13px] hover:-translate-y-px focus-visible:ring-2 focus-visible:outline-none"
                >
                  <UserPlus className="size-3.5 shrink-0" aria-hidden="true" />
                  {jogador.nome}
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6">
      <TituloDeTela
        sobretitulo="Jogadores e mesa"
        titulo="Mesa"
        descricao="Quem está jogando agora, quanto cada um tem da caixa na mão, e quanto falta para o limite."
      />
      <ListaDaMesa
        jogadores={mesaVista(noite)}
        busca={busca}
        contingenciasNaSessao={contingenciasDaSessao(noite)}
        tetoContingencias={TETO_CONTINGENCIAS}
        sessaoAberta={sessaoAberta}
        onBuscar={setBusca}
        onAdicionar={() => setAbertoCom(abertas.length)}
        onAbrirJogador={onAbrirJogador}
      />
    </div>
  )
}
