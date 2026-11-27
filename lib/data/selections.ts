import { currentBucket, liveOdds } from './live'
import { getMarkets } from './markets'
import { getBoost, getMatch } from './sports'

/** MKT covers every event-page market; its pick is "<marketId>~<outcomeId>". */
export type Market = '1X2' | 'OU' | 'BOOST' | 'MKT'

export interface ResolvedSelection {
  key: string
  matchId: string
  market: Market
  pick: string
  eventLabel: string
  marketLabel: string
  pickLabel: string
  odds: number
  was?: number
  maxStake?: number
  live?: boolean
}

export function selectionKey(matchId: string, market: Market, pick: string) {
  return `${matchId}|${market}|${pick}`
}

export function resolveSelection(key: string, bucket: number = currentBucket()): ResolvedSelection | null {
  const [matchId, market, pick] = key.split('|') as [string, Market, string]
  const match = getMatch(matchId)
  if (!match) return null
  const eventLabel = `${match.home} vs ${match.away}`
  const isLive = Boolean(match.live)
  const price = (base: number) => (isLive ? liveOdds(base, key, bucket) : base)

  if (market === '1X2') {
    const odds = match.odds[pick as '1' | 'X' | '2']
    if (!odds) return null
    const pickLabel = pick === '1' ? match.home : pick === '2' ? match.away : 'Draw'
    return {
      key,
      matchId,
      market,
      pick,
      eventLabel,
      marketLabel: match.odds.X ? 'Match result (1X2)' : 'Winner',
      pickLabel,
      odds: price(odds),
      live: isLive,
    }
  }

  if (market === 'OU' && match.ou) {
    if (pick !== 'O' && pick !== 'U') return null
    return {
      key,
      matchId,
      market,
      pick,
      eventLabel,
      marketLabel: `Total ${match.ou.line}`,
      pickLabel: `${pick === 'O' ? 'Over' : 'Under'} ${match.ou.line}`,
      odds: price(pick === 'O' ? match.ou.over : match.ou.under),
      live: isLive,
    }
  }

  if (market === 'MKT') {
    const [marketId, outcomeId] = pick.split('~')
    const found = getMarkets(match).find((m) => m.id === marketId)
    const outcome = found?.outcomes.find((o) => o.id === outcomeId)
    if (!found || !outcome) return null
    return {
      key,
      matchId,
      market,
      pick,
      eventLabel,
      marketLabel: found.name,
      pickLabel: outcome.label,
      odds: price(outcome.odds),
      live: isLive,
    }
  }

  if (market === 'BOOST') {
    const boost = getBoost(pick)
    if (!boost || boost.matchId !== matchId) return null
    return {
      key,
      matchId,
      market,
      pick,
      eventLabel,
      marketLabel: boost.tier,
      pickLabel: boost.isDraw ? 'Draw' : boost.title,
      odds: boost.odds,
      was: boost.was,
    }
  }

  return null
}
