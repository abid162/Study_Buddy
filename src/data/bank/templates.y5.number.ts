import type { Template, Mistake } from './types';
import { int, pick, f } from './rng';
import { mk, columnAdd, columnSub, roundTo, digits, fromDigits } from './templates.y4';
import { TY, gcd, divisors, isPrime, dp3, onlyLevels } from './helpers';

const T5 = TY(5);

const R2: [number, string][] = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
const toRoman = (n: number) => { let s = ''; for (const [v, sym] of R2) while (n >= v) { s += sym; n -= v; } return s; };
const RV: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
const fromRoman = (s: string) => { let t = 0; for (let i = 0; i < s.length; i++) { const v = RV[s[i]!]!, nx = RV[s[i + 1] ?? ''] ?? 0; t += v < nx ? -v : v; } return t; };
const romanParts = (s: string) => { const p: number[] = []; for (let i = 0; i < s.length; i++) { const v = RV[s[i]!]!, nx = RV[s[i + 1] ?? ''] ?? 0; if (v < nx) { p.push(nx - v); i++; } else p.push(v); } return p; };

export const Y5_NUMBER: Template[] = [

// ===== PLACE VALUE =====
T5('Y5-PV-01', 'MA-Y5-PV-01', (r, c, L) => {
  const nums: number[] = [];
  const stem = int(r, 100, 899) * 1000;
  for (let t = 0; nums.length < 3 && t < 200; t++) {
    const x = L === 1 ? int(r, 10000, 99999) : L === 2 ? int(r, 100000, 999999) : stem + int(r, 0, 999);
    if (!nums.includes(x)) nums.push(x);
  }
  if (nums.length < 3) return null;
  const biggest = L !== 2;
  const answer = biggest ? Math.max(...nums) : Math.min(...nums);
  const m: Mistake[] = [];
  for (const x of nums) mk(m, x, `${f(x)} is not the ${biggest ? 'largest' : 'smallest'}. Compare the digits from the left, one place at a time.`, answer);
  return {
    text: `${c.actor} writes down three totals of ${c.thing}: ${nums.map(f).join(', ')}. Which is the ${biggest ? 'largest' : 'smallest'} total?`,
    answer, mistakes: m, params: { a: nums[0]!, b: nums[1]!, c: nums[2]!, biggest: biggest ? 1 : 0 },
    hints: [
      'Count the digits first. A number with more digits is bigger.',
      'If the numbers have the same number of digits, compare from the left: the biggest place first.',
      `Which number has the ${biggest ? 'biggest' : 'smallest'} digit in the first place where they differ?`,
    ],
    alt: [...nums].sort((x, y) => (biggest ? y - x : x - y))[0]!,
  };
}),

T5('Y5-PV-02', 'MA-Y5-PV-02', (r, c, L) => {
  const step = L === 1 ? pick(r, [10, 100]) : L === 2 ? pick(r, [1000, 10000]) : pick(r, [10000, 100000]);
  const up = r() < 0.6, k = int(r, 3, 6);
  const start = int(r, 2, 9) * step * 10 + int(r, 1, 9) * step;
  const answer = up ? start + k * step : start - k * step;
  const m: Mistake[] = [];
  mk(m, up ? start + (k - 1) * step : start - (k - 1) * step, `That is only ${k - 1} steps. Count ${k}.`, answer);
  mk(m, up ? start + (k + 1) * step : start - (k + 1) * step, `That is ${k + 1} steps. Count ${k}.`, answer);
  mk(m, up ? start + k * step * 10 : start - k * step * 10, `That uses steps of ${f(step * 10)}. Each step is ${f(step)}.`, answer);
  return {
    text: `${c.actor} starts at ${f(start)} and counts ${up ? 'forwards' : 'backwards'} in steps of ${f(step)}. What number does ${c.actor} reach after ${k} steps?`,
    answer, mistakes: m, params: { start, step, k, up: up ? 1 : 0 },
    hints: [
      `Each step ${up ? 'adds' : 'takes away'} ${f(step)}. Only one digit changes each time.`,
      `Find which digit is in the ${step === 10 ? 'tens' : step === 100 ? 'hundreds' : step === 1000 ? 'thousands' : step === 10000 ? 'ten-thousands' : 'hundred-thousands'} place. That digit goes ${up ? 'up' : 'down'} by 1 each step.`,
      `After ${k} steps that digit has changed by ${k}. Work out ${f(start)} ${up ? '+' : '−'} ${k} × ${f(step)}.`,
    ],
    alt: (() => { let x = start; for (let i = 0; i < k; i++) x += up ? step : -step; return x; })(),
  };
}),

T5('Y5-PV-03', 'MA-Y5-PV-03', (r, c, L) => {
  let start: number, plan: number[];
  if (L === 1) { start = -int(r, 3, 9); plan = [int(r, -start + 1, -start + 8)]; }
  else if (L === 2) { start = int(r, 3, 15); plan = [-(start + int(r, 2, 10))]; }
  else { start = -int(r, 5, 15); const a = int(r, 8, 25), b = int(r, 5, 20); plan = [a, -b]; }
  const answer = plan.reduce((x, y) => x + y, start);
  const dir = (n: number) => (n > 0 ? `forwards ${n}` : `backwards ${-n}`);
  const m: Mistake[] = [];
  mk(m, -answer, 'Check which side of zero you finish on. Use a number line.', answer, true);
  mk(m, start - plan.reduce((x, y) => x + y, 0), 'One of the directions was reversed. Forwards goes up, backwards goes down.', answer, true);
  if (L === 3) mk(m, start + Math.abs(plan[0]!) + Math.abs(plan[1]!), 'Backwards means subtract, not add.', answer, true);
  const first = start + plan[0]!;
  return {
    text: `${c.actor} stands at ${f(start)} on a number line and moves ${plan.map(dir).join(', then ')} steps. Where does ${c.actor} finish?`.replace(/ steps steps/g, ' steps'),
    answer, mistakes: m, params: { start, p0: plan[0]!, p1: plan[1] ?? 0 },
    hints: [
      'Draw a number line and mark where you start.',
      `Forwards moves to the right (bigger). Backwards moves to the left (smaller). Remember to pass through zero.`,
      L === 3 ? `After the first move you are at ${f(first)}. Now do the second move from there.` : `Count the steps to zero first, then count the rest of the steps.`,
    ],
    alt: (() => { let x = start; for (const p of plan) x += p; return x; })(),
  };
}),

T5('Y5-PV-04', 'MA-Y5-PV-04', (r, c, L) => {
  const p = L === 1 ? pick(r, [10, 100, 1000]) : L === 2 ? pick(r, [1000, 10000]) : pick(r, [10000, 100000]);
  const tie = L === 3 && r() < 0.35;
  let n = int(r, 12000, 998999);
  if (tie) n = Math.floor(n / p) * p + p / 2; else if (n % p === p / 2) n += 1;
  if (n % p === 0) return null;
  const answer = roundTo(n, p);
  const pn = ({ 10: 'tens', 100: 'hundreds', 1000: 'thousands', 10000: 'ten-thousands', 100000: 'hundred-thousands' } as Record<number, string>)[p]!;
  const m: Mistake[] = [];
  mk(m, Math.floor(n / p) * p, `You rounded down. Look at the digit to the right of the ${pn} place: 5 or more rounds up.`, answer);
  mk(m, Math.ceil(n / p) * p, `You rounded up. Look at the digit to the right of the ${pn} place: 4 or less rounds down.`, answer);
  if (p >= 100) mk(m, roundTo(n, p / 10), `That rounds to the nearest ${f(p / 10)}. The question asks for the nearest ${f(p)}.`, answer);
  return {
    text: `${c.actor} sells ${f(n)} ${c.thing} in a year and rounds the number to the nearest ${f(p)}. What is the rounded number?`,
    answer, mistakes: m, params: { n, p },
    hints: [
      `Find the ${pn} digit, then look at the digit just to its right.`,
      '5 or more: round up. 4 or less: round down.',
      `${f(n)} lies between ${f(Math.floor(n / p) * p)} and ${f((Math.floor(n / p) + 1) * p)}. Which is it closer to? (Exactly halfway rounds up.)`,
    ],
    alt: (() => { const rem = n % p; return rem * 2 >= p ? n - rem + p : n - rem; })(),
  };
}),

T5('Y5-PV-06', 'MA-Y5-PV-06', (r, c, L) => {
  const n = L === 1 ? int(r, 101, 399) : L === 2 ? int(r, 400, 999) : int(r, 1900, 2030);
  const R = toRoman(n);
  if (/^M?[A-Z]$/.test(R)) return null;
  const answer = fromRoman(R);
  const naive = [...R].reduce((t, ch) => t + RV[ch]!, 0);
  const m: Mistake[] = [];
  mk(m, naive, 'A smaller symbol in front of a bigger one is subtracted, not added.', answer);
  mk(m, R.length, 'That counts the symbols. Each symbol has its own value.', answer);
  return {
    text: L === 3
      ? `A plaque at ${c.place} shows the year ${R}. ${c.actor} reads it as a normal number. What year is it?`
      : `${c.actor} sees the number ${R} written in Roman numerals. What number is it?`,
    answer, mistakes: m, params: { R },
    hints: [
      'Remember: I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1,000.',
      'If a smaller symbol comes before a bigger one, subtract it. Otherwise add.',
      `Split it into parts: ${romanParts(R).join(' + ')}. Now add them up.`,
    ],
    alt: n,
  };
}),

// ===== ADDITION AND SUBTRACTION =====
T5('Y5-AS-01-add', 'MA-Y5-AS-01', (r, c, L) => {
  for (let i = 0; i < 400; i++) {
    const a = L < 3 ? int(r, 10000, 89999) : int(r, 100000, 799999), b = L < 3 ? int(r, 10000, 89999) : int(r, 100000, 799999);
    const cs = columnAdd(a, b);
    if (L === 1 ? cs.carries !== 0 : L === 2 ? cs.carries < 1 || cs.carries > 2 : cs.carries < 3) continue;
    const m: Mistake[] = [];
    mk(m, cs.noCarry, 'It looks like a carry was missed. When a column makes 10 or more, carry the 10 into the next column.', cs.value);
    mk(m, Math.abs(a - b), 'That subtracts. "Altogether" means add.', cs.value);
    return {
      text: `${f(a)} ${c.crowd} came to ${c.place} in the first year and ${f(b)} came in the second year. How many came altogether?`,
      answer: cs.value, mistakes: m, params: { a, b },
      hints: [
        'Line the numbers up so that ones are under ones. Start with the ones column.',
        'Add each column from right to left. If a column makes 10 or more, carry the 10 to the next column.',
        `Ones: ${cs.steps[0]}. Tens: ${cs.steps[1]}. Now do the other columns.`,
      ],
      alt: a + b,
    };
  }
  return null;
}),

T5('Y5-AS-01-sub', 'MA-Y5-AS-01', (r, c, L) => {
  for (let i = 0; i < 600; i++) {
    const a = L < 3 ? int(r, 20000, 99999) : int(r, 200000, 999999);
    const b = L < 3 ? int(r, 10000, a - 1000) : int(r, 100000, a - 10000);
    const cs = columnSub(a, b);
    if (L === 1 ? cs.borrows !== 0 : L === 2 ? cs.borrows < 1 || cs.borrows > 2 : cs.borrows < 3) continue;
    const m: Mistake[] = [];
    mk(m, cs.absDiff, 'It looks like the smaller digit was taken from the bigger one in each column. Exchange from the next column instead.', cs.value);
    mk(m, a + b, 'That adds. "Left" means take away.', cs.value);
    return {
      text: `${f(a)} ${c.crowd} were at ${c.place}. ${f(b)} left early. How many ${c.crowd} were still there?`,
      answer: cs.value, mistakes: m, params: { a, b },
      hints: [
        'Line the numbers up in columns and start with the ones.',
        'If the top digit is smaller than the bottom digit, exchange: take 1 from the next column and make it 10 here.',
        `Ones: ${cs.steps[0]}. Tens: ${cs.steps[1]}. Keep going left.`,
      ],
      alt: a - b,
    };
  }
  return null;
}),

T5('Y5-AS-02', 'MA-Y5-AS-02', (r, c, L) => {
  const step = L === 1 ? 1000 : L === 2 ? 1000 : 10000;
  const mlt = int(r, 2, 9), e = L === 1 ? 0 : pick(r, [1, 2]);
  const near = mlt * step - e;
  const a = int(r, 20000, 89999);
  const add = r() < 0.5;
  if (!add && a - near < 1000) return null;
  const answer = add ? a + near : a - near;
  const m: Mistake[] = [];
  if (e) {
    mk(m, add ? a + mlt * step : a - mlt * step, `That uses ${f(mlt * step)}. The number is ${e} less than that, so adjust your answer.`, answer);
    mk(m, add ? a + mlt * step + e : a - mlt * step - e, `The adjustment goes the other way: ${f(near)} is ${e} less than ${f(mlt * step)}.`, answer);
  } else {
    mk(m, add ? a - near : a + near, add ? 'That subtracts. You need to add.' : 'That adds. You need to subtract.', answer);
  }
  return {
    text: `${c.actor} works out ${f(a)} ${add ? '+' : '−'} ${f(near)} in their head. What is the answer?`,
    answer, mistakes: m, params: { a, near, add: add ? 1 : 0 },
    hints: [
      e ? `${f(near)} is very close to ${f(mlt * step)}. Use that to make it easier.` : `${f(near)} is a round number, so only the ${step === 1000 ? 'thousands' : 'ten-thousands'} digit changes.`,
      e ? `${add ? 'Add' : 'Subtract'} ${f(mlt * step)}, then adjust by ${e}.` : `Work out ${mlt} ${add ? 'more' : 'fewer'} ${step === 1000 ? 'thousands' : 'ten-thousands'}.`,
      e ? `${f(near)} is ${e} less than ${f(mlt * step)}, so you ${add ? 'added' : 'subtracted'} ${e} too many. Fix that.` : `Change that one digit and keep the rest the same.`,
    ],
    alt: add ? a + mlt * step - e : a - mlt * step + e,
  };
}),

T5('Y5-AS-03', 'MA-Y5-AS-03', (r, c, L) => {
  const p = L === 1 ? 1000 : L === 2 ? pick(r, [1000, 10000]) : 10000;
  const a = int(r, 12000, 89999), b = int(r, 12000, 89999);
  if (a % p === p / 2 || b % p === p / 2) return null;
  const sub = L === 3 && r() < 0.5;
  const [x, y] = sub ? [Math.max(a, b), Math.min(a, b)] : [a, b];
  const answer = roundTo(x, p) + (sub ? -1 : 1) * roundTo(y, p);
  if (answer <= 0 || answer === p) return null;
  const exact = sub ? x - y : x + y;
  const m: Mistake[] = [];
  mk(m, exact, 'That is the exact answer. An estimate uses the rounded numbers.', answer);
  mk(m, roundTo(x, p) + (sub ? -1 : 1) * y, `Round both numbers to the nearest ${f(p)}, not just one.`, answer);
  return {
    text: `${c.actor} estimates ${f(x)} ${sub ? '−' : '+'} ${f(y)} by rounding each number to the nearest ${f(p)} to check an answer. What is the estimate?`,
    answer, mistakes: m, params: { x, y, p, sub: sub ? 1 : 0 },
    hints: [
      `Round each number to the nearest ${f(p)} first.`,
      `${f(x)} rounds to ${f(roundTo(x, p))}. What does ${f(y)} round to?`,
      `Now ${sub ? 'subtract' : 'add'} the two rounded numbers.`,
    ],
    alt: (() => { const rr = (n: number) => Math.round(n / p) * p; return rr(x) + (sub ? -1 : 1) * rr(y); })(),
  };
}),

// ===== MULTIPLICATION AND DIVISION =====
onlyLevels(T5('Y5-MD-01-pairs', 'MA-Y5-MD-01', (r, c, L) => {
  if (L !== 1) return null;
  const n = pick(r, [12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48]);
  const fs = divisors(n);
  const answer = Math.ceil(fs.length / 2);
  const m: Mistake[] = [];
  mk(m, fs.length, 'That counts all the factors. A factor pair uses two of them.', answer);
  mk(m, answer - 1, `Do not leave out 1 × ${n}. That is a factor pair too.`, answer);
  return {
    text: `${c.actor} arranges ${n} ${c.thing} in a rectangle in as many different ways as possible. A rectangle that is 2 wide and 6 long counts as the same as 6 wide and 2 long. How many different rectangles can ${c.actor} make?`,
    answer, mistakes: m, params: { n },
    hints: ['Each rectangle is a factor pair. Start with 1 × ' + n + '.', 'Try 2, 3, 4, 5 and so on. Does each divide exactly into ' + n + '?', 'Stop when the next factor is bigger than its partner. Count the pairs.'],
    alt: (() => { let k = 0; for (let i = 1; i * i <= n; i++) if (n % i === 0) k++; return k; })(),
  };
}), [1]),
onlyLevels(T5('Y5-MD-01-hcf', 'MA-Y5-MD-01', (r, c, L) => {
  if (L === 1) return null;
  const g = L === 2 ? int(r, 2, 6) : int(r, 6, 15);
  const p = int(r, 2, 9), q = int(r, 2, 9);
  if (p === q || gcd(p, q) !== 1) return null;
  const a = g * p, b = g * q;
  const m: Mistake[] = [];
  mk(m, Math.min(a, b), 'The highest common factor must divide both numbers exactly, so it is not usually the smaller number.', g);
  mk(m, Math.abs(a - b), 'That is the difference. Look for the biggest number that divides into both.', g);
  mk(m, a * b / g, 'That is the lowest common multiple. You need the highest common factor.', g);
  return {
    text: `${c.actor} has ${a} ${c.thing} and ${b} ${c.thing2}. ${c.actor} makes identical bundles using all of them with none left over. What is the biggest number of bundles ${c.actor} can make?`,
    answer: g, mistakes: m, params: { a, b },
    hints: ['You need the biggest number that divides exactly into both numbers.', `List the factors of ${Math.min(a, b)}. Which ones also divide ${Math.max(a, b)}?`, 'Pick the biggest factor that appears in both lists.'],
    alt: (() => { let best = 1; for (let i = 1; i <= Math.min(a, b); i++) if (a % i === 0 && b % i === 0) best = i; return best; })(),
  };
}), [2, 3]),

T5('Y5-MD-02', 'MA-Y5-MD-02', (r, c, L) => {
  const pool = L === 1 ? [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]
    : L === 2 ? [21,22,23,24,25,27,29,31,33,35,37,39,41,43,45,47,49,51,53,55,57]
    : [51,53,57,59,61,63,67,69,71,73,77,79,81,83,87,89,91,93,97,99];
  const list: number[] = [];
  for (let t = 0; list.length < 6 && t < 100; t++) { const x = pick(r, pool); if (!list.includes(x)) list.push(x); }
  if (L === 3 && r() < 0.5) list[0] = 1;
  const comp = list.filter(x => x > 1 && !isPrime(x)).length;
  const prim = list.filter(isPrime).length;
  if (comp === 0 || prim === 0) return null;
  const m: Mistake[] = [];
  mk(m, prim, 'That counts the prime numbers. The question asks for composite numbers.', comp);
  mk(m, comp + 1, 'You counted one number too many. Check each number you called composite.', comp);
  mk(m, comp - 1, 'You missed one. Check each number you called prime.', comp);
  if (list.includes(1)) mk(m, comp + 1, '1 is not composite and not prime. A composite number has more than two factors.', comp);
  return {
    text: `${c.actor} writes these numbers on cards: ${list.join(', ')}. How many of the numbers are composite (not prime)?`,
    answer: comp, mistakes: m, params: { list: list.join(',') },
    hints: ['A prime number has exactly two factors: 1 and itself. A composite number has more than two.', 'Test each number: does 2, 3, 5 or 7 divide into it exactly?', list.includes(1) ? 'Careful: 1 is neither prime nor composite.' : 'Count only the numbers that you found a divisor for.'],
    alt: (() => { const sieve = (n: number) => { for (let d = 2; d < n; d++) if (n % d === 0) return true; return false; }; return list.filter(x => x > 1 && sieve(x)).length; })(),
  };
}),

T5('Y5-MD-03', 'MA-Y5-MD-03', (r, c, L) => {
  const hi = L === 1 ? 30 : L === 2 ? 60 : 100;
  const primes: number[] = []; for (let i = 2; i <= hi; i++) if (isPrime(i)) primes.push(i);
  const answer = pick(r, primes);
  const comps: number[] = [];
  for (let t = 0; comps.length < 3 && t < 300; t++) {
    const x = int(r, L === 1 ? 4 : 21, hi);
    const tricky = L === 1 || x % 2 === 1;
    if (!isPrime(x) && tricky && !comps.includes(x) && x !== answer) comps.push(x);
  }
  if (comps.length < 3) return null;
  const opts = [...comps, answer].sort((a, b) => a - b);
  const m: Mistake[] = [];
  for (const x of comps) { const d = divisors(x).find(v => v > 1)!; mk(m, x, `${x} is not prime: ${d} × ${x / d} = ${x}.`, answer); }
  return {
    text: `${c.actor} has four number cards: ${opts.join(', ')}. Only one of them is a prime number. Which one?`,
    answer, mistakes: m, params: { opts: opts.join(',') },
    hints: ['A prime number has exactly two factors: 1 and itself.', 'Try dividing each number by 2, 3, 5, 7. If one divides exactly, the number is not prime.', 'Cross out every number that you can divide. The one left is prime.'],
    alt: opts.filter(x => { for (let d = 2; d < x; d++) if (x % d === 0) return false; return x > 1; })[0]!,
  };
}),

T5('Y5-MD-04', 'MA-Y5-MD-04', (r, c, L) => {
  let a: number, b: number;
  if (L === 1) { a = int(r, 1200, 9899); b = int(r, 3, 9); }
  else if (L === 2) { a = int(r, 120, 899); b = int(r, 12, 79); }
  else { a = int(r, 1200, 6999); b = int(r, 12, 79); }
  if (b % 10 === 0) return null;
  const answer = a * b;
  const m: Mistake[] = [];
  if (b < 10) {
    const nc: number[] = [];
    for (const d of digits(a)) nc.push((d * b) % 10);
    mk(m, fromDigits(nc), 'It looks like the carried digits were left out. Add each carry to the next column.', answer);
    mk(m, a + b, 'That adds. Equal crates means multiply.', answer);
  } else {
    const u = b % 10, t = Math.floor(b / 10);
    mk(m, a * u + a * t, 'You forgot the zero when you multiplied by the tens digit. Multiplying by the tens means multiplying by 10 too.', answer);
    mk(m, a * u, 'That only multiplies by the ones digit. You need the tens as well.', answer);
  }
  return {
    text: `${c.actor} packs ${f(a)} ${c.thing} into each of ${b} crates. How many ${c.thing} are packed altogether?`,
    answer, mistakes: m, params: { a, b },
    hints: b < 10 ? [`Write ${f(a)} × ${b} in columns and start with the ones.`, 'Multiply each digit by the number below. Carry when the answer is 10 or more.', `Work through the columns from right to left, adding each carry.`]
      : [`Split ${b} into ${Math.floor(b / 10) * 10} and ${b % 10}.`, `Work out ${f(a)} × ${b % 10} and ${f(a)} × ${Math.floor(b / 10) * 10} separately.`, 'Add the two answers together.'],
    alt: b < 10 ? a * b : a * (b % 10) + a * (b - (b % 10)),
  };
}),

T5('Y5-MD-05', 'MA-Y5-MD-05', (r, c, L) => {
  const m: Mistake[] = [];
  if (L < 3) {
    const x = int(r, 2, 9), y = int(r, 2, 9), zx = L === 1 ? 1 : int(r, 1, 2), zy = L === 1 ? 0 : int(r, 1, 2);
    const A = x * 10 ** zx, B = y * 10 ** zy;
    if (L === 1 && y === 1) return null;
    const answer = A * B;
    mk(m, answer * 10, 'You have one zero too many. Count the zeros in both numbers.', answer);
    mk(m, answer / 10, 'You have one zero too few. Count the zeros in both numbers.', answer);
    mk(m, A + B, 'That adds. The question is a multiplication.', answer);
    return {
      text: `${c.actor} uses the fact ${x} × ${y} = ${x * y} to work out ${f(A)} × ${f(B)}. What is the answer?`,
      answer, mistakes: m, params: { x, y, zx, zy },
      hints: [`Start with the known fact: ${x} × ${y} = ${x * y}.`, `${f(A)} is ${x} with ${zx} zero${zx > 1 ? 's' : ''}${B !== y ? ` and ${f(B)} is ${y} with ${zy} zero${zy > 1 ? 's' : ''}` : ''}. Count all the zeros.`, `Write ${x * y} and then add the zeros.`],
      alt: Number(String(x * y) + '0'.repeat(zx + zy)),
    };
  }
  const q = int(r, 2, 9), d = int(r, 2, 9), z = int(r, 1, 2);
  const N = q * d * 10 ** z, D = d * 10 ** (z === 2 && r() < 0.5 ? 1 : 0), answer = N / D;
  if (!Number.isInteger(answer)) return null;
  mk(m, answer * 10, 'You have one zero too many.', answer);
  mk(m, answer / 10, 'You have one zero too few.', answer);
  return {
    text: `${c.actor} knows that ${q * d} ÷ ${d} = ${q}. Use this to work out ${f(N)} ÷ ${f(D)}.`,
    answer, mistakes: m, params: { q, d, z, N, D },
    hints: [`Start with the known fact: ${q * d} ÷ ${d} = ${q}.`, `Compare ${f(N)} with ${q * d}, and ${f(D)} with ${d}. How many zeros are different?`, 'If both numbers have the same number of extra zeros, they cancel out.'],
    alt: Math.round(N / D),
  };
}),

T5('Y5-MD-06', 'MA-Y5-MD-06', (r, c, L) => {
  const d = L === 1 ? int(r, 3, 5) : int(r, 6, 9);
  const n = L === 3 ? int(r, 1200, 9899) : int(r, 120, 899);
  const q = Math.floor(n / d), rem = n % d;
  if (rem === 0) return null;
  const askRem = r() < 0.5;
  const m: Mistake[] = [];
  if (askRem) {
    mk(m, d - rem, `That is how many more are needed to make another full box. The question asks how many are left over.`, rem);
    mk(m, q, 'That is the number in each box. You need the number left over.', rem);
  } else {
    mk(m, q + 1, `Check: ${q + 1} × ${d} = ${(q + 1) * d}, which is more than ${f(n)}.`, q);
    mk(m, rem, 'That is the number left over. You need the number in each box.', q);
  }
  return {
    text: `${c.actor} shares ${f(n)} ${c.thing} equally into ${d} boxes, putting as many as possible in each box. How many ${askRem ? `${c.thing} are left over` : `${c.thing} go in each box`}?`,
    answer: askRem ? rem : q, mistakes: m, params: { n, d, askRem: askRem ? 1 : 0 },
    hints: [`Use short division: ${f(n)} ÷ ${d}.`, `Divide digit by digit from the left. Carry any remainder to the next digit.`, askRem ? 'The remainder from the last digit is the number left over.' : 'The digits you write above the line are the number in each box.'],
    alt: askRem ? n - d * Math.floor(n / d) : (n - (n % d)) / d,
  };
}),

T5('Y5-MD-07', 'MA-Y5-MD-07', (r, c, L) => {
  const mul = L === 1 ? true : L === 2 ? false : r() < 0.5;
  const dp0 = L < 3 ? 0 : pick(r, [1, 2]);
  const k = pick(r, [10, 100, 1000]);
  const lg = Math.log10(k);
  if (!mul && dp0 + lg > 3) return null;
  const mnum = L === 1 ? int(r, 2, 99) : L === 2 ? int(r, 11, 999) : int(r, 11, 999);
  if (!mul && mnum % 10 === 0) return null;
  const x = mnum / 10 ** dp0;
  const answer = dp3(mul ? x * k : x / k);
  const m: Mistake[] = [];
  if (mul) { mk(m, dp3(x * k * 10), 'One place too many. Check how many places each digit moves.', answer); mk(m, dp3(x * k / 10), 'One place too few.', answer); mk(m, dp3(x / k), 'That divides. The question multiplies.', answer); }
  else { mk(m, dp3(x / (k * 10)), 'One place too many. Check how many places each digit moves.', answer); mk(m, dp3(x / (k / 10)), 'One place too few.', answer); mk(m, dp3(x * k), 'That multiplies. The question divides.', answer); }
  return {
    text: `${c.actor} ${mul ? 'multiplies' : 'divides'} ${dp0 ? x.toFixed(dp0) : f(x)} by ${f(k)}. What is the answer?`,
    answer, mistakes: m, params: { mnum, dp0, k, mul: mul ? 1 : 0 },
    hints: [`${mul ? 'Multiplying' : 'Dividing'} by ${f(k)} moves every digit ${lg} place${lg > 1 ? 's' : ''} ${mul ? 'to the left (bigger)' : 'to the right (smaller)'}.`, 'The decimal point stays where it is. The digits move.', `Fill any gaps with zeros. Check: does your answer look ${k} times ${mul ? 'bigger' : 'smaller'}?`],
    alt: (() => { const v = mul ? (mnum * k) / 10 ** dp0 : mnum / (k * 10 ** dp0); return Number(v.toFixed(3)); })(),
  };
}),

T5('Y5-MD-08', 'MA-Y5-MD-08', (r, c, L) => {
  const m: Mistake[] = [];
  if (L === 1) {
    const n = int(r, 3, 12), answer = n * n;
    mk(m, n * 2, `${n}² means ${n} × ${n}, not ${n} × 2.`, answer); mk(m, n + n, 'The little 2 means multiply the number by itself, not add.', answer);
    return { text: `${c.actor} works out ${n}² (${n} squared). What is it?`, answer, mistakes: m, params: { n, p: 2 },
      hints: ['Squared means a number multiplied by itself.', `${n}² = ${n} × ${n}.`, `Use the ${n} times table.`], alt: Array.from({ length: n }, () => n).reduce((x, y) => x + y, 0) };
  }
  if (L === 2) {
    const n = int(r, 2, 5), answer = n * n * n;
    mk(m, n * 3, `${n}³ means ${n} × ${n} × ${n}, not ${n} × 3.`, answer); mk(m, n * n, `That is ${n}². Cubed uses ${n} three times.`, answer);
    return { text: `${c.actor} works out ${n}³ (${n} cubed). What is it?`, answer, mistakes: m, params: { n, p: 3 },
      hints: ['Cubed means a number multiplied by itself, then by itself again.', `${n}³ = ${n} × ${n} × ${n}.`, `Work out ${n} × ${n} first, then multiply by ${n}.`], alt: n ** 3 };
  }
  const a = int(r, 3, 9), b = int(r, 2, 4), answer = a * a + b * b * b;
  mk(m, a * 2 + b * 3, 'Squared is a number times itself and cubed is a number times itself twice.', answer);
  mk(m, (a + b) ** 2, 'Work out each part separately, then add.', answer);
  return { text: `${c.actor} works out ${a}² + ${b}³. What is the answer?`, answer, mistakes: m, params: { a, b },
    hints: ['Work out each part separately first.', `${a}² = ${a} × ${a} and ${b}³ = ${b} × ${b} × ${b}.`, 'Now add the two answers.'], alt: a ** 2 + b ** 3 };
}),
];
