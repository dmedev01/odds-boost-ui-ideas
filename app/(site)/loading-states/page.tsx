import Link from 'next/link'
import { MatchList } from '@/components/sports/match-row'
import { HeroSkeleton, TilesSkeleton } from '@/components/loading/skeletons'
import {
  BoostsLoading,
  DataEmpty,
  DataError,
  DataOffline,
  MatchesLoading,
  RefreshBar,
} from '@/components/loading/data-state'
import { MATCHES } from '@/lib/data/sports'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Loading states · WandaBet' }

const STATES = [
  { id: 'loading', label: 'Loading', when: 'First 8 seconds while matches are empty and on their way.' },
  { id: 'slow', label: 'Slow', when: 'After 8 seconds. Added automatically; polling keeps going.' },
  { id: 'failed', label: 'Failed', when: 'The load returned an error. Retry reloads the server data.' },
  { id: 'offline', label: 'Offline', when: 'The device has no connection (navigator.onLine is false).' },
  { id: 'empty', label: 'Empty', when: 'The load finished and returned zero matches.' },
  { id: 'refreshing', label: 'Refreshing', when: 'Matches are on screen and a background refresh is running.' },
  { id: 'page', label: 'Full page', when: 'Whole homepage before anything has loaded (first visit, cold server).' },
] as const

type StateId = (typeof STATES)[number]['id']

export default async function LoadingStatesPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state: requested } = await searchParams
  const state = STATES.find((s) => s.id === requested) ?? STATES[0]

  return (
    <div className="flex flex-col gap-5">
      <nav aria-label="Loading states" className="flex flex-col gap-2 rounded-xl bg-surface p-3 ring-1 ring-border">
        <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Data loading states</p>
        <ul className="flex flex-wrap gap-1.5">
          {STATES.map((s) => (
            <li key={s.id}>
              <Link
                href={`/loading-states?state=${s.id}`}
                scroll={false}
                aria-current={s.id === state.id ? 'page' : undefined}
                className={cn(
                  'flex h-8 items-center rounded-full px-3 text-xs font-bold ring-1',
                  s.id === state.id
                    ? 'bg-primary text-primary-foreground ring-primary'
                    : 'bg-surface-2 text-foreground/80 ring-border hover:ring-primary',
                )}
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          <span className="font-bold text-foreground">When:</span> {state.when}
        </p>
      </nav>

      <StatePreview id={state.id} />
    </div>
  )
}

function StatePreview({ id }: { id: StateId }) {
  switch (id) {
    case 'loading':
      return <MatchesLoading title="Upcoming football" slow={false} />
    case 'slow':
      return <MatchesLoading title="Upcoming football" slow />
    case 'failed':
      return <DataError subject="matches" />
    case 'offline':
      return <DataOffline subject="matches" />
    case 'empty':
      return <DataEmpty subject="matches" />
    case 'refreshing':
      return (
        <div className="flex flex-col gap-2">
          <RefreshBar active />
          <MatchList title="Upcoming football" matches={MATCHES.filter((m) => !m.live).slice(0, 4)} />
        </div>
      )
    case 'page':
      return (
        <div className="flex flex-col gap-5">
          <HeroSkeleton />
          <TilesSkeleton />
          <BoostsLoading slow={false} />
          <MatchesLoading slow={false} />
          <MatchesLoading slow={false} rows={3} />
        </div>
      )
  }
}
