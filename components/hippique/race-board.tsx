'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Minus, Plus, Star } from 'lucide-react'
import { placeHippique } from '@/app/actions/bets'
import { SavedSlipNotice } from '@/components/betslip/saved-slip-notice'
import { Button, buttonVariants } from '@/components/ui/button'
import { HIPPIQUE_BET_TYPES, type Race } from '@/lib/data/hippique'
import { formatMoney, formatOdds } from '@/lib/format'
import { cn } from '@/lib/utils'

export function RaceBoard({ races, isAuthed }: { races: Race[]; isAuthed: boolean }) {
  const router = useRouter()
  const [raceId, setRaceId] = useState(races.find((r) => r.quinte)?.id ?? races[0].id)
  const [typeId, setTypeId] = useState('gagnant')
  const [runners, setRunners] = useState<number[]>([])
  const [multiplier, setMultiplier] = useState(1)
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const race = races.find((r) => r.id === raceId)!
  const type = HIPPIQUE_BET_TYPES.find((t) => t.id === typeId)!
  const stake = type.unit * multiplier
  const ready = runners.length === type.picks

  function selectRace(id: string) {
    setRaceId(id)
    setRunners([])
    setStatus(null)
  }

  function selectType(id: string) {
    const next = HIPPIQUE_BET_TYPES.find((t) => t.id === id)!
    setTypeId(id)
    setRunners((r) => r.slice(0, next.picks))
    setStatus(null)
  }

  function toggleRunner(n: number) {
    setStatus(null)
    setRunners((prev) => {
      if (prev.includes(n)) return prev.filter((x) => x !== n)
      if (prev.length >= type.picks) return type.picks === 1 ? [n] : prev
      return [...prev, n]
    })
  }

  function submit() {
    startTransition(async () => {
      const res = await placeHippique({ raceId, betTypeId: typeId, runners, multiplier })
      if (res.ok) {
        setStatus({ ok: true, text: res.message })
        setRunners([])
        router.refresh()
      } else setStatus({ ok: false, text: res.error })
    })
  }

  return (
    <div className="flex flex-col gap-4 pb-24 lg:pb-0">
      <nav aria-label="Races" className="no-scrollbar flex gap-2 overflow-x-auto">
        {races.map((r) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={r.id === raceId}
            onClick={() => selectRace(r.id)}
            className={cn(
              'flex shrink-0 flex-col items-start rounded-lg px-3 py-2 text-left',
              r.id === raceId ? 'bg-primary text-primary-foreground' : 'bg-surface hover:bg-surface-2',
            )}
          >
            <span className="flex items-center gap-1 text-sm font-extrabold">
              {r.code}
              {r.quinte && <Star className="size-3 fill-current" aria-label="Quinté+ race" />}
            </span>
            <span className={cn('text-xs', r.id === raceId ? 'text-white/80' : 'text-muted-foreground')}>
              {r.meeting} · {r.start}
            </span>
          </button>
        ))}
      </nav>

      <section className="rounded-xl bg-surface p-4" aria-labelledby="race-title">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="race-title" className="text-lg font-black">
            {race.code} · {race.name}
          </h2>
          <span className="text-xs font-bold text-muted-foreground">
            {race.discipline} · {race.distance} · {race.purse}
          </span>
        </div>

        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto" role="radiogroup" aria-label="Bet type">
          {HIPPIQUE_BET_TYPES.filter((t) => t.id !== 'quinte' || race.quinte).map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={t.id === typeId}
              onClick={() => selectType(t.id)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-sm font-bold',
                t.id === typeId ? 'bg-brand text-white ring-2 ring-primary' : 'bg-surface-2 hover:bg-accent',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {type.description} Select {type.picks} horse{type.picks > 1 ? 's' : ''}
          {type.picks > 1 ? ' in your predicted finishing order.' : '.'}
        </p>

        <ul className="mt-4 flex flex-col gap-1.5">
          {race.runners.map((r) => {
            const pos = runners.indexOf(r.number)
            const active = pos !== -1
            return (
              <li key={r.number}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleRunner(r.number)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                    active ? 'bg-primary/15 ring-1 ring-primary' : 'bg-surface-2 hover:bg-accent',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-black',
                      active ? 'bg-primary text-primary-foreground' : 'bg-brand',
                    )}
                  >
                    {active && type.picks > 1 ? `${pos + 1}e` : r.number}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-extrabold">
                      {r.number}. {r.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {r.jockey} · Form {r.form}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-extrabold">{formatOdds(r.odds)}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <div className="sticky bottom-[72px] z-30 flex flex-col gap-3 rounded-xl bg-brand p-4 shadow-xl shadow-black/40 lg:bottom-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white/70">
              {type.label} · {runners.length}/{type.picks} selected
            </span>
            <span className="text-lg font-black">{formatMoney(stake)}</span>
          </div>
          <div className="flex items-center gap-2" role="group" aria-label="Stake multiplier">
            <Button
              size="icon"
              variant="outline"
              aria-label="Decrease multiplier"
              onClick={() => setMultiplier((m) => Math.max(1, m - 1))}
            >
              <Minus className="size-4" aria-hidden="true" />
            </Button>
            <span className="w-10 text-center font-black" aria-live="polite">
              x{multiplier}
            </span>
            <Button
              size="icon"
              variant="outline"
              aria-label="Increase multiplier"
              onClick={() => setMultiplier((m) => Math.min(100, m + 1))}
            >
              <Plus className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
        {type.fixedOdds && ready && (
          <p className="text-xs font-bold text-white/80">
            Potential win {formatMoney(stake * (race.runners.find((r) => r.number === runners[0])?.odds ?? 0))}
          </p>
        )}
        {status && (
          <p role="status" className={cn('text-sm font-bold', status.ok ? 'text-success' : 'text-destructive')}>
            {status.text}
          </p>
        )}
        <SavedSlipNotice />
        {isAuthed ? (
          <Button size="lg" className="h-11 font-extrabold" disabled={!ready || pending} onClick={submit}>
            {pending ? 'Placing…' : ready ? `Place ${type.label}` : `Select ${type.picks - runners.length} more`}
          </Button>
        ) : (
          <Link href="/sign-in" className={buttonVariants({ size: 'lg', className: 'h-11 font-extrabold' })}>
            Log in to bet
          </Link>
        )}
      </div>
    </div>
  )
}
