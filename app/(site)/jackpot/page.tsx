import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Lock } from 'lucide-react'
import { JackpotBoard } from '@/components/jackpot/jackpot-board'
import { JackpotCountdown } from '@/components/jackpot/jackpot-countdown'
import { PageHeader } from '@/components/site/page-header'
import { PromoSlot } from '@/components/site/promo-slot'
import { buttonVariants } from '@/components/ui/button'
import { JACKPOT, jackpotClosesAt } from '@/lib/data/jackpot'
import { formatMoney } from '@/lib/format'
import { getSession } from '@/lib/session'
import { isProductEnabled } from '@/lib/site-config'

export const metadata: Metadata = { title: 'Mega Jackpot' }

export default async function JackpotPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (!isProductEnabled('jackpot')) notFound()
  const [session, { state }] = await Promise.all([getSession(), searchParams])

  const now = new Date()
  const closesAt =
    state === 'closed'
      ? new Date(now.getTime() - 60_000)
      : state === 'closing'
        ? new Date(now.getTime() + 42 * 60_000)
        : jackpotClosesAt(now)
  const closed = closesAt <= now

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow={JACKPOT.round}
        title={`${JACKPOT.name}: ${formatMoney(JACKPOT.pool)}`}
        description="Predict 1, X or 2 for all 15 matches. Get all 15 right and you win the jackpot. Add doubles or triples to cover more outcomes."
      >
        {closed ? (
          <p className="mt-3 flex items-center gap-1.5 text-sm font-bold">
            <Lock className="size-4" aria-hidden="true" />
            Entries closed {JACKPOT.closes}
          </p>
        ) : (
          <JackpotCountdown closesAt={closesAt.toISOString()} closesLabel={JACKPOT.closes} />
        )}
        <ul className="mt-3 flex flex-wrap gap-2">
          {JACKPOT.prizes.map((p) => (
            <li key={p.correct} className="rounded-lg bg-black/25 px-3 py-1.5 text-xs font-bold">
              <span className="text-primary">{p.label}</span> {p.share}
            </li>
          ))}
        </ul>
      </PageHeader>

      <PromoSlot placement="jackpot" />
      {closed ? (
        <section className="flex flex-col items-start gap-3 rounded-xl bg-card p-5 text-card-foreground">
          <h2 className="text-lg font-bold">This round is closed</h2>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            {`No more tickets can be placed for ${JACKPOT.round}. Tickets already placed are safe; you can follow them in My bets. Results are published after the last match, and the next round opens soon after.`}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/my-bets" className={buttonVariants()}>
              My bets
            </Link>
            <Link href="/results" className={buttonVariants({ variant: 'secondary' })}>
              Results
            </Link>
          </div>
        </section>
      ) : (
        <JackpotBoard isAuthed={Boolean(session?.user)} />
      )}
    </div>
  )
}
