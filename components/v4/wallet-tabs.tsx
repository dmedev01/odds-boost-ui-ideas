import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowDownToLine, ArrowUpFromLine, CreditCard, History } from 'lucide-react'
import { formatMoney } from '@/lib/format'
import { getSession } from '@/lib/session'
import { ensureWallet } from '@/lib/wallet'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'deposit', label: 'Deposit', href: '/wallet/deposit', icon: ArrowDownToLine },
  { id: 'withdraw', label: 'Withdraw', href: '/wallet/withdraw', icon: ArrowUpFromLine },
  { id: 'accounts', label: 'Saved accounts', href: '/wallet/accounts', icon: CreditCard },
  { id: 'history', label: 'History', href: '/wallet/history', icon: History },
] as const

type TabId = (typeof TABS)[number]['id']

export async function WalletTabs({ current, greeting = false }: { current?: TabId; greeting?: boolean }) {
  const session = await getSession()
  if (!session?.user) redirect('/sign-in')
  const wallet = await ensureWallet(session.user.id)
  const bonus = Number(wallet.bonus)
  const firstName = session.user.name?.split(' ')[0] ?? 'player'

  return (
    <header className="flex flex-col gap-4 rounded-xl bg-brand p-4 md:p-5">
      <div className="flex flex-col gap-1">
        {greeting ? (
          <p className="text-sm font-bold text-foreground/80">Hello, {firstName}</p>
        ) : (
          <Link href="/account" className="text-sm font-bold text-foreground/80 hover:text-foreground">
            {'← My account'}
          </Link>
        )}
        <p className="text-xs font-bold uppercase tracking-wide text-foreground/70">Your balance</p>
        <p className="text-3xl font-black md:text-4xl">{formatMoney(wallet.balance)}</p>
        <p className="text-pretty text-sm font-semibold leading-relaxed text-foreground/80">
          {bonus > 0
            ? `You can withdraw ${formatMoney(wallet.balance)}. Bonus ${formatMoney(bonus)} is for betting only.`
            : `All of it can be withdrawn.`}
        </p>
      </div>
      <nav aria-label="Wallet" className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {TABS.map(({ id, label, href, icon: Icon }) => {
          const active = id === current
          const prominent = current ? active : id === 'deposit'
          return (
            <Link
              key={id}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-12 items-center justify-center gap-2 rounded-lg px-3 text-sm font-extrabold md:text-base',
                prominent ? 'bg-primary text-primary-foreground' : 'bg-background/40 text-foreground hover:bg-background/60',
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span className="truncate">{label}</span>
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
