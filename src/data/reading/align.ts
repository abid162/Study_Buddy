/**
 * Reading coach: line up what the speech engine heard against the text the child was asked to read.
 *
 * This file has no imports on purpose: scripts/build-n8n.ts bundles it into the n8n "Reading Coach" workflow,
 * so the app, the tests (scripts/reading-check.ts) and n8n all use exactly the same rules.
 *
 * Built to be kind (the brief says: no high-stakes judgements from speech recognition):
 * - accents: words are compared after "accent folding" (fink = think, goin = going, 'ouse = house, bruvver = brother)
 *   and a spelling-distance check, so a regional accent is never a mistake;
 * - small words (the, a, and…) and names/numbers are never flagged, because speech engines often drop them too;
 * - only a clearly skipped word, or a clearly different word, becomes a "try again" word;
 * - if the child stops early, the words they didn't reach are not counted as mistakes.
 */

export type WordStatus = 'read' | 'close' | 'skipped' | 'swapped' | 'unreached'

export interface HeardWord {
  word: string
  start?: number
  end?: number
}

export interface WordResult {
  /** the word as printed in the text, with its punctuation */
  text: string
  status: WordStatus
  /** what the engine heard instead (swapped) or as a match (read/close) */
  heard?: string
  start?: number
  end?: number
  /** small word, name or number: never counted against the child */
  minor?: boolean
}

export interface ReadingResult {
  /** 'too_little': not enough speech to say anything useful */
  heard: 'ok' | 'too_little'
  words: WordResult[]
  /** words that counted (not minor, reached) */
  total: number
  /** of those, read clearly */
  correct: number
  /** 0 to 1 */
  accuracy: number
  /** the child stopped before the end of the part */
  stoppedEarly: boolean
  /** up to five words to practise, as printed (no punctuation) */
  practice: { word: string; heard?: string }[]
}

