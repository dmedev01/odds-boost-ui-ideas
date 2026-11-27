import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { MomentumBar } from '@/components/live/momentum-bar'
import type { Match } from '@/lib/data/sports'
import { cn } from '@/lib/utils'

export function EventHeader({
  match,
  marketCount,
  labels,
}: {
  match: Match
  marketCount: string
  labels: { back: string; live: string }
}) {
  return (
    <header className="flex flex-col gap-3 rounded-xl bg-surface p-4">
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-muted-foreground">
        <Link
          href={`/sports?league=${encodeURIComponent(match.league)}`}
          className="flex min-w-0 items-center gap-1 hover:text-foreground"
        >
          <ChevronLeft className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{labels.back}</span>
        </Link>
        <span className="shrink-0">{marketCount}</span>
      </div>

      <p className="text-xs font-semibold text-muted-foreground">
        {match.country} · {match.league}
      </p>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <h1 className="text-pretty text-base font-extrabold leading-tight md:text-xl">{match.home}</h1>
        <div className="flex flex-col items-center gap-0.5 text-center">
          {match.live ? (
            <>
              <span className="text-2xl font-extrabold tabular-nums text-primary md:text-3xl">
                {match.live.score[0]} - {match.live.score[1]}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-destructive">
                <span className="size-1.5 animate-pulse rounded-full bg-destructive" aria-hidden="true" />
                {labels.live} {match.live.clock}
              </span>
            </>
          ) : (
            <span className="rounded-md bg-surface-2 px-2.5 py-1 text-xs font-bold">{match.kickoff}</span>
          )}
        </div>
        <p className={cn('text-pretty text-right text-base font-extrabold leading-tight md:text-xl')}>{match.away}</p>
      </div>

      {match.live && <MomentumBar matchId={match.id} home={match.home} away={match.away} />}
    </header>
  )
}

export function LeagueStrip({ title, matches }: { title: string; matches: Match[] }) {
  if (matches.length === 0) return null
  return (
    <nav aria-label={title} className="flex flex-col gap-2">
      <h2 className="text-sm font-extrabold">{title}</h2>
      <ul className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 lg:mx-0 lg:px-0">
        {matches.map((m) => (
          <li key={m.id} className="shrink-0">
            <Link
              href={`/event/${m.id}`}
              className="flex w-48 flex-col gap-1 rounded-lg bg-surface px-3 py-2 text-xs hover:bg-surface-2"
            >
              <span className={cn('font-bold', m.live ? 'text-destructive' : 'text-muted-foreground')}>
                {m.live ? `${m.live.clock} · ${m.live.score[0]}-${m.live.score[1]}` : m.kickoff}
              </span>
              <span className="truncate text-sm font-bold">{m.home}</span>
              <span className="truncate text-sm font-bold">{m.away}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
