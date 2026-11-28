import type { Metadata } from 'next'
import { ArrowDown, ArrowUp, Copy, Lock, QrCode, Share2, X } from 'lucide-react'
import { DefinitionRows, Field, Notice, PrimaryButton, StateSwitcher, TextInput, pickState, type StatePageProps } from '@/components/v4/ui-states'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Betslip states' }

const STATES = [
  { id: 'multiple', label: 'Multiple + acca bonus', uc: 'BSL-002' },
  { id: 'singles', label: 'Singles', uc: 'BSL-003' },
  { id: 'system', label: 'System', uc: 'BSL-004' },
  { id: 'insufficient', label: 'Low balance', uc: 'BSL-005' },
  { id: 'suspended', label: 'Suspended pick', uc: 'BSL-006' },
  { id: 'odds-change', label: 'Odds changed', uc: 'BSL-007' },
  { id: 'logged-out', label: 'Logged out', uc: 'BSL-008' },
  { id: 'booking-code', label: 'Booking code', uc: 'BSL-009' },
  { id: 'load-code', label: 'Load code', uc: 'BSL-010' },
  { id: 'restored', label: 'Restored', uc: 'BSL-011' },
  { id: 'sport-bonus', label: 'Use bonus', uc: 'BSL-012' },
  { id: 'cash-out', label: 'Cash out', uc: 'BSL-015' },
  { id: 'repeat', label: 'Repeat bet', uc: 'BSL-016' },
  { id: 'goal-jackpot', label: 'Goal jackpot', uc: 'BSL-017' },
  { id: 'kiosk', label: 'Kiosk', uc: 'BSL-018' },
  { id: 'restriction', label: 'Restriction', uc: 'BSL-019' },
] as const

type Pick = { event: string; market: string; pick: string; odds: number; was?: number; locked?: boolean }

const PICKS: Pick[] = [
  { event: 'Man United vs Arsenal', market: '1X2', pick: 'Arsenal', odds: 2.35 },
  { event: 'Coton Sport vs Canon Yaoundé', market: 'Over/Under 2.5', pick: 'Over', odds: 1.85 },
  { event: 'Real Madrid vs Sevilla', market: '1X2', pick: 'Real Madrid', odds: 1.42 },
  { event: 'Lakers vs Celtics', market: 'Winner', pick: 'Celtics', odds: 1.95 },
]

