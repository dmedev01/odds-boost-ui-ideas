import type { Metadata } from 'next'
import { DrawPicker } from '@/components/lotteries/draw-picker'
import { InstantCard } from '@/components/lotteries/instant-card'
import { PageHeader } from '@/components/site/page-header'
import { PromoSlot } from '@/components/site/promo-slot'
import { DRAW_LOTTERIES, INSTANT_GAMES } from '@/lib/data/lotteries'
import { getSession } from '@/lib/session'

export const metadata: Metadata = { title: 'Lotteries' }

export default async function LotteriesPage() {
  const session = await getSession()
  const isAuthed = Boolean(session?.user)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Draw & instant"
        title="Lotteries"
        description="Pick your numbers for the next scheduled draw, or reveal an instant ticket and know straight away."
      />

      <PromoSlot placement="lotteries" />

      <section aria-labelledby="draw" className="flex flex-col gap-3">
        <h2 id="draw" className="text-lg font-black">
          Draw lotteries
        </h2>
        <DrawPicker lotteries={DRAW_LOTTERIES} isAuthed={isAuthed} />
      </section>

      <section aria-labelledby="instant" className="flex flex-col gap-3">
        <h2 id="instant" className="text-lg font-black">
          Instant lotteries
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {INSTANT_GAMES.map((g) => (
            <InstantCard key={g.id} game={g} isAuthed={isAuthed} />
          ))}
        </div>
      </section>
    </div>
  )
}
