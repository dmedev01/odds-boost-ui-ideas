import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Lock, Radio, Star } from 'lucide-react'
import { OddsButton } from '@/components/betslip/odds-button'
import { MatchList } from '@/components/sports/match-row'
import { Notice, PrimaryButton, StateSwitcher, pickState } from '@/components/v4/ui-states'
import { selectionKey } from '@/lib/data/selections'
import { MATCHES, getMatch, type Match } from '@/lib/data/sports'
import { formatOdds } from '@/lib/format'
import { cn } from '@/lib/utils'

const PREMATCH_STATES = [
  { id: 'markets', label: 'All markets', uc: 'SPT-004' },
  { id: 'kickoff', label: 'Kick-off handover', uc: 'RT-008' },
  { id: 'restricted', label: 'Event restricted', uc: 'BSL-019' },
] as const

const LIVE_STATES = [
  { id: 'tracker', label: 'Live tracker', uc: 'SPT-007' },
  { id: 'bet-stop', label: 'Bet stop', uc: 'RT-002' },
  { id: 'feed-silent', label: 'Feed silent', uc: 'RT-013' },
  { id: 'ended', label: 'Match ended', uc: 'RT-004' },
] as const

function resolve(id: string): Match | undefined {
  if (id === 'live') return MATCHES.find((m) => m.live && m.sport === 'football') ?? MATCHES.find((m) => m.live)
  if (id === 'prematch') return MATCHES.find((m) => !m.live && m.sport === 'football' && m.ou)
  return getMatch(id)
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const m = resolve((await params).id)
  return { title: m ? `${m.home} vs ${m.away}` : 'Event' }
}

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ state?: string }>
}) {
  const [{ id }, { state: requested }] = await Promise.all([params, searchParams])
  const match = resolve(id)
  if (!match) notFound()

  const live = Boolean(match.live)
  const states: readonly { id: string; label: string; uc: string }[] = live ? LIVE_STATES : PREMATCH_STATES
  const state: string = pickState(states, requested).id
  const suspended = state === 'bet-stop' || state === 'feed-silent' || state === 'ended' || state === 'kickoff'
  const event = `${match.home} vs ${match.away}`
  const recommended = MATCHES.filter((m) => m.id !== match.id && m.league === match.league).slice(0, 4)

  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={states} current={state} basePath={`/event/${id}`} />

      <header className="flex flex-col gap-3 rounded-xl bg-brand p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-extrabold uppercase tracking-widest text-foreground/70">
            {match.country} · {match.league}
          </p>
          <button type="button" aria-pressed="true" aria-label="Remove from favourites" className="text-primary">
            <Star className="size-5 fill-current" aria-hidden />
          </button>
        </div>
        <div className="flex items-center justify-between gap-4">
          <h1 className="min-w-0 flex-1 text-balance text-xl font-black md:text-2xl">{match.home}</h1>
          <div className="flex flex-col items-center">
            {live ? (
              <>
                <span className="font-mono text-3xl font-black tabular-nums">
                  {match.live!.score[0]} - {match.live!.score[1]}
                </span>
                <span className={cn('flex items-center gap-1 text-xs font-extrabold', state === 'ended' ? 'text-muted-foreground' : 'text-primary')}>
                  {state === 'ended' ? 'Full time' : (<><Radio className="size-3" aria-hidden /> {match.live!.clock}</>)}
                </span>
              </>
            ) : (
              <span className="text-sm font-extrabold">{state === 'kickoff' ? 'Starting' : match.kickoff}</span>
            )}
          </div>
          <h1 className="min-w-0 flex-1 text-balance text-right text-xl font-black md:text-2xl">{match.away}</h1>
        </div>
        {live && state !== 'ended' && <Tracker silent={state === 'feed-silent'} />}
      </header>

      {state === 'bet-stop' && <Notice tone="warning" title="Markets suspended">Possible goal under review. Betting reopens in a few seconds.</Notice>}
      {state === 'feed-silent' && <Notice tone="warning" title="Live data delayed">We have not received updates for over 60 seconds, so betting is paused to protect you.</Notice>}
      {state === 'ended' && (
        <Notice tone="info" title="This match has ended" action={<PrimaryButton variant="secondary" href="/results">See results</PrimaryButton>}>
          Selections from it were removed from your slip. Open bets settle within minutes.
        </Notice>
      )}
      {state === 'kickoff' && (
        <Notice tone="info" title="This match is starting" action={<PrimaryButton variant="secondary" href="/event/live">Go to live</PrimaryButton>}>
          Prematch markets have closed. Live markets open shortly.
        </Notice>
      )}
      {state === 'restricted' && (
        <Notice tone="warning" title="Limited betting on this event">This event can only be combined with up to 3 other selections and maximum stake is 50,000 FCFA.</Notice>
      )}

      <nav aria-label="Market groups" className="no-scrollbar flex gap-1.5 overflow-x-auto">
        {['All', 'Main', 'Goals', 'Halves', 'Players', 'Favourites'].map((t, i) => (
          <span key={t} className={cn('shrink-0 rounded-full px-3 py-1.5 text-xs font-extrabold ring-1', i === 0 ? 'bg-primary text-primary-foreground ring-primary' : 'bg-surface ring-border')}>
            {t}
          </span>
        ))}
      </nav>

      <div className="flex flex-col gap-3">
        <MarketCard title="Match result" suspended={suspended}>
          {(['1', 'X', '2'] as const)
            .filter((p) => match.odds[p] !== undefined)
            .map((p) => (
              <OddsButton
                key={p}
                selectionKey={selectionKey(match.id, '1X2', p)}
                odds={match.odds[p]!}
                label={p === '1' ? match.home : p === '2' ? match.away : 'Draw'}
                ariaLabel={`${event}: ${p}`}
                live={live}
                className="flex-1"
              />
            ))}
        </MarketCard>
        {match.ou && (
          <MarketCard title={`Total goals ${match.ou.line}`} suspended={suspended}>
            <OddsButton selectionKey={selectionKey(match.id, 'OU', 'O')} odds={match.ou.over} label="Over" ariaLabel={`${event}: over`} live={live} className="flex-1" />
            <OddsButton selectionKey={selectionKey(match.id, 'OU', 'U')} odds={match.ou.under} label="Under" ariaLabel={`${event}: under`} live={live} className="flex-1" />
          </MarketCard>
        )}
        <StaticMarket title="Both teams to score" picks={[['Yes', 1.72], ['No', 2.05]]} suspended={suspended} />
        <StaticMarket title="Double chance" picks={[['1X', 1.28], ['12', 1.31], ['X2', 1.95]]} suspended={suspended} />
        <StaticMarket title="Correct score" picks={[['1-0', 7.5], ['2-1', 9.0], ['1-1', 6.25], ['0-1', 11.0]]} suspended={suspended} />
        <p className="text-center text-xs font-semibold text-muted-foreground">+{Math.max(0, match.markets - 5)} more markets</p>
      </div>

      {recommended.length > 0 && <MatchList title="You may also like" matches={recommended} />}
    </div>
  )
}

