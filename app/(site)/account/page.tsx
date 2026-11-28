import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowDownToLine, ArrowUpFromLine, Radio, ScanLine, ShieldCheck, Ticket } from 'lucide-react'
import { AccountActivity } from '@/components/account/account-activity'
import { BetHistory } from '@/components/account/bet-history'
import { FundsForm } from '@/components/account/funds-form'
import { LimitsForm } from '@/components/account/limits-form'
import { SignOutButton } from '@/components/account/sign-out-button'
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
  const fundsTab = tab === 'withdraw' ? 'withdraw' : 'deposit'

  const [wallet, bets, txs, limits] = await Promise.all([
    ensureWallet(userId),
    listBets(userId, 50),
    listTransactions(userId, 15),
    getLimitStatus(userId),
  ])

  const openBets = bets.filter((b) => b.status === 'open')
  const openReturn = openBets.reduce((sum, b) => sum + Number(b.potentialWin ?? 0), 0)
  const firstName = session.user.name?.split(' ')[0] ?? 'player'
  const limitUsed = limits.limit ? Math.min(100, Math.round((limits.staked / limits.limit) * 100)) : 0

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-5 rounded-xl bg-brand p-5 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold text-white/80">Hello, {firstName}</p>
          <p className="text-xs font-bold uppercase tracking-wide text-white/70">Your balance</p>
          <p className="text-4xl font-black">{formatMoney(wallet.balance)}</p>
          {Number(wallet.bonus) > 0 && (
            <p className="text-sm font-bold text-white/80">
              {'+ '}
              <span className="text-primary">{formatMoney(wallet.bonus)}</span> bonus
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/account?tab=deposit#funds"
            className="flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-extrabold text-primary-foreground"
          >
            <ArrowDownToLine className="size-4" aria-hidden />
            Deposit
          </Link>
          <Link
            href="/account?tab=withdraw#funds"
            className="flex h-11 items-center gap-2 rounded-lg bg-background/40 px-5 text-sm font-extrabold"
          >
            <ArrowUpFromLine className="size-4" aria-hidden />
            Withdraw
          </Link>
          <SignOutButton />
        </div>
      </header>

      <section aria-label="Summary" className="grid gap-3 md:grid-cols-2">
        <Link href="/my-bets" className="flex flex-col gap-1 rounded-xl bg-surface p-4">
          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Open bets</span>
          {openBets.length > 0 ? (
            <p className="text-pretty text-sm leading-relaxed">
              You have <strong className="text-lg font-black">{openBets.length}</strong>{' '}
              {openBets.length === 1 ? 'bet' : 'bets'} waiting for results. If they win, you get up to{' '}
              <strong className="font-black text-success">{formatMoney(openReturn)}</strong>.
            </p>
          ) : (
            <p className="text-sm leading-relaxed">No bets waiting for results right now.</p>
          )}
        </Link>
        <a href="#limits" className="flex flex-col gap-2 rounded-xl bg-surface p-4">
          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Spent today</span>
          <p className="text-sm leading-relaxed">
            <strong className="text-lg font-black">{formatMoney(limits.staked)}</strong>
            {limits.limit ? ` of your ${formatMoney(limits.limit)} daily limit` : ' · no daily limit set'}
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

      <nav aria-label="Shortcuts" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {QUICK_LINKS.map(({ href, label, hint, icon: Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-3 rounded-xl bg-surface p-4 hover:bg-surface/70">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand">
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-extrabold">{label}</span>
              <span className="truncate text-xs text-muted-foreground">{hint}</span>
            </span>
          </Link>
        ))}
      </nav>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
        <section id="funds" aria-labelledby="funds-title" className="flex scroll-mt-24 flex-col gap-2">
          <h2 id="funds-title" className="text-lg font-black">
            Add or take out money
          </h2>
          <FundsForm key={fundsTab} initial={fundsTab} />
        </section>

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
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
        <section id="limits" aria-label="Daily spending limit" className="flex scroll-mt-24 flex-col gap-2">
          <LimitsForm limit={limits.limit} staked={limits.staked} pending={limits.pending} />
        </section>

        <AccountActivity transactions={txs} />
      </div>
    </div>
  )
}
