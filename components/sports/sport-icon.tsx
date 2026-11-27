import Image from 'next/image'
import { cn } from '@/lib/utils'

// Icons copied from the current Wandabet site (36x36, ~2 KB each). Sports it has no icon for use its default.
const ICONS = new Set([
  'alpine-skiing',
  'basketball',
  'boxing',
  'counter-strike',
  'cricket',
  'cross-country',
  'darts',
  'football',
  'formula',
  'futsal',
  'handball',
  'ice-hockey',
  'mma',
  'rugby',
  'snooker',
  'table-tennis',
  'tennis',
  'volleyball',
  'waterpolo',
])

export function sportIconSrc(sportId: string) {
  return `/images/sports/${ICONS.has(sportId) ? sportId : 'default'}.png`
}

export function SportIcon({ sportId, size = 20, className }: { sportId: string; size?: number; className?: string }) {
  return (
    <Image
      src={sportIconSrc(sportId)}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      unoptimized
      className={cn('shrink-0 object-contain', className)}
    />
  )
}
