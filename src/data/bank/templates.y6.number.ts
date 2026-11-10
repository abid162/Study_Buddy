import type { Template, Mistake } from './types';
import { int, pick, f, fd } from './rng';
import { mk, roundTo } from './templates.y4';
import { TY, gcd, lcm, divisors, dp3, onlyLevels } from './helpers';

const T6 = TY(6);
const sf1 = (n: number) => { const p = 10 ** (String(n).length - 1); return Math.round(n / p) * p; };
const tie1 = (n: number) => { const p = 10 ** (String(n).length - 1); return (n % p) * 2 === p; };

export const Y6_NUMBER: Template[] = [

// ===== PLACE VALUE =====
T6('Y6-PV-01', 'MA-Y6-PV-01', (r, c, L) => {
  const formA = L === 1 ? true : L === 2 ? false : r() < 0.5;
  const m: Mistake[] = [];
  if (formA) {
    const nums: number[] = [];
    const stem = int(r, 100, 899) * 10000;
    for (let t = 0; nums.length < 3 && t < 200; t++) {
      const x = L === 1 ? int(r, 1000000, 9999999) : stem + int(r, 0, 9999);
      if (!nums.includes(x)) nums.push(x);
    }
    if (nums.length < 3) return null;
    const biggest = r() < 0.7;
    const answer = biggest ? Math.max(...nums) : Math.min(...nums);
    for (const x of nums) mk(m, x, `${f(x)} is not the ${biggest ? 'largest' : 'smallest'}. Compare the digits from the left, one place at a time.`, answer);
    return {
      text: `${c.actor} writes down three totals of ${c.thing}: ${nums.map(f).join(', ')}. Which is the ${biggest ? 'largest' : 'smallest'} total?`,
      answer, mistakes: m, params: { a: nums[0]!, b: nums[1]!, c: nums[2]!, biggest: biggest ? 1 : 0 },
      hints: ['All the numbers have 7 digits, so compare from the left.', 'Compare the millions, then the hundred-thousands, then the ten-thousands, and so on.', `Which number has the ${biggest ? 'biggest' : 'smallest'} digit in the first place where they differ?`],
      alt: [...nums].sort((x, y) => (biggest ? y - x : x - y))[0]!,
    };
  }
  const ds: number[] = [];
  while (ds.length < 7) { const d = pick(r, [1, 2, 3, 4, 5, 6, 7, 8, 9]); if (!ds.includes(d)) ds.push(d); }
  const n = Number(ds.join('')), k = int(r, 1, 6), d = ds[6 - k]!;
  const names = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands', 'hundred-thousands', 'millions'];
  const answer = d * 10 ** k;
  mk(m, d, `${d} is the digit, but the question asks for its value.`, answer);
  mk(m, d * 10 ** (k + 1), `That would be the value if the ${d} were one place to the left.`, answer);
  mk(m, d * 10 ** (k - 1), `That would be the value if the ${d} were one place to the right.`, answer);
  return {
    text: `${c.actor} writes the number ${f(n)}. What is the value of the digit ${d}?`,
    answer, mistakes: m, params: { n, d },
    hints: ['Say the places from the right: ones, tens, hundreds, thousands, ten-thousands, hundred-thousands, millions.', `Find the ${d} in ${f(n)}. Count its place from the right, starting with ones.`, `The ${d} is in the ${names[k]} place, so its value is ${d} × ${f(10 ** k)}.`],
    alt: Number(String(n)[6 - k]) * 10 ** k,
  };
}),

T6('Y6-PV-02', 'MA-Y6-PV-02', (r, c, L) => {
  const p = L === 1 ? pick(r, [10, 100, 1000, 10000]) : L === 2 ? pick(r, [10000, 100000]) : pick(r, [100000, 1000000]);
  const tie = L === 3 && r() < 0.35;
  let n = L === 1 ? int(r, 12000, 998999) : int(r, 120000, 9998999);
  if (tie) n = Math.floor(n / p) * p + p / 2; else if (n % p === p / 2) n += 1;
  if (n % p === 0) return null;
  const answer = roundTo(n, p);
  const m: Mistake[] = [];
  mk(m, Math.floor(n / p) * p, `You rounded down. Look at the digit to the right of the place you are rounding to: 5 or more rounds up.`, answer);
  mk(m, Math.ceil(n / p) * p, `You rounded up. Look at the digit to the right of the place you are rounding to: 4 or less rounds down.`, answer);
  mk(m, roundTo(n, p / 10), `That rounds to the nearest ${f(p / 10)}. The question asks for the nearest ${f(p)}.`, answer);
  return {
    text: `${c.actor} reports that ${f(n)} ${c.thing} were sold in total and rounds the number to the nearest ${f(p)}. What is the rounded number?`,
    answer, mistakes: m, params: { n, p },
    hints: [`Find the digit in the ${f(p)}s place, then look at the digit just to its right.`, '5 or more: round up. 4 or less: round down.', `${f(n)} lies between ${f(Math.floor(n / p) * p)} and ${f((Math.floor(n / p) + 1) * p)}. Which is it closer to?`],
    alt: (() => { const rem = n % p; return rem * 2 >= p ? n - rem + p : n - rem; })(),
  };
}),

T6('Y6-PV-03', 'MA-Y6-PV-03', (r, c, L) => {
  const m: Mistake[] = [];
  if (L === 1) {
    const a = int(r, 2, 15), b = int(r, 2, 15), answer = a + b;
    mk(m, Math.abs(a - b), 'You subtracted. The temperatures are on opposite sides of zero, so the gap is both parts added.', answer); mk(m, a * b, 'That multiplies. Count the gap on a number line.', answer);
    return { text: `The temperature at ${c.place} is −${a}°C at night and ${b}°C at noon. By how many degrees does it rise?`, answer, mistakes: m, params: { a, b },
      hints: ['Picture a thermometer. Zero is between the two temperatures.', `Count from −${a} up to 0, then from 0 up to ${b}.`, 'Add the two parts of the journey.'], alt: b - -a };
  }
  if (L === 2) {
    const a = int(r, 3, 20), b = int(r, 3, 20); if (a === b) return null;
    const lo = Math.max(a, b), hi = Math.min(a, b), answer = lo - hi;
    mk(m, a + b, 'You added. Both temperatures are below zero, so find the gap between them.', answer); mk(m, lo, 'That is the colder temperature. Find the gap between the two.', answer);
    return { text: `${c.actor} records −${a}°C in the morning and −${b}°C in the afternoon. What is the difference between the two temperatures, in degrees?`, answer, mistakes: m, params: { a, b },
      hints: ['Both numbers are below zero. Use a number line.', 'Find the distance between the two numbers.', 'Subtract the smaller size from the bigger size.'], alt: Math.abs(-a - -b) };
  }
  const t = [-int(r, 3, 12), int(r, 1, 12), -int(r, 1, 9)];
  if (new Set(t).size < 3) return null;
  const answer = Math.max(...t) - Math.min(...t);
  mk(m, Math.max(...t) + Math.min(...t), 'Subtracting a negative number means adding its size.', answer, true); mk(m, Math.abs(Math.min(...t)), 'That is only the coldest temperature. Find the gap to the warmest.', answer);
  return { text: `${c.actor} measures ${t.map(x => `${x}°C`.replace('-', '−')).join(', ')} at three different times. What is the difference between the warmest and the coldest, in degrees?`, answer, mistakes: m, params: { t: t.join(',') },
    hints: ['Find the warmest and the coldest temperatures.', 'Use a number line to find the distance between them.', 'If one is below zero and one above, add the two distances to zero.'], alt: [...t].sort((x, y) => y - x)[0]! - [...t].sort((x, y) => x - y)[0]! };
}),

// ===== FOUR OPERATIONS =====
T6('Y6-ASMD-01', 'MA-Y6-ASMD-01', (r, c, L) => {
  const a = L === 1 ? int(r, 120, 899) : L === 2 ? int(r, 1200, 4999) : int(r, 2500, 9999);
  const b = L === 1 ? int(r, 12, 49) : int(r, 12, 79);
  if (b % 10 === 0) return null;
  const u = b % 10, t = Math.floor(b / 10), answer = a * b;
  const m: Mistake[] = [];
  mk(m, a * u + a * t, 'You forgot the zero when you multiplied by the tens digit. That row is really × ' + t * 10 + '.', answer);
  mk(m, a * u, 'That only multiplies by the ones digit. You need the tens as well.', answer);
  return {
    text: `${c.actor} packs ${f(a)} ${c.thing} into each of ${b} crates. How many ${c.thing} are packed altogether?`,
    answer, mistakes: m, params: { a, b },
    hints: [`Use long multiplication. Write ${f(a)} on top and ${b} underneath.`, `First multiply by the ${u} ones. Then put a zero in the ones place and multiply by the ${t} tens.`, 'Add the two rows together.'],
    alt: a * u + a * t * 10,
  };
}),

T6('Y6-ASMD-02-exact', 'MA-Y6-ASMD-02', (r, c, L) => {
  const d = int(r, 12, 35), q = L === 1 ? int(r, 12, 40) : L === 2 ? int(r, 20, 120) : int(r, 60, 280);
  const n = d * q; if (n > 9999) return null;
  const m: Mistake[] = [];
  mk(m, q + 1, `Check: ${q + 1} × ${d} = ${f((q + 1) * d)}, which is more than ${f(n)}.`, q); mk(m, q - 1, `Check: ${q - 1} × ${d} = ${f((q - 1) * d)}, which is less than ${f(n)}.`, q); mk(m, n - d, 'That subtracts. Sharing equally means dividing.', q);
  return {
    text: `${c.actor} shares ${f(n)} ${c.thing} equally between ${d} boxes. How many ${c.thing} go in each box?`,
    answer: q, mistakes: m, params: { n, d },
    hints: ['Use long division. Write out the first few multiples of ' + d + ' to help.', `${d}, ${d * 2}, ${d * 3}, ${d * 4}, ${d * 5}... Use them to find how many ${d}s go into each part of ${f(n)}.`, `Check: your answer × ${d} should equal ${f(n)}.`],
    alt: n / d,
  };
}),

onlyLevels(T6('Y6-ASMD-02-roundup', 'MA-Y6-ASMD-02', (r, c, L) => {
  const d = int(r, 12, 40), n = int(r, 150, L === 2 ? 900 : 4000);
  if (n % d === 0) return null;
  const answer = Math.ceil(n / d), q = Math.floor(n / d);
  const m: Mistake[] = [];
  mk(m, q, `That leaves ${n - q * d} ${c.crowd} behind. They need one more minibus.`, answer); mk(m, answer + 1, 'That is one more than needed. Check how many are left over after the full minibuses.', answer);
  return {
    text: `${f(n)} ${c.crowd} travel to ${c.place} in minibuses. Each minibus holds ${d} ${c.crowd}. How many minibuses are needed?`,
    answer, mistakes: m, params: { n, d },
    hints: ['Divide the number of passengers by the size of a minibus.', `${f(n)} ÷ ${d} does not come out exactly. Look at the remainder.`, 'The remainder still needs a minibus, so round up.'],
    alt: Math.floor((n + d - 1) / d),
  };
}), [2, 3]),

T6('Y6-ASMD-03', 'MA-Y6-ASMD-03', (r, c, L) => {
  const d = L === 1 ? int(r, 11, 15) : int(r, 12, 25), n = L === 3 ? int(r, 1500, 9500) : int(r, 150, 999);
  const q = Math.floor(n / d), rem = n % d; if (rem === 0) return null;
  const m: Mistake[] = [];
  mk(m, q, 'That is the number in each group. The question asks how many are left over.', rem); mk(m, d - rem, 'That is how many more would make another full group.', rem);
  return {
    text: `${c.actor} puts ${f(n)} ${c.thing} into bags of ${d}, filling as many bags as possible. How many ${c.thing} are left over?`,
    answer: rem, mistakes: m, params: { n, d },
    hints: [`Divide ${f(n)} by ${d}. The remainder is what is left over.`, `Write out the ${d} times table to help with short division.`, `Check: ${d} × (number of bags) + remainder = ${f(n)}.`],
    alt: n - d * Math.floor(n / d),
  };
}),

T6('Y6-ASMD-04', 'MA-Y6-ASMD-04', (r, c, L) => {
  const m: Mistake[] = [];
  if (L === 1) {
    const x = pick(r, [25, 25, 5, 50]), y = x === 25 ? 4 : x === 5 ? 2 : 2, k = int(r, 3, 9), answer = x * y * k;
    mk(m, x * k + y, 'Multiply all three numbers together.', answer); mk(m, x * y + k, 'After ' + x + ' × ' + y + ', multiply by ' + k + '. Do not add it.', answer);
    return { text: `${c.actor} works out ${x} × ${k} × ${y} in their head. What is the answer?`, answer, mistakes: m, params: { x, y, k },
      hints: ['Look for two numbers that multiply to make something easy.', `${x} × ${y} = ${x * y}. You can swap the order of multiplication.`, `Work out ${x * y} × ${k}.`], alt: k * (x * y) };
  }
  if (L === 2) {
    const a = int(r, 40, 90) * 100, b = int(r, 5, 30) * 100 + pick(r, [50, 0]), cc = int(r, 2, 15) * 100 + pick(r, [50, 0]);
    const answer = a - b + cc; if (answer <= 0 || b > a) return null;
    mk(m, a - b - cc, 'The last number is added, not subtracted.', answer); mk(m, a - (b + cc) + 2 * cc, 'Work left to right: first subtract, then add.', answer);
    return { text: `${c.actor} works out ${f(a)} − ${f(b)} + ${f(cc)} in their head. What is the answer?`, answer, mistakes: m, params: { a, b, cc },
      hints: ['Work from left to right. Break the numbers into thousands and hundreds.', `First work out ${f(a)} − ${f(b)}.`, `Then add ${f(cc)}.`], alt: a + cc - b };
  }
  const n = int(r, 3, 15), answer = n * 99;
  mk(m, n * 100, `That is ${n} × 100. 99 is 1 less than 100, so take off ${n}.`, answer); mk(m, n * 100 + n, '99 is less than 100, so take off, not add.', answer);
  return { text: `${c.actor} uses a clever method to work out ${n} × 99. What is the answer?`, answer, mistakes: m, params: { n },
    hints: ['99 is very close to 100.', `Work out ${n} × 100 first.`, `99 is one less than 100, so you have ${n} too many. Take them off.`], alt: n * 100 - n };
}),

T6('Y6-ASMD-05-lcm', 'MA-Y6-ASMD-05', (r, c, L) => {
  const pairs: [number, number][] = L === 1 ? [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5]] : L === 2 ? [[4, 6], [6, 8], [4, 10], [6, 9], [8, 12], [6, 10]] : [[12, 18], [15, 20], [14, 21], [9, 12], [16, 24], [18, 24], [10, 25]];
  const [a, b] = pick(r, pairs), answer = lcm(a, b);
  const m: Mistake[] = [];
  mk(m, a * b, a * b === answer ? '' : `That is ${a} × ${b}. There may be a smaller number that both ${a} and ${b} go into.`, answer); mk(m, Math.max(a, b), `${Math.max(a, b)} is not a multiple of ${Math.min(a, b)}.`, answer);
  mk(m, answer * 2, 'That is a common multiple but not the lowest one.', answer);
  return {
    text: `${c.actor} has two alarms. One rings every ${a} minutes and the other every ${b} minutes. They ring together at the start. After how many minutes do they next ring together?`,
    answer, mistakes: m, params: { a, b },
    hints: ['You need the lowest common multiple of the two numbers.', `Start with the larger number, ${Math.max(a, b)}. Is it a multiple of ${Math.min(a, b)}? If not, try 2 × ${Math.max(a, b)}, 3 × ${Math.max(a, b)} and so on.`, `Find the first one that is also a multiple of ${Math.min(a, b)}.`],
    alt: (() => { let x = Math.max(a, b); while (x % a !== 0 || x % b !== 0) x += Math.max(a, b); return x; })(),
  };
}),

