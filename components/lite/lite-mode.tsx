'use client'

import Image, { type ImageProps } from 'next/image'
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState } from 'react'
import { Feather } from 'lucide-react'
import { cn } from '@/lib/utils'

export const LITE_COOKIE = 'wb_lite'

interface LiteContextValue {
  lite: boolean
  setLite: (value: boolean) => void
  savedKb: number
  register: (id: string, kb: number) => void
  unregister: (id: string) => void
}

const LiteContext = createContext<LiteContextValue | null>(null)

export function LiteModeProvider({ initialLite, children }: { initialLite: boolean; children: React.ReactNode }) {
  const [lite, setLiteState] = useState(initialLite)
  const [saved, setSaved] = useState<Record<string, number>>({})

  const setLite = useCallback((value: boolean) => {
    setLiteState(value)
    document.cookie = `${LITE_COOKIE}=${value ? '1' : '0'}; path=/; max-age=31536000; samesite=lax`
  }, [])
  const register = useCallback((id: string, kb: number) => setSaved((s) => ({ ...s, [id]: kb })), [])
  const unregister = useCallback(
    (id: string) =>
      setSaved((s) => {
        const next = { ...s }
        delete next[id]
        return next
      }),
    [],
  )

  const value = useMemo(
    () => ({ lite, setLite, savedKb: Object.values(saved).reduce((a, b) => a + b, 0), register, unregister }),
    [lite, setLite, saved, register, unregister],
  )

  return (
    <LiteContext.Provider value={value}>
      <div data-lite={lite ? 'on' : 'off'} className="contents">
        {children}
      </div>
    </LiteContext.Provider>
  )
}

export function useLiteMode() {
  const ctx = useContext(LiteContext)
  if (!ctx) throw new Error('useLiteMode must be used inside LiteModeProvider')
  return ctx
}

/** An image that is skipped entirely in data-saver mode, and counted as data saved. */
export function LiteImage({ kb, ...props }: ImageProps & { kb: number }) {
  const { lite, register, unregister } = useLiteMode()
  const id = useId()

  useEffect(() => {
    if (!lite) return
    register(id, kb)
    return () => unregister(id)
  }, [lite, id, kb, register, unregister])

  if (lite) return null
  return <Image {...props} />
}

export function DataSaverToggle({ className }: { className?: string }) {
  const { lite, setLite, savedKb } = useLiteMode()
  const savedLabel = savedKb >= 1000 ? `${(savedKb / 1000).toFixed(1)} MB` : `${savedKb} KB`

  return (
    <button
      type="button"
      role="switch"
      aria-checked={lite}
      onClick={() => setLite(!lite)}
      className={cn(
        'flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold transition-colors',
        lite ? 'bg-success/15 text-success' : 'text-muted-foreground hover:bg-surface hover:text-foreground',
        className,
      )}
    >
      <Feather className="size-4" aria-hidden="true" />
      <span className="hidden sm:inline">Data saver</span>
      <span className="sr-only sm:hidden">Data saver</span>
      {lite && savedKb > 0 && <span className="hidden md:inline">· {savedLabel} saved</span>}
    </button>
  )
}
