export type Rng = () => number;

export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic: same seed string, same sequence. */
export function makeRng(seed: string): Rng {
  let a = hashSeed(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const int = (r: Rng, lo: number, hi: number): number =>
  lo + Math.floor(r() * (hi - lo + 1));

export function pick<T>(r: Rng, xs: readonly T[]): T {
  return xs[Math.floor(r() * xs.length)] as T;
}

/** Number formatting for display: 1,250 and a real minus sign. */
export function f(n: number): string {
  const s = Math.abs(n).toLocaleString('en-GB');
  return n < 0 ? '\u2212' + s : s;
}

/** Fixed decimal places for display: fd(3.1, 2) -> "3.10". */
export const fd = (n: number, places: number): string => n.toFixed(places);
/** Round to 2 d.p. so decimal answers are exact to compare. */
export const dp2 = (x: number): number => Math.round(x * 100) / 100;
