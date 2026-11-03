export type IslandId = 'football' | 'wrestling' | 'music' | 'story' | 'bricks' | 'space'

/** Unsplash photos (free Unsplash License). No identifiable stars, no logos. */
export const PHOTOS = {
  football: { id: 'photo-1679391029864-d46f366a456b', credit: 'Howard Bouchevereau', page: 'https://unsplash.com/photos/yKHZ65nuEtE' },
  wrestling: { id: 'photo-1443683263937-3e377546e8a8', credit: 'Martin Martz', page: 'https://unsplash.com/photos/1iHpSdiZyFA' },
  music: { id: 'photo-1768053921689-1bc09db904c9', credit: 'Nicolás Flor', page: 'https://unsplash.com/photos/gKgL1WlE5KM' },
  space: { id: 'photo-1541185933-ef5d8ed016c2', credit: 'SpaceX', page: 'https://unsplash.com/photos/Ptd-iTdrCJM' },
  bricks: { id: 'photo-1587654780291-39c9404d746b', credit: 'Unsplash', page: 'https://unsplash.com' },
  story: { id: 'photo-1512820790803-83ca734da794', credit: 'Unsplash', page: 'https://unsplash.com' },
} as const

export const photoUrl = (id: IslandId, w = 900) =>
  `https://images.unsplash.com/${PHOTOS[id].id}?auto=format&fit=crop&w=${w}&q=70`

export interface Quest {
  id: string
  title: string
  subject: 'Maths' | 'English'
  skill: string
  steps: number
  done: number
  playable?: boolean
}

export interface Island {
  id: IslandId
  name: string
  tagline: string
  /** gradient used when the photo can't load, and for the island's accents */
  tint: [string, string]
  /** position on the 360 x 480 world map */
  x: number
  y: number
  level: number
  stars: number
  locked?: boolean
  quests: Quest[]
}

export const ISLANDS: Island[] = [
  {
    id: 'football',
    name: 'Football Stadium',
    tagline: 'Penalties, scores and league tables',
    tint: ['#1FA463', '#0B6B45'],
    x: 92,
    y: 112,
    level: 4,
    stars: 11,
    quests: [
      { id: 'penalties', title: 'Penalty Shootout', subject: 'Maths', skill: 'Fractions of amounts', steps: 6, done: 2, playable: true },
      { id: 'league', title: 'League Table Climb', subject: 'Maths', skill: 'Adding and subtracting', steps: 5, done: 5 },
      { id: 'report', title: 'Match Report', subject: 'English', skill: 'Writing in the past tense', steps: 4, done: 0 },
    ],
  },
  {
    id: 'wrestling',
    name: 'Wrestling Arena',
    tagline: 'Title belts and big entrances',
    tint: ['#E2473A', '#8E1E2C'],
    x: 268,
    y: 92,
    level: 3,
    stars: 7,
    quests: [
      { id: 'rounds', title: 'Tournament Rounds', subject: 'Maths', skill: 'Multiplication', steps: 6, done: 3 },
      { id: 'promo', title: 'Entrance Speech', subject: 'English', skill: 'Persuasive language', steps: 4, done: 0 },
    ],
  },
  {
    id: 'music',
    name: 'Music Stage',
    tagline: 'K-pop, beats and big shows',
    tint: ['#8B5CF6', '#4C1D95'],
    x: 278,
    y: 240,
    level: 2,
    stars: 4,
    quests: [
      { id: 'tickets', title: 'Sold-out Show', subject: 'Maths', skill: 'Rounding big numbers', steps: 5, done: 1 },
      { id: 'lyrics', title: 'Rhythm and Rhyme', subject: 'English', skill: 'Poetry and syllables', steps: 4, done: 0 },
    ],
  },
  {
    id: 'story',
    name: 'Story Forest',
    tagline: 'Reading adventures',
    tint: ['#22C58B', '#0F6B55'],
    x: 86,
    y: 272,
    level: 3,
    stars: 9,
    quests: [
      { id: 'read', title: 'The Lost Map', subject: 'English', skill: 'Reading aloud', steps: 5, done: 2 },
      { id: 'inference', title: 'Detective Clues', subject: 'English', skill: 'Inference', steps: 4, done: 0 },
    ],
  },
  {
    id: 'bricks',
    name: 'Brick City',
    tagline: 'Build, measure, design',
    tint: ['#F59E0B', '#B45309'],
    x: 176,
    y: 372,
    level: 1,
    stars: 2,
    quests: [{ id: 'build', title: 'Dream Bedroom', subject: 'Maths', skill: 'Area and perimeter', steps: 6, done: 0 }],
  },
  {
    id: 'space',
    name: 'Space Station',
    tagline: 'Rockets and planets',
    tint: ['#3E8EF0', '#1E2A78'],
    x: 286,
    y: 404,
    level: 0,
    stars: 0,
    locked: true,
    quests: [{ id: 'fuel', title: 'Fuel the Rocket', subject: 'Maths', skill: 'Decimals', steps: 6, done: 0 }],
  },
]

export const islandById = (id: IslandId) => ISLANDS.find((i) => i.id === id)!

export const CHILD = {
  name: 'Maya',
  year: 5,
  streak: 5,
  gems: 240,
  level: 7,
  xp: 640,
  xpNext: 800,
  buddy: 'Nova',
}

export const DAILY = [
  { id: 'quest', label: 'Finish 2 quest steps', done: 1, total: 2, reward: 20 },
  { id: 'read', label: 'Read aloud for 5 minutes', done: 0, total: 5, reward: 15 },
  { id: 'scan', label: 'Scan a homework sheet', done: 0, total: 1, reward: 10 },
]
