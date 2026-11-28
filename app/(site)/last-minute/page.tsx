import type { Metadata } from 'next'
import { MatchList } from '@/components/sports/match-row'
import { Notice, StateSwitcher, pickState, type StatePageProps } from '@/components/v4/ui-states'
import { MATCHES } from '@/lib/data/sports'

export const metadata: Metadata = { title: 'Last minute' }

const STATES = [
  { id: '1h', label: 'Next hour', uc: 'SPT-003' },
  { id: '3h', label: 'Next 3 h', uc: 'SPT-003' },
  { id: '12h', label: 'Next 12 h', uc: 'SPT-003' },
  { id: 'empty', label: 'Nothing soon', uc: 'SPT-003' },
] as const

const HOURS: Record<string, number> = { '1h': 1, '3h': 3, '12h': 12, empty: 0 }

export default async function LastMinutePage({ searchParams }: StatePageProps) {
  const { state: requested } = await searchParams
  const state = pickState(STATES, requested).id
  const upcoming = MATCHES.filter((m) => !m.live).sort((a, b) => a.startsAt - b.startsAt)
  const count = state === 'empty' ? 0 : Math.min(upcoming.length, HOURS[state] * 4)

  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath="/last-minute" />
      {count ? (
        <MatchList title={`Starting in the ${STATES.find((s) => s.id === state)!.label.toLowerCase()}`} matches={upcoming.slice(0, count)} />
      ) : (
        <Notice tone="info" title="No events start in the next hour">Try a wider window, or bet live now.</Notice>
      )}
    </div>
  )
}
