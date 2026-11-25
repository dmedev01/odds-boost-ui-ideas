'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { BetSlipPanel } from '@/components/betslip/betslip-panel'
import { useBetSlip } from '@/components/betslip/betslip-provider'
import { hasOwnTicket } from '@/components/betslip/slip-routes'
import { useI18n } from '@/components/i18n/i18n-provider'
import { cn } from '@/lib/utils'
import { isActive, MOBILE_NAV } from './nav-items'

export function MobileNav() {
  const pathname = usePathname()
  const search = useSearchParams().toString()
  const { keys, mobileOpen, setMobileOpen } = useBetSlip()
  const { t } = useI18n()
  const ownTicket = hasOwnTicket(pathname)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname, setMobileOpen])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [mobileOpen, setMobileOpen])

  return (
    <>
      {keys.length > 0 && !mobileOpen && !ownTicket && (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="fixed inset-x-3 bottom-[72px] z-40 flex h-12 items-center justify-between rounded-xl bg-primary px-4 font-extrabold shadow-xl shadow-black/40 xl:hidden"
        >
          <span className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-white text-sm text-primary">
              {keys.length}
            </span>
            {t('slip.open')}
          </span>
          <span className="text-sm">{t('slip.placeShort')}</span>
        </button>
      )}

      {mobileOpen && (
        <div
          className={cn(
            'fixed inset-0 z-50 flex flex-col justify-end xl:flex-row',
            !ownTicket && 'xl:hidden',
          )}
          role="dialog"
          aria-modal="true"
          aria-label={t('slip.title')}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label={t('slip.close')}
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative max-h-[90dvh] overflow-y-auto rounded-t-2xl bg-surface xl:h-full xl:max-h-none xl:w-96 xl:rounded-none">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-2.5 z-10 rounded-full bg-black/20 p-1.5"
              aria-label={t('slip.close')}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
            <BetSlipPanel className="rounded-b-none" headerClassName="pr-14" />
          </div>
        </div>
      )}

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {MOBILE_NAV.map((item) => {
            const active = isActive(item, pathname, search)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-bold',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  <Icon className="size-5" />
                  {t(item.labelKey)}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
