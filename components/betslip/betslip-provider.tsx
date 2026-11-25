'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

interface BetSlipContextValue {
  keys: string[]
  isAuthed: boolean
  has: (key: string) => boolean
  toggle: (key: string) => void
  remove: (key: string) => void
  clear: () => void
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}

const BetSlipContext = createContext<BetSlipContextValue | null>(null)

export function BetSlipProvider({ children, isAuthed }: { children: React.ReactNode; isAuthed: boolean }) {
  const [keys, setKeys] = useState<string[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggle = useCallback((key: string) => {
    setKeys((current) => {
      if (current.includes(key)) return current.filter((k) => k !== key)
      const matchId = key.split('|')[0]
      // One selection per event: picking another outcome replaces the previous one.
      return [...current.filter((k) => k.split('|')[0] !== matchId), key].slice(-20)
    })
  }, [])

  const value = useMemo<BetSlipContextValue>(
    () => ({
      keys,
      isAuthed,
      has: (key) => keys.includes(key),
      toggle,
      remove: (key) => setKeys((current) => current.filter((k) => k !== key)),
      clear: () => setKeys([]),
      mobileOpen,
      setMobileOpen,
    }),
    [keys, isAuthed, toggle, mobileOpen],
  )

  return <BetSlipContext.Provider value={value}>{children}</BetSlipContext.Provider>
}

export function useBetSlip() {
  const ctx = useContext(BetSlipContext)
  if (!ctx) throw new Error('useBetSlip must be used inside BetSlipProvider')
  return ctx
}
