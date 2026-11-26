import type { Metadata } from 'next'
import { Lock } from 'lucide-react'
import { Field, Notice, Panel, PrimaryButton, StateSwitcher, TextInput, pickState, type StatePageProps } from '@/components/v4/ui-states'

export const metadata: Metadata = { title: 'Profile' }

const STATES = [
  { id: 'view', label: 'Complete profile', uc: 'ACC-008' },
  { id: 'incomplete', label: 'Incomplete', uc: 'PAY-008' },
  { id: 'invalid', label: 'Validation error', uc: 'ACC-008' },
  { id: 'saved', label: 'Saved', uc: 'ACC-008' },
] as const

export default async function ProfilePage({ searchParams }: StatePageProps) {
  const { state: requested } = await searchParams
  const state = pickState(STATES, requested).id
  const incomplete = state === 'incomplete'

  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath="/account/profile" />
      <Panel title="Your profile" description="Verified details are locked. Contact support to change them.">
        {incomplete && <Notice tone="warning" title="3 fields missing">Withdrawals stay blocked until your profile is complete.</Notice>}
        {state === 'saved' && <Notice tone="success" title="Profile saved" />}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="First name" hint="Verified">
            <TextInput defaultValue="Jean" readOnly />
          </Field>
          <Field label="Last name" error={incomplete ? 'Required for withdrawals.' : undefined}>
            <TextInput defaultValue={incomplete ? '' : 'Mbarga'} invalid={incomplete} />
          </Field>
          <Field label="Date of birth" error={incomplete ? 'Required for withdrawals.' : undefined}>
            <TextInput type="date" defaultValue={incomplete ? '' : '1994-04-02'} invalid={incomplete} />
          </Field>
          <Field label="ID number" error={incomplete ? 'Required for withdrawals.' : undefined}>
            <TextInput defaultValue={incomplete ? '' : '112233445'} invalid={incomplete} />
          </Field>
          <Field label="Email" error={state === 'invalid' ? 'Enter a valid email address.' : undefined}>
            <TextInput type="email" defaultValue={state === 'invalid' ? 'jean@' : 'jean@example.com'} invalid={state === 'invalid'} />
          </Field>
          <Field label="Mobile number" hint="Change via support">
            <div className="relative">
              <TextInput defaultValue="677 12 34 56" readOnly className="w-full pr-9" />
              <Lock className="absolute top-3.5 right-3 size-4 text-muted-foreground" aria-hidden />
            </div>
          </Field>
        </div>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton>Save changes</PrimaryButton>
          <PrimaryButton variant="secondary" href="/account/password">Change password</PrimaryButton>
        </div>
      </Panel>
    </div>
  )
}
