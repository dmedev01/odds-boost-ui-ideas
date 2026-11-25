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

export async function debit(tx: Tx, userId: string, amount: number, kind: string, method?: string) {
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
