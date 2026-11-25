const KEY_PATTERN = /^[a-z0-9]{1,8}\|(1X2|OU|BOOST)\|[A-Za-z0-9]{1,8}$/
export const BOOKING_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{6}$/

export function sanitizeKeys(keys: unknown): string[] {
  if (!Array.isArray(keys)) return []
  const valid = keys.filter((k): k is string => typeof k === 'string' && KEY_PATTERN.test(k))
  return Array.from(new Set(valid)).slice(0, 20)
}

export function normalizeBookingCode(input: unknown) {
  if (typeof input !== 'string') return null
  const code = input.trim().toUpperCase().replace(/^WB-?/, '').replace(/[\s-]/g, '')
  return BOOKING_CODE_PATTERN.test(code) ? code : null
}

export function encodeSlip(keys: string[]) {
  return btoa(keys.join(',')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeSlip(code: string): string[] {
  if (!/^[A-Za-z0-9_-]{4,600}$/.test(code)) return []
  try {
    const raw = atob(code.replace(/-/g, '+').replace(/_/g, '/'))
    return sanitizeKeys(raw.split(','))
  } catch {
    return []
  }
}

export function bookingCode(code: string) {
  let h = 7
  for (let i = 0; i < code.length; i++) h = (h * 33 + code.charCodeAt(i)) >>> 0
  return `WB-${h.toString(36).toUpperCase().slice(0, 4).padStart(4, '0')}`
}