T6('Y6-ASMD-05-hcf', 'MA-Y6-ASMD-05', (r, c, L) => {
  const g = L === 1 ? int(r, 2, 6) : L === 2 ? int(r, 6, 12) : int(r, 12, 25);
  const p = int(r, 2, 9), q = int(r, 2, 9);
  if (p === q || gcd(p, q) !== 1) return null;
  const a = g * p, b = g * q, m: Mistake[] = [];
  mk(m, Math.abs(a - b), 'That is the difference. Look for the biggest number that divides into both.', g); mk(m, Math.min(a, b), 'The highest common factor must divide both numbers exactly.', g); mk(m, lcm(a, b), 'That is the lowest common multiple. You need the highest common factor.', g);
  return {
    text: `${c.actor} cuts a ${a} cm ribbon and a ${b} cm ribbon into equal pieces that are as long as possible, with none left over. How long is each piece, in centimetres?`,
    answer: g, mistakes: m, params: { a, b },
    hints: ['You need the highest common factor of the two lengths.', `List the factors of ${Math.min(a, b)}. Which also divide ${Math.max(a, b)}?`, 'Pick the biggest factor on both lists.'],
    alt: (() => { let best = 1; for (const x of divisors(a)) if (b % x === 0) best = x; return best; })(),
  };
}),

