import { BOOSTS, MAJOR_TOURNAMENTS, MATCHES, SPORTS, type Match } from '@/lib/data/sports'
import { ENABLED_PRODUCTS, OPTIONAL_PRODUCTS, type ProductId } from '@/lib/site-config'

// The home page always fills the same amount of space. Each product a client
// turns off hands its share to sports content, so a sports-only client gets a
// full page instead of holes.
const TILE_SLOTS = 4
const BASE_MATCH_ROWS = 10
const ROWS_PER_MISSING_PRODUCT = 4
const MAX_SECTION_ROWS = 6
const MIN_SECTION_ROWS = 3

export type HomeTile =
  | { kind: 'product'; id: ProductId }
  | { kind: 'live'; count: number }
  | { kind: 'boosts'; count: number }
  | { kind: 'league'; league: string; count: number }

export type HomeSection =
  | { kind: 'matches'; key: string; title: { key: 'home.liveNow' | 'home.topFootball' } | { text: string }; href: string; matches: Match[]; live?: boolean }
  | { kind: 'leagues'; leagues: { name: string; count: number }[] }

export interface HomePlan {
  tiles: HomeTile[]
  sections: HomeSection[]
}

function leaguesByDepth(matches: Match[]) {
  const counts = new Map<string, number>()
  for (const m of matches) counts.set(m.league, (counts.get(m.league) ?? 0) + 1)
  const major = new Set(MAJOR_TOURNAMENTS)
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => Number(major.has(b.name)) - Number(major.has(a.name)) || b.count - a.count)
}

export function planHome(enabled: readonly ProductId[] = ENABLED_PRODUCTS): HomePlan {
  const missing = OPTIONAL_PRODUCTS.length - enabled.length
  const live = MATCHES.filter((m) => m.live)
  const upcoming = MATCHES.filter((m) => !m.live).sort((a, b) => a.startsAt - b.startsAt)
  const leagues = leaguesByDepth(upcoming)

  const tiles: HomeTile[] = enabled.map((id) => ({ kind: 'product', id }))
  const fillers: HomeTile[] = [
    ...(live.length > 0 ? [{ kind: 'live', count: live.length } as const] : []),
    ...(BOOSTS.length > 0 ? [{ kind: 'boosts', count: BOOSTS.length } as const] : []),
    ...leagues.map((l) => ({ kind: 'league', league: l.name, count: l.count }) as const),
  ]
  while (tiles.length < TILE_SLOTS && fillers.length > 0) tiles.push(fillers.shift()!)
  const tiledLeagues = new Set(tiles.flatMap((t) => (t.kind === 'league' ? [t.league] : [])))

  const candidates: Omit<Extract<HomeSection, { kind: 'matches' }>, 'kind'>[] = [
    { key: 'live', title: { key: 'home.liveNow' }, href: '/sports?live=1', matches: live, live: true },
    { key: 'football', title: { key: 'home.topFootball' }, href: '/sports', matches: upcoming.filter((m) => m.sport === 'football') },
    ...leagues.map((l) => ({
      key: `league:${l.name}`,
      title: { text: l.name },
      href: `/sports?league=${encodeURIComponent(l.name)}`,
      matches: upcoming.filter((m) => m.league === l.name),
    })),
    ...SPORTS.filter((s) => s.playable && s.id !== 'football').map((s) => ({
      key: `sport:${s.id}`,
      title: { text: s.name },
      href: `/sports?sport=${s.id}`,
      matches: upcoming.filter((m) => m.sport === s.id),
    })),
  ]

  let budget = BASE_MATCH_ROWS + missing * ROWS_PER_MISSING_PRODUCT
  const used = new Set<string>()
  const sections: HomeSection[] = []

  for (const c of candidates) {
    if (budget < MIN_SECTION_ROWS) break
    const fresh = c.matches.filter((m) => !used.has(m.id))
    const rows = fresh.slice(0, Math.min(MAX_SECTION_ROWS, budget))
    if (rows.length < (c.live ? 1 : MIN_SECTION_ROWS)) continue
    rows.forEach((m) => used.add(m.id))
    sections.push({ kind: 'matches', ...c, matches: rows })
    budget -= rows.length
  }

  const chips = leagues.filter((l) => !tiledLeagues.has(l.name)).slice(0, 10)
  if (missing > 0 && chips.length >= 4) {
    sections.splice(Math.min(1, sections.length), 0, { kind: 'leagues', leagues: chips })
  }

  return { tiles, sections }
}
