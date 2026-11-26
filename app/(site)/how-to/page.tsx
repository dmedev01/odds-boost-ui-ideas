import type { Metadata } from 'next'
import { Panel, PrimaryButton } from '@/components/v4/ui-states'

export const metadata: Metadata = { title: 'How to bet' }

const GUIDES = [
  ['Create an account', 'Sign up with your phone number in 30 seconds.', '/signup/quick', 'Sign up'],
  ['Deposit with mobile money', 'MTN MoMo or Orange Money, from 100 FCFA.', '/wallet/deposit', 'Deposit'],
  ['Place your first bet', 'Tap odds to add them to your slip, enter a stake, then place your bet.', '/sports', 'Browse matches'],
  ['Withdraw your winnings', 'Cash out to your verified mobile money account.', '/wallet/withdraw', 'Withdraw'],
] as const

export default function HowToPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-black">How to bet</h1>
      <ol className="grid gap-3 md:grid-cols-2">
        {GUIDES.map(([title, body, href, cta], i) => (
          <li key={title}>
            <Panel title={`${i + 1}. ${title}`} description={body}>
              <PrimaryButton variant="secondary" href={href}>{cta}</PrimaryButton>
            </Panel>
          </li>
        ))}
      </ol>
    </div>
  )
}
