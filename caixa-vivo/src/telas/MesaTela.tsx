import { useState } from 'react'
import { CadastroJogador, ListaDaMesa } from '@/sections/jogadores-e-mesa/components'
import { TituloDeTela } from '@/shell/components'
import { useNoite } from '@/estado/NoiteProvider'
import {
  TETO_CONTINGENCIAS,
  aguardando,
  contingenciasDaSessao,
  contingenciasDe,
  emMao,
  formatarHora,
  jogadorDe,
  jogadorPorIdentidade,
  participacoesAbertas,
  whatsappJaUsado,
} from '@/regras/modelo'

export function MesaTela({ onAbrirJogador }: { onAbrirJogador: (id: string) => void }) {
  const { noite, despachar } = useNoite()
  const [busca, setBusca] = useState('')
  const [cadastrando, setCadastrando] = useState(false)

  const abertas = participacoesAbertas(noite)

  if (cadastrando) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6">
        <TituloDeTela sobretitulo="Mesa" titulo="Novo jogador" />
        <CadastroJogador
          jaCadastrado={(n, w) => jogadorPorIdentidade(noite, n, w)?.nome ?? null}
          donoDoWhatsapp={(w) => whatsappJaUsado(noite, w)?.nome ?? null}
          onUsarExistente={(n, w) => {
            const j = jogadorPorIdentidade(noite, n, w)
            if (j) {
              void despachar({ tipo: 'sentar', jogadorId: j.id })
              setCadastrando(false)
            }
          }}
          onCadastrar={async (j) => {
            await despachar({ tipo: 'cadastrar-jogador', ...j, sentar: true })
            setCadastrando(false)
          }}
          onCancelar={() => setCadastrando(false)}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6">
      <TituloDeTela sobretitulo="Jogadores e mesa" titulo="Mesa" />
      <ListaDaMesa
        jogadores={abertas.map((p) => {
          const j = jogadorDe(noite, p.id)
          return {
            id: p.id,
            nome: j?.nome ?? '—',
            whatsapp: j?.whatsapp ?? '',
            cpf: j?.cpf,
            entrouAs: formatarHora(p.entrouAs),
            limite: j?.limite ?? 0,
            emMao: emMao(noite, p.id),
            aguardando: aguardando(noite, p.id),
            contingencias: contingenciasDe(noite, p.id),
          }
        })}
        busca={busca}
        contingenciasNaSessao={contingenciasDaSessao(noite)}
        tetoContingencias={TETO_CONTINGENCIAS}
        sessaoAberta={Boolean(noite.sessao?.aberta)}
        onBuscar={setBusca}
        onAdicionar={() => setCadastrando(true)}
        onAbrirJogador={onAbrirJogador}
      />
    </div>
  )
}
