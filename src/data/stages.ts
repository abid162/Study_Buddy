import type { IslandId } from './world'

/**
 * STAGES: the ladder each world climbs as the child answers questions in it.
 * Edit names and blurbs freely. A stage unlocks when the child has answered this share of the world's questions:
 */
export const STAGE_AT = [0, 0.02, 0.06, 0.12, 0.22, 0.36, 0.55, 0.8]

export interface Stage {
  name: string
  blurb: string
}

/**
 * Note: some names below are real competitions or titles (for example the wrestling belts and the Ballon d'Or).
 * They are used as plain text only, with no logos. Check with the client before any public launch.
 */
export const STAGES: Record<IslandId, { title: string; stages: Stage[] }> = {
  wrestling: {
    title: 'Title run',
    stages: [
      { name: 'Opening match', blurb: 'Your first match on the card. Win the crowd!' },
      { name: 'Main-event match', blurb: 'The crowd knows your name now.' },
      { name: 'US Title', blurb: 'Your first gold. The United States Title is yours.' },
      { name: 'Tag Team Title', blurb: 'Team up with Nova for the tag belts.' },
      { name: 'Intercontinental Title', blurb: 'The workhorse belt. Only the best hold it.' },
      { name: 'UK Title', blurb: 'Champion of the United Kingdom.' },
      { name: 'Universal Title', blurb: 'One of the two biggest belts in the arena.' },
      { name: 'WWE Title', blurb: 'The top of the mountain. World champion!' },
    ],
  },
  football: {
    title: 'Season',
    stages: [
      { name: 'Academy debut', blurb: 'Pull on the shirt for your first match.' },
      { name: 'First goal', blurb: 'Your name is on the scoresheet!' },
      { name: 'Starting XI', blurb: 'The manager picks you every week now.' },
      { name: 'Top-four push', blurb: 'Your team is chasing a top-four finish.' },
      { name: 'Golden Boot race', blurb: 'You are one of the league’s top scorers.' },
      { name: 'League champions', blurb: 'Lift the league trophy with your team.' },
      { name: 'Player of the Season', blurb: 'Voted the best player in the league.' },
      { name: 'Ballon d’Or', blurb: 'The best player in the world. Legendary!' },
    ],
  },
  music: {
    title: 'Rise to fame',
    stages: [
      { name: 'Bedroom jam', blurb: 'Every star starts somewhere.' },
      { name: 'School concert', blurb: 'Your first real audience.' },
      { name: 'Local gig', blurb: 'A packed room at the town hall.' },
      { name: 'Radio play', blurb: 'Your song is on the radio!' },
      { name: 'Top 40', blurb: 'You’re in the charts.' },
      { name: 'Number one', blurb: 'Top of the charts!' },
      { name: 'Stadium tour', blurb: 'Sold-out stadiums in every city.' },
      { name: 'Hall of Fame', blurb: 'A music legend forever.' },
    ],
  },
  story: {
    title: 'The Lost Map',
    stages: [
      { name: 'The village', blurb: 'Where the adventure begins.' },
      { name: 'Whispering Woods', blurb: 'The trees seem to talk.' },
      { name: 'River crossing', blurb: 'Find a way across the rushing water.' },
      { name: 'Owl’s Tower', blurb: 'The wise owl has a clue for you.' },
      { name: 'Crystal Caves', blurb: 'Glittering tunnels deep underground.' },
      { name: 'Dragon’s Peak', blurb: 'Brave the mountain top.' },
      { name: 'The Lost Library', blurb: 'Every book holds a secret.' },
      { name: 'The treasure', blurb: 'The map is complete. You found it!' },
    ],
  },
  bricks: {
    title: 'City build',
    stages: [
      { name: 'Garden shed', blurb: 'Your very first build.' },
      { name: 'Cosy cottage', blurb: 'Four walls and a roof.' },
      { name: 'A whole street', blurb: 'Neighbours move in!' },
      { name: 'The big bridge', blurb: 'Connect both sides of the river.' },
      { name: 'New school', blurb: 'A place to learn and play.' },
      { name: 'Sports stadium', blurb: 'Seats for thousands of fans.' },
      { name: 'Skyscraper', blurb: 'Touching the clouds.' },
      { name: 'Capital city', blurb: 'Brick City is complete!' },
    ],
  },
  space: {
    title: 'Mission to the stars',
    stages: [
      { name: 'Launch pad', blurb: 'Ten, nine, eight…' },
      { name: 'Earth orbit', blurb: 'Floating above the clouds.' },
      { name: 'The Moon', blurb: 'One small step…' },
      { name: 'Mars', blurb: 'The red planet.' },
      { name: 'Asteroid belt', blurb: 'Dodge the space rocks!' },
      { name: 'Jupiter', blurb: 'The giant of the solar system.' },
      { name: 'Saturn’s rings', blurb: 'Surf the rings of ice.' },
      { name: 'Deep space', blurb: 'Beyond the solar system!' },
    ],
  },
}

