'use client'

import { useState, useTransition } from 'react'
import { loadBookingCode } from '@/app/actions/booking'
import { useI18n } from '@/components/i18n/i18n-provider'
import { normalizeBookingCode } from '@/lib/share'
import { cn } from '@/lib/utils'
import { useBetSlip } from './betslip-provider'

export function BookingCodeInput({ className }: { className?: string }) {
  const { t } = useI18n()
  const { load } = useBetSlip()
  const [value, setValue] = useState('')
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const code = normalizeBookingCode(value)
    if (!code) {
      setMessage({ ok: false, text: t('booking.invalid') })
      return
    }
    setMessage(null)
    startTransition(async () => {
      const result = await loadBookingCode(code)
      if (!result.ok) {
        setMessage({ ok: false, text: t('booking.invalid') })
        return
      }
      load(result.keys)
      setValue('')
      setMessage({ ok: true, text: t('booking.loaded', { count: result.keys.length, code }) })
    })
  }

  return (
    <form onSubmit={submit} className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor="booking-code" className="text-xs font-bold text-muted-foreground">
        {t('booking.label')}
      </label>
      <div className="flex gap-2">
        <input
          id="booking-code"
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase().slice(0, 8))}
          placeholder={t('booking.placeholder')}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          aria-invalid={message?.ok === false}
          aria-describedby="booking-code-status"
          className="h-11 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 font-mono text-base font-bold uppercase tracking-[0.2em] text-foreground placeholder:font-sans placeholder:tracking-normal placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={pending || value.trim().length === 0}
          className="h-11 shrink-0 rounded-lg bg-primary px-4 text-sm font-extrabold text-primary-foreground disabled:opacity-50"
        >
          {pending ? t('booking.loading') : t('booking.load')}
        </button>
      </div>
      <p
        id="booking-code-status"
        role="status"
        className={cn('min-h-4 text-xs', message?.ok ? 'text-success' : 'text-destructive')}
      >
        {message?.text}
      </p>
    </form>
  )
}
