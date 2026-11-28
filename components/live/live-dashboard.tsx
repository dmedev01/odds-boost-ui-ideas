import Link from 'next/link'
import { Radio } from 'lucide-react'
import { BackButton } from '@/components/site/back-button'
import { MatchList } from '@/components/sports/match-row'
import type { Match } from '@/lib/data/sports'
import { cn } from '@/lib/utils'

interface Filter {
  key: string
  label: string
  count: number
  href: string
  active: boolean
}

export function LiveDashboard({
  title,
  summary,
  filters,
  groups,
  startingSoon,
  labels,
}: {
  title: string
  summary: string
  filters: Filter[]
  groups: { title: string; matches: Match[] }[]
  startingSoon: Match[]
  labels: { filters: string; empty: string; emptyHint: string; soon: string; allSports: string }
}) {
  return (
    <div className="flex flex-col gap-4">
      <BackButton />
      <header className="flex flex-col gap-3 rounded-xl bg-surface p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
            <Radio className="size-5" aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-col">
            <h1 className="text-balance text-lg font-extrabold leading-tight md:text-xl">{title}</h1>
            <p className="flex items-center gap-1.5 text-xs font-bold text-destructive" aria-live="polite">
              <span className="size-1.5 animate-pulse rounded-full bg-destructive" aria-hidden="true" />
              {summary}
            </p>
          </div>
        </div>

        {filters.length > 2 && (
          <nav aria-label={labels.filters}>
            <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
              {filters.map((f) => (
                <li key={f.key} className="shrink-0">
                  <Link
                    href={f.href}
                    aria-current={f.active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-bold',
                      f.active ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {f.label}
                    <span className="tabular-nums opacity-80">{f.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      {groups.length > 0 ? (
        groups.map((g) => <MatchList key={g.title} title={g.title} matches={g.matches} />)
      ) : (
        <section className="flex flex-col items-center gap-2 rounded-xl bg-surface px-4 py-10 text-center">
          <h2 className="text-base font-extrabold">{labels.empty}</h2>
          <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">{labels.emptyHint}</p>
        </section>
      )}

      <MatchList
        title={labels.soon}
        matches={startingSoon}
        action={
          <Link href="/sports" className="text-xs font-bold text-primary hover:underline">
            {labels.allSports}
          </Link>
        }
      />
    </div>
  )
}
