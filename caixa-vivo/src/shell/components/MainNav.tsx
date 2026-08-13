import type { LucideIcon } from 'lucide-react'
import { Circle } from 'lucide-react'

export interface NavigationItem {
  label: string
  href: string
  icon?: LucideIcon
  isActive?: boolean
}

export interface MainNavProps {
  items: NavigationItem[]
  /** `bottom` sao as abas do celular; `sidebar` e a barra lateral do desktop. */
  variant: 'bottom' | 'sidebar'
  onNavigate?: (href: string) => void
}

/**
 * A navegacao das secoes.
 *
 * Muda de forma conforme a tela porque muda de mao: no celular o polegar
 * alcanca a base, no desktop o olho varre a lateral. E o mesmo app se
 * adaptando, nao dois apps.
 *
 * O item ativo e marcado pela borda de ficha — o mesmo tracejado da marca —
 * em ciano. Ciano e o canal de "vivo" e de acao; ele nunca colide com o
 * veredito, que e o unico dono de verde, ambar e vermelho.
 */
export function MainNav({ items, variant, onNavigate }: MainNavProps) {
  if (variant === 'bottom') {
    return (
      <nav
        aria-label="Navegação principal"
        className="cv-panel cv-line rounded-none border-x-0 border-b-0 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
      >
        {/* Uma coluna por seção. Com 7 abas num celular de 390px cada alvo fica
            com ~55px — apertado, mas ainda acima do mínimo de toque, e o rótulo
            some antes do ícone. */}
        <ul
          className="grid"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
          {items.map((item) => {
            const Icon = item.icon ?? Circle
            return (
              <li key={item.href}>
                <button
                  type="button"
                  onClick={() => onNavigate?.(item.href)}
                  aria-current={item.isActive ? 'page' : undefined}
                  // 56px de alvo de toque: o app é operado de pé, com uma mão.
                  className={`relative flex h-14 w-full flex-col items-center justify-center gap-1 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none ${
                    item.isActive ? 'cv-live-text' : 'cv-text-soft hover:cv-text'
                  }`}
                >
                  {item.isActive ? (
                    <>
                      {/* A borda da ficha, deitada: marca a aba sem ocupar linha. */}
                      <span
                        className="cv-chip-rail-x cv-live-text absolute inset-x-2.5 top-0 h-[3px]"
                        aria-hidden="true"
                      />
                      <span
                        className="cv-live-fill absolute inset-x-1.5 inset-y-1.5 -z-10 rounded-lg"
                        aria-hidden="true"
                      />
                    </>
                  ) : null}
                  <Icon
                    className={`size-5 shrink-0 transition-transform duration-200 ${
                      item.isActive ? 'scale-110' : ''
                    }`}
                    aria-hidden="true"
                  />
                  <span className="text-[9.5px] leading-none font-semibold tracking-[0.02em]">
                    {item.label}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    )
  }

  return (
    <nav aria-label="Navegação principal" className="flex-1 p-2">
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => {
          const Icon = item.icon ?? Circle
          return (
            <li key={item.href}>
              <button
                type="button"
                onClick={() => onNavigate?.(item.href)}
                aria-current={item.isActive ? 'page' : undefined}
                title={item.label}
                className={`group relative flex h-11 w-full items-center gap-3 rounded-lg px-3 text-[13.5px] font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none ${
                  item.isActive
                    ? 'cv-live-text cv-live-fill'
                    : 'cv-text-soft hover:cv-text hover:bg-[var(--cv-panel-quiet)]'
                }`}
              >
                {item.isActive ? (
                  <span
                    className="cv-chip-rail cv-live-text absolute inset-y-1.5 left-0 w-[3px] rounded-full"
                    aria-hidden="true"
                  />
                ) : null}
                <Icon
                  className={`size-[18px] shrink-0 transition-transform duration-200 ${
                    item.isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`}
                  aria-hidden="true"
                />
                {/* No tablet a lateral é estreita: fica só o ícone. */}
                <span className="hidden truncate lg:inline">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
