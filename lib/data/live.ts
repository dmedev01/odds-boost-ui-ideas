// Live prices move on a shared 15s clock so the client display and the
// server-side price check always agree on the odds for a given moment.
export const TICK_MS = 15_000

export function currentBucket(now = Date.now()) {
  return Math.floor(now / TICK_MS)
}

function seedOf(value: string) {
  let h = 0
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0
  return (h >>> 0) % 997
}

export function liveOdds(base: number, key: string, bucket: number) {
  const seed = seedOf(key)
  const drift = Math.sin(bucket * 0.7 + seed) * 0.05 + Math.sin(bucket * 1.9 + seed * 0.3) * 0.02
  return Math.max(1.01, Math.round(base * (1 + drift) * 100) / 100)
}

/** Attacking pressure from -1 (away on top) to 1 (home on top). */
export function momentum(matchId: string, bucket: number) {
  const seed = seedOf(matchId)
  return Math.max(-1, Math.min(1, Math.sin(bucket * 0.45 + seed) * 0.8 + Math.sin(bucket * 1.3 + seed) * 0.3))
}
