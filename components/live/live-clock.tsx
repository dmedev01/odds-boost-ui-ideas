'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { currentBucket, TICK_MS } from '@/lib/data/live'

const LiveClockContext = createContext(0)

export function LiveClockProvider({ initialBucket, children }: { initialBucket: number; children: React.ReactNode }) {
  const [bucket, setBucket] = useState(initialBucket)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      setBucket(currentBucket())
      timer = setTimeout(tick, TICK_MS - (Date.now() % TICK_MS) + 50)
    }
    timer = setTimeout(tick, 0)
    return () => clearTimeout(timer)
  }, [])

  return <LiveClockContext.Provider value={bucket}>{children}</LiveClockContext.Provider>
}

export function useLiveBucket() {
  return useContext(LiveClockContext)
}
