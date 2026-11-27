'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

// Device-only until binding: move to the user's account preferences so pins follow them across devices.
const STORAGE_KEY = 'wb_pinned_markets'
const listeners = new Set<() => void>()

function read() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

export function usePinnedMarkets() {
  const raw = useSyncExternalStore(subscribe, read, () => '')
  const pinned = useMemo(() => new Set(raw ? raw.split(',') : []), [raw])

  const toggle = useCallback(
    (marketId: string) => {
      const next = new Set(pinned)
      if (next.has(marketId)) next.delete(marketId)
      else next.add(marketId)
      try {
        localStorage.setItem(STORAGE_KEY, [...next].join(','))
      } catch {}
      listeners.forEach((l) => l())
    },
    [pinned],
  )

  return { pinned, toggle }
}