T6('Y6-ASMD-06', 'MA-Y6-ASMD-06', (r, c, L) => {
  const m: Mistake[] = [];
  let expr: string, answer: number, alt: number, hint2: string;
  if (L === 1) {
    const a = int(r, 2, 20), b = int(r, 2, 9), cc = int(r, 2, 9);
    expr = `${a} + ${b} × ${cc}`; answer = a + b * cc; alt = a + Array.from({ length: cc }, () => b).reduce((x, y) => x + y, 0);
    mk(m, (a + b) * cc, 'You added first. Multiplication comes before addition.', answer); mk(m, a + b + cc, 'That adds everything. One of the signs is a multiplication.', answer); hint2 = `Do ${b} × ${cc} first.`;
  } else if (L === 2) {
    const a = int(r, 2, 12), b = int(r, 2, 9), cc = int(r, 2, 9), d = int(r, 1, 15);
    expr = `(${a} + ${b}) × ${cc} − ${d}`; answer = (a + b) * cc - d; alt = a * cc + b * cc - d;
    if (answer <= 0) return null;
    mk(m, a + b * cc - d, 'Do the brackets first.', answer); mk(m, (a + b) * cc + d, 'The last number is taken away, not added.', answer); mk(m, (a + b) * (cc - d), 'The subtraction only affects the last number, not the multiplier.', answer); hint2 = `Brackets first: ${a} + ${b}.`;
  } else {
    const a = int(r, 3, 9), b = int(r, 2, 6), cc = int(r, 2, 6), d = int(r, 1, 9);
    expr = `${a}² − ${b} × ${cc} + ${d}`; answer = a * a - b * cc + d; alt = a * a + d - b * cc;
    mk(m, (a * a - b) * cc + d, 'Multiplication comes before subtraction.', answer); mk(m, a * 2 - b * cc + d, `${a}² means ${a} × ${a}, not ${a} × 2.`, answer); mk(m, a * a - b * cc - d, 'The last number is added, not subtracted.', answer); hint2 = `Indices first: ${a}² = ${a * a}. Then multiplication.`;
  }
  return {
    text: `${c.actor} works out ${expr}. What is the answer?`,
    answer, mistakes: m, params: { expr },
    hints: ['Remember the order: brackets, indices (powers), then division and multiplication, then addition and subtraction.', hint2!, 'Finish with addition and subtraction from left to right.'],
    alt,
  };
}),

