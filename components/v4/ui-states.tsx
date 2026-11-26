import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface UiState {
  id: string
  label: string
  uc: string
}

export function pickState<T extends UiState>(states: readonly T[], requested?: string): T {
  return states.find((s) => s.id === requested) ?? states[0]
}

export function StateSwitcher({
  states,
  current,
  basePath,
}: {
  states: readonly UiState[]
  current: string
  basePath: string
}) {
  return (
    <nav aria-label="UI states" className="mb-4 flex flex-col gap-2 rounded-xl bg-surface p-3 ring-1 ring-border">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">V4 UI states</p>
        <Link href="/v4" className="text-xs font-bold text-primary hover:underline">
          All use cases
        </Link>
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {states.map((s) => {
          const active = s.id === current
          return (
            <li key={s.id}>
              <Link
                href={`${basePath}?state=${s.id}`}
                scroll={false}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-bold ring-1',
                  active ? 'bg-primary text-primary-foreground ring-primary' : 'bg-surface-2 text-foreground/80 ring-border hover:ring-primary',
                )}
              >
                {s.label}
                <span className={cn('font-mono text-[10px]', active ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                  {s.uc}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function Panel({
  title,
  description,
  children,
  className,
}: {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('flex flex-col gap-4 rounded-xl bg-surface p-5', className)}>
      {(title || description) && (
        <header className="flex flex-col gap-1">
          {title && <h2 className="text-balance text-lg font-black">{title}</h2>}
          {description && <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{description}</p>}
        </header>
      )}
      {children}
    </section>
  )
}

const TONES = {
  info: { icon: Info, cls: 'bg-brand/40 ring-brand text-foreground' },
  success: { icon: CheckCircle2, cls: 'bg-success/15 ring-success/50 text-foreground' },
  warning: { icon: AlertTriangle, cls: 'bg-primary/15 ring-primary/50 text-foreground' },
  error: { icon: XCircle, cls: 'bg-destructive/15 ring-destructive/50 text-foreground' },
} as const

export function Notice({
  tone = 'info',
  title,
  children,
  action,
}: {
  tone?: keyof typeof TONES
  title: string
  children?: React.ReactNode
  action?: React.ReactNode
}) {
  const { icon: Icon, cls } = TONES[tone]
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-lg p-3 ring-1', cls)}>
      <Icon className={cn('mt-0.5 size-5 shrink-0', tone === 'error' ? 'text-destructive' : tone === 'success' ? 'text-success' : 'text-primary')} aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-sm font-extrabold">{title}</p>
        {children && <div className="text-pretty text-sm leading-relaxed text-foreground/80">{children}</div>}
        {action && <div className="mt-1 flex flex-wrap gap-2">{action}</div>}
      </div>
    </div>
  )
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-bold">
      {label}
      {children}
      {error ? (
        <span className="text-xs font-bold text-destructive">{error}</span>
      ) : (
        hint && <span className="text-xs font-semibold text-muted-foreground">{hint}</span>
      )}
    </label>
  )
}

export function TextInput({
  invalid,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        'h-11 rounded-lg bg-surface-2 px-3 text-sm font-semibold ring-1 ring-border outline-none placeholder:text-muted-foreground focus:ring-primary disabled:opacity-60',
        invalid && 'ring-destructive',
        className,
      )}
      {...props}
    />
  )
}

export function OtpCells({
  value = '',
  length = 6,
  invalid,
  label = 'Verification code',
}: {
  value?: string
  length?: number
  invalid?: boolean
  label?: string
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-bold">{label}</legend>
      <div className={cn('flex gap-2', invalid && 'motion-safe:animate-[shake_0.3s_ease-in-out]')}>
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            inputMode="numeric"
            maxLength={1}
            defaultValue={value[i] ?? ''}
            aria-label={`Digit ${i + 1}`}
            aria-invalid={invalid || undefined}
            className={cn(
              'size-11 rounded-lg bg-surface-2 text-center font-mono text-lg font-black ring-1 outline-none focus:ring-primary',
              invalid ? 'ring-destructive' : 'ring-border',
            )}
          />
        ))}
      </div>
    </fieldset>
  )
}

export function PrimaryButton({
  children,
  disabled,
  href,
  variant = 'primary',
  className,
}: {
  children: React.ReactNode
  disabled?: boolean
  href?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
}) {
  const cls = cn(
    'inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-50',
    variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
    variant === 'secondary' && 'bg-surface-2 text-foreground ring-1 ring-border hover:ring-primary',
    variant === 'ghost' && 'text-primary hover:underline',
    className,
  )
  if (href && !disabled)
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    )
  return (
    <button type="button" disabled={disabled} className={cls}>
      {children}
    </button>
  )
}

export function Steps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex gap-2" aria-label="Progress">
      {steps.map((s, i) => (
        <li key={s} className="flex flex-1 flex-col gap-1.5" aria-current={i === current ? 'step' : undefined}>
          <span className={cn('h-1 rounded-full', i <= current ? 'bg-primary' : 'bg-surface-2')} />
          <span className={cn('text-xs font-bold', i === current ? 'text-foreground' : 'text-muted-foreground')}>{s}</span>
        </li>
      ))}
    </ol>
  )
}

export function DefinitionRows({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="flex flex-col divide-y divide-border rounded-lg bg-surface-2">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
          <dt className="font-semibold text-muted-foreground">{k}</dt>
          <dd className="text-right font-extrabold">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export type StatePageProps = { searchParams: Promise<{ state?: string }> }
