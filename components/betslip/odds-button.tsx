'use client'

import { formatOdds } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useBetSlip } from './betslip-provider'

export function OddsButton({
  selectionKey,
  odds,
  label,
  ariaLabel,
  was,
  className,
}: {
  selectionKey: string
  odds: number
  label?: string
  ariaLabel: string
  was?: number
  className?: string
}) {
  const { has, toggle } = useBetSlip()
  const active = has(selectionKey)
  const boosted = was !== undefined

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`${ariaLabel} at ${formatOdds(odds)}`}
      onClick={() => toggle(selectionKey)}
      className={cn(
        'flex min-h-10 min-w-0 flex-1 items-center justify-between gap-2 rounded-md px-2.5 text-sm font-extrabold transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : boosted
            ? 'bg-boost/15 text-white ring-1 ring-boost/50 hover:bg-boost/25'
            : 'bg-surface-2 text-white hover:bg-accent',
        className,
      )}
    >
      {label && <span className={cn('truncate text-xs font-bold', active ? 'text-white/80' : 'text-muted-foreground')}>{label}</span>}
      <span className="ml-auto flex items-baseline gap-1.5">
        {boosted && (
          <span className={cn('text-xs font-semibold line-through', active ? 'text-white/70' : 'text-muted-foreground')}>
            {formatOdds(was)}
          </span>
        )}
        <span className={cn(boosted && !active && 'text-boost')}>{formatOdds(odds)}</span>
      </span>
    </button>
  )
}
