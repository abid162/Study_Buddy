export type IslandId = 'football' | 'wrestling' | 'music' | 'story' | 'bricks' | 'space'

export interface Island {
  id: IslandId
  name: string
  tagline: string
  /** gradient used when the photo can't load, and for the island's accents */
  tint: [string, string]
  /** position on the 360 x 480 world map */
  x: number
  y: number
}

export const ISLANDS: Island[] = [
  {
    id: 'football',
    name: 'Football',
    tagline: 'Penalties, scores and league tables',
    tint: ['#1FA463', '#0B6B45'],
    x: 92,
    y: 112,
  },
  {
    id: 'wrestling',
    name: 'Wrestling',
    tagline: 'Title belts and big entrances',
    tint: ['#E2473A', '#8E1E2C'],
    x: 268,
    y: 92,
  },
  {
    id: 'music',
    name: 'Music Stage',
    tagline: 'K-pop, beats and big shows',
    tint: ['#8B5CF6', '#4C1D95'],
    x: 278,
    y: 240,
  },
  {
    id: 'story',
    name: 'Story Forest',
    tagline: 'Reading adventures',
    tint: ['#22C58B', '#0F6B55'],
    x: 86,
    y: 272,
  },
  {
    id: 'bricks',
    name: 'Brick City',
    tagline: 'Build, measure, design',
    tint: ['#F59E0B', '#B45309'],
    x: 176,
    y: 372,
  },
  {
    id: 'space',
    name: 'Space Station',
    tagline: 'Rockets and planets',
    tint: ['#3E8EF0', '#1E2A78'],
    x: 286,
    y: 404,
  },
]

export const islandById = (id: IslandId) => ISLANDS.find((i) => i.id === id)!

/** Preview streak (real streaks need a backend). */
export const CHILD = { streak: 5, buddy: 'Nova' }

export const DAILY = [
  { id: 'quest', label: 'Finish 2 quest steps', done: 1, total: 2, reward: 20 },
  { id: 'read', label: 'Read aloud for 5 minutes', done: 0, total: 5, reward: 15 },
  { id: 'scan', label: 'Scan a homework sheet', done: 0, total: 1, reward: 10 },
]
