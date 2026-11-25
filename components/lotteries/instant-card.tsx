'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Sparkles } from 'lucide-react'
import { playInstant } from '@/app/actions/bets'
import { Button, buttonVariants } from '@/components/ui/button'
import type { InstantGame } from '@/lib/data/lotteries'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'

export function InstantCard({ game, isAuthed }: { game: InstantGame; isAuthed: boolean }) {
  const router = useRouter()
  const [result, setResult] = useState<{ prize: number } | { error: string } | null>(null)
  const [pending, startTransition] = useTransition()

  function play() {
    setResult(null)
    startTransition(async () => {
      const res = await playInstant({ gameId: game.id })
      setResult(res.ok ? { prize: res.prize } : { error: res.error })
      if (res.ok) router.refresh()
    })
  }

  const won = result && 'prize' in result && result.prize > 0

  return (
    <article className="flex flex-col gap-3 rounded-xl bg-surface p-4">
      <div
        className={cn(
          'flex h-28 flex-col items-center justify-center gap-1 rounded-lg text-center transition-colors',
          won ? 'bg-success/20 ring-1 ring-success' : 'bg-brand',
        )}
        aria-live="polite"
      >
        {pending ? (
          <span className="animate-pulse font-extrabold">Revealing…</span>
        ) : result && 'prize' in result ? (
          result.prize > 0 ? (
            <>
              <span className="text-xs font-bold uppercase tracking-wider text-success">You won</span>
              <span className="text-2xl font-black">{formatMoney(result.prize)}</span>
            </>
          ) : (
            <span className="font-extrabold text-white/80">No win this time</span>
          )
        ) : (
          <>
            <Sparkles className="size-6 text-primary" aria-hidden="true" />
            <span className="text-xs font-bold text-white/80">{game.tagline}</span>
          </>
        )}
      </div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-extrabold">{game.name}</h3>
          <p className="text-xs text-muted-foreground">Top prize {formatMoney(game.topPrize)}</p>
        </div>
        <span className="text-sm font-black">{formatMoney(game.price)}</span>
      </div>
      {result && 'error' in result && <p className="text-sm font-bold text-destructive">{result.error}</p>}
      {isAuthed ? (
        <Button className="font-extrabold" onClick={play} disabled={pending}>
          {result ? 'Play again' : 'Buy & reveal'}
        </Button>
      ) : (
        <Link href="/sign-in" className={buttonVariants({ className: 'font-extrabold' })}>
          Log in to play
        </Link>
      )}
    </article>
  )
}
