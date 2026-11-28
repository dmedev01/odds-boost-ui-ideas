'use client'

import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/components/i18n/i18n-provider'
import { cn } from '@/lib/utils'

function cameFromThisSite() {
  if (window.history.length <= 1) return false
  if (!document.referrer) return true
  try {
    return new URL(document.referrer).origin === window.location.origin
  } catch {
    return false
  }
}

export function BackButton({ fallback = '/', className }: { fallback?: string; className?: string }) {
  const router = useRouter()
  const { t } = useI18n()

  return (
    <button
      type="button"
      onClick={() => (cameFromThisSite() ? router.back() : router.push(fallback))}
      className={cn(
        'inline-flex min-h-10 w-fit items-center gap-1 rounded-lg pr-3 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <ChevronLeft className="size-5" aria-hidden="true" />
      {t('nav.back')}
    </button>
  )
}
