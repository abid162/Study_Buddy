import type { Rng } from '../bank/rng'
import type { EnCtx, EnDraft } from './types'
import { EN_WORLDS, shuffle } from './skins'

/** Multiple choice. Wrong options can carry a message: ['option', 'what Nova says']. */
export function choice(r: Rng, prompt: string, correct: string, wrong: (string | [string, string])[], explain: string, extract?: string): EnDraft {
  const why: Record<string, string> = {}
  const opts = [correct]
  for (const w of wrong) {
    const [t, m] = typeof w === 'string' ? [w, ''] : w
    opts.push(t)
    if (m) why[t] = m
  }
  return { kind: 'choice', prompt, extract, options: shuffle(r, opts), answer: correct, why, explain }
}

/** A short typed answer, marked in code against the accepted answers. */
export function typed(prompt: string, accept: string | string[], explain: string, o: { extract?: string; exact?: boolean; why?: Record<string, string>; keys?: string[] } = {}): EnDraft {
  return { kind: 'text', prompt, accept: Array.isArray(accept) ? accept : [accept], explain, ...o }
}

/** Free writing or an explained answer: marked by AI against the rubric. */
export function open(prompt: string, rubric: string, model: string, extract?: string): EnDraft {
  return { kind: 'open', prompt, rubric, model, extract, explain: `Here is one way to answer: “${model}”` }
}

/** Spelling: Nova reads the word, the sentence, then the word again (like the KS2 spelling test). */
export function spell(word: string, sentence: string): EnDraft {
  return {
    kind: 'spell',
    prompt: 'Listen to Nova, then type the missing word.',
    extract: sentence,
    answer: word,
    say: `${word}. ${sentence.replace('___', word)} ${word}.`,
    explain: `The word is “${word}”.`,
  }
}

/** Rotate through a pool so each world gets different rows, and items k = 0, 1, … differ inside a world. */
export function at<T>(c: EnCtx, pool: readonly T[], k: number): T {
  const w = Math.max(0, EN_WORLDS.indexOf(c.world))
  return pool[(w * 2 + k) % pool.length]!
}
