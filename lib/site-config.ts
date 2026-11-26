export const OPTIONAL_PRODUCTS = ['jackpot', 'hippique', 'virtuals', 'lotteries'] as const
export type ProductId = (typeof OPTIONAL_PRODUCTS)[number]

export const PRODUCT_HREF: Record<ProductId, string> = {
  jackpot: '/jackpot',
  hippique: '/hippique',
  virtuals: '/virtuals',
  lotteries: '/lotteries',
}

// Per-client switch, e.g. NEXT_PUBLIC_PRODUCTS="jackpot,virtuals" or "none".
// Unset keeps every product on. Read as a literal so Next.js inlines it on the client too.
function parseProducts(raw: string | undefined): ProductId[] {
  if (!raw?.trim()) return [...OPTIONAL_PRODUCTS]
  const wanted = new Set(raw.split(',').map((s) => s.trim().toLowerCase()))
  return OPTIONAL_PRODUCTS.filter((p) => wanted.has(p))
}

export const ENABLED_PRODUCTS: readonly ProductId[] = parseProducts(process.env.NEXT_PUBLIC_PRODUCTS)

export function isProductEnabled(id: ProductId) {
  return ENABLED_PRODUCTS.includes(id)
}

export function isHrefEnabled(href: string) {
  const path = href.split('?')[0]
  const product = OPTIONAL_PRODUCTS.find((p) => path === PRODUCT_HREF[p] || path.startsWith(`${PRODUCT_HREF[p]}/`))
  return !product || isProductEnabled(product)
}
