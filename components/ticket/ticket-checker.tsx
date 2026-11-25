'use client'

import { useState, useTransition } from 'react'
import { Search } from 'lucide-react'
import { findTicket, type TicketView } from '@/app/actions/booking'
import { useI18n } from '@/components/i18n/i18n-provider'
import type { DictKey } from '@/lib/i18n/dictionaries'
import { formatMoney, formatOdds } from '@/lib/format'
import { cn } from '@/lib/utils'

const STATUS_STYLE: Record<string, string> = {
  open: 'bg-primary/15 text-primary',
  won: 'bg-success/15 text-success',
  lost: 'bg-destructive/15 text-destructive',
  void: 'bg-muted text-muted-foreground',
  cashed_out: 'bg-success/15 text-success',
}

export function TicketChecker() {
  const { t, locale } = useI18n()
  const [value, setValue] = useState('')
  const [ticket, setTicket] = useState<TicketView | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await findTicket(value)
      setTicket(result)
      setNotFound(result === null)
    })
  }

  const statusKey = ticket ? (`ticket.status.${ticket.status}` as DictKey) : null

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={submit} className="flex flex-col gap-1.5">
        <label htmlFor="ticket-ref" className="text-sm font-bold">
          {t('ticket.label')}
        </label>
        <div className="flex gap-2">
          <input
            id="ticket-ref"
            value={value}
            onChange={(e) => setValue(e.target.value.toUpperCase())}
            placeholder={t('ticket.placeholder')}
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            aria-describedby="ticket-status"
            className="h-12 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 font-mono text-base font-bold uppercase text-foreground placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={pending || value.trim().length < 6}
            className="flex h-12 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 font-extrabold text-primary-foreground disabled:opacity-50"
          >
            <Search className="size-4" aria-hidden="true" />
            {t('ticket.check')}
          </button>
        </div>
        <p id="ticket-status" role="status" className="min-h-5 text-sm text-destructive">
          {notFound && t('ticket.notFound')}
        </p>
      </form>

      {ticket && statusKey && (
        <article className="flex flex-col overflow-hidden rounded-xl bg-surface">
          <header className="flex items-start justify-between gap-3 bg-brand px-4 py-3">
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-mono text-sm font-bold">{ticket.reference}</span>
              <span className="text-xs text-foreground/80">
                {t('ticket.placed', {
                  date: new Date(ticket.createdAt).toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-GB', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }),
                })}
              </span>
            </div>
            <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-extrabold', STATUS_STYLE[ticket.status] ?? STATUS_STYLE.void)}>
              {t(statusKey)}
            </span>
          </header>
          <dl className="grid grid-cols-3 gap-2 border-b border-border px-4 py-3 text-sm">
            <div className="flex flex-col">
              <dt className="text-xs text-muted-foreground">{t('ticket.stake')}</dt>
              <dd className="font-bold">{formatMoney(ticket.stake)}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-xs text-muted-foreground">{t('ticket.odds')}</dt>
              <dd className="font-bold">{ticket.totalOdds ? formatOdds(ticket.totalOdds) : '-'}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-xs text-muted-foreground">{t('ticket.potential')}</dt>
              <dd className="font-extrabold text-success">{ticket.potentialWin ? formatMoney(ticket.potentialWin) : '-'}</dd>
            </div>
          </dl>
          <h2 className="px-4 pt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('ticket.selections')}</h2>
          <ul className="flex flex-col px-4 pb-2">
            {ticket.selections.map((s, i) => (
              <li key={`${s.pick}-${i}`} className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-0">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-bold">{s.pick}</span>
                  {(s.market || s.event) && (
                    <span className="truncate text-xs text-muted-foreground">
                      {[s.market, s.event].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </div>
                {s.odds ? <span className="shrink-0 text-sm font-extrabold">{formatOdds(s.odds)}</span> : null}
              </li>
            ))}
          </ul>
        </article>
      )}
      <p className="text-xs text-muted-foreground">{t('ticket.privacy')}</p>
    </div>
  )
}
