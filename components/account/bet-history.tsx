import type { BetRow } from '@/lib/wallet'
import { formatMoney, formatOdds } from '@/lib/format'

const PRODUCT_LABEL: Record<string, string> = {
  sports: 'Sports',
  jackpot: 'Jackpot',
  hippique: 'Hippique',
  lottery: 'Lottery',
  instant: 'Instant',
}

type Selection = { eventLabel?: string; pickLabel?: string; odds?: number }

export function BetHistory({ bets }: { bets: BetRow[] }) {
  if (bets.length === 0) {
    return (
      <p className="rounded-xl bg-surface p-8 text-center text-sm text-muted-foreground">
        No tickets yet. Your bets and tickets will appear here.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {bets.map((b) => {
        const selections = (b.selections as Selection[]) ?? []
        return (
          <li key={b.id} className="flex flex-col gap-2 rounded-xl bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className="rounded bg-brand px-2 py-0.5 text-[11px] font-extrabold uppercase">
                  {PRODUCT_LABEL[b.product] ?? b.product}
                </span>
                <span className="text-sm font-extrabold">{b.betType}</span>
              </span>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-extrabold uppercase text-primary">
                {b.status}
              </span>
            </div>
            <ul className="flex flex-col gap-1">
              {selections.slice(0, 4).map((s, i) => (
                <li key={i} className="flex justify-between gap-2 text-xs">
                  <span className="min-w-0 truncate text-muted-foreground">
                    {s.eventLabel} · <span className="font-bold text-white">{s.pickLabel}</span>
                  </span>
                  {s.odds && <span className="shrink-0 font-bold">{formatOdds(s.odds)}</span>}
                </li>
              ))}
              {selections.length > 4 && (
                <li className="text-xs text-muted-foreground">+{selections.length - 4} more</li>
              )}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2 text-xs">
              <span className="text-muted-foreground">
                {b.reference} · {new Date(b.createdAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
              </span>
              <span className="font-bold">
                Stake {formatMoney(b.stake)}
                {b.potentialWin && <span className="text-success"> · To win {formatMoney(b.potentialWin)}</span>}
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
