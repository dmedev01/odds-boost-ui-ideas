// Builds lib/data/snapshot.json from a HAR captured on the live Wandabet site.
// Usage: node scripts/extract-snapshot.cjs capture1.har [capture2.har ...]
const fs = require('fs')
const path = require('path')

const harPaths = process.argv.slice(2)
const h = { log: { entries: [] } }
for (const p of harPaths) h.log.entries.push(...JSON.parse(fs.readFileSync(p, 'utf8')).log.entries)

const ok = (re) =>
  h.log.entries.filter(
    (e) => re.test(e.request.url) && e.response.status === 200 && e.response.content.text,
  )
const parse = (e) => {
  try {
    return JSON.parse(e.response.content.text)
  } catch {
    return null
  }
}
const biggest = (re) =>
  ok(re).sort((a, b) => b.response.content.text.length - a.response.content.text.length)[0]

const SPORT_IDS = {
  'sr:sport:1': 'football',
  'sr:sport:2': 'basketball',
  'sr:sport:5': 'tennis',
  'sr:sport:4': 'ice-hockey',
  'sr:sport:6': 'handball',
  'sr:sport:23': 'volleyball',
  'sr:sport:20': 'table-tennis',
  'sr:sport:12': 'rugby',
  'sr:sport:21': 'cricket',
  'sr:sport:22': 'darts',
  'sr:sport:10': 'boxing',
  'sr:sport:117': 'mma',
  'sr:sport:19': 'snooker',
  'sr:sport:29': 'futsal',
}
const slug = (s) => s.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '')

const sportsResp = parse(biggest(/\/sport\/\d+\/sports\?/)) || []
const sports = (Array.isArray(sportsResp) ? sportsResp : [])
  .map((s) => ({
    id: SPORT_IDS[s.id] || slug(s.name),
    srId: s.id,
    name: s.name === 'Soccer' ? 'Football' : s.name,
    count: s.count ?? 0,
  }))
  .filter((s) => s.count > 0)

const majors = parse(biggest(/majorTournaments/)) || []
const majorTournaments = (Array.isArray(majors) ? majors : [])
  .map((t) => ({ id: t.id, name: t.name }))
  .filter((t) => t.id && t.name)

const tournamentNames = {}
const categoryOf = {}
const sportOfTournament = {}
for (const e of ok(/mathys-gateway/)) {
  const j = parse(e)
  if (!j) continue
  const walk = (o, cat, sp) => {
    if (Array.isArray(o)) return o.forEach((x) => walk(x, cat, sp))
    if (!o || typeof o !== 'object') return
    if (typeof o.id === 'string') {
      if (o.id.startsWith('sr:sport:')) sp = o.id
      if (o.id.startsWith('sr:category:')) cat = o.name
      if (o.id.startsWith('sr:tournament:') && o.name) {
        tournamentNames[o.id] = o.name
        if (cat) categoryOf[o.id] = cat
        if (sp) sportOfTournament[o.id] = sp
      }
      if (o.id.startsWith('sr:match:')) return
    }
    for (const k in o) walk(o[k], cat, sp)
  }
  walk(j)
}

const sportOfCategory = {}
for (const e of ok(/\/sport\/sr:sport:\d+\/0\/categories/)) {
  const sp = e.request.url.match(/sr:sport:\d+/)[0]
  for (const c of parse(e) || []) {
    sportOfCategory[c.id] = sp
  }
}
for (const e of ok(/\/sport\/sr:category:\d+\/0\/tournaments/)) {
  const cat = e.request.url.match(/sr:category:\d+/)[0]
  for (const t of parse(e) || []) {
    if (sportOfCategory[cat]) sportOfTournament[t.id] = sportOfCategory[cat]
    tournamentNames[t.id] = t.name
  }
}

const round = (n) => Math.round(n * 100) / 100
const matches = new Map()

