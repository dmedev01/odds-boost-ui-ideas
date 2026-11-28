import type { Metadata } from 'next'
import { DefinitionRows, Notice, Panel, PrimaryButton, StateSwitcher, TextInput, pickState, type StatePageProps } from '@/components/v4/ui-states'

export const metadata: Metadata = { title: 'My bonuses' }

const STATES = [
  { id: 'active', label: 'Active bonuses', uc: 'BON-008' },
  { id: 'history', label: 'History', uc: 'BON-009' },
  { id: 'history-empty', label: 'No history', uc: 'BON-009' },
  { id: 'none', label: 'No bonus', uc: 'BON-008' },
] as const

const MOVES: [string, string, string][] = [
  ['25 Nov', 'Free bet used on multiple #48213', '-2,000'],
  ['22 Nov', 'Welcome bonus credited', '+5,000'],
  ['20 Nov', 'Wagering progress', '+12,000 wagered'],
  ['18 Nov', 'Free spins expired (3 unused)', '-300'],
]

export default async function BonusesPage({ searchParams }: StatePageProps) {
  const { state: requested } = await searchParams
  const state = pickState(STATES, requested).id

  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath="/account/bonuses" />
      {state === 'active' && (
        <>
          <Panel title="Welcome bonus" description="5,000 FCFA">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-bold"><span>Wagering</span><span className="tabular-nums">12,000 / 25,000 FCFA</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={48} aria-valuemin={0} aria-valuemax={100} aria-label="Wagering progress">
                <div className="h-full w-[48%] bg-primary" />
              </div>
            </div>
            <DefinitionRows rows={[['Min odds per pick', '1.50'], ['Min picks', '3'], ['Expires', '30 Nov 2026']]} />
          </Panel>
          <Panel title="Free bet" description="2,000 FCFA">
            <DefinitionRows rows={[['Use on', 'Multiples, 3+ picks'], ['Expires', '30 Nov 2026']]} />
            <PrimaryButton href="/betslip/states?state=sport-bonus">Use now</PrimaryButton>
          </Panel>
        </>
      )}
      {state.startsWith('history') && (
        <Panel title="Bonus history">
          <div className="flex flex-wrap gap-2">
            <TextInput type="date" defaultValue="2026-11-01" aria-label="From" className="h-9" />
            <TextInput type="date" defaultValue="2026-11-26" aria-label="To" className="h-9" />
            <PrimaryButton variant="secondary">Apply</PrimaryButton>
          </div>
          {state === 'history' ? (
            <ul className="flex flex-col divide-y divide-border">
              {MOVES.map(([d, label, amount]) => (
                <li key={label} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="flex flex-col"><span className="font-bold">{label}</span><span className="text-xs text-muted-foreground">{d}</span></span>
                  <span className="font-black tabular-nums">{amount}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Notice tone="info" title="No bonus activity in this period" />
          )}
        </Panel>
      )}
      {state === 'none' && (
        <Notice tone="info" title="You have no active bonus" action={<PrimaryButton variant="secondary" href="/promotions">See promotions</PrimaryButton>} />
      )}
    </div>
  )
}
