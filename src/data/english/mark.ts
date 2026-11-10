import type { EnItem } from './types'

/** Lower case, straight quotes, single spaces, no trailing full stop. Used for loose matching. */
export const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!]$/, '')
    .trim()

/** Strict compare: only quotes and spacing are tidied (capitals and punctuation must match). */
const strict = (s: string) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim()

function distance(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)] as number[])
  for (let j = 1; j <= b.length; j++) d[0]![j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i]![j] = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length]![b.length]!
}

export interface EnResult {
  correct: boolean
  message?: string
  /** nothing matched, but the answer might still be right: ask the AI marker */
  askAI?: boolean
}

/** Mark in code. Open answers always go to the AI marker. */
export function checkEn(q: EnItem, answer: string): EnResult {
  const a = answer.trim()
  if (!a) return { correct: false }
  if (q.kind === 'choice') return a === q.answer ? { correct: true } : { correct: false, message: q.why?.[a] }
  if (q.kind === 'spell') {
    const want = (q.answer ?? '').toLowerCase()
    const got = a.toLowerCase()
    if (got === want) return { correct: true }
    const dist = distance(got, want)
    if (dist === 1) return { correct: false, message: 'So close! Just one letter is different. Listen again and check each part.' }
    if (got.length && want.startsWith(got.slice(0, 3)) && dist <= 3) return { correct: false, message: 'Good start! Check the middle and the end of the word.' }
    return { correct: false, message: 'Not quite. Tap the speaker to hear it again and split it into syllables.' }
  }
  if (q.kind === 'text') {
    const acc = q.accept ?? []
    if (q.exact ? acc.some((x) => strict(x) === strict(a)) : acc.some((x) => norm(x) === norm(a))) return { correct: true }
    if (!q.exact && q.keys?.some((k) => norm(a).includes(norm(k)))) return { correct: true }
    if (q.exact && acc.some((x) => norm(x) === norm(a))) return { correct: false, message: 'Your words are right. Now check the capital letters and punctuation carefully.' }
    if (q.why?.[a]) return { correct: false, message: q.why[a] }
    return { correct: false, askAI: !q.exact }
  }
  return { correct: false, askAI: true }
}
