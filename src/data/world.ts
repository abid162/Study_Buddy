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
  /** may contain {hero}: the child's favourite player, or an invented star if they skipped */
  scene: string
  /** what is being counted, plural, e.g. "penalties" */
  noun: string
  /** the question verb phrase, e.g. "They score {frac} of them. How many goals is that?" */
  ask: string
  unit: string
  total: number
  groups: 2 | 3 | 4 | 5
  take: number
  /** which star from src/data/stars.ts (0 to 3) appears in this question */
  star?: number
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
  problems: ProblemSpec[]
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
      { id: 'penalties', title: 'Penalty Shootout', subject: 'Maths', skill: 'Fractions of amounts', steps: 8, done: 0, playable: true },
      { id: 'league', title: 'League Table Climb', subject: 'Maths', skill: 'Adding and subtracting', steps: 5, done: 5 },
      { id: 'report', title: 'Match Report', subject: 'English', skill: 'Writing in the past tense', steps: 4, done: 0 },
    ],
    problems: [
      { scene: '{star} takes 20 penalties in training.', noun: 'penalties', ask: '{He} scores {frac} of them. How many goals is that?', unit: 'goals', total: 20, groups: 4, take: 3, star: 0 },
      { scene: 'In the shootout, {star} faces 18 shots.', noun: 'shots', ask: '{He} saves {frac} of them. How many saves is that?', unit: 'saves', total: 18, groups: 3, take: 2, star: 1 },
      { scene: "{star}'s squad has 16 players.", noun: 'players', ask: '{Frac} of them are defenders. How many defenders are there?', unit: 'defenders', total: 16, groups: 2, take: 1, star: 2 },
      { scene: "25 fans queue for {star}'s autograph.", noun: 'fans', ask: '{Frac} of them get a signed shirt. How many signed shirts?', unit: 'shirts', total: 25, groups: 5, take: 2, star: 3 },
      { scene: '{star} plays 36 matches this season.', noun: 'matches', ask: '{Frac} of them are away games. How many away games?', unit: 'games', total: 36, groups: 4, take: 1, star: 0 },
      { scene: "{star}'s team kit room has 27 footballs.", noun: 'footballs', ask: '{Frac} of them are brand new. How many new footballs?', unit: 'footballs', total: 27, groups: 3, take: 1, star: 2 },
      { scene: '{star} gives 40 tickets to a school trip.', noun: 'tickets', ask: '{Frac} of them go to Year 5. How many tickets is that?', unit: 'tickets', total: 40, groups: 5, take: 3, star: 3 },
      { scene: '{star} sets out 32 cones for a training drill.', noun: 'cones', ask: '{Frac} of them are orange. How many orange cones?', unit: 'cones', total: 32, groups: 4, take: 3, star: 1 },
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
      { id: 'rounds', title: 'Title Belt Tour', subject: 'Maths', skill: 'Fractions of amounts', steps: 8, done: 0, playable: true },
      { id: 'promo', title: 'Entrance Speech', subject: 'English', skill: 'Persuasive language', steps: 4, done: 0 },
    ],
    problems: [
      { scene: '{star} fights 24 matches on the title tour.', noun: 'matches', ask: '{He} wins {frac} of them. How many wins is that?', unit: 'wins', total: 24, groups: 4, take: 3, star: 0 },
      { scene: "15 fans hold up signs for {star}'s big entrance.", noun: 'signs', ask: '{Frac} of the signs are gold. How many gold signs are there?', unit: 'signs', total: 15, groups: 3, take: 2, star: 1 },
      { scene: '{star} enters a battle royal with 14 wrestlers.', noun: 'wrestlers', ask: '{Frac} of them wear masks. How many wear masks?', unit: 'wrestlers', total: 14, groups: 2, take: 1, star: 2 },
      { scene: "{star}'s entrance uses 35 spotlights.", noun: 'spotlights', ask: '{Frac} of them shine red. How many red spotlights?', unit: 'spotlights', total: 35, groups: 5, take: 2, star: 1 },
      { scene: '28 fans win ringside seats to see {star}.', noun: 'fans', ask: '{Frac} of them bring a homemade belt. How many fans is that?', unit: 'fans', total: 28, groups: 4, take: 1, star: 3 },
      { scene: "{star}'s world tour visits 21 cities.", noun: 'cities', ask: '{Frac} of them are by the sea. How many seaside cities?', unit: 'cities', total: 21, groups: 3, take: 1, star: 0 },
      { scene: '30 belts hang in the hall of fame.', noun: 'belts', ask: '{star} has won {frac} of them. How many belts has {he} won?', unit: 'belts', total: 30, groups: 5, take: 3, star: 2 },
      { scene: "{star}'s big show lasts 40 minutes.", noun: 'minutes', ask: '{Frac} of it is the main event. How many minutes is that?', unit: 'minutes', total: 40, groups: 4, take: 3, star: 3 },
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
      { id: 'tickets', title: 'Sold-out Show', subject: 'Maths', skill: 'Fractions of amounts', steps: 8, done: 0, playable: true },
      { id: 'lyrics', title: 'Rhythm and Rhyme', subject: 'English', skill: 'Poetry and syllables', steps: 4, done: 0 },
    ],
    problems: [
      { scene: 'The band sells 40 tickets for a secret show.', noun: 'tickets', ask: '{Frac} of them are standing tickets. How many standing tickets?', unit: 'tickets', total: 40, groups: 4, take: 3 },
      { scene: 'The new album has 21 songs.', noun: 'songs', ask: '{Frac} of them are dance tracks. How many dance tracks?', unit: 'songs', total: 21, groups: 3, take: 2 },
      { scene: '12 instruments are set up on stage.', noun: 'instruments', ask: '{Frac} of them are guitars. How many guitars?', unit: 'guitars', total: 12, groups: 2, take: 1 },
      { scene: '25 dancers appear in the music video.', noun: 'dancers', ask: '{Frac} of them wear silver. How many dancers wear silver?', unit: 'dancers', total: 25, groups: 5, take: 2 },
      { scene: 'The world tour has 32 shows.', noun: 'shows', ask: '{Frac} of them are in London. How many London shows?', unit: 'shows', total: 32, groups: 4, take: 1 },
      { scene: 'The fan club sends 18 letters.', noun: 'letters', ask: '{Frac} of them have drawings. How many letters have drawings?', unit: 'letters', total: 18, groups: 3, take: 1 },
      { scene: '35 songs are planned for the concert.', noun: 'songs', ask: '{Frac} of them are brand new. How many new songs?', unit: 'songs', total: 35, groups: 5, take: 3 },
      { scene: 'The light show uses 36 lasers.', noun: 'lasers', ask: '{Frac} of them are purple. How many purple lasers?', unit: 'lasers', total: 36, groups: 4, take: 3 },
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
      { id: 'read', title: 'The Lost Map', subject: 'Maths', skill: 'Fractions of amounts', steps: 8, done: 0, playable: true },
      { id: 'inference', title: 'Detective Clues', subject: 'English', skill: 'Inference', steps: 4, done: 0 },
    ],
    problems: [
      { scene: 'The Lost Map is a book with 32 pages.', noun: 'pages', ask: 'You have read {frac} of it. How many pages is that?', unit: 'pages', total: 32, groups: 4, take: 3 },
      { scene: 'The forest library has 12 new books.', noun: 'books', ask: '{Frac} of them are adventure stories. How many adventure stories?', unit: 'books', total: 12, groups: 3, take: 2 },
      { scene: 'The story has 10 chapters.', noun: 'chapters', ask: '{Frac} of them happen at night. How many night-time chapters?', unit: 'chapters', total: 10, groups: 2, take: 1 },
      { scene: '20 clues are hidden in the forest.', noun: 'clues', ask: '{Frac} of them are under rocks. How many clues are under rocks?', unit: 'clues', total: 20, groups: 5, take: 2 },
      { scene: 'The old map shows 24 paths.', noun: 'paths', ask: '{Frac} of them lead to the river. How many paths is that?', unit: 'paths', total: 24, groups: 4, take: 1 },
      { scene: 'A wise owl collects 27 acorns.', noun: 'acorns', ask: '{Frac} of them are golden. How many golden acorns?', unit: 'acorns', total: 27, groups: 3, take: 1 },
      { scene: 'Your class reads 30 poems.', noun: 'poems', ask: '{Frac} of them rhyme. How many rhyming poems?', unit: 'poems', total: 30, groups: 5, take: 3 },
      { scene: 'The library lends out 40 books.', noun: 'books', ask: '{Frac} of them come back on time. How many books is that?', unit: 'books', total: 40, groups: 4, take: 3 },
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
      { id: 'build', title: 'Dream Bedroom', subject: 'Maths', skill: 'Fractions of amounts', steps: 8, done: 0, playable: true },
      { id: 'measure', title: 'Measure the Room', subject: 'Maths', skill: 'Area and perimeter', steps: 6, done: 0 },
    ],
    problems: [
      { scene: 'Your dream bedroom build uses 28 bricks.', noun: 'bricks', ask: '{Frac} of them are red. How many red bricks is that?', unit: 'bricks', total: 28, groups: 4, take: 3 },
      { scene: 'Brick City has 9 towers.', noun: 'towers', ask: '{Frac} of them are finished. How many towers are finished?', unit: 'towers', total: 9, groups: 3, take: 2 },
      { scene: 'A garden wall uses 18 bricks.', noun: 'bricks', ask: '{Frac} of them are blue. How many blue bricks?', unit: 'bricks', total: 18, groups: 2, take: 1 },
      { scene: 'The castle set has 30 windows.', noun: 'windows', ask: '{Frac} of them are round. How many round windows?', unit: 'windows', total: 30, groups: 5, take: 2 },
      { scene: 'You build a house with 16 rooms.', noun: 'rooms', ask: '{Frac} of them have a door already. How many rooms is that?', unit: 'rooms', total: 16, groups: 4, take: 1 },
      { scene: 'Brick City has 24 houses.', noun: 'houses', ask: '{Frac} of them have gardens. How many houses have gardens?', unit: 'houses', total: 24, groups: 3, take: 1 },
      { scene: 'The prop box has 25 hats.', noun: 'hats', ask: '{Frac} of them are helmets. How many helmets?', unit: 'helmets', total: 25, groups: 5, take: 3 },
      { scene: 'A bridge build uses 36 bricks.', noun: 'bricks', ask: '{Frac} of them are grey. How many grey bricks?', unit: 'bricks', total: 36, groups: 4, take: 3 },
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
      { id: 'fuel', title: 'Fuel the Rocket', subject: 'Maths', skill: 'Fractions of amounts', steps: 8, done: 0, playable: true },
      { id: 'orbit', title: 'Orbit Timer', subject: 'Maths', skill: 'Decimals', steps: 5, done: 0 },
    ],
    problems: [
      { scene: 'The rocket carries 36 litres of fuel.', noun: 'litres', ask: 'It burns {frac} of the fuel at lift-off. How many litres is that?', unit: 'litres', total: 36, groups: 4, take: 3 },
      { scene: '30 astronauts are training for the mission.', noun: 'astronauts', ask: '{Frac} of them pass the space test. How many pass?', unit: 'astronauts', total: 30, groups: 3, take: 2 },
      { scene: 'The space station has 16 windows.', noun: 'windows', ask: '{Frac} of them face Earth. How many windows face Earth?', unit: 'windows', total: 16, groups: 2, take: 1 },
      { scene: 'A comet has 20 icy chunks.', noun: 'chunks', ask: '{Frac} of them melt near the Sun. How many chunks melt?', unit: 'chunks', total: 20, groups: 5, take: 2 },
      { scene: 'The Moon mission lasts 28 days.', noun: 'days', ask: '{Frac} of them are spent on the Moon. How many days is that?', unit: 'days', total: 28, groups: 4, take: 1 },
      { scene: 'A rover collects 15 rocks.', noun: 'rocks', ask: '{Frac} of them sparkle. How many sparkly rocks?', unit: 'rocks', total: 15, groups: 3, take: 1 },
      { scene: 'The telescope spots 40 stars.', noun: 'stars', ask: '{Frac} of them are red giants. How many red giants?', unit: 'stars', total: 40, groups: 5, take: 3 },
      { scene: 'The space lab grows 24 plants.', noun: 'plants', ask: '{Frac} of them have flowers. How many plants have flowers?', unit: 'plants', total: 24, groups: 4, take: 3 },
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
