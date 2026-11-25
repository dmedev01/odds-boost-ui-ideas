'use client'

import { useEffect, useRef, useState } from 'react'
import { Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Phase = 'idle' | 'flying' | 'crashed' | 'cashed'

function drawCrashPoint() {
  return Math.max(1, Number((0.99 / (1 - Math.random())).toFixed(2)))
}

export function RocketCrash() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [multiplier, setMultiplier] = useState(1)
  const [cashedAt, setCashedAt] = useState<number | null>(null)
  const [history, setHistory] = useState<number[]>([2.14, 1.03, 7.8, 1.56, 3.2, 1.11])
  const frame = useRef<number>(0)

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  function launch() {
    const crashAt = drawCrashPoint()
    const start = performance.now()
    setPhase('flying')
    setCashedAt(null)
    setMultiplier(1)

    const tick = (now: number) => {
      const value = Math.exp(((now - start) / 1000) * 0.18)
      if (value >= crashAt) {
        setMultiplier(crashAt)
        setPhase((p) => (p === 'cashed' ? p : 'crashed'))
        setHistory((h) => [crashAt, ...h].slice(0, 8))
        return
      }
      setMultiplier(Number(value.toFixed(2)))
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }

  function cashOut() {
    setCashedAt(multiplier)
    setPhase('cashed')
  }

  const progress = Math.min(1, Math.log(multiplier) / Math.log(10))

  return (
    <section aria-labelledby="crash-title" className="overflow-hidden rounded-xl bg-surface">
      <header className="flex items-center justify-between bg-surface-2 px-4 py-2.5">
        <h2 id="crash-title" className="flex items-center gap-2 text-sm font-extrabold">
          <Rocket className="size-4 text-primary" aria-hidden="true" />
          Rocket Crash <span className="font-semibold text-muted-foreground">· free-play demo</span>
        </h2>
        <ul className="flex gap-1" aria-label="Recent rounds">
          {history.slice(0, 5).map((h, i) => (
            <li
              key={i}
              className={cn(
                'rounded px-1.5 py-0.5 text-[11px] font-extrabold',
                h >= 2 ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive',
              )}
            >
              {h.toFixed(2)}x
            </li>
          ))}
        </ul>
      </header>
      <div className="relative flex h-52 items-center justify-center bg-brand md:h-64">
        <Rocket
          aria-hidden="true"
          className={cn('absolute size-10 text-primary transition-transform', phase === 'crashed' && 'opacity-30')}
          style={{
            left: `${8 + progress * 78}%`,
            bottom: `${10 + progress * 70}%`,
          }}
        />
        <div className="relative text-center" aria-live="polite">
          <p
            className={cn(
              'text-5xl font-black tabular-nums md:text-6xl',
              phase === 'crashed' && 'text-destructive',
              phase === 'cashed' && 'text-success',
            )}
          >
            {multiplier.toFixed(2)}x
          </p>
          <p className="mt-1 text-sm font-bold text-white/80">
            {phase === 'idle' && 'Launch a round and cash out before it flies away'}
            {phase === 'flying' && (cashedAt ? `Cashed out at ${cashedAt.toFixed(2)}x` : 'Flying…')}
            {phase === 'crashed' && 'Flew away!'}
            {phase === 'cashed' && `Cashed out at ${cashedAt?.toFixed(2)}x`}
          </p>
        </div>
      </div>
      <div className="flex gap-2 p-4">
        {phase === 'flying' ? (
          <Button size="lg" className="h-12 flex-1 bg-success font-extrabold hover:bg-success/90" onClick={cashOut}>
            Cash out {multiplier.toFixed(2)}x
          </Button>
        ) : (
          <Button size="lg" className="h-12 flex-1 font-extrabold" onClick={launch}>
            {phase === 'idle' ? 'Launch' : 'Next round'}
          </Button>
        )}
      </div>
      <p className="px-4 pb-4 text-xs leading-relaxed text-muted-foreground">
        Real-money crash and virtual games launch inside the Eurovirtual game client once provider credentials are
        connected. This demo uses no balance.
      </p>
    </section>
  )
}
