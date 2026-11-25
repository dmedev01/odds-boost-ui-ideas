import { OddsButton } from '@/components/betslip/odds-button'
import { selectionKey } from '@/lib/data/selections'
import type { Match } from '@/lib/data/sports'

export function MatchRow({ match }: { match: Match }) {
  const picks = (['1', 'X', '2'] as const).filter((p) => match.odds[p] !== undefined)
  const event = `${match.home} vs ${match.away}`

  return (
    <li className="flex flex-col gap-2 border-b border-border px-3 py-3 last:border-0 md:flex-row md:items-center md:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="w-14 shrink-0 text-xs font-bold leading-tight">
          {match.live ? (
            <span className="flex flex-col gap-0.5 text-destructive">
              <span className="flex items-center gap-1">
                <span className="size-1.5 animate-pulse rounded-full bg-destructive" aria-hidden="true" />
                LIVE
              </span>
              <span className="text-white">{match.live.clock}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{match.kickoff}</span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-sm font-bold">
          <span className="flex justify-between gap-2">
            <span className="truncate">{match.home}</span>
            {match.live && <span className="text-primary">{match.live.score[0]}</span>}
          </span>
          <span className="flex justify-between gap-2">
            <span className="truncate">{match.away}</span>
            {match.live && <span className="text-primary">{match.live.score[1]}</span>}
          </span>
        </div>
        <span className="hidden shrink-0 text-xs font-semibold text-muted-foreground md:block">+{match.markets}</span>
      </div>
      <div className="flex gap-1.5 md:w-[340px]">
        {picks.map((p) => (
          <OddsButton
            key={p}
            selectionKey={selectionKey(match.id, '1X2', p)}
            odds={match.odds[p]!}
            label={p}
            ariaLabel={`${event}: ${p === '1' ? match.home : p === '2' ? match.away : 'Draw'}`}
          />
        ))}
        {match.ou && (
          <OddsButton
            selectionKey={selectionKey(match.id, 'OU', 'O')}
            odds={match.ou.over}
            label={`O${match.ou.line}`}
            ariaLabel={`${event}: Over ${match.ou.line}`}
            className="hidden sm:flex"
          />
        )}
      </div>
    </li>
  )
}

export function MatchList({ title, matches, action }: { title: string; matches: Match[]; action?: React.ReactNode }) {
  if (matches.length === 0) return null
  return (
    <section className="overflow-hidden rounded-xl bg-surface" aria-label={title}>
      <header className="flex items-center justify-between bg-surface-2 px-3 py-2.5">
        <h2 className="text-sm font-extrabold">{title}</h2>
        {action}
      </header>
      <ul>
        {matches.map((m) => (
          <MatchRow key={m.id} match={m} />
        ))}
      </ul>
    </section>
  )
}
