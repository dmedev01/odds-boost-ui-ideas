import type { Metadata } from 'next'
import { GameLaunch } from '@/components/v4/game-launch'
import { StateSwitcher, pickState, type StatePageProps } from '@/components/v4/ui-states'

export const metadata: Metadata = { title: 'Aviator' }

const STATES = [
  { id: 'lobby', label: 'Entry', uc: 'GAM-003' },
  { id: 'real', label: 'Real play', uc: 'GAM-003' },
  { id: 'demo', label: 'Demo', uc: 'GAM-004' },
  { id: 'login-required', label: 'Login to play', uc: 'GAM-003' },
  { id: 'geo-blocked', label: 'Not available', uc: 'GAM-012' },
] as const

export default async function AviatorPage({ searchParams }: StatePageProps) {
  const { state: requested } = await searchParams
  const state = pickState(STATES, requested).id
  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath="/games/aviator" />
      <GameLaunch name="Aviator" provider="Spribe" state={state} basePath="/games/aviator" />
    </div>
  )
}
