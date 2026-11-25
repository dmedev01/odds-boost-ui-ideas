export type SportId = 'football' | 'basketball' | 'tennis'

export interface Sport {
  id: SportId
  name: string
}

export const SPORTS: Sport[] = [
  { id: 'football', name: 'Football' },
  { id: 'basketball', name: 'Basketball' },
  { id: 'tennis', name: 'Tennis' },
]

export interface Match {
  id: string
  sport: SportId
  league: string
  country: string
  home: string
  away: string
  kickoff: string
  live?: { clock: string; score: [number, number] }
  odds: { '1': number; X?: number; '2': number }
  ou?: { line: number; over: number; under: number }
  markets: number
}

export const MATCHES: Match[] = [
  {
    id: 'm1',
    sport: 'football',
    league: 'Premier League',
    country: 'England',
    home: 'Arsenal',
    away: 'Chelsea',
    kickoff: 'Live',
    live: { clock: "67'", score: [2, 1] },
    odds: { '1': 1.32, X: 4.9, '2': 9.5 },
    ou: { line: 3.5, over: 1.85, under: 1.95 },
    markets: 142,
  },
  {
    id: 'm2',
    sport: 'football',
    league: 'Elite One',
    country: 'Cameroon',
    home: 'Coton Sport',
    away: 'Canon Yaoundé',
    kickoff: 'Live',
    live: { clock: "34'", score: [0, 0] },
    odds: { '1': 2.1, X: 2.85, '2': 3.6 },
    ou: { line: 1.5, over: 2.05, under: 1.72 },
    markets: 64,
  },
  {
    id: 'm3',
    sport: 'football',
    league: 'LaLiga',
    country: 'Spain',
    home: 'Real Madrid',
    away: 'Sevilla',
    kickoff: 'Live',
    live: { clock: "HT", score: [1, 0] },
    odds: { '1': 1.45, X: 4.1, '2': 7.25 },
    ou: { line: 2.5, over: 1.7, under: 2.1 },
    markets: 118,
  },
  {
    id: 'm4',
    sport: 'football',
    league: 'Champions League',
    country: 'Europe',
    home: 'PSG',
    away: 'Bayern Munich',
    kickoff: 'Today 21:00',
    odds: { '1': 2.55, X: 3.6, '2': 2.6 },
    ou: { line: 2.5, over: 1.62, under: 2.25 },
    markets: 236,
  },
  {
    id: 'm5',
    sport: 'football',
    league: 'Champions League',
    country: 'Europe',
    home: 'Man City',
    away: 'Inter',
    kickoff: 'Today 21:00',
    odds: { '1': 1.75, X: 3.9, '2': 4.4 },
    ou: { line: 2.5, over: 1.8, under: 2.0 },
    markets: 228,
  },
  {
    id: 'm6',
    sport: 'football',
    league: 'Serie A',
    country: 'Italy',
    home: 'Juventus',
    away: 'AC Milan',
    kickoff: 'Tomorrow 20:45',
    odds: { '1': 2.3, X: 3.15, '2': 3.2 },
    ou: { line: 2.5, over: 2.05, under: 1.75 },
    markets: 174,
  },
  {
    id: 'm7',
    sport: 'football',
    league: 'Ligue 1',
    country: 'France',
    home: 'Marseille',
    away: 'Lyon',
    kickoff: 'Tomorrow 21:00',
    odds: { '1': 1.95, X: 3.5, '2': 3.75 },
    ou: { line: 2.5, over: 1.72, under: 2.1 },
    markets: 162,
  },
  {
    id: 'm8',
    sport: 'football',
    league: 'Bundesliga',
    country: 'Germany',
    home: 'Dortmund',
    away: 'Leverkusen',
    kickoff: 'Sat 18:30',
    odds: { '1': 2.4, X: 3.7, '2': 2.7 },
    ou: { line: 3.5, over: 2.15, under: 1.68 },
    markets: 158,
  },
  {
    id: 'm9',
    sport: 'football',
    league: 'Premier League',
    country: 'England',
    home: 'Liverpool',
    away: 'Man United',
    kickoff: 'Sun 17:30',
    odds: { '1': 1.6, X: 4.2, '2': 5.0 },
    ou: { line: 2.5, over: 1.55, under: 2.4 },
    markets: 211,
  },
  {
    id: 'm10',
    sport: 'football',
    league: 'CAF Champions League',
    country: 'Africa',
    home: 'Al Ahly',
    away: 'Wydad AC',
    kickoff: 'Fri 19:00',
    odds: { '1': 1.9, X: 3.1, '2': 4.3 },
    ou: { line: 2.5, over: 2.3, under: 1.6 },
    markets: 88,
  },
  {
    id: 'b1',
    sport: 'basketball',
    league: 'NBA',
    country: 'USA',
    home: 'LA Lakers',
    away: 'Boston Celtics',
    kickoff: 'Live',
    live: { clock: 'Q3 04:12', score: [78, 81] },
    odds: { '1': 2.05, '2': 1.78 },
    ou: { line: 224.5, over: 1.9, under: 1.9 },
    markets: 96,
  },
  {
    id: 'b2',
    sport: 'basketball',
    league: 'NBA',
    country: 'USA',
    home: 'Golden State',
    away: 'Denver Nuggets',
    kickoff: 'Tonight 03:00',
    odds: { '1': 1.95, '2': 1.87 },
    ou: { line: 231.5, over: 1.88, under: 1.92 },
    markets: 104,
  },
  {
    id: 'b3',
    sport: 'basketball',
    league: 'EuroLeague',
    country: 'Europe',
    home: 'Real Madrid',
    away: 'Olympiacos',
    kickoff: 'Thu 20:45',
    odds: { '1': 1.55, '2': 2.45 },
    ou: { line: 162.5, over: 1.9, under: 1.9 },
    markets: 72,
  },
  {
    id: 't1',
    sport: 'tennis',
    league: 'ATP Finals',
    country: 'World',
    home: 'C. Alcaraz',
    away: 'J. Sinner',
    kickoff: 'Live',
    live: { clock: 'Set 2', score: [1, 0] },
    odds: { '1': 1.62, '2': 2.3 },
    markets: 44,
  },
  {
    id: 't2',
    sport: 'tennis',
    league: 'ATP Finals',
    country: 'World',
    home: 'N. Djokovic',
    away: 'A. Zverev',
    kickoff: 'Today 14:00',
    odds: { '1': 1.48, '2': 2.65 },
    markets: 38,
  },
  {
    id: 't3',
    sport: 'tennis',
    league: 'WTA Finals',
    country: 'World',
    home: 'A. Sabalenka',
    away: 'C. Gauff',
    kickoff: 'Tomorrow 19:30',
    odds: { '1': 1.7, '2': 2.12 },
    markets: 36,
  },
]

