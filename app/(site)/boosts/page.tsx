import type { Metadata } from 'next'
import { PageHeader } from '@/components/site/page-header'
import { PromoSlot } from '@/components/site/promo-slot'
import { BoostCard } from '@/components/sports/boost-card'
import { ACCA_BOOST_TIERS, BOOST_EVENTS } from '@/lib/data/sports'
import { getT } from '@/lib/i18n/server'

export const metadata: Metadata = { title: 'Odds Boosts' }

export default async function BoostsPage() {
  const { t } = await getT()
  const superBoosts = BOOST_EVENTS.filter((e) => e.tier === 'Super Boost')
  const daily = BOOST_EVENTS.filter((e) => e.tier !== 'Super Boost')

  const groups = [
    { id: 'super', title: t('boosts.super'), events: superBoosts, accent: true },
    { id: 'daily', title: t('boosts.daily'), events: daily, accent: false },
  ].filter((g) => g.events.length > 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={t('boosts.eyebrow')}
        title={t('boosts.title')}
        description={t('boosts.description')}
        image="/images/hero-football.png"
      />

      <PromoSlot placement="boosts" />

      {groups.length === 0 && (
        <p className="rounded-xl bg-surface p-5 text-sm leading-relaxed text-muted-foreground">{t('boosts.empty')}</p>
      )}

      {groups.map((g) => (
        <section key={g.id} aria-labelledby={g.id} className="flex flex-col gap-3">
          <h2 id={g.id} className={g.accent ? 'text-lg font-black text-boost' : 'text-lg font-black'}>
            {g.title}
          </h2>
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {g.events.map((e) => (
              <BoostCard key={e.matchId} event={e} />
            ))}
          </div>
        </section>
      ))}

      <section aria-labelledby="acca" className="flex flex-col gap-4 rounded-xl bg-surface p-5">
        <div className="flex flex-col gap-1">
          <h2 id="acca" className="text-lg font-black">
            {t('boosts.acca')}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{t('boosts.accaBody')}</p>
        </div>
        <ol className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {ACCA_BOOST_TIERS.map((tier) => (
            <li key={tier.legs} className="flex flex-col items-center gap-1 rounded-lg bg-surface-2 p-3">
              <span className="text-2xl font-black text-boost">+{tier.pct}%</span>
              <span className="text-xs font-bold text-muted-foreground">{t('boosts.legs', { n: tier.legs })}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
