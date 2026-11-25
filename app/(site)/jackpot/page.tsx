import type { Metadata } from 'next'
import { JackpotBoard } from '@/components/jackpot/jackpot-board'
import { PageHeader } from '@/components/site/page-header'
import { JACKPOT } from '@/lib/data/jackpot'
import { formatMoney } from '@/lib/format'
import { getSession } from '@/lib/session'

export const metadata: Metadata = { title: 'Mega Jackpot' }

export default async function JackpotPage() {
  const session = await getSession()

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow={`${JACKPOT.round} · Closes ${JACKPOT.closes}`}
        title={`${JACKPOT.name}: ${formatMoney(JACKPOT.pool)}`}
        description="Predict 1, X or 2 for all 15 matches. Get all 15 right and you win the jackpot. Add doubles or triples to cover more outcomes."
      >
        <ul className="mt-2 flex flex-wrap gap-2">
          {JACKPOT.prizes.map((p) => (
            <li key={p.correct} className="rounded-lg bg-black/25 px-3 py-1.5 text-xs font-bold">
              <span className="text-primary">{p.label}</span> {p.share}
            </li>
          ))}
        </ul>
      </PageHeader>
      <JackpotBoard isAuthed={Boolean(session?.user)} />
    </div>
  )
}
