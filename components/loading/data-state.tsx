'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarX2, RotateCw, WifiOff } from 'lucide-react'
import { useI18n } from '@/components/i18n/i18n-provider'
import { cn } from '@/lib/utils'
import { loadingCopy, type LoadingSubject } from './copy'
import { BoostRailSkeleton, MatchListSkeleton } from './skeletons'

const SLOW_AFTER_MS = 8000

/** Becomes true once a load has been pending longer than `ms`. */
function useSlow(ms: number, forced?: boolean) {
  const [slow, setSlow] = useState(Boolean(forced))
  useEffect(() => {
    if (forced !== undefined) return
    const id = setTimeout(() => setSlow(true), ms)
    return () => clearTimeout(id)
  }, [ms, forced])
  return forced ?? slow
}

function SlowHint({ text }: { text: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
      <RotateCw className="size-3.5 motion-safe:animate-spin" aria-hidden="true" />
      {text}
    </span>
  )
}

/**
 * Loading state for any match list. Render it while matches are empty and still on their way.
 * After 8 seconds it adds a quiet "taking longer" hint by itself; polling keeps running behind it.
 */
export function MatchesLoading({
  title,
  rows = 4,
  subject = 'matches',
  slow,
  className,
}: {
  title?: string
  rows?: number
  subject?: LoadingSubject
  /** Forces the slow hint on or off. Leave unset to use the built-in 8s timer. */
  slow?: boolean
  className?: string
}) {
  const { locale } = useI18n()
  const isSlow = useSlow(SLOW_AFTER_MS, slow)
  return (
    <section aria-busy="true" aria-label={loadingCopy(locale, 'loading', subject)} className={className}>
      <p role="status" className="sr-only">
        {isSlow ? loadingCopy(locale, 'slow') : loadingCopy(locale, 'loading', subject)}
      </p>
      <MatchListSkeleton
        title={title}
        rows={rows}
        headerSlot={isSlow ? <SlowHint text={loadingCopy(locale, 'slow')} /> : null}
      />
    </section>
  )
}

export function BoostsLoading({ slow }: { slow?: boolean }) {
  const { locale } = useI18n()
  const isSlow = useSlow(SLOW_AFTER_MS, slow)
  return (
    <section aria-busy="true" aria-label={loadingCopy(locale, 'loading', 'boosts')} className="flex flex-col gap-3">
      <p role="status" className="sr-only">
        {isSlow ? loadingCopy(locale, 'slow') : loadingCopy(locale, 'loading', 'boosts')}
      </p>
      <div className="flex min-h-7 items-center justify-between gap-3">
        <span className="block h-4 w-36 rounded-md bg-surface-2 motion-safe:animate-pulse" aria-hidden="true" />
        {isSlow && <SlowHint text={loadingCopy(locale, 'slow')} />}
      </div>
      <BoostRailSkeleton />
    </section>
  )
}

function StateCard({
  icon: Icon,
  tone,
  title,
  body,
  action,
  role,
}: {
  icon: React.ComponentType<{ className?: string }>
  tone: 'error' | 'muted'
  title: string
  body: string
  action?: React.ReactNode
  role: 'alert' | 'status'
}) {
  return (
    <div role={role} className="flex flex-col items-center gap-3 rounded-xl bg-surface px-6 py-10 text-center">
      <span
        className={cn(
          'flex size-12 items-center justify-center rounded-full',
          tone === 'error' ? 'bg-destructive/15 text-destructive' : 'bg-surface-2 text-muted-foreground',
        )}
      >
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-balance font-extrabold">{title}</p>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
      {action}
    </div>
  )
}

const actionClass =
  'inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-extrabold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

/** Shown when loading stopped with an error. Retry re-requests the page's server data unless `onRetry` is given. */
export function DataError({ subject = 'page', onRetry }: { subject?: LoadingSubject; onRetry?: () => void }) {
  const { locale } = useI18n()
  const router = useRouter()
  return (
    <StateCard
      role="alert"
      tone="error"
      icon={RotateCw}
      title={loadingCopy(locale, 'failedTitle', subject)}
      body={loadingCopy(locale, 'failedBody')}
      action={
        <button type="button" onClick={onRetry ?? (() => router.refresh())} className={actionClass}>
          <RotateCw className="size-4" aria-hidden="true" />
          {loadingCopy(locale, 'retry')}
        </button>
      }
    />
  )
}

/** Shown while the device has no connection. It needs no button: loading resumes when the connection returns. */
export function DataOffline({ subject = 'page' }: { subject?: LoadingSubject }) {
  const { locale } = useI18n()
  return (
    <StateCard
      role="status"
      tone="muted"
      icon={WifiOff}
      title={loadingCopy(locale, 'offlineTitle')}
      body={loadingCopy(locale, 'offlineBody', subject)}
    />
  )
}

/** Shown when the load finished and there is nothing to show. */
export function DataEmpty({ subject = 'matches', href = '/sports' }: { subject?: LoadingSubject; href?: string }) {
  const { locale } = useI18n()
  return (
    <StateCard
      role="status"
      tone="muted"
      icon={CalendarX2}
      title={loadingCopy(locale, 'emptyTitle', subject)}
      body={loadingCopy(locale, 'emptyBody')}
      action={
        <Link href={href} className={actionClass}>
          {loadingCopy(locale, 'emptyAction')}
        </Link>
      }
    />
  )
}

/**
 * Thin bar for background refreshes while content is already on screen.
 * Content stays visible and usable; place it as the first child of the section being refreshed.
 */
export function RefreshBar({ active }: { active: boolean }) {
  const { locale } = useI18n()
  if (!active) return null
  return (
    <div role="status" className="relative h-0.5 w-full overflow-hidden rounded-full bg-surface-2">
      <span className="sr-only">{loadingCopy(locale, 'refreshing')}</span>
      <span className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-primary motion-safe:animate-[refresh-slide_1.2s_ease-in-out_infinite]" />
      <style>{'@keyframes refresh-slide{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}'}</style>
    </div>
  )
}
