import type { Template, Mistake } from './types';
import { int, pick, f, fd } from './rng';
import { mk } from './templates.y4';
import { TY, divisors, dp3, tr } from './helpers';

const T5 = TY(5);
const hm = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

export const Y5_REST: Template[] = [

// ===== FRACTIONS =====
T5('Y5-FR-01', 'MA-Y5-FR-01', (r, c, L) => {
  const D = pick(r, L === 1 ? [12] : L === 2 ? [12, 20, 24] : [24, 30, 36, 40, 60]);
  const dv = divisors(D).filter(d => d > 1 && d < D);
  const fr: { n: number; d: number }[] = [];
  for (let t = 0; fr.length < 3 && t < 300; t++) {
    const d = pick(r, dv), n = int(r, 1, d - 1);
    if (!fr.some(x => (x.n * D) / x.d === (n * D) / d)) fr.push({ n, d });
  }
  if (fr.length < 3 || new Set(fr.map(x => x.d)).size < 2) return null;
  const sc = fr.map(x => (x.n * D) / x.d);
  const answer = Math.max(...sc);
  const m: Mistake[] = [];
  for (const v of sc) mk(m, v, `${v}/${D} is not the largest. Compare the numerators once every fraction has a denominator of ${D}.`, answer);
  const top = fr.reduce((a, b) => (a.n * b.d > b.n * a.d ? a : b));
  return {
    text: `${c.actor} compares ${fr.map(x => `${x.n}/${x.d}`).join(', ')}. When each fraction is written with a denominator of ${D}, what is the numerator of the largest fraction?`,
    answer, mistakes: m, params: { fr: fr.map(x => `${x.n}/${x.d}`).join(','), D },
    hints: [
      `Change each fraction so it has a denominator of ${D}.`,
      `Multiply the top and bottom by the same number. For ${fr[0]!.n}/${fr[0]!.d} you multiply by ${D / fr[0]!.d}.`,
      'Once the denominators match, the largest fraction has the largest numerator.',
    ],
    alt: (top.n * D) / top.d,
  };
}),

T5('Y5-FR-03', 'MA-Y5-FR-03', (r, c, L) => {
  const d = L === 1 ? pick(r, [2, 3, 4, 5]) : pick(r, [3, 4, 5, 6, 8, 10]);
  const w = int(r, 1, L === 3 ? 9 : 4), n = int(r, 1, d - 1), N = w * d + n;
  const m: Mistake[] = [];
  if (L === 1) {
    mk(m, w + n, 'That adds the whole number and the numerator. Change each whole into fractions first.', N);
    mk(m, w * n, 'That multiplies the whole number and the numerator.', N);
    mk(m, w * d, `That is only the whole part as ${d}ths. Add the ${n} extra.`, N);
    return { text: `${c.actor} writes ${w} ${n}/${d} as an improper fraction ?/${d}. What number goes in place of the ?`, answer: N, mistakes: m, params: { w, n, d },
      hints: [`1 whole is the same as ${d}/${d}.`, `${w} ${w === 1 ? 'whole is' : 'wholes are'} ${w} ${w === 1 ? 'lot' : 'lots'} of ${d}/${d}. How many pieces of size 1/${d} is that?`, `Then add the extra ${n}/${d}.`], alt: (w * d + n) };
  }
  if (L === 2) {
    mk(m, n, 'That is the fraction left over. The question asks for the whole ones.', w);
    mk(m, w + 1, `Check: ${w + 1} wholes would need ${(w + 1) * d}/${d}, which is more than ${N}/${d}.`, w);
    return { text: `${c.actor} has ${N}/${d} of a pizza. How many whole pizzas is that, not counting the part left over?`, answer: w, mistakes: m, params: { N, d },
      hints: [`${d}/${d} is one whole pizza.`, `How many lots of ${d} fit into ${N}?`, `Divide ${N} by ${d} and ignore the remainder.`], alt: Math.floor(N / d) };
  }
  mk(m, w, 'That is the whole number. The question asks for the fraction part.', n);
  mk(m, d - n, 'That is how much is needed to make another whole.', n);
  return { text: `${c.actor} writes ${N}/${d} as a mixed number: ${w} and ?/${d}. What number goes in place of the ?`, answer: n, mistakes: m, params: { N, d },
    hints: [`Find how many whole ones are in ${N}/${d}. Each whole is ${d}/${d}.`, `${w} wholes use up ${w * d} of the ${d}ths.`, `Subtract that from ${N} to find what is left.`], alt: N - Math.floor(N / d) * d };
}),

T5('Y5-FR-04', 'MA-Y5-FR-04', (r, c, L) => {
  const d1 = pick(r, L === 1 ? [2, 3, 4] : [2, 3, 4, 5, 6]), k = L === 1 ? 2 : int(r, 2, 4), d2 = d1 * k;
  const n1 = int(r, 1, d1 - 1), n2 = int(r, 1, d2 - 1);
  const sub = L === 3 && r() < 0.5;
  const answer = sub ? n1 * k - n2 : n1 * k + n2;
  if (answer < 1 || (!sub && L < 3 && answer > d2)) return null;
  const m: Mistake[] = [];
  mk(m, sub ? n1 - n2 : n1 + n2, `You did not change ${n1}/${d1} into ${d2}ths first. Multiply the top and bottom by ${k}.`, answer);
  mk(m, sub ? n1 * k + n2 : Math.abs(n1 * k - n2), sub ? 'That adds. This is a subtraction.' : 'That subtracts. This is an addition.', answer);
  return {
    text: `${c.actor} works out ${n1}/${d1} ${sub ? '−' : '+'} ${n2}/${d2} = ?/${d2}. What number goes in place of the ?`,
    answer, mistakes: m, params: { n1, d1, n2, d2, sub: sub ? 1 : 0 },
    hints: [`The denominators are different, so first make them the same. ${d1} goes into ${d2}.`, `Multiply the top and bottom of ${n1}/${d1} by ${k} to get ${d2}ths.`, `Now ${sub ? 'subtract' : 'add'} the numerators.`],
    alt: (n1 * d2) / d1 + (sub ? -n2 : n2),
  };
}),

T5('Y5-FR-05', 'MA-Y5-FR-05', (r, c, L) => {
  const m: Mistake[] = [];
  if (L === 1) {
    const k = int(r, 2, 6), d = int(r, 3, 8), n = int(r, 1, d - 1), answer = k * n;
    mk(m, k + n, 'That adds. Multiply the numerator by the whole number.', answer);
    mk(m, k * n * k, `Only the numerator is multiplied by ${k}. The denominator stays ${d}.`, answer);
    mk(m, n, `The numerator must be multiplied by ${k} too.`, answer);
    return { text: `${c.actor} works out ${k} × ${n}/${d} = ?/${d}. What number goes in place of the ?`, answer, mistakes: m, params: { k, n, d },
      hints: [`${n}/${d} means ${n} lots of one ${d}th.`, `${k} lots of that is ${k} × ${n} of the ${d}ths.`, 'The denominator stays the same.'], alt: n * k };
  }
  const d = L === 2 ? pick(r, [2, 4, 5]) : pick(r, [2, 4]), k = d * int(r, 2, 5);
  if (L === 2) {
    const n = int(r, 1, d - 1), answer = (k / d) * n;
    mk(m, k * n, `That multiplies by ${k} but forgets to divide by ${d}.`, answer);
    mk(m, k / d, `That is ${k} ÷ ${d}. You need ${n} lots of that.`, answer);
    return { text: `${c.actor} works out ${k} × ${n}/${d}. What is the answer?`, answer, mistakes: m, params: { k, n, d },
      hints: [`Find 1/${d} of ${k} first.`, `${k} ÷ ${d} is one ${d}th. You need ${n} of them.`, `Multiply that by ${n}.`], alt: (k * n) / d };
  }
  const w = int(r, 1, 4), n = d === 2 ? 1 : pick(r, [1, 3]), answer = w * k + (n * k) / d;
  mk(m, w * k, `That only multiplies the whole number. Multiply the fraction part ${n}/${d} by ${k} too.`, answer);
  mk(m, (n * k) / d, 'That only multiplies the fraction. Multiply the whole number as well.', answer);
  return { text: `${c.actor} works out ${k} × ${w} ${n}/${d}. What is the answer?`, answer, mistakes: m, params: { k, w, n, d },
    hints: ['Multiply the whole number and the fraction separately.', `${k} × ${w}, and ${k} × ${n}/${d}.`, 'Add the two answers together.'], alt: ((w * d + n) * k) / d };
}),

T5('Y5-FR-06', 'MA-Y5-FR-06', (r, c, L) => {
  const dpn = L, den = 10 ** dpn;
  const m10 = L === 1 ? int(r, 1, 29) : L === 2 ? int(r, 11, 299) : int(r, 101, 1999);
  if (m10 % 10 === 0) return null;
  const x = m10 / den;
  const name = ['', 'tenths', 'hundredths', 'thousandths'][dpn]!;
  const m: Mistake[] = [];
  mk(m, m10 / 10, `That uses the wrong denominator. ${fd(x, dpn)} has ${dpn} decimal place${dpn > 1 ? 's' : ''}, so it is in ${name}.`, m10);
  mk(m, m10 * 10, `That is too big. The denominator is ${f(den)}.`, m10);
  return {
    text: `${c.actor} writes ${fd(x, dpn)} as a fraction with a denominator of ${f(den)}. What is the numerator?`,
    answer: m10, mistakes: m, params: { m10, dpn },
    hints: [`Count the digits after the decimal point. ${dpn} digit${dpn > 1 ? 's' : ''} means ${name}.`, `So ${fd(x, dpn)} is a number of ${name}, with a denominator of ${f(den)}.`, 'Read the digits without the decimal point. That is the numerator.'],
    alt: Number(fd(x, dpn).replace('.', '')),
  };
}),

T5('Y5-FR-07', 'MA-Y5-FR-07', (r, c, L) => {
  const m: Mistake[] = [];
  if (L === 3) {
    const a = int(r, 1, 9), b = int(r, 1, 9), cc = int(r, 1, 9), answer = a * 100 + b * 10 + cc;
    mk(m, a + b + cc, 'That adds the digits. A tenth is 100 thousandths and a hundredth is 10 thousandths.', answer);
    mk(m, a * 10 + b + cc / 10, 'Change every part into thousandths first.', answer);
    return { text: `${c.actor} has ${a} ${a === 1 ? 'tenth' : 'tenths'}, ${b} ${b === 1 ? 'hundredth' : 'hundredths'} and ${cc} ${cc === 1 ? 'thousandth' : 'thousandths'}. How many thousandths is that altogether?`, answer, mistakes: m, params: { a, b, cc },
      hints: ['Change each part into thousandths.', '1 tenth = 100 thousandths, 1 hundredth = 10 thousandths.', 'Add up the three amounts.'], alt: 100 * a + 10 * b + cc };
  }
  const a = int(r, 1, 9), b = L === 2 ? int(r, 1, 9) : 0, x = a / 10 + b / 100, answer = a * 100 + b * 10;
  mk(m, a * 10 + b, `That is hundredths. There are 10 thousandths in each hundredth.`, answer);
  mk(m, a + b, 'That adds the digits. Think about place value.', answer);
  return { text: `${c.actor} measures ${tr(x)} of a litre. How many thousandths of a litre is that?`, answer, mistakes: m, params: { a, b },
    hints: ['A litre can be split into 1,000 thousandths.', `Think about how many thousandths are in one ${L === 1 ? 'tenth' : 'tenth and one hundredth'}.`, 'Write the decimal as three decimal places. The digits show the thousandths.'], alt: Math.round(x * 1000) };
}),

T5('Y5-FR-08', 'MA-Y5-FR-08', (r, c, L) => {
  const toWhole = L === 1;
  const h = L === 1 ? int(r, 101, 999) : L === 2 ? int(r, 101, 999) : (int(r, 10, 99) * 10 + pick(r, [5, 9]));
  if (h % 10 === 0) return null;
  const answer = toWhole ? Math.floor((h + 50) / 100) : Math.round(h / 10) / 10;
  const x = h / 100;
  const m: Mistake[] = [];
  if (toWhole) {
    mk(m, Math.floor(h / 100), `You rounded down. The tenths digit is ${Math.floor(h / 10) % 10}, which is 5 or more, so round up.`, answer);
    mk(m, Math.floor(h / 100) + 1, `You rounded up. The tenths digit is ${Math.floor(h / 10) % 10}, which is 4 or less, so round down.`, answer);
  } else {
    mk(m, Math.floor(h / 10) / 10, `You rounded down. The hundredths digit is ${h % 10}, which is 5 or more, so round up.`, answer);
    mk(m, (Math.floor(h / 10) + 1) / 10, `You rounded up. The hundredths digit is ${h % 10}, which is 4 or less, so round down.`, answer);
    mk(m, Math.floor(h / 100), 'That rounds to a whole number. The question asks for one decimal place.', answer);
  }
  return {
    text: `${c.actor} measures ${fd(x, 2)} metres. What is the measurement rounded to the nearest ${toWhole ? 'whole number' : 'tenth (one decimal place)'}?`,
    answer, mistakes: m, params: { h, toWhole: toWhole ? 1 : 0 },
    hints: [toWhole ? 'Look at the digit in the tenths place.' : 'Look at the digit in the hundredths place (the second one after the point).', '5 or more: round up. 4 or less: round down.', 'If you round up a 9, it carries into the next place.'],
    alt: toWhole ? Math.round(h / 100) : Number((Math.round(h / 10) / 10).toFixed(1)),
  };
}),

T5('Y5-FR-09', 'MA-Y5-FR-09', (r, c, L) => {
  let list: number[]; // thousandths
  const w = int(r, 0, 9) * 1000;
  if (L === 1) { const s = new Set<number>(); while (s.size < 3) s.add(w + int(r, 10, 99) * 10); list = [...s]; }
  else if (L === 2) { const t = int(r, 1, 8) * 100; const s = new Set<number>(); while (s.size < 3) s.add(w + t + int(r, 1, 99)); list = [...s]; }
  else { const t = int(r, 1, 8) * 100, a = int(r, 1, 9), b = int(r, 1, 9); if (a * 10 === b) return null; list = [w + t, w + t + a * 10, w + t + b]; }
  const biggest = L !== 2;
  const answer = (biggest ? Math.max(...list) : Math.min(...list)) / 1000;
  const shown = list.map(v => (L === 3 ? tr(v / 1000) : fd(v / 1000, L === 1 ? 2 : 3)));
  const m: Mistake[] = [];
  list.forEach((v, i) => mk(m, v / 1000, `${shown[i]} is not the ${biggest ? 'longest' : 'shortest'}. Compare place by place from the left. A longer decimal is not always bigger.`, answer));
  return {
    text: `${c.actor} has three ribbons with lengths ${shown[0]} m, ${shown[1]} m and ${shown[2]} m. What is the length of the ${biggest ? 'longest' : 'shortest'} ribbon, in metres?`,
    answer, mistakes: m, params: { a: list[0]!, b: list[1]!, c: list[2]! , biggest: biggest ? 1 : 0 },
    hints: ['Compare the whole numbers first, then the tenths, then the hundredths, then the thousandths.', 'Write each number with the same number of decimal places by adding zeros at the end.', `Now compare them like whole numbers. Which is ${biggest ? 'biggest' : 'smallest'}?`],
    alt: [...list].sort((p, q) => (biggest ? q - p : p - q))[0]! / 1000,
  };
}),

T5('Y5-FR-11', 'MA-Y5-FR-11', (r, c, L) => {
  const m: Mistake[] = [];
  if (L === 1) {
    const p = pick(r, [10, 20, 25, 30, 40, 50, 60, 75, 80]), answer = p / 100;
    mk(m, p / 10, '% means "out of 100". Divide by 100, not by 10.', answer); mk(m, p, 'That is the percentage as a number. Divide by 100 to get the decimal.', answer);
    return { text: `${c.actor} scores ${p}% in a game. Write ${p}% as a decimal.`, answer: dp3(answer), mistakes: m, params: { p },
      hints: ['Per cent means "out of 100".', `${p}% is ${p} out of 100, which is ${p}/100.`, 'Write ' + p + '/100 as a decimal.'], alt: Number((p / 100).toFixed(2)) };
  }
  if (L === 2) {
    const h = int(r, 11, 99); if (h % 10 === 0) return null;
    mk(m, h / 100, 'That is the decimal. Multiply by 100 to get the percentage.', h); mk(m, h * 10, 'That multiplies by 1,000. Multiply by 100.', h);
    return { text: `${c.actor} writes ${fd(h / 100, 2)} as a percentage. What is it, without the % sign?`, answer: h, mistakes: m, params: { h },
      hints: ['Per cent means "out of 100".', 'The two digits after the decimal point are hundredths.', 'Read those two digits as a whole number: that many hundredths is that many out of 100.'], alt: Math.round((h / 100) * 100) };
  }
  const den = pick(r, [20, 25, 50]), n = int(r, 1, den - 1), answer = (100 / den) * n;
  mk(m, n, `That is just the numerator. Scale ${n}/${den} up to a denominator of 100.`, answer); mk(m, n * den, 'Multiply the numerator by the number that takes the denominator to 100.', answer);
  return { text: `${c.actor} wins ${n} out of ${den} games. What percentage is that, without the % sign?`, answer, mistakes: m, params: { n, den },
    hints: ['Per cent means "out of 100", so aim for a denominator of 100.', `What do you multiply ${den} by to make 100?`, `Multiply the top by ${100 / den} too.`], alt: (n * 100) / den };
}),

T5('Y5-FR-12', 'MA-Y5-FR-12', (r, c, L) => {
  const m: Mistake[] = [];
  if (L === 1) {
    const [n, d] = pick(r, [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5]] as [number, number][]);
    const answer = (100 * n) / d;
    mk(m, n * 10, `That multiplies the numerator by 10. Scale ${n}/${d} up to a denominator of 100.`, answer); mk(m, 100 / d, `That is the percentage for one ${d === 2 ? 'half' : d === 4 ? 'quarter' : 'fifth'}. You need ${n} of them.`, answer);
    return { text: `${c.actor} eats ${n}/${d} of a pizza. What percentage of the pizza is that, without the % sign?`, answer, mistakes: m, params: { n, d },
      hints: [`Make the denominator 100: what do you multiply ${d} by?`, `Multiply the numerator ${n} by the same number.`, `${n}/${d} = ?/100 and the top number is the percentage.`], alt: (n * 100) / d };
  }
  const d = pick(r, [10, 20, 25, 50]), n = int(r, 1, d - 1);
  if (L === 2) {
    const answer = (100 / d) * n;
    mk(m, n, `That is just the numerator. Scale ${n}/${d} to a denominator of 100.`, answer); mk(m, 100 / d, `That is the percentage for 1/${d}. You need ${n} of them.`, answer);
    return { text: `${c.actor} answers ${n} out of ${d} questions correctly. What percentage is that, without the % sign?`, answer, mistakes: m, params: { n, d },
      hints: [`What do you multiply ${d} by to make 100?`, 'Multiply the numerator by the same number.', 'The new numerator is the percentage.'], alt: (n * 100) / d };
  }
  const answer = dp3(n / d);
  mk(m, n, 'That is the numerator. Divide by the denominator to get the decimal.', answer); mk(m, dp3((n * 100) / d), 'That is the percentage. The question asks for the decimal.', answer);
  return { text: `${c.actor} writes ${n}/${d} as a decimal. What does ${c.actor} write?`, answer, mistakes: m, params: { n, d },
    hints: [`Write ${n}/${d} as a percentage first.`, 'A percentage is a number out of 100. Divide it by 100 for the decimal.', `Move the digits of the percentage two places to the right of the point.`], alt: Number(((n * (100 / d)) / 100).toFixed(3)) };
}),