T6('Y6-ASMD-09', 'MA-Y6-ASMD-09', (r, c, L) => {
  const m: Mistake[] = [];
  if (L < 3) {
    const a = L === 1 ? int(r, 120, 899) : int(r, 1200, 8999), b = int(r, 12, 89);
    if (tie1(a) || tie1(b)) return null;
    const answer = sf1(a) * sf1(b);
    mk(m, a * b, 'That is the exact answer. An estimate uses numbers rounded to 1 significant figure.', answer); mk(m, sf1(a) * b, 'Round both numbers, not just one.', answer);
    return { text: `${c.actor} checks ${f(a)} × ${b} by estimating. Round each number to 1 significant figure (the first digit), then multiply. What is the estimate?`, answer, mistakes: m, params: { a, b },
      hints: ['Round each number so that only its first digit is not zero.', `${f(a)} rounds to ${f(sf1(a))}. What does ${b} round to?`, 'Multiply the two rounded numbers.'], alt: Math.round(a / 10 ** (String(a).length - 1)) * 10 ** (String(a).length - 1) * (Math.round(b / 10 ** (String(b).length - 1)) * 10 ** (String(b).length - 1)) };
  }
  const n = int(r, 1200, 9999), d = int(r, 12, 89);
  if (tie1(n) || tie1(d) || sf1(n) % sf1(d) !== 0) return null;
  const answer = sf1(n) / sf1(d);
  mk(m, Math.round(n / d), 'That is close to the exact answer. An estimate uses numbers rounded to 1 significant figure.', answer);
  return { text: `${c.actor} checks ${f(n)} ÷ ${d} by estimating. Round each number to 1 significant figure (the first digit), then divide. What is the estimate?`, answer, mistakes: m, params: { n, d },
    hints: ['Round each number so that only its first digit is not zero.', `${f(n)} rounds to ${f(sf1(n))} and ${d} rounds to ${sf1(d)}.`, `Work out ${f(sf1(n))} ÷ ${sf1(d)}.`], alt: sf1(n) / sf1(d) };
}),

