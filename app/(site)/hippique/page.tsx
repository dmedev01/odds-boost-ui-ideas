import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RaceBoard } from '@/components/hippique/race-board'
import { PageHeader } from '@/components/site/page-header'
import { PromoSlot } from '@/components/site/promo-slot'
import { RACES } from '@/lib/data/hippique'
import { getSession } from '@/lib/session'
import { isProductEnabled } from '@/lib/site-config'

export const metadata: Metadata = { title: 'Hippique – horse racing' }

export default async function HippiquePage() {
  if (!isProductEnabled('hippique')) notFound()
  const session = await getSession()
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="PMU-style pari mutuel"
        title="Hippique"
        description="Bet on today's trotting and flat meetings. Simple Gagnant pays fixed odds; Placé, Couplé, Tiercé, Quarté+ and Quinté+ pay from the shared pool."
        image="/images/hippique.png"
      />

      <PromoSlot placement="hippique" />
      <RaceBoard races={RACES} isAuthed={Boolean(session?.user)} />
    </div>
  )
}
