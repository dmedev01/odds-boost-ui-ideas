'use client'

import { createContext, useCallback, useContext, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setLocale } from '@/app/actions/locale'
import { DICTIONARIES, translate, type DictKey, type Locale } from '@/lib/i18n/dictionaries'
import { cn } from '@/lib/utils'

interface I18nValue {
  locale: Locale
  t: (key: DictKey, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value = useMemo<I18nValue>(() => {
    const dict = DICTIONARIES[locale]
    return { locale, t: (key, vars) => translate(dict, key, vars) }
  }, [locale])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, t } = useI18n()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const choose = useCallback(
    (next: Locale) => {
      if (next === locale) return
      startTransition(async () => {
        await setLocale(next)
        document.documentElement.lang = next
        router.refresh()
      })
    },
    [locale, router],
  )

  const other: Locale = locale === 'fr' ? 'en' : 'fr'

  return (
  <>
  <button
  type="button"
  lang={other}
  onClick={() => choose(other)}
  aria-label={`${t('header.language')}: ${other === 'fr' ? 'Français' : 'English'}`}
  className={cn(
  'flex size-9 items-center justify-center rounded-lg bg-surface text-xs font-extrabold uppercase text-foreground sm:hidden',
  pending && 'opacity-60',
  className,
  )}
  >
  {other}
  </button>
  <div
  role="group"
  aria-label={t('header.language')}
  className={cn('hidden h-9 items-center rounded-lg bg-surface p-0.5 text-xs font-extrabold sm:flex', pending && 'opacity-60', className)}
  >
      {(['fr', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={locale === l}
          lang={l}
          onClick={() => choose(l)}
          className={cn(
            'h-8 min-w-9 rounded-md px-2 uppercase transition-colors',
            locale === l ? 'bg-brand text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {l}
        </button>
      ))}
    </div>
    </>
  )
}
