import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBookingKeys } from '@/app/actions/booking'
import { LoadSlipButton } from '@/components/betslip/load-slip-button'
import { BackButton } from '@/components/site/back-button'
import { currentBucket } from '@/lib/data/live'
import { resolveSelection } from '@/lib/data/selections'
import { formatOdds } from '@/lib/format'
import { getT } from '@/lib/i18n/server'
import { bookingCode, decodeSlip } from '@/lib/share'

async function resolveCode(raw: string) {
  const upper = raw.toUpperCase()
  const stored = await getBookingKeys(upper)
  if (stored) return { keys: stored, label: upper }
  return { keys: decodeSlip(raw), label: bookingCode(raw) }
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params
  const [{ keys, label }, { t }] = await Promise.all([resolveCode(code), getT()])
  return {
    title: t('shared.eyebrow', { code: label }),
    description: t('shared.title', { count: keys.length, odds: '' }).trim(),
  }
}

export default async function SharedSlipPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const [{ keys, label }, { t }] = await Promise.all([resolveCode(code), getT()])
  const bucket = currentBucket()
  const selections = keys.map((k) => resolveSelection(k, bucket)).filter((s) => s !== null)
  if (selections.length === 0) notFound()

  const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1)

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <BackButton className="-mb-2" />
      <header className="flex flex-col gap-1 rounded-xl bg-brand p-5">
        <p className="text-xs font-extrabold uppercase tracking-widest text-primary">{t('shared.eyebrow', { code: label })}</p>
        <h1 className="text-balance text-2xl font-black">
          {t('shared.title', { count: selections.length, odds: formatOdds(totalOdds) })}
        </h1>
        <p className="text-sm leading-relaxed text-foreground/80">{t('shared.note')}</p>
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