function addMatch(m, ctx) {
  if (!m || !m.id || !m.info?.teamhome || !m.info?.teamaway) return
  const all = (m.outcome || []).filter((x) => x.is_active)
  const marketId = all.some((x) => x.market?.id === '1') ? '1' : String(m.default_market)
  const o = all.filter((x) => x.market?.id === marketId)
  const pick = (d) => o.find((x) => x.display === d)?.odds
  const one = pick('1')
  const two = pick('2')
  if (!one || !two) return
  const prev = matches.get(m.id)
  const srT = m.tournamentId || ctx.tournamentId
  const sportSr = ctx.sportSr || sportOfTournament[srT] || prev?.srSport || 'sr:sport:1'
  const rec = {
    id: m.id.replace('sr:match:', 'm'),
    srSport: sportSr,
    sport: SPORT_IDS[sportSr] || 'football',
    league: tournamentNames[srT] || ctx.tournamentName || prev?.league || 'Other',
    country: categoryOf[srT] || ctx.category || prev?.country || '',
    home: m.info.teamhome.name,
    away: m.info.teamaway.name,
    time: m.time,
    odds: { 1: round(one), ...(pick('X') ? { X: round(pick('X')) } : {}), 2: round(two) },
    markets: m.count || prev?.markets || 0,
    form: {
      home: (m.info.teamhome.results || []).slice(0, 5),
      away: (m.info.teamaway.results || []).slice(0, 5),
    },
    popular: o.map((x) => x.percentageBet || 0),
  }
  if (ctx.live) {
    const sc = m.score || m.info?.score || m.livescore || {}
    const hs = Number(sc.home ?? sc.home_score ?? m.home_score ?? 0) || 0
    const as = Number(sc.away ?? sc.away_score ?? m.away_score ?? 0) || 0
    const clock = m.match_time || m.status?.match_time || m.info?.match_time
    const mins = clock
      ? String(clock).split(':')[0]
      : String(Math.max(1, Math.min(90, Math.round((Date.now() - m.time) / 60000))))
    rec.live = { clock: `${mins}'`, score: [hs, as] }
  }
  matches.set(m.id, { ...prev, ...rec, live: rec.live || prev?.live })
}

for (const e of ok(/\/sport\/sr:tournament:\d+\/\d+\/matches/)) {
  const tId = e.request.url.match(/sr:tournament:\d+/)[0]
  const j = parse(e) || []
  if (!Array.isArray(j)) continue
  for (const day of j) for (const m of day.matches || []) addMatch(m, { tournamentId: tId })
}

const walkMatches = (j, ctx) => {
  const walk = (o, c) => {
    if (Array.isArray(o)) return o.forEach((x) => walk(x, c))
    if (!o || typeof o !== 'object') return
    if (typeof o.id === 'string') {
      if (o.id.startsWith('sr:sport:')) c = { ...c, sportSr: o.id }
      if (o.id.startsWith('sr:category:')) c = { ...c, category: o.name }
      if (o.id.startsWith('sr:tournament:'))
        c = { ...c, tournamentId: o.id, tournamentName: o.name }
      if (o.id.startsWith('sr:match:')) return addMatch(o, c)
    }
    for (const k in o) walk(o[k], c)
  }
  walk(j, ctx)
}
for (const e of ok(/match\/vedette|event\/boosted/)) walkMatches(parse(e), {})
for (const e of ok(/liveEvents/)) walkMatches(parse(e), { live: true })

const boosts = []
for (const e of ok(/event\/boosted/)) {
  const walk = (o) => {
    if (Array.isArray(o)) return o.forEach(walk)
    if (!o || typeof o !== 'object') return
    if (typeof o.id === 'string' && o.id.startsWith('sr:match:') && o.info) {
      for (const x of o.outcome || []) {
        const was = Number(x.oldOdds)
        if (was && x.odds > was) {
          boosts.push({
            matchId: o.id.replace('sr:match:', 'm'),
            home: o.info.teamhome?.name,
            away: o.info.teamaway?.name,
            market: x.market?.name || '1x2',
            pick: x.name === 'draw' ? 'Draw' : x.name,
            was: round(was),
            now: round(x.odds),
            time: o.time,
            boostEnd: Number(x.endDate) || o.boostEnd || null,
            live: Boolean(o.isLive),
          })
        }
      }
      return
    }
    for (const k in o) walk(o[k])
  }
  walk(parse(e))
}
const uniqBoosts = [...new Map(boosts.map((b) => [b.matchId + b.pick, b])).values()]

const out = {
  capturedAt: new Date().toISOString(),
  sports,
  majorTournaments,
  matches: [...matches.values()]
    .filter((m) => m.home && m.away)
    .sort((a, b) => (b.live ? 1 : 0) - (a.live ? 1 : 0) || a.time - b.time),
  boosts: uniqBoosts,
}
const dest = path.join(__dirname, '..', 'lib', 'data', 'snapshot.json')
fs.writeFileSync(dest, JSON.stringify(out))

const by = {}
for (const m of out.matches) by[m.sport] = (by[m.sport] || 0) + 1
console.log('sports', sports.length, 'majors', majorTournaments.length)
console.log('matches', out.matches.length, 'live', out.matches.filter((m) => m.live).length)
console.log('boosts', uniqBoosts.length, 'leagues', new Set(out.matches.map((m) => m.league)).size)
console.log(by)
console.log('size', (fs.statSync(dest).size / 1024) | 0, 'KB')
