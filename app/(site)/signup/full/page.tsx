import type { Metadata } from 'next'
import { AuthShell } from '@/components/v4/auth-shell'
import { Field, Notice, PrimaryButton, StateSwitcher, Steps, TextInput, pickState, type StatePageProps } from '@/components/v4/ui-states'

export const metadata: Metadata = { title: 'Sign up' }

const STATES = [
  { id: 'identity', label: 'Identity', uc: 'ACC-004' },
  { id: 'identity-underage', label: 'Under 18', uc: 'ACC-004' },
  { id: 'contact', label: 'Contact', uc: 'ACC-004' },
  { id: 'contact-email-used', label: 'Email in use', uc: 'ACC-004' },
  { id: 'security', label: 'Password', uc: 'ACC-004' },
  { id: 'check-email', label: 'Check email', uc: 'ACC-005' },
] as const

export default async function FullSignupPage({ searchParams }: StatePageProps) {
  const { state: requested } = await searchParams
  const state = pickState(STATES, requested).id
  const step = state.startsWith('identity') ? 0 : state.startsWith('contact') ? 1 : 2

  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath="/signup/full" />
      <AuthShell title="Create your account" description="Full registration lets you withdraw straight away.">
        {state !== 'check-email' && <Steps steps={['Identity', 'Contact', 'Password']} current={step} />}
        {state.startsWith('identity') && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="First name"><TextInput defaultValue="Jean" /></Field>
              <Field label="Last name"><TextInput defaultValue="Mbarga" /></Field>
            </div>
            <Field label="Date of birth" error={state === 'identity-underage' ? 'You must be 18 or older to register.' : undefined}>
              <TextInput type="date" defaultValue={state === 'identity-underage' ? '2010-04-02' : '1994-04-02'} invalid={state === 'identity-underage'} />
            </Field>
            <Field label="ID number" hint="National ID or passport"><TextInput defaultValue="112233445" /></Field>
            <PrimaryButton disabled={state === 'identity-underage'}>Continue</PrimaryButton>
          </>
        )}
        {state.startsWith('contact') && (
          <>
            <Field label="Mobile number"><TextInput defaultValue="677 12 34 56" inputMode="tel" /></Field>
            <Field label="Email" error={state === 'contact-email-used' ? 'This email is linked to another account.' : undefined}>
              <TextInput type="email" defaultValue="jean@example.com" invalid={state === 'contact-email-used'} />
            </Field>
            <Field label="City"><TextInput defaultValue="Douala" /></Field>
            <div className="flex gap-2">
              <PrimaryButton variant="secondary">Back</PrimaryButton>
              <PrimaryButton className="flex-1">Continue</PrimaryButton>
            </div>
          </>
        )}
        {state === 'security' && (
          <>
            <Field label="Password" hint="At least 8 characters with a number"><TextInput type="password" defaultValue="secret123" /></Field>
            <Field label="Confirm password"><TextInput type="password" defaultValue="secret123" /></Field>
            <label className="flex items-start gap-2 text-sm font-semibold leading-relaxed">
              <input type="checkbox" defaultChecked className="mt-1 size-4 accent-primary" />I accept the terms and confirm I am 18 or older.
            </label>
            <PrimaryButton>Create account</PrimaryButton>
          </>
        )}
        {state === 'check-email' && (
          <Notice tone="success" title="Check your inbox" action={<><PrimaryButton variant="secondary">Resend email</PrimaryButton><PrimaryButton variant="ghost" href="/activate?state=code">Enter code instead</PrimaryButton></>}>
            We sent an activation link to jean@example.com. Open it to activate your account.
          </Notice>
        )}
      </AuthShell>
    </div>
  )
}
