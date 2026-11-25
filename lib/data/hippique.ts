export interface Runner {
  number: number
  name: string
  jockey: string
  odds: number
  form: string
}

export interface Race {
  id: string
  code: string
  meeting: string
  name: string
  discipline: string
  distance: string
  purse: string
  start: string
  quinte?: boolean
  runners: Runner[]
}

export interface HippiqueBetType {
  id: string
  label: string
  picks: number
  unit: number
  description: string
  fixedOdds: boolean
}

export const HIPPIQUE_BET_TYPES: HippiqueBetType[] = [
  { id: 'gagnant', label: 'Simple Gagnant', picks: 1, unit: 200, fixedOdds: true, description: 'Your horse must finish 1st.' },
  { id: 'place', label: 'Simple Placé', picks: 1, unit: 200, fixedOdds: false, description: 'Your horse must finish in the top 3.' },
  { id: 'couple', label: 'Couplé', picks: 2, unit: 300, fixedOdds: false, description: 'Pick the first two finishers, in any order.' },
  { id: 'tierce', label: 'Tiercé', picks: 3, unit: 500, fixedOdds: false, description: 'Pick the top 3. Exact order pays the most.' },
  { id: 'quarte', label: 'Quarté+', picks: 4, unit: 500, fixedOdds: false, description: 'Pick the top 4 finishers.' },
  { id: 'quinte', label: 'Quinté+', picks: 5, unit: 500, fixedOdds: false, description: 'Pick the top 5 finishers. Biggest pool of the day.' },
]

const names = [
  ['Idéal du Gazeau', 'E. Raffin'],
  ['Hooker Berry', 'J-M. Bazire'],
  ['Galius', 'F. Nivard'],
  ['Just Love You', 'M. Abrivard'],
  ['Hohneck', 'G. Gelormini'],
  ['Inmarosa', 'P-Y. Verva'],
  ['Go On Boy', 'R. Derieux'],
  ['Hussard du Landret', 'D. Thomain'],
  ['Izoard Vedaquais', 'Y. Lebourgeois'],
  ['Jushua Tree', 'B. Rochard'],
  ['Hokkaido Jiel', 'A. Abrivard'],
  ['Gu d’Héripré', 'L. Abrivard'],
  ['Kali du Bourg', 'C. Martens'],
  ['Joviality', 'T. Le Beller'],
]

const forms = ['1a 2a 1a', '3a 1a Da', '2a 4a 1a', '5a 2a 3a', '1a 1a 6a', 'Da 3a 2a', '4a 5a 2a', '2a 2a 1a']

function buildRunners(seed: number, count: number): Runner[] {
  return Array.from({ length: count }, (_, i) => {
    const [name, jockey] = names[(i + seed) % names.length]
    const odds = Number((2.2 + ((i * 7 + seed * 3) % 23) * 1.15).toFixed(1))
    return { number: i + 1, name, jockey, odds, form: forms[(i + seed) % forms.length] }
  })
}

export const RACES: Race[] = [
  {
    id: 'r1c4',
    code: 'R1C4',
    meeting: 'Vincennes',
    name: 'Prix de Bretagne',
    discipline: 'Trot attelé',
    distance: '2 700 m',
    purse: '120 000 €',
    start: '15:15',
    quinte: true,
    runners: buildRunners(0, 14),
  },
  {
    id: 'r1c5',
    code: 'R1C5',
    meeting: 'Vincennes',
    name: 'Prix de Lisieux',
    discipline: 'Trot monté',
    distance: '2 175 m',
    purse: '48 000 €',
    start: '15:50',
    runners: buildRunners(3, 12),
  },
  {
    id: 'r2c2',
    code: 'R2C2',
    meeting: 'Chantilly',
    name: 'Prix de la Forêt',
    discipline: 'Plat',
    distance: '1 600 m',
    purse: '35 000 €',
    start: '16:25',
    runners: buildRunners(6, 10),
  },
  {
    id: 'r3c1',
    code: 'R3C1',
    meeting: 'Deauville',
    name: 'Prix du Calvados',
    discipline: 'Plat',
    distance: '1 900 m',
    purse: '28 000 €',
    start: '17:05',
    runners: buildRunners(9, 9),
  },
]

export function getRace(id: string) {
  return RACES.find((r) => r.id === id)
}

export function getHippiqueBetType(id: string) {
  return HIPPIQUE_BET_TYPES.find((b) => b.id === id)
}
