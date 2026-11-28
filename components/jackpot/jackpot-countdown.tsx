'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const UNITS = [
  { label: 'days', ms: 86_400_000 },
  { label: 'hrs', ms: 3_600_000 },
  { label: 'min', ms: 60_000 },
  { label: 'sec', ms: 1_000 },
] as const

function split(remaining: number) {
  let rest = remaining
  return UNITS.map((u) => {
    const value = Math.floor(rest / u.ms)
    rest -= value * u.ms
    return { label: u.label, value }
  })
}

export function JackpotCountdown({ closesAt, closesLabel }: { closesAt: string; closesLabel: string }) {
  const target = new Date(closesAt).getTime()
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const remaining = now === null ? null : Math.max(0, target - now)
  const urgent = remaining !== null && remaining < 3_600_000
  const parts = split(remaining ?? 0).filter((p, i) => i > 0 || p.value > 0)

  return (
    <div className="mt-3 flex flex-col gap-2" role="timer" aria-live="off">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide opacity-80">
        <Clock className="size-3.5" aria-hidden="true" />
        Entries close {closesLabel}
      </p>
      <div className="flex gap-2" aria-label={remaining === null ? 'Loading time left' : 'Time left to enter'}>
        {parts.map((p) => (
          <div
            key={p.label}
            className={cn(
              'flex min-w-14 flex-col items-center rounded-lg bg-black/25 px-2 py-1.5',
              urgent && 'bg-primary text-primary-foreground',
            )}
          >
            <span className="font-mono text-xl font-bold tabular-nums leading-none">
              {remaining === null ? '--' : String(p.value).padStart(2, '0')}
            </span>
            <span className="mt-1 text-[11px] font-semibold opacity-80">{p.label}</span>
          </div>
        ))}
      </div>
      {urgent && <p className="text-xs font-semibold">Less than an hour left. Tickets after the close are not accepted.</p>}
    </div>
  )
}
