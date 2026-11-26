import type { Metadata } from 'next'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { PageHeader } from '@/components/site/page-header'
import { buttonVariants } from '@/components/ui/button'
import { PROMOTIONS } from '@/lib/data/catalog'
import { isHrefEnabled } from '@/lib/site-config'

export const metadata: Metadata = { title: 'Promotions' }

export default function PromotionsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Offers"
        title="Promotions"
        description="Welcome bonus, daily boosts, accumulator rewards, cashback and more. Terms apply to every offer."
      />
      <ul className="grid gap-3 md:grid-cols-2">
        {PROMOTIONS.filter((p) => isHrefEnabled(p.cta.href)).map((p) => (
          <li key={p.id} className="flex flex-col gap-3 rounded-xl bg-surface p-5">
            <span className="w-fit rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-primary">
              {p.badge}
            </span>
            <h2 className="text-balance text-lg font-black leading-snug">{p.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{p.summary}</p>
            <ul className="flex flex-col gap-1">
              {p.terms.map((t) => (
                <li key={t} className="flex items-center gap-2 text-xs font-semibold text-white/80">
                  <Check className="size-3.5 text-success" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
            <Link href={p.cta.href} className={buttonVariants({ className: 'mt-auto w-fit font-extrabold' })}>
              {p.cta.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
