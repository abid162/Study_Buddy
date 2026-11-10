import { ALL_TEMPLATES as Y4_TEMPLATES } from '../../src/data/bank/index';
import { SKINS } from '../../src/data/bank/skins';
import { render, seedsFor, checkAnswer } from '../../src/data/bank/generate';
import type { Level } from '../../src/data/bank/types';

const PER_LEVEL = Number(process.env.PER_LEVEL ?? 4);
const fails: string[] = [];
const coverage = new Map<string, Set<string>>();
let rendered = 0;

const fail = (id: string, msg: string) => fails.push(`${id}: ${msg}`);
const hasNum = (s: string, n: number) =>
  new RegExp(`(^|[^\\d,.])${String(n).replace('-', '[-\u2212]')}(?![\\d.])`).test(s) ||
  new RegExp(`(^|[^\\d.])${n.toLocaleString('en-GB')}(?![\\d.])`).test(s);

for (const t of Y4_TEMPLATES) {
  for (const L of (t.levels ?? [1, 2, 3]) as Level[]) {
    const seeds = seedsFor(t, L, PER_LEVEL);
    if (!t.fixed && seeds.length < PER_LEVEL) fail(`${t.id} L${L}`, `only ${seeds.length}/${PER_LEVEL} distinct variants`);
    for (const s of seeds) {
      const texts = new Set<string>();
      for (const skin of SKINS) {
        const q = render(t, L, s, skin);
        if (!q) { fail(`${t.id} L${L} s${s} @${skin.id}`, 'render returned null'); continue; }
        rendered++;
        const id = q.id;
        (coverage.get(t.curriculumId) ?? coverage.set(t.curriculumId, new Set()).get(t.curriculumId)!).add(q.coreId);
        if (!Number.isFinite(q.answer) || Math.abs(q.answer * 1000 - Math.round(q.answer * 1000)) > 1e-6) fail(id, `answer needs more than 3 decimal places: ${q.answer}`);
        if (q.alt !== undefined && Math.abs(q.alt - q.answer) > 1e-9) fail(id, `answer ${q.answer} != independent check ${q.alt}`);
        for (const [label, str] of [['text', q.text], ...q.hints.map((h, i) => [`hint${i + 1}`, h] as const), ...Object.entries(q.mistakes).map(([k, v]) => [`mistake ${k}`, v] as const)] as [string, string][]) {
          if (/undefined|NaN|\[object|\$\{|\{\w+\}|Infinity/.test(str)) fail(id, `broken text in ${label}: ${str}`);
          if (/\s{2,}/.test(str) || /\s[,.!]/.test(str)) fail(id, `spacing in ${label}: ${str}`);
          if (!str.trim()) fail(id, `empty ${label}`);
        }
        if (q.hints.length !== 3) fail(id, 'needs exactly 3 hints');
        if (Math.abs(q.answer) > 12 && (hasNum(q.hints[0], q.answer) || hasNum(q.hints[1], q.answer))) fail(id, `hint 1 or 2 reveals the answer ${q.answer}`);
        if (Math.abs(q.answer) >= 100 && !Object.values(q.params).includes(q.answer) && !q.templateId.includes('PV-02') && hasNum(q.text, q.answer)) fail(id, `answer ${q.answer} appears in the question text`);
        const keys = Object.keys(q.mistakes);
        if (keys.length < 1) fail(id, 'no mistake messages');
        if (String(q.answer) in q.mistakes) fail(id, 'a mistake message matches the right answer');
        for (const k of keys) {
          if (!Number.isFinite(Number(k))) fail(id, `mistake key ${k} not a number`);
          const res = checkAnswer(q, k);
          if (res.correct || res.message !== q.mistakes[k]) fail(id, `checkAnswer does not return the message for ${k}`);
        }
        if (!checkAnswer(q, String(q.answer)).correct) fail(id, 'checkAnswer rejects the right answer');
        if (!checkAnswer(q, q.answer.toFixed(3)).correct) fail(id, 'checkAnswer rejects the right answer typed with 3 d.p.');
        if (Math.abs(q.answer) > 100000000) fail(id, `answer out of range ${q.answer}`);
        if (/(^|[^\d.,])1 [a-z]+s\b/.test(q.text.replace(/£/g, ''))) fail(id, `check plural: ${q.text}`);
        texts.add(q.text);
      }
      if (texts.size < 2) fail(`${t.id} L${L} s${s}`, 'text identical across worlds (skin not applied?)');
    }
  }
}

console.log(`Templates: ${Y4_TEMPLATES.length}  Rendered questions: ${rendered}  Worlds: ${SKINS.length}`);
console.log(`Curriculum statements covered: ${coverage.size}`);
for (const [k, v] of [...coverage].sort()) console.log(`  ${k}: ${v.size} core questions`);
if (fails.length) { console.log(`\nFAILURES (${fails.length}):`); const seen = new Set<string>();
  for (const x of fails) {
    const tpl = x.split('.')[0];
    const kind = x.replace(/^[^:]*: /, '').replace(/[0-9]+/g, 'N').slice(0, 40);
    const k = tpl + '|' + kind;
    if (!seen.has(k)) { seen.add(k); console.log('  ' + x); }
  } process.exit(1); }
console.log('\nAll checks passed.');
