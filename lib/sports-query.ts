import { isToday, MATCHES, SPORTS, type Match } from '@/lib/data/sports'

export type When = 'today' | '3h'

export interface SportsQuery {
  sport?: string
  league?: string
  live: boolean
  when?: When
  q: string
}

const THREE_HOURS = 3 * 60 * 60 * 1000

export function parseSportsQuery(params: Record<string, string | string[] | undefined>): SportsQuery {
  const get = (key: string) => {
    const value = params[key]
    return (Array.isArray(value) ? value[0] : value)?.trim() || undefined
  }
  const sport = get('sport')
  const when = get('when')
  return {
    sport: SPORTS.some((s) => s.id === sport) ? sport : undefined,
    league: get('league'),
    live: get('live') === '1',
    when: when === 'today' || when === '3h' ? when : undefined,
    q: (get('q') ?? '').slice(0, 60),
  }
}

export function sportsHref(query: SportsQuery, patch: Partial<SportsQuery> = {}) {
  const next = { ...query, ...patch }
  const params = new URLSearchParams()
  if (next.sport) params.set('sport', next.sport)
  if (next.league) params.set('league', next.league)
  if (next.live) params.set('live', '1')
  if (next.when) params.set('when', next.when)
  if (next.q) params.set('q', next.q)
  const search = params.toString()
  return search ? `/sports?${search}` : '/sports'
}

/** Case- and accent-insensitive, so "atletico" finds "Atlético". */
export const fold = (text: string) =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

function matchesText(match: Match, q: string) {
  if (!q) return true
  const haystack = fold(`${match.home} ${match.away} ${match.league} ${match.country}`)
  return fold(q)
    .split(/\s+/)
    .every((word) => haystack.includes(word))
}

function matchesWhen(match: Match, query: SportsQuery, now: number) {
  if (query.live) return Boolean(match.live)
  if (query.when === 'today') return Boolean(match.live) || isToday(match.startsAt, now)
  if (query.when === '3h') return Boolean(match.live) || (match.startsAt >= now && match.startsAt - now <= THREE_HOURS)
  return true
}

/** Matches for the query. `ignore` drops one filter, so a filter's own options can show their counts. */
export function filterMatches(query: SportsQuery, ignore?: 'sport' | 'when', now = Date.now()) {
  return MATCHES.filter(
    (m) =>
      (ignore === 'sport' || !query.sport || m.sport === query.sport) &&
      (!query.league || m.league === query.league) &&
      (ignore === 'when' || matchesWhen(m, query, now)) &&
      matchesText(m, query.q),
  )
}

/** Competitions whose name matches the search, with how many matches each has. */
export function matchingCompetitions(query: SportsQuery) {
  if (!query.q) return []
  const q = fold(query.q)
  const counts = new Map<string, number>()
  for (const m of MATCHES) {
    if (query.sport && m.sport !== query.sport) continue
    if (fold(m.league).includes(q)) counts.set(m.league, (counts.get(m.league) ?? 0) + 1)
  }
  return [...counts].map(([league, count]) => ({ league, count })).sort((a, b) => b.count - a.count).slice(0, 8)
}

export function hasNarrowingFilter(query: SportsQuery) {
  return query.live || Boolean(query.when) || Boolean(query.q) || Boolean(query.league)
}
