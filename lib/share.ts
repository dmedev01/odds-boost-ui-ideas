const KEY_PATTERN = /^[a-z0-9]{1,8}\|(1X2|OU|BOOST)\|[A-Za-z0-9]{1,8}$/

export function encodeSlip(keys: string[]) {
  return btoa(keys.join(',')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeSlip(code: string): string[] {
  if (!/^[A-Za-z0-9_-]{4,600}$/.test(code)) return []
  try {
    const raw = atob(code.replace(/-/g, '+').replace(/_/g, '/'))
    const keys = Array.from(new Set(raw.split(','))).filter((k) => KEY_PATTERN.test(k))
    return keys.slice(0, 20)
  } catch {
    return []
  }
}

export function bookingCode(code: string) {
  let h = 7
  for (let i = 0; i < code.length; i++) h = (h * 33 + code.charCodeAt(i)) >>> 0
  return `WB-${h.toString(36).toUpperCase().slice(0, 4).padStart(4, '0')}`
}
