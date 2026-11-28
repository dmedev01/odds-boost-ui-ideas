import type { Metadata } from 'next'
import Link from 'next/link'
import { GameLaunch } from '@/components/v4/game-launch'
import { StateSwitcher, pickState, type StatePageProps } from '@/components/v4/ui-states'

export const metadata: Metadata = { title: 'Crash games' }

const STATES = [
  { id: 'lobby', label: 'Featured', uc: 'GAM-010' },
  { id: 'loading', label: 'Loading', uc: 'GAM-001' },
  { id: 'real', label: 'Real money', uc: 'GAM-001' },
  { id: 'demo', label: 'Demo', uc: 'GAM-002' },
  { id: 'login-required', label: 'Login to play', uc: 'GAM-001' },
  { id: 'launch-failed', label: 'Launch failed', uc: 'GAM-007' },
] as const

const FEATURED = ['JetX', 'Spaceman', 'Aviator', 'Balloon', 'Plinko', 'Mines']

export default async function CrashPage({ searchParams }: StatePageProps) {
  const { state: requested } = await searchParams
  const state = pickState(STATES, requested).id
  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath="/games/crash" />
      <nav aria-label="Featured games" className="no-scrollbar flex gap-2 overflow-x-auto">
        {FEATURED.map((g, i) => (
          <Link key={g} href={g === 'Aviator' ? '/games/aviator' : '/games/crash'} className="flex h-20 w-28 shrink-0 items-end rounded-lg bg-brand p-2 text-sm font-black ring-1 ring-border hover:ring-primary" aria-current={i === 0 ? 'page' : undefined}>
            {g}
          </Link>
        ))}
      </nav>
      <GameLaunch name="JetX" provider="SmartSoft Gaming" state={state} basePath="/games/crash" />
    </div>
  )
}
