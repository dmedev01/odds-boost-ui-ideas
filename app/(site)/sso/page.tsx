import type { Metadata } from 'next'
import { Loader2 } from 'lucide-react'
import { AuthShell } from '@/components/v4/auth-shell'
import { Notice, PrimaryButton, StateSwitcher, pickState, type StatePageProps } from '@/components/v4/ui-states'

export const metadata: Metadata = { title: 'Signing you in' }

const STATES = [
  { id: 'restoring', label: 'Restoring', uc: 'ACC-014' },
  { id: 'restored', label: 'Restored', uc: 'CORE-003' },
  { id: 'invalid', label: 'Invalid token', uc: 'ACC-014' },
  { id: 'mismatch', label: 'Other user logged in', uc: 'ACC-014' },
] as const

export default async function SsoPage({ searchParams }: StatePageProps) {
  const { state: requested } = await searchParams
  const state = pickState(STATES, requested).id

  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath="/sso" />
      <AuthShell title="Signing you in">
        {state === 'restoring' && (
          <p className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> Restoring your session from the link
          </p>
        )}
        {state === 'restored' && (
          <Notice tone="success" title="Welcome back, Jean">Taking you to Man United vs Arsenal. The link token was removed from the address bar.</Notice>
        )}
        {state === 'invalid' && (
          <Notice tone="warning" title="This sign-in link is no longer valid" action={<PrimaryButton href="/sign-in">Log in</PrimaryButton>}>
            You can still browse. Log in to bet.
          </Notice>
        )}
        {state === 'mismatch' && (
          <Notice
            tone="warning"
            title="Someone else is logged in on this device"
            action={
              <>
                <PrimaryButton>Switch to Jean</PrimaryButton>
                <PrimaryButton variant="secondary">Stay as Paul</PrimaryButton>
              </>
            }
          >
            The link belongs to Jean M. You are currently logged in as Paul N.
          </Notice>
        )}
      </AuthShell>
    </div>
  )
}
