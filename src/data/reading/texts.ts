import { PASSAGES } from '../english/reading'
import { POEMS, INFO_TEXTS } from '../english/texts'
import { leadOf } from '../english/skins'
import type { IslandId } from '../world'

/**
 * What the child can read aloud: every world's story, poem and fact file (the same original texts the English quests use).
 * Each text is split into short parts, read one at a time with push-to-talk.
 */

export type ReadingKind = 'story' | 'poem' | 'facts'

export interface ReadingText {
  id: string
  world: IslandId
  kind: ReadingKind
  title: string
  parts: string[]
  words: number
}

export const KIND_LABEL: Record<ReadingKind, string> = { story: 'Story', poem: 'Poem', facts: 'Fact file' }

const MAX = 80
const MIN = 12
const count = (s: string) => s.split(/\s+/).filter(Boolean).length

/** split a long paragraph at sentence ends so each part is a comfortable read */
function splitLong(p: string): string[] {
  if (count(p) <= MAX) return [p]
  const sentences = p.match(/[^.!?]+[.!?]+[”"’]?\s*/g) ?? [p]
  const out: string[] = []
  let cur = ''
  for (const s of sentences) {
    if (cur && count(cur + s) > MAX * 0.75) {
      out.push(cur.trim())
      cur = ''
    }
    cur += s
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

/** join very short pieces onto the next one */
function mergeShort(ps: string[], joiner: string): string[] {
  const out: string[] = []
  for (const p of ps) {
    const prev = out[out.length - 1]
    if (prev !== undefined && count(prev) < MIN && count(prev + p) <= MAX) out[out.length - 1] = prev + joiner + p
    else out.push(p)
  }
  return out
}

function storyParts(text: string): string[] {
  return mergeShort(text.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean).flatMap(splitLong), ' ')
}

function poemParts(text: string): string[] {
  const stanzas = text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean)
  const out: string[] = []
  for (const s of stanzas) {
    const lines = s.split('\n')
    if (lines.length <= 6) out.push(s)
    else for (let i = 0; i < lines.length; i += 4) out.push(lines.slice(i, i + 4).join('\n'))
  }
  return mergeShort(out, '\n\n')
}

function factParts(text: string): string[] {
  return mergeShort(text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean).flatMap((s) => (count(s) > MAX ? splitLong(s.replace(/\n/g, ' ')) : [s])), '\n\n')
}

const make = (world: IslandId, kind: ReadingKind, title: string, parts: string[]): ReadingText => ({ id: `${world}:${kind}`, world, kind, title, parts, words: parts.reduce((n, p) => n + count(p), 0) })

const WORLD_ORDER: IslandId[] = ['football', 'wrestling', 'music', 'story', 'bricks', 'space']

export const READING_TEXTS: ReadingText[] = WORLD_ORDER.flatMap((w) => {
  const story = PASSAGES.find((p) => p.world === w)
  const poem = POEMS.find((p) => p.world === w)
  const info = INFO_TEXTS.find((p) => p.world === w)
  return [
    story && make(w, 'story', story.title, storyParts(story.text(leadOf(w)))),
    poem && make(w, 'poem', poem.title, poemParts(poem.text)),
    info && make(w, 'facts', info.title, factParts(info.text)),
  ].filter(Boolean) as ReadingText[]
})

export const readingTextById = (id: string) => READING_TEXTS.find((t) => t.id === id)

/** the child's worlds first, stories before poems before fact files */
export function textsFor(worlds: IslandId[]): ReadingText[] {
  const rank = (t: ReadingText) => (worlds.includes(t.world) ? worlds.indexOf(t.world) : 10 + WORLD_ORDER.indexOf(t.world))
  const kind = { story: 0, poem: 1, facts: 2 }
  return [...READING_TEXTS].sort((a, b) => rank(a) - rank(b) || kind[a.kind] - kind[b.kind])
}
