import type { Locale } from '@/lib/i18n/dictionaries'

// Kept local to this kit so it can be dropped in without touching the shared dictionaries.
const COPY = {
  en: {
    loading: 'Loading {what}',
    slow: 'Taking longer than usual. Still trying…',
    failedTitle: 'We couldn’t load {what}',
    failedBody: 'Check your connection, then try again.',
    retry: 'Try again',
    offlineTitle: 'You’re offline',
    offlineBody: 'We’ll reload {what} as soon as you’re back online.',
    emptyTitle: 'No {what} right now',
    emptyBody: 'New events are added throughout the day.',
    emptyAction: 'Browse all sports',
    refreshing: 'Updating',
    matches: 'upcoming matches',
    boosts: 'odds boosts',
    page: 'this page',
  },
  fr: {
    loading: 'Chargement des {what}',
    slow: 'C’est plus long que d’habitude. Nouvel essai en cours…',
    failedTitle: 'Impossible de charger les {what}',
    failedBody: 'Vérifiez votre connexion, puis réessayez.',
    retry: 'Réessayer',
    offlineTitle: 'Vous êtes hors ligne',
    offlineBody: 'Les {what} se rechargeront dès votre retour en ligne.',
    emptyTitle: 'Aucun {what} pour le moment',
    emptyBody: 'De nouveaux événements sont ajoutés tout au long de la journée.',
    emptyAction: 'Voir tous les sports',
    refreshing: 'Mise à jour',
    matches: 'matchs à venir',
    boosts: 'cotes boostées',
    page: 'contenus',
  },
} as const

export type LoadingSubject = 'matches' | 'boosts' | 'page'
type Key = Exclude<keyof (typeof COPY)['en'], LoadingSubject>

export function loadingCopy(locale: Locale, key: Key, subject: LoadingSubject = 'page') {
  const dict = COPY[locale] ?? COPY.en
  return dict[key].replace('{what}', dict[subject])
}
