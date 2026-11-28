import type { Metadata } from 'next'
import { Notice, Panel, StateSwitcher, TextInput, pickState, type StatePageProps } from '@/components/v4/ui-states'
import { MATCHES } from '@/lib/data/sports'

export const metadata: Metadata = { title: 'Results' }

const STATES = [
  { id: 'list', label: 'Results', uc: 'SPT-009' },
  { id: 'empty', label: 'No results for day', uc: 'SPT-009' },
] as const

export default async function ResultsPage({ searchParams }: StatePageProps) {
  const { state: requested } = await searchParams
  const state = pickState(STATES, requested).id
  const rows = MATCHES.filter((m) => m.sport === 'football').slice(0, 14)
  const byLeague = Map.groupBy(rows, (m) => `${m.country} · ${m.league}`)

  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath="/results" />
      <Panel title="Results">
        <div className="flex flex-wrap gap-2">
          <TextInput type="date" defaultValue="2026-11-25" aria-label="Date" className="h-9" />
          <select aria-label="Sport" className="h-9 rounded-lg bg-surface-2 px-3 text-sm font-semibold ring-1 ring-border">
            <option>Football</option>
            <option>Basketball</option>
            <option>Tennis</option>
          </select>
        </div>
        {state === 'empty' ? (
          <Notice tone="info" title="No finished events on 25 Nov for Football">Pick another date or sport.</Notice>
        ) : (
          [...byLeague].map(([league, matches]) => (
            <section key={league} className="flex flex-col gap-1">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">{league}</h2>
              <ul className="flex flex-col divide-y divide-border rounded-lg bg-surface-2">
                {matches.map((m, i) => (
                  <li key={m.id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 py-2.5 text-sm">
                    <span className="truncate font-bold">{m.home}</span>
                    <span className="rounded bg-background px-2 py-0.5 font-mono font-black tabular-nums">
                      {(i * 7) % 4} - {(i * 3) % 3}
                    </span>
                    <span className="truncate text-right font-bold">{m.away}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </Panel>
    </div>
  )
}
