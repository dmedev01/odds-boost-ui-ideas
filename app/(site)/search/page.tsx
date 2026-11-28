import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, Search } from 'lucide-react'
import { MatchList } from '@/components/sports/match-row'
import { Notice, Panel, StateSwitcher, pickState } from '@/components/v4/ui-states'
import { MATCHES } from '@/lib/data/sports'

export const metadata: Metadata = { title: 'Search' }

const STATES = [
  { id: 'results', label: 'Results', uc: 'SPT-005' },
  { id: 'recent', label: 'Recent searches', uc: 'SPT-005' },
  { id: 'too-short', label: 'Too short', uc: 'SPT-005' },
  { id: 'empty', label: 'No results', uc: 'SPT-005' },
] as const

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ state?: string; q?: string }> }) {
  const { state: requested, q: rawQ } = await searchParams
  const state = pickState(STATES, requested).id
  const q = state === 'too-short' ? 'u' : state === 'empty' ? 'zzqx' : state === 'recent' ? '' : (rawQ ?? 'united')
  const needle = q.toLowerCase()
  const results = needle.length >= 3 ? MATCHES.filter((m) => `${m.home} ${m.away} ${m.league}`.toLowerCase().includes(needle)).slice(0, 12) : []

  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath="/search" />
      <form action="/search" role="search" className="flex items-center gap-2 rounded-xl bg-surface p-2 ring-1 ring-border focus-within:ring-primary">
        <Search className="ml-2 size-5 text-muted-foreground" aria-hidden />
        <label htmlFor="q" className="sr-only">Search teams, leagues and events</label>
        <input id="q" name="q" defaultValue={q} placeholder="Team, league or event" className="h-10 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground" />
      </form>

      {state === 'recent' && (
        <Panel title="Recent searches">
          <ul className="flex flex-wrap gap-2">
            {['Arsenal', 'Champions League', 'Coton Sport', 'Lakers'].map((r) => (
              <li key={r}>
                <Link href={`/search?q=${encodeURIComponent(r)}`} className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-bold ring-1 ring-border hover:ring-primary">
                  <Clock className="size-3" aria-hidden /> {r}
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      )}
      {state === 'too-short' && <Notice tone="info" title="Type at least 3 characters" />}
      {needle.length >= 3 &&
        (results.length ? (
          <MatchList title={`${results.length} results for "${q}"`} matches={results} />
        ) : (
          <Notice tone="info" title={`No events match "${q}"`}>Check the spelling or search a league name instead.</Notice>
        ))}
    </div>
  )
}
