import { ALL_TEMPLATES, SKINS, withActors, render, seedsFor, type Question, type Level } from './bank'
import type { Template } from './bank/types'
import { MATHS_STATEMENTS } from './curriculum.maths'
import { ENGLISH_BY_YEAR, renderEn, type EnItem } from './english'
import { STARS } from './stars'
import type { IslandId } from './world'

/**
 * The whole syllabus for a year, laid out as topics and quests. Every world gets every quest;
 * only the wording (and, for maths, the numbers) changes from world to world.
 */

export type Subject = 'maths' | 'english'
export type Year = 4 | 5 | 6
export const WORLD_ORDER: IslandId[] = ['football', 'wrestling', 'music', 'story', 'bricks', 'space']

export interface QuestDef {
  id: string
  subject: Subject
  curriculumId: string
  domain: string
  title: string
  size: number
  playable: boolean
  note?: string
}
export interface Topic {
  domain: string
  quests: QuestDef[]
}

export type TutorQ = { kind: 'maths'; q: Question } | { kind: 'english'; q: EnItem }

/* ---------------- maths ---------------- */

const PER_LEVEL = 4
const templatesFor = (cid: string) => ALL_TEMPLATES.filter((t) => t.curriculumId === cid)
const levelsOf = (t: Template) => (t.levels ?? [1, 2, 3]) as Level[]
const mathsSize = (cid: string) => templatesFor(cid).reduce((a, t) => a + levelsOf(t).length * (t.fixed ? 1 : PER_LEVEL), 0)

const MATHS_NOTE: Record<string, string> = {
  DIAGRAM: 'Picture questions are being drawn. Coming soon.',
  INTERACTIVE: 'Draw-and-build questions. Coming soon.',
}

const DOMAIN_NAME: Record<string, string> = {
  'Number: place value': 'Place value',
  'Number: addition & subtraction': 'Adding and subtracting',
  'Multiplication & division': 'Multiplying and dividing',
  'Number: four operations': 'The four operations',
  'Fractions, decimals & percentages': 'Fractions, decimals and percentages',
  'Ratio & proportion': 'Ratio and proportion',
  'Geometry: properties of shapes': 'Shapes',
  'Geometry: position & direction': 'Position and direction',
}
export const domainName = (d: string) => DOMAIN_NAME[d] ?? d

function mathsTopics(year: Year): Topic[] {
  const topics: Topic[] = []
  for (const s of MATHS_STATEMENTS.filter((x) => x.year === year)) {
    const size = mathsSize(s.id)
    const q: QuestDef = { id: s.id, subject: 'maths', curriculumId: s.id, domain: s.domain, title: s.text, size, playable: size > 0, note: size > 0 ? undefined : MATHS_NOTE[s.tag] }
    const t = topics.find((x) => x.domain === s.domain)
    if (t) t.quests.push(q)
    else topics.push({ domain: s.domain, quests: [q] })
  }
  return topics
}

/** Every world's questions use its star cast from stars.ts. */
function skinFor(world: IslandId) {
  const base = SKINS.find((s) => s.id === world) ?? SKINS[0]!
  return withActors(base, (STARS[world] ?? []).map((s) => s.name))
}

const seedCache = new Map<string, number[]>()
/** Each world takes its own slice of seeds, so the numbers differ from world to world. */
function worldSeeds(t: Template, L: Level, world: IslandId): number[] {
  if (t.fixed) return [0]
  const key = `${t.id}|${L}`
  let all = seedCache.get(key)
  if (!all) {
    all = seedsFor(t, L, PER_LEVEL * WORLD_ORDER.length)
    seedCache.set(key, all)
  }
  const w = Math.max(0, WORLD_ORDER.indexOf(world))
  const out: number[] = []
  for (let i = 0; i < PER_LEVEL && all.length; i++) out.push(all[(w * PER_LEVEL + i) % all.length]!)
  return [...new Set(out)]
}

function mathsQuestions(cid: string, world: IslandId): TutorQ[] {
  const skin = skinFor(world)
  const out: TutorQ[] = []
  for (const L of [1, 2, 3] as Level[])
    for (const t of templatesFor(cid)) {
      if (!levelsOf(t).includes(L)) continue
      for (const s of worldSeeds(t, L, world)) {
        const q = render(t, L, s, skin)
        if (q) {
          const { alt: _alt, ...rest } = q
          out.push({ kind: 'maths', q: rest as Question })
        }
      }
    }
  return out
}

/* ---------------- english ---------------- */

const EN_DOMAIN: Record<string, string> = { Spelling: 'Spelling', Grammar: 'Grammar', Punctuation: 'Punctuation', Reading: 'Reading', Writing: 'Writing' }

function englishTopics(year: Year): Topic[] {
  const topics: Topic[] = []
  for (const st of ENGLISH_BY_YEAR[year]) {
    const parts = st.chunk ? Math.ceil(st.items.length / st.chunk) : 1
    for (let p = 0; p < parts; p++) {
      const size = st.chunk ? Math.min(st.chunk, st.items.length - p * st.chunk) : st.items.length
      const q: QuestDef = {
        id: parts > 1 ? `${st.id}#${p + 1}` : st.id,
        subject: 'english', curriculumId: st.id, domain: EN_DOMAIN[st.domain]!,
        title: parts > 1 ? `${st.text}: set ${p + 1} of ${parts}` : st.text, size, playable: true,
      }
      const t = topics.find((x) => x.domain === q.domain)
      if (t) t.quests.push(q)
      else topics.push({ domain: q.domain, quests: [q] })
    }
  }
  return topics
}

function englishQuestions(questId: string, year: Year, world: IslandId): TutorQ[] {
  const [sid, part] = questId.split('#')
  const st = ENGLISH_BY_YEAR[year].find((s) => s.id === sid)
  if (!st) return []
  const from = part && st.chunk ? (Number(part) - 1) * st.chunk : 0
  const to = part && st.chunk ? Math.min(st.items.length, from + st.chunk) : st.items.length
  const out: TutorQ[] = []
  for (let k = from; k < to; k++) out.push({ kind: 'english', q: renderEn(st, k, world) })
  return out
}

/* ---------------- public ---------------- */

const topicCache = new Map<string, Topic[]>()
export function syllabus(year: Year, subject: Subject): Topic[] {
  const key = `${year}|${subject}`
  let t = topicCache.get(key)
  if (!t) {
    t = subject === 'maths' ? mathsTopics(year) : englishTopics(year)
    topicCache.set(key, t)
  }
  return t
}

export const allQuests = (year: Year, subject: Subject) => syllabus(year, subject).flatMap((t) => t.quests)
export const findQuest = (year: Year, subject: Subject, id: string) => allQuests(year, subject).find((q) => q.id === id)

/** All questions for one quest in one world, in order (level 1 to 3). */
export function questQuestions(year: Year, subject: Subject, questId: string, world: IslandId): TutorQ[] {
  return subject === 'maths' ? mathsQuestions(questId, world) : englishQuestions(questId, year, world)
}

/** Look up a statement's text and subject from its curriculum id (used by the homework scanner). */
export function statementById(id: string): { subject: Subject; year: number; text: string; domain: string } | undefined {
  const m = MATHS_STATEMENTS.find((s) => s.id === id)
  if (m) return { subject: 'maths', year: m.year, text: m.text, domain: domainName(m.domain) }
  for (const y of [4, 5, 6] as const) {
    const e = ENGLISH_BY_YEAR[y].find((s) => s.id === id)
    if (e) return { subject: 'english', year: e.year, text: e.text, domain: e.domain }
  }
  return undefined
}
