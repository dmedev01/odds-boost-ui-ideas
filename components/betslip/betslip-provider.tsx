'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { INTEGRAL_ENABLED, MAX_PICKS } from '@/lib/slip-modes'

export interface LimitStatus {
  limit: number | null
  staked: number
}

interface BetSlipContextValue {
  keys: string[]
  isAuthed: boolean
  balance: number | null
  limitStatus: LimitStatus | null
  has: (key: string) => boolean
  toggle: (key: string) => void
  remove: (key: string) => void
  load: (keys: string[]) => void
  clear: () => void
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}

const BetSlipContext = createContext<BetSlipContextValue | null>(null)

function onePerEvent(keys: string[]) {
  const byMatch = new Map<string, string>()
  for (const key of keys) byMatch.set(key.split('|')[0], key)
  return Array.from(byMatch.values())
}

// With integral bets on, a second outcome on a match joins the slip; otherwise it silently replaces the first.
function normalizeKeys(keys: string[]) {
  const unique = Array.from(new Set(keys))
  return (INTEGRAL_ENABLED ? unique : onePerEvent(unique)).slice(-MAX_PICKS)
}

export function BetSlipProvider({
  children,
  isAuthed,
  balance,
  limitStatus,
}: {
  children: React.ReactNode
  isAuthed: boolean
  balance: number | null
  limitStatus: LimitStatus | null
}) {
  const [keys, setKeys] = useState<string[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggle = useCallback((key: string) => {
    setKeys((current) => (current.includes(key) ? current.filter((k) => k !== key) : normalizeKeys([...current, key])))
  }, [])

  const load = useCallback((incoming: string[]) => {
    setKeys(normalizeKeys(incoming))
    setMobileOpen(true)
  }, [])

  const value = useMemo<BetSlipContextValue>(
    () => ({
      keys,
      isAuthed,
      balance,
      limitStatus,
      has: (key) => keys.includes(key),
      toggle,
      remove: (key) => setKeys((current) => current.filter((k) => k !== key)),
      load,
      clear: () => setKeys([]),
      mobileOpen,
      setMobileOpen,
    }),
    [keys, isAuthed, balance, limitStatus, toggle, load, mobileOpen],
  )

  return <BetSlipContext.Provider value={value}>{children}</BetSlipContext.Provider>
}

export function useBetSlip() {
  const ctx = useContext(BetSlipContext)
  if (!ctx) throw new Error('useBetSlip must be used inside BetSlipProvider')
  return ctx
}
