import type { Metadata } from 'next'
import { Copy, MessageCircle, Share2 } from 'lucide-react'
import { DefinitionRows, Notice, Panel, PrimaryButton, StateSwitcher, pickState, type StatePageProps } from '@/components/v4/ui-states'

export const metadata: Metadata = { title: 'Refer & earn' }

const STATES = [
  { id: 'overview', label: 'Overview', uc: 'BON-012' },
  { id: 'share', label: 'Share', uc: 'ENG-009' },
  { id: 'copied', label: 'Link copied', uc: 'ENG-009' },
  { id: 'logged-out', label: 'Logged out', uc: 'BON-012' },
] as const

export default async function ReferPage({ searchParams }: StatePageProps) {
  const { state: requested } = await searchParams
  const state = pickState(STATES, requested).id

  if (state === 'logged-out') {
    return (
      <div className="flex flex-col gap-4">
        <StateSwitcher states={STATES} current={state} basePath="/refer" />
        <Notice tone="info" title="Earn 1,000 FCFA for every friend who joins" action={<><PrimaryButton href="/sign-in">Log in</PrimaryButton><PrimaryButton variant="secondary" href="/signup/quick">Sign up</PrimaryButton></>}>
          Log in to get your personal referral link.
        </Notice>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath="/refer" />
      <Panel title="Refer & earn" description="Your friend gets 500 FCFA, you get 1,000 FCFA after their first bet of 1,000 FCFA or more.">
        <div className="flex items-center gap-2 rounded-lg bg-surface-2 p-3">
          <span className="min-w-0 flex-1 truncate font-mono text-sm font-bold">bet.cm/r/JEAN77</span>
          <PrimaryButton variant="secondary"><Copy className="size-4" aria-hidden /> Copy</PrimaryButton>
        </div>
        {state === 'copied' && <Notice tone="success" title="Link copied" />}
        {state === 'share' ? (
          <div className="grid grid-cols-3 gap-2">
            {[['WhatsApp', MessageCircle], ['SMS', MessageCircle], ['More', Share2]].map(([label, Icon]) => {
              const I = Icon as typeof Share2
              return (
                <button key={label as string} type="button" className="flex flex-col items-center gap-1 rounded-lg bg-surface-2 p-3 text-xs font-extrabold ring-1 ring-border hover:ring-primary">
                  <I className="size-5" aria-hidden /> {label as string}
                </button>
              )
            })}
          </div>
        ) : (
          <PrimaryButton href="/refer?state=share"><Share2 className="size-4" aria-hidden /> Share my link</PrimaryButton>
        )}
      </Panel>
      <Panel title="Your referrals">
        <DefinitionRows rows={[['Friends joined', '4'], ['Qualified', '2'], ['Earned', '2,000 FCFA']]} />
      </Panel>
    </div>
  )
}
