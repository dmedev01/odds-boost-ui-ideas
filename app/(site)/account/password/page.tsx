import type { Metadata } from 'next'
import { AuthShell } from '@/components/v4/auth-shell'
import { Field, Notice, PrimaryButton, StateSwitcher, TextInput, pickState, type StatePageProps } from '@/components/v4/ui-states'

export const metadata: Metadata = { title: 'Change password' }

const STATES = [
  { id: 'form', label: 'Form', uc: 'ACC-007' },
  { id: 'wrong-current', label: 'Wrong current', uc: 'ACC-007' },
  { id: 'weak', label: 'Too weak', uc: 'ACC-007' },
  { id: 'saved', label: 'Saved', uc: 'ACC-007' },
] as const

export default async function ChangePasswordPage({ searchParams }: StatePageProps) {
  const { state: requested } = await searchParams
  const state = pickState(STATES, requested).id

  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath="/account/password" />
      <AuthShell title="Change password">
        {state === 'saved' ? (
          <Notice tone="success" title="Password changed" action={<PrimaryButton variant="secondary" href="/account">Back to account</PrimaryButton>} />
        ) : (
          <>
            <Field label="Current password" error={state === 'wrong-current' ? 'Current password is incorrect.' : undefined}>
              <TextInput type="password" defaultValue="oldpass1" invalid={state === 'wrong-current'} />
            </Field>
            <Field label="New password" error={state === 'weak' ? 'Use at least 8 characters including a number.' : undefined} hint="At least 8 characters with a number">
              <TextInput type="password" defaultValue={state === 'weak' ? 'abc' : 'newpass123'} invalid={state === 'weak'} />
            </Field>
            <Field label="Confirm new password"><TextInput type="password" defaultValue="newpass123" /></Field>
            <PrimaryButton disabled={state === 'weak'}>Update password</PrimaryButton>
          </>
        )}
      </AuthShell>
    </div>
  )
}