export function alignReading(text: string, heardIn: HeardWord[]): ReadingResult {
  const SMALL = new Set(['a', 'an', 'the', 'and', 'of', 'to', 'in', 'on', 'at', 'is', 'it', 'as', 'by', 'for', 'or', 'so', 'but', 'be', 'was', 'he', 'she', 'his', 'her', 'i', 'we', 'up', 'with', 'that', 'this', 'its', 'are', 'from'])
  const FILLERS = new Set(['um', 'umm', 'er', 'erm', 'uh', 'uhh', 'ah', 'eh', 'hmm', 'mm', 'mmm', 'oh'])
  const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

  function numberWords(n: number): string {
    if (n < 20) return ONES[n]!
    if (n < 100) return TENS[Math.floor(n / 10)]! + (n % 10 ? ONES[n % 10]! : '')
    if (n < 1000) return ONES[Math.floor(n / 100)]! + 'hundred' + (n % 100 ? 'and' + numberWords(n % 100) : '')
    if (n < 10000) return numberWords(Math.floor(n / 1000)) + 'thousand' + (n % 1000 ? (n % 1000 < 100 ? 'and' : '') + numberWords(n % 1000) : '')
    return String(n)
  }

  /** lower case, letters and digits only; whole numbers become words so "40" = "forty" */
  function norm(w: string): string {
    const s = w
      .toLowerCase()
      .replace(/[’‘`]/g, "'")
      .replace(/[^a-z0-9']/g, '')
      .replace(/'/g, '')
    if (/^\d{1,4}$/.test(s)) return numberWords(Number(s))
    // British and American spellings count as the same word (the engine may write either)
    return s.replace(/our(s?)$/, 'or$1').replace(/([^aeiou])re(s?)$/, '$1er$2').replace(/is(e|es|ed|ing)$/, 'iz$1').replace(/ogue$/, 'og').replace(/^grey/, 'gray')
  }

  /** accent folding: both sides go through the same rules, so regional pronunciations line up */
  function fold(w: string): string {
    let s = w
    if (s.length > 4) s = s.replace(/ing$/, 'in')
    s = s
      .replace(/^h(?=[aeiou])/, '')
      .replace(/wh/g, 'w')
      .replace(/ph/g, 'f')
      .replace(/th/g, 'f')
      .replace(/v/g, 'f')
      .replace(/ck/g, 'k')
      .replace(/c(?=[eiy])/g, 's')
      .replace(/c/g, 'k')
      .replace(/q/g, 'k')
      .replace(/z/g, 's')
      .replace(/x/g, 'ks')
      .replace(/(?<=[a-z])[aeiou]+r$/, 'a')
      .replace(/r$/, '')
      .replace(/(.)\1+/g, '$1')
    return s
  }

  function lev(a: string, b: string): number {
    if (a === b) return 0
    if (!a.length) return b.length
    if (!b.length) return a.length
    let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
    for (let i = 1; i <= a.length; i++) {
      const cur = [i]
      for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = cur
    }
    return prev[b.length]!
  }

  /** 1 = same word, 0 = nothing alike */
  function sim(a: string, b: string): number {
    if (!a || !b) return 0
    if (a === b) return 1
    const fa = fold(a)
    const fb = fold(b)
    if (fa === fb) return 0.95
    const d = Math.min(lev(a, b) / Math.max(a.length, b.length), lev(fa, fb) / Math.max(fa.length, fb.length, 1))
    return Math.max(0, 1 - d)
  }

  /** a word counts as read if it is this alike (a little looser for long words) */
  const enough = (a: string, s: number) => s >= (a.length >= 7 ? 0.62 : a.length >= 4 ? 0.68 : 0.99)

  // ---- the text: one token per printed word ----
  const raw = text
    .replace(/[•·]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => /[A-Za-z0-9]/.test(t))
  const sentenceStart = (i: number) => i === 0 || /[.!?:”"]$/.test(raw[i - 1]!)
  const expected = raw.map((t, i) => {
    const n = norm(t)
    const letters = t.replace(/[^A-Za-z]/g, '')
    const isName = /^[A-Z][a-z]/.test(letters) && !sentenceStart(i)
    const isNumber = /\d/.test(t)
    return { text: t, n, minor: SMALL.has(n) || isName || isNumber || n.length === 0 }
  })

  // ---- what was heard, without ums and errs ----
  const heard = heardIn
    .flatMap((h) =>
      String(h.word || '')
        .split(/[\s-]+/)
        .filter(Boolean)
        .map((w) => ({ n: norm(w), word: w.replace(/[^A-Za-z0-9'’-]/g, ''), start: h.start, end: h.end })),
    )
    .filter((h) => h.n && !FILLERS.has(h.n))

  const n = expected.length
  const m = heard.length
  const words: WordResult[] = expected.map((e) => ({ text: e.text, status: 'skipped', minor: e.minor || undefined }))

  const meaningful = expected.filter((e) => !e.minor).length || n
  if (m < Math.max(2, Math.ceil(meaningful * 0.25))) {
    return { heard: 'too_little', words: expected.map((e) => ({ text: e.text, status: 'unreached', minor: e.minor || undefined })), total: 0, correct: 0, accuracy: 0, stoppedEarly: false, practice: [] }
  }

  // ---- alignment (edit distance with a "two heard words = one printed word" move, for "one all" vs "one-all") ----
  const SKIP = 1
  const EXTRA = 0.55
  const SWAP = 1.15
  const INF = 1e9
  const cost: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(INF))
  const move: string[][] = Array.from({ length: n + 1 }, () => new Array<string>(m + 1).fill(''))
  cost[0]![0] = 0
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= m; j++) {
      const c = cost[i]![j]!
      if (c >= INF) continue
      const relax = (a: number, b: number, v: number, how: string) => {
        if (v < cost[a]![b]!) {
          cost[a]![b] = v
          move[a]![b] = how
        }
      }
      if (i < n) relax(i + 1, j, c + (expected[i]!.minor ? SKIP * 0.6 : SKIP), 'skip')
      if (j < m) relax(i, j + 1, c + EXTRA, 'extra')
      if (i < n && j < m) {
        const s = sim(expected[i]!.n, heard[j]!.n)
        relax(i + 1, j + 1, c + (enough(expected[i]!.n, s) ? (1 - s) * 0.4 : SWAP), 'pair')
        if (j + 1 < m) {
          const s2 = sim(expected[i]!.n, heard[j]!.n + heard[j + 1]!.n)
          if (enough(expected[i]!.n, s2)) relax(i + 1, j + 2, c + (1 - s2) * 0.4 + 0.1, 'pair2')
        }
      }
    }
  }

  let i = n
  let j = m
  while (i > 0 || j > 0) {
    const how = move[i]![j]
    if (how === 'skip') {
      i--
    } else if (how === 'extra') {
      j--
    } else if (how === 'pair' || how === 'pair2') {
      const k = how === 'pair2' ? 2 : 1
      const h = heard.slice(j - k, j)
      const said = h.map((x) => x.n).join('')
      const s = sim(expected[i - 1]!.n, said)
      const w = words[i - 1]!
      w.heard = h.map((x) => x.word).join(' ')
      w.start = h[0]!.start
      w.end = h[h.length - 1]!.end
      w.status = s === 1 || (s >= 0.95 && expected[i - 1]!.n === said) ? 'read' : enough(expected[i - 1]!.n, s) ? 'close' : 'swapped'
      i--
      j -= k
    } else break
  }

  // ---- stopped early: a run of skipped words at the end was simply not reached ----
  let last = -1
  words.forEach((w, k) => {
    if (!w.minor && (w.status === 'read' || w.status === 'close' || w.status === 'swapped')) last = k
  })
  const trailing = words.slice(last + 1).filter((w) => !w.minor).length
  const stoppedEarly = trailing >= 3
  if (stoppedEarly) for (let k = last + 1; k < n; k++) words[k]!.status = 'unreached'

  // names, numbers and small words are never marked as mistakes
  for (const w of words) if (w.minor && (w.status === 'swapped' || w.status === 'skipped')) w.status = 'read'

  const counted = words.filter((w) => !w.minor && w.status !== 'unreached')
  const correct = counted.filter((w) => w.status === 'read' || w.status === 'close').length
  const seen = new Set<string>()
  const practice: { word: string; heard?: string }[] = []
  for (const w of words) {
    if (w.minor || (w.status !== 'skipped' && w.status !== 'swapped')) continue
    const clean = w.text.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, '')
    const key = clean.toLowerCase()
    if (!clean || seen.has(key)) continue
    seen.add(key)
    practice.push(w.status === 'swapped' && w.heard ? { word: clean, heard: w.heard } : { word: clean })
    if (practice.length === 5) break
  }

  return {
    heard: 'ok',
    words: words.map((w) => (w.minor ? w : { ...w, minor: undefined })),
    total: counted.length,
    correct,
    accuracy: counted.length ? correct / counted.length : 1,
    stoppedEarly,
    practice,
  }
}

/** Nova's words after a part: one line of praise and one small next step. Never a score or a judgement. */
export function readingFeedback(r: ReadingResult): { praise: string; tip: string } {
  if (r.heard === 'too_little')
    return { praise: 'I couldn’t hear much that time.', tip: 'Hold the device a little closer and read in your normal voice. Tap the microphone when you’re ready.' }
  const pick = (xs: string[]) => xs[(r.total + r.correct) % xs.length]!
  const praise =
    r.accuracy >= 0.95
      ? pick(['Brilliant reading!', 'Wow, every word came through clearly!', 'Superstar reading!'])
      : r.accuracy >= 0.85
        ? pick(['Great reading!', 'Lovely clear reading!', 'Really good reading!'])
        : r.accuracy >= 0.7
          ? pick(['Good reading, you’re nearly there!', 'Nice work, keep going!'])
          : pick(['Good try! Let’s practise a few words together.', 'Well done for having a go!'])
  let tip: string
  if (r.stoppedEarly) tip = 'You stopped before the end of this part. Want to read the rest?'
  else if (r.practice.length === 1) tip = `Let’s practise “${r.practice[0]!.word}”. Tap it to hear how it sounds.`
  else if (r.practice.length > 1) tip = `Tap the yellow words to hear them, then try this part again if you like.`
  else tip = pick(['Next time, try reading it like a storyteller, with lots of expression.', 'Ready for the next part?'])
  return { praise, tip }
}
