import { cn } from '@/lib/utils'

// Each shape mirrors the padding and height of the real component, so nothing jumps when data arrives.

export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('block rounded-md bg-surface-2 motion-safe:animate-pulse', className)} />
}

function SkeletonRow() {
  return (
    <li className="flex flex-col gap-2 border-b border-border px-3 py-3 last:border-0 md:flex-row md:items-center md:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Skeleton className="h-3 w-10 shrink-0" />
        <div className="flex flex-1 flex-col gap-2 py-0.5">
          <Skeleton className="h-3.5 w-2/5" />
          <Skeleton className="h-3.5 w-1/3" />
        </div>
      </div>
      <div className="flex gap-1.5 md:w-[340px]">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-11 flex-1 rounded-lg" />
        ))}
        <Skeleton className="hidden h-11 flex-1 rounded-lg sm:block" />
      </div>
    </li>
  )
}

export function MatchListSkeleton({
  title,
  rows = 4,
  headerSlot,
}: {
  title?: string
  rows?: number
  headerSlot?: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-surface">
      <div className="flex min-h-10 items-center justify-between gap-3 bg-surface-2 px-3 py-2.5">
        {title ? <p className="text-sm font-extrabold">{title}</p> : <Skeleton className="h-3.5 w-32 bg-accent" />}
        {headerSlot}
      </div>
      <ul>
        {Array.from({ length: rows }, (_, i) => (
          <SkeletonRow key={i} />
        ))}
      </ul>
    </div>
  )
}

export function BoostRailSkeleton() {
  return (
    <div className="no-scrollbar -mx-3 flex gap-3 overflow-hidden px-3 lg:mx-0 lg:grid lg:grid-cols-3 lg:px-0">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex w-[85%] max-w-80 shrink-0 flex-col gap-3 rounded-xl bg-surface p-4 lg:w-auto lg:max-w-none">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      ))}
    </div>
  )
}

export function TilesSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl bg-surface p-3">
          <Skeleton className="size-10 shrink-0 rounded-lg" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="flex min-h-56 flex-col justify-center gap-3 rounded-xl bg-surface p-6 md:min-h-72 md:items-end md:p-8">
      <div className="flex w-full max-w-md flex-col gap-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-4/5" />
        <Skeleton className="h-3.5 w-3/5" />
        <div className="flex gap-2">
          <Skeleton className="h-11 w-36 rounded-lg" />
          <Skeleton className="h-11 w-36 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
