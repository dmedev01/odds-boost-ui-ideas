import type { Metadata } from 'next'
import { LiveDashboard } from '@/components/live/live-dashboard'
import { MATCHES, SPORTS } from '@/lib/data/sports'
import { getT } from '@/lib/i18n/server'

export const metadata: Metadata = {
  title: 'Live betting',
  description: 'Every match in play right now, with live scores and odds that update as the game moves.',
}

const STARTING_SOON = 6

export default async function LivePage({ searchParams }: { searchParams: Promise<{ sport?: string }> }) {
  const [{ sport }, { t }] = await Promise.all([searchParams, getT()])
  const now = Date.now()

  const live = MATCHES.filter((m) => m.live)
  const liveSports = SPORTS.filter((s) => live.some((m) => m.sport === s.id))
  const activeSport = liveSports.some((s) => s.id === sport) ? sport : undefined
  const shown = activeSport ? live.filter((m) => m.sport === activeSport) : live

  const groups = [...Map.groupBy(shown, (m) => `${m.country} · ${m.league}`)].map(([title, matches]) => ({
    title,
    matches,
  }))

  const startingSoon = MATCHES.filter((m) => !m.live && m.startsAt > now)
    .sort((a, b) => a.startsAt - b.startsAt)
    .slice(0, STARTING_SOON)

  return (
    <LiveDashboard
      title={t('sports.liveTitle')}
      summary={t('live.count', { n: live.length })}
      filters={[
        { key: 'all', label: t('live.all'), count: live.length, href: '/live', active: !activeSport },
        ...liveSports.map((s) => ({
          key: s.id,
          label: s.name,
          count: live.filter((m) => m.sport === s.id).length,
          href: `/live?sport=${encodeURIComponent(s.id)}`,
          active: s.id === activeSport,
        })),
      ]}
      groups={groups}
      startingSoon={startingSoon}
      labels={{
        filters: t('live.filters'),
        empty: t('live.empty'),
        emptyHint: t('live.emptyHint'),
        soon: t('live.soon'),
        allSports: t('live.browse'),
      }}
    />
  )
}
