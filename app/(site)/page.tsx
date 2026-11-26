import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { HomeTiles, LeagueChips } from '@/components/home/home-tiles'
import { BoostCard } from '@/components/sports/boost-card'
import { MatchList } from '@/components/sports/match-row'
import { BOOST_EVENTS, BOOSTS } from '@/lib/data/sports'
import { planHome } from '@/lib/home-plan'
import { getT } from '@/lib/i18n/server'

export default async function HomePage() {
  const { t } = await getT()
  const plan = planHome()
  const topBoosts = [...BOOSTS].sort((a, b) => b.odds / b.was - a.odds / a.was).slice(0, 3)
  const heroEvent = BOOST_EVENTS[0]
  const hero = heroEvent && [...heroEvent.picks].sort((a, b) => b.odds / b.was - a.odds / a.was)[0]


  return (
    <div className="flex flex-col gap-5">
      <section className="relative overflow-hidden rounded-xl bg-brand" aria-label={t('home.featured')}>
        <Image
          src="/images/hero-football.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 900px, 100vw"
          className="object-cover object-left opacity-70"
        />
        <div className="relative ml-auto flex min-h-56 max-w-md flex-col justify-center gap-3 bg-gradient-to-l from-brand via-brand/85 to-transparent p-6 md:min-h-72 md:p-8">
          {hero ? (
            <>
              <p className="text-xs font-extrabold uppercase tracking-widest text-primary">
                {heroEvent.league} · {t('boost.ends', { when: heroEvent.endsIn })}
              </p>
              <h1 className="text-balance text-3xl font-black leading-tight md:text-4xl">
                {t('boost.boostedTo', { pick: hero.isDraw ? t('boost.draw') : hero.title })}{' '}
                <span className="text-boost">{hero.odds.toFixed(2)}</span>
              </h1>
              <p className="text-sm leading-relaxed text-white/80">
                {t('boost.was', { match: `${heroEvent.home} vs ${heroEvent.away}`, was: hero.was.toFixed(2) })}
              </p>
            </>
          ) : (
            <h1 className="text-balance text-3xl font-black leading-tight md:text-4xl">{t('home.heroFallback')}</h1>
          )}
          <div className="flex flex-wrap gap-2">
            <Link href="/boosts" className={buttonVariants({ size: 'lg', className: 'font-extrabold' })}>
              {t('home.betBoost')}
            </Link>
            <Link
              href="/promotions"
              className={buttonVariants({ size: 'lg', variant: 'outline', className: 'font-extrabold' })}
            >
              {t('home.welcome')}
            </Link>
          </div>
        </div>
      </section>

      <HomeTiles tiles={plan.tiles} t={t} />

      {BOOST_EVENTS.length > 0 && (
        <section aria-labelledby="boosts-heading" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 id="boosts-heading" className="text-lg font-black text-boost">
              {t('home.boostsTitle')}
            </h2>
            <Link href="/boosts" className="flex shrink-0 items-center text-sm font-bold text-primary">
              {t('home.allBoosts')} <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="no-scrollbar -mx-3 flex snap-x gap-3 overflow-x-auto px-3 lg:mx-0 lg:grid lg:grid-cols-3 lg:px-0">
            {topBoosts.map((b) => (
              <BoostCard key={b.id} boost={b} className="w-[85%] max-w-80 shrink-0 snap-start lg:w-auto lg:max-w-none" />
            ))}
          </div>
        </section>
      )}

      {plan.sections.map((section) =>
        section.kind === 'leagues' ? (
          <LeagueChips key="leagues" leagues={section.leagues} t={t} />
        ) : (
          <MatchList
            key={section.key}
            title={'key' in section.title ? t(section.title.key) : section.title.text}
            matches={section.matches}
            action={
              <Link href={section.href} className="text-xs font-bold text-primary">
                {section.live ? t('home.viewAllLive') : section.key === 'football' ? t('home.allMatches') : t('home.seeAll')}
              </Link>
            }
          />
        ),
      )}
    </div>
  )
}
