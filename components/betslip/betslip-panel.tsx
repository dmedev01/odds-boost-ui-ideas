'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { CheckCircle2, ShieldCheck, Ticket, Trash2, X } from 'lucide-react'
import { BoltIcon } from '@/components/site/bolt-icon'
import { Button, buttonVariants } from '@/components/ui/button'
import { useLiveBucket } from '@/components/live/live-clock'
import { placeSportsBet } from '@/app/actions/bets'
import { resolveSelection } from '@/lib/data/selections'
import { accaBoostPct } from '@/lib/data/sports'
import { formatMoney, formatOdds, STAKE_MIN } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useI18n } from '@/components/i18n/i18n-provider'
import { BookingCodeInput } from './booking-code-input'
import { BoostLadder } from './boost-ladder'
import { useBetSlip } from './betslip-provider'
import { SlipShare } from './slip-share'
import { SlipTopUp } from './slip-topup'
import { SlipModeTabs, SystemSizePicker, TicketList } from './slip-modes'
import {
  availableModes,
  buildTickets,
  capWin,
  MAX_POTENTIAL_WIN,
  MAX_TICKETS,
  type SlipMode,
  summarizeTickets,
  systemSizes,
  ticketCount,
} from '@/lib/slip-modes'

const QUICK_STAKES = [500, 1000, 2500, 5000]

