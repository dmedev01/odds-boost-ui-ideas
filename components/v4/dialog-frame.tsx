import { cn } from '@/lib/utils'

/** Renders a modal or banner inline over a dimmed page stand-in, so each state can be reviewed without trapping focus. */
export function DialogFrame({
  variant = 'modal',
  children,
}: {
  variant?: 'modal' | 'top-banner' | 'bottom-sheet' | 'toast'
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-96 overflow-hidden rounded-xl bg-surface ring-1 ring-border">
      <div aria-hidden className="absolute inset-0 flex flex-col gap-3 p-5 opacity-40">
        <div className="h-10 rounded-lg bg-brand" />
        <div className="h-28 rounded-lg bg-surface-2" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-20 rounded-lg bg-surface-2" />
          <div className="h-20 rounded-lg bg-surface-2" />
          <div className="h-20 rounded-lg bg-surface-2" />
        </div>
        <div className="h-24 rounded-lg bg-surface-2" />
      </div>
      {variant === 'modal' && <div aria-hidden className="absolute inset-0 bg-background/70" />}
      <div
        className={cn(
          'relative flex w-full p-4',
          variant === 'modal' && 'items-center justify-center',
          variant === 'top-banner' && 'items-start',
          variant === 'bottom-sheet' && 'items-end',
          variant === 'toast' && 'items-end justify-end',
        )}
      >
        <div
          role={variant === 'modal' ? 'dialog' : 'status'}
          aria-modal={variant === 'modal' || undefined}
          className={cn(
            'flex flex-col gap-4 rounded-xl bg-popover p-5 shadow-2xl ring-1 ring-border',
            variant === 'modal' && 'w-full max-w-sm',
            variant === 'top-banner' && 'w-full flex-row items-center',
            variant === 'bottom-sheet' && 'w-full',
            variant === 'toast' && 'w-full max-w-xs',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export function DialogText({ title, body }: { title: string; body?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <h2 className="text-balance text-lg font-black">{title}</h2>
      {body && <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{body}</p>}
    </div>
  )
}
