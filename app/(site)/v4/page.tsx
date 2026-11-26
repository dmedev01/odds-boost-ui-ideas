import type { Metadata } from 'next'
import Link from 'next/link'
import { USE_CASE_MODULES, type Coverage } from '@/lib/v4/use-cases'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'V4 use cases',
  description: 'Every use case from the V2 to V4 migration audit and the screen state that covers it.',
}

const COVERAGE: Record<Coverage, { label: string; className: string }> = {
  new: { label: 'New screen', className: 'bg-primary text-primary-foreground' },
  existing: { label: 'Existing', className: 'bg-surface-2 ring-1 ring-border' },
  platform: { label: 'Platform', className: 'bg-background text-muted-foreground ring-1 ring-border' },
}

export default function V4IndexPage() {
  const all = USE_CASE_MODULES.flatMap((m) => m.cases)
  const counts = { new: 0, existing: 0, platform: 0 } as Record<Coverage, number>
  for (const c of all) counts[c.coverage]++

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-balance text-3xl font-black">V4 use cases</h1>
        <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
          {all.length} use cases from the migration audit. Each links to the screen and state that covers it. Use the state bar at the top of each screen to step through variants. Data is mocked; binding comes next.
        </p>
        <ul className="flex flex-wrap gap-2 text-xs font-extrabold">
          {(Object.keys(COVERAGE) as Coverage[]).map((k) => (
            <li key={k} className={cn('rounded-full px-3 py-1', COVERAGE[k].className)}>
              {COVERAGE[k].label} · {counts[k]}
            </li>
          ))}
        </ul>
      </header>

      <nav aria-label="Modules" className="no-scrollbar flex gap-1.5 overflow-x-auto">
        {USE_CASE_MODULES.map((m) => (
          <a key={m.id} href={`#${m.id}`} className="shrink-0 rounded-full bg-surface px-3 py-1.5 text-xs font-extrabold ring-1 ring-border hover:ring-primary">
            {m.id}
          </a>
        ))}
      </nav>

      {USE_CASE_MODULES.map((m) => (
        <section key={m.id} id={m.id} className="flex scroll-mt-20 flex-col gap-2">
          <h2 className="text-lg font-black">
            {m.name} <span className="text-muted-foreground">· {m.cases.length}</span>
          </h2>
          <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl bg-surface">
            {m.cases.map((c) => {
              const body = (
                <>
                  <span className="w-28 shrink-0 font-mono text-xs font-bold text-muted-foreground">{c.id}</span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-bold">{c.title}</span>
                    {c.note && <span className="text-xs leading-relaxed text-muted-foreground">{c.note}</span>}
                  </span>
                  <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-extrabold', COVERAGE[c.coverage].className)}>
                    {COVERAGE[c.coverage].label}
                  </span>
                </>
              )
              return (
                <li key={c.id}>
                  {c.href ? (
                    <Link href={c.href} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2">{body}</Link>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3">{body}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
