import type { IslandId } from './world'

/**
 * Each world wraps the same syllabus in its own story: a league season, a title run, a world tour…
 * Topics become matchweeks, cards, cities, chapters, districts or planets; quests become matches, bouts, songs…
 */

export interface Meter {
  /** big headline number or word, e.g. "2nd" or "Champion" */
  value: string
  /** what it means, e.g. "in the league" */
  label: string
  /** one supporting line */
  detail: string
}

export interface Journey {
  title: string
  /** one sentence explaining the journey to the child */
  pitch: string
  /** what a topic is called in this world */
  topic: (i: number, domain: string) => string
  /** what a quest is called */
  quest: string
  /** chip shown on each question card */
  leadIn: (n: number) => string
  /** shown when a question is right */
  cheer: string[]
  /** shown when a quest is complete */
  win: string
  meter: (done: number, total: number, answered: number) => Meter
}

const ord = (n: number) => `${n}${n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'}`
const CITIES = ['London', 'Seoul', 'Lagos', 'Rio', 'Tokyo', 'New York', 'Paris', 'Sydney', 'Mumbai', 'Toronto', 'Cairo', 'Berlin']
const DISTRICTS = ['Harbour', 'Market Square', 'Old Town', 'Riverside', 'Hilltop', 'Park Lane', 'Station Road', 'Tower Hill', 'Garden Row', 'The Docks', 'Castle End', 'Mill Street']
const PLANETS = ['The Moon', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Halley’s Comet', 'Alpha Centauri', 'Sirius', 'Vega', 'Polaris']

export const JOURNEYS: Record<IslandId, Journey> = {
  football: {
    title: 'Season',
    pitch: 'Every right answer wins your team 3 points. Score goals, top the charts and chase the Ballon d’Or.',
    topic: (i) => `Matchweek ${i + 1}`,
    quest: 'Match',
    leadIn: (n) => `${ord(Math.min(90, n * 7 + 3))} minute`,
    cheer: ['Goal!', 'What a strike!', 'Back of the net!', 'Top bins!'],
    win: 'Full time: match won! +3 points',
    meter: (done, total) => ({ value: `${done * 3}`, label: 'points', detail: `${done} of ${total} matches won` }),
  },
  wrestling: {
    title: 'Title run',
    pitch: 'Every right answer is a winning move. Climb from the opening match all the way to the world title.',
    topic: (i) => `Card ${i + 1}`,
    quest: 'Bout',
    leadIn: (n) => `Round ${n + 1}`,
    cheer: ['1-2-3!', 'Pinned it!', 'Huge move!', 'The crowd goes wild!'],
    win: 'Bout won! You climb the rankings',
    meter: (done, total) => {
      const rank = Math.max(1, 20 - Math.floor((done / Math.max(1, total)) * 19))
      return { value: done >= total ? 'Champion' : `#${rank}`, label: done >= total ? 'Thunder Belt holder' : 'contender ranking', detail: `${done} of ${total} bouts won` }
    },
  },
  music: {
    title: 'World tour',
    pitch: 'Every topic is a city on your tour, and every quest is a song in the setlist.',
    topic: (i) => CITIES[i % CITIES.length]!,
    quest: 'Song',
    leadIn: (n) => `Track ${n + 1}`,
    cheer: ['Encore!', 'Perfect note!', 'The crowd is singing along!', 'Sold out!'],
    win: 'Song complete! The fans want more',
    meter: (done, total) => ({ value: (done * 2500).toLocaleString('en-GB'), label: 'fans won', detail: `${done} of ${total} songs played` }),
  },
  story: {
    title: 'The Lost Map',
    pitch: 'Every topic is a chapter, and every quest you finish finds a piece of the lost map.',
    topic: (i) => `Chapter ${i + 1}`,
    quest: 'Page',
    leadIn: (n) => `Page ${n + 1}`,
    cheer: ['Clue found!', 'The path opens up!', 'The owl nods wisely.', 'Brilliant detective work!'],
    win: 'A new piece of the map!',
    meter: (done, total) => ({ value: `${done}/${total}`, label: 'map pieces found', detail: done >= total ? 'The map is complete!' : 'Keep exploring the forest' }),
  },
  bricks: {
    title: 'City build',
    pitch: 'Every topic is a district of Brick City, and every quest builds a new building.',
    topic: (i) => DISTRICTS[i % DISTRICTS.length]!,
    quest: 'Building',
    leadIn: (n) => `Floor ${n + 1}`,
    cheer: ['Click! Brick placed.', 'Solid build!', 'Another floor up!', 'Rock steady!'],
    win: 'Building complete!',
    meter: (done, total, answered) => ({ value: answered.toLocaleString('en-GB'), label: 'floors built', detail: `${done} of ${total} buildings finished` }),
  },
  space: {
    title: 'Mission to the stars',
    pitch: 'Every topic is a planet to reach, and every quest charges a fuel cell.',
    topic: (i) => PLANETS[i % PLANETS.length]!,
    quest: 'Fuel cell',
    leadIn: (n) => `T-minus ${Math.max(1, 12 - n)}`,
    cheer: ['Lift-off!', 'Systems go!', 'Fuel cell charging!', 'Stellar work!'],
    win: 'Fuel cell fully charged!',
    meter: (done, total) => ({ value: `${(done * 380).toLocaleString('en-GB')} km`, label: 'travelled', detail: `${done} of ${total} fuel cells charged` }),
  },
}
