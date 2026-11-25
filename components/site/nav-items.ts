import {
  Dices,
  Flame,
  Gift,
  Home,
  Radio,
  Rocket,
  Ticket,
  Trophy,
  Volleyball,
  type LucideIcon,
} from 'lucide-react'
import { HorseIcon } from './horse-icon'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon | typeof HorseIcon
  match?: (pathname: string, search: string) => boolean
}

export const PRODUCT_NAV: NavItem[] = [
  { href: '/', label: 'Home', icon: Home, match: (p) => p === '/' },
  { href: '/sports', label: 'Sports', icon: Volleyball, match: (p, s) => p === '/sports' && !s.includes('live=1') },
  { href: '/sports?live=1', label: 'Live', icon: Radio, match: (p, s) => p === '/sports' && s.includes('live=1') },
  { href: '/boosts', label: 'Odds Boost', icon: Flame },
  { href: '/jackpot', label: 'Jackpot', icon: Trophy },
  { href: '/hippique', label: 'Hippique', icon: HorseIcon },
  { href: '/virtuals', label: 'Virtuals', icon: Rocket },
  { href: '/lotteries', label: 'Lotteries', icon: Dices },
  { href: '/promotions', label: 'Promotions', icon: Gift },
]

export const MOBILE_NAV: NavItem[] = [
  { href: '/', label: 'Home', icon: Home, match: (p) => p === '/' },
  { href: '/sports', label: 'Sports', icon: Volleyball, match: (p) => p === '/sports' },
  { href: '/jackpot', label: 'Jackpot', icon: Trophy },
  { href: '/virtuals', label: 'Virtuals', icon: Rocket },
  { href: '/my-bets', label: 'My Bets', icon: Ticket },
]

export function isActive(item: NavItem, pathname: string, search: string) {
  if (item.match) return item.match(pathname, search)
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}
