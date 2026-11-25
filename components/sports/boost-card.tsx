import { Clock, Flame } from 'lucide-react'
import { OddsButton } from '@/components/betslip/odds-button'
import { selectionKey } from '@/lib/data/selections'
import type { Boost } from '@/lib/data/sports'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'

export function BoostCard({ boost, className }: { boost: Boost; className?: string }) {
  const pct = Math.round((boost.odds / boost.was - 1) * 100)
  const superBoost = boost.tier === 'Super Boost'

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
          {boost.tier}
        </span>
        <span className="text-xs font-extrabold text-success">+{pct}% odds</span>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-pretty font-extrabold leading-snug">{boost.title}</h3>
        <p className="text-xs text-muted-foreground">{boost.detail}</p>
      </div>
      <OddsButton
        selectionKey={selectionKey(boost.matchId, 'BOOST', boost.id)}
        odds={boost.odds}
        was={boost.was}
        label="Boosted"
        ariaLabel={`Boost: ${boost.title}, was ${boost.was}`}
        className="min-h-11 flex-none"
      />
      <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="size-3" aria-hidden="true" />
          {boost.endsIn}
        </span>
        <span>Max stake {formatMoney(boost.maxStake)}</span>
      </div>
    </article>
  )
}
