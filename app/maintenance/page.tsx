import type { Metadata } from 'next'
import Link from 'next/link'
import { Wrench } from 'lucide-react'

export const metadata: Metadata = { title: 'Back soon' }

export default function MaintenancePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-6 font-sans text-foreground">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Wrench className="size-7" aria-hidden />
        </span>
        <h1 className="text-balance text-3xl font-black">We are improving the site</h1>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          Betting is paused until about 04:00. Your balance and open bets are safe and will settle as normal.
        </p>
        <p className="text-xs font-bold text-muted-foreground">
          Questions? WhatsApp +237 6 99 00 00 00 · UC-CORE-005
        </p>
        <Link href="/v4" className="text-sm font-bold text-primary hover:underline">
          Back to V4 use cases
        </Link>
      </div>
    </main>
  )
}
