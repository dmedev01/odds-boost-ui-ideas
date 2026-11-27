'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { useI18n } from '@/components/i18n/i18n-provider'
import { AGE_COOKIE, AGE_COOKIE_MAX_AGE, MIN_AGE } from '@/lib/age'
import { cn } from '@/lib/utils'

type Step = 'ask' | 'under' | 'done'

function initialStep(confirmed: boolean, preview: string | null): Step {
  if (preview === 'under') return 'under'
  if (preview === 'show') return 'ask'
  return confirmed ? 'done' : 'ask'
}

export function AgeNotice({ confirmed }: { confirmed: boolean }) {
  const { t } = useI18n()
  const preview = useSearchParams().get('age')
  const [step, setStep] = useState<Step>(() => initialStep(confirmed, preview))
  const headingRef = useRef<HTMLHeadingElement>(null)
  const changed = useRef(false)

  useEffect(() => {
    setStep(initialStep(confirmed, preview))
  }, [confirmed, preview])

  useEffect(() => {
    if (changed.current) headingRef.current?.focus()
  }, [step])

  if (step === 'done') return null

  const go = (next: Step) => {
    changed.current = true
    setStep(next)
  }

  const confirm = () => {
    document.cookie = `${AGE_COOKIE}=${MIN_AGE}; max-age=${AGE_COOKIE_MAX_AGE}; path=/; samesite=lax`
    setStep('done')
  }

  const vars = { age: MIN_AGE }
  const under = step === 'under'

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center sm:bottom-6 sm:px-4">
      <section
        role="dialog"
        aria-modal="false"
        aria-labelledby="age-notice-title"
        aria-describedby="age-notice-body"
        className="pointer-events-auto flex w-full max-w-xl flex-col gap-5 rounded-t-2xl border border-border bg-surface-2 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl shadow-black/50 motion-safe:animate-in motion-safe:slide-in-from-bottom-8 motion-safe:fade-in motion-safe:duration-300 sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className={cn(
              'flex size-14 shrink-0 items-center justify-center rounded-full border-4 text-lg font-black tabular-nums',
              under ? 'border-destructive text-destructive' : 'border-primary text-foreground',
            )}
          >
            {MIN_AGE}+
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <h2
              id="age-notice-title"
              ref={headingRef}
              tabIndex={-1}
              className="text-pretty text-lg font-extrabold leading-snug outline-none"
            >
              {t(under ? 'age.underTitle' : 'age.title', vars)}
            </h2>
            <p id="age-notice-body" className="text-pretty text-sm leading-relaxed text-muted-foreground">
              {t(under ? 'age.underBody' : 'age.body', vars)}
            </p>
          </div>
        </div>

        {under ? (
          <div className="flex flex-col gap-3 sm:flex-row-reverse sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden="true" />
              {t('age.underHelp')}
            </p>
            <button
              type="button"
              onClick={() => go('ask')}
              className="h-11 shrink-0 whitespace-nowrap rounded-lg border border-border px-4 text-sm font-extrabold text-foreground transition-colors hover:bg-accent"
            >
              {t('age.mistake')}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <button
              type="button"
              onClick={confirm}
              className="h-12 shrink-0 rounded-lg bg-primary sm:flex-1 px-5 text-base font-extrabold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {t('age.confirm', vars)}
            </button>
            <button
              type="button"
              onClick={() => go('under')}
              className="h-12 rounded-lg px-5 text-sm font-extrabold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {t('age.under', vars)}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
