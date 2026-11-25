import Link from 'next/link'
import { Flame, Trophy } from 'lucide-react'
import { MAJOR_TOURNAMENTS, MATCHES, SPORTS } from '@/lib/data/sports'
import { cn } from '@/lib/utils'

const LEAGUES_WITH_MATCHES = new Set(MATCHES.map((m) => m.league))
const TOP_LEAGUES = [...new Set(MAJOR_TOURNAMENTS)].filter((l) => LEAGUES_WITH_MATCHES.has(l)).slice(0, 10)

export function SportsSidebar({ className }: { className?: string }) {
  return (
    <aside className={cn('flex flex-col gap-4', className)} aria-label="Sports menu">
      <div className="sticky top-[116px] flex flex-col gap-4">
        <div className="flex flex-col gap-1 rounded-xl bg-surface p-2">
          <Link
            href="/boosts"
            className="flex items-center gap-2 rounded-lg bg-boost/15 px-3 py-2 text-sm font-extrabold text-boost hover:bg-boost/25"
          >
            <Flame className="size-4" aria-hidden="true" />
            Odds Boosts
          </Link>
          <Link href="/jackpot" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold hover:bg-accent">
            <Trophy className="size-4 text-primary" aria-hidden="true" />
            Mega Jackpot
          </Link>
        </div>

        <nav aria-label="Sports" className="rounded-xl bg-surface p-2">
          <h2 className="px-3 pb-1 pt-1 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Sports</h2>
          <ul className="flex flex-col">
            {SPORTS.map((sport) => (
              <li key={sport.id}>
                <Link
                  href={`/sports?sport=${sport.id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-bold hover:bg-accent"
                >
                  {sport.name}
                  <span className="text-xs text-muted-foreground">{sport.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Top leagues" className="rounded-xl bg-surface p-2">
          <h2 className="px-3 pb-1 pt-1 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            Top leagues
          </h2>
          <ul className="flex flex-col">
            {TOP_LEAGUES.map((league) => (
              <li key={league}>
                <Link
                  href={`/sports?league=${encodeURIComponent(league)}`}
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-white/90 hover:bg-accent"
                >
                  {league}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
