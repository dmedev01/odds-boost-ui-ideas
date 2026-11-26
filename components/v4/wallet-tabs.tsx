import Link from 'next/link'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'deposit', label: 'Deposit', href: '/wallet/deposit' },
  { id: 'withdraw', label: 'Withdraw', href: '/wallet/withdraw' },
  { id: 'accounts', label: 'Payment accounts', href: '/wallet/accounts' },
  { id: 'history', label: 'History', href: '/wallet/history' },
] as const

export function WalletTabs({ current }: { current: (typeof TABS)[number]['id'] }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-brand p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col">
        <span className="text-xs font-bold uppercase tracking-widest text-foreground/70">Main balance</span>
        <span className="text-2xl font-black">12,450 FCFA</span>
        <span className="text-xs font-semibold text-foreground/70">Withdrawable 9,800 · Bonus 2,000 (not withdrawable)</span>
      </div>
      <nav aria-label="Wallet" className="no-scrollbar flex gap-1 overflow-x-auto rounded-lg bg-background/30 p-1">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={t.href}
            aria-current={t.id === current ? 'page' : undefined}
            className={cn(
              'flex h-9 shrink-0 items-center rounded-md px-3 text-sm font-extrabold',
              t.id === current ? 'bg-primary text-primary-foreground' : 'text-foreground/80 hover:text-foreground',
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