// ===== MEASUREMENT =====
T5('Y5-ME-01', 'MA-Y5-ME-01', (r, c, L) => {
  const units: [string, string, number][] = [['kilometres', 'metres', 1000], ['metres', 'centimetres', 100], ['centimetres', 'millimetres', 10], ['kilograms', 'grams', 1000], ['litres', 'millilitres', 1000]];
  const [big, small, fac] = pick(r, units);
  const lg = Math.log10(fac);
  const m: Mistake[] = [];
  if (L < 3) {
    const dpn = L === 1 ? 0 : Math.min(lg, 2);
    const mm = L === 1 ? int(r, 2, 9) : int(r, 11, 99);
    if (L === 2 && mm % 10 === 0) return null;
    const x = mm / 10 ** dpn, answer = (mm * fac) / 10 ** dpn;
    mk(m, answer * 10, `Check the conversion: 1 ${big.slice(0, -1)} = ${f(fac)} ${small}.`, answer); mk(m, answer / 10, `Check the conversion: 1 ${big.slice(0, -1)} = ${f(fac)} ${small}.`, answer);
    mk(m, x + fac, 'Converting to a smaller unit means multiplying, not adding.', answer);
    return { text: `${c.actor} measures ${dpn ? fd(x, dpn) : f(x)} ${big}. How many ${small} is that?`, answer, mistakes: m, params: { big, mm, dpn },
      hints: [`How many ${small} are in 1 ${big.slice(0, -1)}?`, `1 ${big.slice(0, -1)} = ${f(fac)} ${small}. Going to a smaller unit, so multiply.`, `Multiply by ${f(fac)}: move each digit ${lg} place${lg > 1 ? 's' : ''} to the left.`], alt: Number(((mm / 10 ** dpn) * fac).toFixed(3)) };
  }
  const v = int(r, 1100, 9999);
  const answer = dp3(v / fac);
  mk(m, v * fac, 'Converting to a bigger unit means dividing, not multiplying.', answer); mk(m, dp3(v / (fac * 10)), 'One place too many.', answer); mk(m, dp3(v / (fac / 10)), 'One place too few.', answer);
  return { text: `${c.actor} measures ${f(v)} ${small}. How many ${big} is that?`, answer, mistakes: m, params: { big, v },
    hints: [`How many ${small} are in 1 ${big.slice(0, -1)}?`, `1 ${big.slice(0, -1)} = ${f(fac)} ${small}. Going to a bigger unit, so divide.`, `Divide by ${f(fac)}: move each digit ${lg} place${lg > 1 ? 's' : ''} to the right of the decimal point.`],
    alt: Number((v / fac).toFixed(3)),
  };
}),

