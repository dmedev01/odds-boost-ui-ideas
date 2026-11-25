import 'server-only'
import { cookies, headers } from 'next/headers'
import { DEFAULT_LOCALE, DICTIONARIES, isLocale, LOCALE_COOKIE, translate, type DictKey, type Locale } from './dictionaries'

export async function getLocale(): Promise<Locale> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()])
  const saved = cookieStore.get(LOCALE_COOKIE)?.value
  if (isLocale(saved)) return saved
  const accept = headerStore.get('accept-language')?.toLowerCase() ?? ''
  if (accept.startsWith('en')) return 'en'
  return DEFAULT_LOCALE
}

export async function getT() {
  const locale = await getLocale()
  const dict = DICTIONARIES[locale]
  return { locale, t: (key: DictKey, vars?: Record<string, string | number>) => translate(dict, key, vars) }
}
