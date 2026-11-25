'use client'

import { usePathname } from 'next/navigation'
import { BetSlipPanel } from './betslip-panel'
import { hasOwnTicket } from './slip-routes'

export function SlipRail() {
  const pathname = usePathname()
  if (hasOwnTicket(pathname)) return null

  return (
    <div className="hidden w-80 shrink-0 xl:block">
      <div className="sticky top-[116px]">
        <BetSlipPanel />
      </div>
    </div>
  )
}
