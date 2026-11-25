// House rule: every page gets at most ONE promo slot, and it must relate to
// the product on that page. The home page also has the hero. Nothing else.
export type PromoPlacement = 'sports' | 'jackpot' | 'hippique' | 'lotteries' | 'virtuals' | 'boosts'

export interface PromoSlotContent {
  eyebrow: string
  title: string
  body: string
  cta: { label: string; href: string }
  image?: string
  imageKb?: number
}

export const PROMO_SLOTS: Record<PromoPlacement, PromoSlotContent> = {
  sports: {
    eyebrow: 'Boost Ladder',
    title: 'Climb to +35% on your accumulator',
    body: 'Every extra leg moves you up the ladder in your bet slip. 3 legs +5%, 5 legs +10%, 7 legs +20%, 10 legs +35%.',
    cta: { label: 'See all boosts', href: '/boosts' },
    image: '/images/hero-football.png',
    imageKb: 380,
  },
  boosts: {
    eyebrow: 'New players',
    title: '100% Welcome Bonus up to 50 000 FCFA',
    body: 'Double your first MTN MoMo or Orange Money deposit.',
    cta: { label: 'Claim bonus', href: '/promotions' },
  },
  jackpot: {
    eyebrow: 'Weekly',
    title: 'Consolation prizes from 12 correct',
    body: 'You do not need all 15 to win. 12, 13 and 14 correct share their own prize pools.',
    cta: { label: 'Prize rules', href: '/promotions' },
    image: '/images/jackpot-promo.png',
    imageKb: 320,
  },
  hippique: {
    eyebrow: 'Quinté+',
    title: 'Non-runner? Your stake comes back',
    body: 'If a horse in your Quinté+ does not start, we refund your full stake.',
    cta: { label: 'How it works', href: '/promotions' },
  },
  lotteries: {
    eyebrow: 'Every draw',
    title: 'Multiplier tickets up to x50',
    body: 'Raise the multiplier on any draw ticket to multiply the prize by the same amount.',
    cta: { label: 'All offers', href: '/promotions' },
    image: '/images/lottery-promo.png',
    imageKb: 300,
  },
  virtuals: {
    eyebrow: 'Mondays',
    title: '10% cashback on virtuals',
    body: 'Every Monday, get 10% of your net virtual losses back, up to 100 000 FCFA.',
    cta: { label: 'Terms', href: '/promotions' },
  },
}
