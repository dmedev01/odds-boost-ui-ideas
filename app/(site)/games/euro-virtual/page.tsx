import type { Metadata } from 'next'
import Link from 'next/link'
import { GameLaunch } from '@/components/v4/game-launch'
import { StateSwitcher, pickState, type StatePageProps } from '@/components/v4/ui-states'

export const metadata: Metadata = { title: 'Euro Virtual' }

const STATES = [
  { id: 'browse', label: 'Browse', uc: 'GAM-005' },
  { id: 'loading', label: 'Loading', uc: 'GAM-006' },
  { id: 'real', label: 'Playing', uc: 'GAM-006' },
  { id: 'login-required', label: 'Login redirect', uc: 'GAM-006' },
  { id: 'launch-failed', label: 'Launch failed', uc: 'GAM-007' },
] as const

const LEAGUES = [
  ['Virtual Premier', 'Next round 0:42'],
  ['Virtual Liga', 'Next round 1:58'],
  ['Virtual Nations Cup', 'Next round 3:10'],
  ['Virtual Champions', 'Next round 4:25'],
]

export default async function EuroVirtualPage({ searchParams }: StatePageProps) {
  const { state: requested } = await searchParams
  const state = pickState(STATES, requested).id
  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath="/games/euro-virtual" />
      {state === 'browse' ? (
        <section className="flex flex-col gap-3">
          <h1 className="text-2xl font-black">Euro Virtual</h1>
          <ul className="grid gap-3 sm:grid-cols-2">
            {LEAGUES.map(([name, next]) => (
              <li key={name}>
                <Link href="/games/euro-virtual?state=real" className="flex flex-col gap-1 rounded-xl bg-surface p-4 ring-1 ring-border hover:ring-primary">
                  <span className="font-black">{name}</span>
                  <span className="text-xs font-bold text-primary tabular-nums">{next}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <GameLaunch name="Virtual Premier" provider="Euro Virtual" state={state} basePath="/games/euro-virtual" />
      )}
    </div>
  )
}