T5('Y5-ME-02', 'MA-Y5-ME-02', (r, c, L) => {
  const rel: [string, string, number, string][] = [['inch', 'inches', 2.5, 'cm'], ['pound', 'pounds', 450, 'g'], ['pint', 'pints', 570, 'ml'], ['foot', 'feet', 30, 'cm']];
  const [one, many, rate, metric] = pick(r, rel);
  const fact = `1 ${one} is about ${f(rate)} ${metric}`;
  const m: Mistake[] = [];
  if (L < 3) {
    const n = L === 1 ? int(r, 2, 9) : int(r, 10, 40), answer = dp3(n * rate);
    mk(m, dp3(n / rate), 'That divides. To change to the smaller metric unit you multiply.', answer); mk(m, dp3(n + rate), 'That adds. Use the fact to multiply.', answer);
    return { text: `${fact}. ${c.actor} has an item that measures ${n} ${many}. About how many ${metric} is that?`, answer, mistakes: m, params: { one, n },
      hints: [`${fact}.`, `${n} ${many} is ${n} lots of that.`, `Work out ${n} × ${f(rate)}.`], alt: Number(((n * rate * 10) / 10).toFixed(3)) };
  }
  const n = int(r, 3, 20), X = dp3(n * rate), answer = n;
  mk(m, dp3(X * rate), 'That multiplies. To go back to the imperial unit you divide.', answer); mk(m, dp3(X - rate), 'That subtracts. Divide to find how many lots fit.', answer);
  return { text: `${fact}. ${c.actor} has an item that measures ${f(X)} ${metric}. About how many ${many} is that?`, answer, mistakes: m, params: { one, X },
    hints: [`${fact}.`, `How many lots of ${f(rate)} ${metric} fit into ${f(X)} ${metric}?`, `Work out ${f(X)} ÷ ${f(rate)}.`], alt: Math.round(X / rate) };
}),

