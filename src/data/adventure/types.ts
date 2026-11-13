import { makeRng, type Rng } from '../bank/rng'
import { mathsOptions } from '../bank/options'

/**
 * Adventures: a whole session is one story (a concert night, a match day). Each beat is a moment in the story with a
 * question whose maths has a real purpose there. Every beat has several skills (different ways to practise), one is
 * picked per session, and the numbers change every time. Answers are always worked out in code.
 */

export type Year = 4 | 5 | 6

/** How the question asks: variety beyond new names and numbers. */
export type Format = 'work-out' | 'compare' | 'spot-mistake' | 'estimate' | 'missing' | 'best-plan' | 'convert'

export const FORMAT_LABEL: Record<Format, string> = {
  'work-out': 'Work it out',
  compare: 'Compare',
  'spot-mistake': 'Spot the mistake',
  estimate: 'Estimate',
  missing: 'Find the missing number',
  'best-plan': 'Choose the best plan',
  convert: 'Convert it',
}

/** The child's choices for this story, plus their name. */
export interface StoryChoices {
  name: string
  [key: string]: string
}

export interface AdvQuestion {
  format: Format
  curriculumId: string
  /** the question, in the story */
  text: string
  /** tap answers, in the order shown */
  options: string[]
  right: string
  /** Nova's message for a specific wrong answer */
  why: Record<string, string>
  /** 1: a nudge, 2: a different way to see it, 3: a worked example with these numbers */
  hints: [string, string, string]
  /** said after the answer (right or shown) */
  explain: string
}

export interface Skill {
  id: string
  years: Year[]
  make: (r: Rng, year: Year, c: StoryChoices) => AdvQuestion
}

export interface Beat {
  id: string
  /** short scene name shown on the story strip */
  scene: string
  /** what happens before the question */
  intro: (c: StoryChoices) => string
  skills: Skill[]
  /** what happens when the child gets it right first time / after help */
  win: (c: StoryChoices) => string
  /** what happens when the answer had to be shown */
  slip: (c: StoryChoices) => string
  /** football: this beat is part of the match, so it decides a goal for one side */
  match?: boolean
}

export type Outcome = 'first_try' | 'helped' | 'shown'
export interface BeatResult {
  beat: string
  outcome: Outcome
}

export interface ChoiceDef {
  key: string
  question: (c: StoryChoices) => string
  options: (c: StoryChoices) => { value: string; note?: string; unlockAt?: number }[]
}

export interface Episode {
  world: 'music' | 'football'
  id: string
  title: string
  /** what the child is building up in this story: fans, goals, … */
  meter: { label: string; icon: string }
  choices: ChoiceDef[]
  opening: (c: StoryChoices, memory: string | null) => string
  beats: Beat[]
  /** how the story ends depends on how the child did */
  ending: (c: StoryChoices, results: BeatResult[]) => { title: string; text: string; won: boolean }
  /** the live meter, from the results so far */
  meterValue: (results: BeatResult[], beats: Beat[]) => string
}

/* ---------------- helpers for writing skills ---------------- */

export const int = (r: Rng, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1))
export const pickOne = <T,>(r: Rng, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)]!
export const fmt = (n: number) => n.toLocaleString('en-GB', { maximumFractionDigits: 3 }).replace('-', '−')
export const money = (n: number) => `£${Number.isInteger(n) ? n.toLocaleString('en-GB') : n.toFixed(2)}`
export const mmss = (sec: number) => `${Math.floor(sec / 60)} min ${String(sec % 60).padStart(2, '0')} s`
export const clock = (mins: number) => {
  const m = ((mins % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/**
 * A number question with tap answers. Wrong options are the listed mistakes first, then near misses.
 * `unit` formats the labels (money, a time, a plain number).
 */
export function numberQ(
  base: Omit<AdvQuestion, 'options' | 'right' | 'why'>,
  answer: number,
  mistakes: { value: number; why: string }[],
  seed: string,
  label: (n: number) => string = fmt,
): AdvQuestion {
  const m: Record<string, string> = {}
  for (const x of mistakes) if (Math.abs(x.value - answer) > 1e-9 && (answer < 0 || x.value >= 0)) m[String(Math.round(x.value * 1000) / 1000)] = x.why
  const opts = mathsOptions({ id: seed, text: base.text.includes('£') && label === money ? base.text : base.text.replace(/£/g, ''), answer, mistakes: m })
  const why: Record<string, string> = {}
  const options = opts.map((o) => {
    const l = label(Number(o.value))
    if (m[o.value]) why[l] = m[o.value]!
    return l
  })
  return { ...base, options, right: label(answer), why }
}

/** A question whose answers are words or labels; `wrong` maps each wrong option to Nova's reason. */
export function wordQ(base: Omit<AdvQuestion, 'options' | 'right' | 'why'>, right: string, wrong: Record<string, string>, r: Rng): AdvQuestion {
  const options = [right, ...Object.keys(wrong)].filter((v, i, a) => a.indexOf(v) === i)
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[options[i], options[j]] = [options[j]!, options[i]!]
  }
  return { ...base, options, right, why: wrong }
}

export const sessionRng = (seed: string) => makeRng(seed)
