import {
  Dices,
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
import { isHrefEnabled } from '@/lib/site-config'
import { HorseIcon } from './horse-icon'
import { BoltIcon } from './bolt-icon'

export interface NavItem {
  href: string
  labelKey: DictKey
  icon: LucideIcon | typeof HorseIcon | typeof BoltIcon
  match?: (pathname: string, search: string) => boolean
}

const HOME: NavItem = { href: '/', labelKey: 'nav.home', icon: Home, match: (p) => p === '/' }
const SPORTS: NavItem = { href: '/sports', labelKey: 'nav.sports', icon: Volleyball, match: (p, s) => p === '/sports' && !s.includes('live=1') }
const LIVE: NavItem = { href: '/live', labelKey: 'nav.live', icon: Radio, match: (p, s) => p === '/live' || (p === '/sports' && s.includes('live=1')) }
const BOOSTS: NavItem = { href: '/boosts', labelKey: 'nav.boosts', icon: BoltIcon }
const JACKPOT: NavItem = { href: '/jackpot', labelKey: 'nav.jackpot', icon: Trophy }
const HIPPIQUE: NavItem = { href: '/hippique', labelKey: 'nav.hippique', icon: HorseIcon }
const VIRTUALS: NavItem = { href: '/virtuals', labelKey: 'nav.virtuals', icon: Rocket }
const LOTTERIES: NavItem = { href: '/lotteries', labelKey: 'nav.lotteries', icon: Dices }
const PROMOTIONS: NavItem = { href: '/promotions', labelKey: 'nav.promotions', icon: Gift }
const MY_BETS: NavItem = { href: '/my-bets', labelKey: 'nav.myBets', icon: Ticket }

const enabled = (items: NavItem[]) => items.filter((i) => isHrefEnabled(i.href))

export const PRODUCT_NAV: NavItem[] = enabled([HOME, SPORTS, LIVE, BOOSTS, JACKPOT, HIPPIQUE, VIRTUALS, LOTTERIES, PROMOTIONS])

// The bottom bar always has five tabs: two middle slots go to the client's
// products first, then to sports destinations that always have content.
const MOBILE_MIDDLE_SLOTS = 2
const mobileMiddle = enabled([JACKPOT, VIRTUALS, HIPPIQUE, LOTTERIES, LIVE, BOOSTS, PROMOTIONS]).slice(0, MOBILE_MIDDLE_SLOTS)
export const MOBILE_NAV: NavItem[] = [
  HOME,
  mobileMiddle.includes(LIVE) ? SPORTS : { ...SPORTS, match: (p) => p === '/sports' },
  ...mobileMiddle,
  MY_BETS,
]

export function isActive(item: NavItem, pathname: string, search: string) {
  if (item.match) return item.match(pathname, search)
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}
