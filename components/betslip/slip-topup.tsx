'use client'

import { useState, useTransition } from 'react'
import { Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { moveFunds } from '@/app/actions/wallet'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'

const PROVIDERS = [
  { id: 'mtn', label: 'MTN MoMo' },
  { id: 'orange', label: 'Orange Money' },
] as const

export function SlipTopUp({ shortfall, onPaid }: { shortfall: number; onPaid: () => Promise<void> }) {
  const amount = Math.max(500, Math.ceil(shortfall / 100) * 100)
  const [method, setMethod] = useState<(typeof PROVIDERS)[number]['id']>('mtn')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const phoneValid = /^6\d{8}$/.test(phone)

  function pay() {
    setError(null)
    startTransition(async () => {
      const result = await moveFunds({ direction: 'deposit', amount, method, phone })
      if (!result.ok) {
        setError(result.error)
        return
      }
      await onPaid()
    })
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3">
      <p className="text-sm font-bold">
        You need {formatMoney(shortfall)} more. Top up and place in one step.
      </p>
      <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Mobile money provider">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={method === p.id}
            onClick={() => setMethod(p.id)}
            className={cn(
              'rounded-md py-1.5 text-xs font-bold',
              method === p.id ? 'bg-brand text-foreground' : 'bg-background text-muted-foreground',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <label className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
        Mobile number
        <span className="flex h-10 items-center rounded-lg border border-input bg-background">
          <span className="px-3 text-sm font-bold text-muted-foreground">+237</span>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="6XX XXX XXX"
            maxLength={9}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
            className="h-full min-w-0 flex-1 bg-transparent pr-3 text-base font-bold text-foreground outline-none"
          />
        </span>
      </label>
      {error && (
        <p role="alert" className="text-xs font-semibold text-destructive">
          {error}
        </p>
      )}
      <Button onClick={pay} disabled={pending || !phoneValid} className="h-11 w-full gap-2 font-extrabold">
        <Smartphone className="size-4" aria-hidden="true" />
        {pending ? 'Confirm on your phone...' : `Pay ${formatMoney(amount)} & place bet`}
      </Button>
    </div>
  )
}
