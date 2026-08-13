import { useEffect, useState, type ReactNode } from 'react'
import { CaixaStatusBar, type CaixaStatus } from './CaixaStatusBar'
import { MainNav, type NavigationItem } from './MainNav'
import { SimboloStackTrack } from './MarcaStackTrack'
import { NAVEGACAO_PADRAO } from './navigation'
import { UserMenu, type ShellUser } from './UserMenu'

/**
 * As tres familias do produto, carregadas sem depender do <head> da aplicacao
 * hospedeira. Na exportacao isto vira um <link> no index.html do produto.
 *
 * Serifa de alto contraste para o veredito, sans companheira para instrucao,
 * mono grotesca para dinheiro e hora.
 */
const FONTES_GOOGLE =
  'https://fonts.googleapis.com/css2?family=Azeret+Mono:wght@400;500;600;700&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Instrument+Serif:ital@0;1&display=swap'

/**
 * O tema do produto.
 *
 * Ele e do produto, e nao da aplicacao que hospeda a previa: o Design OS
 * sincroniza a classe `.dark` com a preferencia do sistema e a reaplica em
 * intervalo curto, entao pendurar o tema do Caixa Vivo ali faria os dois
 * brigarem pela mesma classe — e o produto exportado herdaria a briga.
 */
export type CaixaTema = 'escuro' | 'claro'

export interface AppShellProps {
  children: ReactNode
  navigationItems?: NavigationItem[]
  user?: ShellUser
  status?: CaixaStatus
  /** Tema inicial. Escuro por padrao: e um app de madrugada. */
  temaInicial?: CaixaTema
  onNavigate?: (href: string) => void
  onStatusClick?: () => void
  /** Avisado a cada troca. O shell ja cuida do tema; isto e so notificacao. */
  onToggleTheme?: (tema: CaixaTema) => void
  onEndSession?: () => void
  onLogout?: () => void
}

/** StackTrack e a plataforma; Caixa Vivo e a release 1. A serifa italica separa
 *  os dois sem precisar de uma segunda linha de rotulo. */
function Marca({ compacta = false }: { compacta?: boolean }) {
  return (
    <span className={compacta ? 'flex items-baseline gap-2' : 'hidden min-w-0 lg:block'}>
      <span className="cv-text block truncate text-[13px] leading-tight font-semibold tracking-[-0.01em]">
        Stack<span className="cv-live-text">Track</span>
      </span>
      <span className="cv-text-soft font-cv-display block truncate text-[15px] leading-tight italic">
        Caixa Vivo
      </span>
    </span>
  )
}

/**
 * O shell do Caixa Vivo: um painel de instrumento, nao um painel administrativo.
 *
 * Duas pecas fixas envolvem todas as secoes — a faixa de estado do caixa, que
 * nunca sai da tela, e a navegacao das secoes, que muda de forma conforme o
 * tamanho do aparelho. As secoes nunca trazem navegacao propria.
 */
export function AppShell({
  children,
  navigationItems = NAVEGACAO_PADRAO,
  user,
  status,
  temaInicial = 'escuro',
  onNavigate,
  onStatusClick,
  onToggleTheme,
  onEndSession,
  onLogout,
}: AppShellProps) {
  const [tema, setTema] = useState<CaixaTema>(temaInicial)

  useEffect(() => {
    if (document.querySelector(`link[href="${FONTES_GOOGLE}"]`)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = FONTES_GOOGLE
    document.head.appendChild(link)
  }, [])

  function alternarTema() {
    const proximo: CaixaTema = tema === 'escuro' ? 'claro' : 'escuro'
    setTema(proximo)
    onToggleTheme?.(proximo)
  }

  return (
    <div
      data-cv-tema={tema}
      className="cv-room cv-grain cv-text font-cv-sans relative isolate flex min-h-screen"
    >
      {/* Barra lateral: so a ficha no tablet, ficha e rotulo no desktop. */}
      <aside className="cv-panel relative z-10 hidden w-16 shrink-0 flex-col rounded-none border-y-0 border-l-0 backdrop-blur-xl md:flex lg:w-56">
        <div className="cv-line flex h-16 items-center gap-2.5 border-b px-3.5">
          <SimboloStackTrack tamanho="sm" />
          <Marca />
        </div>

        <MainNav items={navigationItems} variant="sidebar" onNavigate={onNavigate} />

        {/* O rodape da lateral guarda a unica coisa que nao e navegacao: quem
            esta operando. O PRD registra "quem lancou" em cada movimentacao. */}
        <div className="cv-line border-t p-2">
          <UserMenu
            user={user}
            align="up"
            tema={tema}
            onToggleTheme={alternarTema}
            onEndSession={onEndSession}
            onLogout={onLogout}
          />
        </div>
      </aside>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30">
          {/* Faixa de identidade so no celular: a lateral cumpre esse papel no
              desktop, e repetir a marca ali roubaria altura do veredito. */}
          <div className="cv-panel cv-line flex h-12 items-center justify-between rounded-none border-x-0 border-t-0 px-3 backdrop-blur-xl md:hidden">
            <span className="flex items-center gap-2.5">
              <SimboloStackTrack tamanho="sm" />
              <Marca compacta />
            </span>
            <UserMenu
              user={user}
              align="down"
              tema={tema}
            onToggleTheme={alternarTema}
              onEndSession={onEndSession}
              onLogout={onLogout}
            />
          </div>

          <CaixaStatusBar status={status} onStatusClick={onStatusClick} />
        </header>

        <main className="min-w-0 flex-1">{children}</main>

        {/* As abas ficam no fluxo e grudam na base: o conteudo desliza por tras
            delas e continua alcancavel no fim da rolagem. */}
        <div className="sticky bottom-0 z-30 md:hidden">
          <MainNav items={navigationItems} variant="bottom" onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  )
}
