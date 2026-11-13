/**
 * Tap answers: every maths question the tutor serves without its own choices or grid gets 4 options.
 * Checks: exactly one right option, which checkAnswer() accepts; 4 different labels; every wrong option
 * is rejected; no negative options for positive answers; money shown with two decimal places.
 */
import { SKINS } from '../../src/data/bank/skins';
import { ALL_TEMPLATES } from '../../src/data/bank/index';
import { render, seedsFor, checkAnswer } from '../../src/data/bank/generate';
import { mathsOptions, wantsTap } from '../../src/data/bank/options';
import type { Level } from '../../src/data/bank/types';

const fails: string[] = [];
let checked = 0;
let withMistake = 0;
const samples: string[] = [];

for (const t of ALL_TEMPLATES) {
  for (const L of (t.levels ?? [1, 2, 3]) as Level[]) {
    for (const s of seedsFor(t, L, 4)) for (const skin of SKINS) {
      const q = render(t, L, s, skin);
      if (!q || !wantsTap(q)) continue;
      checked++;
      const opts = mathsOptions(q);
      const labels = new Set(opts.map((o) => o.label));
      if (opts.length !== 4) fails.push(`${q.id}: ${opts.length} options`);
      if (labels.size !== opts.length) fails.push(`${q.id}: duplicate labels ${[...labels]}`);
      const right = opts.filter((o) => checkAnswer(q, o.value).correct);
      if (right.length !== 1) fails.push(`${q.id}: ${right.length} right options`);
      for (const o of opts) {
        const r = checkAnswer(q, o.value);
        if (!r.valid) fails.push(`${q.id}: option ${o.label} not a valid answer`);
        if (q.answer >= 0 && Number(o.value) < 0) fails.push(`${q.id}: negative option ${o.label}`);
        if (o.label.includes('£') && /\.\d$/.test(o.label)) fails.push(`${q.id}: money label ${o.label}`);
      }
      if (opts.some((o) => !checkAnswer(q, o.value).correct && checkAnswer(q, o.value).message)) withMistake++;
      if (skin.id === 'music' && samples.length < 12 && checked % 97 === 0) samples.push(`${q.text}\n   → ${opts.map((o) => o.label).join(' | ')}  (answer ${q.answer})`);
    }
  }
}

console.log(`Tap answers: ${checked} maths questions, ${withMistake} with at least one known-mistake option.`);
if (process.env.SHOW) console.log(samples.join('\n'));
if (fails.length) {
  console.log(fails.slice(0, 30).join('\n'));
  console.log(`${fails.length} problems`);
  process.exit(1);
}
console.log('Tap answers: all checks passed.');
