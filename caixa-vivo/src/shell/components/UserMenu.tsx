import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut, Moon, PowerOff, Sun } from 'lucide-react'

export interface ShellUser {
  name: string
  avatarUrl?: string
}

export interface UserMenuProps {
  user?: ShellUser
  /** `up` abre para cima (pe da barra lateral); `down` abre para baixo (topo do celular). */
  align?: 'up' | 'down'
  /** Tema atual do produto. Decide qual icone o item de alternar mostra. */
  tema?: 'escuro' | 'claro'
  onToggleTheme?: () => void
  /** Encerrar a noite. Acao rara e irreversivel — fica longe do dedo, de proposito. */
  onEndSession?: () => void
  onLogout?: () => void
}

function iniciais(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('')
}

/**
 * O menu do operador.
 *
 * A release 1 tem um operador so, sem login e sem niveis de permissao. Mas a
 * identidade nao e decorativa: o PRD registra "quem lancou" em cada
 * movimentacao, e esse e o nome que vai para o registro.
 */
export function UserMenu({
  user,
  align = 'down',
  tema = 'escuro',
  onToggleTheme,
  onEndSession,
  onLogout,
}: UserMenuProps) {
  const [aberto, setAberto] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aberto) return

    function aoClicarFora(evento: MouseEvent) {
      if (!containerRef.current?.contains(evento.target as Node)) setAberto(false)
    }
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setAberto(false)
    }

    document.addEventListener('mousedown', aoClicarFora)
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('mousedown', aoClicarFora)
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [aberto])

  if (!user) return null

  function executar(acao?: () => void) {
    setAberto(false)
    acao?.()
  }

  const item =
    'cv-text flex h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-[13.5px] transition-colors hover:bg-[var(--cv-panel-quiet)]'

  return (
    <div ref={containerRef} className="cv-ch-chrome relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        className="flex h-11 w-full items-center gap-2.5 rounded-lg px-2 text-left transition-colors hover:bg-[var(--cv-panel-quiet)] focus-visible:ring-2 focus-visible:outline-none"
      >
        {/* Violeta e cor de chrome, nunca de estado do caixa. A ficha tracejada
            repete a marca em escala menor. */}
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="cv-accent-border size-8 shrink-0 rounded-full border object-cover"
          />
        ) : (
          <span
            className="relative flex size-8 shrink-0 items-center justify-center"
            aria-hidden="true"
          >
            <span className="cv-accent-text absolute inset-0 rounded-full border border-dashed opacity-60" />
            <span className="cv-accent-fill absolute inset-[2px] rounded-full" />
            <span className="cv-accent-text font-cv-mono relative text-[10px] leading-none font-bold">
              {iniciais(user.name)}
            </span>
          </span>
        )}
        <span className="cv-text hidden min-w-0 flex-1 truncate text-[13px] font-medium lg:block">
          {user.name}
        </span>
        <ChevronDown
          className={`cv-text-soft hidden size-4 shrink-0 transition-transform duration-200 lg:block ${
            aberto ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {aberto ? (
        <div
          role="menu"
          className={`cv-panel cv-rise absolute right-0 z-50 w-60 overflow-hidden rounded-xl ${
            align === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          <div className="cv-line border-b px-3 py-2.5">
            <p className="cv-text truncate text-[13.5px] font-semibold">{user.name}</p>
            <p className="cv-text-soft cv-engraved mt-0.5 text-[9.5px] font-semibold tracking-[0.14em] uppercase">
              Operador desta sessão
            </p>
          </div>

          <div className="p-1.5">
            {onToggleTheme ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => executar(onToggleTheme)}
                className={item}
              >
                {tema === 'escuro' ? (
                  <Sun className="size-4 shrink-0" aria-hidden="true" />
                ) : (
                  <Moon className="size-4 shrink-0" aria-hidden="true" />
                )}
                {tema === 'escuro' ? 'Modo claro' : 'Modo escuro'}
              </button>
            ) : null}

            {onLogout ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => executar(onLogout)}
                className={item}
              >
                <LogOut className="size-4 shrink-0" aria-hidden="true" />
                Sair
              </button>
            ) : null}
          </div>

          {onEndSession ? (
            <div className="cv-line cv-ch-suspender border-t p-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={() => executar(onEndSession)}
                className="cv-accent-text flex h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-[13.5px] font-semibold transition-colors hover:bg-[var(--cv-accent-soft)]"
              >
                <PowerOff className="size-4 shrink-0" aria-hidden="true" />
                Encerrar sessão
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
