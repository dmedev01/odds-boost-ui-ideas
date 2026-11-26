import type { Metadata } from 'next'
import { ExternalLink, Loader2, Ticket } from 'lucide-react'
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

export const metadata: Metadata = { title: 'Deposit' }

const STATES = [
  { id: 'momo', label: 'Mobile money', uc: 'PAY-001' },
  { id: 'momo-pending', label: 'Pending', uc: 'E2E-01' },
  { id: 'momo-credited', label: 'Credited', uc: 'PAY-013' },
  { id: 'momo-invalid', label: 'Invalid input', uc: 'PAY-001' },
  { id: 'momo-network', label: 'Connection error', uc: 'PAY-001' },
  { id: 'paytus-otp', label: 'Operator OTP', uc: 'PAY-002' },
  { id: 'paytus-otp-wrong', label: 'Wrong OTP', uc: 'PAY-002' },
  { id: 'payment-code', label: 'Payment code', uc: 'PAY-003' },
  { id: 'payment-code-check', label: 'Status check', uc: 'PAY-003' },
  { id: 'redirect', label: 'Redirect / iframe', uc: 'PAY-004' },
  { id: 'redirect-failed', label: 'Iframe failed', uc: 'PAY-004' },
  { id: 'voucher', label: 'Voucher', uc: 'PAY-005' },
  { id: 'voucher-empty', label: 'Code required', uc: 'PAY-005' },
  { id: 'conversion', label: 'Conversion', uc: 'PAY-009' },
  { id: 'conversion-expired', label: 'Rate expired', uc: 'PAY-009' },
] as const

const METHODS = [
  { id: 'mtn', label: 'MTN MoMo' },
  { id: 'orange', label: 'Orange Money' },
  { id: 'paytus', label: 'Paytus' },
  { id: 'card', label: 'Card' },
  { id: 'voucher', label: 'Voucher' },
]

function methodFor(state: string) {
  if (state.startsWith('paytus')) return 'paytus'
  if (state.startsWith('redirect') || state.startsWith('conversion')) return 'card'
  if (state.startsWith('voucher')) return 'voucher'
  if (state.startsWith('payment-code')) return 'orange'
  return 'mtn'
}

export default async function DepositPage({ searchParams }: StatePageProps) {
  const { state: requested } = await searchParams
  const state = pickState(STATES, requested).id
  const method = methodFor(state)

  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath="/wallet/deposit" />
      <WalletTabs current="deposit" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Panel title="Deposit" description="Funds arrive in your main balance. Bonus balances are separate.">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-bold">Payment method</legend>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {METHODS.map((m) => (
                <span
                  key={m.id}
                  aria-current={m.id === method || undefined}
                  className={cn(
                    'flex h-11 items-center justify-center rounded-lg px-2 text-center text-xs font-extrabold ring-1',
                    m.id === method ? 'bg-brand ring-primary' : 'bg-surface-2 ring-border',
                  )}
                >
                  {m.label}
                </span>
              ))}
            </div>
          </fieldset>
          <DepositBody state={state} />
        </Panel>
        <Panel title="Limits">
          <DefinitionRows
            rows={[
              ['Minimum', '200 FCFA'],
              ['Maximum', '1,000,000 FCFA'],
              ['Fee', 'Free'],
              ['Usually credited', 'Under 2 min'],
            ]}
          />
        </Panel>
      </div>
    </div>
  )
}

function AmountFields({ invalid }: { invalid?: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Mobile number" error={invalid ? 'Enter a valid 9-digit number (6XX XXX XXX).' : undefined}>
        <TextInput defaultValue={invalid ? '6712' : '677 12 34 56'} inputMode="tel" invalid={invalid} />
      </Field>
      <Field label="Amount (FCFA)" error={invalid ? 'Minimum deposit is 200 FCFA.' : undefined} hint="Between 200 and 1,000,000">
        <TextInput defaultValue={invalid ? '50' : '5000'} inputMode="numeric" invalid={invalid} />
      </Field>
    </div>
  )
}

