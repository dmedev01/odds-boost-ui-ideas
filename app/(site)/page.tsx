import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Dices, Rocket, Trophy } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { HorseIcon } from '@/components/site/horse-icon'
import { BoostCard } from '@/components/sports/boost-card'
import { MatchList } from '@/components/sports/match-row'
import { JACKPOT } from '@/lib/data/jackpot'
import { BOOSTS, MATCHES } from '@/lib/data/sports'
import { formatMoney } from '@/lib/format'

const PRODUCTS = [
  { href: '/jackpot', label: 'Mega Jackpot', sub: formatMoney(JACKPOT.pool), icon: Trophy },
  { href: '/hippique', label: 'Hippique', sub: 'Quinté+ today', icon: HorseIcon },
  { href: '/virtuals', label: 'Virtuals', sub: 'Crash & leagues', icon: Rocket },
  { href: '/lotteries', label: 'Lotteries', sub: 'Draw & instant', icon: Dices },
]

export default function HomePage() {
  const live = MATCHES.filter((m) => m.live)
  const upcoming = MATCHES.filter((m) => !m.live && m.sport === 'football').slice(0, 6)

  return (
    <div className="flex flex-col gap-5">
      <section className="relative overflow-hidden rounded-xl bg-brand" aria-label="Featured offer">
        <Image
          src="/images/hero-football.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 900px, 100vw"
          className="object-cover object-left opacity-70"
        />
        <div className="relative ml-auto flex min-h-56 max-w-md flex-col justify-center gap-3 bg-gradient-to-l from-brand via-brand/85 to-transparent p-6 md:min-h-72 md:p-8">
          <p className="text-xs font-extrabold uppercase tracking-widest text-primary">Champions League tonight</p>
          <h1 className="text-balance text-3xl font-black leading-tight md:text-4xl">
            PSG to win & BTTS boosted to <span className="text-boost">7.50</span>
          </h1>
          <p className="text-sm leading-relaxed text-white/80">Was 4.75. Max stake 25 000 FCFA.</p>
          <div className="flex gap-2">
            <Link href="/boosts" className={buttonVariants({ size: 'lg', className: 'font-extrabold' })}>
              Bet the boost
            </Link>
            <Link href="/promotions" className={buttonVariants({ size: 'lg', variant: 'outline', className: 'font-extrabold' })}>
              Welcome bonus
            </Link>
          </div>
        </div>
      </section>

      <nav aria-label="Games" className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {PRODUCTS.map(({ href, label, sub, icon: Icon }) => (
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

      <section aria-labelledby="boosts-heading" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 id="boosts-heading" className="text-lg font-black">
            Today&apos;s <span className="text-boost">Odds Boosts</span>
          </h2>
          <Link href="/boosts" className="flex items-center text-sm font-bold text-primary">
            All boosts <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="no-scrollbar -mx-3 flex snap-x gap-3 overflow-x-auto px-3 lg:mx-0 lg:grid lg:grid-cols-3 lg:px-0">
          {BOOSTS.slice(0, 3).map((b) => (
            <BoostCard key={b.id} boost={b} className="w-72 shrink-0 snap-start lg:w-auto" />
          ))}
        </div>
      </section>

      <MatchList
        title="Live now"
        matches={live}
        action={
          <Link href="/sports?live=1" className="text-xs font-bold text-primary">
            View all live
          </Link>
        }
      />
      <MatchList
        title="Top football"
        matches={upcoming}
        action={
          <Link href="/sports" className="text-xs font-bold text-primary">
            All matches
          </Link>
        }
      />
    </div>
  )
}
