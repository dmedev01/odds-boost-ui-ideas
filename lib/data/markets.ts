import type { Locale } from '@/lib/i18n/dictionaries'
import { boostFor, type Match } from './sports'

// Full market list for one match. Prices are derived from the match's real 1X2
// odds with a Poisson goals model, so every market is consistent with the
// headline prices. Replace getMarkets with the feed's market list when binding.

export type MarketGroup = 'main' | 'goals' | 'handicap' | 'score' | 'halves' | 'specials'

export const MARKET_GROUPS: MarketGroup[] = ['main', 'goals', 'handicap', 'score', 'halves', 'specials']

export interface MarketOutcome {
  id: string
  /** Bet slip selection key. 1X2, totals and boosts reuse the match-row keys so picks stay in sync. */
  key: string
  label: string
  odds: number
  was?: number
  /** Correct-score column: 0 home wins, 1 draws, 2 away wins. */
  column?: 0 | 1 | 2
}

export interface MatchMarket {
  /** Stable across matches (e.g. "btts", "ou-2.5") so a pinned market applies to every match. */
  id: string
  name: string
  group: MarketGroup
  layout: 'row' | 'score'
  /** Rank in the Popular tab; lower shows first. */
  popular?: number
  outcomes: MarketOutcome[]
}

const MARGIN = 1.07
const MAX_GOALS = 8

function price(p: number) {
  const safe = Math.min(0.97, Math.max(0.004, p))
  return Math.min(250, Math.max(1.01, Math.round((1 / (safe * MARGIN)) * 100) / 100))
}

function poisson(lambda: number, k: number) {
  let factorial = 1
  for (let i = 2; i <= k; i++) factorial *= i
  return (Math.exp(-lambda) * lambda ** k) / factorial
}

type Grid = number[][]

function goalGrid(lh: number, la: number): Grid {
  const home = Array.from({ length: MAX_GOALS + 1 }, (_, k) => poisson(lh, k))
  const away = Array.from({ length: MAX_GOALS + 1 }, (_, k) => poisson(la, k))
  return home.map((h) => away.map((a) => h * a))
}

function probability(grid: Grid, base: [number, number], test: (h: number, a: number) => boolean) {
  let sum = 0
  grid.forEach((row, i) => row.forEach((p, j) => {
    if (test(base[0] + i, base[1] + j)) sum += p
  }))
  return sum
}

function expectedGoals(match: Match): [number, number] {
  const h = 1 / match.odds['1']
  const d = match.odds.X ? 1 / match.odds.X : 0
  const a = 1 / match.odds['2']
  const total = h + d + a
  const pH = h / total
  const pA = a / total
  const goals = 2.3 + 1.4 * Math.abs(pH - pA)
  const share = Math.min(0.85, Math.max(0.15, 0.5 + (pH - pA) * 0.55))
  return [goals * share, goals * (1 - share)]
}

function liveState(match: Match) {
  if (!match.live) return { base: [0, 0] as [number, number], remaining: 1 }
  const minute = /HT/i.test(match.live.clock) ? 45 : Number.parseInt(match.live.clock, 10) || 45
  return { base: match.live.score, remaining: Math.min(1, Math.max(0.03, (90 - minute) / 90)) }
}

