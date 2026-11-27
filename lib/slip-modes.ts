export type SlipMode = 'single' | 'multi' | 'system' | 'integral'

interface Leg {
  matchId: string
  market: string
  odds: number
}

// Brand switches, read as literals so Next.js inlines them on the client too.
// NEXT_PUBLIC_ALLOW_INTEGRAL_BETS mirrors V2's B_ALLOW_INTERGRAL_BETS ("0" turns it off).
// NEXT_PUBLIC_BETTING_OPTIONS mirrors V2's betting_options, e.g. "system,integral". Unset keeps both.
function parseFlag(raw: string | undefined, fallback: boolean) {
  const value = raw?.trim().toLowerCase()
  if (!value) return fallback
  return value === '1' || value === 'true'
}

function parseOptions(raw: string | undefined) {
  if (!raw?.trim()) return new Set(['system', 'integral'])
  return new Set(raw.split(',').map((s) => s.trim().toLowerCase()))
}

const BETTING_OPTIONS = parseOptions(process.env.NEXT_PUBLIC_BETTING_OPTIONS)

export const SYSTEM_ENABLED = BETTING_OPTIONS.has('system')
export const INTEGRAL_ENABLED = parseFlag(process.env.NEXT_PUBLIC_ALLOW_INTEGRAL_BETS, true) && BETTING_OPTIONS.has('integral')

// V2's INT_MAXIMUM_POTENTIAL_WINNINGS. Placeholder default until the brand value is confirmed.
export const MAX_POTENTIAL_WIN = Number(process.env.NEXT_PUBLIC_MAX_POTENTIAL_WIN) || 50_000_000
export const MAX_TICKETS = 1000
export const MAX_PICKS = 20

export function choose(n: number, r: number) {
  if (r < 0 || r > n) return 0
  let c = 1
  for (let i = 1; i <= r; i++) c = (c * (n - r + i)) / i
  return Math.round(c)
}

export function hasSameMatch(legs: { matchId: string }[]) {
  return new Set(legs.map((l) => l.matchId)).size !== legs.length
}

export function groupByMatch<T extends { matchId: string }>(legs: T[]): T[][] {
  const groups = new Map<string, T[]>()
  for (const leg of legs) {
    const group = groups.get(leg.matchId)
    if (group) group.push(leg)
    else groups.set(leg.matchId, [leg])
  }
  return Array.from(groups.values())
}

export function systemSizes(n: number) {
  if (!SYSTEM_ENABLED || n < 3) return []
  const sizes: number[] = []
  for (let r = 2; r <= n - 1; r++) if (choose(n, r) <= MAX_TICKETS) sizes.push(r)
  return sizes
}

export function integralCount(legs: { matchId: string }[]) {
  return groupByMatch(legs).reduce((acc, g) => acc * g.length, 1)
}

export function availableModes(legs: Leg[]): SlipMode[] {
  if (legs.length <= 1 || legs.some((l) => l.market === 'BOOST')) return ['single']
  if (hasSameMatch(legs)) return INTEGRAL_ENABLED ? ['integral'] : ['single']
  const modes: SlipMode[] = ['single', 'multi']
  if (systemSizes(legs.length).length > 0) modes.push('system')
  return modes
}

export function ticketCount(legs: Leg[], mode: SlipMode, systemSize: number) {
  if (mode === 'single') return legs.length
  if (mode === 'multi') return 1
  if (mode === 'system') return choose(legs.length, systemSize)
  return integralCount(legs)
}

function combinations<T>(items: T[], r: number): T[][] {
  const out: T[][] = []
  const pick: T[] = []
  const walk = (start: number) => {
    if (pick.length === r) {
      out.push([...pick])
      return
    }
    for (let i = start; i <= items.length - (r - pick.length); i++) {
      pick.push(items[i])
      walk(i + 1)
      pick.pop()
    }
  }
  walk(0)
  return out
}

function cartesian<T>(groups: T[][]): T[][] {
  return groups.reduce<T[][]>((acc, group) => acc.flatMap((ticket) => group.map((leg) => [...ticket, leg])), [[]])
}

// Callers check ticketCount against MAX_TICKETS before building.
export function buildTickets<T extends Leg>(legs: T[], mode: SlipMode, systemSize: number): T[][] {
  if (mode === 'single') return legs.map((l) => [l])
  if (mode === 'multi') return [legs]
  if (mode === 'system') return combinations(legs, systemSize)
  return cartesian(groupByMatch(legs))
}

export const ticketOdds = (ticket: { odds: number }[]) => ticket.reduce((acc, l) => acc * l.odds, 1)
export const capWin = (amount: number) => Math.min(amount, MAX_POTENTIAL_WIN)

export function summarizeTickets(tickets: { odds: number }[][], stake: number) {
  if (tickets.length === 0) return { min: 0, max: 0, sum: 0, maxOdds: 0, capped: false }
  const wins = tickets.map((t) => stake * ticketOdds(t))
  const raw = { min: Math.min(...wins), max: Math.max(...wins), sum: wins.reduce((a, b) => a + b, 0) }
  return {
    min: capWin(raw.min),
    max: capWin(raw.max),
    sum: capWin(raw.sum),
    maxOdds: Math.max(...tickets.map(ticketOdds)),
    capped: raw.sum > MAX_POTENTIAL_WIN,
  }
}
