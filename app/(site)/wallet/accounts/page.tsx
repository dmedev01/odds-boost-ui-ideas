import type { Metadata } from 'next'
import { CheckCircle2, Plus, Smartphone } from 'lucide-react'
import { WalletTabs } from '@/components/v4/wallet-tabs'
import {
  Field,
  Notice,
  OtpCells,
  Panel,
  PrimaryButton,
  StateSwitcher,
  TextInput,
  pickState,
  type StatePageProps,
} from '@/components/v4/ui-states'

export const metadata: Metadata = { title: 'Payment accounts' }

const STATES = [
  { id: 'list', label: 'Saved accounts', uc: 'PAY-010' },
  { id: 'empty', label: 'No accounts', uc: 'PAY-008' },
  { id: 'add', label: 'Add account', uc: 'PAY-010' },
  { id: 'add-invalid', label: 'Invalid phone', uc: 'PAY-010' },
  { id: 'add-otp', label: 'Verify OTP', uc: 'PAY-010' },
  { id: 'add-otp-wrong', label: 'Wrong OTP', uc: 'PAY-010' },
  { id: 'added', label: 'Added', uc: 'PAY-010' },
] as const

const ACCOUNTS = [
  { op: 'MTN MoMo', number: '677 ** ** 56', main: true },
  { op: 'Orange Money', number: '699 ** ** 12', main: false },
]

export default async function AccountsPage({ searchParams }: StatePageProps) {
  const { state: requested } = await searchParams
  const state = pickState(STATES, requested).id
  const adding = state.startsWith('add')

  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath="/wallet/accounts" />
      <WalletTabs current="accounts" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Payout accounts" description="Withdrawals can only go to numbers verified here.">
          {state === 'empty' ? (
            <Notice tone="info" title="No payout account yet">Add a mobile money number to withdraw.</Notice>
          ) : (
            <ul className="flex flex-col gap-2">
              {[...ACCOUNTS, ...(state === 'added' ? [{ op: 'MTN MoMo', number: '650 ** ** 88', main: false }] : [])].map((a) => (
                <li key={a.number} className="flex items-center gap-3 rounded-lg bg-surface-2 p-3">
                  <Smartphone className="size-5 text-primary" aria-hidden />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-extrabold">{a.op}</span>
                    <span className="font-mono text-xs text-muted-foreground">{a.number}</span>
                  </div>
                  {a.main && <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-extrabold text-primary">Default</span>}
                  <CheckCircle2 className="size-4 text-success" aria-label="Verified" />
                </li>
              ))}
            </ul>
          )}
          {state === 'added' && <Notice tone="success" title="Account verified">650 ** ** 88 can now receive withdrawals.</Notice>}
          {!adding && (
            <PrimaryButton variant="secondary" href="/wallet/accounts?state=add">
              <Plus className="size-4" aria-hidden /> Add account
            </PrimaryButton>
          )}
        </Panel>
        {adding && (
          <Panel title="Add a mobile money number">
            {state === 'add' || state === 'add-invalid' ? (
              <>
                <Field label="Operator">
                  <TextInput defaultValue="MTN MoMo" readOnly />
                </Field>
                <Field
                  label="Mobile number"
                  hint="Must be registered in your name"
                  error={state === 'add-invalid' ? 'This is not a valid MTN number.' : undefined}
                >
                  <TextInput defaultValue={state === 'add-invalid' ? '612 00' : '650 11 22 88'} inputMode="tel" invalid={state === 'add-invalid'} />
                </Field>
                <PrimaryButton disabled={state === 'add-invalid'}>Send code</PrimaryButton>
              </>
            ) : (
              <>
                <p className="text-sm leading-relaxed text-foreground/80">Enter the code sent to 650 11 22 88.</p>
                <OtpCells value={state === 'add-otp-wrong' ? '000000' : ''} invalid={state === 'add-otp-wrong'} />
                {state === 'add-otp-wrong' && <Notice tone="error" title="Incorrect code">Check the SMS and try again.</Notice>}
                <PrimaryButton>Verify</PrimaryButton>
              </>
            )}
          </Panel>
        )}
      </div>
    </div>
  )
}
