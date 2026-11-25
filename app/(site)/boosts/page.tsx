import type { Metadata } from 'next'
import { PageHeader } from '@/components/site/page-header'
import { BoostCard } from '@/components/sports/boost-card'
import { ACCA_BOOST_TIERS, BOOSTS } from '@/lib/data/sports'

export const metadata: Metadata = { title: 'Odds Boosts' }

export default function BoostsPage() {
  const superBoosts = BOOSTS.filter((b) => b.tier === 'Super Boost')
  const daily = BOOSTS.filter((b) => b.tier !== 'Super Boost')

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Priced above the market"
        title="Odds Boosts"
        description="Hand-picked selections where we pay more than anyone else. Boosted odds are locked when your bet is placed and a max stake applies per boost."
        image="/images/hero-football.png"
      />

      <section aria-labelledby="super" className="flex flex-col gap-3">
        <h2 id="super" className="text-lg font-black text-boost">
          Super Boosts
        </h2>
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {superBoosts.map((b) => (
            <BoostCard key={b.id} boost={b} />
          ))}
        </div>
      </section>

      <section aria-labelledby="daily" className="flex flex-col gap-3">
        <h2 id="daily" className="text-lg font-black">
          Daily Boosts
        </h2>
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {daily.map((b) => (
            <BoostCard key={b.id} boost={b} />
          ))}
        </div>
      </section>

      <section aria-labelledby="acca" className="rounded-xl bg-surface p-5">
        <h2 id="acca" className="text-lg font-black">
          Accumulator Boost
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Combine selections in a multiple and your winnings are boosted automatically on the bet slip.
        </p>
        <ol className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          {ACCA_BOOST_TIERS.map((t) => (
            <li key={t.legs} className="flex flex-col items-center gap-1 rounded-lg bg-surface-2 p-3">
              <span className="text-2xl font-black text-boost">+{t.pct}%</span>
              <span className="text-xs font-bold text-muted-foreground">{t.legs}+ selections</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
