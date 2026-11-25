'use client'

import { Clock, Flame } from 'lucide-react'
import { OddsButton } from '@/components/betslip/odds-button'
import { useI18n } from '@/components/i18n/i18n-provider'
import { selectionKey } from '@/lib/data/selections'
import type { BoostEvent } from '@/lib/data/sports'
import { cn } from '@/lib/utils'

export function BoostCard({ event, className }: { event: BoostEvent; className?: string }) {
  const { t } = useI18n()
  const superBoost = event.tier === 'Super Boost'

  return (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-xl bg-surface p-4 ring-1',
        superBoost ? 'ring-boost/60' : 'ring-border',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide',
            superBoost ? 'bg-boost text-boost-foreground' : 'bg-boost/15 text-boost',
          )}
        >
          <Flame className="size-3" aria-hidden="true" />
          {t(superBoost ? 'boost.super' : 'boost.daily')}
        </span>
        <span className="text-xs font-extrabold text-success">{t('boost.upTo', { pct: event.topPct })}</span>
      </div>

      <div className="flex flex-col gap-0.5">
        <h3 className="text-pretty font-extrabold leading-snug">
          {event.home} <span className="font-semibold text-muted-foreground">vs</span> {event.away}
        </h3>
        <p className="truncate text-xs text-muted-foreground">
          {event.league} · {event.live ? t('nav.live') : event.kickoff}
        </p>
      </div>

      <ul className="flex flex-col gap-1.5" aria-label={t('boost.picks')}>
        {event.picks.map((p) => {
          const name = p.isDraw ? t('boost.draw') : p.title
          return (
            <li key={p.id}>
              <OddsButton
                selectionKey={selectionKey(p.matchId, 'BOOST', p.id)}
                odds={p.odds}
                was={p.was}
                label={name}
                ariaLabel={t('boost.aria', { pick: name, was: p.was.toFixed(2) })}
                className="min-h-11 w-full px-3"
              />
            </li>
          )
        })}
      </ul>

      <p className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
        <Clock className="size-3" aria-hidden="true" />
        {t('boost.ends', { when: event.endsIn })}
      </p>
    </article>
  )
}
