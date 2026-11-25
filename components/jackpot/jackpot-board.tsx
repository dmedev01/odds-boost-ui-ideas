'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Shuffle, Trash2 } from 'lucide-react'
import { placeJackpot } from '@/app/actions/bets'
import { Button, buttonVariants } from '@/components/ui/button'
import { countLines, JACKPOT, JACKPOT_EVENTS, type JackpotPick } from '@/lib/data/jackpot'
import { formatMoney, formatOdds } from '@/lib/format'
import { cn } from '@/lib/utils'

const OUTCOMES: JackpotPick[] = ['1', 'X', '2']

export function JackpotBoard({ isAuthed }: { isAuthed: boolean }) {
  const router = useRouter()
  const [picks, setPicks] = useState<Record<string, JackpotPick[]>>({})
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const completed = JACKPOT_EVENTS.filter((e) => picks[e.id]?.length).length
  const lines = completed === JACKPOT_EVENTS.length ? countLines(picks) : 0
  const tooMany = lines > JACKPOT.maxLines

  function toggle(eventId: string, pick: JackpotPick) {
    setStatus(null)
    setPicks((prev) => {
      const current = prev[eventId] ?? []
      const next = current.includes(pick) ? current.filter((p) => p !== pick) : [...current, pick]
      return { ...prev, [eventId]: next }
    })
  }

  function quickPick() {
    setStatus(null)
    setPicks(Object.fromEntries(JACKPOT_EVENTS.map((e) => [e.id, [OUTCOMES[Math.floor(Math.random() * 3)]]])))
  }

  function submit() {
    startTransition(async () => {
      const res = await placeJackpot({ picks })
      if (res.ok) {
        setStatus({ ok: true, text: `${res.message}: ${res.lines} line${res.lines > 1 ? 's' : ''}. Good luck!` })
        setPicks({})
        router.refresh()
      } else setStatus({ ok: false, text: res.error })
    })
  }

  return (
    <div className="flex flex-col gap-3 pb-24 lg:pb-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-muted-foreground">
          <span className="text-white">{completed}</span>/15 predicted
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={quickPick} className="gap-1.5 font-bold">
            <Shuffle className="size-4" aria-hidden="true" />
            Quick pick
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPicks({})} className="gap-1.5 font-bold" disabled={!completed}>
            <Trash2 className="size-4" aria-hidden="true" />
            Clear
          </Button>
        </div>
      </div>

      <ol className="overflow-hidden rounded-xl bg-surface">
        {JACKPOT_EVENTS.map((e, i) => (
          <li key={e.id} className="flex items-center gap-3 border-b border-border px-3 py-2.5 last:border-0">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-extrabold">
              {i + 1}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-bold">
                {e.home} <span className="text-muted-foreground">vs</span> {e.away}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {e.league} · {e.kickoff}
              </span>
            </div>
            <div className="flex shrink-0 gap-1" role="group" aria-label={`${e.home} vs ${e.away} prediction`}>
              {OUTCOMES.map((o) => {
                const active = picks[e.id]?.includes(o)
                return (
                  <button
                    key={o}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggle(e.id, o)}
                    className={cn(
                      'flex h-11 w-12 flex-col items-center justify-center rounded-md text-sm font-extrabold leading-none transition-colors sm:w-16',
                      active ? 'bg-primary text-primary-foreground' : 'bg-surface-2 hover:bg-accent',
                    )}
                  >
                    {o}
                    <span className={cn('mt-0.5 text-[10px] font-semibold', active ? 'text-white/80' : 'text-muted-foreground')}>
                      {formatOdds(e.odds[o])}
                    </span>
                  </button>
                )
              })}
            </div>
          </li>
        ))}
      </ol>

      <div className="sticky bottom-[72px] z-30 flex flex-col gap-2 rounded-xl bg-brand p-4 shadow-xl shadow-black/40 lg:bottom-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-white/80">
            {lines} line{lines === 1 ? '' : 's'} × {formatMoney(JACKPOT.linePrice)}
          </span>
          <span className="text-lg font-black">{formatMoney(lines * JACKPOT.linePrice)}</span>
        </div>
        {tooMany && <p className="text-xs font-bold text-destructive">Maximum {JACKPOT.maxLines} lines per ticket.</p>}
        {status && (
          <p role="status" className={cn('text-sm font-bold', status.ok ? 'text-success' : 'text-destructive')}>
            {status.text}
          </p>
        )}
        {isAuthed ? (
          <Button size="lg" className="h-11 font-extrabold" disabled={!lines || tooMany || pending} onClick={submit}>
            {pending ? 'Placing ticket…' : lines ? 'Place jackpot ticket' : `Predict ${15 - completed} more match${15 - completed === 1 ? '' : 'es'}`}
          </Button>
        ) : (
          <Link href="/sign-in" className={buttonVariants({ size: 'lg', className: 'h-11 font-extrabold' })}>
            Log in to play
          </Link>
        )}
      </div>
    </div>
  )
}
