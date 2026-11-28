import { Loader2, Maximize2, X } from 'lucide-react'
import { Notice, PrimaryButton } from '@/components/v4/ui-states'
import { cn } from '@/lib/utils'

export type LaunchState = 'lobby' | 'loading' | 'real' | 'demo' | 'login-required' | 'launch-failed' | 'geo-blocked'

/** Stand-in for the provider iframe: the real binding swaps the inner frame for the game URL. */
export function GameLaunch({ name, provider, state, basePath }: { name: string; provider: string; state: LaunchState; basePath: string }) {
  const playing = state === 'real' || state === 'demo'
  return (
    <section aria-label={name} className="flex flex-col gap-3">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black">{name}</h1>
          <p className="text-xs font-bold text-muted-foreground">{provider}</p>
        </div>
        {playing && (
          <div className="flex items-center gap-2">
            <span className={cn('rounded-full px-3 py-1 text-xs font-extrabold', state === 'real' ? 'bg-primary text-primary-foreground' : 'bg-surface-2 ring-1 ring-border')}>
              {state === 'real' ? 'Real money · 12,450 FCFA' : 'Demo · fun credits'}
            </span>
            <button type="button" aria-label="Full screen" className="rounded-md p-2 hover:bg-surface-2"><Maximize2 className="size-4" aria-hidden /></button>
            <a href={basePath} aria-label="Close game" className="rounded-md p-2 hover:bg-surface-2"><X className="size-4" aria-hidden /></a>
          </div>
        )}
      </header>

      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-brand ring-1 ring-border">
        {state === 'loading' && (
          <p className="flex items-center gap-2 text-sm font-bold"><Loader2 className="size-5 animate-spin motion-reduce:animate-none" aria-hidden /> Loading {name}</p>
        )}
        {playing && (
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="font-mono text-6xl font-black tabular-nums text-primary">2.47x</span>
            <span className="text-xs font-bold text-foreground/70">Provider game frame</span>
          </div>
        )}
        {(state === 'lobby' || state === 'login-required' || state === 'launch-failed' || state === 'geo-blocked') && (
          <div className="flex max-w-sm flex-col items-center gap-3 p-4 text-center">
            {state === 'lobby' && (
              <>
                <p className="text-pretty text-sm font-semibold text-foreground/80">Play for real money or try it free.</p>
                <div className="flex gap-2">
                  <PrimaryButton href={`${basePath}?state=real`}>Play now</PrimaryButton>
                  <PrimaryButton variant="secondary" href={`${basePath}?state=demo`}>Demo</PrimaryButton>
                </div>
              </>
            )}
            {state === 'login-required' && (
              <Notice tone="info" title="Log in to play for real" action={<><PrimaryButton href="/sign-in">Log in</PrimaryButton><PrimaryButton variant="secondary" href={`${basePath}?state=demo`}>Play demo</PrimaryButton></>}>
                You will return to {name} after logging in.
              </Notice>
            )}
            {state === 'launch-failed' && (
              <Notice tone="error" title={`${name} could not start`} action={<PrimaryButton variant="secondary">Try again</PrimaryButton>}>
                The game provider did not respond. Your balance was not charged.
              </Notice>
            )}
            {state === 'geo-blocked' && <Notice tone="warning" title="Not available in your region" />}
          </div>
        )}
      </div>
    </section>
  )
}
