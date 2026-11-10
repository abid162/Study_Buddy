import { ALL_TEMPLATES as Y4_TEMPLATES } from '../../src/data/bank/index';
import { SKINS } from '../../src/data/bank/skins';
import { render, seedsFor } from '../../src/data/bank/generate';
import type { Level } from '../../src/data/bank/types';
const worlds = (process.argv[2] ?? 'football').split(',');
const out: unknown[] = [];
for (const t of Y4_TEMPLATES) for (const L of (t.levels ?? [1, 2, 3]) as Level[]) {
  const s = seedsFor(t, L, 1)[0]; if (s === undefined) continue;
  for (const w of worlds) { const q = render(t, L, s, SKINS.find(x => x.id === w)!); if (q) { const { alt: _a, ...rest } = q; out.push(rest); } }
}
console.log(JSON.stringify(out));
