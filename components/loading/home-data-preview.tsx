import Link from 'next/link'
import { cn } from '@/lib/utils'

export const HOME_DATA_STATES = ['loading', 'slow', 'failed', 'offline', 'empty', 'refreshing', 'page'] as const
export type HomeDataState = (typeof HOME_DATA_STATES)[number]

const LABELS: Record<HomeDataState, string> = {
  loading: 'Loading',
  slow: 'Slow',
  failed: 'Failed',
  offline: 'Offline',
  empty: 'Empty',
  refreshing: 'Refreshing',
  page: 'Full page',
}

export function parseHomeDataState(value: string | undefined): HomeDataState | null {
  return HOME_DATA_STATES.find((s) => s === value) ?? null
}

/**
 * Design-review switch: only rendered when the homepage is opened with ?data=<state>.
 * Normal visitors never see it.
 */
export function HomeDataPreview({ current }: { current: HomeDataState }) {
  return (
    <nav
      aria-label="Data state preview"
      className="flex flex-col gap-2 rounded-xl bg-surface p-3 ring-1 ring-primary/60"
    >
      <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
        Previewing data state on homepage
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {HOME_DATA_STATES.map((s) => (
          <li key={s}>
            <Link
              href={`/?data=${s}`}
              scroll={false}
              aria-current={s === current ? 'page' : undefined}
              className={cn(
                'flex h-8 items-center rounded-full px-3 text-xs font-bold ring-1',
                s === current
                  ? 'bg-primary text-primary-foreground ring-primary'
                  : 'bg-surface-2 text-foreground/80 ring-border hover:ring-primary',
              )}
            >
              {LABELS[s]}
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/"
            className="flex h-8 items-center rounded-full px-3 text-xs font-bold text-primary ring-1 ring-border hover:ring-primary"
          >
            Live data
          </Link>
        </li>
      </ul>
    </nav>
  )
}
