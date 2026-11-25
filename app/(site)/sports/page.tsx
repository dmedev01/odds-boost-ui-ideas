import type { Metadata } from 'next'
import Link from 'next/link'
import { MatchList } from '@/components/sports/match-row'
import { PromoSlot } from '@/components/site/promo-slot'
import { MATCHES, SPORTS, type SportId } from '@/lib/data/sports'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Sports betting' }

export default async function SportsPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string; league?: string; live?: string }>
}) {
  const { sport, league, live } = await searchParams
  const liveOnly = live === '1'
  const sportId = SPORTS.some((s) => s.id === sport) ? (sport as SportId) : undefined

  const matches = MATCHES.filter(
    (m) => (!sportId || m.sport === sportId) && (!league || m.league === league) && (!liveOnly || m.live),
  )
  const leagues = [...new Set(matches.map((m) => m.league))]

  const tabs = [
    { label: 'All', href: liveOnly ? '/sports?live=1' : '/sports', active: !sportId },
    ...SPORTS.map((s) => ({
      label: s.name,
      href: `/sports?sport=${s.id}${liveOnly ? '&live=1' : ''}`,
      active: sportId === s.id,
    })),
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-black">{liveOnly ? 'Live betting' : league ?? 'Sports'}</h1>
        <nav aria-label="Filter by sport" className="no-scrollbar flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <Link
              key={t.label}
              href={t.href}
              aria-current={t.active ? 'page' : undefined}
              className={cn(
                'shrink-0 rounded-full px-4 py-1.5 text-sm font-bold',
                t.active ? 'bg-primary text-primary-foreground' : 'bg-surface hover:bg-surface-2',
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>

      <PromoSlot placement="sports" />

      {leagues.length === 0 ? (
        <p className="rounded-xl bg-surface p-8 text-center text-sm text-muted-foreground">
          No events match this filter right now.
        </p>
      ) : (
        leagues.map((l) => (
          <MatchList key={l} title={l} matches={matches.filter((m) => m.league === l)} />
        ))
      )}
    </div>
  )
}