T5('Y5-ME-04', 'MA-Y5-ME-04', (r, c, L) => {
  const m: Mistake[] = [];
  if (L < 3) {
    const l = L === 1 ? int(r, 4, 12) : int(r, 12, 40), w = L === 1 ? int(r, 2, l - 1) : int(r, 6, l - 1), answer = l * w;
    mk(m, 2 * (l + w), 'That is the perimeter (distance around). Area is the space inside: length × width.', answer); mk(m, l + w, 'That adds. Area is length × width.', answer);
    return { text: `${c.actor}'s rectangular banner is ${l} m long and ${w} m wide. What is its area, in square metres?`, answer, mistakes: m, params: { l, w },
      hints: ['Area is the amount of space inside the shape.', 'For a rectangle, area = length × width.', `Work out ${l} × ${w}.`], alt: Array.from({ length: w }, () => l).reduce((x, y) => x + y, 0) };
  }
  const w = int(r, 5, 15), l = int(r, w + 1, 25), A = l * w;
  mk(m, A / l / 2, 'That halves the width. Divide the area by the length once.', w); mk(m, A - l, 'That subtracts. Use division: area ÷ length.', w);
  return { text: `${c.actor}'s rectangular banner has an area of ${A} square metres and is ${l} m long. How wide is it, in metres?`, answer: w, mistakes: m, params: { A, l },
    hints: ['Area = length × width, so width = area ÷ length.', `${l} × ? = ${A}.`, `Work out ${A} ÷ ${l}.`], alt: Math.round(A / l) };
}),

