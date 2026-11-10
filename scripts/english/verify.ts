/** Checks every English item in every world. Run: npx tsx scripts/english/verify.ts */
import { ALL_ENGLISH, ENGLISH_BY_YEAR, renderEn, EN_WORLDS } from '../../src/data/english/index'
import { norm } from '../../src/data/english/mark'

const fails: string[] = []
const fail = (id: string, msg: string) => fails.push(`${id}: ${msg}`)
let rendered = 0
const kinds: Record<string, number> = {}

for (const st of ALL_ENGLISH) {
  if (st.items.length < 3) fail(st.id, 'fewer than 3 items')
  for (let k = 0; k < st.items.length; k++) {
    const texts = new Set<string>()
    for (const w of EN_WORLDS) {
      let q
      try { q = renderEn(st, k, w) } catch (e) { fail(`${st.id}.i${k}@${w}`, `threw ${(e as Error).message}`); continue }
      rendered++
      kinds[q.kind] = (kinds[q.kind] ?? 0) + 1
      const id = q.id
      const strings: [string, string][] = [['prompt', q.prompt], ['explain', q.explain], ...(q.extract ? [['extract', q.extract] as [string, string]] : []),
        ...(q.options ?? []).map((o, i) => [`option${i}`, o] as [string, string]), ...Object.entries(q.why ?? {}).map(([k2, v]) => [`why ${k2}`, v] as [string, string]),
        ...(q.accept ?? []).map((a, i) => [`accept${i}`, a] as [string, string]), ...(q.model ? [['model', q.model] as [string, string]] : []), ...(q.rubric ? [['rubric', q.rubric] as [string, string]] : [])]
      for (const [label, s] of strings) {
        if (/undefined|NaN|\[object|\$\{|\{(thing|actor|actor2|event|his|crowd|team|speaker|He|he)\}/.test(s)) fail(id, `broken text in ${label}: ${s.slice(0, 80)}`)
        if (/ {2,}/.test(s) || /\s[,.!?;:]/.test(s.replace(/\n/g, ' ')) && !/• /.test(s)) fail(id, `spacing in ${label}: ${s.slice(0, 80)}`)
        if (!s.trim()) fail(id, `empty ${label}`)
      }
      texts.add(q.prompt + (q.extract ?? '') + (q.options ?? []).join('|'))
      if (q.kind === 'choice') {
        const o = q.options ?? []
        if (o.length < 2) fail(id, 'choice needs 2+ options')
        if (!q.answer || !o.includes(q.answer)) fail(id, 'answer not in options')
        if (new Set(o.map(norm)).size !== o.length) fail(id, `duplicate options: ${o.join(' | ')}`)
        for (const k2 of Object.keys(q.why ?? {})) if (!o.includes(k2)) fail(id, `why key not an option: ${k2}`)
        if (q.why && q.answer && q.answer in q.why) fail(id, 'why message on the right answer')
      }
      if (q.kind === 'text' && !(q.accept ?? []).length) fail(id, 'text needs accepted answers')
      if (q.kind === 'spell') {
        if (!q.answer || !q.say?.includes(q.answer)) fail(id, 'spell needs answer in say')
        if (!q.extract?.includes('___')) fail(id, 'spell sentence needs ___')
      }
      if (q.kind === 'open' && (!q.rubric || !q.model)) fail(id, 'open needs rubric and model')
    }
    const fixed = st.items[k]![1].length === 0 // spelling items ignore the world on purpose
    if (!fixed && texts.size < 2) fail(`${st.id}.i${k}`, 'identical in every world')
  }
}

for (const y of [4, 5, 6] as const) {
  const sts = ENGLISH_BY_YEAR[y]
  const n = sts.reduce((a, s) => a + s.items.length, 0)
  console.log(`Year ${y}: ${sts.length} statements, ${n} items per world`)
}
console.log(`Rendered ${rendered} items across ${EN_WORLDS.length} worlds. Kinds: ${JSON.stringify(kinds)}`)
if (fails.length) {
  console.log(`\nFAILURES (${fails.length}):`)
  for (const f of fails.slice(0, 60)) console.log('  ' + f)
  process.exit(1)
}
console.log('\nAll checks passed.')
