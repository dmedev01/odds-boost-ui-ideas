import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface StripItem {
  key: string
  label: string
  count?: number
  href: string
  active: boolean
}

export function PillStrip({ label, items }: { label: string; items: StripItem[] }) {
  return (
    <nav aria-label={label} className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          aria-current={item.active ? 'page' : undefined}
          className={cn(
            'flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold',
            item.active ? 'bg-primary text-primary-foreground' : 'bg-surface hover:bg-surface-2',
          )}
        >
          {item.label}
          {item.count !== undefined && (
            <span className={cn('text-xs tabular-nums', item.active ? 'opacity-80' : 'text-muted-foreground')}>
              {item.count}
            </span>
          )}
        </Link>
      ))}
    </nav>
  )
}

export interface SportTileItem extends StripItem {
  icon: React.ReactNode
}

export function SportTileStrip({ label, items }: { label: string; items: SportTileItem[] }) {
  return (
    <nav aria-label={label} className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          aria-current={item.active ? 'page' : undefined}
          className={cn(
            'flex w-20 shrink-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-center',
            item.active ? 'bg-primary text-primary-foreground' : 'bg-surface hover:bg-surface-2',
          )}
        >
          {item.icon}
          <span className="w-full truncate text-xs font-bold leading-tight">{item.label}</span>
          {item.count !== undefined && (
            <span className={cn('text-[11px] leading-none tabular-nums', item.active ? 'opacity-80' : 'text-muted-foreground')}>
              {item.count}
            </span>
          )}
        </Link>
      ))}
    </nav>
  )
}

export function Segmented({ label, items }: { label: string; items: StripItem[] }) {
  return (
    <nav aria-label={label} className="no-scrollbar flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-surface p-1">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          aria-current={item.active ? 'page' : undefined}
          className={cn(
            'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold',
            item.active ? 'bg-surface-2 text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {item.key === 'live' && <span className="size-1.5 rounded-full bg-destructive" aria-hidden="true" />}
          {item.label}
          {item.count !== undefined && <span className="tabular-nums opacity-70">{item.count}</span>}
        </Link>
      ))}
    </nav>
  )
}
