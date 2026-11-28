import type { Metadata } from 'next'
import { AuthShell } from '@/components/v4/auth-shell'
import { Field, Notice, OtpCells, PrimaryButton, StateSwitcher, Steps, TextInput, pickState, type StatePageProps } from '@/components/v4/ui-states'

export const metadata: Metadata = { title: 'Quick sign up' }

const STATES = [
  { id: 'phone', label: 'Phone', uc: 'ACC-003' },
  { id: 'phone-taken', label: 'Number in use', uc: 'ACC-003' },
  { id: 'otp', label: 'OTP', uc: 'ACC-003' },
  { id: 'otp-wrong', label: 'Wrong OTP', uc: 'ACC-003' },
  { id: 'otp-expired', label: 'OTP expired', uc: 'ACC-003' },
  { id: 'password', label: 'Set password', uc: 'ACC-003' },
  { id: 'done', label: 'Welcome', uc: 'ACC-003' },
] as const

export default async function QuickSignupPage({ searchParams }: StatePageProps) {
  const { state: requested } = await searchParams
  const state = pickState(STATES, requested).id
  const step = state.startsWith('phone') ? 0 : state.startsWith('otp') ? 1 : state === 'password' ? 2 : 3

  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath="/signup/quick" />
      <AuthShell title="Join in 30 seconds" description="Phone number, code, password. You can complete your profile later.">
        <Steps steps={['Phone', 'Code', 'Password']} current={Math.min(step, 2)} />
        {state.startsWith('phone') && (
          <>
            <Field label="Mobile number" error={state === 'phone-taken' ? 'This number already has an account.' : undefined}>
              <TextInput defaultValue="677 12 34 56" inputMode="tel" invalid={state === 'phone-taken'} />
            </Field>
            {state === 'phone-taken' && (
              <Notice tone="info" title="Already registered?" action={<><PrimaryButton variant="secondary" href="/sign-in">Log in</PrimaryButton><PrimaryButton variant="ghost" href="/forgot-password">Reset password</PrimaryButton></>} />
            )}
            <label className="flex items-start gap-2 text-sm font-semibold leading-relaxed">
              <input type="checkbox" defaultChecked className="mt-1 size-4 accent-primary" />I am 18 or older and accept the terms and the privacy policy.
            </label>
            <PrimaryButton>Send code</PrimaryButton>
          </>
        )}
        {state.startsWith('otp') && (
          <>
            <p className="text-sm leading-relaxed text-foreground/80">We sent a 6-digit code to 677 12 34 56.</p>
            <OtpCells value={state === 'otp-wrong' ? '123456' : ''} invalid={state !== 'otp'} />
            {state === 'otp-wrong' && <Notice tone="error" title="Incorrect code">2 attempts left.</Notice>}
            {state === 'otp-expired' && (
              <Notice tone="warning" title="This code has expired" action={<PrimaryButton variant="secondary">Send a new code</PrimaryButton>}>
                Codes are valid for 5 minutes.
              </Notice>
            )}
            <div className="flex flex-wrap gap-2">
              <PrimaryButton disabled={state === 'otp-expired'}>Verify</PrimaryButton>
              <PrimaryButton variant="ghost">Change number</PrimaryButton>
            </div>
          </>
        )}
        {state === 'password' && (
          <>
            <Field label="Password" hint="At least 8 characters with a number">
              <TextInput type="password" defaultValue="secret123" />
            </Field>
            <Field label="Promo code (optional)">
              <TextInput placeholder="WELCOME" className="uppercase" />
            </Field>
            <PrimaryButton>Create account</PrimaryButton>
          </>
        )}
        {state === 'done' && (
          <Notice tone="success" title="Account created" action={<><PrimaryButton href="/wallet/deposit">Make a deposit</PrimaryButton><PrimaryButton variant="secondary" href="/">Browse bets</PrimaryButton></>}>
            You are logged in. Complete your profile before your first withdrawal.
          </Notice>
        )}
      </AuthShell>
    </div>
  )
}
