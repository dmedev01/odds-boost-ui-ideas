import { cn } from '@/lib/utils'

const CDN = 'https://media-bucket-spt.nyc3.cdn.digitaloceanspaces.com'
const DEFAULT_ICON = 'https://test.wandabet.flexbet-software.com/assets/images/v2/wandabet/sport_default.png'

// Filenames of each sport's `sport_icon` in the gateway's /v2/sport/0/sports response.
// Once the app reads that endpoint, pass its value as `src` and this map can go.
const ICON_FILES: Record<string, string> = {
  football: '1663861122623.png',
  basketball: '1663861249529.png',
  'ice-hockey': '1659619267390.png',
  tennis: '1659700207762.png',
  handball: '1659619070990.png',
  boxing: '1665998131626.png',
  rugby: '1663663516392.png',
  snooker: '1663663568405.png',
  'table-tennis': '1663606207908.png',
  cricket: '1663612327214.png',
  darts: '1663612373269.png',
  volleyball: '1663612485540.png',
  waterpolo: '1663613002187.png',
  futsal: '1663613236909.png',
  formula: '1663862350201.png',
  'alpine-skiing': '1613826115492.png',
  'cross-country': '1659027858601.png',
  'counter-strike': 'a109.png',
  mma: '1659621746904.png',
}

export function sportIconSrc(sportId: string) {
  const file = ICON_FILES[sportId]
  return file ? `${CDN}/${file}` : DEFAULT_ICON
}

export function SportIcon({
  sportId,
  src,
  size = 20,
  className,
}: {
  sportId: string
  /** `sport_icon` URL from the sports API; falls back to the known CDN file. */
  src?: string | null
  size?: number
  className?: string
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote CDN icons are already small; no optimisation needed
    <img
      src={src || sportIconSrc(sportId)}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={cn('shrink-0 object-contain', className)}
    />
  )
}
