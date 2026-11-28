import type { Metadata } from 'next'
import { Download, Gift, Megaphone, RefreshCw, ShieldAlert, Smartphone, Trophy, WifiOff } from 'lucide-react'
import { DialogFrame, DialogText } from '@/components/v4/dialog-frame'
import { Field, PrimaryButton, StateSwitcher, TextInput, pickState, type StatePageProps } from '@/components/v4/ui-states'

export const metadata: Metadata = { title: 'System states' }

const STATES = [
  { id: 'age-gate', label: 'Age notice', uc: 'ACC-013' },
  { id: 'age-rejected', label: 'Age rejected', uc: 'CORE-010' },
  { id: 'protected-route', label: 'Login required', uc: 'CORE-006' },
  { id: 'session-expired', label: 'Session expired', uc: 'CORE-007' },
  { id: 'session-elsewhere', label: 'Logged in elsewhere', uc: 'RT-007' },
  { id: 'self-excluded', label: 'Self-excluded login', uc: 'ACC-002' },
  { id: 'welcome-back', label: 'Welcome back', uc: 'CORE-002' },
  { id: 'login-bonus', label: 'Bonus message', uc: 'BON-011' },
  { id: 'login-jackpot', label: 'Jackpot alert', uc: 'BON-011' },
  { id: 'network-drop', label: 'Network drop', uc: 'RT-005' },
  { id: 'live-disabled', label: 'Live betting off', uc: 'RT-006' },
  { id: 'broadcast', label: 'Broadcast', uc: 'RT-011' },
  { id: 'new-release', label: 'New release', uc: 'TEN-003' },
  { id: 'mobile-upgrade', label: 'Mobile upgrade', uc: 'CORE-011' },
  { id: 'app-download', label: 'App download', uc: 'ENG-005' },
  { id: 'webview', label: 'App webview', uc: 'CORE-009' },
  { id: 'lottery-expired', label: 'Lottery session', uc: 'GAM-009' },
] as const

export default async function SystemStatesPage({ searchParams }: StatePageProps) {
  const { state: requested } = await searchParams
  const state = pickState(STATES, requested).id

  return (
    <div className="flex flex-col gap-4">
      <StateSwitcher states={STATES} current={state} basePath="/system-states" />
      <SystemState state={state} />
    </div>
  )
}

