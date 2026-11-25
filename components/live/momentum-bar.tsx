'use client'

import { momentum } from '@/lib/data/live'
import { useLiveBucket } from './live-clock'

export function MomentumBar({ matchId, home, away }: { matchId: string; home: string; away: string }) {
  const bucket = useLiveBucket()
  const value = momentum(matchId, bucket)
  const homeShare = Math.round(50 + value * 40)
  const leader = value > 0.15 ? home : value < -0.15 ? away : null

  return (
    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
      <span className="sr-only">{leader ? `${leader} on top` : 'Even contest'}</span>
      <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
        <div className="live-bar bg-primary" style={{ width: `${homeShare}%` }} />
        <div className="live-bar flex-1 bg-muted-foreground/40" />
      </div>
      <span aria-hidden="true" className="w-24 truncate text-right">
        {leader ? `${leader} pressing` : 'Even'}
      </span>
    </div>
  )
}
