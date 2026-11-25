export interface DrawLottery {
  id: string
  name: string
  pick: number
  max: number
  price: number
  jackpot: number
  nextDraw: string
  frequency: string
}

export const DRAW_LOTTERIES: DrawLottery[] = [
  { id: 'loto590', name: 'Loto 5/90', pick: 5, max: 90, price: 200, jackpot: 15_000_000, nextDraw: 'Today 19:00', frequency: 'Daily' },
  { id: 'mega649', name: 'Mega 6/49', pick: 6, max: 49, price: 500, jackpot: 75_000_000, nextDraw: 'Sat 20:00', frequency: 'Weekly' },
  { id: 'lucky336', name: 'Lucky 3', pick: 3, max: 36, price: 100, jackpot: 500_000, nextDraw: 'Every 15 min', frequency: 'Express' },
]

export interface InstantGame {
  id: string
  name: string
  price: number
  topPrize: number
  tagline: string
  prizes: { amount: number; weight: number }[]
}

export const INSTANT_GAMES: InstantGame[] = [
  {
    id: 'gold-rush',
    name: 'Gold Rush',
    price: 200,
    topPrize: 1_000_000,
    tagline: 'Match 3 gold bars',
    prizes: [
      { amount: 0, weight: 720 },
      { amount: 200, weight: 160 },
      { amount: 500, weight: 70 },
      { amount: 2_000, weight: 35 },
      { amount: 20_000, weight: 12 },
      { amount: 1_000_000, weight: 3 },
    ],
  },
  {
    id: 'lucky-7',
    name: 'Lucky 7s',
    price: 500,
    topPrize: 5_000_000,
    tagline: 'Find three 7s',
    prizes: [
      { amount: 0, weight: 740 },
      { amount: 500, weight: 150 },
      { amount: 1_500, weight: 65 },
      { amount: 10_000, weight: 33 },
      { amount: 100_000, weight: 10 },
      { amount: 5_000_000, weight: 2 },
    ],
  },
  {
    id: 'diamond',
    name: 'Diamond Dash',
    price: 1_000,
    topPrize: 10_000_000,
    tagline: 'Reveal 3 diamonds',
    prizes: [
      { amount: 0, weight: 700 },
      { amount: 1_000, weight: 180 },
      { amount: 3_000, weight: 75 },
      { amount: 25_000, weight: 33 },
      { amount: 250_000, weight: 10 },
      { amount: 10_000_000, weight: 2 },
    ],
  },
]

export function getDrawLottery(id: string) {
  return DRAW_LOTTERIES.find((l) => l.id === id)
}

export function getInstantGame(id: string) {
  return INSTANT_GAMES.find((g) => g.id === id)
}
