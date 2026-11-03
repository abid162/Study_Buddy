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

/** A themed "fractions of an amount" problem; answers are computed and checked in code. */
export interface ProblemSpec {
  scene: string
  /** what is being counted, plural, e.g. "penalties" */
  noun: string
  /** the question verb phrase, e.g. "They score {frac} of them. How many goals is that?" */
  ask: string
  unit: string
  total: number
  groups: 2 | 3 | 4
  take: number
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
  quests: Quest[]
  problems: [ProblemSpec, ProblemSpec]
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
    problems: [
      { scene: 'Your team takes 20 penalties in training.', noun: 'penalties', ask: 'They score {frac} of them. How many goals is that?', unit: 'goals', total: 20, groups: 4, take: 3 },
      { scene: 'In the shootout, your goalkeeper faces 18 shots.', noun: 'shots', ask: 'She saves {frac} of them. How many saves does she make?', unit: 'saves', total: 18, groups: 3, take: 2 },
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
      { id: 'rounds', title: 'Title Belt Tour', subject: 'Maths', skill: 'Fractions of amounts', steps: 6, done: 2, playable: true },
      { id: 'promo', title: 'Entrance Speech', subject: 'English', skill: 'Persuasive language', steps: 4, done: 0 },
    ],
    problems: [
      { scene: 'Your wrestler fights 24 matches on the title tour.', noun: 'matches', ask: 'They win {frac} of them. How many wins is that?', unit: 'wins', total: 24, groups: 4, take: 3 },
      { scene: '15 fans hold up signs for the big entrance.', noun: 'fans', ask: '{Frac} of the signs are gold. How many gold signs are there?', unit: 'signs', total: 15, groups: 3, take: 2 },
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
      { id: 'tickets', title: 'Sold-out Show', subject: 'Maths', skill: 'Fractions of amounts', steps: 6, done: 2, playable: true },
      { id: 'lyrics', title: 'Rhythm and Rhyme', subject: 'English', skill: 'Poetry and syllables', steps: 4, done: 0 },
    ],
    problems: [
      { scene: 'The band sells 40 tickets for a secret show.', noun: 'tickets', ask: '{Frac} of them are standing tickets. How many standing tickets?', unit: 'tickets', total: 40, groups: 4, take: 3 },
      { scene: 'The new album has 21 songs.', noun: 'songs', ask: '{Frac} of them are dance tracks. How many dance tracks?', unit: 'songs', total: 21, groups: 3, take: 2 },
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
      { id: 'read', title: 'The Lost Map', subject: 'Maths', skill: 'Fractions of amounts', steps: 6, done: 2, playable: true },
      { id: 'inference', title: 'Detective Clues', subject: 'English', skill: 'Inference', steps: 4, done: 0 },
    ],
    problems: [
      { scene: 'The Lost Map is a book with 32 pages.', noun: 'pages', ask: 'You have read {frac} of it. How many pages is that?', unit: 'pages', total: 32, groups: 4, take: 3 },
      { scene: 'The forest library has 12 new books.', noun: 'books', ask: '{Frac} of them are adventure stories. How many adventure stories?', unit: 'books', total: 12, groups: 3, take: 2 },
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
    quests: [
      { id: 'build', title: 'Dream Bedroom', subject: 'Maths', skill: 'Fractions of amounts', steps: 6, done: 2, playable: true },
      { id: 'measure', title: 'Measure the Room', subject: 'Maths', skill: 'Area and perimeter', steps: 6, done: 0 },
    ],
    problems: [
      { scene: 'Your dream bedroom build uses 28 bricks.', noun: 'bricks', ask: '{Frac} of them are red. How many red bricks is that?', unit: 'bricks', total: 28, groups: 4, take: 3 },
      { scene: 'Brick City has 9 towers.', noun: 'towers', ask: '{Frac} of them are finished. How many towers are finished?', unit: 'towers', total: 9, groups: 3, take: 2 },
    ],
  },
  {
    id: 'space',
    name: 'Space Station',
    tagline: 'Rockets and planets',
    tint: ['#3E8EF0', '#1E2A78'],
    x: 286,
    y: 404,
    level: 1,
    stars: 1,
    quests: [
      { id: 'fuel', title: 'Fuel the Rocket', subject: 'Maths', skill: 'Fractions of amounts', steps: 6, done: 2, playable: true },
      { id: 'orbit', title: 'Orbit Timer', subject: 'Maths', skill: 'Decimals', steps: 5, done: 0 },
    ],
    problems: [
      { scene: 'The rocket carries 36 litres of fuel.', noun: 'litres', ask: 'It burns {frac} of the fuel at lift-off. How many litres is that?', unit: 'litres', total: 36, groups: 4, take: 3 },
      { scene: '30 astronauts are training for the mission.', noun: 'astronauts', ask: '{Frac} of them pass the space test. How many pass?', unit: 'astronauts', total: 30, groups: 3, take: 2 },
    ],
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
