import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { EventHeader, LeagueStrip } from '@/components/event/event-header'
import { MarketBoard } from '@/components/event/market-board'
import { getMarkets } from '@/lib/data/markets'
import { MATCHES, getMatch } from '@/lib/data/sports'
import { getLocale, getT } from '@/lib/i18n/server'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const match = getMatch(id)
  if (!match) return { title: 'Match not found' }
  return {
    title: `${match.home} vs ${match.away} odds`,
    description: `All markets for ${match.home} vs ${match.away} (${match.league}): result, over/under, handicap, correct score and more.`,
  }
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const match = getMatch(id)
  if (!match) notFound()

  const [locale, { t }] = await Promise.all([getLocale(), getT()])
  const markets = getMarkets(match, locale)
  const sameLeague = MATCHES.filter((m) => m.league === match.league && m.id !== match.id).slice(0, 10)
  const otherLive = match.live ? MATCHES.filter((m) => m.live && m.id !== match.id).slice(0, 10) : []

  return (
    <div className="flex flex-col gap-4">
      {otherLive.length > 0 && <LeagueStrip title={t('live.others')} matches={otherLive} />}
      <EventHeader
        match={match}
        marketCount={t('event.markets', { n: markets.length })}
        labels={{ back: t('event.back', { league: match.league }), live: t('event.live') }}
      />
      <MarketBoard event={`${match.home} vs ${match.away}`} markets={markets} live={Boolean(match.live)} />
      <LeagueStrip title={t('event.more', { league: match.league })} matches={sameLeague} />
    </div>
  )
}
