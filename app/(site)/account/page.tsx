import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Radio, ScanLine, ShieldCheck, Ticket } from 'lucide-react'
import { AccountActivity } from '@/components/account/account-activity'
import { BetHistory } from '@/components/account/bet-history'
import { LimitsForm } from '@/components/account/limits-form'
import { SignOutButton } from '@/components/account/sign-out-button'
import { WalletTabs } from '@/components/v4/wallet-tabs'
import { formatMoney } from '@/lib/format'
import { getSession } from '@/lib/session'
import { ensureWallet, getLimitStatus, listBets, listTransactions } from '@/lib/wallet'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'My account' }

const QUICK_LINKS = [
  { href: '/my-bets', label: 'My bets', hint: 'All your tickets', icon: Ticket },
  { href: '/ticket', label: 'Check a ticket', hint: 'Look up any reference', icon: ScanLine },
  { href: '/live', label: 'Live now', hint: 'Bet on matches in play', icon: Radio },
  { href: '#limits', label: 'Daily limit', hint: 'Control your spending', icon: ShieldCheck },
]

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await getSession()
  if (!session?.user) redirect('/sign-in')
  const userId = session.user.id
  const { tab } = await searchParams
  if (tab === 'deposit' || tab === 'withdraw') redirect(`/wallet/${tab}`)

  const [, bets, txs, limits] = await Promise.all([
    ensureWallet(userId),
    listBets(userId, 50),
    listTransactions(userId, 15),
    getLimitStatus(userId),
  ])

  const openBets = bets.filter((b) => b.status === 'open')
  const openReturn = openBets.reduce((sum, b) => sum + Number(b.potentialWin ?? 0), 0)
  const limitUsed = limits.limit ? Math.min(100, Math.round((limits.staked / limits.limit) * 100)) : 0

  return (
    <div className="flex flex-col gap-4">
      <WalletTabs greeting />

      <section aria-label="Summary" className="grid grid-cols-2 gap-3">
        <Link href="/my-bets" className="flex flex-col gap-1 rounded-xl bg-surface p-4">
          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Open bets</span>
          <strong className="text-2xl font-black">{openBets.length}</strong>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            {openBets.length > 0 ? (
              <>
                Can win up to <span className="font-extrabold text-success">{formatMoney(openReturn)}</span>
              </>
            ) : (
              'Waiting for results'
            )}
          </p>
        </Link>
        <a href="#limits" className="flex flex-col gap-1 rounded-xl bg-surface p-4">
          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Spent today</span>
          <strong className="text-2xl font-black">{formatMoney(limits.staked)}</strong>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            {limits.limit ? `of your ${formatMoney(limits.limit)} limit` : 'No daily limit set'}
          </p>
          {limits.limit ? (
            <div
              className="h-2 overflow-hidden rounded-full bg-background"
              role="progressbar"
              aria-label="Daily limit used"
              aria-valuenow={limitUsed}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={cn('h-full rounded-full', limitUsed >= 90 ? 'bg-destructive' : 'bg-primary')}
                style={{ width: `${limitUsed}%` }}
              />
            </div>
          ) : null}
        </a>
      </section>

      <nav aria-label="Shortcuts" className="grid grid-cols-4 gap-2 md:gap-3">
        {QUICK_LINKS.map(({ href, label, hint, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-xl bg-surface px-1 py-3 text-center hover:bg-surface/70 md:flex-row md:gap-3 md:p-4 md:text-left"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand">
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-xs font-extrabold leading-tight md:truncate md:text-sm">{label}</span>
              <span className="hidden truncate text-xs text-muted-foreground lg:block">{hint}</span>
            </span>
          </Link>
        ))}
      </nav>

      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="recent" className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 id="recent" className="text-lg font-black">
              Recent bets
            </h2>
            <Link href="/my-bets" className="text-sm font-bold text-primary">
              See all
            </Link>
          </div>
          <BetHistory bets={bets.slice(0, 4)} />
        </section>

        <AccountActivity transactions={txs} />
      </div>

      <section id="limits" aria-label="Daily spending limit" className="flex scroll-mt-24 flex-col gap-2 lg:max-w-md">
        <LimitsForm limit={limits.limit} staked={limits.staked} pending={limits.pending} />
      </section>

      <div className="flex justify-center border-t border-border pt-4">
        <SignOutButton />
      </div>
    </div>
  )
}
