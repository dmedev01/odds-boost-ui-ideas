import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BetHistory } from '@/components/account/bet-history'
import { FundsForm } from '@/components/account/funds-form'
import { LimitsForm } from '@/components/account/limits-form'
import { SignOutButton } from '@/components/account/sign-out-button'
import { formatMoney } from '@/lib/format'
import { getSession } from '@/lib/session'
import { ensureWallet, getLimitStatus, listBets, listTransactions } from '@/lib/wallet'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'My account' }

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await getSession()
  if (!session?.user) redirect('/sign-in')
  const userId = session.user.id
  const { tab } = await searchParams

  const [wallet, bets, txs, limits] = await Promise.all([
    ensureWallet(userId),
    listBets(userId, 5),
    listTransactions(userId, 15),
    getLimitStatus(userId),
  ])

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-4 rounded-xl bg-brand p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold text-white/70">Hello, {session.user.name}</p>
          <p className="text-3xl font-black">{formatMoney(wallet.balance)}</p>
          <p className="text-xs font-bold text-primary">Bonus {formatMoney(wallet.bonus)}</p>
        </div>
        <SignOutButton />
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div className="flex flex-col gap-4">
          <FundsForm initial={tab === 'withdraw' ? 'withdraw' : 'deposit'} />
          <LimitsForm limit={limits.limit} staked={limits.staked} pending={limits.pending} />
        </div>

        <section aria-labelledby="tx" className="flex flex-col gap-2">
          <h2 id="tx" className="text-lg font-black">
            Transactions
          </h2>
          <ul className="overflow-hidden rounded-xl bg-surface">
            {txs.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">No transactions yet.</li>}
            {txs.map((t) => {
              const amount = Number(t.amount)
              return (
                <li key={t.id} className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 last:border-0">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-bold capitalize">{t.kind.replace('_', ' ')}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {t.method ?? '—'} · {new Date(t.createdAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <span className={cn('text-sm font-extrabold', amount >= 0 ? 'text-success' : 'text-white')}>
                      {amount >= 0 ? '+' : ''}
                      {formatMoney(amount)}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{formatMoney(t.balanceAfter)}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <section aria-labelledby="recent" className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 id="recent" className="text-lg font-black">
            Recent bets
          </h2>
          <Link href="/my-bets" className="text-sm font-bold text-primary">
            See all
          </Link>
        </div>
        <BetHistory bets={bets} />
      </section>
    </div>
  )
}
