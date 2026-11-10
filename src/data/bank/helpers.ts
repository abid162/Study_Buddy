import type { Template, Draft, Level, Ctx, Mistake } from './types';
import type { Rng } from './rng';
import { mk } from './templates.y4';

export type Build = (r: Rng, c: Ctx, L: Level) => Draft | null;
/** Template factory for a given school year. */
export const TY = (year: 4 | 5 | 6) => (id: string, curriculumId: string, build: Build): Template => ({
  id: `T-${id}`, curriculumId, year, build,
});
export const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
export const lcm = (a: number, b: number): number => (a / gcd(a, b)) * b;
export const dp3 = (x: number): number => Math.round(x * 1000) / 1000;
export const divisors = (n: number): number[] => { const d: number[] = []; for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; };
export const isPrime = (n: number): boolean => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
/** Build a mistakes list from [value, message] rows. */
export const M = (answer: number, rows: [number, string][], neg = false): Mistake[] => {
  const m: Mistake[] = []; for (const [v, msg] of rows) mk(m, v, msg, answer, neg); return m;
};
/** Display a number trimmed of trailing zeros: 0.450 -> 0.45. */
export const tr = (n: number): string => String(Math.round(n * 1e6) / 1e6);

/** Restrict a template to some levels (e.g. a form that only suits level 1). */
export const onlyLevels = (t: Template, levels: Level[]): Template => ({ ...t, levels });
