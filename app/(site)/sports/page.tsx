import type { Metadata } from 'next'
import Link from 'next/link'
import { MatchList } from '@/components/sports/match-row'
import { PillStrip, Segmented, type StripItem } from '@/components/sports/sport-strip'
import { SportsSearch } from '@/components/sports/sports-search'
import { PromoSlot } from '@/components/site/promo-slot'
import { MAJOR_TOURNAMENTS, MATCHES, SPORTS, type Match } from '@/lib/data/sports'
import { getT } from '@/lib/i18n/server'
import {
  filterMatches,
  hasNarrowingFilter,
  matchingCompetitions,
  parseSportsQuery,
  sportsHref,
} from '@/lib/sports-query'

export const metadata: Metadata = {
  title: 'Sports betting',
  description: 'Football, basketball and more: today’s matches, live betting, major tournaments and team search.',
}

function groupByCompetition(matches: Match[]) {
  const key = (m: Match) => `${m.country}|${m.league}`
  return [...Map.groupBy(matches, key)].map(([groupKey, items]) => {
    const sharedName = new Set(matches.filter((m) => m.league === items[0].league).map((m) => m.country)).size > 1
    const title = sharedName && items[0].country ? `${items[0].country} · ${items[0].league}` : items[0].league
    return { key: groupKey, title, items }
  })
}

export default async function SportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [query, { t }] = await Promise.all([searchParams.then(parseSportsQuery), getT()])
  const matches = filterMatches(query)
  const narrowed = hasNarrowingFilter(query)
  const activeSport = SPORTS.find((s) => s.id === query.sport)

  const perSport = Map.groupBy(filterMatches(query, 'sport'), (m) => m.sport)
  const sportItems: StripItem[] = [
    { key: 'all', label: t('sports.all'), href: sportsHref(query, { sport: undefined }), active: !query.sport },
    ...SPORTS.map((s) => ({
      key: s.id,
      label: s.name,
      count: narrowed ? (perSport.get(s.id)?.length ?? 0) : s.count,
      href: sportsHref(query, { sport: s.id }),
      active: query.sport === s.id,
    })).filter((item) => item.active || !narrowed || item.count > 0),
  ]

  const timeScope = filterMatches(query, 'when')
  const now = Date.now()
  const whenItems: StripItem[] = [
    { key: 'all', label: t('sports.when.all'), href: sportsHref(query, { live: false, when: undefined }), active: !query.live && !query.when },
    {
      key: 'live',
      label: t('sports.when.live'),
      count: timeScope.filter((m) => m.live).length,
      href: sportsHref(query, { live: true, when: undefined }),
      active: query.live,
    },
    {
      key: 'today',
      label: t('sports.when.today'),
      count: filterMatches({ ...query, live: false, when: 'today' }, undefined, now).length,
      href: sportsHref(query, { live: false, when: 'today' }),
      active: query.when === 'today',
    },
    {
      key: '3h',
      label: t('sports.when.3h'),
      count: filterMatches({ ...query, live: false, when: '3h' }, undefined, now).length,
      href: sportsHref(query, { live: false, when: '3h' }),
      active: query.when === '3h',
    },
  ]

  const leaguesInScope = new Set(MATCHES.filter((m) => !query.sport || m.sport === query.sport).map((m) => m.league))
  const tournaments = [...new Set(MAJOR_TOURNAMENTS)].filter((l) => leaguesInScope.has(l))
  const competitions = matchingCompetitions(query)
  const groups = groupByCompetition(matches)
  const playableNames = SPORTS.filter((s) => s.playable).map((s) => s.name.toLowerCase())

  const title = query.league ?? (query.live ? t('sports.liveTitle') : activeSport?.name ?? t('sports.title'))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-balance text-2xl font-black">{title}</h1>
          {query.league && (
            <Link href={sportsHref(query, { league: undefined })} className="shrink-0 text-sm font-bold text-primary hover:underline">
              {t('sports.allCompetitions')}
            </Link>
          )}
        </div>
        <SportsSearch
          query={query}
          labels={{
            placeholder: t('sports.search'),
            label: t('sports.searchLabel'),
            submit: t('sports.searchSubmit'),
            clear: t('sports.clear'),
          }}
        />
        <PillStrip label={t('sports.sportsNav')} items={sportItems} />
        <Segmented label={t('sports.whenNav')} items={whenItems} />
      </div>

      {!query.league && !query.q && tournaments.length > 0 && (
        <section aria-labelledby="major-tournaments" className="flex flex-col gap-2">
          <h2 id="major-tournaments" className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            {t('sports.major')}
          </h2>
          <PillStrip
            label={t('sports.major')}
            items={tournaments.map((l) => ({ key: l, label: l, href: sportsHref(query, { league: l }), active: false }))}
          />
        </section>
      )}

      {competitions.length > 0 && (
        <section aria-labelledby="competition-hits" className="flex flex-col gap-2">
          <h2 id="competition-hits" className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            {t('sports.competitions')}
          </h2>
          <PillStrip
            label={t('sports.competitions')}
            items={competitions.map((c) => ({
              key: c.league,
              label: c.league,
              count: c.count,
              href: sportsHref(query, { league: c.league, q: '' }),
              active: false,
            }))}
          />
        </section>
      )}

      {query.q && matches.length > 0 && (
        <p className="text-sm font-semibold text-muted-foreground" aria-live="polite">
          {t('sports.results', { n: matches.length, q: query.q })}
        </p>
      )}

      {!query.q && <PromoSlot placement="sports" />}

      {groups.length > 0 ? (
        groups.map((g) => <MatchList key={g.key} title={g.title} matches={g.items} />)
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-surface p-8 text-center">
          <p className="text-pretty text-sm text-muted-foreground">
            {activeSport && !activeSport.playable
              ? t('sports.notInPreview', { sport: activeSport.name, n: activeSport.count, list: playableNames.join(' & ') })
              : query.q
                ? t('sports.emptySearch', { q: query.q })
                : t('sports.empty')}
          </p>
          <Link href="/sports" className="text-sm font-bold text-primary hover:underline">
            {t('sports.reset')}
          </Link>
        </div>
      )}
    </div>
  )
}
