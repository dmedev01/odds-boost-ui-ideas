'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { wallets } from '@/lib/db/schema'
import { getUserId } from '@/lib/session'
import { effectiveLimit, ensureWallet, LIMIT_INCREASE_DELAY_MS } from '@/lib/wallet'
import type { ActionResult } from './bets'

/** Lowering a limit applies at once. Raising or removing it waits 24 hours. */
export async function setDailyLimit(input: { amount: number | null }): Promise<ActionResult> {
  const userId = await getUserId()
  if (!userId) return { ok: false, error: 'Please log in first.' }

  const amount = input?.amount ?? null
  if (amount !== null && (!Number.isInteger(amount) || amount < 500 || amount > 10_000_000)) {
    return { ok: false, error: 'Limit must be between 500 and 10 000 000 FCFA.' }
  }

  const wallet = await ensureWallet(userId)
  const current = effectiveLimit(wallet)
  const isDecrease = amount !== null && (current === null || amount <= current)

  if (isDecrease) {
    await db
      .update(wallets)
      .set({ dailyLimit: String(amount), pendingLimit: null, pendingLimitAt: null, updatedAt: new Date() })
      .where(eq(wallets.userId, userId))
    revalidatePath('/', 'layout')
    return { ok: true, message: `Daily limit set to ${amount.toLocaleString('en-US')} FCFA, effective now.` }
  }

  await db
    .update(wallets)
    .set({
      dailyLimit: current === null ? null : String(current),
      pendingLimit: amount === null ? null : String(amount),
      pendingLimitAt: new Date(Date.now() + LIMIT_INCREASE_DELAY_MS),
      updatedAt: new Date(),
    })
    .where(eq(wallets.userId, userId))
  revalidatePath('/', 'layout')
  return {
    ok: true,
    message:
      amount === null
        ? 'Your limit will be removed in 24 hours.'
        : `Your new limit of ${amount.toLocaleString('en-US')} FCFA starts in 24 hours.`,
  }
}
