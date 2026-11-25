export function formatMoney(value: number | string | null | undefined) {
  const n = Math.round(Number(value ?? 0))
  const grouped = Math.abs(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${n < 0 ? '-' : ''}${grouped} FCFA`
}

export function formatOdds(value: number | string) {
  return Number(value).toFixed(2)
}

export const STAKE_MIN = 100
export const STAKE_MAX = 1_000_000
