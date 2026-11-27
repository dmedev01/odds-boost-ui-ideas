'use client'

import { ChevronDown } from 'lucide-react'
import { useI18n } from '@/components/i18n/i18n-provider'
import type { ResolvedSelection } from '@/lib/data/selections'
import { formatMoney, formatOdds } from '@/lib/format'
import { capWin, choose, type SlipMode, ticketOdds } from '@/lib/slip-modes'
import { cn } from '@/lib/utils'

const MODE_LABEL = {
  single: 'slip.singles',
  multi: 'slip.multiple',
  system: 'slip.system',
  integral: 'slip.integral',
} as const

const VISIBLE_TICKETS = 50

export function SlipModeTabs({
  modes,
  active,
  disabled,
  onChange,
}: {
  modes: SlipMode[]
  active: SlipMode
  disabled: SlipMode[]
  onChange: (mode: SlipMode) => void
}) {
  const { t } = useI18n()
  return (
    <div
      role="tablist"
      aria-label={t('slip.modes')}
      className="mx-3 mt-3 flex gap-1 rounded-lg bg-background p-1 text-sm font-bold"
    >
      {modes.map((m) => (
        <button
          key={m}
          role="tab"
          type="button"
          aria-selected={active === m}
          disabled={disabled.includes(m)}
          onClick={() => onChange(m)}
          className={cn(
            'flex-1 rounded-md py-1.5 transition-colors disabled:opacity-40',
            active === m ? 'bg-brand text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {t(MODE_LABEL[m])}
        </button>
      ))}
    </div>
  )
}

export function SystemSizePicker({
  n,
  sizes,
  value,
  onChange,
}: {
  n: number
  sizes: number[]
  value: number
  onChange: (size: number) => void
}) {
  const { t } = useI18n()
  return (
    <fieldset className="mx-3 mt-3 flex flex-col gap-1.5">
      <legend className="mb-1.5 text-xs font-semibold text-muted-foreground">{t('slip.systemSize')}</legend>
      <div className="flex flex-wrap gap-1.5">
        {sizes.map((r) => (
          <label
            key={r}
            className={cn(
              'cursor-pointer rounded-md border px-2.5 py-1 text-xs font-bold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
              value === r ? 'border-brand bg-brand text-foreground' : 'border-border bg-background hover:bg-accent',
            )}
          >
            <input
              type="radio"
              name="system-size"
              value={r}
              checked={value === r}
              onChange={() => onChange(r)}
              className="sr-only"
            />
            {t('slip.systemOption', { r, n, count: choose(n, r) })}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function TicketList({ tickets, stake }: { tickets: ResolvedSelection[][]; stake: number }) {
  const { t } = useI18n()
  const hidden = tickets.length - VISIBLE_TICKETS
  return (
    <details className="group rounded-lg bg-background text-xs">
      <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 font-bold [&::-webkit-details-marker]:hidden">
        {t('slip.seeTickets', { count: tickets.length })}
        <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <ol className="flex max-h-48 flex-col overflow-y-auto border-t border-border">
        {tickets.slice(0, VISIBLE_TICKETS).map((ticket, i) => {
          const odds = ticketOdds(ticket)
          return (
            <li key={i} className="flex items-start justify-between gap-3 border-b border-border px-3 py-1.5 last:border-b-0">
              <span className="min-w-0 text-pretty leading-relaxed text-muted-foreground">
                {ticket.map((s) => `${s.eventLabel.split(' vs ')[0]}: ${s.pickLabel}`).join(' + ')}
              </span>
              <span className="flex shrink-0 flex-col items-end">
                <span className="font-bold text-foreground">{formatOdds(odds)}</span>
                <span className="text-muted-foreground">{formatMoney(capWin(stake * odds))}</span>
              </span>
            </li>
          )
        })}
        {hidden > 0 && <li className="px-3 py-1.5 text-muted-foreground">{t('slip.moreTickets', { count: hidden })}</li>}
      </ol>
    </details>
  )
}
