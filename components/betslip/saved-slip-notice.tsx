'use client'

import { useBetSlip } from './betslip-provider'
import { useI18n } from '@/components/i18n/i18n-provider'

export function SavedSlipNotice() {
  const { keys, setMobileOpen } = useBetSlip()
  const { t } = useI18n()
  if (keys.length === 0) return null

  return (
    <div className="flex items-center gap-3 rounded-lg bg-black/20 px-3 py-2">
      <span
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground"
        aria-hidden="true"
      >
        {keys.length}
      </span>
      <p className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="text-xs font-extrabold">
          <span className="sr-only">{keys.length} </span>
          {t('slip.savedTitle')}
        </span>
        <span className="text-[11px] text-white/70">{t('slip.savedBody')}</span>
      </p>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="shrink-0 rounded-md px-2 py-1 text-xs font-extrabold text-primary underline-offset-2 hover:underline"
      >
        {t('slip.savedOpen')}
      </button>
    </div>
  )
}
