export type JackpotPick = '1' | 'X' | '2'

export interface JackpotEvent {
  id: string
  league: string
  home: string
  away: string
  kickoff: string
  odds: Record<JackpotPick, number>
}

export const JACKPOT = {
  id: 'mega15-w48',
  name: 'Mega Jackpot 15',
  round: 'Week 48',
  pool: 50_000_000,
  linePrice: 200,
  maxLines: 4096,
  closes: 'Sat 14:00',
  prizes: [
    { correct: 15, label: '15/15', share: 'Jackpot 50 000 000 FCFA' },
    { correct: 14, label: '14/15', share: 'Bonus 2 500 000 FCFA' },
    { correct: 13, label: '13/15', share: 'Bonus 250 000 FCFA' },
    { correct: 12, label: '12/15', share: 'Bonus 25 000 FCFA' },
  ],
}

/** Next Saturday 14:00 Cameroon time (WAT, UTC+1), matching `JACKPOT.closes`. */
export function jackpotClosesAt(now = new Date()): Date {
  const close = new Date(now)
  close.setUTCHours(13, 0, 0, 0)
  const daysToSaturday = (6 - close.getUTCDay() + 7) % 7
  close.setUTCDate(close.getUTCDate() + daysToSaturday)
  if (close <= now) close.setUTCDate(close.getUTCDate() + 7)
  return close
}

export const JACKPOT_EVENTS: JackpotEvent[] = [
  { id: 'j1', league: 'Premier League', home: 'Tottenham', away: 'Newcastle', kickoff: 'Sat 16:00', odds: { '1': 2.35, X: 3.5, '2': 2.9 } },
  { id: 'j2', league: 'Premier League', home: 'Aston Villa', away: 'Brighton', kickoff: 'Sat 16:00', odds: { '1': 1.95, X: 3.7, '2': 3.6 } },
  { id: 'j3', league: 'Premier League', home: 'Everton', away: 'Fulham', kickoff: 'Sat 16:00', odds: { '1': 2.6, X: 3.2, '2': 2.75 } },
  { id: 'j4', league: 'LaLiga', home: 'Atlético Madrid', away: 'Villarreal', kickoff: 'Sat 16:15', odds: { '1': 1.7, X: 3.75, '2': 4.8 } },
  { id: 'j5', league: 'LaLiga', home: 'Real Betis', away: 'Athletic Club', kickoff: 'Sat 18:30', odds: { '1': 2.5, X: 3.25, '2': 2.85 } },
  { id: 'j6', league: 'Serie A', home: 'Napoli', away: 'Roma', kickoff: 'Sat 18:00', odds: { '1': 1.9, X: 3.4, '2': 4.1 } },
  { id: 'j7', league: 'Serie A', home: 'Atalanta', away: 'Lazio', kickoff: 'Sat 20:45', odds: { '1': 1.85, X: 3.75, '2': 4.0 } },
  { id: 'j8', league: 'Bundesliga', home: 'Leipzig', away: 'Frankfurt', kickoff: 'Sat 15:30', odds: { '1': 1.8, X: 3.9, '2': 4.1 } },
  { id: 'j9', league: 'Bundesliga', home: 'Stuttgart', away: 'Wolfsburg', kickoff: 'Sat 15:30', odds: { '1': 1.75, X: 3.95, '2': 4.3 } },
  { id: 'j10', league: 'Ligue 1', home: 'Monaco', away: 'Lille', kickoff: 'Sat 17:00', odds: { '1': 2.1, X: 3.5, '2': 3.3 } },
  { id: 'j11', league: 'Ligue 1', home: 'Lens', away: 'Rennes', kickoff: 'Sat 21:00', odds: { '1': 2.0, X: 3.3, '2': 3.75 } },
  { id: 'j12', league: 'Eredivisie', home: 'Ajax', away: 'AZ Alkmaar', kickoff: 'Sat 18:45', odds: { '1': 1.8, X: 3.9, '2': 4.0 } },
  { id: 'j13', league: 'Primeira Liga', home: 'Benfica', away: 'Braga', kickoff: 'Sat 20:30', odds: { '1': 1.55, X: 4.1, '2': 5.6 } },
  { id: 'j14', league: 'Elite One', home: 'Union Douala', away: 'PWD Bamenda', kickoff: 'Sat 15:00', odds: { '1': 2.2, X: 2.9, '2': 3.4 } },
  { id: 'j15', league: 'Botola Pro', home: 'Raja CA', away: 'FAR Rabat', kickoff: 'Sat 19:00', odds: { '1': 2.4, X: 2.95, '2': 3.05 } },
]

export function countLines(picks: Record<string, JackpotPick[]>) {
  return JACKPOT_EVENTS.reduce((lines, e) => lines * (picks[e.id]?.length ?? 0), 1)
}
