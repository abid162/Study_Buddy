import type { Template, Draft, Level, Ctx, Mistake } from './types';
import { int, pick, f } from './rng';
import type { Rng } from './rng';

export type Build = (r: Rng, c: Ctx, L: Level) => Draft | null;
export const T = (id: string, curriculumId: string, build: Build): Template => ({
  id: `T-${id}`, curriculumId, year: 4, build,
});
export const digits = (n: number): number[] => String(n).split('').map(Number).reverse(); // ones first
export const fromDigits = (d: number[]): number => Number(d.slice().reverse().join(''));

// ---------- helpers for column methods ----------
export function columnAdd(a: number, b: number) {
  const A = digits(a), B = digits(b);
  const n = Math.max(A.length, B.length);
  let carry = 0, carries = 0;
  const out: number[] = [];
  const noCarry: number[] = [];
  const steps: string[] = [];
  for (let i = 0; i < n; i++) {
    const s = (A[i] ?? 0) + (B[i] ?? 0) + carry;
    steps.push(`${A[i] ?? 0} + ${B[i] ?? 0}${carry ? ' + 1' : ''} = ${s}`);
    out.push(s % 10);
    noCarry.push(((A[i] ?? 0) + (B[i] ?? 0)) % 10);
    carry = s >= 10 ? 1 : 0;
    carries += carry;
  }
  if (carry) out.push(1);
  return { value: fromDigits(out), carries, noCarry: fromDigits(noCarry), steps };
}
export function columnSub(a: number, b: number) {
  const A = digits(a), B = digits(b);
  let borrow = 0, borrows = 0;
  const out: number[] = [];
  const absDiff: number[] = [];
  const steps: string[] = [];
  for (let i = 0; i < A.length; i++) {
    let top = (A[i] ?? 0) - borrow;
    const bot = B[i] ?? 0;
    absDiff.push(Math.abs((A[i] ?? 0) - bot));
    if (top < bot) { top += 10; borrow = 1; borrows++; } else borrow = 0;
    steps.push(`${top}${top >= 10 ? ' (after exchanging)' : ''} − ${bot} = ${top - bot}`);
    out.push(top - bot);
  }
  return { value: fromDigits(out), borrows, absDiff: fromDigits(absDiff), steps };
}
export function roundTo(n: number, p: number): number {
  const rem = n % p;
  return rem * 2 >= p ? n - rem + p : n - rem;
}
export function mk(list: Mistake[], value: number, message: string, answer: number, allowNegative = false) {
  const v = Math.round(value * 1000) / 1000;
  if (Number.isFinite(v) && (v >= 0 || answer < 0 || allowNegative) && v !== Math.round(answer * 1000) / 1000 && !list.some(m => m.value === v)) {
    list.push({ value: v, message });
  }
}
const placeName = ['ones', 'tens', 'hundreds', 'thousands'];
const ROMAN: [number, string][] = [[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
const toRoman = (n: number) => { let s = ''; for (const [v, sym] of ROMAN) while (n >= v) { s += sym; n -= v; } return s; };
const RV: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100 };
const fromRoman = (s: string) => { let t = 0; for (let i = 0; i < s.length; i++) { const v = RV[s[i]!]!, nx = RV[s[i + 1] ?? ''] ?? 0; t += v < nx ? -v : v; } return t; };
const romanParts = (s: string) => { const p: number[] = []; for (let i = 0; i < s.length; i++) { const v = RV[s[i]!]!, nx = RV[s[i + 1] ?? ''] ?? 0; if (v < nx) { p.push(nx - v); i++; } else p.push(v); } return p; };

export const Y4_TEMPLATES: Template[] = [

// ===== PLACE VALUE =====
T('Y4-PV-01', 'MA-Y4-PV-01', (r, c, L) => {
  const step = L === 1 ? pick(r, [6, 9]) : L === 2 ? pick(r, [7, 25]) : pick(r, [1000, 6, 7, 9, 25]);
  const first = step * int(r, 1, L === 1 ? 8 : L === 2 ? 9 : 12);
  const seq = [0, 1, 2, 3].map(i => first + i * step);
  const last = seq[3]!, answer = last + step;
  const m: Mistake[] = [];
  mk(m, last + 1, `That is only 1 more than ${f(last)}. Each jump is ${f(step)}.`, answer);
  mk(m, last, `${f(last)} is the last number you were given. What comes after it?`, answer);
  mk(m, answer + step, `That is two jumps. You only need one jump of ${f(step)} from ${f(last)}.`, answer);
  return {
    text: `${c.actor} is counting in ${f(step)}s: ${seq.map(f).join(', ')}. What number comes next?`,
    answer, mistakes: m, params: { step, first },
    hints: [
      'Look at the gap between the first two numbers. Is the gap the same every time?',
      `The jump each time is ${f(step)}. Start from the last number, ${f(last)}.`,
      `Work out ${f(last)} + ${f(step)}.`,
    ],
    alt: first + 4 * step,
  };
}),

T('Y4-PV-02', 'MA-Y4-PV-02', (r, c, L) => {
  const up = L === 3 ? r() < 0.5 : r() < 0.6;
  const n = L === 1 ? int(r, 1100, 5899) : L === 2 ? int(r, 2100, 8899) : up ? int(r, 9000, 9899) : int(r, 1100, 1899);
  const answer = up ? n + 1000 : n - 1000;
  const th = Math.floor(n / 1000), rest = String(n % 1000).padStart(3, '0');
  const m: Mistake[] = [];
  mk(m, up ? n - 1000 : n + 1000, `That goes the wrong way. ${up ? 'Adding' : 'Taking away'} 1,000 should make the number ${up ? 'bigger' : 'smaller'}.`, answer);
  mk(m, up ? n + 100 : n - 100, 'You changed the hundreds digit. 1,000 changes the thousands digit.', answer);
  mk(m, up ? n + 10000 : n - 10000, 'That changed the ten-thousands. 1,000 is one thousand, not ten thousand.', answer);
  return {
    text: `A box holds ${f(n)} ${c.thing}. ${c.actor} ${up ? 'adds 1,000 more' : 'takes out 1,000'}. How many ${c.thing} are in the box now?`,
    answer, mistakes: m, params: { n, up: up ? 1 : 0 },
    hints: [
      'Which digit changes when you add or take away 1,000? Think about the thousands place.',
      answer >= 1000 ? `The last three digits (${rest}) stay exactly the same. Only the thousands change.` : 'The last three digits stay exactly the same. Only the thousands change.',
      `${th} thousands ${up ? '+' : '−'} 1 thousand = ? thousands. Then put the last three digits back.`,
    ],
    alt: n + (up ? 1 : -1) * 1000,
  };
}),

T('Y4-PV-03', 'MA-Y4-PV-03', (r, c, L) => {
  const rising = L === 3 && r() < 0.5;
  let start: number, delta: number;
  if (L === 1) { start = int(r, 2, 6); delta = start + int(r, 1, 4); }
  else if (L === 2) { start = int(r, 5, 12); delta = start + int(r, 3, 9); }
  else if (rising) { start = -int(r, 3, 9); delta = -start + int(r, 1, 6); }
  else { start = -int(r, 1, 6); delta = int(r, 2, 9); }
  const answer = rising ? start + delta : start - delta;
  const toZero = Math.abs(start);
  const m: Mistake[] = [];
  if (!rising && answer < 0) mk(m, -answer, 'You found the right size of the gap, but the temperature has gone below zero, so the number is negative.', answer, true);
  mk(m, rising ? start - delta : start + delta, rising ? 'The temperature rises, so you count up, not down.' : 'A fall means you count down, not up.', answer, true);
  if (rising) mk(m, -answer, 'You have passed zero, so you are above zero now. The answer is positive.', answer, true);
  const remaining = delta - toZero;
  return {
    text: `The thermometer at ${c.place} reads ${f(start)}°C. The temperature ${rising ? 'rises' : 'falls'} by ${f(delta)}°C. What does it read now?`,
    answer, mistakes: m, params: { start, delta, rising: rising ? 1 : 0 },
    hints: !rising && start < 0 ? [
      `Picture a number line and find ${f(start)} on it. Which way do you move?`,
      'You start below zero and the temperature falls, so you move even further below zero.',
      `${toZero} + ${f(delta)} = ${toZero + delta}, and that many steps are below zero.`,
    ] : [
      `Picture a number line and find ${f(start)} on it. Which way do you move?`,
      `It takes ${toZero} ${toZero === 1 ? 'step' : 'steps'} to get from ${f(start)} to 0. How many steps are left after that?`,
      `${f(delta)} − ${toZero} = ${remaining} ${remaining === 1 ? 'step' : 'steps'} left ${rising ? 'above' : 'below'} zero.`,
    ],
    alt: rising ? -Math.abs(start) + delta : start - delta,
  };
}),

T('Y4-PV-04', 'MA-Y4-PV-04', (r, c, L) => {
  const ds: number[] = [];
  const pool = L === 3 ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : [1, 2, 3, 4, 5, 6, 7, 8, 9];
  while (ds.length < 4) { const d = pick(r, pool); if (!ds.includes(d)) ds.push(d); }
  if (ds[0] === 0) return null;
  const n = Number(ds.join(''));
  const ks = (L === 1 ? [3, 2] : [3, 2, 1, 0]).filter(k => ds[3 - k] !== 0);
  const k = pick(r, ks);
  const d = ds[3 - k]!;
  const answer = d * 10 ** k;
  const m: Mistake[] = [];
  mk(m, d, `${d} is the digit, but the question asks for its value. A digit in the ${placeName[k]} place is worth more.`, answer);
  mk(m, d * 10 ** (k + 1), `That would be the value if the ${d} were one place further left.`, answer);
  if (k > 0) mk(m, d * 10 ** (k - 1), `That would be the value if the ${d} were one place further right.`, answer);
  return {
    text: `${c.actor} writes the number ${f(n)}. What is the value of the digit ${d}?`,
    answer, mistakes: m, params: { n, d },
    hints: [
      'Say the places out loud from the right: ones, tens, hundreds, thousands.',
      `Find the ${d} in ${f(n)}. Which place is it in?`,
      `The ${d} is in the ${placeName[k]} place, so its value is ${d} × ${f(10 ** k)}.`,
    ],
    alt: Number(String(n)[3 - k]) * Math.pow(10, k),
  };
}),

T('Y4-PV-05', 'MA-Y4-PV-05', (r, c, L) => {
  const nums: number[] = [];
  const thou = int(r, 1, 8) * 1000;
  for (let tries = 0; nums.length < 3 && tries < 200; tries++) {
    const x = L === 3 ? thou + int(r, 0, 99) * 10 : L === 1 ? int(r, 1000, 9899) : thou + int(r, 0, 999);
    if (!nums.includes(x)) nums.push(x);
  }
  if (nums.length < 3) return null;
  const biggest = L !== 2;
  const answer = biggest ? Math.max(...nums) : Math.min(...nums);
  const m: Mistake[] = [];
  for (const x of nums) mk(m, x, `${f(x)} is not the ${biggest ? 'largest' : 'smallest'}. Compare the thousands first, then the hundreds, then the tens.`, answer);
  return {
    text: `${c.actor} counts three piles of ${c.thing}: ${nums.map(f).join(', ')}. Which pile has the ${biggest ? 'most' : 'fewest'}?`,
    answer, mistakes: m, params: { a: nums[0]!, b: nums[1]!, c: nums[2]!, biggest: biggest ? 1 : 0 },
    hints: [
      'Compare digits starting from the left, the biggest place first.',
      'If the thousands digits match, look at the hundreds. Keep going until the digits are different.',
      `Which number has the ${biggest ? 'biggest' : 'smallest'} digit in the first place where the numbers differ?`,
    ],
    alt: [...nums].sort((x, y) => (biggest ? y - x : x - y))[0]!,
  };
}),

T('Y4-PV-07', 'MA-Y4-PV-07', (r, c, L) => {
  const p = L === 1 ? 10 : L === 2 ? pick(r, [10, 100]) : pick(r, [10, 100, 1000]);
  const tie = L === 3 && r() < 0.4;
  let n = L === 1 ? int(r, 12, 998) : int(r, 120, 9998);
  if (tie) n = Math.floor(n / p) * p + p / 2; else if (n % p === p / 2) n += 1;
  if (n < p || n % p === 0) return null;
  const answer = Math.floor((n + p / 2) / p) * p;
  const pn = p === 10 ? 'tens' : p === 100 ? 'hundreds' : 'thousands';
  const m: Mistake[] = [];
  mk(m, Math.floor(n / p) * p, `You rounded down. Look at the digit to the right of the ${pn} place: 5 or more rounds up.`, answer);
  mk(m, Math.ceil(n / p) * p, `You rounded up. Look at the digit to the right of the ${pn} place: 4 or less rounds down.`, answer);
  if (p > 10) mk(m, roundTo(n, 10), `That is rounded to the nearest 10. The question asks for the nearest ${f(p)}.`, answer);
  const above = (Math.floor(n / p) + 1) * p, below = Math.floor(n / p) * p;
  return {
    text: `${c.actor} counts ${f(n)} ${c.thing} in a store and rounds the number to the nearest ${f(p)}. What is the rounded number?`,
    answer, mistakes: m, params: { n, p },
    hints: [
      `Find the ${pn} digit, then look at the digit just to its right.`,
      'If that digit is 5 or more, round up. If it is 4 or less, round down.',
      `${f(n)} is between ${f(below)} and ${f(above)}. Which is it closer to? (Exactly halfway rounds up.)`,
    ],
    alt: (() => { const rem = n % p; return rem * 2 >= p ? n - rem + p : n - rem; })(),
  };
}),

T('Y4-PV-09', 'MA-Y4-PV-09', (r, c, L) => {
  let n = 0, R = '';
  for (let i = 0; i < 60; i++) {
    n = int(r, 1, L === 1 ? 39 : L === 2 ? 59 : 100);
    R = toRoman(n);
    const sub = /IV|IX|XL|XC/.test(R);
    if (R.length === 1 || R.length === n) continue;
    if (L === 1 ? !sub : L === 3 ? sub : true) break;
    if (i === 59) return null;
  }
  if (R.length === 1 || R.length === n || (L === 1 && /IV|IX|XL|XC/.test(R)) || (L === 3 && !/IV|IX|XL|XC/.test(R))) return null;
  const answer = fromRoman(R);
  const naive = [...R].reduce((t, ch) => t + RV[ch]!, 0);
  const m: Mistake[] = [];
  mk(m, naive, 'A smaller symbol in front of a bigger one is subtracted, not added.', answer);
  mk(m, R.length, 'That counts the symbols. Each symbol has its own value.', answer);
  const parts = romanParts(R);
  return {
    text: `${c.actor} sees the number ${R} written in Roman numerals. What number is it?`,
    answer, mistakes: m, params: { R },
    hints: [
      'Remember: I = 1, V = 5, X = 10, L = 50, C = 100.',
      'If a smaller symbol comes before a bigger one, subtract it. Otherwise add.',
      `Split it into parts: ${parts.join(' + ')}. Now add them up.`,
    ],
    alt: n,
  };
}),

// ===== ADDITION AND SUBTRACTION =====
T('Y4-AS-01-add', 'MA-Y4-AS-01', (r, c, L) => {
  for (let i = 0; i < 200; i++) {
    const a = int(r, 1000, 8999), b = int(r, 1000, 8999);
    if (a + b > 9999) continue;
    const cs = columnAdd(a, b);
    if (L === 1 ? cs.carries !== 0 : L === 2 ? cs.carries !== 1 : cs.carries < 2) continue;
    const m: Mistake[] = [];
    mk(m, cs.noCarry, 'It looks like a carry was missed. When a column makes 10 or more, carry the 10 into the next column.', cs.value);
    mk(m, Math.abs(a - b), 'That subtracts. "Altogether" means add.', cs.value);
    const A = digits(a), B = digits(b);
    return {
      text: `${f(a)} ${c.crowd} came to ${c.place} on Saturday and ${f(b)} came on Sunday. How many came altogether?`,
      answer: cs.value, mistakes: m, params: { a, b },
      hints: [
        'Line the numbers up so ones are under ones. Start with the ones column.',
        'Add each column from right to left. If a column makes 10 or more, carry the 10 to the next column.',
        `Ones: ${cs.steps[0]}. Tens: ${cs.steps[1]}. Now do hundreds and thousands.`,
      ],
      alt: a + b + 0 * (A.length + B.length),
    };
  }
  return null;
}),

T('Y4-AS-01-sub', 'MA-Y4-AS-01', (r, c, L) => {
  for (let i = 0; i < 300; i++) {
    const a = int(r, 2000, 9999), b = int(r, 1000, a - 100);
    const cs = columnSub(a, b);
    if (L === 1 ? cs.borrows !== 0 : L === 2 ? cs.borrows !== 1 : cs.borrows < 2) continue;
    const m: Mistake[] = [];
    mk(m, cs.absDiff, 'It looks like the smaller digit was taken from the bigger one in each column. Exchange from the next column instead.', cs.value);
    mk(m, a + b, 'That adds. "Left early" means take away.', cs.value);
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

T('Y4-AS-02-inverse', 'MA-Y4-AS-02', (r, c, L) => {
  const x = L === 1 ? int(r, 120, 780) : int(r, 1200, 7800);   // the number thought of
  const b = L === 1 ? int(r, 120, 780) : int(r, 1200, 7800);
  const m: Mistake[] = [];
  if (L < 3) {
    const sum = x + b;
    mk(m, sum + b, 'To undo an addition you subtract, not add again.', x);
    return {
      text: `${c.actor} thinks of a number and adds ${f(b)}. The result is ${f(sum)}. What was the starting number?`,
      answer: x, mistakes: m, params: { x, b },
      hints: [
        'Work backwards. Which operation undoes adding?',
        `Adding ${f(b)} is undone by taking ${f(b)} away.`,
        `Work out ${f(sum)} − ${f(b)}.`,
      ],
      alt: sum - b,
    };
  }
  if (x <= b) return null;
  const diff = x - b;
  mk(m, diff - b > 0 ? diff - b : x + b, 'To undo a subtraction you add the amount back.', x);
  return {
    text: `${c.actor} thinks of a number and takes away ${f(b)}. The result is ${f(diff)}. What was the starting number?`,
    answer: x, mistakes: m, params: { x, b },
    hints: [
      'Work backwards. Which operation undoes taking away?',
      `Taking away ${f(b)} is undone by adding ${f(b)} back.`,
      `Work out ${f(diff)} + ${f(b)}.`,
    ],
    alt: diff + b,
  };
}),

T('Y4-AS-02-estimate', 'MA-Y4-AS-02', (r, c, L) => {
  const p = L === 3 ? 1000 : 100;
  const a = L === 1 ? int(r, 120, 980) : int(r, 1200, 8800);
  const b = L === 1 ? int(r, 120, 980) : int(r, 1200, 8800);
  if (a % p === p / 2 || b % p === p / 2) return null;
  const sub = L === 3;
  const [x, y] = sub ? [Math.max(a, b), Math.min(a, b)] : [a, b];
  const answer = roundTo(x, p) + (sub ? -1 : 1) * roundTo(y, p);
  if ((sub && answer <= 0) || answer === p) return null;
  const exact = sub ? x - y : x + y;
  const m: Mistake[] = [];
  mk(m, exact, 'That is the exact answer. An estimate uses the rounded numbers.', answer);
  mk(m, roundTo(x, p) + (sub ? -1 : 1) * y, `Round both numbers to the nearest ${f(p)}, not just one.`, answer);
  return {
    text: `${c.actor} estimates ${f(x)} ${sub ? '−' : '+'} ${f(y)} by rounding each number to the nearest ${f(p)}. What is the estimate?`,
    answer, mistakes: m, params: { x, y, p, sub: sub ? 1 : 0 },
    hints: [
      `Round each number to the nearest ${f(p)} first.`,
      `${f(x)} rounds to ${f(roundTo(x, p))}. What does ${f(y)} round to?`,
      `Now ${sub ? 'subtract' : 'add'} the two rounded numbers.`,
    ],
    alt: (() => { const rr = (n: number) => Math.round(n / p) * p; return rr(x) + (sub ? -1 : 1) * rr(y); })(),
  };
}),

T('Y4-AS-03', 'MA-Y4-AS-03', (r, c, L) => {
  const m: Mistake[] = [];
  if (L === 1) {
    const s = int(r, 120, 480), a = int(r, 40, 190), b = int(r, 30, s + a - 20);
    const answer = s + a - b;
    mk(m, s + a + b, `Giving ${f(b)} away means taking them off, not adding.`, answer);
    mk(m, s - a - b, `Finding ${f(a)} more means adding them on.`, answer);
    return { text: `${c.actor} has ${f(s)} ${c.thing}, finds ${f(a)} more, then gives ${f(b)} away. How many ${c.thing} are there now?`,
      answer, mistakes: m, params: { s, a, b }, alt: s + a - b,
      hints: ['There are two steps. Read the story one sentence at a time.', `Step 1: finding more means add. Step 2: giving away means subtract.`, `Work out ${f(s)} + ${f(a)} first, then take away ${f(b)}.`] };
  }
  if (L === 2) {
    const s = int(r, 400, 900), a = int(r, 60, 250), b = int(r, 60, 250);
    const answer = s - a - b;
    mk(m, s - a, `That only takes away the first amount. ${f(b)} also go to another friend.`, answer);
    mk(m, s - a + b, `Giving ${f(b)} away means subtract it.`, answer);
    return { text: `${c.actor} has ${f(s)} ${c.thing}. After giving ${f(a)} to one friend and ${f(b)} to another, how many ${c.thing} are left?`,
      answer, mistakes: m, params: { s, a, b }, alt: s - (a + b),
      hints: ['There are two amounts given away. You need to use both.', 'Take away the first amount, then take away the second. Or add them first and take away once.', `Work out ${f(s)} − ${f(a)}, then subtract ${f(b)} from that.`] };
  }
  const s = int(r, 2500, 6500), a = int(r, 400, 1800), b = int(r, 300, 1500);
  const answer = s - a + b;
  mk(m, s - a - b, `A box of ${f(b)} arriving means they are added.`, answer);
  mk(m, s + a + b, `Giving ${f(a)} away means they are taken off.`, answer);
  return { text: `${c.actor} has ${f(s)} ${c.thing} and gives ${f(a)} away. Then a box of ${f(b)} ${c.thing} arrives. How many ${c.thing} are there now?`,
    answer, mistakes: m, params: { s, a, b }, alt: s + b - a,
    hints: ['Decide for each sentence: add or subtract?', 'Giving away: subtract. A box arriving: add.', `Work out ${f(s)} − ${f(a)} first, then add ${f(b)}.`] };
}),

// ===== MULTIPLICATION AND DIVISION =====
T('Y4-MD-01-mul', 'MA-Y4-MD-01', (r, c, L) => {
  const ks = L === 1 ? [2, 3, 4, 5, 10] : L === 2 ? [6, 7, 8, 9] : [6, 7, 8, 9, 11, 12];
  const k = pick(r, ks), rows = int(r, 2, L === 3 ? 12 : 10);
  const answer = rows * k;
  const m: Mistake[] = [];
  mk(m, rows + k, 'That is adding the two numbers. Rows of equal size means multiply.', answer);
  mk(m, answer + k, `Close. That is one row too many: ${rows + 1} rows, not ${rows}.`, answer);
  mk(m, answer - k, `Close. That is one row too few: ${rows - 1} rows, not ${rows}.`, answer);
  return {
    text: `${c.actor} lines up ${c.thing} in ${rows} rows of ${k}. How many ${c.thing} are there altogether?`,
    answer, mistakes: m, params: { rows, k },
    hints: [
      'Equal rows means you can multiply.',
      `${rows} rows of ${k} is ${rows} × ${k}. You can also think of it as ${k} × ${rows}.`,
      `Count up in ${k}s, ${rows} times.`,
    ],
    alt: Array.from({ length: rows }, () => k).reduce((x, y) => x + y, 0),
  };
}),

T('Y4-MD-01-div', 'MA-Y4-MD-01', (r, c, L) => {
  const ks = L === 1 ? [2, 3, 4, 5, 10] : L === 2 ? [6, 7, 8, 9] : [6, 7, 8, 9, 11, 12];
  const k = pick(r, ks), q = int(r, 3, L === 3 ? 12 : 10);
  const total = q * k;
  const m: Mistake[] = [];
  mk(m, total - k, 'That is subtracting. Sharing equally means dividing.', q);
  mk(m, q + 1, `Check by multiplying back: ${q + 1} × ${k} = ${(q + 1) * k}, not ${total}.`, q);
  mk(m, q - 1, `Check by multiplying back: ${q - 1} × ${k} = ${(q - 1) * k}, not ${total}.`, q);
  return {
    text: `${c.actor} shares ${total} ${c.thing} equally between ${k} bags. How many ${c.thing} go in each bag?`,
    answer: q, mistakes: m, params: { total, k },
    hints: [
      'Sharing equally means dividing.',
      `Ask yourself: ${k} times what number makes ${total}?`,
      `Use the ${k} times table. ${k} × ? = ${total}.`,
    ],
    alt: total / k,
  };
}),

T('Y4-MD-02', 'MA-Y4-MD-02', (r, c, L) => {
  const hi = L === 1 ? 4 : L === 2 ? 6 : 9;
  const a = int(r, 2, hi), b = int(r, 2, hi), k = int(r, 2, L === 1 ? 3 : hi);
  const answer = a * b * k;
  const m: Mistake[] = [];
  mk(m, a * b, `That only multiplies the first two numbers. There is a third number, ${k}.`, answer);
  mk(m, a * b + k, `After ${a} × ${b}, multiply by ${k}. Do not add it.`, answer);
  mk(m, a + b + k, 'That is adding. Equal groups inside equal groups means multiply.', answer);
  return {
    text: `There are ${a} boxes. Each box holds ${b} packs. Each pack has ${k} ${c.thing}. How many ${c.thing} are there altogether?`,
    answer, mistakes: m, params: { a, b, k },
    hints: [
      'There are three numbers to multiply together.',
      `Do two of them first. Pick the pair that is easiest, for example ${a} × ${b}.`,
      `Work out ${a} × ${b} = ${a * b}. Then multiply that by ${k}.`,
    ],
    alt: a * (b * k),
  };
}),

T('Y4-MD-03', 'MA-Y4-MD-03', (r, c, L) => {
  const hi = L === 1 ? 6 : L === 2 ? 9 : 12;
  const a = int(r, 2, hi), b = int(r, 2, hi);
  if (a === b) return null;
  const n = a * b;
  const m: Mistake[] = [];
  mk(m, n - a, 'That is subtracting. You need the number that multiplies with the first side to make the total.', b);
  mk(m, a, `${a} is the side you were told. Find the other side.`, b);
  mk(m, b + 1, `Check: ${a} × ${b + 1} = ${a * (b + 1)}, not ${n}.`, b);
  mk(m, b - 1, `Check: ${a} × ${b - 1} = ${a * (b - 1)}, not ${n}.`, b);
  return {
    text: `${c.actor} arranges ${n} ${c.thing} in a perfect rectangle. One side has ${a} ${c.thing}. How many ${c.thing} are on the other side?`,
    answer: b, mistakes: m, params: { n, a },
    hints: [
      'A rectangle of items has a number of rows and a number in each row. Rows × each row = total.',
      `You need a factor pair of ${n}: ${a} × ? = ${n}.`,
      `Use the ${a} times table, or divide ${n} by ${a}.`,
    ],
    alt: n / a,
  };
}),

T('Y4-MD-04', 'MA-Y4-MD-04', (r, c, L) => {
  for (let i = 0; i < 300; i++) {
    const b = L === 1 ? int(r, 2, 4) : int(r, 3, 9);
    const a = L === 3 ? int(r, 120, 999) : int(r, 12, 99);
    const A = digits(a);
    const carries = A.filter(d => d * b >= 10).length;
    if (L === 1 ? carries !== 0 : carries < 1) continue;
    let carry = 0; const out: number[] = []; const steps: string[] = [];
    const noCarry: number[] = [];
    for (const d of A) {
      const p = d * b + carry;
      steps.push(`${d} × ${b}${carry ? ` + ${carry}` : ''} = ${p}`);
      out.push(p % 10); carry = Math.floor(p / 10);
      noCarry.push((d * b) % 10);
    }
    if (carry) out.push(carry);
    const answer = fromDigits(out);
    const m: Mistake[] = [];
    mk(m, fromDigits(noCarry), 'It looks like the carried digit was left out. Add the carry to the next column.', answer);
    mk(m, a + b, 'That adds. The same number in each of the crates means multiply.', answer);
    return {
      text: `${c.actor} packs ${f(a)} ${c.thing} into each of ${b} crates. How many ${c.thing} are packed altogether?`,
      answer, mistakes: m, params: { a, b },
      hints: [
        `Write ${f(a)} × ${b} in columns and start with the ones.`,
        'Multiply each digit by the number below. If the answer is 10 or more, write the ones digit and carry the tens.',
        `Ones: ${steps[0]}. Tens: ${steps[1]}.${steps[2] ? ` Hundreds: ${steps[2]}.` : ''}`,
      ],
      alt: a * b,
    };
  }
  return null;
}),

// ===== FRACTIONS =====
T('Y4-FR-01', 'MA-Y4-FR-01', (r, c, L) => {
  const bs = L === 1 ? [2, 3, 4, 5] : [2, 3, 4, 5, 6, 10];
  const b = pick(r, bs), a = int(r, 1, b - 1);
  const k = L === 1 ? pick(r, [2, 3]) : L === 2 ? int(r, 2, 5) : int(r, 4, 10);
  const cden = b * k, answer = a * k;
  const m: Mistake[] = [];
  mk(m, a + (cden - b), `That adds ${cden - b} to the top. For equivalent fractions you multiply top and bottom by the same number.`, answer);
  mk(m, a, 'The top number has to change too, because the bottom number changed.', answer);
  mk(m, cden, 'That is the new bottom number. The question asks for the top number.', answer);
  return {
    text: `${c.actor} says ${a}/${b} is the same amount as ?/${cden}. What number goes in place of the ?`,
    answer, mistakes: m, params: { a, b, k },
    hints: [
      'Equivalent fractions are worth the same. Compare the bottom numbers first.',
      `The bottom number went from ${b} to ${cden}. What did you multiply ${b} by?`,
      `You multiplied the bottom by ${k}, so multiply the top, ${a}, by ${k} too.`,
    ],
    alt: (a * cden) / b,
  };
}),

T('Y4-FR-02', 'MA-Y4-FR-02', (r, c, L) => {
  const m: Mistake[] = [];
  if (L < 3) {
    const n = L === 1 ? int(r, 2, 12) : int(r, 3, 24);
    const answer = n * 10;
    mk(m, n, 'That is the number of tenths. Each tenth is split into 10 hundredths.', answer);
    mk(m, n * 100, 'That is too many. Each tenth makes 10 hundredths, not 100.', answer);
    mk(m, n + 10, 'You added 10. Each tenth becomes 10 hundredths, so multiply by 10.', answer);
    return {
      text: `${c.actor} cuts a strip into 10 equal tenths, then cuts every tenth into 10 equal hundredths. How many hundredths are in ${n} tenths?`,
      answer, mistakes: m, params: { n },
      hints: ['Start with one tenth. How many hundredths is it?', `1 tenth = 10 hundredths. So ${n} tenths = ${n} lots of 10 hundredths.`, `Work out ${n} × 10.`],
      alt: n * 10,
    };
  }
  const a = int(r, 1, 9), b = int(r, 1, 9);
  const answer = a * 10 + b;
  mk(m, a + b, 'That adds the digits. A tenth is worth 10 hundredths.', answer);
  mk(m, a * 100 + b, `${a} tenths is ${a * 10} hundredths, not ${a * 100}.`, answer);
  return {
    text: `${c.actor} has ${a} ${a === 1 ? 'tenth' : 'tenths'} and ${b} ${b === 1 ? 'hundredth' : 'hundredths'} of a strip. How many hundredths is that altogether?`,
    answer, mistakes: m, params: { a, b },
    hints: ['Change the tenths into hundredths first.', `1 tenth = 10 hundredths, so ${a} ${a === 1 ? 'tenth' : 'tenths'} = ${a * 10} hundredths.`, `Now add the ${b} ${b === 1 ? 'hundredth' : 'hundredths'}.`],
    alt: a * 10 + b,
  };
}),

T('Y4-FR-03', 'MA-Y4-FR-03', (r, c, L) => {
  const den = L === 1 ? pick(r, [2, 3, 4, 5, 10]) : pick(r, [3, 4, 5, 10]);
  const num = L === 1 ? 1 : int(r, 2, den - 1);
  const q = L === 3 ? int(r, 6, 12) : int(r, 2, 10);
  const total = den * q, answer = num * q;
  const m: Mistake[] = [];
  if (num > 1) mk(m, q, `${q} is one ${den === 2 ? 'half' : `of the ${den} equal groups`}. You need ${num} of them.`, answer);
  mk(m, num, `${num} is the top number of the fraction. Work out the fraction of ${total}.`, answer);
  mk(m, total - answer, `That is what is left over. The question asks for the ${num}/${den} part.`, answer);
  return {
    text: `${c.actor} has ${total} ${c.thing} and gives ${num}/${den} of them to the ${c.crowd}. How many ${c.thing} are given away?`,
    answer, mistakes: m, params: { total, num, den },
    hints: [
      `The bottom number, ${den}, tells you how many equal groups to make.`,
      `Share ${total} into ${den} equal groups. How many are in one group?`,
      num === 1 ? `One group is ${q}. That is your answer.` : `One group is ${q}. You need ${num} groups, so work out ${num} × ${q}.`,
    ],
    alt: (total * num) / den,
  };
}),

T('Y4-FR-04', 'MA-Y4-FR-04', (r, c, L) => {
  const d = pick(r, L === 1 ? [4, 5, 6, 8] : [5, 6, 8, 10, 12]);
  const sub = L >= 2 && r() < 0.5;
  let x: number, y: number;
  if (sub) { x = int(r, 3, d - 1); y = int(r, 1, x - 1); } else { x = int(r, 1, d - 2); y = int(r, 1, d - x - (L === 1 ? 1 : 0)); }
  const answer = sub ? x - y : x + y;
  if (answer < 1 || answer > d) return null;
  const m: Mistake[] = [];
  mk(m, sub ? x + y : Math.abs(x - y), sub ? 'You added. This is a subtraction.' : 'You subtracted. This is an addition.', answer);
  mk(m, d, 'The bottom number stays the same. The question asks for the new top number.', answer);
  mk(m, x * y, 'Add or subtract the top numbers. Do not multiply them.', answer);
  return {
    text: `${c.actor} works out ${x}/${d} ${sub ? '−' : '+'} ${y}/${d} = ?/${d}. What number goes in place of the ?`,
    answer, mistakes: m, params: { x, y, d, sub: sub ? 1 : 0 },
    hints: [
      `Both fractions have the same bottom number, ${d}. That means the pieces are the same size.`,
      `Just ${sub ? 'take away' : 'add'} the top numbers. The bottom number does not change.`,
      `Work out ${x} ${sub ? '−' : '+'} ${y}.`,
    ],
    alt: sub ? x - y : x + y,
  };
}),

// ===== MEASUREMENT =====
T('Y4-ME-01', 'MA-Y4-ME-01', (r, c, L) => {
  const kind = L === 1 ? pick(r, ['m-cm', 'kg-g']) : L === 2 ? pick(r, ['km-m', 'l-ml', 'm-cm']) : pick(r, ['m-km', 'g-kg', 'cm-m']);
  const [from, to, fac, rev] = ({
    'm-cm': ['m', 'cm', 100, false], 'kg-g': ['kg', 'g', 1000, false], 'km-m': ['km', 'm', 1000, false],
    'l-ml': ['litres', 'ml', 1000, false], 'm-km': ['m', 'km', 1000, true], 'g-kg': ['g', 'kg', 1000, true], 'cm-m': ['cm', 'm', 100, true],
  } as Record<string, [string, string, number, boolean]>)[kind]!;
  const n = int(r, 2, 9);
  const answer = rev ? n : n * fac;
  const shown = rev ? n * fac : n;
  const m: Mistake[] = [];
  mk(m, rev ? shown * fac : shown * (fac === 100 ? 10 : 100), `Check the conversion: 1 ${rev ? to : from} = ${fac} ${rev ? from : to}.`, answer);
  mk(m, rev ? shown : shown + fac, rev ? `You need to divide by ${fac}.` : 'Converting to a smaller unit means multiplying, not adding.', answer);
  return {
    text: `${c.actor} measures ${f(shown)} ${from}. How many ${to} is that?`,
    answer, mistakes: m, params: { kind, n },
    hints: [
      `How many ${rev ? from : to} are in 1 ${rev ? to : from}?`,
      `1 ${rev ? to : from} = ${f(fac)} ${rev ? from : to}. ${rev ? 'Going to a bigger unit, so divide' : 'Going to a smaller unit, so multiply'} by ${f(fac)}.`,
      rev ? `Work out ${f(shown)} ÷ ${f(fac)}.` : `Work out ${f(shown)} × ${f(fac)}.`,
    ],
    alt: rev ? shown / fac : shown * fac,
  };
}),

T('Y4-ME-02', 'MA-Y4-ME-02', (r, c, L) => {
  const sq = L === 1 && r() < 0.5;
  const l = int(r, 3, L === 3 ? 25 : 12), w = sq ? l : int(r, 2, l - 1);
  const answer = sq ? 4 * l : 2 * (l + w);
  const m: Mistake[] = [];
  if (!sq) {
    mk(m, l + w, `That is only two sides. A rectangle has four sides: ${l}, ${w}, ${l}, ${w}.`, answer);
    mk(m, l * w, 'That is the area (inside the shape). Perimeter is the distance around the edge.', answer);
    mk(m, 2 * l + w, 'Add all four sides. Opposite sides are the same length.', answer);
  } else {
    mk(m, l * l, 'That is the area. Perimeter is the distance around the edge.', answer);
    mk(m, 2 * l, 'A square has four equal sides, not two.', answer);
  }
  return {
    text: sq
      ? `${c.actor}'s square banner has sides of ${l} m. How far is it around the whole edge, in metres?`
      : `${c.actor}'s rectangular banner is ${l} m long and ${w} m wide. How far is it around the whole edge, in metres?`,
    answer, mistakes: m, params: { l, w, sq: sq ? 1 : 0 },
    hints: [
      'Perimeter is the distance all the way around the outside.',
      sq ? 'A square has 4 equal sides.' : 'A rectangle has 2 long sides and 2 short sides.',
      sq ? `Work out ${l} + ${l} + ${l} + ${l}.` : `Add ${l} + ${w} + ${l} + ${w}.`,
    ],
    alt: sq ? l + l + l + l : l + w + l + w,
  };
}),

T('Y4-ME-04', 'MA-Y4-ME-04', (r, c, L) => {
  const m: Mistake[] = [];
  if (L < 3) {
    const p = int(r, 2, L === 1 ? 6 : 9), k = int(r, 2, 5);
    const spend = p * k;
    const pay = [10, 20, 50].find(x => x > spend)!;
    const answer = pay - spend;
    mk(m, spend, 'That is how much was spent. The question asks for the change.', answer);
    mk(m, pay - p, `That is the change for just one. ${k} were bought.`, answer);
    return {
      text: `${c.thing[0]!.toUpperCase()}${c.thing.slice(1)} cost £${p} each. ${c.actor} buys ${k} and pays with a £${pay} note. How much change is there, in pounds?`,
      answer, mistakes: m, params: { p, k, pay },
      hints: ['There are two steps: find the total cost, then find the change.', `Total cost: ${k} × £${p}. Change: £${pay} take away the total.`, `Work out ${k} × ${p} = ${spend}, then ${pay} − ${spend}.`],
      alt: pay - k * p,
    };
  }
  const p1 = int(r, 3, 9), k1 = int(r, 2, 6), p2 = int(r, 2, 8), k2 = int(r, 2, 5);
  const spend = p1 * k1 + p2 * k2;
  const pay = [50, 100].find(x => x > spend)!;
  const answer = pay - spend;
  mk(m, spend, 'That is how much was spent. The question asks for the change.', answer);
  mk(m, pay - p1 * k1, `That forgets the ${c.thing2}.`, answer);
  mk(m, pay - p2 * k2, `That forgets the ${c.thing}.`, answer);
  return {
    text: `${c.actor} buys ${k1} ${c.thing} at £${p1} each and ${k2} ${c.thing2} at £${p2} each. ${c.actor} pays with £${pay}. How much change is there, in pounds?`,
    answer, mistakes: m, params: { p1, k1, p2, k2, pay },
    hints: ['Find the cost of each kind of item first.', `${k1} × £${p1} and ${k2} × £${p2}. Add them to get the total spent.`, `Total spent = ${p1 * k1} + ${p2 * k2} = ${spend}. Then work out ${pay} − ${spend}.`],
    alt: pay - p1 * k1 - p2 * k2,
  };
}),

T('Y4-ME-06', 'MA-Y4-ME-06', (r, c, L) => {
  const m: Mistake[] = [];
  if (L === 3) {
    const h = int(r, 1, 4), mi = pick(r, [10, 15, 20, 30, 45]);
    const answer = h * 60 + mi;
    mk(m, h + mi, 'That adds the hours and minutes. Change the hours into minutes first.', answer);
    mk(m, h * 100 + mi, 'There are 60 minutes in an hour, not 100.', answer);
    return {
      text: `${c.actor} trains for ${h} ${h === 1 ? 'hour' : 'hours'} and ${mi} minutes. How many minutes is that altogether?`,
      answer, mistakes: m, params: { h, mi },
      hints: ['Change the hours into minutes first.', `1 hour = 60 minutes, so ${h} ${h === 1 ? 'hour' : 'hours'} = ${h} × 60 minutes.`, `Work out ${h} × 60 = ${h * 60}, then add ${mi}.`],
      alt: h * 60 + mi,
    };
  }
  const kinds = L === 1 ? [['weeks', 'days', 7], ['years', 'months', 12]] as const : [['hours', 'minutes', 60], ['minutes', 'seconds', 60]] as const;
  const [from, to, fac] = pick(r, kinds as readonly (readonly [string, string, number])[]);
  const n = int(r, 2, 9);
  const answer = n * fac;
  mk(m, n + fac, 'Converting to a smaller unit means multiplying, not adding.', answer);
  mk(m, n * 10, `There are ${fac} ${to} in 1 ${from.slice(0, -1)}, not 10.`, answer);
  return {
    text: `${c.actor}'s challenge lasts ${n} ${from}. How many ${to} is that?`,
    answer, mistakes: m, params: { from, n },
    hints: [`How many ${to} are in 1 ${from.slice(0, -1)}?`, `1 ${from.slice(0, -1)} = ${fac} ${to}. You have ${n} of them.`, `Work out ${n} × ${fac}.`],
    alt: n * fac,
  };
}),
];
