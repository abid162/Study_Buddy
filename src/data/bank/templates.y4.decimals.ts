import type { Template, Mistake } from './types';
import { T, mk } from './templates.y4';
import { int, pick, fd, dp2 } from './rng';

/** Year 4 decimal templates (FR-05 to FR-09). Answers can be decimals: compare with checkAnswer(). */
export const Y4_DECIMAL_TEMPLATES: Template[] = [

T('Y4-FR-05', 'MA-Y4-FR-05', (r, c, L) => {
  let x: number, den: number;
  if (L === 1) { den = 10; x = int(r, 1, 9); }
  else if (L === 2) { den = 100; x = int(r, 11, 99); if (x % 10 === 0) return null; }
  else { den = 100; x = int(r, 101, 399); if (x % 10 === 0) return null; }
  const answer = dp2(x / den);
  const m: Mistake[] = [];
  if (L === 1) {
    mk(m, x, 'That is the number of tenths. A tenth is smaller than 1, so the decimal must be less than 1.', answer);
    mk(m, x / 100, `That is ${x} hundredths. A tenth sits one place after the decimal point.`, answer);
  } else {
    mk(m, x / 10, 'That reads the digits as tenths. Hundredths go two places after the decimal point.', answer);
    mk(m, x / 1000, 'That is too small. Hundredths have two places after the decimal point.', answer);
    mk(m, x, `That is the number of hundredths, not the decimal.`, answer);
  }
  const whole = Math.floor(x / 100), rest = x % 100;
  return {
    text: `${c.actor} wants to write ${x}/${den} as a decimal. What is it?`,
    answer, mistakes: m, params: { x, den },
    hints: [
      den === 10 ? 'A tenth is 0.1. Think about which place the tenths go in.' : 'A hundredth is 0.01. The first place after the decimal point is tenths, the second is hundredths.',
      den === 10 ? `${x}/10 means ${x} tenths.` : `${x}/100 means ${x} hundredths. Some of those make whole tenths.`,
      den === 10 ? `${x} tenths = ${x} × 0.1.`
        : L === 2 ? `The tens digit of ${x} goes in the tenths place and the ones digit goes in the hundredths place.`
        : `${x}/100 is ${whole} whole and ${rest}/100 left over.`,
    ],
    alt: Number((x / den).toFixed(2)),
  };
}),

T('Y4-FR-06', 'MA-Y4-FR-06', (r, c, L) => {
  const val: Record<string, number> = { '1/2': 0.5, '1/4': 0.25, '3/4': 0.75 };
  const m: Mistake[] = [];
  if (L < 3) {
    const frac = L === 1 ? '1/2' : pick(r, ['1/4', '3/4']);
    const unit = pick(r, ['metre', 'litre', 'kilogram', 'kilometre']);
    const answer = val[frac]!;
    if (frac === '1/2') { mk(m, 0.12, 'That reads 1/2 as "1 and 2". Half is 5 tenths.', answer); mk(m, 0.2, '0.2 is two tenths. Half is five tenths.', answer); }
    if (frac === '1/4') { mk(m, 0.14, 'That reads 1/4 as "1 and 4". Divide 1 by 4, or think of 25p in £1.', answer); mk(m, 0.4, '0.4 is four tenths. A quarter is 25 hundredths.', answer); mk(m, 0.5, '0.5 is a half. A quarter is half of a half.', answer); }
    if (frac === '3/4') { mk(m, 0.34, 'That reads 3/4 as "3 and 4". Three quarters is three lots of 25 hundredths.', answer); mk(m, 0.25, '0.25 is one quarter. You need three of them.', answer); mk(m, 0.7, '0.7 is seven tenths. Three quarters is 75 hundredths.', answer); }
    const den = frac === '1/2' ? 2 : 4;
    const pence = answer * 100;
    return {
      text: `${c.actor} has ${frac} of a ${unit}. Write ${frac} as a decimal number of ${unit}s.`,
      answer, mistakes: m, params: { frac, unit },
      hints: [
        'Think of £1. What is this fraction of £1 in pence?',
        `Split £1 into ${den} equal parts. How many pence is each part?${frac === '3/4' ? ' You need 3 of those parts.' : ''}`,
        `That is ${pence}p out of 100p, so as a decimal it is 0.${pence}.`,
      ],
      alt: frac === '1/2' ? 1 / 2 : frac === '1/4' ? 1 / 4 : 3 / 4,
    };
  }
  const combos: [string, string, boolean][] = [['1/4', '1/2', true], ['1/4', '1/4', true], ['3/4', '1/4', false], ['3/4', '1/2', false]];
  const [a, b, add] = pick(r, combos);
  const answer = dp2(add ? val[a]! + val[b]! : val[a]! - val[b]!);
  mk(m, add ? val[a]! : val[a]!, `That is only the first fraction, ${a}.`, answer);
  mk(m, add ? val[b]! : val[b]!, `That is only the second fraction, ${b}.`, answer);
  if (!add) mk(m, dp2(val[a]! + val[b]!), 'That adds. The sum has a minus sign.', answer);
  return {
    text: `${c.actor} works out ${a} ${add ? '+' : '−'} ${b} and writes the answer as a decimal. What does ${c.actor} write?`,
    answer, mistakes: m, params: { a, b, add: add ? 1 : 0 },
    hints: [
      'Change each fraction into a decimal first.',
      'Remember: 1/2 = 0.5, 1/4 = 0.25 and 3/4 = 0.75.',
      `Now ${add ? 'add' : 'subtract'} the two decimals: ${val[a]} ${add ? '+' : '−'} ${val[b]}.`,
    ],
    alt: add ? (a === '1/4' ? 25 : 75) / 100 + (b === '1/2' ? 50 : 25) / 100 : (a === '3/4' ? 75 : 25) / 100 - (b === '1/2' ? 50 : 25) / 100,
  };
}),

T('Y4-FR-07', 'MA-Y4-FR-07', (r, c, L) => {
  let n: number, k: number;
  if (L === 1) { n = int(r, 2, 9); k = 10; }
  else if (L === 2) { if (r() < 0.5) { n = int(r, 11, 99); if (n % 10 === 0) return null; k = 10; } else { n = int(r, 2, 9); k = 100; } }
  else { n = int(r, 11, 99); if (n % 10 === 0) return null; k = 100; }
  const places = k === 10 ? 1 : 2;
  const answer = Number((n / k).toFixed(2));
  const s = String(n).padStart(places + 1, '0');
  const alt = Number(s.slice(0, -places) + '.' + s.slice(-places));
  const m: Mistake[] = [];
  mk(m, n * k, 'Dividing makes a number smaller. You multiplied.', answer);
  mk(m, k === 10 ? n / 100 : n / 10, k === 10 ? 'You moved the digits two places. ÷10 moves them one place.' : 'You moved the digits only one place. ÷100 moves them two places.', answer);
  if (k === 100) mk(m, n / 1000, 'You moved the digits three places. ÷100 moves them two places.', answer);
  return {
    text: `${c.actor} divides ${n} by ${k}. What is the answer?`,
    answer, mistakes: m, params: { n, k },
    hints: [
      `Dividing by ${k} makes the number ${k} times smaller. Each digit moves ${places} place${places > 1 ? 's' : ''} to the right.`,
      `Write ${n} on a place-value grid (tens, ones, tenths, hundredths) and move every digit ${places} column${places > 1 ? 's' : ''} to the right.`,
      `Check your answer: ${k} times it should give back ${n}.`,
    ],
    alt,
  };
}),

T('Y4-FR-08', 'MA-Y4-FR-08', (r, c, L) => {
  const w = L === 1 ? int(r, 1, 9) : L === 2 ? int(r, 10, 99) : int(r, 100, 999);
  const t = L === 3 ? int(r, 1, 9) : pick(r, [1, 2, 3, 4, 6, 7, 8, 9]);
  const answer = t >= 5 ? w + 1 : w;
  const m: Mistake[] = [];
  mk(m, t >= 5 ? w : w + 1, t >= 5 ? `You rounded down. The tenths digit is ${t}, which is 5 or more, so round up.` : `You rounded up. The tenths digit is ${t}, which is 4 or less, so round down.`, answer);
  mk(m, w * 10 + t, 'That ignores the decimal point.', answer);
  return {
    text: `${c.actor} records a distance of ${fd(w + t / 10, 1)} metres. What is that distance to the nearest whole metre?`,
    answer, mistakes: m, params: { w, t },
    hints: [
      'Look at the digit in the tenths place, just after the decimal point.',
      '5 or more: round up. 4 or less: round down.',
      `${fd(w + t / 10, 1)} is between ${w} and ${w + 1}. Which is it closer to? (Exactly halfway rounds up.)`,
    ],
    alt: Math.floor((w * 10 + t + 5) / 10),
  };
}),

T('Y4-FR-09', 'MA-Y4-FR-09', (r, c, L) => {
  let list: number[];
  const whole = int(r, 1, 9);
  if (L === 1) {
    const ws = new Set<number>(); while (ws.size < 3) ws.add(int(r, 1, 9));
    list = [...ws].map(x => x * 100 + int(r, 0, 9) * 10);
  } else if (L === 2) {
    const ts = new Set<number>(); while (ts.size < 3) ts.add(int(r, 0, 9));
    list = [...ts].map(t => whole * 100 + t * 10);
  } else {
    const sh = int(r, 1, 9); // two numbers share the tenths digit
    const hs = new Set<number>(); while (hs.size < 2) hs.add(int(r, 0, 9));
    const other = (sh + int(r, 1, 8)) % 10;
    list = [...hs].map(h => whole * 100 + sh * 10 + h);
    list.push(whole * 100 + other * 10 + int(r, 0, 9));
  }
  if (new Set(list).size < 3) return null;
  const biggest = L !== 2;
  const pickV = (biggest ? Math.max(...list) : Math.min(...list));
  const answer = pickV / 100;
  const dpn = L === 3 ? 2 : 1;
  const m: Mistake[] = [];
  for (const v of list) mk(m, v / 100, `${fd(v / 100, dpn)} is not the ${biggest ? 'longest' : 'shortest'}. Compare the ones first, then the tenths${L === 3 ? ', then the hundredths' : ''}.`, answer);
  const [x, y, z] = list.map(v => fd(v / 100, dpn));
  return {
    text: `${c.actor} has three ribbons. They are ${x} m, ${y} m and ${z} m long. What is the length of the ${biggest ? 'longest' : 'shortest'} ribbon, in metres?`,
    answer, mistakes: m, params: { a: list[0]!, b: list[1]!, c: list[2]!, biggest: biggest ? 1 : 0 },
    hints: [
      'Compare the whole numbers first. If they match, compare the tenths, then the hundredths.',
      'Line the numbers up by their decimal points so that matching places sit in the same column.',
      `Which number has the ${biggest ? 'biggest' : 'smallest'} digit in the first column where the numbers differ?`,
    ],
    alt: [...list].sort((p, q) => (biggest ? q - p : p - q))[0]! / 100,
  };
}),
];
