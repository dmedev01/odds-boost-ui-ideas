import { Suspense } from 'react'
import { BetSlipPanel } from '@/components/betslip/betslip-panel'
import { BetSlipProvider } from '@/components/betslip/betslip-provider'
import { MobileNav } from '@/components/site/mobile-nav'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import { SportsSidebar } from '@/components/site/sports-sidebar'
import { getSession } from '@/lib/session'
import { ensureWallet } from '@/lib/wallet'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  const wallet = session?.user ? await ensureWallet(session.user.id) : null

  return (
    <BetSlipProvider isAuthed={Boolean(session?.user)}>
      <Suspense>
        <SiteHeader
          user={session?.user ? { name: session.user.name } : null}
          balance={wallet ? Number(wallet.balance) : null}
        />
      </Suspense>
      <div className="mx-auto flex max-w-[1440px] gap-4 px-3 py-4 lg:px-4">
        <SportsSidebar className="hidden w-56 shrink-0 lg:flex" />
        <main className="min-w-0 flex-1">{children}</main>
        <div className="hidden w-80 shrink-0 xl:block">
          <div className="sticky top-[116px]">
            <BetSlipPanel />
          </div>
        </div>
      </div>
      <SiteFooter />
      <Suspense>
        <MobileNav />
      </Suspense>
    </BetSlipProvider>
  )
}