// ===== FRACTIONS =====
T6('Y6-FR-01', 'MA-Y6-FR-01', (r, c, L) => {
  const m: Mistake[] = [];
  if (L < 3) {
    const [p, q] = pick(r, [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [1, 6], [5, 6], [3, 8], [5, 8], [7, 8], [4, 9], [7, 10], [3, 10]] as [number, number][]);
    const g = L === 1 ? pick(r, [2, 3, 4, 5]) : pick(r, [6, 8, 9, 12]);
    const n = p * g, d = q * g, ask = L === 1 ? p : q;
    for (const h of divisors(g).filter(x => x > 1 && x < g)) mk(m, L === 1 ? n / h : d / h, `That is not fully simplified. You can still divide the top and bottom by ${g / h}.`, ask);
    mk(m, L === 1 ? n : d, 'That is the original fraction. Divide the top and bottom by the same number.', ask);
    return { text: `${c.actor} simplifies ${n}/${d} as far as possible. What is the ${L === 1 ? 'numerator' : 'denominator'} of the simplified fraction?`, answer: ask, mistakes: m, params: { n, d },
      hints: [`Find the biggest number that divides exactly into both ${n} and ${d}.`, 'Divide the top and bottom by that number.', 'Check that no number other than 1 divides into both of the new numbers.'], alt: (L === 1 ? n : d) / gcd(n, d) };
  }
  const pairs: [number, number][] = [[4, 6], [6, 8], [6, 9], [8, 12], [10, 15], [12, 18], [9, 12], [12, 16], [14, 21], [15, 20]];
  const [d1, d2] = pick(r, pairs), answer = lcm(d1, d2);
  mk(m, d1 * d2, `That is ${d1} × ${d2}. It works, but there is a smaller common denominator.`, answer); mk(m, Math.max(d1, d2), `${Math.max(d1, d2)} is not a multiple of ${Math.min(d1, d2)}.`, answer);
  return { text: `${c.actor} wants to compare ${int(r, 1, d1 - 1)}/${d1} and ${int(r, 1, d2 - 1)}/${d2}. What is the lowest common denominator, the smallest number that both ${d1} and ${d2} divide into?`, answer, mistakes: m, params: { d1, d2 },
    hints: ['You need the lowest common multiple of the two denominators.', `List the multiples of ${Math.max(d1, d2)}.`, `Find the first one that ${Math.min(d1, d2)} also divides into.`], alt: (() => { let x = Math.max(d1, d2); while (x % d1 || x % d2) x += Math.max(d1, d2); return x; })() };
}),

