import type { Metadata } from 'next'
import { DefinitionRows, Field, Notice, Panel, PrimaryButton, StateSwitcher, TextInput, pickState, type StatePageProps } from '@/components/v4/ui-states'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Responsible gaming' }

const STATES = [
  { id: 'limits', label: 'Limits', uc: 'ACC-009' },
  { id: 'limit-pending', label: 'Increase pending', uc: 'ACC-009' },
  { id: 'self-exclude', label: 'Self-exclude', uc: 'ACC-010' },
  { id: 'self-exclude-confirm', label: 'Confirm exclusion', uc: 'ACC-010' },
  { id: 'recover', label: 'Recover', uc: 'ACC-011' },
  { id: 'recover-locked', label: 'Still locked', uc: 'ACC-011' },
] as const

const PERIODS = ['24 hours', '7 days', '30 days', '6 months', 'Permanent']

export default async function ResponsibleGamingPage({ searchParams }: StatePageProps) {
  const { state: requested } = await searchParams
  const state = pickState(STATES, requested).id

  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath="/account/responsible-gaming" />
      {state.startsWith('limits') || state === 'limit-pending' ? (
        <Panel title="Gambling limits" description="Lowering a limit is instant. Raising it takes effect after 24 hours.">
          {state === 'limit-pending' && (
            <Notice tone="info" title="Increase scheduled">Your daily deposit limit goes from 10,000 to 25,000 FCFA on 27 Nov at 14:38.</Notice>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Daily deposit', '10,000'],
              ['Weekly deposit', '50,000'],
              ['Daily stake', '20,000'],
            ].map(([label, value]) => (
              <Field key={label} label={`${label} (FCFA)`}>
                <TextInput defaultValue={value} inputMode="numeric" />
              </Field>
            ))}
          </div>
          <PrimaryButton>Save limits</PrimaryButton>
        </Panel>
      ) : state.startsWith('self-exclude') ? (
        <Panel title="Take a break" description="You will be logged out and unable to log in, deposit or bet for the chosen period.">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-bold">Period</legend>
            <div className="flex flex-wrap gap-2">
              {PERIODS.map((p) => (
                <span key={p} className={cn('rounded-full px-3 py-1.5 text-xs font-extrabold ring-1', p === '30 days' ? 'bg-brand ring-primary' : 'bg-surface-2 ring-border')}>
                  {p}
                </span>
              ))}
            </div>
          </fieldset>
          {state === 'self-exclude-confirm' ? (
            <Notice
              tone="warning"
              title="Exclude yourself for 30 days?"
              action={
                <>
                  <PrimaryButton>Yes, exclude me</PrimaryButton>
                  <PrimaryButton variant="secondary">Cancel</PrimaryButton>
                </>
              }
            >
              This cannot be undone before 26 Dec 2026. Open bets still settle and winnings are paid.
            </Notice>
          ) : (
            <PrimaryButton>Continue</PrimaryButton>
          )}
        </Panel>
      ) : (
        <Panel title="End your break" description="Available once your exclusion period is over.">
          <DefinitionRows
            rows={[
              ['Excluded since', '26 Oct 2026'],
              ['Period', '30 days'],
              ['Ends', state === 'recover' ? '25 Nov 2026 (ended)' : '26 Dec 2026'],
            ]}
          />
          {state === 'recover' ? (
            <PrimaryButton>Reactivate my account</PrimaryButton>
          ) : (
            <Notice tone="info" title="Your break is still active">You can reactivate from 26 Dec 2026. Need help? Call 8080 (free).</Notice>
          )}
        </Panel>
      )}
    </div>
  )
}
