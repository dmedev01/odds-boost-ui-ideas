import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, MessageCircle, Phone } from 'lucide-react'
import { Panel } from '@/components/v4/ui-states'

export const metadata: Metadata = { title: 'Rules and contact' }

const SECTIONS = [
  ['general', 'General rules', 'You must be 18 or older. One account per person. Bets are accepted once confirmed on your ticket.'],
  ['sports', 'Sports betting rules', 'Bets settle on the official result after 90 minutes plus stoppage time unless the market says otherwise. Postponed events are void after 48 hours.'],
  ['bonuses', 'Bonus terms', 'Bonuses carry wagering requirements shown on each offer. Unused bonuses expire on the date shown.'],
  ['payments', 'Deposits and withdrawals', 'Withdrawals go to a verified mobile money account in your name. Minimum withdrawal is 500 FCFA.'],
  ['responsible', 'Responsible gaming', 'Set deposit and stake limits or take a break any time from your account.'],
] as const

export default function RulesPage() {
  return (
    <div className="grid gap-4 md:grid-cols-[14rem_1fr]">
      <nav aria-label="Rules sections" className="flex flex-col gap-1 self-start rounded-xl bg-surface p-3 md:sticky md:top-20">
        {SECTIONS.map(([id, title]) => (
          <Link key={id} href={`#${id}`} className="rounded-md px-2 py-1.5 text-sm font-bold hover:bg-surface-2">{title}</Link>
        ))}
        <Link href="#contact" className="rounded-md px-2 py-1.5 text-sm font-bold text-primary hover:bg-surface-2">Contact us</Link>
      </nav>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-black">Rules and contact</h1>
        {SECTIONS.map(([id, title, body]) => (
          <section key={id} id={id} className="scroll-mt-20">
            <Panel title={title}><p className="text-sm leading-relaxed text-foreground/80">{body}</p></Panel>
          </section>
        ))}
        <section id="contact" className="scroll-mt-20">
          <Panel title="Contact us" description="UC-ENG-006 · UC-CORE-012 deep links land on a section anchor">
            <ul className="grid gap-2 sm:grid-cols-3">
              {[
                [MessageCircle, 'WhatsApp', '+237 6 99 00 00 00'],
                [Phone, 'Call (free)', '8080'],
                [Mail, 'Email', 'help@bet.cm'],
              ].map(([Icon, label, value]) => {
                const I = Icon as typeof Mail
                return (
                  <li key={label as string} className="flex flex-col gap-1 rounded-lg bg-surface-2 p-3">
                    <I className="size-5 text-primary" aria-hidden />
                    <span className="text-xs font-bold text-muted-foreground">{label as string}</span>
                    <span className="text-sm font-black">{value as string}</span>
                  </li>
                )
              })}
            </ul>
          </Panel>
        </section>
      </div>
    </div>
  )
}