T6('Y6-FR-02', 'MA-Y6-FR-02', (r, c, L) => {
  const D = pick(r, L === 1 ? [12] : L === 2 ? [12, 20, 24] : [24, 30, 36, 40, 60]);
  const dv = divisors(D).filter(d => d > 1 && d < D);
  const fr: { n: number; d: number }[] = [];
  for (let t = 0; fr.length < 3 && t < 300; t++) {
    const d = pick(r, dv), n = int(r, 1, 2 * d - 1);
    if (n === d) continue;
    if (!fr.some(x => (x.n * D) / x.d === (n * D) / d)) fr.push({ n, d });
  }
  if (fr.length < 3 || !fr.some(x => x.n > x.d)) return null;
  const sc = fr.map(x => (x.n * D) / x.d), answer = Math.max(...sc), m: Mistake[] = [];
  for (const v of sc) mk(m, v, `${v}/${D} is not the largest. Compare numerators once every fraction has a denominator of ${D}.`, answer);
  const top = fr.reduce((a, b) => (a.n * b.d > b.n * a.d ? a : b));
  return {
    text: `${c.actor} compares ${fr.map(x => `${x.n}/${x.d}`).join(', ')}. Some of them are bigger than 1. When each is written with a denominator of ${D}, what is the numerator of the largest?`,
    answer, mistakes: m, params: { fr: fr.map(x => `${x.n}/${x.d}`).join(','), D },
    hints: [`Change each fraction so it has a denominator of ${D}.`, `Multiply the top and bottom by the same number. For ${fr[0]!.n}/${fr[0]!.d} you multiply by ${D / fr[0]!.d}.`, 'When the denominators match, the largest fraction has the largest numerator.'],
    alt: (top.n * D) / top.d,
  };
}),

T6('Y6-FR-03', 'MA-Y6-FR-03', (r, c, L) => {
  const [d1, d2] = pick(r, [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [2, 7], [3, 7]] as [number, number][]), D = d1 * d2;
  const n1 = int(r, 1, d1 - 1), n2 = int(r, 1, d2 - 1), m: Mistake[] = [];
  if (L === 1) {
    const answer = n1 * d2 + n2 * d1;
    mk(m, n1 + n2, 'You need the same denominator first. Change both fractions to ' + D + 'ths.', answer); mk(m, n1 * n2, 'Do not multiply the numerators. Convert to a common denominator, then add.', answer);
    return { text: `${c.actor} works out ${n1}/${d1} + ${n2}/${d2} = ?/${D}. What number goes in place of the ?`, answer, mistakes: m, params: { n1, d1, n2, d2 },
      hints: [`Change both fractions to ${D}ths.`, `Multiply the top and bottom of ${n1}/${d1} by ${d2}, and of ${n2}/${d2} by ${d1}.`, 'Add the new numerators.'], alt: (n1 * D) / d1 + (n2 * D) / d2 };
  }
  if (L === 2) {
    if (n1 / d1 <= n2 / d2) return null;
    const answer = n1 * d2 - n2 * d1;
    mk(m, n1 - n2, 'You need the same denominator first. Change both fractions to ' + D + 'ths.', answer); mk(m, n1 * d2 + n2 * d1, 'That adds. This is a subtraction.', answer);
    return { text: `${c.actor} works out ${n1}/${d1} − ${n2}/${d2} = ?/${D}. What number goes in place of the ?`, answer, mistakes: m, params: { n1, d1, n2, d2 },
      hints: [`Change both fractions to ${D}ths.`, `Multiply the top and bottom of ${n1}/${d1} by ${d2}, and of ${n2}/${d2} by ${d1}.`, 'Subtract the new numerators.'], alt: (n1 * D) / d1 - (n2 * D) / d2 };
  }
  const w1 = int(r, 1, 3), w2 = int(r, 1, 3), answer = (w1 * d1 + n1) * d2 + (w2 * d2 + n2) * d1;
  mk(m, w1 + w2 + n1 + n2, 'Change each mixed number to an improper fraction over ' + D + ' first.', answer); mk(m, (w1 + w2) * D, 'That is only the whole numbers. Add the fractions too.', answer);
  return { text: `${c.actor} works out ${w1} ${n1}/${d1} + ${w2} ${n2}/${d2}. How many ${D}ths is the total? (Write the answer as ?/${D}.)`, answer, mistakes: m, params: { w1, n1, d1, w2, n2, d2 },
    hints: ['Change each mixed number into an improper fraction.', `Then change both to ${D}ths.`, 'Add the two numerators.'], alt: Math.round((w1 + n1 / d1 + w2 + n2 / d2) * D) };
}),

T6('Y6-FR-04', 'MA-Y6-FR-04', (r, c, L) => {
  const b = int(r, 2, 9), d = int(r, 2, 9), a = int(r, 1, b - 1), cc = int(r, 1, d - 1);
  const num = a * cc, den = b * d, g = gcd(num, den), answer = den / g;
  if (L === 1 ? g !== 1 : g === 1) return null;
  const m: Mistake[] = [];
  mk(m, den, `That is ${b} × ${d}, but it is not simplified yet.`, answer); mk(m, num, 'That is the numerator. The question asks for the denominator.', answer); mk(m, b + d, 'Do not add the denominators. Multiply them.', answer);
  return { text: `${c.actor} works out ${a}/${b} × ${cc}/${d} and writes the answer in its simplest form. What is the denominator of the answer?`, answer, mistakes: m, params: { a, b, cc, d },
    hints: ['Multiply the numerators together, and multiply the denominators together.', `Numerators: ${a} × ${cc}. Denominators: ${b} × ${d}.`, `That gives ${num}/${den}. Simplify by dividing top and bottom by their highest common factor.`], alt: den / gcd(a * cc, b * d) };
}),

