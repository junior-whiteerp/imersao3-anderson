import { CircleDot, Coins, Gauge, HandCoins, Scale, Timer, Users } from 'lucide-react'
import type { NavigationItem } from './MainNav'

/**
 * A navegacao da noite.
 *
 * "Painel" vem primeiro porque e a tela que o operador deixa aberta: ela nao
 * pede acao nenhuma, so mostra a noite inteira de uma vez. As outras seis sao
 * lugares onde ele vai fazer alguma coisa.
 *
 * "Ao vivo" fica logo abaixo de "Mesa" porque e a mesma coisa vista de outro
 * jeito: a lista serve para operar, o desenho serve para olhar de longe.
 */
export const NAVEGACAO_PADRAO: NavigationItem[] = [
  { label: 'Painel', href: '/painel', icon: Gauge },
  { label: 'Sessão', href: '/sessao', icon: Timer },
  { label: 'Mesa', href: '/mesa', icon: Users },
  { label: 'Ao vivo', href: '/ao-vivo', icon: CircleDot },
  { label: 'Fichas', href: '/fichas', icon: Coins },
  { label: 'Rake', href: '/rake', icon: HandCoins },
  { label: 'Caixa', href: '/caixa', icon: Scale },
]
