import { ACCA_BOOST_TIERS, accaBoostPct } from '@/lib/data/sports'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'

const MAX_LEGS = ACCA_BOOST_TIERS[ACCA_BOOST_TIERS.length - 1].legs

export function BoostLadder({ legs, extraWin }: { legs: number; extraWin: number }) {
  const pct = accaBoostPct(legs)
  const next = ACCA_BOOST_TIERS.find((t) => t.legs > legs)

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-boost/10 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-extrabold text-boost">{pct > 0 ? `Boost +${pct}% unlocked` : 'Boost Ladder'}</p>
        {pct > 0 && <p className="text-xs font-bold text-success">+{formatMoney(extraWin)}</p>}
      </div>

      <ol className="flex gap-1" aria-label={`${legs} of ${MAX_LEGS} legs`}>
        {Array.from({ length: MAX_LEGS }, (_, i) => {
          const leg = i + 1
          const tier = ACCA_BOOST_TIERS.find((t) => t.legs === leg)
          const filled = leg <= legs
          return (
            <li key={leg} className="flex flex-1 flex-col items-center gap-1">
              <span
                className={cn(
                  'text-[10px] font-extrabold leading-none',
                  tier ? (filled ? 'text-boost' : 'text-muted-foreground') : 'invisible',
                )}
              >
                {tier ? `+${tier.pct}%` : '0'}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  'w-full rounded-sm transition-colors',
                  tier ? 'h-3' : 'h-2',
                  filled ? 'bg-boost' : 'bg-surface-2',
                )}
              />
            </li>
          )
        })}
      </ol>

      <p className="text-xs text-muted-foreground">
        {next
          ? `Add ${next.legs - legs} more ${next.legs - legs === 1 ? 'leg' : 'legs'} to reach +${next.pct}%`
          : 'Top of the ladder. Maximum boost applied.'}
      </p>
    </div>
  )
}
