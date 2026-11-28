import type { Metadata } from 'next'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { WalletTabs } from '@/components/v4/wallet-tabs'
import { Notice, Panel, PrimaryButton, StateSwitcher, TextInput, pickState, type StatePageProps } from '@/components/v4/ui-states'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Wallet history' }

const STATES = [
  { id: 'transactions', label: 'Transactions', uc: 'PAY-011' },
  { id: 'transactions-empty', label: 'No results', uc: 'PAY-011' },
  { id: 'statement', label: 'Statement', uc: 'PAY-012' },
  { id: 'balance-push', label: 'Balance pushed', uc: 'PAY-013' },
] as const

const TX = [
  { ref: 'DP-88412', type: 'Deposit', method: 'MTN MoMo', amount: 5000, status: 'Completed', at: '26 Nov, 14:38' },
  { ref: 'WD-20931', type: 'Withdrawal', method: 'MTN MoMo', amount: -5000, status: 'Pending', at: '26 Nov, 12:10' },
  { ref: 'DP-88107', type: 'Deposit', method: 'Paytus', amount: 10000, status: 'Failed', at: '25 Nov, 19:02' },
  { ref: 'WD-20788', type: 'Withdrawal', method: 'Bank transfer', amount: -20000, status: 'Completed', at: '23 Nov, 09:44' },
]

const STATEMENT = [
  { at: '26 Nov, 14:38', label: 'Deposit DP-88412', amount: 5000, balance: 12450 },
  { at: '26 Nov, 13:05', label: 'Bet won · ticket 7G2KQ', amount: 8320, balance: 7450 },
  { at: '26 Nov, 12:10', label: 'Withdrawal WD-20931', amount: -5000, balance: -870 },
  { at: '26 Nov, 11:47', label: 'Bet placed · ticket 7G2KQ', amount: -2000, balance: 4130 },
]

const STATUS_CLS: Record<string, string> = {
  Completed: 'bg-success/15 text-success',
  Pending: 'bg-primary/15 text-primary',
  Failed: 'bg-destructive/15 text-destructive',
}

export default async function HistoryPage({ searchParams }: StatePageProps) {
  const { state: requested } = await searchParams
  const state = pickState(STATES, requested).id
  const statement = state === 'statement'

  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath="/wallet/history" />
      <WalletTabs current="history" />
      {state === 'balance-push' && (
        <Notice tone="success" title="Balance updated: 12,450 → 20,770 FCFA">
          Ticket 7G2KQ settled as won. The header balance updated without a reload.
        </Notice>
      )}
      <Panel title={statement ? 'Wallet statement' : 'Transactions'}>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex gap-1 rounded-lg bg-surface-2 p-1">
            {['Transactions', 'Statement'].map((t) => (
              <PrimaryButton
                key={t}
                variant={(t === 'Statement') === statement ? 'primary' : 'ghost'}
                href={t === 'Statement' ? '/wallet/history?state=statement' : '/wallet/history'}
                className="h-9"
              >
                {t}
              </PrimaryButton>
            ))}
          </div>
          <TextInput type="date" defaultValue="2026-11-01" aria-label="From" className="h-9" />
          <TextInput type="date" defaultValue="2026-11-26" aria-label="To" className="h-9" />
          {!statement && (
            <select aria-label="Type" className="h-9 rounded-lg bg-surface-2 px-3 text-sm font-semibold ring-1 ring-border">
              <option>All types</option>
              <option>Deposits</option>
              <option>Withdrawals</option>
            </select>
          )}
        </div>

        {state === 'transactions-empty' ? (
          <Notice tone="info" title="No transactions in this period">Try a wider date range.</Notice>
        ) : statement ? (
          <ul className="flex flex-col divide-y divide-border">
            {STATEMENT.map((s) => (
              <li key={s.label} className="flex items-center gap-3 py-3 text-sm">
                <span className="w-28 shrink-0 text-xs font-semibold text-muted-foreground">{s.at}</span>
                <span className="min-w-0 flex-1 truncate font-bold">{s.label}</span>
                <span className={cn('font-extrabold tabular-nums', s.amount > 0 ? 'text-success' : 'text-foreground')}>
                  {s.amount > 0 ? '+' : ''}
                  {s.amount.toLocaleString('en-US')}
                </span>
                <span className="hidden w-24 text-right font-mono text-xs text-muted-foreground sm:block">
                  {s.balance.toLocaleString('en-US')}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {TX.map((t) => {
              const Icon = t.amount > 0 ? ArrowDownLeft : ArrowUpRight
              return (
                <li key={t.ref} className="flex items-center gap-3 py-3 text-sm">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-2">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="font-extrabold">
                      {t.type} · {t.method}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {t.at} · {t.ref}
                    </span>
                  </div>
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-extrabold', STATUS_CLS[t.status])}>{t.status}</span>
                  <span className="w-20 text-right font-extrabold tabular-nums">{t.amount.toLocaleString('en-US')}</span>
                </li>
              )
            })}
          </ul>
        )}
      </Panel>
    </div>
  )
}
