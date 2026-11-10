import { STARS } from '../stars'
import { makeRng, pick, type Rng } from '../bank/rng'
import type { EnCtx } from './types'

interface Actor { name: string; pronoun: 'he' | 'she' }
interface EnSkin extends Omit<EnCtx, 'actor' | 'actor2' | 'he' | 'his' | 'him'> { actors: Actor[] }

/** Every world's names come from src/data/stars.ts, so renaming a star updates English too. */
const fromStars = (list: { name: string; pronoun: 'he' | 'she' }[]): Actor[] => list.map((s) => ({ name: s.name, pronoun: s.pronoun }))

export const EN_SKINS: EnSkin[] = [
  {
    world: 'football', actors: fromStars(STARS.football), place: 'the stadium', crowd: 'fans', event: 'the match', team: 'Stadium FC',
    win: 'scored the winning goal', move: 'raced down the wing', thing: 'football', things: 'boots', speaker: 'the coach',
  },
  {
    world: 'wrestling', actors: fromStars(STARS.wrestling), place: 'the arena', crowd: 'fans', event: 'the title match', team: 'the tag team',
    win: 'won the championship belt', move: 'leapt off the top rope', thing: 'belt', things: 'posters', speaker: 'the ring announcer',
  },
  {
    world: 'music', actors: fromStars(STARS.music),
    place: 'the stage', crowd: 'fans', event: 'the concert', team: 'the band', win: 'sang the final song', move: 'danced across the stage',
    thing: 'microphone', things: 'guitars', speaker: 'the singer',
  },
  {
    world: 'story', actors: fromStars(STARS.story),
    place: 'the forest', crowd: 'villagers', event: 'the quest', team: 'the explorers', win: 'found the hidden treasure', move: 'crept through the trees',
    thing: 'lantern', things: 'maps', speaker: 'the wise owl',
  },
  {
    world: 'bricks', actors: fromStars(STARS.bricks),
    place: 'Brick City', crowd: 'visitors', event: 'the big build', team: 'the builders', win: 'finished the tallest tower', move: 'stacked the bricks',
    thing: 'crane', things: 'bricks', speaker: 'the architect',
  },
  {
    world: 'space', actors: fromStars(STARS.space),
    place: 'the space station', crowd: 'visitors', event: 'the launch', team: 'the crew', win: 'landed on the Moon', move: 'floated through the airlock',
    thing: 'helmet', things: 'rockets', speaker: 'mission control',
  },
]

export const EN_WORLDS = EN_SKINS.map((s) => s.world)

/** Build the words for one item in one world. Same item id + world = same words every time. */
export function enCtx(world: string, seed: string): { c: EnCtx; r: Rng } {
  const skin = EN_SKINS.find((s) => s.world === world) ?? EN_SKINS[0]!
  const r = makeRng(`${seed}|${world}`)
  const a = pick(r, skin.actors)
  const others = skin.actors.filter((x) => x.name !== a.name)
  const b = pick(r, others)
  const she = a.pronoun === 'she'
  const { actors: _actors, ...words } = skin
  return { c: { ...words, actor: a.name, actor2: b.name, he: she ? 'she' : 'he', his: she ? 'her' : 'his', him: she ? 'her' : 'him' }, r }
}

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Shuffle a copy with the seeded random numbers. */
export function shuffle<T>(r: Rng, xs: readonly T[]): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

/** Pick n different items. */
export function pickN<T>(r: Rng, xs: readonly T[], n: number): T[] {
  return shuffle(r, xs).slice(0, n)
}

export interface Lead { name: string; he: string; his: string; him: string; He: string; His: string }
/** The main character of a world's reading passage (football and wrestling: star 1 from stars.ts). */
export function leadOf(world: string): Lead {
  const a = (EN_SKINS.find((s) => s.world === world) ?? EN_SKINS[0]!).actors[0]!
  const she = a.pronoun === 'she'
  return { name: a.name, he: she ? 'she' : 'he', his: she ? 'her' : 'his', him: she ? 'her' : 'him', He: she ? 'She' : 'He', His: she ? 'Her' : 'His' }
}
