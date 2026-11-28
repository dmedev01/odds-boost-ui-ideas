import type { Metadata } from 'next'
import { Landmark, Smartphone } from 'lucide-react'
import { WalletTabs } from '@/components/v4/wallet-tabs'
import {
  DefinitionRows,
  Field,
  Notice,
  OtpCells,
  Panel,
  PrimaryButton,
  StateSwitcher,
  Steps,
  TextInput,
  pickState,
  type StatePageProps,
} from '@/components/v4/ui-states'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Withdraw' }

const STATES = [
  { id: 'momo', label: 'Mobile money', uc: 'PAY-006' },
  { id: 'momo-otp', label: 'OTP step', uc: 'PAY-006' },
  { id: 'momo-otp-wrong', label: 'Wrong OTP', uc: 'E2E-03' },
  { id: 'direct', label: 'No OTP (flag)', uc: 'PAY-006' },
  { id: 'submitted', label: 'Submitted', uc: 'PAY-006' },
  { id: 'insufficient', label: 'Over withdrawable', uc: 'PAY-006' },
  { id: 'bank', label: 'Bank transfer', uc: 'PAY-007' },
  { id: 'bank-missing', label: 'No bank selected', uc: 'PAY-007' },
  { id: 'blocked-profile', label: 'Profile incomplete', uc: 'PAY-008' },
  { id: 'blocked-account', label: 'No saved account', uc: 'PAY-008' },
  { id: 'blocked-zero', label: 'Nothing withdrawable', uc: 'PAY-008' },
] as const

export default async function WithdrawPage({ searchParams }: StatePageProps) {
  const { state: requested } = await searchParams
  const state = pickState(STATES, requested).id
  const bank = state.startsWith('bank')

  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath="/wallet/withdraw" />
      <WalletTabs current="withdraw" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Panel title="Withdraw" description="Only your withdrawable balance can be paid out. Bonus funds never can.">
          {!state.startsWith('blocked') && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: false, label: 'Mobile money', icon: Smartphone },
                { id: true, label: 'Bank transfer', icon: Landmark },
              ].map(({ id, label, icon: Icon }) => (
                <span
                  key={label}
                  aria-current={bank === id || undefined}
                  className={cn(
                    'flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-extrabold ring-1',
                    bank === id ? 'bg-brand ring-primary' : 'bg-surface-2 ring-border',
                  )}
                >
                  <Icon className="size-4" aria-hidden /> {label}
                </span>
              ))}
            </div>
          )}
          <WithdrawBody state={state} />
        </Panel>
        <Panel title="Balances">
          <DefinitionRows
            rows={[
              ['Withdrawable', state === 'blocked-zero' ? '0 FCFA' : '9,800 FCFA'],
              ['Pending bets', '2,650 FCFA'],
              ['Bonus', '2,000 FCFA'],
              ['Minimum payout', '1,000 FCFA'],
            ]}
          />
        </Panel>
      </div>
    </div>
  )
}

function WithdrawBody({ state }: { state: string }) {
  switch (state) {
    case 'momo-otp':
    case 'momo-otp-wrong': {
      const wrong = state === 'momo-otp-wrong'
      return (
        <>
          <Steps steps={['Amount', 'Confirm code', 'Done']} current={1} />
          <p className="text-sm leading-relaxed text-foreground/80">
            We sent a 6-digit code to 677 ** ** 56 to confirm the withdrawal of 5,000 FCFA.
          </p>
          <OtpCells value={wrong ? '119204' : ''} invalid={wrong} />
          {wrong && (
            <Notice tone="error" title="Incorrect code">
              2 attempts left. Your withdrawal request is kept, so you do not need to start again.
            </Notice>
          )}
          <div className="flex flex-wrap gap-2">
            <PrimaryButton>Confirm withdrawal</PrimaryButton>
            <PrimaryButton variant="secondary">Resend code (0:45)</PrimaryButton>
          </div>
        </>
      )
    }
    case 'submitted':
      return (
        <Notice tone="success" title="Withdrawal requested" action={<PrimaryButton variant="secondary" href="/wallet/history">View in history</PrimaryButton>}>
          5,000 FCFA to MTN 677 ** ** 56. Usually paid within 30 minutes. Reference WD-20931.
        </Notice>
      )
    case 'insufficient':
      return (
        <>
          <MomoFields amount="15000" error="You can withdraw up to 9,800 FCFA. Bonus and pending funds are excluded." />
          <PrimaryButton disabled>Withdraw</PrimaryButton>
        </>
      )
    case 'bank':
    case 'bank-missing': {
      const missing = state === 'bank-missing'
      return (
        <>
          <Field label="Bank" error={missing ? 'Choose a bank.' : undefined}>
            <TextInput defaultValue={missing ? '' : 'Afriland First Bank'} placeholder="Select your bank" invalid={missing} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Account holder">
              <TextInput defaultValue="Jean Mbarga" />
            </Field>
            <Field label="IBAN / account number">
              <TextInput defaultValue="CM21 10005 00001 0123456789" className="font-mono" />
            </Field>
          </div>
          <Field label="Amount (FCFA)" hint="Bank transfers take 1 to 3 business days">
            <TextInput defaultValue="5000" inputMode="numeric" />
          </Field>
          <PrimaryButton>Request transfer</PrimaryButton>
        </>
      )
    }
    case 'blocked-profile':
      return (
        <Notice tone="warning" title="Complete your profile to withdraw" action={<PrimaryButton href="/account/profile?state=incomplete">Complete profile</PrimaryButton>}>
          We need your full name, date of birth and ID number before paying out.
        </Notice>
      )
    case 'blocked-account':
      return (
        <Notice tone="warning" title="Add a payout account first" action={<PrimaryButton href="/wallet/accounts?state=add">Add account</PrimaryButton>}>
          Withdrawals go only to a mobile money number you have verified.
        </Notice>
      )
    case 'blocked-zero':
      return (
        <Notice tone="info" title="Nothing to withdraw yet" action={<PrimaryButton variant="secondary" href="/">Place a bet</PrimaryButton>}>
          Your withdrawable balance is 0 FCFA. Winnings become withdrawable once bets settle.
        </Notice>
      )
    default:
      return (
        <>
          <MomoFields amount="5000" />
          {state === 'direct' && (
            <Notice tone="info" title="No confirmation code needed">This brand skips the OTP step. The request is sent straight away.</Notice>
          )}
          <PrimaryButton>{state === 'direct' ? 'Withdraw now' : 'Continue'}</PrimaryButton>
        </>
      )
  }
}

function MomoFields({ amount, error }: { amount: string; error?: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Pay to" hint="Verified account">
        <TextInput defaultValue="MTN · 677 ** ** 56" readOnly />
      </Field>
      <Field label="Amount (FCFA)" error={error}>
        <TextInput defaultValue={amount} inputMode="numeric" invalid={Boolean(error)} />
      </Field>
    </div>
  )
}