function MarketCard({ title, suspended, children }: { title: string; suspended: boolean; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 rounded-xl bg-surface p-3" aria-disabled={suspended || undefined}>
      <h2 className="flex items-center gap-2 text-sm font-extrabold">
        {title}
        {suspended && <Lock className="size-3.5 text-muted-foreground" aria-label="Suspended" />}
      </h2>
      <div className={cn('flex gap-2', suspended && 'pointer-events-none opacity-40')}>{children}</div>
    </section>
  )
}

function StaticMarket({ title, picks, suspended }: { title: string; picks: [string, number][]; suspended: boolean }) {
  return (
    <MarketCard title={title} suspended={suspended}>
      {picks.map(([label, odds]) => (
        <span key={label} className="flex h-12 flex-1 flex-col items-center justify-center rounded-lg bg-surface-2 text-xs ring-1 ring-border">
          <span className="font-semibold text-muted-foreground">{label}</span>
          <span className="font-black tabular-nums">{formatOdds(odds)}</span>
        </span>
      ))}
    </MarketCard>
  )
}

function Tracker({ silent }: { silent: boolean }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-background/30 p-3">
      <div className="relative h-24 overflow-hidden rounded-md bg-success/25 ring-1 ring-success/40">
        <div aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-foreground/30" />
        <div aria-hidden className="absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full ring-1 ring-foreground/30" />
        <span className={cn('absolute top-1/3 left-[68%] size-3 rounded-full bg-foreground', silent && 'opacity-30')} aria-hidden />
        <span className="absolute bottom-2 left-2 text-xs font-extrabold">{silent ? 'Waiting for data' : 'Dangerous attack · Home'}</span>
      </div>
      <dl className="grid grid-cols-3 gap-2 text-center text-xs">
        {[
          ['Possession', '58% / 42%'],
          ['Shots', '9 / 4'],
          ['Corners', '5 / 2'],
        ].map(([k, v]) => (
          <div key={k} className="flex flex-col">
            <dt className="font-semibold text-foreground/70">{k}</dt>
            <dd className="font-extrabold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
