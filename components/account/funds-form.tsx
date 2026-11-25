'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { moveFunds } from '@/app/actions/wallet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const METHODS = [
  { id: 'mtn', label: 'MTN MoMo' },
  { id: 'orange', label: 'Orange Money' },
  { id: 'card', label: 'Card' },
]
const QUICK = [1_000, 5_000, 10_000, 25_000]

export function FundsForm({ initial = 'deposit' }: { initial?: 'deposit' | 'withdraw' }) {
  const router = useRouter()
  const [direction, setDirection] = useState(initial)
  const [method, setMethod] = useState('mtn')
  const [amount, setAmount] = useState('5000')
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await moveFunds({ direction, amount: Number(amount), method })
      setStatus(res.ok ? { ok: true, text: res.message } : { ok: false, text: res.error })
      if (res.ok) router.refresh()
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-xl bg-surface p-5" id="deposit">
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-2 p-1" role="tablist" aria-label="Transaction type">
        {(['deposit', 'withdraw'] as const).map((d) => (
          <button
            key={d}
            type="button"
            role="tab"
            aria-selected={direction === d}
            onClick={() => {
              setDirection(d)
              setStatus(null)
            }}
            className={cn(
              'h-9 rounded-md text-sm font-extrabold capitalize',
              direction === d ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
            )}
          >
            {d}
          </button>
        ))}
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-bold">Payment method</legend>
        <div className="grid grid-cols-3 gap-2">
          {METHODS.map((m) => (
            <label
              key={m.id}
              className={cn(
                'flex h-11 cursor-pointer items-center justify-center rounded-lg text-xs font-extrabold ring-1',
                method === m.id ? 'bg-brand ring-primary' : 'bg-surface-2 ring-border',
              )}
            >
              <input
                type="radio"
                name="method"
                value={m.id}
                checked={method === m.id}
                onChange={() => setMethod(m.id)}
                className="sr-only"
              />
              {m.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5 text-sm font-bold">
        Amount (FCFA)
        <input
          type="number"
          inputMode="numeric"
          min={500}
          max={500000}
          step={100}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-11 rounded-lg bg-surface-2 px-3 font-bold outline-none ring-1 ring-border focus-visible:ring-2 focus-visible:ring-primary"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setAmount(String(q))}
            className="rounded-full bg-surface-2 px-3 py-1 text-xs font-bold hover:bg-accent"
          >
            {q.toLocaleString('fr-FR')}
          </button>
        ))}
      </div>
      {status && (
        <p role="status" className={cn('text-sm font-bold', status.ok ? 'text-success' : 'text-destructive')}>
          {status.text}
        </p>
      )}
      <Button type="submit" size="lg" className="h-11 font-extrabold capitalize" disabled={pending}>
        {pending ? 'Processing…' : direction}
      </Button>
      <p className="text-xs text-muted-foreground">Demo wallet: no real money moves. Connect a payment provider for production.</p>
    </form>
  )
}
