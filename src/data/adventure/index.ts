import { makeRng } from '../bank/rng'
import { MUSIC } from './music'
import { FOOTBALL } from './football'
import type { AdvQuestion, BeatResult, Episode, StoryChoices, Year } from './types'

export * from './types'
export { MUSIC, FOOTBALL }

export const EPISODES: Partial<Record<string, Episode>> = { music: MUSIC, football: FOOTBALL }
export const hasAdventure = (world: string) => !!EPISODES[world]

/* ---------------- memory: what Nova remembers about this child's adventures ---------------- */

export interface AdventureMemory {
  plays: number
  wins: number
  /** the child's last choices, offered first next time */
  choices?: Record<string, string>
  last?: { title: string; at: string; tricky: { beat: string; skill: string; scene: string }[]; strong: string[] }
}

const memKey = (child: string, world: string) => `study-buddy-adventure:${child}:${world}`

export function readMemory(child: string, world: string): AdventureMemory {
  try {
    const raw = localStorage.getItem(memKey(child, world))
    if (raw) return JSON.parse(raw) as AdventureMemory
  } catch {
    /* fine */
  }
  return { plays: 0, wins: 0 }
}

export function writeMemory(child: string, world: string, m: AdventureMemory) {
  try {
    localStorage.setItem(memKey(child, world), JSON.stringify(m))
  } catch {
    /* fine: remembered for this visit only */
  }
}

/** What Nova says at the start, from memory. Natural, not a list of stats. */
export function memoryLine(ep: Episode, m: AdventureMemory, c: StoryChoices): string | null {
  if (!m.plays || !m.last) return null
  const back = ep.world === 'music' ? `Welcome back, ${c.stage ?? c.name}!` : `Welcome back, ${c.name}!`
  const lastTime = `Last time: ${m.last.title.replace(/!$/, '')}.`
  const tricky = m.last.tricky[0]
  if (tricky) return `${back} ${lastTime} The ${tricky.scene.toLowerCase()} was tricky, so you’ll get another go at it today.`
  if (m.last.strong.length) return `${back} ${lastTime} You were brilliant at the ${m.last.strong[0]!.toLowerCase()}. Let’s see if you can do it again!`
  return `${back} ${lastTime}`
}

/* ---------------- a session: one skill per beat, fresh numbers ---------------- */

/** What the learning record says, so the session can adapt. */
export interface Adapt {
  status: (cid: string) => 'new' | 'learning' | 'secure' | 'tricky' | undefined
  /** statements the homework scanner found tricky */
  weak: Set<string>
}

export interface SessionBeat {
  beatId: string
  skillId: string
  question: AdvQuestion
  /** -1 easier than their year, 0 their year, +1 a stretch */
  stretch: -1 | 0 | 1
}

export function buildSession(ep: Episode, year: Year, c: StoryChoices, memory: AdventureMemory, seed: string, adapt?: Adapt): SessionBeat[] {
  const r = makeRng(seed)
  const probe = makeRng(`probe|${seed}`)
  return ep.beats.map((b) => {
    const fit = b.skills.filter((s) => s.years.includes(year))
    const pool = fit.length ? fit : b.skills
    const cidOf = (s: (typeof pool)[number]) => s.make(probe, year, c).curriculumId
    // 1. homework found it tricky, or it's been tricky lately: practise it, one step easier
    const needs = adapt ? pool.find((s) => adapt.weak.has(cidOf(s)) || adapt.status(cidOf(s)) === 'tricky') : undefined
    // 2. tricky in the last adventure: it comes back with new numbers
    const again = memory.last?.tricky.find((t) => t.beat === b.id)
    const skill = needs ?? pool.find((s) => s.id === again?.skill) ?? pool[Math.floor(r() * pool.length)]!
    // 3. already secure: stretch it with next year's numbers
    const st = adapt?.status(cidOf(skill))
    const stretch: -1 | 0 | 1 = needs && year > 4 ? -1 : !needs && st === 'secure' && year < 6 ? 1 : 0
    return { beatId: b.id, skillId: skill.id, question: skill.make(r, (year + stretch) as Year, c), stretch }
  })
}

export function rememberSession(ep: Episode, prev: AdventureMemory, c: StoryChoices, session: SessionBeat[], results: BeatResult[], won: boolean, title: string): AdventureMemory {
  const scene = (id: string) => ep.beats.find((b) => b.id === id)?.scene ?? id
  const tricky = results
    .filter((r) => r.outcome !== 'first_try')
    .map((r) => ({ beat: r.beat, skill: session.find((s) => s.beatId === r.beat)?.skillId ?? '', scene: scene(r.beat) }))
  const strong = results.filter((r) => r.outcome === 'first_try').map((r) => scene(r.beat))
  const { name: _n, ...picked } = c
  return {
    plays: prev.plays + 1,
    wins: prev.wins + (won ? 1 : 0),
    choices: picked,
    last: { title, at: new Date().toISOString(), tricky, strong },
  }
}