const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`)
const lineId = (n: number) => `${n < 0 ? 'm' : 'p'}${Math.abs(n)}`

const cache = new Map<string, MatchMarket[]>()

export function getMarkets(match: Match, locale: Locale = 'en'): MatchMarket[] {
  const cacheKey = `${match.id}:${locale}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const L = (en: string, fr: string) => (locale === 'fr' ? fr : en)
  const { home, away } = match
  const draw = L('Draw', 'Nul')
  const yes = L('Yes', 'Oui')
  const no = L('No', 'Non')
  const over = L('Over', 'Plus de')
  const under = L('Under', 'Moins de')
  const markets: MatchMarket[] = []

  const add = (
    id: string,
    name: string,
    group: MarketGroup,
    outcomes: [id: string, label: string, p: number, column?: 0 | 1 | 2][],
    extra: { popular?: number; layout?: MatchMarket['layout'] } = {},
  ) => {
    markets.push({
      id,
      name,
      group,
      layout: extra.layout ?? 'row',
      popular: extra.popular,
      outcomes: outcomes.map(([oid, label, p, column]) => ({
        id: oid,
        key: `${match.id}|MKT|${id}~${oid}`,
        label,
        odds: price(p),
        column,
      })),
    })
  }

  const slots = (['1', 'X', '2'] as const).filter((p) => match.odds[p] !== undefined)
  markets.push({
    id: '1x2',
    name: match.odds.X ? L('Match result', 'Résultat du match') : L('Winner', 'Vainqueur'),
    group: 'main',
    layout: 'row',
    popular: 1,
    outcomes: slots.map((p) => {
      const label = p === '1' ? home : p === '2' ? away : draw
      const boost = boostFor(match.id, p)
      return boost
        ? { id: p, key: `${match.id}|BOOST|${boost.id}`, label, odds: boost.odds, was: boost.was }
        : { id: p, key: `${match.id}|1X2|${p}`, label, odds: match.odds[p]! }
    }),
  })

  if (!match.odds.X) {
    const iH = 1 / match.odds['1']
    const pH = iH / (iH + 1 / match.odds['2'])
    for (const [line, shift] of [[-1.5, 0.14], [-3.5, 0.26]] as const) {
      const p = Math.min(0.95, Math.max(0.05, pH - shift))
      add(`ah-${lineId(line)}`, `${L('Handicap', 'Handicap')} ${signed(line)}`, 'handicap', [
        ['1', `${home} ${signed(line)}`, p],
        ['2', `${away} ${signed(-line)}`, 1 - p],
      ])
    }
    cache.set(cacheKey, markets)
    return markets
  }

  const [lh, la] = expectedGoals(match)
  const { base, remaining } = liveState(match)
  const grid = goalGrid(lh * remaining, la * remaining)
  const P = (test: (h: number, a: number) => boolean) => probability(grid, base, test)
  const pH = P((h, a) => h > a)
  const pD = P((h, a) => h === a)
  const pA = P((h, a) => h < a)
  const goalsSoFar = base[0] + base[1]

  add('dc', L('Double chance', 'Double chance'), 'main', [
    ['1X', `1X`, pH + pD],
    ['12', `12`, pH + pA],
    ['X2', `X2`, pD + pA],
  ], { popular: 4 })

  add('dnb', L('Draw no bet', 'Remboursé si nul'), 'main', [
    ['1', home, pH / (pH + pA)],
    ['2', away, pA / (pH + pA)],
  ], { popular: 5 })

  const lines = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5].filter((l) => l > goalsSoFar).slice(0, 5)
  const mainLine = match.live ? (lines[1] ?? lines[0]) : (match.ou?.line ?? 2.5)
  for (const line of lines) {
    const id = `ou-${line}`
    const name = L(`Total goals ${line}`, `Total de buts ${line}`)
    const popular = line === mainLine ? 2 : undefined
    if (!match.live && match.ou && match.ou.line === line) {
      markets.push({
        id,
        name,
        group: 'goals',
        layout: 'row',
        popular,
        outcomes: [
          { id: 'O', key: `${match.id}|OU|O`, label: `${over} ${line}`, odds: match.ou.over },
          { id: 'U', key: `${match.id}|OU|U`, label: `${under} ${line}`, odds: match.ou.under },
        ],
      })
      continue
    }
    const pOver = P((h, a) => h + a > line)
    add(id, name, 'goals', [['O', `${over} ${line}`, pOver], ['U', `${under} ${line}`, 1 - pOver]], { popular })
  }

  if (!(base[0] > 0 && base[1] > 0)) {
    const pBoth = P((h, a) => h > 0 && a > 0)
    add('btts', L('Both teams to score', 'Les deux équipes marquent'), 'goals', [['Y', yes, pBoth], ['N', no, 1 - pBoth]], {
      popular: 3,
    })
  }

  for (const [side, team, index] of [['home', home, 0], ['away', away, 1]] as const) {
    for (const line of [0.5, 1.5, 2.5].filter((l) => l > base[index]).slice(0, 2)) {
      const pOver = P((h, a) => (index === 0 ? h : a) > line)
      add(`tt-${side}-${line}`, `${team}: ${L('goals', 'buts')} ${line}`, 'goals', [
        ['O', `${over} ${line}`, pOver],
        ['U', `${under} ${line}`, 1 - pOver],
      ])
    }
  }

  const pOdd = P((h, a) => (h + a) % 2 === 1)
  add('oe', L('Total goals odd/even', 'Total de buts pair/impair'), 'goals', [
    ['O', L('Odd', 'Impair'), pOdd],
    ['E', L('Even', 'Pair'), 1 - pOdd],
  ])

  for (const line of [-1.5, 1.5, -2.5, 2.5]) {
    const pCover = P((h, a) => h + line > a)
    add(`ah-${lineId(line)}`, `${L('Handicap', 'Handicap')} ${signed(line)}`, 'handicap', [
      ['1', `${home} ${signed(line)}`, pCover],
      ['2', `${away} ${signed(-line)}`, 1 - pCover],
    ])
  }

  for (const [label, hStart, aStart] of [['1:0', 1, 0], ['0:1', 0, 1]] as const) {
    const adj = (h: number, a: number) => [h + hStart, a + aStart]
    add(`eh-${label.replace(':', '-')}`, `${L('European handicap', 'Handicap européen')} ${label}`, 'handicap', [
      ['1', home, P((h, a) => { const [x, y] = adj(h, a); return x > y })],
      ['X', draw, P((h, a) => { const [x, y] = adj(h, a); return x === y })],
      ['2', away, P((h, a) => { const [x, y] = adj(h, a); return x < y })],
    ])
  }

  const scores: [string, string, number, 0 | 1 | 2][] = []
  let covered = 0
  for (let i = 0; i <= 4; i++) {
    for (let j = 0; j <= 4; j++) {
      const p = grid[i][j]
      if (p < 0.006) continue
      const h = base[0] + i
      const a = base[1] + j
      covered += p
      scores.push([`${h}-${a}`, `${h}-${a}`, p, h > a ? 0 : h === a ? 1 : 2])
    }
  }
  scores.sort((x, y) => x[3] - y[3] || x[0].localeCompare(y[0], 'en', { numeric: true }))
  add('cs', L('Correct score', 'Score exact'), 'score', [...scores, ['other', L('Any other score', 'Autre score'), Math.max(0.01, 1 - covered)]], {
    popular: 7,
    layout: 'score',
  })

  if (!match.live) {
    const first = goalGrid(lh * 0.45, la * 0.45)
    const second = goalGrid(lh * 0.55, la * 0.55)
    const sign = (x: number) => (x > 0 ? '1' : x < 0 ? '2' : 'X')
    const htft = new Map<string, number>()
    const halves = { first: 0, second: 0, equal: 0 }
    first.forEach((row, i) => row.forEach((p1, j) => {
      second.forEach((row2, k) => row2.forEach((p2, l) => {
        const key = `${sign(i - j)}/${sign(i + k - j - l)}`
        htft.set(key, (htft.get(key) ?? 0) + p1 * p2)
        const g1 = i + j
        const g2 = k + l
        if (g1 > g2) halves.first += p1 * p2
        else if (g2 > g1) halves.second += p1 * p2
        else halves.equal += p1 * p2
      }))
    }))

    const P1 = (test: (h: number, a: number) => boolean) => probability(first, [0, 0], test)
    add('ht-1x2', L('Half-time result', 'Résultat à la mi-temps'), 'halves', [
      ['1', home, P1((h, a) => h > a)],
      ['X', draw, P1((h, a) => h === a)],
      ['2', away, P1((h, a) => h < a)],
    ], { popular: 6 })

    const order = ['1/1', '1/X', '1/2', 'X/1', 'X/X', 'X/2', '2/1', '2/X', '2/2']
    add('ht-ft', L('Half-time / full-time', 'Mi-temps / fin de match'), 'halves',
      order.map((k) => [k, k, htft.get(k) ?? 0.001] as [string, string, number]))

    for (const line of [0.5, 1.5]) {
      const pOver = P1((h, a) => h + a > line)
      add(`ht-ou-${line}`, L(`1st half goals ${line}`, `Buts 1re mi-temps ${line}`), 'halves', [
        ['O', `${over} ${line}`, pOver],
        ['U', `${under} ${line}`, 1 - pOver],
      ])
    }

    add('hsh', L('Highest scoring half', 'Mi-temps la plus prolifique'), 'halves', [
      ['1', L('1st half', '1re mi-temps'), halves.first],
      ['X', L('Equal', 'Égalité'), halves.equal],
      ['2', L('2nd half', '2e mi-temps'), halves.second],
    ])
  }

  if (goalsSoFar === 0) {
    const none = grid[0][0]
    add('fts', L('First team to score', 'Première équipe à marquer'), 'specials', [
      ['1', home, ((1 - none) * lh) / (lh + la)],
      ['N', L('No goal', 'Aucun but'), none],
      ['2', away, ((1 - none) * la) / (lh + la)],
    ])
  }

  for (const [side, team, conceding] of [['home', home, 1], ['away', away, 0]] as const) {
    if (base[conceding] > 0) continue
    const pClean = P((h, a) => (conceding === 1 ? a : h) === 0)
    add(`clean-${side}`, `${team}: ${L('clean sheet', 'cage inviolée')}`, 'specials', [['Y', yes, pClean], ['N', no, 1 - pClean]])
    const pNil = P((h, a) => (conceding === 1 ? h > a && a === 0 : a > h && h === 0))
    add(`nil-${side}`, `${team}: ${L('win to nil', 'gagne sans encaisser')}`, 'specials', [['Y', yes, pNil], ['N', no, 1 - pNil]])
  }

  cache.set(cacheKey, markets)
  return markets
}
