import type { Question } from './types';
import { makeRng } from './rng';

/**
 * Big tap answers for maths questions that used to need typing.
 * The wrong options come first from the question's own known mistakes (so a wrong tap still gets
 * Nova's specific message), then from near misses of the same size and kind (off by one, a place-value slip).
 * Same question, same options and order every time.
 */
export interface TapOption {
  label: string;
  /** passed to checkAnswer() exactly as if the child had typed it */
  value: string;
}

const dp = (n: number) => {
  const s = String(Math.round(n * 1000) / 1000);
  const i = s.indexOf('.');
  return i < 0 ? 0 : s.length - i - 1;
};

const clean = (n: number) => Math.round(n * 1000) / 1000;

/** Money when the question talks in pounds and the answer has pence (or the question asks for an amount in £). */
function isMoney(q: Pick<Question, 'text' | 'answer'>) {
  if (!q.text.includes('£')) return false;
  if (/\bpence\b|\bin p\b|how many p\b/i.test(q.text)) return false;
  return true;
}

export function formatNumber(n: number, money: boolean, year = false) {
  if (year && Number.isInteger(n)) return String(n)
  if (money) {
    const neg = n < 0 ? '−' : '';
    const a = Math.abs(n);
    return `${neg}£${Number.isInteger(a) ? a.toLocaleString('en-GB') : a.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return n.toLocaleString('en-GB', { maximumFractionDigits: 3 }).replace('-', '−');
}

/** Near misses of the same kind as the answer. */
function nearMisses(a: number): number[] {
  const places = dp(a);
  if (places === 0) {
    const big = Math.abs(a) >= 100;
    const c = [a + 1, a - 1, a + 10, a - 10, a * 10, a + 2, a - 2, big ? a + 100 : a + 5, big ? a - 100 : a - 5];
    if (a % 10 === 0 && a !== 0) c.push(a / 10);
    return c;
  }
  const step = 10 ** -places;
  return [a + step, a - step, a * 10, a / 10, a + 1, a - 1, a + step * 2, a - step * 2, a + 0.5, a - 0.5];
}

/** True when this maths question should be answered by tapping. */
export const wantsTap = (q: Pick<Question, 'choices' | 'pick'>) => !q.choices && !q.pick;

export function mathsOptions(q: Pick<Question, 'id' | 'text' | 'answer' | 'mistakes'>, count = 4): TapOption[] {
  const a = q.answer;
  const money = isMoney(q);
  // years are written without a comma: 1998, not 1,998
  const year = /\byears?\b|\bAD\b|\bin the year\b/i.test(q.text) && Number.isInteger(a) && a >= 1000 && a <= 2999;
  const r = makeRng(`tap|${q.id}`);
  const label = (n: number) => formatNumber(n, money, year);
  const seen = new Set<string>([label(a)]);
  const picks: number[] = [];
  const add = (n: number) => {
    if (picks.length >= count - 1 || !Number.isFinite(n)) return;
    const v = clean(n);
    if (Math.abs(v - a) < 1e-9) return;
    if (a >= 0 && v < 0) return; // no negative distractors for a positive answer
    if (money && dp(v) > 2) return;
    const l = label(v);
    if (seen.has(l)) return;
    seen.add(l);
    picks.push(v);
  };
  // 1. the question's own mistakes (each comes with Nova's explanation)
  const known = Object.keys(q.mistakes).map(Number).filter(Number.isFinite);
  known.sort(() => r() - 0.5).forEach(add);
  // 2. near misses, in a random but fixed order
  nearMisses(a).sort(() => r() - 0.5).forEach(add);
  // 3. last resort for tiny answers
  for (let k = 3; picks.length < count - 1 && k < 40; k++) add(a + k);

  // smallest to largest: easier to compare, and the right answer still lands in any position
  const all = [a, ...picks].sort((x, y) => x - y).map((n) => ({ label: label(n), value: String(n) }));
  return all;
}
