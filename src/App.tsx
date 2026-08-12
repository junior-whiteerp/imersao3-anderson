import { useState } from 'react'
import { AppShell, Login, NAVEGACAO_PADRAO } from '@/shell/components'
import { NoiteProvider, useNoite } from '@/estado/NoiteProvider'
import { useOperador } from '@/auth/useOperador'
import { statusDaFaixa } from '@/telas/faixa'
import { SessaoTela } from '@/telas/SessaoTela'
import { MesaTela } from '@/telas/MesaTela'
import { FichasTela } from '@/telas/FichasTela'
import { RakeTela } from '@/telas/RakeTela'
import { CaixaTela } from '@/telas/CaixaTela'

function Conteudo({ operador, sair }: { operador: { nome: string }; sair: () => void }) {
  const { noite, estado, erro, recarregar } = useNoite()
  const [rota, setRota] = useState('/sessao')
  const [participacaoId, setParticipacaoId] = useState<string | null>(null)

  const itens = NAVEGACAO_PADRAO
    .filter((i) => i.href !== '/painel' && i.href !== '/ao-vivo') // fora desta fatia
    .map((i) => ({ ...i, isActive: i.href === rota }))

  return (
    <AppShell
      navigationItems={itens}
      user={{ name: operador.nome }}
      status={statusDaFaixa(noite)}
      onNavigate={setRota}
      onStatusClick={() => setRota('/caixa')}
      onLogout={sair}
    >
      {estado === 'carregando' ? (
        <p className="cv-text-soft p-8 text-center text-[13px]">Carregando a noite…</p>
      ) : estado === 'erro' ? (
        <div className="cv-panel cv-ch-suspender mx-auto mt-8 max-w-md rounded-2xl p-6 text-center">
          <p className="cv-accent-text font-cv-display text-[24px]">
            Não deu para falar com o banco
          </p>
          <p className="cv-text-soft mt-2 text-[13px]">{erro}</p>
          <p className="cv-text-soft mt-2 text-[12px]">
            Nada foi perdido: o que já estava salvo continua salvo. Enquanto isso, use o papel.
          </p>
          <button
            type="button"
            onClick={() => void recarregar()}
            className="cv-ch-live cv-btn mt-5 h-12 w-full text-[13.5px]"
          >
            Tentar de novo
          </button>
        </div>
      ) : (
        <>
          {rota === '/sessao' ? <SessaoTela /> : null}
          {rota === '/mesa' ? (
            <MesaTela
              onAbrirJogador={(id) => {
                setParticipacaoId(id)
                setRota('/fichas')
              }}
            />
          ) : null}
          {rota === '/fichas' ? (
            <FichasTela participacaoId={participacaoId} onSelecionar={setParticipacaoId} />
          ) : null}
          {rota === '/rake' ? <RakeTela /> : null}
          {rota === '/caixa' ? <CaixaTela /> : null}
        </>
      )}
    </AppShell>
  )
}

export default function App() {
  const { operador, carregando, entrar, sair } = useOperador()
  if (carregando) return <p className="p-8 text-center">Carregando…</p>
  if (!operador) return <Login onEntrar={entrar} />
  return (
    <NoiteProvider operadorId={operador.id}>
      <Conteudo operador={operador} sair={sair} />
    </NoiteProvider>
  )
}
