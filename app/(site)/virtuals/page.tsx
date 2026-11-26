import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Clock } from 'lucide-react'
import { PageHeader } from '@/components/site/page-header'
import { PromoSlot } from '@/components/site/promo-slot'
import { RocketCrash } from '@/components/virtuals/rocket-crash'
import { VIRTUAL_GAMES } from '@/lib/data/catalog'
import { isProductEnabled } from '@/lib/site-config'

export const metadata: Metadata = { title: 'Virtuals & crash games' }

const CATEGORIES = ['Crash', 'Virtual Sports', 'Instant Win'] as const

export default function VirtualsPage() {
  if (!isProductEnabled('virtuals')) notFound()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Powered by Eurovirtual"
        title="Virtuals & Crash"
        description="Non-stop virtual leagues, races and crash games. Rounds settle in seconds, 24/7."
        image="/images/virtuals.png"
      />

      <PromoSlot placement="virtuals" />

      <RocketCrash />

      {CATEGORIES.map((cat) => (
        <section key={cat} aria-labelledby={`cat-${cat}`} className="flex flex-col gap-3">
          <h2 id={`cat-${cat}`} className="text-lg font-black">
            {cat}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            {VIRTUAL_GAMES.filter((g) => g.category === cat).map((g) => (
              <li key={g.id} className="flex flex-col gap-2 rounded-xl bg-surface p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold">{g.name}</h3>
                  <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-extrabold uppercase">Eurovirtual</span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{g.description}</p>
                <p className="mt-auto flex items-center gap-1 text-xs font-bold text-primary">
                  <Clock className="size-3" aria-hidden="true" />
                  {g.cycle}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
