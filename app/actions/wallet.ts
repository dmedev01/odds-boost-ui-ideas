'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { getUserId } from '@/lib/session'
import { credit, debit, ensureWallet, InsufficientFundsError } from '@/lib/wallet'
import type { ActionResult } from './bets'

const METHODS: Record<string, string> = {
  mtn: 'MTN Mobile Money',
  orange: 'Orange Money',
  card: 'Visa / Mastercard',
}

export async function moveFunds(input: {
  direction: 'deposit' | 'withdraw'
  amount: number
  method: string
  phone?: string
}): Promise<ActionResult<{ balance: number }>> {
  const userId = await getUserId()
  if (!userId) return { ok: false, error: 'Please log in first.' }

  const { direction, amount } = input ?? {}
  const method = METHODS[input?.method]
  if (!method) return { ok: false, error: 'Choose a payment method.' }
  if (input.phone !== undefined && !/^6\d{8}$/.test(String(input.phone))) {
    return { ok: false, error: 'Enter a 9-digit Cameroon mobile number starting with 6.' }
  }
  if (direction !== 'deposit' && direction !== 'withdraw') return { ok: false, error: 'Invalid request.' }
  if (typeof amount !== 'number' || !Number.isInteger(amount) || amount < 500 || amount > 500_000) {
    return { ok: false, error: 'Amount must be between 500 and 500 000 FCFA.' }
  }

  await ensureWallet(userId)
  try {
    const balance = await db.transaction((tx) =>
      direction === 'deposit'
        ? credit(tx, userId, amount, 'deposit', method)
        : debit(tx, userId, amount, 'withdrawal', method),
    )
    revalidatePath('/', 'layout')
    return {
      ok: true,
      message: direction === 'deposit' ? 'Deposit successful' : 'Withdrawal requested',
      balance,
    }
  } catch (error) {
    if (error instanceof InsufficientFundsError) return { ok: false, error: 'Insufficient balance for this withdrawal.' }
    console.error('[wallet] moveFunds failed', error)
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }
}
