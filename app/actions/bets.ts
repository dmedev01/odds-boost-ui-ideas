'use server'

import { randomInt } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { bets } from '@/lib/db/schema'
import { getUserId } from '@/lib/session'
import { credit, debit, ensureWallet, InsufficientFundsError, newReference } from '@/lib/wallet'
import { resolveSelection } from '@/lib/data/selections'
import { accaBoostPct } from '@/lib/data/sports'
import { countLines, JACKPOT, JACKPOT_EVENTS, type JackpotPick } from '@/lib/data/jackpot'
import { getHippiqueBetType, getRace } from '@/lib/data/hippique'
import { getDrawLottery, getInstantGame } from '@/lib/data/lotteries'
import { STAKE_MAX, STAKE_MIN } from '@/lib/format'

export type ActionResult<T = object> = ({ ok: true; message: string } & T) | { ok: false; error: string }

function isValidStake(stake: unknown): stake is number {
  return typeof stake === 'number' && Number.isInteger(stake) && stake >= STAKE_MIN && stake <= STAKE_MAX
}

function isInt(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
}

async function withWallet<T>(run: (userId: string) => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  const userId = await getUserId()
  if (!userId) return { ok: false, error: 'Please log in to place a bet.' }
  await ensureWallet(userId)
  try {
    const result = await run(userId)
    revalidatePath('/', 'layout')
    return result
  } catch (error) {
    if (error instanceof InsufficientFundsError) {
      return { ok: false, error: 'Insufficient balance. Please make a deposit.' }
    }
    console.error('[bets] action failed', error)
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function placeSportsBet(input: {
  keys: string[]
  stake: number
  mode: 'single' | 'multi'
}): Promise<ActionResult<{ count: number }>> {
  const keys = Array.from(new Set(Array.isArray(input?.keys) ? input.keys : []))
  if (keys.length === 0 || keys.length > 20) return { ok: false, error: 'Add between 1 and 20 selections.' }
  if (!isValidStake(input.stake)) {
    return { ok: false, error: `Stake must be a whole amount between ${STAKE_MIN} and ${STAKE_MAX} FCFA.` }
  }

  const selections = keys.map(resolveSelection)
  if (selections.some((s) => !s)) return { ok: false, error: 'One of your selections is no longer available.' }
  const resolved = selections.filter((s) => s !== null)
  const mode = resolved.length === 1 ? 'single' : input.mode

  if (mode === 'multi') {
    if (new Set(resolved.map((s) => s.matchId)).size !== resolved.length) {
      return { ok: false, error: 'A multiple cannot contain two selections from the same event.' }
    }
    if (resolved.some((s) => s.market === 'BOOST')) {
      return { ok: false, error: 'Boosted odds can only be placed as singles.' }
    }
  }

  for (const s of resolved) {
    if (s.maxStake && input.stake > s.maxStake) {
      return { ok: false, error: `Max stake for "${s.pickLabel}" is ${s.maxStake.toLocaleString('en-US')} FCFA.` }
    }
  }

  return withWallet(async (userId) => {
    await db.transaction(async (tx) => {
      if (mode === 'single') {
        await debit(tx, userId, input.stake * resolved.length, 'bet', `Sports singles x${resolved.length}`)
        for (const s of resolved) {
          await tx.insert(bets).values({
            userId,
            product: 'sports',
            betType: s.market === 'BOOST' ? 'Boosted single' : 'Single',
            stake: String(input.stake),
            totalOdds: String(s.odds),
            potentialWin: String(Math.round(input.stake * s.odds)),
            selections: [s],
            reference: newReference(),
          })
        }
      } else {
        const totalOdds = resolved.reduce((acc, s) => acc * s.odds, 1)
        const gross = input.stake * totalOdds
        const bonusPct = accaBoostPct(resolved.length)
        const potential = gross + ((gross - input.stake) * bonusPct) / 100
        await debit(tx, userId, input.stake, 'bet', `Sports multiple (${resolved.length} legs)`)
        await tx.insert(bets).values({
          userId,
          product: 'sports',
          betType: bonusPct ? `Multiple +${bonusPct}% boost` : 'Multiple',
          stake: String(input.stake),
          totalOdds: totalOdds.toFixed(2),
          potentialWin: String(Math.round(potential)),
          selections: resolved,
          reference: newReference(),
        })
      }
    })
    return { ok: true, message: mode === 'single' && resolved.length > 1 ? `${resolved.length} bets placed` : 'Bet placed', count: resolved.length }
  })
}

export async function placeJackpot(input: { picks: Record<string, JackpotPick[]> }): Promise<ActionResult<{ lines: number }>> {
  const picks: Record<string, JackpotPick[]> = {}
  for (const event of JACKPOT_EVENTS) {
    const raw = input?.picks?.[event.id]
    const unique = Array.from(new Set(Array.isArray(raw) ? raw : [])).filter(
      (p): p is JackpotPick => p === '1' || p === 'X' || p === '2',
    )
    if (unique.length === 0) return { ok: false, error: 'Make a prediction for all 15 matches.' }
    picks[event.id] = unique
  }

  const lines = countLines(picks)
  if (lines > JACKPOT.maxLines) return { ok: false, error: `Maximum ${JACKPOT.maxLines} lines per ticket.` }
  const stake = lines * JACKPOT.linePrice

  return withWallet(async (userId) => {
    await db.transaction(async (tx) => {
      await debit(tx, userId, stake, 'bet', `${JACKPOT.name} ticket`)
      await tx.insert(bets).values({
        userId,
        product: 'jackpot',
        betType: `${JACKPOT.name} · ${lines} line${lines > 1 ? 's' : ''}`,
        stake: String(stake),
        potentialWin: String(JACKPOT.pool),
        selections: JACKPOT_EVENTS.map((e) => ({
          eventLabel: `${e.home} vs ${e.away}`,
          pickLabel: picks[e.id].join(' / '),
        })),
        reference: newReference(),
      })
    })
    return { ok: true, message: 'Jackpot ticket placed', lines }
  })
}

export async function placeHippique(input: {
  raceId: string
  betTypeId: string
  runners: number[]
  multiplier: number
}): Promise<ActionResult> {
  const race = getRace(input?.raceId)
  const type = getHippiqueBetType(input?.betTypeId)
  if (!race || !type) return { ok: false, error: 'This race or bet type is not available.' }
  if (!isInt(input.multiplier, 1, 100)) return { ok: false, error: 'Multiplier must be between 1 and 100.' }

  const runners = Array.isArray(input.runners) ? input.runners : []
  const valid = new Set(race.runners.map((r) => r.number))
  if (runners.length !== type.picks || new Set(runners).size !== runners.length || runners.some((n) => !valid.has(n))) {
    return { ok: false, error: `${type.label} needs exactly ${type.picks} different horse${type.picks > 1 ? 's' : ''}.` }
  }

  const stake = type.unit * input.multiplier
  const first = race.runners.find((r) => r.number === runners[0])!
  const odds = type.fixedOdds ? first.odds : null

  return withWallet(async (userId) => {
    await db.transaction(async (tx) => {
      await debit(tx, userId, stake, 'bet', `${race.code} ${type.label}`)
      await tx.insert(bets).values({
        userId,
        product: 'hippique',
        betType: `${type.label} · ${race.code}`,
        stake: String(stake),
        totalOdds: odds ? String(odds) : null,
        potentialWin: odds ? String(Math.round(stake * odds)) : null,
        selections: [
          {
            eventLabel: `${race.code} ${race.meeting} · ${race.name}`,
            pickLabel: runners
              .map((n) => `${n}. ${race.runners.find((r) => r.number === n)?.name}`)
              .join(' – '),
          },
        ],
        reference: newReference(),
      })
    })
    return { ok: true, message: `${type.label} placed on ${race.code}` }
  })
}

export async function buyDrawTicket(input: { lotteryId: string; numbers: number[]; multiplier: number }): Promise<ActionResult> {
  const lottery = getDrawLottery(input?.lotteryId)
  if (!lottery) return { ok: false, error: 'This lottery is not available.' }
  if (!isInt(input.multiplier, 1, 50)) return { ok: false, error: 'Multiplier must be between 1 and 50.' }
  const numbers = Array.isArray(input.numbers) ? input.numbers : []
  if (
    numbers.length !== lottery.pick ||
    new Set(numbers).size !== numbers.length ||
    numbers.some((n) => !isInt(n, 1, lottery.max))
  ) {
    return { ok: false, error: `Pick exactly ${lottery.pick} different numbers from 1 to ${lottery.max}.` }
  }

  const stake = lottery.price * input.multiplier
  const sorted = [...numbers].sort((a, b) => a - b)

  return withWallet(async (userId) => {
    await db.transaction(async (tx) => {
      await debit(tx, userId, stake, 'bet', `${lottery.name} ticket`)
      await tx.insert(bets).values({
        userId,
        product: 'lottery',
        betType: `${lottery.name} · x${input.multiplier}`,
        stake: String(stake),
        potentialWin: String(lottery.jackpot * input.multiplier),
        selections: [{ eventLabel: `${lottery.name} · ${lottery.nextDraw}`, pickLabel: sorted.join(' · ') }],
        reference: newReference(),
      })
    })
    return { ok: true, message: `${lottery.name} ticket confirmed for ${lottery.nextDraw}` }
  })
}

export async function playInstant(input: { gameId: string }): Promise<ActionResult<{ prize: number }>> {
  const game = getInstantGame(input?.gameId)
  if (!game) return { ok: false, error: 'This game is not available.' }

  const total = game.prizes.reduce((sum, p) => sum + p.weight, 0)
  let roll = randomInt(total)
  let prize = 0
  for (const p of game.prizes) {
    if (roll < p.weight) {
      prize = p.amount
      break
    }
    roll -= p.weight
  }

  return withWallet(async (userId) => {
    await db.transaction(async (tx) => {
      await debit(tx, userId, game.price, 'bet', `${game.name} scratch card`)
      if (prize > 0) await credit(tx, userId, prize, 'win', `${game.name} prize`)
      await tx.insert(bets).values({
        userId,
        product: 'instant',
        betType: `${game.name} scratch card`,
        stake: String(game.price),
        potentialWin: String(prize),
        status: prize > 0 ? 'won' : 'lost',
        selections: [{ eventLabel: game.name, pickLabel: prize > 0 ? `Won ${prize} FCFA` : 'No prize' }],
        reference: newReference(),
      })
    })
    return { ok: true, message: prize > 0 ? 'You won!' : 'No win this time', prize }
  })
}
