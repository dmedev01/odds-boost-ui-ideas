'use server'

import { randomInt } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { bets, bookingCodes } from '@/lib/db/schema'
import { BOOKING_CODE_PATTERN, normalizeBookingCode, sanitizeKeys } from '@/lib/share'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomCode() {
  let out = ''
  for (let i = 0; i < 6; i++) out += ALPHABET[randomInt(ALPHABET.length)]
  return out
}

export async function createBookingCode(keys: unknown): Promise<string | null> {
  const clean = sanitizeKeys(keys)
  if (clean.length === 0) return null
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode()
    const inserted = await db
      .insert(bookingCodes)
      .values({ code, selections: clean })
      .onConflictDoNothing()
      .returning({ code: bookingCodes.code })
    if (inserted.length > 0) return code
  }
  return null
}

export async function loadBookingCode(input: unknown): Promise<{ ok: true; keys: string[] } | { ok: false }> {
  const code = normalizeBookingCode(input)
  if (!code) return { ok: false }
  const [row] = await db.select().from(bookingCodes).where(eq(bookingCodes.code, code)).limit(1)
  if (!row) return { ok: false }
  const keys = sanitizeKeys(row.selections)
  return keys.length > 0 ? { ok: true, keys } : { ok: false }
}

export async function getBookingKeys(code: string) {
  if (!BOOKING_CODE_PATTERN.test(code)) return null
  const result = await loadBookingCode(code)
  return result.ok ? result.keys : null
}

export interface TicketView {
  reference: string
  product: string
  betType: string
  stake: number
  totalOdds: number | null
  potentialWin: number | null
  status: string
  createdAt: string
  selections: { pick: string; market?: string; event?: string; odds?: number }[]
}

const TICKET_PATTERN = /^WB-[A-Z0-9]{6,12}-[A-F0-9]{6}$/

export async function findTicket(input: unknown): Promise<TicketView | null> {
  if (typeof input !== 'string') return null
  const reference = input.trim().toUpperCase()
  if (!TICKET_PATTERN.test(reference)) return null
  const [row] = await db
    .select({
      reference: bets.reference,
      product: bets.product,
      betType: bets.betType,
      stake: bets.stake,
      totalOdds: bets.totalOdds,
      potentialWin: bets.potentialWin,
      status: bets.status,
      createdAt: bets.createdAt,
      selections: bets.selections,
    })
    .from(bets)
    .where(eq(bets.reference, reference))
    .limit(1)
  if (!row) return null

  const raw = Array.isArray(row.selections) ? row.selections : []
  const selections = raw.slice(0, 30).map((s) => {
    const o = (s ?? {}) as Record<string, unknown>
    const text = (v: unknown) => (typeof v === 'string' ? v : undefined)
    return {
      pick: text(o.pickLabel) ?? text(o.label) ?? text(o.pick) ?? '—',
      market: text(o.marketLabel) ?? text(o.market),
      event: text(o.eventLabel) ?? text(o.event),
      odds: typeof o.odds === 'number' ? o.odds : undefined,
    }
  })

  return {
    reference: row.reference,
    product: row.product,
    betType: row.betType,
    stake: Number(row.stake),
    totalOdds: row.totalOdds == null ? null : Number(row.totalOdds),
    potentialWin: row.potentialWin == null ? null : Number(row.potentialWin),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    selections,
  }
}
