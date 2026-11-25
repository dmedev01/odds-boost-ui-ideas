import Link from 'next/link'
import { Plus, UserRound } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { formatMoney } from '@/lib/format'
import { Logo } from './logo'
import { ProductNav } from './product-nav'

export function SiteHeader({ user, balance }: { user: { name: string } | null; balance: number | null }) {
  return (
    <header className="sticky top-0 z-40 shadow-lg shadow-black/20">
      <div className="bg-background">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-3 lg:px-4">
          <Logo />
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/account"
                  className="flex flex-col items-end rounded-lg px-2 py-1 leading-tight hover:bg-surface"
                  aria-label={`Wallet balance ${formatMoney(balance)}`}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Balance</span>
                  <span className="text-sm font-extrabold">{formatMoney(balance)}</span>
                </Link>
                <Link
                  href="/account?tab=deposit"
                  className={buttonVariants({ className: 'h-9 gap-1 px-3 font-extrabold' })}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Deposit</span>
                  <span className="sr-only sm:hidden">Deposit</span>
                </Link>
                <Link
                  href="/account"
                  className="flex size-9 items-center justify-center rounded-full bg-brand font-extrabold uppercase"
                  aria-label="My account"
                >
                  {user.name.trim().charAt(0) || <UserRound className="size-4" aria-hidden="true" />}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className={buttonVariants({ variant: 'outline', className: 'h-9 px-4 font-extrabold' })}
                >
                  Log in
                </Link>
                <Link href="/sign-up" className={buttonVariants({ className: 'h-9 px-4 font-extrabold' })}>
                  Join now
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="bg-brand">
        <ProductNav />
      </div>
    </header>
  )
}