T5('Y5-ME-06', 'MA-Y5-ME-06', (r, c, L) => {
  const m: Mistake[] = [];
  if (L === 1) {
    const h = int(r, 2, 6), mi = pick(r, [5, 10, 15, 20, 25, 35, 40, 45, 50]), answer = h * 60 + mi;
    mk(m, h + mi, 'Change the hours into minutes first.', answer); mk(m, h * 100 + mi, 'There are 60 minutes in an hour, not 100.', answer);
    return { text: `${c.actor} trains for ${h} hours and ${mi} minutes. How many minutes is that altogether?`, answer, mistakes: m, params: { h, mi },
      hints: ['Change the hours into minutes first.', `${h} hours = ${h} × 60 minutes.`, `Then add the ${mi} minutes.`], alt: h * 60 + mi };
  }
  if (L === 2) {
    const d = int(r, 2, 9), h = int(r, 1, 23), answer = d * 24 + h;
    mk(m, d + h, 'Change the days into hours first.', answer); mk(m, d * 12 + h, 'There are 24 hours in a day, not 12.', answer);
    return { text: `${c.actor}'s mission lasts ${d} days and ${h} hours. How many hours is that altogether?`, answer, mistakes: m, params: { d, h },
      hints: ['Change the days into hours first.', `1 day = 24 hours, so ${d} days = ${d} × 24 hours.`, `Then add the ${h} hours.`], alt: d * 24 + h };
  }
  const n = int(r, 130, 500); if (n % 60 === 0) return null;
  const answer = n % 60;
  mk(m, Math.floor(n / 60), 'That is the number of whole hours. The question asks for the minutes left over.', answer); mk(m, n - 60, 'Take away 60 for every whole hour, not just one.', answer);
  return { text: `${c.actor}'s film lasts ${n} minutes. That is some whole hours and some minutes. How many minutes are left over after taking out the whole hours?`, answer, mistakes: m, params: { n },
    hints: ['How many whole hours fit into the minutes? There are 60 minutes in an hour.', `Find the biggest multiple of 60 that is not more than ${n}.`, `Subtract that multiple of 60 from ${n}.`], alt: n - 60 * Math.floor(n / 60) };
}),