function DepositBody({ state }: { state: string }) {
  switch (state) {
    case 'momo-pending':
      return (
        <>
          <Notice tone="info" title="Waiting for your confirmation">
            Approve the 5,000 FCFA request on 677 12 34 56 by dialling *126#. Your balance updates as soon as MTN confirms. Nothing is credited yet.
          </Notice>
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> Checking status, reference DP-88412
          </div>
          <div className="flex flex-wrap gap-2">
            <PrimaryButton variant="secondary">Check status</PrimaryButton>
            <PrimaryButton variant="ghost">Cancel</PrimaryButton>
          </div>
        </>
      )
    case 'momo-credited':
      return (
        <Notice tone="success" title="5,000 FCFA credited" action={<PrimaryButton href="/">Back to betting</PrimaryButton>}>
          New balance: 17,450 FCFA. Reference DP-88412.
        </Notice>
      )
    case 'momo-invalid':
      return (
        <>
          <AmountFields invalid />
          <PrimaryButton disabled>Deposit</PrimaryButton>
        </>
      )
    case 'momo-network':
      return (
        <>
          <AmountFields />
          <Notice tone="error" title="Connection error" action={<PrimaryButton variant="secondary">Try again</PrimaryButton>}>
            We could not reach the payment provider. You have not been charged.
          </Notice>
        </>
      )
    case 'paytus-otp':
    case 'paytus-otp-wrong': {
      const wrong = state === 'paytus-otp-wrong'
      return (
        <>
          <Steps steps={['Amount', 'Operator code', 'Done']} current={1} />
          <p className="text-sm leading-relaxed text-foreground/80">
            Paytus sent a code to 677 12 34 56. Enter it to confirm a deposit of 5,000 FCFA.
          </p>
          <OtpCells value={wrong ? '482913' : ''} invalid={wrong} label="Operator code" />
          {wrong && <Notice tone="error" title="That code is not correct">Check the SMS and try again. The amount stays the same.</Notice>}
          <div className="flex flex-wrap gap-2">
            <PrimaryButton>Confirm deposit</PrimaryButton>
            <PrimaryButton variant="secondary">Back to amount</PrimaryButton>
          </div>
        </>
      )
    }
    case 'payment-code':
    case 'payment-code-check':
      return (
        <>
          <Notice tone="info" title="Complete the payment on your phone">
            Dial the code below and follow the prompts. It is valid for 15 minutes.
          </Notice>
          <div className="flex flex-col items-center gap-1 rounded-lg bg-surface-2 p-5">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Payment code</span>
            <span className="font-mono text-3xl font-black tracking-widest">#150*47*7731#</span>
            <span className="text-xs font-semibold text-muted-foreground">Expires 14:52</span>
          </div>
          {state === 'payment-code-check' ? (
            <Notice tone="warning" title="Not received yet">We have not received this payment. Checked 14:41. Try again in a minute.</Notice>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <PrimaryButton variant="secondary">Copy code</PrimaryButton>
            <PrimaryButton>{"I've paid, check status"}</PrimaryButton>
          </div>
        </>
      )
    case 'redirect':
    case 'redirect-failed':
      return (
        <>
          <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-lg bg-surface-2 ring-1 ring-border">
            {state === 'redirect' ? (
              <>
                <Loader2 className="size-6 animate-spin text-primary motion-reduce:animate-none" aria-hidden />
                <p className="text-sm font-bold">Secure card form (KoraPay) loads here</p>
              </>
            ) : (
              <p className="text-sm font-bold text-muted-foreground">Payment window closed</p>
            )}
          </div>
          {state === 'redirect-failed' ? (
            <Notice tone="error" title="Card payment failed" action={<PrimaryButton variant="secondary">Try another card</PrimaryButton>}>
              KoraPay declined the payment. You have not been charged.
            </Notice>
          ) : (
            <PrimaryButton variant="ghost">
              Open in a new tab <ExternalLink className="size-4" aria-hidden />
            </PrimaryButton>
          )}
        </>
      )
    case 'voucher':
    case 'voucher-empty': {
      const empty = state === 'voucher-empty'
      return (
        <>
          <Field label="Voucher code" error={empty ? 'Enter your voucher code.' : undefined} hint="16 characters, printed on the scratch card">
            <TextInput placeholder="XXXX-XXXX-XXXX-XXXX" invalid={empty} className="font-mono uppercase" />
          </Field>
          <PrimaryButton>
            <Ticket className="size-4" aria-hidden /> Redeem voucher
          </PrimaryButton>
        </>
      )
    }
    case 'conversion':
    case 'conversion-expired': {
      const expired = state === 'conversion-expired'
      return (
        <>
          <Field label="You pay">
            <div className="flex gap-2">
              <TextInput defaultValue="10.00" className="flex-1" />
              <span className="flex h-11 items-center rounded-lg bg-surface-2 px-3 text-sm font-extrabold ring-1 ring-border">USD</span>
            </div>
          </Field>
          <DefinitionRows
            rows={[
              ['Rate', '1 USD = 603.20 FCFA'],
              ['You receive', '6,032 FCFA'],
              ['Rate valid for', expired ? 'Expired' : '0:42'],
            ]}
          />
          {expired && (
            <Notice tone="warning" title="The rate has expired" action={<PrimaryButton variant="secondary">Get a new rate</PrimaryButton>}>
              Rates are held for 60 seconds. Refresh to see the current one.
            </Notice>
          )}
          <div className="flex flex-wrap gap-2">
            <PrimaryButton disabled={expired}>Confirm 6,032 FCFA</PrimaryButton>
            <PrimaryButton variant="secondary">Pay in FCFA instead</PrimaryButton>
          </div>
        </>
      )
    }
    default:
      return (
        <>
          <AmountFields />
          <div className="flex flex-wrap gap-2">
            {[1000, 5000, 10000, 25000].map((a) => (
              <span key={a} className="rounded-full bg-surface-2 px-3 py-1.5 text-xs font-extrabold ring-1 ring-border">
                {a.toLocaleString('en-US')}
              </span>
            ))}
          </div>
          <PrimaryButton>Deposit 5,000 FCFA</PrimaryButton>
        </>
      )
  }
}
