import type { Metadata } from 'next'
import { Gift } from 'lucide-react'
import { AuthShell } from '@/components/v4/auth-shell'
import { Field, Notice, PrimaryButton, StateSwitcher, TextInput, pickState } from '@/components/v4/ui-states'

export const metadata: Metadata = { title: 'Your offer' }

const STATES = [
  { id: 'claim', label: 'Claim', uc: 'BON-001' },
  { id: 'code-invalid', label: 'Invalid code', uc: 'BON-002' },
  { id: 'other-customer', label: 'Other customer', uc: 'BON-003' },
  { id: 'not-available', label: 'No offer', uc: 'BON-004' },
  { id: 'email-used', label: 'Email used', uc: 'BON-005' },
  { id: 'claimed', label: 'Claimed', uc: 'GAM-011' },
] as const

export default async function OfferPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>
  searchParams: Promise<{ state?: string }>
}) {
  const [{ code }, { state: requested }] = await Promise.all([params, searchParams])
  const state = pickState(STATES, requested).id

  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath={`/offer/${code}`} />
      <AuthShell title="10 free spins on Aviator" description={`Offer code ${code}. Claim before 30 Nov 2026.`}>
        <Gift className="size-10 text-primary" aria-hidden />
        {(state === 'claim' || state === 'email-used' || state === 'code-invalid') && (
          <>
            <Field label="Offer code" error={state === 'code-invalid' ? 'This code is wrong or has expired.' : undefined}>
              <TextInput defaultValue={state === 'code-invalid' ? 'FS2025' : code} className="uppercase" invalid={state === 'code-invalid'} />
            </Field>
            <Field label="Email" error={state === 'email-used' ? 'This email has already claimed this offer.' : undefined}>
              <TextInput type="email" defaultValue="jean@example.com" invalid={state === 'email-used'} />
            </Field>
            <PrimaryButton disabled={state !== 'claim'}>Claim free spins</PrimaryButton>
          </>
        )}
        {state === 'other-customer' && (
          <Notice tone="warning" title="This offer was sent to someone else" action={<><PrimaryButton>Log out and claim</PrimaryButton><PrimaryButton variant="secondary" href="/">Keep browsing</PrimaryButton></>}>
            You are logged in as Paul N. The link belongs to another account.
          </Notice>
        )}
        {state === 'not-available' && (
          <Notice tone="info" title="No offer available right now" action={<PrimaryButton variant="secondary" href="/promotions">See promotions</PrimaryButton>}>
            This offer has ended or is not available for your account.
          </Notice>
        )}
        {state === 'claimed' && (
          <Notice tone="success" title="10 free spins added" action={<PrimaryButton href="/games/aviator?state=real">Play Aviator</PrimaryButton>}>
            Spins are worth 100 FCFA each and expire in 7 days.
          </Notice>
        )}
      </AuthShell>
    </div>
  )
}