// ===== GEOMETRY =====
T5('Y5-GPS-04', 'MA-Y5-GPS-04', (r, c, L) => {
  const m: Mistake[] = [];
  if (L === 1) {
    const a = int(r, 20, 160); if (a === 90) return null; const answer = 180 - a;
    mk(m, 90 - a, 'Angles on a straight line add up to 180°, not 90°.', answer); mk(m, 360 - a, 'Angles on a straight line add up to 180°. 360° is for angles around a point.', answer);
    return { text: `${c.actor} draws a straight line and marks an angle of ${a}° on it. The rest of the line, on the same side, is one more angle. What size is it, in degrees?`, answer, mistakes: m, params: { a },
      hints: ['Angles on a straight line add up to 180°.', `The two angles together make 180°. One is ${a}°.`, `Work out 180 − ${a}.`], alt: 180 - a };
  }
  if (L === 2) {
    const a = int(r, 60, 150), b = int(r, 60, 150), answer = 360 - a - b; if (answer < 20 || answer === a || answer === b) return null;
    mk(m, 180 - a - b, 'Angles around a point add up to 360°, not 180°.', answer); mk(m, 360 - a, 'There are two angles to take away, not one.', answer);
    return { text: `${c.actor} draws three angles that meet at a point. Two of them are ${a}° and ${b}°. What size is the third angle, in degrees?`, answer, mistakes: m, params: { a, b },
      hints: ['Angles around a point add up to 360°.', `Add the two angles you know: ${a} + ${b}.`, 'Subtract that total from 360.'], alt: 360 - (a + b) };
  }
  const a = int(r, 40, 110), b = int(r, 40, 110), cc = int(r, 40, 110), answer = 360 - a - b - cc; if (answer < 15 || [a, b, cc].includes(answer)) return null;
  mk(m, 360 - a - b, 'There are three angles to take away.', answer); mk(m, 180 - a - b - cc, 'Angles around a point add up to 360°, not 180°.', answer);
  return { text: `${c.actor} draws four angles that meet at a point. Three of them are ${a}°, ${b}° and ${cc}°. What size is the fourth angle, in degrees?`, answer, mistakes: m, params: { a, b, cc },
    hints: ['Angles around a point add up to 360°.', `Add the three angles you know.`, 'Subtract that total from 360.'], alt: 360 - (a + b + cc) };
}),

