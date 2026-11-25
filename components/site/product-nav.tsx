'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { isActive, PRODUCT_NAV } from './nav-items'

export function ProductNav() {
  const pathname = usePathname()
  const search = useSearchParams().toString()

  return (
    <nav aria-label="Products" className="mx-auto max-w-[1440px]">
      <ul className="no-scrollbar flex overflow-x-auto px-1 lg:px-2">
        {PRODUCT_NAV.map((item) => {
          const active = isActive(item, pathname, search)
          const Icon = item.icon
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex h-11 items-center gap-1.5 px-3 text-sm font-bold text-white/80 transition-colors hover:text-white',
                  active && 'text-white after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-t after:bg-primary',
                )}
              >
                <Icon className={cn('size-4', item.label === 'Odds Boost' && 'text-primary')} />
                {item.label}
                {item.label === 'Live' && <span className="size-1.5 rounded-full bg-destructive" aria-hidden="true" />}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
