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
import type { DictKey } from '@/lib/i18n/dictionaries'
import { HorseIcon } from './horse-icon'

export interface NavItem {
  href: string
  labelKey: DictKey
  icon: LucideIcon | typeof HorseIcon
  match?: (pathname: string, search: string) => boolean
}

export const PRODUCT_NAV: NavItem[] = [
  { href: '/', labelKey: 'nav.home', icon: Home, match: (p) => p === '/' },
  { href: '/sports', labelKey: 'nav.sports', icon: Volleyball, match: (p, s) => p === '/sports' && !s.includes('live=1') },
  { href: '/sports?live=1', labelKey: 'nav.live', icon: Radio, match: (p, s) => p === '/sports' && s.includes('live=1') },
  { href: '/boosts', labelKey: 'nav.boosts', icon: Flame },
  { href: '/jackpot', labelKey: 'nav.jackpot', icon: Trophy },
  { href: '/hippique', labelKey: 'nav.hippique', icon: HorseIcon },
  { href: '/virtuals', labelKey: 'nav.virtuals', icon: Rocket },
  { href: '/lotteries', labelKey: 'nav.lotteries', icon: Dices },
  { href: '/promotions', labelKey: 'nav.promotions', icon: Gift },
]

export const MOBILE_NAV: NavItem[] = [
  { href: '/', labelKey: 'nav.home', icon: Home, match: (p) => p === '/' },
  { href: '/sports', labelKey: 'nav.sports', icon: Volleyball, match: (p) => p === '/sports' },
  { href: '/jackpot', labelKey: 'nav.jackpot', icon: Trophy },
  { href: '/virtuals', labelKey: 'nav.virtuals', icon: Rocket },
  { href: '/my-bets', labelKey: 'nav.myBets', icon: Ticket },
]

export function isActive(item: NavItem, pathname: string, search: string) {
  if (item.match) return item.match(pathname, search)
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}