T6('Y6-FR-05', 'MA-Y6-FR-05', (r, c, L) => {
  const b = int(r, 2, 9), k = int(r, 2, 5), a = L === 1 ? 1 : int(r, 1, b - 1);
  const num = a, den = b * k, g = gcd(num, den), answer = den / g;
  if (L === 3 && g === 1) return null;
  const m: Mistake[] = [];
  mk(m, b, `The denominator changes when you divide by ${k}.`, answer); mk(m, den, 'That is not simplified yet.', answer); mk(m, Math.max(1, b - k), 'Dividing a fraction by a whole number makes the pieces smaller, so the denominator gets bigger.', answer);
  return { text: `${c.actor} works out ${a}/${b} ÷ ${k} and writes the answer in its simplest form. What is the denominator of the answer?`, answer, mistakes: m, params: { a, b, k },
    hints: [`Dividing by ${k} splits each piece into ${k} smaller pieces.`, `Multiply the denominator by ${k}: ${b} × ${k}.`, 'Check whether the fraction can be simplified.'], alt: (b * k) / gcd(a, b * k) };
}),

T6('Y6-FR-06', 'MA-Y6-FR-06', (r, c, L) => {
  const d = L === 1 ? pick(r, [2, 4, 5, 10]) : L === 2 ? pick(r, [8, 20, 25]) : pick(r, [8, 40]);
  const n = int(r, 1, d - 1); if (gcd(n, d) !== 1 && L === 3) return null;
  const answer = dp3(n / d), m: Mistake[] = [];
  mk(m, Number(`0.${n}${d}`), 'That just writes the two numbers after a decimal point. Divide the numerator by the denominator.', answer);
  if (L === 3) mk(m, Math.round(answer * 100) / 100, 'That is rounded to two decimal places. Keep all three decimal places.', answer);
  mk(m, dp3(d / n), 'That divides the wrong way round. Divide the numerator by the denominator.', answer);
  return { text: `${c.actor} writes ${n}/${d} as a decimal. What does ${c.actor} write?`, answer, mistakes: m, params: { n, d },
    hints: ['A fraction is a division: the numerator divided by the denominator.', `Work out ${n} ÷ ${d}. You can use equivalent fractions with a denominator of 10, 100 or 1,000.`, 'Write the answer with the decimal point in the right place.'], alt: Number((n / d).toFixed(3)) };
}),

T6('Y6-FR-07', 'MA-Y6-FR-07', (r, c, L) => {
  const m: Mistake[] = [];
  if (L === 1) {
    const ds: number[] = []; while (ds.length < 4) { const d = pick(r, [1, 2, 3, 4, 5, 6, 7, 8, 9]); if (!ds.includes(d)) ds.push(d); }
    const k = int(r, 1, 3), d = ds[k]!, x = ds[0]! + ds[1]! / 10 + ds[2]! / 100 + ds[3]! / 1000;
    const answer = dp3(d / 10 ** k), names = ['', 'tenths', 'hundredths', 'thousandths'];
    mk(m, d, `${d} is the digit. The question asks for its value in the ${names[k]} place.`, answer); mk(m, dp3(d / 10 ** (k - 1)), 'That would be the value one place to the left.', answer); mk(m, dp3(d / 10 ** (k + 1)), 'That would be the value one place to the right.', answer);
    return { text: `${c.actor} measures ${fd(dp3(x), 3)} metres. What is the value of the digit ${d}?`, answer, mistakes: m, params: { x: dp3(x), d },
      hints: ['After the decimal point the places are tenths, hundredths and thousandths.', `Find the ${d}. Count its place after the decimal point.`, `The ${d} is in the ${names[k]} place.`], alt: Number((d * 10 ** -k).toFixed(3)) };
  }
  const mul = L === 2, dp0 = pick(r, [1, 2]), k = pick(r, [10, 100, 1000]), lg = Math.log10(k);
  if (!mul && dp0 + lg > 3) return null;
  const mnum = int(r, 11, 999); if (mnum % 10 === 0) return null;
  const x = mnum / 10 ** dp0, answer = dp3(mul ? x * k : x / k);
  if (mul) { mk(m, dp3(x * k * 10), 'One place too many.', answer); mk(m, dp3(x * k / 10), 'One place too few.', answer); }
  else { mk(m, dp3(x / (k * 10)), 'One place too many.', answer); mk(m, dp3(x / (k / 10)), 'One place too few.', answer); }
  return { text: `${c.actor} ${mul ? 'multiplies' : 'divides'} ${x.toFixed(dp0)} by ${f(k)}. What is the answer?`, answer, mistakes: m, params: { mnum, dp0, k, mul: mul ? 1 : 0 },
    hints: [`${mul ? 'Multiplying' : 'Dividing'} by ${f(k)} moves each digit ${lg} place${lg > 1 ? 's' : ''} ${mul ? 'to the left' : 'to the right'}.`, 'Fill any gaps with zeros.', `Check: does your answer look ${k} times ${mul ? 'bigger' : 'smaller'}?`], alt: Number(((mul ? mnum * k : mnum / k) / (mul ? 10 ** dp0 : 10 ** dp0)).toFixed(3)) };
}),