T5('Y5-GPS-05', 'MA-Y5-GPS-05', (r, c, L) => {
  const m: Mistake[] = [];
  if (L === 1) {
    const l = int(r, 8, 30), w = int(r, 3, l - 2), P = 2 * (l + w);
    mk(m, P - l, 'That takes away only one length. A rectangle has two lengths and two widths.', w); mk(m, P / 2, 'That is length + width. Subtract the length to find the width.', w); mk(m, P - 2 * l, 'That is the two widths added together. Divide by 2 for one width.', w);
    return { text: `${c.actor}'s rectangular banner has a perimeter of ${P} cm and is ${l} cm long. How wide is it, in centimetres?`, answer: w, mistakes: m, params: { P, l },
      hints: ['A rectangle has two lengths and two widths. Opposite sides are equal.', `Half the perimeter is one length plus one width: ${P} ÷ 2.`, 'Take away the length to find the width.'], alt: P / 2 - l };
  }
  if (L === 2) {
    const a = int(r, 15, 75), answer = 90 - a;
    mk(m, 180 - a, 'A corner of a rectangle is 90°, not 180°.', answer); mk(m, a, 'That is the angle you were given. Find the other part of the corner.', answer);
    return { text: `A diagonal line cuts a right-angled corner of ${c.actor}'s rectangle into two angles. One is ${a}°. What size is the other, in degrees?`, answer, mistakes: m, params: { a },
      hints: ['Every corner of a rectangle is a right angle, 90°.', 'The two angles made by the diagonal fill the corner.', `Work out 90 − ${a}.`], alt: 90 - a };
  }
  const w = int(r, 4, 20), P = 6 * w;
  mk(m, P / 4, 'That would be a square. The length is twice the width.', w); mk(m, P / 3, 'Count the sides in widths: 2 lengths (2 widths each) and 2 widths make 6 widths.', w);
  return { text: `${c.actor}'s rectangular banner is twice as long as it is wide. Its perimeter is ${P} cm. How wide is it, in centimetres?`, answer: w, mistakes: m, params: { P },
    hints: ['Draw the rectangle. One length is the same as 2 widths.', 'Count all four sides in widths: 2 + 1 + 2 + 1.', `The perimeter is 6 widths, so work out ${P} ÷ 6.`], alt: P / 6 };
}),

