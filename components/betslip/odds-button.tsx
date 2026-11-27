'use client'

import { useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { BoltIcon } from '@/components/site/bolt-icon'
import { useLiveBucket } from '@/components/live/live-clock'
import { resolveSelection } from '@/lib/data/selections'
import { formatOdds } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useBetSlip } from './betslip-provider'

export function OddsButton({
  selectionKey,
  odds,
  label,
  ariaLabel,
  was,
  live,
  stacked,
  className,
}: {
  selectionKey: string
  odds: number
  label?: string
  ariaLabel: string
  was?: number
  live?: boolean
  /** Put the label above the price on phones, for narrow multi-column rows. */
  stacked?: boolean
  className?: string
}) {
  const { has, toggle } = useBetSlip()
  const bucket = useLiveBucket()
  const current = live ? (resolveSelection(selectionKey, bucket)?.odds ?? odds) : odds
  const [previous, setPrevious] = useState(current)
  const [direction, setDirection] = useState<'up' | 'down' | null>(null)
  if (current !== previous) {
    setPrevious(current)
    setDirection(current > previous ? 'up' : 'down')
  }

  const active = has(selectionKey)
  const boosted = was !== undefined

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`${ariaLabel} at ${formatOdds(current)}`}
      onClick={() => toggle(selectionKey)}
      className={cn(
        'relative flex min-h-10 min-w-0 flex-1 items-center justify-between gap-1.5 rounded-md px-2 py-1 text-sm font-extrabold transition-colors',
        boosted && 'pr-4',
        stacked && label && 'flex-col items-start justify-center gap-0.5 py-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-1.5 sm:py-1',
        active
          ? 'bg-primary text-primary-foreground'
          : boosted
            ? 'bg-boost/15 text-foreground ring-1 ring-boost/50 hover:bg-boost/25'
            : 'bg-surface-2 text-foreground hover:bg-accent',
        className,
      )}
    >
      {boosted && (
        <span
          aria-hidden="true"
          className="absolute -right-1.5 -top-2 grid size-5 place-items-center rounded-full bg-boost text-boost-foreground ring-2 ring-surface"
        >
          <BoltIcon className="size-3 fill-current" />
        </span>
      )}
      {label && (
        <span
          className={cn(
            'line-clamp-2 min-w-0 break-words text-left text-xs font-bold leading-tight',
            active ? 'text-primary-foreground/80' : boosted ? 'text-boost' : 'text-muted-foreground',
          )}
        >
          {label}
        </span>
      )}
      <span className={cn('ml-auto flex shrink-0 items-center gap-0.5', stacked && label && 'ml-0 sm:ml-auto', boosted && 'flex-col items-end gap-0 leading-none')}>
        {boosted && (
          <span
            className={cn(
              'text-[10px] font-semibold leading-none line-through',
              active ? 'text-primary-foreground/70' : 'text-muted-foreground',
            )}
          >
            {formatOdds(was)}
          </span>
        )}
        {direction && !active && (
          <span key={`${current}-arrow`} aria-hidden="true" className={direction === 'up' ? 'text-success' : 'text-destructive'}>
            {direction === 'up' ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
          </span>
        )}
        <span
          key={current}
          className={cn(
            'rounded px-0.5',
            boosted && !active && 'text-boost',
            direction && !active && (direction === 'up' ? 'odds-flash-up' : 'odds-flash-down'),
          )}
        >
          {formatOdds(current)}
        </span>
      </span>
    </button>
  )
}
