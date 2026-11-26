import type { Metadata } from 'next'
import { MatchList } from '@/components/sports/match-row'
import { Notice, PrimaryButton, StateSwitcher, pickState, type StatePageProps } from '@/components/v4/ui-states'
import { MATCHES } from '@/lib/data/sports'

export const metadata: Metadata = { title: 'Favourites' }

const STATES = [
  { id: 'list', label: 'Favourites', uc: 'SPT-008' },
  { id: 'empty', label: 'None yet', uc: 'SPT-008' },
  { id: 'logged-out', label: 'Logged out', uc: 'SPT-008' },
] as const

export default async function FavouritesPage({ searchParams }: StatePageProps) {
  const { state: requested } = await searchParams
  const state = pickState(STATES, requested).id

  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath="/favourites" />
      {state === 'list' && <MatchList title="Your favourite matches" matches={MATCHES.filter((_, i) => i % 9 === 0).slice(0, 5)} />}
      {state === 'empty' && (
        <Notice tone="info" title="No favourites yet" action={<PrimaryButton variant="secondary" href="/sports">Browse matches</PrimaryButton>}>
          Tap the star on any match to follow it here.
        </Notice>
      )}
      {state === 'logged-out' && (
        <Notice tone="info" title="Log in to keep favourites" action={<PrimaryButton href="/sign-in">Log in</PrimaryButton>}>
          Favourites are saved to your account so they follow you across devices.
        </Notice>
      )}
    </div>
  )
}