export function BetSlipPanel({ className, headerClassName }: { className?: string; headerClassName?: string }) {
  const { keys, remove, clear, isAuthed, balance, limitStatus } = useBetSlip()
  const router = useRouter()
  const { t } = useI18n()
  const bucket = useLiveBucket()
  const [mode, setMode] = useState<SlipMode>('multi')
  const [systemSize, setSystemSize] = useState(2)
  const [stake, setStake] = useState(1000)
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)
  const [placed, setPlaced] = useState<{ keys: string[]; odds: number } | null>(null)
  const [pending, startTransition] = useTransition()

  const selections = useMemo(
    () => keys.map((k) => resolveSelection(k, bucket)).filter((s) => s !== null),
    [keys, bucket],
  )
  const hasBoost = selections.some((s) => s.market === 'BOOST')
  const modes = availableModes(selections)
  const effectiveMode: SlipMode = modes.includes(mode) ? mode : modes.includes('multi') ? 'multi' : modes[0]
  const sizes = systemSizes(selections.length)
  const effectiveSize = sizes.includes(systemSize) ? systemSize : (sizes[0] ?? 2)
  const isCombo = effectiveMode === 'system' || effectiveMode === 'integral'

  const count = ticketCount(selections, effectiveMode, effectiveSize)
  const tooManyTickets = count > MAX_TICKETS
  const tickets = useMemo(
    () => (isCombo && !tooManyTickets ? buildTickets(selections, effectiveMode, effectiveSize) : []),
    [isCombo, tooManyTickets, selections, effectiveMode, effectiveSize],
  )
  const summary = summarizeTickets(tickets, stake)

  const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1)
  const bonusPct = effectiveMode === 'multi' ? accaBoostPct(selections.length) : 0
  const totalStake = stake * count
  const boostExtra = effectiveMode === 'multi' ? ((stake * totalOdds - stake) * bonusPct) / 100 : 0
  const potential =
    effectiveMode === 'single'
      ? selections.reduce((sum, s) => sum + capWin(stake * s.odds), 0)
      : effectiveMode === 'multi'
        ? capWin(stake * totalOdds + boostExtra)
        : summary.sum
  const shareOdds = isCombo ? summary.maxOdds : totalOdds

  const shortfall = isAuthed && balance !== null ? totalStake - balance : 0
  const remainingToday =
    limitStatus?.limit != null ? Math.max(0, limitStatus.limit - limitStatus.staked) : null
  const overLimit = remainingToday !== null && totalStake > remainingToday

  async function place() {
    const seenOdds = Object.fromEntries(selections.map((s) => [s.key, s.odds]))
    const result = await placeSportsBet({ keys, stake, mode: effectiveMode, systemSize: effectiveSize, seenOdds })
    if (result.ok) {
      setFeedback({ ok: true, text: result.message })
      setPlaced({ keys, odds: shareOdds })
      clear()
      router.refresh()
    } else {
      setFeedback({ ok: false, text: result.error })
    }
  }

  function submit() {
    setFeedback(null)
    setPlaced(null)
    startTransition(place)
  }

  return (
    <section aria-labelledby="betslip-title" className={cn('flex flex-col rounded-xl bg-surface', className)}>
      <header className={cn('flex items-center justify-between rounded-t-xl bg-brand px-4 py-3', headerClassName)}>
        <h2 id="betslip-title" className="flex items-center gap-2 font-extrabold">
          <Ticket className="size-4" aria-hidden="true" />
          {t('slip.title')}
          <span className="rounded-full bg-primary px-2 text-xs leading-5">{selections.length}</span>
        </h2>
        {selections.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-1 text-xs text-foreground/80 hover:text-foreground"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            {t('slip.clear')}
          </button>
        )}
      </header>

      {feedback && (
        <div
          role="status"
          className={cn(
            'mx-3 mt-3 flex flex-col gap-2 rounded-lg px-3 py-2 text-sm font-semibold',
            feedback.ok ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive',
          )}
        >
          <p className="flex items-center gap-2">
            {feedback.ok && <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />}
            {feedback.text}
            {feedback.ok && (
              <Link href="/my-bets" className="ml-auto underline underline-offset-2">
                {t('slip.view')}
              </Link>
            )}
          </p>
          {placed && <SlipShare keys={placed.keys} totalOdds={placed.odds} className="text-foreground" />}
        </div>
      )}

      {selections.length === 0 ? (
        <div className="flex flex-col gap-5 p-4">
          <div className="flex flex-col items-center gap-2 pt-4 text-center">
            <Ticket className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="font-bold">{t('slip.emptyTitle')}</p>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{t('slip.emptyBody')}</p>
          </div>
          <BookingCodeInput className="border-t border-border pt-4" />
        </div>
      ) : (
        <>
          {selections.length > 1 && (
            <SlipModeTabs
              modes={hasBoost ? ['single', 'multi'] : modes}
              active={effectiveMode}
              disabled={hasBoost ? ['multi'] : []}
              onChange={setMode}
            />
          )}
          {hasBoost && selections.length > 1 && (
            <p className="mx-3 mt-2 text-xs text-muted-foreground">{t('slip.boostSinglesOnly')}</p>
          )}
          {effectiveMode === 'system' && (
            <SystemSizePicker n={selections.length} sizes={sizes} value={effectiveSize} onChange={setSystemSize} />
          )}
          {effectiveMode === 'integral' && (
            <p className="mx-3 mt-2 text-pretty text-xs leading-relaxed text-muted-foreground">
              {t('slip.integralNote', { count })}
            </p>
          )}

          <ul className="flex max-h-[36vh] flex-col gap-2 overflow-y-auto p-3">
            {selections.map((s) => (
              <li
                key={s.key}
                className={cn('relative rounded-lg bg-background p-3 pr-9', s.market === 'BOOST' && 'ring-1 ring-boost/60')}
              >
                {s.market === 'BOOST' && (
                  <span className="mb-1 inline-flex items-center gap-1 rounded bg-boost px-1.5 text-[10px] font-extrabold uppercase text-boost-foreground">
                    <BoltIcon className="size-3" aria-hidden="true" />
                    {s.marketLabel}
                  </span>
                )}
                <p className="text-sm font-bold leading-snug">{s.pickLabel}</p>
                <p className="text-xs text-muted-foreground">
                  {s.live && <span className="mr-1 font-extrabold text-destructive">LIVE</span>}
                  {s.market !== 'BOOST' && `${s.marketLabel} · `}
                  {s.eventLabel}
                </p>
                <p className="mt-1 flex items-baseline gap-2 text-sm font-extrabold">
                  {s.was && <span className="text-xs text-muted-foreground line-through">{formatOdds(s.was)}</span>}
                  <span key={s.odds} className={cn('rounded px-0.5', s.market === 'BOOST' && 'text-boost', s.live && 'odds-flash-up')}>
                    {formatOdds(s.odds)}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => remove(s.key)}
                  className="absolute right-2 top-2 rounded p-1 text-muted-foreground hover:bg-surface hover:text-foreground"
                  aria-label={`${t('slip.remove')} ${s.pickLabel}`}
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 border-t border-border p-3">
            {effectiveMode === 'multi' && <BoostLadder legs={selections.length} extraWin={boostExtra} />}

            <label className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
              {isCombo ? t('slip.stakePerTicket') : effectiveMode === 'single' && selections.length > 1 ? t('slip.stakePer') : t('slip.stake')}
              <input
                type="number"
                inputMode="numeric"
                min={STAKE_MIN}
                step={100}
                value={stake}
                onChange={(e) => setStake(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                className="h-10 rounded-lg border border-input bg-background px-3 text-base font-bold text-foreground"
              />
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {QUICK_STAKES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setStake(q)}
                  className={cn('rounded-md bg-background py-1.5 text-xs font-bold hover:bg-accent', stake === q && 'bg-brand')}
                >
                  {q.toLocaleString('en-US')}
                </button>
              ))}
            </div>

            <dl className="flex flex-col gap-1 text-sm">
              {effectiveMode === 'multi' && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t('slip.totalOdds')}</dt>
                  <dd className="font-bold">{formatOdds(totalOdds)}</dd>
                </div>
              )}
              {isCombo && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t('slip.tickets')}</dt>
                  <dd className="font-bold">
                    {count} × {formatMoney(stake)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t('slip.totalStake')}</dt>
                <dd className="font-bold">{formatMoney(totalStake)}</dd>
              </div>
              {isCombo ? (
                <>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t('slip.minWin')}</dt>
                    <dd className="font-bold">{formatMoney(summary.min)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t('slip.maxWin')}</dt>
                    <dd className="font-bold">{formatMoney(summary.max)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t('slip.allWin')}</dt>
                    <dd className="text-base font-extrabold text-success">{formatMoney(summary.sum)}</dd>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t('slip.potentialWin')}</dt>
                  <dd className="text-base font-extrabold text-success">{formatMoney(potential)}</dd>
                </div>
              )}
            </dl>

            {summary.capped && (
              <p className="text-xs text-muted-foreground">{t('slip.capped', { amount: formatMoney(MAX_POTENTIAL_WIN) })}</p>
            )}
            {tooManyTickets && (
              <p role="alert" className="text-xs font-bold text-destructive">
                {t('slip.tooManyTickets', { count, max: MAX_TICKETS })}
              </p>
            )}
            {isCombo && tickets.length > 0 && <TicketList tickets={tickets} stake={stake} />}

            {remainingToday !== null && (
              <p className={cn('text-xs', overLimit ? 'font-bold text-destructive' : 'text-muted-foreground')}>
                {t('slip.limitLeft', { amount: formatMoney(remainingToday) })}
              </p>
            )}

            {!isAuthed ? (
              <Link href="/sign-in" className={buttonVariants({ size: 'lg', className: 'h-11 w-full text-base font-extrabold' })}>
                {t('slip.loginToBet')}
              </Link>
            ) : shortfall > 0 && !overLimit ? (
              <SlipTopUp shortfall={shortfall} onPaid={place} />
            ) : (
              <Button
                size="lg"
                onClick={submit}
                disabled={pending || stake < STAKE_MIN || overLimit || tooManyTickets}
                className="h-11 w-full text-base font-extrabold"
              >
                {pending ? t('slip.placing') : t('slip.place', { amount: formatMoney(totalStake) })}
              </Button>
            )}

            <SlipShare keys={keys} totalOdds={shareOdds} />

            <p className="flex items-center gap-1.5 border-t border-border pt-3 text-[11px] text-muted-foreground">
              <ShieldCheck className="size-3.5 shrink-0 text-success" aria-hidden="true" />
              <span>
                {t('slip.safety')} ·{' '}
                <Link href="/account#limits" className="underline underline-offset-2 hover:text-foreground">
                  {limitStatus?.limit != null ? t('slip.manageLimit') : t('slip.setLimit')}
                </Link>
              </span>
            </p>
          </div>
        </>
      )}
    </section>
  )
}
