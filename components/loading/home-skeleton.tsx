import { BoostsLoading, MatchesLoading } from './data-state'
import { HeroSkeleton, TilesSkeleton } from './skeletons'

/** Whole homepage before anything has loaded. Used by app/(site)/loading.tsx. */
export function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <HeroSkeleton />
      <TilesSkeleton />
      <BoostsLoading />
      <MatchesLoading />
      <MatchesLoading rows={3} />
    </div>
  )
}
