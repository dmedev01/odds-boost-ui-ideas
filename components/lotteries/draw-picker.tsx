'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Shuffle } from 'lucide-react'
import { buyDrawTicket } from '@/app/actions/bets'
import { SavedSlipNotice } from '@/components/betslip/saved-slip-notice'
import { Button, buttonVariants } from '@/components/ui/button'
import type { DrawLottery } from '@/lib/data/lotteries'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'

export function DrawPicker({ lotteries, isAuthed }: { lotteries: DrawLottery[]; isAuthed: boolean }) {
  const router = useRouter()
  const [id, setId] = useState(lotteries[0].id)
  const [numbers, setNumbers] = useState<number[]>([])
  const [multiplier, setMultiplier] = useState(1)
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, startTransition] = useTransition()
  const lottery = lotteries.find((l) => l.id === id)!
  const ready = numbers.length === lottery.pick

  function toggle(n: number) {
    setStatus(null)
    setNumbers((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : prev.length < lottery.pick ? [...prev, n] : prev,
    )
  }

  function lucky() {
    const pool = Array.from({ length: lottery.max }, (_, i) => i + 1)
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    setNumbers(pool.slice(0, lottery.pick).sort((a, b) => a - b))
    setStatus(null)
  }

  function submit() {
    startTransition(async () => {
      const res = await buyDrawTicket({ lotteryId: id, numbers, multiplier })
      if (res.ok) {
        setStatus({ ok: true, text: `${res.message}. Draw: ${lottery.nextDraw}.` })
        setNumbers([])
        router.refresh()
      } else setStatus({ ok: false, text: res.error })
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-surface p-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Lottery">
        {lotteries.map((l) => (
          <button
            key={l.id}
            type="button"
            role="radio"
            aria-checked={l.id === id}
            onClick={() => {
              setId(l.id)
              setNumbers([])
              setStatus(null)
            }}
            className={cn(
              'flex flex-col items-start gap-0.5 rounded-lg p-3 text-left',
              l.id === id ? 'bg-brand ring-2 ring-primary' : 'bg-surface-2 hover:bg-accent',
            )}
          >
            <span className="text-sm font-extrabold">{l.name}</span>
            <span className="text-lg font-black text-primary">{formatMoney(l.jackpot)}</span>
            <span className="text-xs text-muted-foreground">
              {l.frequency} · {l.nextDraw}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">
          Pick {lottery.pick} from 1–{lottery.max}{' '}
          <span className="text-muted-foreground">({numbers.length}/{lottery.pick})</span>
        </p>
        <Button size="sm" variant="outline" onClick={lucky} className="gap-1.5 font-bold">
          <Shuffle className="size-4" aria-hidden="true" />
          Lucky dip
        </Button>
      </div>

      <div className="grid grid-cols-9 gap-1 sm:grid-cols-12 md:grid-cols-15" role="group" aria-label="Numbers">
        {Array.from({ length: lottery.max }, (_, i) => i + 1).map((n) => {
          const active = numbers.includes(n)
          return (
            <button
              key={n}
              type="button"
              aria-pressed={active}
              aria-label={`Number ${n}`}
              onClick={() => toggle(n)}
              className={cn(
                'flex aspect-square items-center justify-center rounded-full text-xs font-extrabold transition-colors sm:text-sm',
                active ? 'bg-primary text-primary-foreground' : 'bg-surface-2 hover:bg-accent',
              )}
            >
              {n}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <label className="flex items-center gap-2 text-sm font-bold">
          Multiplier
          <select
            value={multiplier}
            onChange={(e) => setMultiplier(Number(e.target.value))}
            className="h-9 rounded-md bg-surface-2 px-2 font-bold"
          >
            {[1, 2, 5, 10, 20, 50].map((m) => (
              <option key={m} value={m}>
                x{m}
              </option>
            ))}
          </select>
        </label>
        <span className="text-lg font-black">{formatMoney(lottery.price * multiplier)}</span>
      </div>
      {status && (
        <p role="status" className={cn('text-sm font-bold', status.ok ? 'text-success' : 'text-destructive')}>
          {status.text}
        </p>
      )}
      <SavedSlipNotice />
      {isAuthed ? (
        <Button size="lg" className="h-11 font-extrabold" disabled={!ready || pending} onClick={submit}>
          {pending ? 'Buying…' : ready ? 'Buy ticket' : `Pick ${lottery.pick - numbers.length} more`}
        </Button>
      ) : (
        <Link href="/sign-in" className={buttonVariants({ size: 'lg', className: 'h-11 font-extrabold' })}>
          Log in to play
        </Link>
      )}
    </div>
  )
}
