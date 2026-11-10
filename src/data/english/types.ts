import type { Rng } from '../bank/rng'

export type Level = 1 | 2 | 3

/**
 * choice: tap one option (marked in code)
 * spell:  Nova reads the word aloud, the child types it (marked in code)
 * text:   a short typed answer with a list of accepted answers (marked in code; AI only if nothing matches)
 * open:   free writing or an explained answer (marked by AI against the rubric, via n8n)
 */
export type EnKind = 'choice' | 'spell' | 'text' | 'open'

/** Words that change per world. */
export interface EnCtx {
  world: string
  actor: string
  actor2: string
  he: string
  his: string
  him: string
  place: string
  crowd: string
  event: string
  team: string
  win: string
  move: string
  thing: string
  things: string
  speaker: string
}

/** What an item generator returns. */
export interface EnDraft {
  kind: EnKind
  prompt: string
  /** a short passage or sentence shown above the prompt */
  extract?: string
  options?: string[]
  /** choice: the correct option; spell: the word */
  answer?: string
  /** text: accepted answers */
  accept?: string[]
  /** text: punctuation and capital letters must match */
  exact?: boolean
  /** text: also correct if the answer contains any of these words (for retrieval answers) */
  keys?: string[]
  /** a wrong option or typed answer -> what Nova says */
  why?: Record<string, string>
  /** shown once the child gets it right (or after the last hint) */
  explain: string
  /** spell: what Nova reads aloud */
  say?: string
  /** open: what a good answer includes */
  rubric?: string
  /** open: an example answer, shown after marking */
  model?: string
}

export type Gen = (c: EnCtx, r: Rng) => EnDraft

export interface EnStatement {
  id: string
  year: 4 | 5 | 6
  domain: 'Spelling' | 'Grammar' | 'Punctuation' | 'Reading' | 'Writing'
  text: string
  /** three statement-level hints: nudge, method, walk-through */
  hints: [string, string, string]
  items: [Level, Gen][]
  /** split a long statement (word lists) into quests of this many items */
  chunk?: number
}

export interface EnItem extends EnDraft {
  id: string
  coreId: string
  curriculumId: string
  year: number
  level: Level
  world: string
  hints: [string, string, string]
}
