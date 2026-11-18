/**
 * Checks the reading coach's word matching (src/data/reading/align.ts) and the reading texts.
 * Run: npx tsx scripts/reading-check.ts   (part of npm run verify)
 */
import { alignReading, readingFeedback, type HeardWord } from '../src/data/reading/align'
import { READING_TEXTS } from '../src/data/reading/texts'

let fails = 0
const ok = (cond: boolean, msg: string) => {
  if (!cond) {
    fails++
    console.error('✗ ' + msg)
  }
}
const said = (s: string): HeardWord[] => s.split(/\s+/).filter(Boolean).map((word, i) => ({ word, start: i * 0.4, end: i * 0.4 + 0.3 }))

const TEXT = 'The score was one-all and the cup final had gone to penalties. Above the stadium, grey clouds rolled in like a heavy blanket, but nobody in the crowd noticed the cold.'

// 1. perfect reading
{
  const r = alignReading(TEXT, said(TEXT))
  ok(r.heard === 'ok' && r.accuracy === 1 && r.practice.length === 0 && !r.stoppedEarly, `perfect reading should score 1 (got ${r.accuracy}, practice ${JSON.stringify(r.practice)})`)
}

// 2. engine formatting differences (hyphen split, case, punctuation) are not mistakes
{
  const r = alignReading(TEXT, said('the score was one all and the cup final had gone to penalties above the stadium grey clouds rolled in like a heavy blanket but nobody in the crowd noticed the cold'))
  ok(r.accuracy === 1, `formatting differences should not count (got ${r.accuracy}, ${JSON.stringify(r.practice)})`)
}

// 3. regional accents are not mistakes
{
  const t = 'I think my brother is going to the house with something nothing else.'
  const r = alignReading(t, said('I fink my bruvver is goin to the ouse wiv somefink nuffink else'))
  ok(r.practice.length === 0, `accents should not be flagged: ${JSON.stringify(r.practice)}`)
}

// 4. a skipped word and a different word are flagged
{
  const r = alignReading(TEXT, said('The score was one-all and the cup final had gone to penalties. Above the stadium, grey clouds rolled in like a heavy jacket, but in the crowd noticed the cold.'))
  const words = r.practice.map((p) => p.word)
  ok(words.includes('blanket'), `swapped word "blanket" should be flagged: ${JSON.stringify(r.practice)}`)
  ok(words.includes('nobody'), `skipped word "nobody" should be flagged: ${JSON.stringify(r.practice)}`)
  ok(r.practice.find((p) => p.word === 'blanket')?.heard === 'jacket', 'should report what was heard instead')
  ok(r.accuracy < 1 && r.accuracy > 0.8, `accuracy should drop a little (got ${r.accuracy})`)
}

// 5. small words and names are never flagged
{
  const t = 'Lionel Messi walked slowly from the halfway line to the spot.'
  const r = alignReading(t, said('Leonel Mesi walked slowly from halfway line to spot'))
  ok(r.practice.length === 0, `names and small words should not be flagged: ${JSON.stringify(r.practice)}`)
}

// 6. stopping early is not a list of mistakes
{
  const r = alignReading(TEXT, said('The score was one-all and the cup final had gone to penalties. Above the stadium, grey clouds rolled in'))
  ok(r.stoppedEarly, 'should notice the child stopped early')
  ok(r.practice.length === 0, `unreached words should not be practice words: ${JSON.stringify(r.practice)}`)
  ok(r.accuracy === 1, `accuracy should count only the words reached (got ${r.accuracy})`)
  ok(/rest/.test(readingFeedback(r).tip), 'tip should invite the child to finish')
}

// 7. silence or a few stray words
{
  const r = alignReading(TEXT, said('thank you'))
  ok(r.heard === 'too_little', 'two stray words should be "too little"')
  ok(readingFeedback(r).praise.length > 0, 'feedback for too little')
}

// 8. numbers: digits and words match
{
  const r = alignReading('She had brought it to every match for forty years.', said('she had brought it to every match for 40 years'))
  ok(r.accuracy === 1, `"40" should match "forty" (got ${r.accuracy})`)
}

// 8b. British and American spellings
{
  const r = alignReading('The goal is 7 metres wide and the colour is grey, so we organise the centre.', said('the goal is 7 meters wide and the color is gray so we organize the center'))
  ok(r.accuracy === 1, `UK/US spellings should match (got ${r.accuracy}, ${JSON.stringify(r.practice)})`)
}

// 9. repeats and ums don't hurt
{
  const r = alignReading(TEXT, said('The um the score was one-all and the cup cup final had gone to er penalties above the stadium grey clouds rolled in like a heavy blanket but nobody in the crowd noticed the cold'))
  ok(r.accuracy === 1, `repeats and fillers should not count (got ${r.accuracy}, ${JSON.stringify(r.practice)})`)
}

// 10. every reading text splits into sensible parts and reads back perfectly
let parts = 0
for (const t of READING_TEXTS) {
  ok(t.parts.length >= 1, `${t.id} has no parts`)
  for (const p of t.parts) {
    parts++
    const wc = p.split(/\s+/).length
    ok(wc >= 4 && wc <= 95, `${t.id}: part has ${wc} words: "${p.slice(0, 50)}…"`)
    const r = alignReading(p, said(p))
    ok(r.accuracy === 1 && r.practice.length === 0, `${t.id}: reading a part back exactly should score 1 (got ${r.accuracy}, ${JSON.stringify(r.practice)})`)
  }
}

if (fails) {
  console.error(`Reading check: ${fails} problem(s)`)
  process.exit(1)
}
console.log(`Reading check: all passed (${READING_TEXTS.length} texts, ${parts} parts)`)
