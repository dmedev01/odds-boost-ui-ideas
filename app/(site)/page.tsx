import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Dices, Rocket, Trophy } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { HorseIcon } from '@/components/site/horse-icon'
import { BoostCard } from '@/components/sports/boost-card'
import { MatchList } from '@/components/sports/match-row'
import { JACKPOT } from '@/lib/data/jackpot'
import { BOOST_EVENTS, BOOSTS, MATCHES } from '@/lib/data/sports'
import { formatMoney } from '@/lib/format'
import { getT } from '@/lib/i18n/server'

export default async function HomePage() {
  const { t } = await getT()
  const live = MATCHES.filter((m) => m.live)
  const upcoming = MATCHES.filter((m) => !m.live && m.sport === 'football').slice(0, 6)
  const topBoosts = [...BOOSTS].sort((a, b) => b.odds / b.was - a.odds / a.was).slice(0, 3)
  const heroEvent = BOOST_EVENTS[0]
  const hero = heroEvent && [...heroEvent.picks].sort((a, b) => b.odds / b.was - a.odds / a.was)[0]

  const products = [
    { href: '/jackpot', label: t('home.jackpot'), sub: formatMoney(JACKPOT.pool), icon: Trophy },
    { href: '/hippique', label: t('home.hippique'), sub: t('home.hippiqueSub'), icon: HorseIcon },
    { href: '/virtuals', label: t('home.virtuals'), sub: t('home.virtualsSub'), icon: Rocket },
    { href: '/lotteries', label: t('home.lotteries'), sub: t('home.lotteriesSub'), icon: Dices },
  ]

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

      <nav aria-label={t('home.games')} className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {products.map(({ href, label, sub, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-xl bg-surface p-3 transition-colors hover:bg-surface-2"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand text-primary">
              <Icon className="size-5" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-extrabold">{label}</span>
              <span className="truncate text-xs text-muted-foreground">{sub}</span>
            </span>
          </Link>
        ))}
      </nav>

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

      <MatchList
        title={t('home.liveNow')}
        matches={live}
        action={
          <Link href="/sports?live=1" className="text-xs font-bold text-primary">
            {t('home.viewAllLive')}
          </Link>
        }
      />
      <MatchList
        title={t('home.topFootball')}
        matches={upcoming}
        action={
          <Link href="/sports" className="text-xs font-bold text-primary">
            {t('home.allMatches')}
          </Link>
        }
      />
    </div>
  )
}
