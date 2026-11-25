import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LoadSlipButton } from '@/components/betslip/load-slip-button'
import { currentBucket } from '@/lib/data/live'
import { resolveSelection } from '@/lib/data/selections'
import { formatOdds } from '@/lib/format'
import { bookingCode, decodeSlip } from '@/lib/share'

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params
  const count = decodeSlip(code).length
  return {
    title: `Shared slip ${bookingCode(code)}`,
    description: `A friend shared a ${count}-pick bet slip. Open it and add it to your slip in one tap.`,
  }
}

export default async function SharedSlipPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const keys = decodeSlip(code)
  const bucket = currentBucket()
  const selections = keys.map((k) => resolveSelection(k, bucket)).filter((s) => s !== null)
  if (selections.length === 0) notFound()

  const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1)

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <header className="flex flex-col gap-1 rounded-xl bg-brand p-5">
        <p className="text-xs font-extrabold uppercase tracking-widest text-primary">Shared slip · {bookingCode(code)}</p>
        <h1 className="text-balance text-2xl font-black">
          {selections.length} {selections.length === 1 ? 'pick' : 'picks'} at {formatOdds(totalOdds)}
        </h1>
        <p className="text-sm leading-relaxed text-foreground/80">Odds below are today&apos;s live prices, not the ones your friend saw.</p>
      </header>

      <ul className="flex flex-col overflow-hidden rounded-xl bg-surface">
        {selections.map((s) => (
          <li key={s.key} className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0">
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-bold">{s.pickLabel}</span>
              <span className="truncate text-xs text-muted-foreground">
                {s.live && <span className="mr-1 font-extrabold text-destructive">LIVE</span>}
                {s.marketLabel} · {s.eventLabel}
              </span>
            </div>
            <span className="shrink-0 text-sm font-extrabold">{formatOdds(s.odds)}</span>
          </li>
        ))}
      </ul>

      <LoadSlipButton keys={selections.map((s) => s.key)} />
    </div>
  )
}