/** Where a world is on its ladder. */
export function stageInfo(world: IslandId, answered: number, total: number) {
  const f = total ? answered / total : 0
  let index = 0
  for (let i = 0; i < STAGE_AT.length; i++) if (f >= STAGE_AT[i]!) index = i
  const list = STAGES[world].stages
  const nextAt = STAGE_AT[index + 1]
  const needed = nextAt === undefined ? 0 : Math.max(1, Math.ceil(nextAt * total - answered))
  const from = STAGE_AT[index]!
  const within = nextAt === undefined ? 1 : (f - from) / (nextAt - from)
  return { index, stage: list[index]!, next: list[index + 1], needed, within: Math.max(0, Math.min(1, within)), list }
}

/* ---------------- football: favourite team, league table and charts ---------------- */

/** Premier League clubs, 2026–27 season (names only, no badges). */
export const CLUBS = [
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton', 'Chelsea', 'Coventry City', 'Crystal Palace', 'Everton', 'Fulham',
  'Hull City', 'Ipswich Town', 'Leeds United', 'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle United', 'Nottingham Forest', 'Sunderland', 'Tottenham Hotspur',
]

const hash = (s: string) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

/** Rival clubs in a fixed, seeded order (strongest first) for this child’s team. */
function rivals(team: string) {
  return CLUBS.filter((c) => c !== team).sort((a, b) => hash(`${team}|${a}`) - hash(`${team}|${b}`))
}

export interface LeagueRow { club: string; p: number; w: number; d: number; l: number; pts: number; you: boolean }

/**
 * Each answered question is a match for the child’s team: right first time = win (3 points),
 * right after a hint or a miss = draw (1 point), answer shown = loss.
 * Rival clubs play the same number of matches at their own (invented) strength.
 */
export function leagueTable(team: string, played: number, wins: number, draws: number): LeagueRow[] {
  const rows: LeagueRow[] = rivals(team).map((club, i) => {
    const ppg = 2.4 - (i * 1.5) / 18
    const w = Math.round(played * ((ppg - 0.25) / 3))
    const d = Math.round(played * 0.25)
    const l = Math.max(0, played - w - d)
    return { club, p: played, w, d, l, pts: w * 3 + d, you: false }
  })
  rows.push({ club: team, p: played, w: wins, d: draws, l: Math.max(0, played - wins - draws), pts: wins * 3 + draws, you: true })
  return rows.sort((a, b) => b.pts - a.pts || (a.you ? -1 : b.you ? 1 : a.club.localeCompare(b.club)))
}

/** Invented strikers and playmakers at rival clubs (not real people). */
const STRIKERS = ['Marco Lindqvist', 'Tayo Bright', 'Rafa Okoye', 'Jonah Pell', 'Kofi Mensah-Hart']
const PLAYMAKERS = ['Elio Castellan', 'Sami Northcott', 'Ben Adeyemi', 'Luca Varga', 'Theo Ashdown']

export interface ChartRow { name: string; club: string; n: number; you: boolean }

function chart(names: string[], rates: number[], team: string, played: number, child: string, mine: number): ChartRow[] {
  const clubs = rivals(team)
  const rows = names.map((name, i) => ({ name, club: clubs[i]!, n: Math.round(played * rates[i]!), you: false }))
  rows.push({ name: child, club: team, n: mine, you: true })
  return rows.sort((a, b) => b.n - a.n || (a.you ? -1 : 1))
}

/** Golden Boot: a goal for every question right first time. */
export const goldenBoot = (team: string, played: number, child: string, goals: number) => chart(STRIKERS, [0.6, 0.52, 0.45, 0.38, 0.3], team, played, child, goals)
/** Assists chart: an assist for every question right after a hint or a second try. */
export const assistChart = (team: string, played: number, child: string, assists: number) => chart(PLAYMAKERS, [0.16, 0.13, 0.1, 0.08, 0.06], team, played, child, assists)

export const ordinal = (n: number) => `${n}${n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'}`
