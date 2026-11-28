import Link from 'next/link'
import { MIN_AGE } from '@/lib/age'
import { isHrefEnabled } from '@/lib/site-config'
import { Logo } from './logo'

const ALL_COLUMNS = [
  {
    title: 'Betting',
    links: [
      { href: '/sports', label: 'Sports' },
      { href: '/live', label: 'Live betting' },
      { href: '/boosts', label: 'Odds Boosts' },
      { href: '/jackpot', label: 'Mega Jackpot' },
    ],
  },
  {
    title: 'Games',
    links: [
      { href: '/hippique', label: 'Hippique' },
      { href: '/virtuals', label: 'Virtuals & Crash' },
      { href: '/lotteries', label: 'Lotteries' },
      { href: '/promotions', label: 'Promotions' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/account', label: 'Wallet' },
      { href: '/my-bets', label: 'My bets' },
      { href: '/sign-up', label: 'Register' },
      { href: '/sign-in', label: 'Log in' },
    ],
  },
]

const COLUMNS = ALL_COLUMNS.map((c) => ({ ...c, links: c.links.filter((l) => isHrefEnabled(l.href)) })).filter(
  (c) => c.links.length > 0,
)

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-border bg-surface pb-24 lg:pb-0">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Sports betting, Mega Jackpot, hippique, virtuals and lotteries. Play responsibly – betting is for adults
            only.
          </p>
          <span className="flex w-fit items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-extrabold">
            <span className="rounded-full bg-destructive px-1.5 text-[10px]">{MIN_AGE}+</span>
            Responsible gaming
          </span>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="mb-3 text-sm font-extrabold">{col.title}</h2>
            <ul className="flex flex-col gap-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  )
}
