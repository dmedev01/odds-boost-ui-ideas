import Link from 'next/link'
import { Dices, Flame, Radio, Rocket, Trophy } from 'lucide-react'
import { HorseIcon } from '@/components/site/horse-icon'
import { JACKPOT } from '@/lib/data/jackpot'
import { formatMoney } from '@/lib/format'
import type { HomeTile } from '@/lib/home-plan'
import type { DictKey } from '@/lib/i18n/dictionaries'
import { PRODUCT_HREF, type ProductId } from '@/lib/site-config'

type T = (key: DictKey, vars?: Record<string, string | number>) => string

const PRODUCT_TILE: Record<ProductId, { label: DictKey; sub: DictKey | null; icon: typeof Trophy | typeof HorseIcon }> = {
  jackpot: { label: 'home.jackpot', sub: null, icon: Trophy },
  hippique: { label: 'home.hippique', sub: 'home.hippiqueSub', icon: HorseIcon },
  virtuals: { label: 'home.virtuals', sub: 'home.virtualsSub', icon: Rocket },
  lotteries: { label: 'home.lotteries', sub: 'home.lotteriesSub', icon: Dices },
}

function describe(tile: HomeTile, t: T) {
  switch (tile.kind) {
    case 'product': {
      const p = PRODUCT_TILE[tile.id]
      return { href: PRODUCT_HREF[tile.id], label: t(p.label), sub: p.sub ? t(p.sub) : formatMoney(JACKPOT.pool), Icon: p.icon }
    }
    case 'live':
      return { href: '/sports?live=1', label: t('nav.live'), sub: t('home.liveCount', { n: tile.count }), Icon: Radio }
    case 'boosts':
      return { href: '/boosts', label: t('nav.boosts'), sub: t('home.boostsCount', { n: tile.count }), Icon: Flame }
    case 'league':
      return {
        href: `/sports?league=${encodeURIComponent(tile.league)}`,
        label: tile.league,
        sub: t('home.matchesCount', { n: tile.count }),
        Icon: Trophy,
      }
  }
}

export function HomeTiles({ tiles, t }: { tiles: HomeTile[]; t: T }) {
  return (
    <nav aria-label={t('home.games')} className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {tiles.map((tile) => {
        const { href, label, sub, Icon } = describe(tile, t)
        return (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-xl bg-surface p-3 transition-colors hover:bg-surface-2"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand text-primary">
              <Icon className="size-5" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-extrabold">{label}</span>
              <span className="truncate text-xs text-muted-foreground">{sub}</span>
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

export function LeagueChips({ leagues, t }: { leagues: { name: string; count: number }[]; t: T }) {
  return (
    <section aria-labelledby="competitions-heading" className="flex flex-col gap-2">
      <h2 id="competitions-heading" className="text-sm font-extrabold">
        {t('home.topCompetitions')}
      </h2>
      <ul className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 lg:mx-0 lg:flex-wrap lg:px-0">
        {leagues.map((l) => (
          <li key={l.name} className="shrink-0">
            <Link
              href={`/sports?league=${encodeURIComponent(l.name)}`}
              className="flex items-center gap-2 rounded-full bg-surface px-3 py-2 text-sm font-bold transition-colors hover:bg-surface-2"
            >
              {l.name}
              <span className="rounded-full bg-surface-2 px-1.5 text-xs text-muted-foreground">{l.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
