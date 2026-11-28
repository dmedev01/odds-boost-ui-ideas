import type { Metadata } from 'next'
import { MatchList } from '@/components/sports/match-row'
import { Notice, Panel, StateSwitcher, pickState } from '@/components/v4/ui-states'
import { MATCHES } from '@/lib/data/sports'
import { formatOdds } from '@/lib/format'

export const metadata: Metadata = { title: 'Tournament' }

const STATES = [
  { id: 'fixtures', label: 'Fixtures', uc: 'SPT-010' },
  { id: 'outrights', label: 'Outrights', uc: 'SPT-010' },
  { id: 'standings', label: 'Standings', uc: 'SPT-010' },
  { id: 'empty', label: 'Between rounds', uc: 'SPT-010' },
] as const

export default async function TournamentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ state?: string }>
}) {
  const [{ slug }, { state: requested }] = await Promise.all([params, searchParams])
  const state = pickState(STATES, requested).id
  const leagueCounts = Map.groupBy(MATCHES.filter((m) => m.sport === 'football'), (m) => m.league)
  const [league, fixtures] = [...leagueCounts].sort((a, b) => b[1].length - a[1].length)[0]
  const teams = [...new Set(fixtures.flatMap((m) => [m.home, m.away]))].slice(0, 8)

  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath={`/tournament/${slug}`} />
      <header className="flex flex-col gap-1 rounded-xl bg-brand p-5">
        <p className="text-xs font-extrabold uppercase tracking-widest text-primary">Featured tournament</p>
        <h1 className="text-balance text-2xl font-black">{league}</h1>
        <p className="text-sm text-foreground/80">{fixtures.length} upcoming matches</p>
      </header>
      {state === 'fixtures' && <MatchList title="Next fixtures" matches={fixtures.slice(0, 10)} />}
      {state === 'outrights' && (
        <Panel title="Winner">
          <ul className="grid gap-2 sm:grid-cols-2">
            {teams.map((t, i) => (
              <li key={t} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2.5 text-sm">
                <span className="font-bold">{t}</span>
                <span className="font-black tabular-nums">{formatOdds(3 + i * 2.25)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
      {state === 'standings' && (
        <Panel title="Table">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="py-2 font-bold">#</th>
                <th className="font-bold">Team</th>
                <th className="text-right font-bold">P</th>
                <th className="text-right font-bold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t, i) => (
                <tr key={t} className="border-t border-border">
                  <td className="py-2 font-bold text-muted-foreground">{i + 1}</td>
                  <td className="font-bold">{t}</td>
                  <td className="text-right tabular-nums">12</td>
                  <td className="text-right font-black tabular-nums">{28 - i * 3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
      {state === 'empty' && <Notice tone="info" title="No fixtures scheduled yet">The next round is published on Monday. Outright markets stay open.</Notice>}
    </div>
  )
}
