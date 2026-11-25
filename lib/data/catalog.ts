export interface VirtualGame {
  id: string
  name: string
  category: 'Crash' | 'Virtual Sports' | 'Instant Win'
  description: string
  cycle: string
  playable?: boolean
}

export const VIRTUAL_GAMES: VirtualGame[] = [
  { id: 'rocket', name: 'Rocket Crash', category: 'Crash', description: 'Cash out before the rocket flies away.', cycle: 'Rounds every 10s', playable: true },
  { id: 'jetx', name: 'Jet Multiplier', category: 'Crash', description: 'Ride the multiplier, up to x1000.', cycle: 'Rounds every 12s' },
  { id: 'vfootball', name: 'Virtual Football League', category: 'Virtual Sports', description: '16-team league, 1X2, O/U and correct score.', cycle: 'Matchday every 3 min' },
  { id: 'vhorses', name: 'Virtual Horses', category: 'Virtual Sports', description: '8-runner flat races, win and forecast.', cycle: 'Race every 2 min' },
  { id: 'vdogs', name: 'Platinum Greyhounds', category: 'Virtual Sports', description: '6-dog sprints with tricast markets.', cycle: 'Race every 90s' },
  { id: 'vbasket', name: 'Virtual Basketball', category: 'Virtual Sports', description: 'Fast quarters, handicap and totals.', cycle: 'Game every 3 min' },
  { id: 'spin', name: 'Spin2Win Roulette', category: 'Instant Win', description: 'Virtual European roulette wheel.', cycle: 'Spin every 60s' },
  { id: 'keno', name: 'Keno Express', category: 'Instant Win', description: 'Pick up to 10 numbers from 80.', cycle: 'Draw every 2 min' },
]

export interface Promotion {
  id: string
  title: string
  summary: string
  badge: string
  cta: { label: string; href: string }
  terms: string[]
}

export const PROMOTIONS: Promotion[] = [
  {
    id: 'welcome',
    title: '100% Welcome Bonus up to 50 000 FCFA',
    summary: 'Double your first deposit and start with twice the firepower.',
    badge: 'New players',
    cta: { label: 'Join now', href: '/sign-up' },
    terms: ['Min. deposit 1 000 FCFA', 'Wager 5x on odds 1.50+', 'Valid 30 days'],
  },
  {
    id: 'boosts',
    title: 'Daily Odds Boosts',
    summary: 'Hand-picked selections priced above the market, every single day.',
    badge: 'Daily',
    cta: { label: 'See boosts', href: '/boosts' },
    terms: ['Max stake per boost applies', 'Boosted part paid in cash'],
  },
  {
    id: 'acca',
    title: 'Accumulator Boost up to +35%',
    summary: 'Add 3+ selections to your bet slip and your winnings get boosted automatically.',
    badge: 'Sports',
    cta: { label: 'Build an acca', href: '/sports' },
    terms: ['Min. odds 1.20 per selection', '3 legs +5%, 5 +10%, 7 +20%, 10 +35%'],
  },
  {
    id: 'jackpot',
    title: '50 000 000 FCFA Mega Jackpot',
    summary: 'Predict 15 matches correctly. Consolation prizes from 12 correct.',
    badge: 'Weekly',
    cta: { label: 'Play jackpot', href: '/jackpot' },
    terms: ['200 FCFA per line', 'Closes Saturday 14:00'],
  },
  {
    id: 'cashback',
    title: '10% Weekly Cashback on Virtuals',
    summary: 'Every Monday, get 10% of your net virtual losses back.',
    badge: 'Virtuals',
    cta: { label: 'Play virtuals', href: '/virtuals' },
    terms: ['Max 100 000 FCFA', 'Credited as bonus'],
  },
  {
    id: 'quinte',
    title: 'Quinté+ Refund Insurance',
    summary: 'Horse non-runner in your Quinté+? Your stake is refunded in full.',
    badge: 'Hippique',
    cta: { label: 'Bet on races', href: '/hippique' },
    terms: ['Applies to the daily Quinté+ race'],
  },
]
