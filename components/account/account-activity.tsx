import { formatMoney } from '@/lib/format'
import type { TransactionRow } from '@/lib/wallet'
import { cn } from '@/lib/utils'

const KIND_LABEL: Record<string, string> = {
  deposit: 'Deposit',
  withdraw: 'Withdrawal',
  withdrawal: 'Withdrawal',
  bet: 'Bet placed',
  stake: 'Bet placed',
  win: 'Winnings',
  payout: 'Winnings',
  refund: 'Refund',
  welcome: 'Welcome credit',
  welcome_credit: 'Welcome credit',
  bonus: 'Bonus',
}

const METHOD_LABEL: Record<string, string> = {
  mtn: 'MTN MoMo',
  orange: 'Orange Money',
  card: 'Card',
}

function kindLabel(kind: string) {
  return KIND_LABEL[kind] ?? kind.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
}

export function AccountActivity({ transactions }: { transactions: TransactionRow[] }) {
  return (
    <section aria-labelledby="activity" className="flex flex-col gap-2">
      <h2 id="activity" className="text-lg font-black">
        Money in and out
      </h2>
      <ul className="overflow-hidden rounded-xl bg-surface">
        {transactions.length === 0 && (
          <li className="p-6 text-center text-sm text-muted-foreground">
            Nothing yet. Deposits, bets and winnings will show here.
          </li>
        )}
        {transactions.map((t) => {
          const amount = Number(t.amount)
          const incoming = amount >= 0
          const method = t.method ? (METHOD_LABEL[t.method] ?? t.method) : null
          return (
            <li key={t.id} className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-bold">{kindLabel(t.kind)}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {new Date(t.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                  {method ? ` · ${method}` : ''}
                </span>
              </div>
              <div className="flex shrink-0 flex-col items-end">
                <span className={cn('text-sm font-extrabold', incoming ? 'text-success' : 'text-foreground')}>
                  {incoming ? '+' : ''}
                  {formatMoney(amount)}
                </span>
                <span className="text-xs text-muted-foreground">Balance {formatMoney(t.balanceAfter)}</span>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
