'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, CircleCheck, Gift, Radio, Wallet, type LucideIcon } from 'lucide-react'
import { useI18n } from '@/components/i18n/i18n-provider'
import type { DictKey } from '@/lib/i18n/dictionaries'
import { cn } from '@/lib/utils'

type NotificationKind = 'win' | 'deposit' | 'promo' | 'live'

type SampleNotification = {
  id: string
  kind: NotificationKind
  titleKey: DictKey
  bodyKey: DictKey
  timeKey: DictKey
  href: string
}

const KIND_STYLE: Record<NotificationKind, { icon: LucideIcon; className: string }> = {
  win: { icon: CircleCheck, className: 'bg-success/15 text-success' },
  deposit: { icon: Wallet, className: 'bg-brand/20 text-foreground' },
  promo: { icon: Gift, className: 'bg-primary/15 text-primary' },
  live: { icon: Radio, className: 'bg-destructive/15 text-destructive' },
}

const SAMPLE_NOTIFICATIONS: SampleNotification[] = [
  { id: 'n1', kind: 'win', titleKey: 'notif.sample.win.title', bodyKey: 'notif.sample.win.body', timeKey: 'notif.sample.win.time', href: '/account?tab=bets' },
  { id: 'n2', kind: 'live', titleKey: 'notif.sample.live.title', bodyKey: 'notif.sample.live.body', timeKey: 'notif.sample.live.time', href: '/live' },
  { id: 'n3', kind: 'deposit', titleKey: 'notif.sample.deposit.title', bodyKey: 'notif.sample.deposit.body', timeKey: 'notif.sample.deposit.time', href: '/account' },
  { id: 'n4', kind: 'promo', titleKey: 'notif.sample.promo.title', bodyKey: 'notif.sample.promo.body', timeKey: 'notif.sample.promo.time', href: '/promotions' },
]

const INITIALLY_UNREAD = new Set(['n1', 'n2'])

export function NotificationsBell() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState<Set<string>>(() => new Set(INITIALLY_UNREAD))
  const rootRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const unreadCount = unread.size
  const markRead = (id: string) =>
    setUnread((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={unreadCount > 0 ? t('notif.labelUnread', { count: unreadCount }) : t('notif.label')}
        className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground"
      >
        <Bell className="size-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-extrabold leading-4 text-primary-foreground">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={t('notif.title')}
          className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-black/40"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <h2 className="text-sm font-extrabold">{t('notif.title')}</h2>
            <button
              type="button"
              onClick={() => setUnread(new Set())}
              disabled={unreadCount === 0}
              className="text-xs font-bold text-primary hover:underline disabled:pointer-events-none disabled:text-muted-foreground"
            >
              {t('notif.markAll')}
            </button>
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {SAMPLE_NOTIFICATIONS.map((item) => {
              const style = KIND_STYLE[item.kind]
              const Icon = style.icon
              const isUnread = unread.has(item.id)
              return (
                <li key={item.id} className="border-b border-border last:border-b-0">
                  <Link
                    href={item.href}
                    onClick={() => {
                      markRead(item.id)
                      setOpen(false)
                    }}
                    className={cn('flex gap-3 px-4 py-3 hover:bg-surface', isUnread && 'bg-surface/60')}
                  >
                    <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', style.className)}>
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-bold">{t(item.titleKey)}</span>
                        {isUnread && (
                          <span className="size-2 shrink-0 rounded-full bg-primary">
                            <span className="sr-only">{t('notif.unread')}</span>
                          </span>
                        )}
                      </span>
                      <span className="text-pretty text-xs leading-relaxed text-muted-foreground">{t(item.bodyKey)}</span>
                      <span className="text-[11px] font-semibold text-muted-foreground">{t(item.timeKey)}</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
