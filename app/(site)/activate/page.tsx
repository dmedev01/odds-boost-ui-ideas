import type { Metadata } from 'next'
import { Loader2 } from 'lucide-react'
import { AuthShell } from '@/components/v4/auth-shell'
import { Notice, OtpCells, PrimaryButton, StateSwitcher, pickState, type StatePageProps } from '@/components/v4/ui-states'

export const metadata: Metadata = { title: 'Activate account' }

const STATES = [
  { id: 'link-checking', label: 'Opening link', uc: 'CORE-004' },
  { id: 'link-success', label: 'Activated', uc: 'CORE-004' },
  { id: 'link-expired', label: 'Link expired', uc: 'ACC-005' },
  { id: 'already', label: 'Already active', uc: 'ACC-005' },
  { id: 'code', label: 'Enter code', uc: 'ACC-005' },
  { id: 'code-wrong', label: 'Wrong code', uc: 'ACC-005' },
] as const

export default async function ActivatePage({ searchParams }: StatePageProps) {
  const { state: requested } = await searchParams
  const state = pickState(STATES, requested).id

  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath="/activate" />
      <AuthShell title="Activate your account">
        {state === 'link-checking' && (
          <p className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> Checking your activation link
          </p>
        )}
        {state === 'link-success' && (
          <Notice tone="success" title="Your account is active" action={<PrimaryButton href="/">Start betting</PrimaryButton>}>
            You are now logged in as Jean Mbarga.
          </Notice>
        )}
        {state === 'link-expired' && (
          <Notice tone="warning" title="This link has expired" action={<><PrimaryButton>Send a new link</PrimaryButton><PrimaryButton variant="ghost" href="/activate?state=code">Use a code</PrimaryButton></>}>
            Activation links are valid for 24 hours.
          </Notice>
        )}
        {state === 'already' && (
          <Notice tone="info" title="Account already active" action={<PrimaryButton href="/sign-in">Log in</PrimaryButton>} />
        )}
        {state.startsWith('code') && (
          <>
            <p className="text-sm leading-relaxed text-foreground/80">Enter the activation code sent to 677 ** ** 56.</p>
            <OtpCells value={state === 'code-wrong' ? '555555' : ''} invalid={state === 'code-wrong'} label="Activation code" />
            {state === 'code-wrong' && <Notice tone="error" title="Incorrect code">Check the SMS and try again.</Notice>}
            <PrimaryButton>Activate</PrimaryButton>
          </>
        )}
      </AuthShell>
    </div>
  )
}
