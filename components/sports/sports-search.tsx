import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { sportsHref, type SportsQuery } from '@/lib/sports-query'

interface Labels {
  placeholder: string
  label: string
  submit: string
  clear: string
}

export function SportsSearch({ query, labels }: { query: SportsQuery; labels: Labels }) {
  return (
    <form action="/sports" method="get" role="search" className="flex gap-2">
      {query.sport && <input type="hidden" name="sport" value={query.sport} />}
      {query.live && <input type="hidden" name="live" value="1" />}
      {query.when && <input type="hidden" name="when" value={query.when} />}
      <div className="relative flex-1">
        <label htmlFor="sports-q" className="sr-only">
          {labels.label}
        </label>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          id="sports-q"
          name="q"
          type="search"
          defaultValue={query.q}
          placeholder={labels.placeholder}
          maxLength={60}
          autoComplete="off"
          enterKeyHint="search"
          className="h-10 w-full rounded-lg bg-surface pl-9 pr-9 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-search-cancel-button]:hidden"
        />
        {query.q && (
          <Link
            href={sportsHref(query, { q: '' })}
            className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">{labels.clear}</span>
          </Link>
        )}
      </div>
      <button
        type="submit"
        className="h-10 shrink-0 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90"
      >
        {labels.submit}
      </button>
    </form>
  )
}