export default async function BetslipStatesPage({ searchParams }: StatePageProps) {
  const { state: requested } = await searchParams
  const state = pickState(STATES, requested).id

  const picks: Pick[] = PICKS.map((p, i) => {
    if (state === 'suspended' && i === 1) return { ...p, locked: true }
    if (state === 'odds-change' && i === 0) return { ...p, was: 2.35, odds: 2.1 }
    if (state === 'odds-change' && i === 2) return { ...p, was: 1.42, odds: 1.5 }
    return p
  })
  const total = picks.filter((p) => !p.locked).reduce((a, p) => a * p.odds, 1)

  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath="/betslip/states" />
      <div className="mx-auto flex w-full max-w-md flex-col gap-3">
        {state === 'cash-out' || state === 'repeat' ? (
          <OpenBet state={state} />
        ) : state === 'load-code' ? (
          <Slip title="Betslip" count={0}>
            <Field label="Booking code" hint="Codes are valid for 7 days">
              <div className="flex gap-2">
                <TextInput defaultValue="BK7Q2M" className="flex-1 uppercase" />
                <PrimaryButton>Load</PrimaryButton>
              </div>
            </Field>
            <Notice tone="warning" title="1 of 4 selections could not be added">Lakers vs Celtics has already started. 3 selections were loaded.</Notice>
          </Slip>
        ) : state === 'goal-jackpot' ? (
          <GoalJackpot />
        ) : (
          <Slip title="Betslip" count={picks.length} mode={state === 'singles' ? 'Singles' : state === 'system' ? 'System' : 'Multiple'}>
            {state === 'restored' && <Notice tone="info" title="Your betslip was restored">4 selections kept from your last visit. Odds were refreshed.</Notice>}
            {state === 'restriction' && <Notice tone="warning" title="These selections cannot be combined">Man United vs Arsenal allows at most 3 selections in a multiple. Remove 1 or switch to singles.</Notice>}
            <ul className="flex flex-col gap-2">
              {picks.map((p) => (
                <li key={p.event} className={cn('flex items-start gap-3 rounded-lg bg-surface-2 p-3', p.locked && 'opacity-60')}>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-extrabold">{p.pick}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {p.market} · {p.event}
                    </span>
                    {p.locked && <span className="mt-1 flex items-center gap-1 text-xs font-bold text-destructive"><Lock className="size-3" aria-hidden /> Suspended</span>}
                  </div>
                  {state === 'singles' && <TextInput defaultValue="500" aria-label={`Stake for ${p.pick}`} className="h-9 w-20 text-right" />}
                  <span className="flex flex-col items-end">
                    {p.was && <span className="text-xs text-muted-foreground line-through tabular-nums">{p.was.toFixed(2)}</span>}
                    <span className={cn('flex items-center gap-0.5 font-black tabular-nums', p.was && (p.odds > p.was ? 'text-success' : 'text-destructive'))}>
                      {p.was && (p.odds > p.was ? <ArrowUp className="size-3" aria-label="Up" /> : <ArrowDown className="size-3" aria-label="Down" />)}
                      {p.odds.toFixed(2)}
                    </span>
                  </span>
                  <button type="button" aria-label={`Remove ${p.pick}`} className="text-muted-foreground hover:text-foreground">
                    <X className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>

            {state === 'system' && (
              <fieldset className="flex flex-wrap gap-2">
                <legend className="mb-2 text-sm font-bold">Combination</legend>
                {['2/4 · 6 bets', '3/4 · 4 bets', '2+3/4 · 10 bets'].map((c, i) => (
                  <span key={c} className={cn('rounded-full px-3 py-1.5 text-xs font-extrabold ring-1', i === 1 ? 'bg-brand ring-primary' : 'bg-surface-2 ring-border')}>{c}</span>
                ))}
              </fieldset>
            )}
            {state === 'sport-bonus' && (
              <label className="flex items-center justify-between gap-3 rounded-lg bg-brand p-3 text-sm font-bold">
                <span>Use 2,000 FCFA free bet<span className="block text-xs font-semibold text-foreground/70">Min 3 picks at 1.50+ · expires 30 Nov</span></span>
                <input type="checkbox" defaultChecked className="size-5 accent-primary" />
              </label>
            )}

            {state !== 'singles' && (
              <Field label={state === 'system' ? 'Stake per bet (FCFA)' : 'Stake (FCFA)'} error={state === 'insufficient' ? 'Your balance is 1,200 FCFA.' : undefined}>
                <TextInput defaultValue={state === 'insufficient' ? '5000' : state === 'sport-bonus' ? '2000' : '1000'} inputMode="numeric" invalid={state === 'insufficient'} readOnly={state === 'sport-bonus'} />
              </Field>
            )}
            <DefinitionRows
              rows={[
                ['Total odds', total.toFixed(2)],
                ...(state === 'multiple' ? ([['Acca bonus (4 picks)', '+5%']] as [string, string][]) : []),
                ['Potential win', `${Math.round(total * 1000 * (state === 'multiple' ? 1.05 : 1)).toLocaleString('en-US')} FCFA`],
              ]}
            />

            {state === 'insufficient' && <Notice tone="error" title="Not enough balance" action={<PrimaryButton href="/wallet/deposit">Deposit 3,800 FCFA</PrimaryButton>} />}
            {state === 'odds-change' && <Notice tone="warning" title="2 odds have changed">Accept the new odds to continue.</Notice>}
            {state === 'booking-code' && (
              <div className="flex flex-col items-center gap-2 rounded-lg bg-surface-2 p-4 text-center">
                <span className="text-xs font-bold text-muted-foreground">Booking code</span>
                <span className="font-mono text-3xl font-black tracking-widest">BK7Q2M</span>
                <div className="flex gap-2">
                  <PrimaryButton variant="secondary"><Copy className="size-4" aria-hidden /> Copy</PrimaryButton>
                  <PrimaryButton variant="secondary"><Share2 className="size-4" aria-hidden /> Share</PrimaryButton>
                </div>
              </div>
            )}
            {state === 'kiosk' && (
              <div className="flex flex-col items-center gap-2 rounded-lg bg-surface-2 p-4 text-center">
                <QrCode className="size-24" aria-hidden />
                <span className="font-mono text-2xl font-black tracking-widest">K-48213</span>
                <p className="text-xs leading-relaxed text-muted-foreground">Show this code at any kiosk or agent to pay and print your ticket. Odds are confirmed at payment.</p>
              </div>
            )}

            {state === 'logged-out' ? (
              <div className="flex gap-2">
                <PrimaryButton className="flex-1" href="/sign-in">Log in to bet</PrimaryButton>
                <PrimaryButton variant="secondary" href="/betslip/states?state=booking-code">Book</PrimaryButton>
              </div>
            ) : state === 'odds-change' ? (
              <PrimaryButton>Accept and place bet</PrimaryButton>
            ) : state === 'booking-code' || state === 'kiosk' ? null : (
              <PrimaryButton disabled={state === 'insufficient' || state === 'suspended' || state === 'restriction'}>
                {state === 'suspended' ? 'Remove suspended pick to bet' : 'Place bet'}
              </PrimaryButton>
            )}
          </Slip>
        )}
      </div>
    </div>
  )
}

function Slip({ title, count, mode, children }: { title: string; count: number; mode?: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-3 rounded-xl bg-surface p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-black">
          {title} <span className="text-muted-foreground">({count})</span>
        </h1>
        {mode && (
          <div className="flex gap-1 rounded-full bg-surface-2 p-1 text-xs font-extrabold">
            {['Singles', 'Multiple', 'System'].map((m) => (
              <span key={m} className={cn('rounded-full px-2.5 py-1', m === mode && 'bg-primary text-primary-foreground')}>{m}</span>
            ))}
          </div>
        )}
      </header>
      {children}
    </section>
  )
}

function OpenBet({ state }: { state: 'cash-out' | 'repeat' }) {
  return (
    <Slip title="Open bet #48213" count={3}>
      <DefinitionRows rows={[['Stake', '1,000 FCFA'], ['Potential win', '6,180 FCFA'], ['Status', '2 of 3 won, 1 in play']]} />
      {state === 'cash-out' ? (
        <>
          <div className="flex flex-col items-center gap-1 rounded-lg bg-brand p-4">
            <span className="text-xs font-bold text-foreground/70">Cash out now</span>
            <span className="text-3xl font-black tabular-nums">3,940 FCFA</span>
            <span className="text-xs text-foreground/70">Value updates with live odds</span>
          </div>
          <PrimaryButton>Cash out 3,940 FCFA</PrimaryButton>
          <Notice tone="warning" title="Cash out value changed to 3,720 FCFA">Confirm again to cash out at the new value.</Notice>
        </>
      ) : (
        <>
          <Notice tone="info" title="Copy these selections to a new slip?">Selections that have started or ended are skipped. Odds may differ.</Notice>
          <PrimaryButton>Repeat bet</PrimaryButton>
        </>
      )}
    </Slip>
  )
}

function GoalJackpot() {
  const games = ['Man United vs Arsenal', 'Chelsea vs Spurs', 'PSG vs Lyon', 'Inter vs Roma', 'Ajax vs PSV', 'Benfica vs Porto']
  return (
    <Slip title="Goal jackpot" count={6}>
      <p className="text-sm leading-relaxed text-muted-foreground">Predict the total goals in each match. Jackpot 5,000,000 FCFA. Closes Saturday 15:00.</p>
      <ul className="flex flex-col gap-2">
        {games.map((g, i) => (
          <li key={g} className="flex items-center justify-between gap-2 rounded-lg bg-surface-2 p-2.5 text-sm">
            <span className="truncate font-bold">{g}</span>
            <span className="flex gap-1">
              {['0', '1', '2', '3+'].map((n, j) => (
                <span key={n} className={cn('flex size-8 items-center justify-center rounded-md text-xs font-black ring-1', j === (i * 3) % 4 ? 'bg-primary text-primary-foreground ring-primary' : 'bg-surface ring-border')}>
                  {n}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
      <DefinitionRows rows={[['Ticket price', '200 FCFA']]} />
      <PrimaryButton>Buy ticket</PrimaryButton>
    </Slip>
  )
}