// ===== STATISTICS =====
T5('Y5-ST-02-timetable', 'MA-Y5-ST-02', (r, c, L) => {
  const startM = L === 1 ? 9 * 60 + int(r, 0, 20) : L === 2 ? 10 * 60 + int(r, 35, 55) : 11 * 60 + int(r, 40, 55);
  const dur = L === 1 ? int(r, 15, 35) : L === 2 ? int(r, 25, 55) : int(r, 70, 130);
  const end = startM + dur;
  const m: Mistake[] = [];
  const mm = (end % 60) - (startM % 60);
  mk(m, Math.abs(mm), 'That only compares the minutes. Count the hours as well.', dur);
  mk(m, dur + 40, 'Careful: there are 60 minutes in an hour, not 100.', dur);
  mk(m, dur - 10, 'Count on carefully from the leaving time. Go to the next hour first.', dur);
  return {
    text: `${c.actor}'s bus leaves ${c.place} at ${hm(startM)} and arrives at ${hm(end)}. How many minutes does the journey take?`,
    answer: dur, mistakes: m, params: { startM, dur },
    hints: ['Count on from the leaving time to the next whole hour.', 'Then count on from that hour to the arrival time.', 'Add the two parts together.'],
    alt: (Math.floor(end / 60) - Math.floor(startM / 60)) * 60 + (end % 60) - (startM % 60),
  };
}),

T5('Y5-ST-02-table', 'MA-Y5-ST-02', (r, c, L) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].slice(0, L === 1 ? 4 : 5);
  const vals = days.map(() => int(r, 8, 60));
  if (new Set(vals).size < vals.length) return null;
  const row = days.map((d, i) => `${d}: ${vals[i]}`).join(', ');
  const m: Mistake[] = [];
  if (L === 1) {
    const answer = vals.reduce((x, y) => x + y, 0);
    mk(m, answer - vals[vals.length - 1]!, 'Make sure you have added every day in the table.', answer);
    return { text: `${c.actor} records how many ${c.thing} were collected each day. ${row}. How many were collected in total?`, answer, mistakes: m, params: { row },
      hints: ['Add up every number in the table.', 'Add them in pairs to make it easier.', 'Check that you have used every day.'], alt: vals.reduce((x, y) => x + y, 0) };
  }
  if (L === 2) {
    const answer = Math.max(...vals) - Math.min(...vals);
    mk(m, Math.max(...vals), 'That is the biggest number. The question asks for the difference between the biggest and smallest.', answer); mk(m, Math.min(...vals), 'That is the smallest number. Find the difference.', answer);
    return { text: `${c.actor} records how many ${c.thing} were collected each day. ${row}. What is the difference between the busiest day and the quietest day?`, answer, mistakes: m, params: { row },
      hints: ['Find the biggest and the smallest number in the table.', 'The difference is how much bigger one is than the other.', 'Subtract the smallest from the biggest.'], alt: [...vals].sort((x, y) => y - x)[0]! - [...vals].sort((x, y) => x - y)[0]! };
  }
  const answer = vals[1]! + vals[3]! - vals[0]! - vals[2]!;
  if (answer <= 0) return null;
  mk(m, vals[1]! + vals[3]!, 'That is only Tue and Thu. Subtract Mon and Wed too.', answer); mk(m, vals[0]! + vals[2]! - vals[1]! - vals[3]!, 'That is the wrong way round.', answer, true);
  return { text: `${c.actor} records how many ${c.thing} were collected each day. ${row}. How many more were collected on Tue and Thu together than on Mon and Wed together?`, answer, mistakes: m, params: { row },
    hints: ['Find the total for Tue and Thu, and the total for Mon and Wed.', 'Work out each total separately.', 'Subtract the smaller total from the bigger one.'], alt: (vals[1]! + vals[3]!) - (vals[0]! + vals[2]!) };
}),
];
