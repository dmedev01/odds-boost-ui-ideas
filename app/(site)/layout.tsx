import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { SlipRail } from '@/components/betslip/slip-rail'
import { BetSlipProvider } from '@/components/betslip/betslip-provider'
import { LITE_COOKIE, LiteModeProvider } from '@/components/lite/lite-mode'
import { LiveClockProvider } from '@/components/live/live-clock'
import { MobileNav } from '@/components/site/mobile-nav'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import { SportsSidebar } from '@/components/site/sports-sidebar'
import { I18nProvider } from '@/components/i18n/i18n-provider'
import { currentBucket } from '@/lib/data/live'
import { getLocale } from '@/lib/i18n/server'
import { getSession } from '@/lib/session'
import { ensureWallet, getLimitStatus } from '@/lib/wallet'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  const userId = session?.user?.id
  const [wallet, limitStatus, cookieStore, locale] = await Promise.all([
    userId ? ensureWallet(userId) : null,
    userId ? getLimitStatus(userId) : null,
    cookies(),
    getLocale(),
  ])
  const lite = cookieStore.get(LITE_COOKIE)?.value === '1'

  return (
    <I18nProvider locale={locale}>
    <LiteModeProvider initialLite={lite}>
      <LiveClockProvider initialBucket={currentBucket()}>
        <BetSlipProvider
          isAuthed={Boolean(userId)}
          balance={wallet ? Number(wallet.balance) : null}
          limitStatus={limitStatus ? { limit: limitStatus.limit, staked: limitStatus.staked } : null}
        >
          <Suspense>
            <SiteHeader
              user={session?.user ? { name: session.user.name } : null}
              balance={wallet ? Number(wallet.balance) : null}
            />
          </Suspense>
          <div className="mx-auto flex max-w-[1440px] gap-4 px-3 py-4 lg:px-4">
            <SportsSidebar className="hidden w-56 shrink-0 lg:flex" />
            <main className="min-w-0 flex-1">{children}</main>
            <SlipRail />
          </div>
          <SiteFooter />
          <Suspense>
            <MobileNav />
          </Suspense>
        </BetSlipProvider>
      </LiveClockProvider>
    </LiteModeProvider>
    </I18nProvider>
  )
}
