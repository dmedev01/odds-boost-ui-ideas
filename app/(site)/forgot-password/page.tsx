import type { Metadata } from 'next'
import { AuthShell } from '@/components/v4/auth-shell'
import { Field, Notice, OtpCells, PrimaryButton, StateSwitcher, Steps, TextInput, pickState, type StatePageProps } from '@/components/v4/ui-states'

export const metadata: Metadata = { title: 'Reset password' }

const STATES = [
  { id: 'phone', label: 'Phone', uc: 'ACC-006' },
  { id: 'unknown', label: 'Unknown number', uc: 'ACC-006' },
  { id: 'code', label: 'Code', uc: 'ACC-006' },
  { id: 'code-wrong', label: 'Wrong code', uc: 'ACC-006' },
  { id: 'new-password', label: 'New password', uc: 'ACC-006' },
  { id: 'mismatch', label: 'Mismatch', uc: 'ACC-006' },
  { id: 'done', label: 'Done', uc: 'ACC-006' },
] as const

export default async function ForgotPasswordPage({ searchParams }: StatePageProps) {
  const { state: requested } = await searchParams
  const state = pickState(STATES, requested).id
  const step = state === 'phone' || state === 'unknown' ? 0 : state.startsWith('code') ? 1 : 2

  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath="/forgot-password" />
      <AuthShell title="Reset your password">
        {state !== 'done' && <Steps steps={['Phone', 'Code', 'New password']} current={step} />}
        {(state === 'phone' || state === 'unknown') && (
          <>
            <Field label="Mobile number" error={state === 'unknown' ? 'No account uses this number.' : undefined}>
              <TextInput defaultValue="677 12 34 56" inputMode="tel" invalid={state === 'unknown'} />
            </Field>
            {state === 'unknown' && <PrimaryButton variant="ghost" href="/signup/quick">Create an account instead</PrimaryButton>}
            <PrimaryButton>Send code</PrimaryButton>
          </>
        )}
        {state.startsWith('code') && (
          <>
            <OtpCells value={state === 'code-wrong' ? '909090' : ''} invalid={state === 'code-wrong'} label="Reset code" />
            {state === 'code-wrong' && <Notice tone="error" title="Incorrect code">2 attempts left.</Notice>}
            <div className="flex flex-wrap gap-2">
              <PrimaryButton>Verify</PrimaryButton>
              <PrimaryButton variant="secondary">Resend (0:30)</PrimaryButton>
            </div>
          </>
        )}
        {(state === 'new-password' || state === 'mismatch') && (
          <>
            <Field label="New password" hint="At least 8 characters with a number"><TextInput type="password" defaultValue="newpass123" /></Field>
            <Field label="Confirm" error={state === 'mismatch' ? 'Passwords do not match.' : undefined}>
              <TextInput type="password" defaultValue={state === 'mismatch' ? 'newpass12' : 'newpass123'} invalid={state === 'mismatch'} />
            </Field>
            <PrimaryButton disabled={state === 'mismatch'}>Save password</PrimaryButton>
          </>
        )}
        {state === 'done' && (
          <Notice tone="success" title="Password updated" action={<PrimaryButton href="/sign-in">Log in</PrimaryButton>}>
            Other devices have been logged out.
          </Notice>
        )}
      </AuthShell>
    </div>
  )
}