function SystemState({ state }: { state: string }) {
  switch (state) {
    case 'age-gate':
      return (
        <DialogFrame>
          <span className="flex size-12 items-center justify-center rounded-full bg-primary text-lg font-black text-primary-foreground">18+</span>
          <DialogText title="Are you 18 or older?" body="Betting is restricted to adults. Please play responsibly." />
          <div className="flex gap-2">
            <PrimaryButton className="flex-1">Yes, I am 18+</PrimaryButton>
            <PrimaryButton variant="secondary" href="/system-states?state=age-rejected">No</PrimaryButton>
          </div>
        </DialogFrame>
      )
    case 'age-rejected':
      return (
        <DialogFrame>
          <DialogText title="Sorry, you cannot use this site" body="You must be 18 or older. For support with gambling, call 8080 (free)." />
        </DialogFrame>
      )
    case 'protected-route':
      return (
        <DialogFrame>
          <DialogText title="Log in to continue" body="My bets is only available when you are logged in. You will come back here after." />
          <Field label="Mobile number"><TextInput defaultValue="677 12 34 56" /></Field>
          <Field label="Password"><TextInput type="password" defaultValue="secret123" /></Field>
          <PrimaryButton>Log in</PrimaryButton>
          <PrimaryButton variant="ghost" href="/signup/quick">Create an account</PrimaryButton>
        </DialogFrame>
      )
    case 'session-expired':
      return (
        <DialogFrame>
          <DialogText title="Your session has expired" body="For your security you were logged out after 30 minutes of inactivity. Your betslip is kept." />
          <PrimaryButton>Log in again</PrimaryButton>
        </DialogFrame>
      )
    case 'session-elsewhere':
      return (
        <DialogFrame>
          <Smartphone className="size-8 text-primary" aria-hidden />
          <DialogText title="Logged in on another device" body="Your account was opened on another device at 14:02, so this session ended. Not you? Change your password." />
          <div className="flex gap-2">
            <PrimaryButton className="flex-1">Log in here</PrimaryButton>
            <PrimaryButton variant="secondary" href="/forgot-password">Change password</PrimaryButton>
          </div>
        </DialogFrame>
      )
    case 'self-excluded':
      return (
        <DialogFrame>
          <ShieldAlert className="size-8 text-primary" aria-hidden />
          <DialogText title="Your account is on a break" body="You chose to self-exclude until 26 Dec 2026. You cannot log in until then." />
          <PrimaryButton variant="secondary" href="/account/responsible-gaming?state=recover-locked">Learn more</PrimaryButton>
        </DialogFrame>
      )
    case 'welcome-back':
      return (
        <DialogFrame variant="toast">
          <DialogText title="Welcome back, Jean" body="Balance 12,450 FCFA. 2 open bets." />
        </DialogFrame>
      )
    case 'login-bonus':
      return (
        <DialogFrame>
          <Gift className="size-8 text-primary" aria-hidden />
          <DialogText title="You have a 2,000 FCFA free bet" body="Use it on any multiple with 3+ selections at odds 1.50 or more. Expires 30 Nov." />
          <PrimaryButton href="/account/bonuses">See my bonuses</PrimaryButton>
          <PrimaryButton variant="ghost">Later</PrimaryButton>
        </DialogFrame>
      )
    case 'login-jackpot':
      return (
        <DialogFrame>
          <Trophy className="size-8 text-primary" aria-hidden />
          <DialogText title="Jackpot: 25,000,000 FCFA" body="This week's jackpot closes Saturday 15:00. Pick 13 results to win." />
          <PrimaryButton href="/jackpot">Play the jackpot</PrimaryButton>
        </DialogFrame>
      )
    case 'network-drop':
      return (
        <DialogFrame variant="top-banner">
          <WifiOff className="size-6 shrink-0 text-destructive" aria-hidden />
          <DialogText title="Connection lost" body="Odds are paused and bets cannot be placed. Reconnecting automatically." />
          <PrimaryButton variant="secondary">Retry</PrimaryButton>
        </DialogFrame>
      )
    case 'live-disabled':
      return (
        <DialogFrame variant="top-banner">
          <ShieldAlert className="size-6 shrink-0 text-primary" aria-hidden />
          <DialogText title="Live betting is temporarily unavailable" body="Prematch betting is still open. Live selections were removed from your slip." />
        </DialogFrame>
      )
    case 'broadcast':
      return (
        <DialogFrame variant="top-banner">
          <Megaphone className="size-6 shrink-0 text-primary" aria-hidden />
          <DialogText title="Champions League boosts are live" body="Every home win tonight at boosted odds." />
          <PrimaryButton href="/boosts">View</PrimaryButton>
        </DialogFrame>
      )
    case 'new-release':
      return (
        <DialogFrame variant="toast">
          <RefreshCw className="size-6 text-primary" aria-hidden />
          <DialogText title="A new version is available" body="Reload to update. Your betslip is kept." />
          <PrimaryButton>Reload</PrimaryButton>
        </DialogFrame>
      )
    case 'mobile-upgrade':
      return (
        <DialogFrame>
          <Smartphone className="size-8 text-primary" aria-hidden />
          <DialogText title="Try our faster mobile site" body="Built for your phone, with lighter pages and quicker betting. You stay logged in." />
          <PrimaryButton>Switch to mobile site</PrimaryButton>
          <PrimaryButton variant="ghost">Stay here</PrimaryButton>
        </DialogFrame>
      )
    case 'app-download':
      return (
        <DialogFrame variant="bottom-sheet">
          <div className="flex items-center gap-3">
            <Download className="size-8 shrink-0 text-primary" aria-hidden />
            <DialogText title="Get the Android app" body="2.1 MB. Works on 3G. Get notified when your bets win." />
          </div>
          <div className="flex gap-2">
            <PrimaryButton className="flex-1">Download</PrimaryButton>
            <PrimaryButton variant="secondary">Not now</PrimaryButton>
          </div>
        </DialogFrame>
      )
    case 'webview':
      return (
        <DialogFrame variant="top-banner">
          <Smartphone className="size-6 shrink-0 text-primary" aria-hidden />
          <DialogText title="Opened from the app" body="Header, footer and app-download prompts are hidden. Session comes from the app token." />
        </DialogFrame>
      )
    default:
      return (
        <DialogFrame>
          <DialogText title="Your game session has ended" body="Lottery sessions close after 20 minutes. Tickets already bought are safe." />
          <PrimaryButton>Start a new session</PrimaryButton>
          <PrimaryButton variant="ghost" href="/my-bets">View my tickets</PrimaryButton>
        </DialogFrame>
      )
  }
}
