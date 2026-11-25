import snapshot from './snapshot.json'

// Catalogue captured from the current Wandabet site (see scripts/extract-snapshot.cjs).
// Kick-off times are shifted so the snapshot always looks current.

export type SportId = string

export interface Sport {
  id: SportId
  name: string
  /** Event count reported by the live site. */
  count: number
  /** True when the snapshot holds playable matches for this sport. */
  playable: boolean
}

export interface Match {
  id: string
  sport: SportId
  league: string
  country: string
  home: string
  away: string
  kickoff: string
  startsAt: number
  live?: { clock: string; score: [number, number] }
  odds: { '1': number; X?: number; '2': number }
  ou?: { line: number; over: number; under: number }
  markets: number
  form?: { home: string[]; away: string[] }
}

export interface Boost {
  id: string
  matchId: string
  tier: 'Super Boost' | 'Daily Boost' | 'Accumulator Boost'
  title: string
  detail: string
  /** Outcome position in the market: '1', 'X' or '2'. */
  slot: '1' | 'X' | '2'
  isDraw: boolean
  was: number
  odds: number
  maxStake?: number
  endsAt: number
  endsIn: string
}

/** All boosted outcomes of one match, as the live site groups them. */
export interface BoostEvent {
  matchId: string
  home: string
  away: string
  league: string
  kickoff: string
  live: boolean
  tier: 'Super Boost' | 'Daily Boost'
  /** Largest lift across the boosted outcomes, in percent. */
  topPct: number
  endsAt: number
  endsIn: string
  picks: Boost[]
}

interface SnapshotMatch {
  id: string
  sport: string
  league: string
  country: string
  home: string
  away: string
  time: number
  odds: { '1': number; X?: number; '2': number }
  markets: number
  form?: { home: string[]; away: string[] }
  live?: { clock: string; score: [number, number] }
}

const TZ = 'Africa/Douala'
const capturedAt = new Date(snapshot.capturedAt).getTime()
const shift = Math.max(0, Date.now() - capturedAt)

const dayKey = (t: number) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(t)
const clock = (t: number) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(t)

export function kickoffLabel(t: number, now = Date.now()) {
  if (dayKey(t) === dayKey(now)) return `Today ${clock(t)}`
  if (dayKey(t) === dayKey(now + 86_400_000)) return `Tomorrow ${clock(t)}`
  const day = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' }).format(t)
  return `${day} ${clock(t)}`
}

const round = (n: number) => Math.round(n * 100) / 100

/** Derive a plausible goals line from the 1X2 prices so football rows keep their totals column. */
function totalsFor(m: SnapshotMatch): Match['ou'] {
  if (m.sport !== 'football' || !m.odds.X) return undefined
  const favourite = Math.min(m.odds['1'], m.odds['2'])
  const line = favourite < 1.4 ? 3.5 : 2.5
  const over = round(Math.min(2.6, Math.max(1.45, 1.2 + favourite * 0.35)))
  const under = round(1 / Math.max(0.05, 1.06 - 1 / over))
  return { line, over, under }
}

export const MATCHES: Match[] = (snapshot.matches as SnapshotMatch[])
  .filter((m) => m.odds['1'] > 1 && m.odds['2'] > 1 && (m.live || m.odds['1'] < 50))
  .map((m) => {
    const startsAt = m.time + shift
    return {
      id: m.id,
      sport: m.sport,
      league: m.league,
      country: m.country,
      home: m.home,
      away: m.away,
      startsAt,
      kickoff: m.live ? 'Live' : kickoffLabel(startsAt),
      live: m.live,
      odds: m.odds,
      ou: totalsFor(m),
      markets: m.markets,
      form: m.form,
    }
  })

const matchById = new Map(MATCHES.map((m) => [m.id, m]))

export function getMatch(id: string) {
  return matchById.get(id)
}

const playableSports = new Set(MATCHES.map((m) => m.sport))

export const SPORTS: Sport[] = snapshot.sports
  .map((s) => ({ id: s.id, name: s.name, count: s.count, playable: playableSports.has(s.id) }))
  .sort((a, b) => Number(b.playable) - Number(a.playable) || b.count - a.count)

export const MAJOR_TOURNAMENTS: string[] = snapshot.majorTournaments.map((t) => t.name)

export const BOOSTS: Boost[] = snapshot.boosts
  .filter((b) => matchById.has(b.matchId) && b.home && b.away)
  .map((b, i) => {
    const match = matchById.get(b.matchId)!
    const lift = b.now / b.was
    const isDraw = b.pick === 'Draw'
    const slot = isDraw ? ('X' as const) : b.pick === b.away ? ('2' as const) : ('1' as const)
    const endsAt = (b.boostEnd ?? b.time) + shift
    return {
      id: `bo${i + 1}`,
      matchId: b.matchId,
      tier: lift >= 1.35 ? ('Super Boost' as const) : ('Daily Boost' as const),
      title: b.pick,
      detail: `${b.home} vs ${b.away} · ${match.league}`,
      slot,
      isDraw,
      was: round(b.was),
      odds: round(b.now),
      endsAt,
      endsIn: kickoffLabel(endsAt),
    }
  })

const SLOT_ORDER = { '1': 0, X: 1, '2': 2 } as const

export const BOOST_EVENTS: BoostEvent[] = [...Map.groupBy(BOOSTS, (b) => b.matchId)]
  .map(([matchId, picks]) => {
    const match = matchById.get(matchId)!
    const topPct = Math.max(...picks.map((p) => Math.round((p.odds / p.was - 1) * 100)))
    const endsAt = Math.min(...picks.map((p) => p.endsAt))
    return {
      matchId,
      home: match.home,
      away: match.away,
      league: match.league,
      kickoff: match.kickoff,
      live: Boolean(match.live),
      tier: topPct >= 35 ? ('Super Boost' as const) : ('Daily Boost' as const),
      topPct,
      endsAt,
      endsIn: kickoffLabel(endsAt),
      picks: [...picks].sort((a, b) => SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot]),
    }
  })
  .sort((a, b) => b.topPct - a.topPct || a.endsAt - b.endsAt)

export function getBoost(id: string) {
  return BOOSTS.find((b) => b.id === id)
}

export const ACCA_BOOST_TIERS = [
  { legs: 3, pct: 5 },
  { legs: 5, pct: 10 },
  { legs: 7, pct: 20 },
  { legs: 10, pct: 35 },
]

export function accaBoostPct(legs: number) {
  let pct = 0
  for (const tier of ACCA_BOOST_TIERS) if (legs >= tier.legs) pct = tier.pct
  return pct
}
