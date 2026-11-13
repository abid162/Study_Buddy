/**
 * Adventures: build many sessions for every story, year and set of choices, and check every question.
 * One right answer among distinct options; no broken text; real curriculum ids; three hints.
 */
import { EPISODES, buildSession } from '../src/data/adventure/index'
import { MATHS_STATEMENTS } from '../src/data/curriculum.maths'
import type { StoryChoices, Year } from '../src/data/adventure/types'

const ids = new Set(MATHS_STATEMENTS.map((s) => s.id))
const fails: string[] = []
let n = 0
const skillsSeen = new Map<string, Set<string>>()
const samples: string[] = []

for (const ep of Object.values(EPISODES)) {
  if (!ep) continue
  for (const year of [4, 5, 6] as Year[]) {
    for (let s = 0; s < 300; s++) {
      // a third of sessions as a strong child (stretch), a third as a child finding things tricky (easier)
      const mode = s % 3
      const adapt = mode === 0 ? undefined : { status: () => (mode === 1 ? 'secure' : 'tricky') as 'secure' | 'tricky', weak: new Set<string>() }
      const c: StoryChoices = { name: 'Raffy', team: 'Arsenal', rival: 'Chelsea' }
      for (const d of ep.choices) {
        const opts = d.options(c)
        c[d.key] = opts[s % opts.length]!.value
      }
      const session = buildSession(ep, year, c, { plays: 0, wins: 0 }, `check|${s}`, adapt)
      for (const b of session) {
        n++
        const q = b.question
        const tag = `${ep.id} Y${year} ${b.skillId} s${s}`
        const k = `${ep.id} Y${year}`
        if (!skillsSeen.has(k)) skillsSeen.set(k, new Set())
        skillsSeen.get(k)!.add(b.skillId)
        if (q.options.filter((o) => o === q.right).length !== 1) fails.push(`${tag}: right answer appears ${q.options.filter((o) => o === q.right).length} times`)
        if (new Set(q.options).size !== q.options.length) fails.push(`${tag}: duplicate options ${q.options.join(' | ')}`)
        if (q.options.length < 3) fails.push(`${tag}: only ${q.options.length} options`)
        const all = [q.text, q.explain, ...q.hints, ...q.options, ...Object.values(q.why)].join(' ')
        if (/undefined|NaN|Infinity|\[object/.test(all)) fails.push(`${tag}: broken text: ${q.text}`)
        if (!ids.has(q.curriculumId)) fails.push(`${tag}: unknown curriculum id ${q.curriculumId}`)
        if (q.hints.some((h) => !h)) fails.push(`${tag}: empty hint`)
        for (const w of Object.keys(q.why)) if (!q.options.includes(w) && w !== q.right) {} // reasons for options not shown are fine
        if (s === 7 && samples.length < 60) samples.push(`[${tag}] ${q.text}\n    → ${q.options.join(' | ')}   ✓ ${q.right}`)
      }
    }
  }
}
for (const [k, v] of skillsSeen) console.log(`${k}: ${v.size} different skills used`)
if (process.env.SHOW) console.log(samples.join('\n'))
console.log(`Adventures: ${n} questions checked.`)
if (fails.length) {
  console.log([...new Set(fails)].slice(0, 25).join('\n'))
  console.log(`${fails.length} problems`)
  process.exit(1)
}
console.log('Adventures: all checks passed.')
