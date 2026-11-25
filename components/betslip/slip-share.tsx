'use client'

import { useState } from 'react'
import { Check, Link2, MessageCircle } from 'lucide-react'
import { bookingCode, encodeSlip } from '@/lib/share'
import { formatOdds } from '@/lib/format'
import { cn } from '@/lib/utils'

export function SlipShare({ keys, totalOdds, className }: { keys: string[]; totalOdds: number; className?: string }) {
  const [copied, setCopied] = useState(false)
  const code = encodeSlip(keys)
  const booking = bookingCode(code)

  const link = () => `${window.location.origin}/s/${code}`

  function whatsapp() {
    const text = `My WandaBet slip ${booking}: ${keys.length} ${keys.length === 1 ? 'pick' : 'picks'} at ${formatOdds(totalOdds)} odds. Tap to load it: ${link()}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  async function copy() {
    await navigator.clipboard.writeText(link())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className="mr-auto text-xs text-muted-foreground">
        Code <span className="font-mono font-bold text-foreground">{booking}</span>
      </span>
      <button
        type="button"
        onClick={whatsapp}
        className="flex h-8 items-center gap-1 rounded-md bg-success/15 px-2.5 text-xs font-bold text-success hover:bg-success/25"
      >
        <MessageCircle className="size-3.5" aria-hidden="true" />
        WhatsApp
      </button>
      <button
        type="button"
        onClick={copy}
        className="flex h-8 items-center gap-1 rounded-md bg-background px-2.5 text-xs font-bold hover:bg-accent"
      >
        {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Link2 className="size-3.5" aria-hidden="true" />}
        <span aria-live="polite">{copied ? 'Copied' : 'Copy link'}</span>
      </button>
    </div>
  )
}
