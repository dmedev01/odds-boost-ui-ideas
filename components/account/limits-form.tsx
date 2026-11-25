'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { setDailyLimit } from '@/app/actions/limits'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'

const PRESETS = [5_000, 10_000, 25_000, 50_000]

export function LimitsForm({
  limit,
  staked,
  pending,
}: {
  limit: number | null
  staked: number
  pending: { amount: number | null; at: string } | null
}) {
  const router = useRouter()
  const [amount, setAmount] = useState<number>(limit ?? 10_000)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [saving, startTransition] = useTransition()

  function save(value: number | null) {
    setMsg(null)
    startTransition(async () => {
      const r = await setDailyLimit({ amount: value })
      setMsg(r.ok ? { ok: true, text: r.message } : { ok: false, text: r.error })
      if (r.ok) router.refresh()
    })
  }

  return (
    <section id="limits" aria-labelledby="limits-title" className="flex flex-col gap-3 rounded-xl bg-surface p-4">
      <h2 id="limits-title" className="flex items-center gap-2 text-lg font-black">
        <ShieldCheck className="size-5 text-success" aria-hidden="true" />
        Daily stake limit
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {limit === null
          ? 'No limit set. Lowering a limit applies straight away; raising or removing one waits 24 hours.'
          : `${formatMoney(Math.max(0, limit - staked))} of ${formatMoney(limit)} left today.`}
      </p>
      {limit !== null && (
        <div className="h-2 overflow-hidden rounded-full bg-background" aria-hidden="true">
          <div className="h-full bg-primary" style={{ width: `${Math.min(100, (staked / limit) * 100)}%` }} />
        </div>
      )}
      {pending && (
        <p className="rounded-lg bg-background px-3 py-2 text-xs text-muted-foreground">
          Change to {pending.amount === null ? 'no limit' : formatMoney(pending.amount)} takes effect{' '}
          {new Date(pending.at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}.
        </p>
      )}

      <div className="grid grid-cols-4 gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setAmount(p)}
            className={cn('rounded-md bg-background py-1.5 text-xs font-bold hover:bg-accent', amount === p && 'bg-brand')}
          >
            {p.toLocaleString('en-US')}
          </button>
        ))}
      </div>
      <label className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
        Limit per day (FCFA)
        <input
          type="number"
          inputMode="numeric"
          min={500}
          step={500}
          value={amount}
          onChange={(e) => setAmount(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
          className="h-10 rounded-lg border border-input bg-background px-3 text-base font-bold text-foreground"
        />
      </label>
      <div className="flex gap-2">
        <Button className="flex-1 font-extrabold" disabled={saving} onClick={() => save(amount)}>
          {saving ? 'Saving...' : 'Save limit'}
        </Button>
        {limit !== null && (
          <Button variant="outline" disabled={saving} onClick={() => save(null)}>
            Remove
          </Button>
        )}
      </div>
      {msg && (
        <p role="status" className={cn('text-sm font-semibold', msg.ok ? 'text-success' : 'text-destructive')}>
          {msg.text}
        </p>
      )}
    </section>
  )
}
