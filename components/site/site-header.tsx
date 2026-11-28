import Link from 'next/link'
import { Plus, ScanSearch, UserRound } from 'lucide-react'
import { LanguageToggle } from '@/components/i18n/i18n-provider'
import { DataSaverToggle } from '@/components/lite/lite-mode'
import { buttonVariants } from '@/components/ui/button'
import { formatMoney } from '@/lib/format'
import { getT } from '@/lib/i18n/server'
import { Logo } from './logo'
import { NotificationsBell } from './notifications-bell'
import { ProductNav } from './product-nav'

export async function SiteHeader({ user, balance }: { user: { name: string } | null; balance: number | null }) {
  const { t } = await getT()
  return (
    <header className="sticky top-0 z-40 shadow-lg shadow-black/20">
      <div className="bg-background">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-2 px-3 lg:px-4">
          <Logo />
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/ticket"
              className="hidden h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-bold text-muted-foreground hover:bg-surface hover:text-foreground md:flex"
            >
              <ScanSearch className="size-4" aria-hidden="true" />
              {t('nav.checkTicket')}
            </Link>
            <LanguageToggle />
            <DataSaverToggle />
            {user ? (
              <>
                <NotificationsBell />
                <Link
                  href="/account"
                  className="flex flex-col items-end rounded-lg px-2 py-1 leading-tight hover:bg-surface"
                  aria-label={`${t('header.balance')} ${formatMoney(balance)}`}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{t('header.balance')}</span>
                  <span className="text-sm font-extrabold">{formatMoney(balance)}</span>
                </Link>
                <Link
                  href="/wallet/deposit"
                  className={buttonVariants({ className: 'h-9 gap-1 px-3 font-extrabold' })}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{t('header.deposit')}</span>
                  <span className="sr-only sm:hidden">{t('header.deposit')}</span>
                </Link>
                <Link
                  href="/account"
                  className="flex size-9 items-center justify-center rounded-full bg-brand font-extrabold uppercase"
                  aria-label={t('header.account')}
                >
                  {user.name.trim().charAt(0) || <UserRound className="size-4" aria-hidden="true" />}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className={buttonVariants({ variant: 'outline', className: 'hidden h-9 px-2.5 font-extrabold min-[360px]:inline-flex sm:px-3' })}
                >
                  {t('header.login')}
                </Link>
                <Link href="/sign-up" className={buttonVariants({ className: 'h-9 px-2.5 font-extrabold sm:px-3' })}>
                  {t('header.join')}
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
