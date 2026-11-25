'use client'

import { useState, useTransition } from 'react'
import { Check, Copy, MessageCircle, Share2 } from 'lucide-react'
import { createBookingCode } from '@/app/actions/booking'
import { useI18n } from '@/components/i18n/i18n-provider'
import { formatOdds } from '@/lib/format'
import { cn } from '@/lib/utils'

export function SlipShare({ keys, totalOdds, className }: { keys: string[]; totalOdds: number; className?: string }) {
  const { t } = useI18n()
  const slipId = keys.join('|')
  const [issued, setIssued] = useState<{ slipId: string; code: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [pending, startTransition] = useTransition()
  const code = issued?.slipId === slipId ? issued.code : null

  function generate() {
    startTransition(async () => {
      const next = await createBookingCode(keys)
      if (next) setIssued({ slipId, code: next })
    })
  }

  function whatsapp(current: string) {
    const text = t('share.message', {
      code: current,
      count: keys.length,
      odds: formatOdds(totalOdds),
      link: `${window.location.origin}/s/${current}`,
    })
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  async function copy(current: string) {
    await navigator.clipboard.writeText(current)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!code) {
    return (
      <button
        type="button"
        onClick={generate}
        disabled={pending}
        className={cn(
          'flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm font-bold text-muted-foreground hover:border-primary hover:text-foreground disabled:opacity-60',
          className,
        )}
      >
        <Share2 className="size-4" aria-hidden="true" />
        {pending ? t('booking.creating') : t('booking.code')}
      </button>
    )
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{t('booking.code')}</span>
        <span className="font-mono text-lg font-black tracking-[0.2em] text-foreground">{code}</span>
      </div>
      <button
        type="button"
        onClick={() => whatsapp(code)}
        className="flex h-10 items-center gap-1.5 rounded-lg bg-success/15 px-3 text-xs font-bold text-success hover:bg-success/25"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        {t('share.whatsapp')}
      </button>
      <button
        type="button"
        onClick={() => copy(code)}
        className="flex h-10 items-center gap-1.5 rounded-lg bg-background px-3 text-xs font-bold hover:bg-accent"
      >
        {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
        <span aria-live="polite">{copied ? t('share.copied') : t('share.copy')}</span>
      </button>
    </div>
  )
}
