import 'server-only'
import { randomBytes } from 'node:crypto'
import { and, desc, eq, gte, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { bets, transactions, wallets } from '@/lib/db/schema'

export const WELCOME_CREDIT = 10_000

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

export class InsufficientFundsError extends Error {
  constructor() {
    super('Insufficient balance')
  }
}

export async function ensureWallet(userId: string) {
  const inserted = await db
    .insert(wallets)
    .values({ userId, balance: String(WELCOME_CREDIT) })
    .onConflictDoNothing()
    .returning()

  if (inserted.length) {
    await db.insert(transactions).values({
      userId,
      kind: 'bonus',
      amount: String(WELCOME_CREDIT),
      method: 'Welcome credit',
      balanceAfter: String(WELCOME_CREDIT),
    })
    return inserted[0]
  }

  const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1)
  return wallet
}

export class LimitExceededError extends Error {
  constructor(public remaining: number) {
    super('Daily limit exceeded')
  }
}

export const LIMIT_INCREASE_DELAY_MS = 24 * 60 * 60 * 1000

type WalletLimits = Pick<typeof wallets.$inferSelect, 'dailyLimit' | 'pendingLimit' | 'pendingLimitAt'>

/** The limit in force now. A pending increase only applies once its 24h cooling-off has passed. */
export function effectiveLimit(wallet: WalletLimits, now = new Date()): number | null {
  if (wallet.pendingLimitAt && wallet.pendingLimitAt <= now) {
    return wallet.pendingLimit === null ? null : Number(wallet.pendingLimit)
  }
  return wallet.dailyLimit === null ? null : Number(wallet.dailyLimit)
}

// The betting day runs midnight to midnight in Cameroon (Africa/Douala, UTC+1).
const startOfDay = sql`(date_trunc('day', now() at time zone 'Africa/Douala') at time zone 'Africa/Douala')`

async function stakedToday(executor: Tx | typeof db, userId: string) {
  const [row] = await executor
    .select({ total: sql<string>`coalesce(-sum(${transactions.amount}), 0)` })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.kind, 'bet'), gte(transactions.createdAt, startOfDay)))
  return Number(row?.total ?? 0)
}

export async function getLimitStatus(userId: string) {
  const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1)
  if (!wallet) return { limit: null, staked: 0, pending: null }
  const now = new Date()
  const pendingActive = wallet.pendingLimitAt && wallet.pendingLimitAt > now
  return {
    limit: effectiveLimit(wallet, now),
    staked: await stakedToday(db, userId),
    pending: pendingActive
      ? { amount: wallet.pendingLimit === null ? null : Number(wallet.pendingLimit), at: wallet.pendingLimitAt!.toISOString() }
      : null,
  }
}

export async function debit(tx: Tx, userId: string, amount: number, kind: string, method?: string) {
  if (kind === 'bet') {
    const [wallet] = await tx.select().from(wallets).where(eq(wallets.userId, userId)).for('update').limit(1)
    const limit = wallet ? effectiveLimit(wallet) : null
    if (limit !== null) {
      const staked = await stakedToday(tx, userId)
      if (staked + amount > limit) throw new LimitExceededError(Math.max(0, limit - staked))
    }
  }

  const rows = await tx
    .update(wallets)
    .set({ balance: sql`${wallets.balance} - ${amount}`, updatedAt: new Date() })
    .where(and(eq(wallets.userId, userId), gte(wallets.balance, String(amount))))
    .returning({ balance: wallets.balance })

  if (!rows.length) throw new InsufficientFundsError()

  await tx.insert(transactions).values({
    userId,
    kind,
    amount: String(-amount),
    method,
    balanceAfter: rows[0].balance,
  })
  return Number(rows[0].balance)
}

export async function credit(tx: Tx, userId: string, amount: number, kind: string, method?: string) {
  const rows = await tx
    .update(wallets)
    .set({ balance: sql`${wallets.balance} + ${amount}`, updatedAt: new Date() })
    .where(eq(wallets.userId, userId))
    .returning({ balance: wallets.balance })

  await tx.insert(transactions).values({
    userId,
    kind,
    amount: String(amount),
    method,
    balanceAfter: rows[0].balance,
  })
  return Number(rows[0].balance)
}

export function newReference() {
  return `WB-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`
}

export async function listBets(userId: string, limit = 50) {
  return db.select().from(bets).where(eq(bets.userId, userId)).orderBy(desc(bets.createdAt)).limit(limit)
}

export async function listTransactions(userId: string, limit = 30) {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit)
}

export type BetRow = Awaited<ReturnType<typeof listBets>>[number]
export type TransactionRow = Awaited<ReturnType<typeof listTransactions>>[number]
