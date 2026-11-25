import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LiteImage } from '@/components/lite/lite-mode'
import { PROMO_SLOTS, type PromoPlacement } from '@/lib/data/promo-slots'

/** The single promotional slot a page is allowed. See lib/data/promo-slots.ts. */
export function PromoSlot({ placement }: { placement: PromoPlacement }) {
  const promo = PROMO_SLOTS[placement]

  return (
    <aside aria-label="Offer" className="relative flex overflow-hidden rounded-xl bg-surface">
      <div className="relative z-10 flex flex-1 flex-col gap-1 p-4 md:p-5">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-primary">{promo.eyebrow}</p>
        <p className="text-pretty text-base font-black md:text-lg">{promo.title}</p>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">{promo.body}</p>
        <Link
          href={promo.cta.href}
          className="mt-2 inline-flex w-fit items-center gap-1 text-sm font-extrabold text-primary hover:underline"
        >
          {promo.cta.label}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      {promo.image && (
        <div className="relative hidden w-48 shrink-0 sm:block">
          <LiteImage kb={promo.imageKb ?? 300} src={promo.image} alt="" fill sizes="192px" className="object-cover" />
        </div>
      )}
    </aside>
  )
}
