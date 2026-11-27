'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, Lock, Search, Star, X } from 'lucide-react'
import { OddsButton } from '@/components/betslip/odds-button'
import { useI18n } from '@/components/i18n/i18n-provider'
import { useLiveBucket } from '@/components/live/live-clock'
import type { DictKey } from '@/lib/i18n/dictionaries'
import { MARKET_GROUPS, type MarketGroup, type MatchMarket } from '@/lib/data/markets'
import { cn } from '@/lib/utils'
import { usePinnedMarkets } from './use-pinned-markets'

type Tab = 'all' | 'popular' | 'pinned' | MarketGroup

/** In the All tab only the first few markets start open, to keep the page short on mobile. */
const OPEN_BY_DEFAULT = 6

export function MarketBoard({ event, markets, live }: { event: string; markets: MatchMarket[]; live: boolean }) {
  const { t } = useI18n()
  const { pinned, toggle: togglePin } = usePinnedMarkets()
  const bucket = useLiveBucket()
  const [tab, setTab] = useState<Tab>('all')
  const [query, setQuery] = useState('')
  const [allOpen, setAllOpen] = useState<boolean | null>(null)
  const [overrides, setOverrides] = useState<Map<string, boolean>>(new Map())

  const pinnedMarkets = markets.filter((m) => pinned.has(m.id))
  const tabs: Tab[] = [
    'all',
    'popular',
    ...(pinnedMarkets.length ? (['pinned'] as const) : []),
    ...MARKET_GROUPS.filter((g) => markets.some((m) => m.group === g)),
  ]
  const activeTab = tabs.includes(tab) ? tab : 'all'

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q) {
      return markets.filter(
        (m) => m.name.toLowerCase().includes(q) || m.outcomes.some((o) => o.label.toLowerCase().includes(q)),
      )
    }
    if (activeTab === 'popular') {
      return markets.filter((m) => m.popular !== undefined).sort((a, b) => a.popular! - b.popular!)
    }
    if (activeTab === 'pinned') return markets.filter((m) => pinned.has(m.id))
    const pool = activeTab === 'all' ? markets : markets.filter((m) => m.group === activeTab)
    return [...pool.filter((m) => pinned.has(m.id)), ...pool.filter((m) => !pinned.has(m.id))]
  }, [markets, activeTab, query, pinned])

  const suspendedId = live && bucket % 3 === 0 ? markets[1 + (bucket % Math.max(1, markets.length - 1))]?.id : undefined

  const isOpen = (id: string, index: number) =>
    overrides.get(id) ?? allOpen ?? (activeTab !== 'all' || query !== '' || index < OPEN_BY_DEFAULT)

  const anyOpen = visible.some((m, i) => isOpen(m.id, i))

  const setAll = (open: boolean) => {
    setAllOpen(open)
    setOverrides(new Map())
  }

  const toggleOne = (id: string, index: number) => {
    setOverrides((prev) => new Map(prev).set(id, !isOpen(id, index)))
  }

  const chooseTab = (next: Tab) => {
    setTab(next)
    setQuery('')
    setAllOpen(null)
    setOverrides(new Map())
  }

  return (
    <section className="flex flex-col gap-3" aria-label={t('event.markets', { n: markets.length })}>
      <div className="sticky top-[100px] z-10 -mx-3 flex flex-col gap-2 bg-background px-3 pb-2 pt-2 lg:mx-0 lg:px-0">
        <nav aria-label={t('event.marketsNav')} className="-mx-3 overflow-x-auto px-3 lg:mx-0 lg:px-0">
          <ul className="flex w-max gap-1.5">
            {tabs.map((id) => {
              const count =
                id === 'all'
                  ? markets.length
                  : id === 'popular'
                    ? markets.filter((m) => m.popular !== undefined).length
                    : id === 'pinned'
                      ? pinnedMarkets.length
                      : markets.filter((m) => m.group === id).length
              const active = activeTab === id && !query
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => chooseTab(id)}
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-sm font-bold transition-colors',
                      active ? 'bg-primary text-primary-foreground' : 'bg-surface text-foreground hover:bg-surface-2',
                    )}
                  >
                    {id === 'pinned' && <Star className="size-3.5 fill-current" aria-hidden="true" />}
                    {t(`event.tab.${id}` as DictKey)}
                    <span className={cn('text-xs', active ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                      {count}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg bg-surface px-3 focus-within:ring-2 focus-within:ring-ring">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">{t('event.searchLabel')}</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('event.search')}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={t('event.clear')}
                className="grid size-6 place-items-center rounded text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </label>
          <button
            type="button"
            onClick={() => setAll(!anyOpen)}
            className="h-10 shrink-0 rounded-lg bg-surface px-3 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            {anyOpen ? t('event.collapseAll') : t('event.expandAll')}
          </button>
        </div>
      </div>

      {activeTab === 'pinned' && !query && <p className="text-xs text-muted-foreground">{t('event.pinnedHint')}</p>}

      {visible.length === 0 ? (
        <p className="rounded-xl bg-surface px-4 py-8 text-center text-sm text-muted-foreground">
          {t('event.noResults', { q: query.trim() })}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((market, index) => (
            <li key={market.id}>
              <MarketCard
                event={event}
                market={market}
                live={live}
                open={isOpen(market.id, index)}
                onToggle={() => toggleOne(market.id, index)}
                pinned={pinned.has(market.id)}
                onPin={() => togglePin(market.id)}
                suspended={market.id === suspendedId}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function MarketCard({
  event,
  market,
  live,
  open,
  onToggle,
  pinned,
  onPin,
  suspended,
}: {
  event: string
  market: MatchMarket
  live: boolean
  open: boolean
  onToggle: () => void
  pinned: boolean
  onPin: () => void
  suspended: boolean
}) {
  const { t } = useI18n()
  const bodyId = `market-${market.id}`

  return (
    <article className="overflow-hidden rounded-xl bg-surface">
      <header className="flex items-center gap-1 pr-1.5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={bodyId}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-2 px-3 text-left"
        >
          <ChevronDown
            className={cn('size-4 shrink-0 text-muted-foreground transition-transform', !open && '-rotate-90')}
            aria-hidden="true"
          />
          <h3 className="truncate text-sm font-extrabold">{market.name}</h3>
          {suspended && (
            <span className="flex shrink-0 items-center gap-1 rounded bg-surface-2 px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground">
              <Lock className="size-3" aria-hidden="true" />
              {t('event.suspended')}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={onPin}
          aria-pressed={pinned}
          aria-label={pinned ? t('event.unpin', { market: market.name }) : t('event.pin', { market: market.name })}
          className={cn(
            'grid size-9 shrink-0 place-items-center rounded-md transition-colors hover:bg-surface-2',
            pinned ? 'text-boost' : 'text-muted-foreground',
          )}
        >
          <Star className={cn('size-4', pinned && 'fill-current')} aria-hidden="true" />
        </button>
      </header>

      {open && (
        <div id={bodyId} className="px-3 pb-3">
          {suspended ? (
            <p className="flex min-h-10 items-center justify-center gap-2 rounded-md bg-surface-2 text-xs font-semibold text-muted-foreground">
              <Lock className="size-3.5" aria-hidden="true" />
              {t('event.suspendedHint')}
            </p>
          ) : market.layout === 'score' ? (
            <ScoreGrid event={event} market={market} live={live} />
          ) : (
            <div
              className={cn(
                'grid gap-1.5',
                market.outcomes.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3',
                market.outcomes.length === 3 && 'grid-cols-3',
              )}
            >
              {market.outcomes.map((o) => (
                <OddsButton
                  key={o.key}
                  selectionKey={o.key}
                  odds={o.odds}
                  was={o.was}
                  label={o.label}
                  live={live && o.was === undefined}
                  ariaLabel={`${event}: ${market.name}, ${o.label}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  )
}

function ScoreGrid({ event, market, live }: { event: string; market: MatchMarket; live: boolean }) {
  const columns = [0, 1, 2].map((c) => market.outcomes.filter((o) => o.column === c))
  const rest = market.outcomes.filter((o) => o.column === undefined)
  const button = (o: MatchMarket['outcomes'][number]) => (
    <OddsButton
      key={o.key}
      selectionKey={o.key}
      odds={o.odds}
      label={o.label}
      live={live}
      ariaLabel={`${event}: ${market.name}, ${o.label}`}
    />
  )

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-3 gap-1.5">
        {columns.map((col, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            {col.map(button)}
          </div>
        ))}
      </div>
      {rest.map(button)}
    </div>
  )
}
