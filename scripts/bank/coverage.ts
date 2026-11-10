import { ALL_TEMPLATES as Y4_TEMPLATES } from '../../src/data/bank/index';
import { SKINS } from '../../src/data/bank/skins';
import { render, seedsFor } from '../../src/data/bank/generate';
import type { Level } from '../../src/data/bank/types';
const cov: Record<string, { templates: string[]; core: number }> = {};
for (const t of Y4_TEMPLATES) {
  const e = (cov[t.curriculumId] ??= { templates: [], core: 0 });
  e.templates.push(t.id);
  for (const L of (t.levels ?? [1, 2, 3]) as Level[]) e.core += seedsFor(t, L, 4).length;
}
const rows: unknown[] = [];
for (const t of Y4_TEMPLATES) for (const L of (t.levels ?? [1, 2, 3]) as Level[]) {
  const sd = seedsFor(t, L, 1)[0]; if (sd === undefined) continue;
  for (const w of ['football', 'space']) { const q = render(t, L, sd, SKINS.find(x => x.id === w)!); if (q) { const { alt: _a, ...rest } = q; rows.push(rest); } }
}
console.log(JSON.stringify({ cov, rows }));