export function getMatch(id: string) {
  return MATCHES.find((m) => m.id === id)
}

export interface Boost {
  id: string
  matchId: string
  tier: 'Super Boost' | 'Daily Boost' | 'Accumulator Boost'
  title: string
  detail: string
  was: number
  odds: number
  maxStake: number
  endsIn: string
}

export const BOOSTS: Boost[] = [
  {
    id: 'bo1',
    matchId: 'm4',
    tier: 'Super Boost',
    title: 'PSG to win & both teams to score',
    detail: 'PSG vs Bayern Munich · Champions League',
    was: 4.75,
    odds: 7.5,
    maxStake: 25_000,
    endsIn: 'Kick-off 21:00',
  },
  {
    id: 'bo2',
    matchId: 'm5',
    tier: 'Daily Boost',
    title: 'Haaland to score anytime',
    detail: 'Man City vs Inter · Champions League',
    was: 1.85,
    odds: 2.5,
    maxStake: 50_000,
    endsIn: 'Kick-off 21:00',
  },
  {
    id: 'bo3',
    matchId: 'm9',
    tier: 'Super Boost',
    title: 'Liverpool win, over 2.5 goals & Salah to score',
    detail: 'Liverpool vs Man United · Premier League',
    was: 3.9,
    odds: 6.0,
    maxStake: 25_000,
    endsIn: 'Sun 17:30',
  },
  {
    id: 'bo4',
    matchId: 'm10',
    tier: 'Daily Boost',
    title: 'Al Ahly to win to nil',
    detail: 'Al Ahly vs Wydad AC · CAF Champions League',
    was: 3.4,
    odds: 4.5,
    maxStake: 50_000,
    endsIn: 'Fri 19:00',
  },
  {
    id: 'bo5',
    matchId: 'b2',
    tier: 'Daily Boost',
    title: 'Curry 30+ points & Warriors win',
    detail: 'Golden State vs Denver · NBA',
    was: 4.2,
    odds: 5.75,
    maxStake: 30_000,
    endsIn: 'Tonight 03:00',
  },
  {
    id: 'bo6',
    matchId: 't2',
    tier: 'Super Boost',
    title: 'Djokovic to win in straight sets',
    detail: 'Djokovic vs Zverev · ATP Finals',
    was: 2.4,
    odds: 3.4,
    maxStake: 25_000,
    endsIn: 'Today 14:00',
  },
]

export function getBoost(id: string) {
  return BOOSTS.find((b) => b.id === id)
}

export const ACCA_BOOST_TIERS = [
  { legs: 3, pct: 5 },
  { legs: 5, pct: 10 },
  { legs: 7, pct: 20 },
  { legs: 10, pct: 35 },
]

export function accaBoostPct(legs: number) {
  let pct = 0
  for (const tier of ACCA_BOOST_TIERS) if (legs >= tier.legs) pct = tier.pct
  return pct
}
