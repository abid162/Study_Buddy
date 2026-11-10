import type { Template, Skin, Question, Level, Ctx } from './types';
import { makeRng, pick } from './rng';
import { SKINS } from './skins';

function makeCtx(skin: Skin, seed: string): Ctx {
  const r = makeRng(seed);
  const thing = pick(r, skin.things);
  const others = skin.things.filter(t => t !== thing);
  return { actor: pick(r, skin.actors), thing, thing2: pick(r, others), crowd: skin.crowd, place: skin.place };
}

/** Render one question for one world. Numbers depend only on (template, level, seed). */
export function render(t: Template, level: Level, seed: number, skin: Skin): (Question & { alt?: number }) | null {
  const base = `${t.id}|L${level}|${seed}`;
  const d = t.build(makeRng(base), makeCtx(skin, `${base}|${skin.id}`), level);
  if (!d) return null;
  const mistakes: Record<string, string> = {};
  for (const m of d.mistakes) {
    if (m.value !== d.answer && !(String(m.value) in mistakes)) mistakes[String(m.value)] = m.message;
  }
  const coreId = `${t.id}.L${level}.s${seed}`;
  return {
    id: `${coreId}@${skin.id}`, coreId, templateId: t.id, curriculumId: t.curriculumId, year: t.year,
    level, world: skin.id, text: d.text, answer: d.answer, hints: d.hints, mistakes, params: d.params, alt: d.alt,
  };
}

/** Pick `n` seeds with distinct numbers for a template and level. Same seeds work for every world. */
export function seedsFor(t: Template, level: Level, n: number): number[] {
  if (t.fixed) return render(t, level, 0, SKINS[0]!) ? [0] : [];
  const seen = new Set<string>();
  const out: number[] = [];
  for (let s = 0; s < n * 40 && out.length < n; s++) {
    const q = render(t, level, s, SKINS[0]!);
    if (!q) continue;
    const key = JSON.stringify(q.params);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

export function generateBank(templates: Template[], skins: Skin[], perLevel = 4): Question[] {
  const all: Question[] = [];
  for (const t of templates) for (const L of (t.levels ?? [1, 2, 3]) as Level[]) {
    for (const s of seedsFor(t, L, perLevel)) for (const skin of skins) {
      const q = render(t, L, s, skin);
      if (q) { const { alt: _alt, ...rest } = q; all.push(rest as Question); }
    }
  }
  return all;
}

export interface AnswerResult {
  valid: boolean;      // false if the text is not a number
  correct: boolean;
  message?: string;    // Nova's specific message for a known wrong answer
}

/** Check what the child typed. Accepts 7.5, 7.50, £7.50, 1,250 and the minus sign. */
export function checkAnswer(q: Pick<Question, 'answer' | 'mistakes'>, typed: string): AnswerResult {
  const cleaned = typed.replace(/[\u2212\u2013]/g, '-').replace(/[£,\s]/g, '');
  if (cleaned === '' || !/^-?(\d+\.?\d*|\.\d+)$/.test(cleaned)) return { valid: false, correct: false };
  const n = Number(cleaned);
  if (Math.abs(n - q.answer) < 1e-9) return { valid: true, correct: true };
  const key = String(Math.round(n * 1000) / 1000);
  return { valid: true, correct: false, message: q.mistakes[key] };
}
