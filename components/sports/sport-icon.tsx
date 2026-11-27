import {
  IconBallAmericanFootball,
  IconBallBasketball,
  IconBallFootball,
  IconBallTennis,
  IconBallVolleyball,
  IconCricket,
  IconDeviceGamepad2,
  IconHandRock,
  IconIceSkating,
  IconKarate,
  IconMountain,
  IconMotorbike,
  IconPingPong,
  IconPlayFootball,
  IconPlayHandball,
  IconRugby,
  IconRunSprint,
  IconSkiJumping,
  IconSportBilliard,
  IconSteeringWheel,
  IconTarget,
  IconTargetArrow,
  IconTrophy,
  IconWaterpolo,
  type Icon,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'

const SPORT_ICONS: Record<string, Icon> = {
  football: IconBallFootball,
  basketball: IconBallBasketball,
  'ice-hockey': IconIceSkating,
  tennis: IconBallTennis,
  handball: IconPlayHandball,
  boxing: IconHandRock,
  rugby: IconRugby,
  'aussie-rules': IconBallAmericanFootball,
  snooker: IconSportBilliard,
  pool: IconSportBilliard,
  'table-tennis': IconPingPong,
  cricket: IconCricket,
  darts: IconTargetArrow,
  volleyball: IconBallVolleyball,
  waterpolo: IconWaterpolo,
  futsal: IconPlayFootball,
  lacrosse: IconRunSprint,
  formula: IconSteeringWheel,
  'alpine-skiing': IconSkiJumping,
  biathlon: IconTarget,
  'cross-country': IconMountain,
  'counter-strike': IconDeviceGamepad2,
  mma: IconKarate,
  'motorcycle-racing': IconMotorbike,
}

export function SportIcon({
  sportId,
  size = 20,
  className,
}: {
  sportId: string
  size?: number
  className?: string
}) {
  const Glyph = SPORT_ICONS[sportId] ?? IconTrophy
  return <Glyph size={size} stroke={1.75} aria-hidden="true" className={cn('shrink-0', className)} />
}