T6('Y6-FR-08', 'MA-Y6-FR-08', (r, c, L) => {
  const dpn = L === 1 ? 1 : 2, a = int(r, 1, 9), frac = int(r, 1, 10 ** dpn - 1);
  if (frac % 10 === 0) return null;
  const mm = a * 10 ** dpn + frac, k = L === 3 ? int(r, 11, 25) : int(r, 2, 9);
  const x = mm / 10 ** dpn, answer = dp3((mm * k) / 10 ** dpn), m: Mistake[] = [];
  mk(m, dp3(answer * 10), 'The decimal point is one place too far right. Multiply the digits, then put the point back.', answer); mk(m, dp3(answer / 10), 'The decimal point is one place too far left.', answer); mk(m, dp3(x + k), 'That adds. The question multiplies.', answer);
  return { text: `${c.actor} buys ${k} packs of ${c.thing}. Each pack costs £${x.toFixed(2)}. How much do the packs cost altogether, in pounds?`, answer, mistakes: m, params: { mm, k, dpn },
    hints: ['Ignore the decimal point and multiply as whole numbers.', `${mm} × ${k}. Then count how many decimal places ${x.toFixed(dpn)} had.`, 'Put the decimal point back in the answer so it has the same number of decimal places.'], alt: Number(((mm * k) / 10 ** dpn).toFixed(3)) };
}),

T6('Y6-FR-09', 'MA-Y6-FR-09', (r, c, L) => {
  const d = L === 1 ? pick(r, [2, 5]) : L === 2 ? 4 : pick(r, [20, 25]);
  const n = L === 1 ? int(r, 3, 39) : L === 2 ? int(r, 5, 99) : int(r, 3, 140);
  if (n % d === 0 || (n * 100) % d !== 0) return null;
  const answer = dp3(n / d), q = Math.floor(n / d), rem = n % d, m: Mistake[] = [];
  mk(m, q, `That ignores the remainder of ${rem}. Keep dividing: add a decimal point and zeros.`, answer); mk(m, dp3(q + rem / 10), `The remainder ${rem} is not ${rem / 10}. Carry on dividing after the decimal point.`, answer); mk(m, dp3(answer * 10), 'The decimal point is in the wrong place.', answer);
  return { text: `${c.actor} shares £${n} equally between ${d} friends. How much does each friend get, in pounds?`, answer, mistakes: m, params: { n, d },
    hints: [`Divide ${n} by ${d}. There will be a remainder.`, 'Write a decimal point and zeros after the number, then keep dividing.', 'Put the decimal point directly above the one in the number being divided.'], alt: Number((n / d).toFixed(3)) };
}),

T6('Y6-FR-11', 'MA-Y6-FR-11', (r, c, L) => {
  const m: Mistake[] = [];
  if (L === 1) {
    const d = pick(r, [2, 4, 5, 10, 20, 25, 50]), n = int(r, 1, d - 1), answer = (100 * n) / d;
    mk(m, n, 'That is the numerator. Scale the fraction up to a denominator of 100.', answer); mk(m, dp3(n / d), 'That is the decimal. The question asks for the percentage.', answer);
    return { text: `${c.actor} answers ${n}/${d} of the questions correctly. What percentage is that, without the % sign?`, answer, mistakes: m, params: { n, d },
      hints: ['A percentage is a fraction with a denominator of 100.', `What do you multiply ${d} by to make 100?`, 'Multiply the numerator by the same number.'], alt: n * (100 / d) };
  }
  if (L === 2) {
    const p = int(r, 1, 99); if (p % 10 === 0) return null; const answer = dp3(p / 100);
    mk(m, dp3(p / 10), 'That divides by 10. Per cent means out of 100.', answer); mk(m, p, 'That is the percentage as a number. Divide by 100.', answer);
    return { text: `${c.actor} scores ${p}% in a quiz. Write ${p}% as a decimal.`, answer, mistakes: m, params: { p },
      hints: ['Per cent means "out of 100".', `${p}% is ${p}/100.`, `Divide ${p} by 100: move the digits two places to the right.`], alt: Number((p / 100).toFixed(2)) };
  }
  const p = pick(r, [12, 15, 24, 35, 36, 45, 48, 55, 64, 65, 75, 85]), answer = 100 / gcd(p, 100);
  mk(m, 100, `${p}/100 is not simplified yet. Divide top and bottom by their common factor.`, answer); mk(m, p, 'That is the numerator. The question asks for the denominator.', answer);
  return { text: `${c.actor} writes ${p}% as a fraction in its simplest form. What is the denominator?`, answer, mistakes: m, params: { p },
    hints: [`${p}% is ${p}/100.`, `Find the highest common factor of ${p} and 100.`, 'Divide the top and bottom by it.'], alt: 100 / gcd(100, p) };
}),
];
