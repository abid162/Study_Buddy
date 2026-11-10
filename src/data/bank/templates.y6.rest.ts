import type { Template, Mistake } from './types';
import { int, pick, f } from './rng';
import { mk } from './templates.y4';
import { TY, gcd, dp3 } from './helpers';

const T6 = TY(6);

export const Y6_REST: Template[] = [

// ===== RATIO AND PROPORTION =====
T6('Y6-RP-01', 'MA-Y6-RP-01', (r, c, L) => {
  const a = int(r, 2, L === 1 ? 4 : 7), b = int(r, 2, L === 1 ? 5 : 9); if (a === b) return null;
  const mlt = int(r, 2, L === 1 ? 5 : 12), m: Mistake[] = [];
  if (L < 3) {
    const known = a * mlt, answer = b * mlt;
    mk(m, b + (known - a), `That adds the same amount to both. In a ratio you multiply both parts by the same number.`, answer); mk(m, answer + b, 'That is one lot too many.', answer); mk(m, mlt, `That is how many lots there are. Multiply it by ${b}.`, answer);
    return { text: `${c.actor} mixes ${c.thing} and ${c.thing2} so that for every ${a} ${c.thing} there are ${b} ${c.thing2}. There are ${known} ${c.thing}. How many ${c.thing2} are there?`, answer, mistakes: m, params: { a, b, mlt },
      hints: [`The ratio is ${a} : ${b}. Find how many times ${a} goes into ${known}.`, `${known} ÷ ${a} = ${mlt}. Everything is multiplied by ${mlt}.`, `Multiply ${b} by ${mlt}.`], alt: (known / a) * b };
  }
  const known = b * mlt, answer = a * mlt;
  mk(m, a + (known - b), 'That subtracts the same amount from both. In a ratio you multiply or divide both parts by the same number.', answer); mk(m, mlt, `That is how many lots there are. Multiply it by ${a}.`, answer);
  return { text: `${c.actor} mixes ${c.thing} and ${c.thing2} so that for every ${a} ${c.thing} there are ${b} ${c.thing2}. There are ${known} ${c.thing2}. How many ${c.thing} are there?`, answer, mistakes: m, params: { a, b, mlt },
    hints: [`The ratio is ${a} : ${b}. Find how many times ${b} goes into ${known}.`, `${known} ÷ ${b} = ${mlt}. Everything is multiplied by ${mlt}.`, `Multiply ${a} by ${mlt}.`], alt: (known / b) * a };
}),

T6('Y6-RP-02', 'MA-Y6-RP-02', (r, c, L) => {
  const p = L === 1 ? pick(r, [10, 25, 50]) : L === 2 ? pick(r, [20, 30, 75, 5]) : pick(r, [15, 35, 45, 65, 12]);
  const A = int(r, 3, 40) * 20, answer = (A * p) / 100; if (!Number.isInteger(answer)) return null;
  const m: Mistake[] = [];
  mk(m, A - answer, `That is what is left. The question asks for ${p}% of the ${c.thing}.`, answer); mk(m, (A * (100 - p)) / 100, `That uses ${100 - p}% instead of ${p}%.`, answer); mk(m, p, 'That is the percentage as a number. Find that percentage of the amount.', answer);
  return {
    text: `${c.actor} has ${f(A)} ${c.thing} and gives ${p}% of them to the ${c.crowd}. How many ${c.thing} does ${c.actor} give away?`,
    answer, mistakes: m, params: { A, p },
    hints: [`${p}% means ${p} out of every 100. Start with 10% or 1%.`, `10% of ${f(A)} is ${f(A / 10)}. Build up to ${p}% from there.`, p % 10 === 0 ? `${p}% is ${p / 10} lots of 10%.` : `Split ${p}% into parts you can find, such as 10% and 5%.`],
    alt: (A / 100) * p,
  };
}),

T6('Y6-RP-04', 'MA-Y6-RP-04', (r, c, L) => {
  const a = L === 1 ? 1 : int(r, 1, 5), b = L === 1 ? int(r, 2, 4) : int(r, 2, 7); if (a === b || gcd(a, b) !== 1) return null;
  const unit = int(r, 4, 25), T = unit * (a + b), m: Mistake[] = [];
  const ask = L === 1 ? 'larger' : L === 2 ? 'smaller' : 'difference';
  const answer = ask === 'larger' ? unit * Math.max(a, b) : ask === 'smaller' ? unit * Math.min(a, b) : unit * Math.abs(a - b);
  mk(m, T / 2, 'That shares the amount equally. The ratio is unequal.', answer); mk(m, T / Math.max(a, b), `That divides by ${Math.max(a, b)}. First add the parts of the ratio to find the number of equal shares.`, answer); mk(m, unit, 'That is the value of one share. Multiply by the number of shares.', answer);
  return {
    text: `${c.actor} shares ${f(T)} ${c.thing} between two friends in the ratio ${a} : ${b}. ${ask === 'difference' ? 'How many more does the friend with the larger share get?' : `How many ${c.thing} does the friend with the ${ask} share get?`}`,
    answer, mistakes: m, params: { a, b, T, ask },
    hints: [`Add the parts of the ratio to find the total number of shares: ${a} + ${b}.`, `Divide ${f(T)} by the number of shares to find the size of one share.`, ask === 'difference' ? 'Multiply the size of one share by the difference between the two parts.' : `Multiply one share by the ${ask === 'larger' ? 'bigger' : 'smaller'} part of the ratio.`],
    alt: (T / (a + b)) * (ask === 'larger' ? Math.max(a, b) : ask === 'smaller' ? Math.min(a, b) : Math.abs(a - b)),
  };
}),

// ===== ALGEBRA =====
T6('Y6-ALG-01', 'MA-Y6-ALG-01', (r, c, L) => {
  const m: Mistake[] = [];
  if (L === 1) {
    const p = int(r, 2, 9), q = int(r, 1, 9), n = int(r, 2, 12), answer = p * n + q;
    mk(m, p * (n + q), 'Multiply first, then add. The rule is p × n + q, not p × (n + q).', answer); mk(m, p + n + q, 'p n means p times n. It is not an addition.', answer);
    return { text: `${c.actor} uses the rule C = ${p}n + ${q} to find the cost of n ${c.thing}. What is C when n = ${n}?`, answer, mistakes: m, params: { p, q, n },
      hints: [`Replace n with ${n}. ${p}n means ${p} × n.`, `Work out ${p} × ${n} first.`, `Then add ${q}.`], alt: n * p + q };
  }
  if (L === 2) {
    const l = int(r, 3, 15), w = int(r, 2, 12), answer = 2 * l + 2 * w;
    mk(m, l + w, 'That is only half the distance around. The rule has 2l and 2w.', answer); mk(m, 2 * l * w, '2l means 2 × l. Add 2l and 2w, do not multiply them.', answer);
    return { text: `${c.actor} uses the formula P = 2l + 2w to find the perimeter of a rectangle. What is P when l = ${l} and w = ${w}?`, answer, mistakes: m, params: { l, w },
      hints: [`Replace l with ${l} and w with ${w}.`, `2l means 2 × ${l}, and 2w means 2 × ${w}.`, 'Add the two answers.'], alt: l + l + w + w };
  }
  const p = int(r, 2, 6), q = int(r, 1, 8), n = int(r, 2, 9), answer = p * (n + q);
  mk(m, p * n + q, 'The brackets mean you add first: n + q, then multiply by p.', answer); mk(m, p + n + q, 'p(…) means p times everything in the brackets.', answer);
  return { text: `${c.actor} uses the rule T = ${p}(n + ${q}) to work out a total. What is T when n = ${n}?`, answer, mistakes: m, params: { p, q, n },
    hints: [`Replace n with ${n}.`, 'Work out the brackets first.', `Then multiply the result by ${p}.`], alt: p * n + p * q };
}),

T6('Y6-ALG-02', 'MA-Y6-ALG-02', (r, c, L) => {
  const a = int(r, 2, 12), s = int(r, 2, 9), m: Mistake[] = [];
  const seq = [0, 1, 2, 3].map(i => a + i * s);
  const k = L === 1 ? 5 : L === 2 ? int(r, 8, 12) : int(r, 25, 60), answer = a + (k - 1) * s;
  mk(m, a + k * s, `That counts ${k} steps. The ${k}th term is ${k - 1} steps after the first.`, answer); mk(m, k * s, 'That forgets the starting number. The rule is not just the times table.', answer); mk(m, answer - s, 'That is one term too early.', answer);
  return { text: `${c.actor} writes the sequence ${seq.join(', ')}, and keeps going in the same way. What is term number ${k}?`, answer, mistakes: m, params: { a, s, k },
    hints: ['Find the step: how much does the sequence go up each time?', `The step is ${s}. The first term is ${a}.`, `The ${k}th term is the first term plus ${k - 1} steps of ${s}.`], alt: s * k + (a - s) };
}),

T6('Y6-ALG-03', 'MA-Y6-ALG-03', (r, c, L) => {
  const m: Mistake[] = [];
  if (L === 1) {
    const x = int(r, 2, 20), q = int(r, 2, 15), R = x + q;
    mk(m, R + q, 'To undo adding, you subtract.', x); mk(m, q - R > 0 ? q - R : q, 'Subtract the number you added from the total.', x);
    return { text: `${c.actor} solves x + ${q} = ${R}. What is x?`, answer: x, mistakes: m, params: { x, q },
      hints: ['x is a missing number. What do you add to ' + q + ' to make ' + R + '?', 'Work backwards: undo the addition.', `Work out ${R} − ${q}.`], alt: R - q };
  }
  if (L === 2) {
    const x = int(r, 3, 14), p = int(r, 2, 9), R = p * x;
    mk(m, R - p, `${p}x means ${p} × x. To undo multiplying you divide.`, x); mk(m, R + p, 'To undo multiplying you divide.', x);
    return { text: `${c.actor} solves ${p}x = ${R}. What is x?`, answer: x, mistakes: m, params: { x, p },
      hints: [`${p}x means ${p} × x.`, `${p} × ? = ${R}.`, `Work out ${R} ÷ ${p}.`], alt: R / p };
  }
  const x = int(r, 3, 15), p = int(r, 2, 8), q = int(r, 2, 12), minus = r() < 0.5, R = minus ? p * x - q : p * x + q;
  mk(m, minus ? R / p + q : R / p - q, 'You must undo the addition or subtraction first, then divide.', x); mk(m, minus ? R + q : R - q, 'You still need to divide by ' + p + ' at the end.', x);
  return { text: `${c.actor} solves ${p}x ${minus ? '−' : '+'} ${q} = ${R}. What is x?`, answer: x, mistakes: m, params: { x, p, q, minus: minus ? 1 : 0 },
    hints: [`Undo the ${minus ? 'subtraction' : 'addition'} first.`, `${R} ${minus ? '+' : '−'} ${q} gives ${p}x.`, `Then divide by ${p}.`], alt: (minus ? R + q : R - q) / p };
}),

T6('Y6-ALG-04', 'MA-Y6-ALG-04', (r, c, L) => {
  const m: Mistake[] = [];
  if (L === 1) {
    const a = int(r, 2, 15), T = int(r, a + 3, 40), answer = T - a;
    mk(m, T + a, 'a + b = T means b = T − a. You need to subtract.', answer);
    return { text: `${c.actor} knows that a + b = ${T}. If a = ${a}, what is b?`, answer, mistakes: m, params: { a, T },
      hints: [`Replace a with ${a}: ${a} + b = ${T}.`, 'What do you add to ' + a + ' to make ' + T + '?', `Work out ${T} − ${a}.`], alt: T - a };
  }
  if (L === 2) {
    const a = int(r, 2, 9), b = int(r, 2, 15), T = 2 * a + b;
    mk(m, T - a, '2a means 2 × a, so take away 2a, not just a.', b); mk(m, T - a * 2 + 2, 'Check: 2a + b should make the total.', b);
    return { text: `${c.actor} knows that 2a + b = ${T}. If a = ${a}, what is b?`, answer: b, mistakes: m, params: { a, b },
      hints: [`2a means 2 × a. Work out 2 × ${a}.`, `Now 2a + b = ${T} becomes ${2 * a} + b = ${T}.`, `Work out ${T} − ${2 * a}.`], alt: T - 2 * a };
  }
  const a = int(r, 2, 8), b = int(r, 2, 8), T = 3 * a + 2 * b;
  mk(m, T - 3 * a, '2b is what is left, not b. Divide by 2.', b); mk(m, (T - a) / 2, '3a means 3 × a, so take away 3a.', b);
  return { text: `${c.actor} knows that 3a + 2b = ${T}. If a = ${a}, what is b?`, answer: b, mistakes: m, params: { a, b },
    hints: [`Work out 3a = 3 × ${a}.`, `Take it away from ${T} to find 2b.`, 'Divide by 2 to find b.'], alt: (T - 3 * a) / 2 };
}),

// ===== MEASUREMENT =====
T6('Y6-ME-02', 'MA-Y6-ME-02', (r, c, L) => {
  const units: [string, string, number][] = [['kilometres', 'metres', 1000], ['metres', 'centimetres', 100], ['kilograms', 'grams', 1000], ['litres', 'millilitres', 1000]];
  const [big, small, fac] = pick(r, units), m: Mistake[] = [];
  if (L === 1) {
    const v = int(r, 1100, 9999), answer = dp3(v / fac);
    mk(m, v * fac, 'Converting to a bigger unit means dividing.', answer); mk(m, dp3(v / (fac * 10)), 'One place too many.', answer); mk(m, dp3(v / (fac / 10)), 'One place too few.', answer);
    return { text: `${c.actor} measures ${f(v)} ${small}. How many ${big} is that?`, answer, mistakes: m, params: { big, v },
      hints: [`1 ${big.slice(0, -1)} = ${f(fac)} ${small}. Going to a bigger unit, so divide.`, `Move each digit ${Math.log10(fac)} place${fac > 10 ? 's' : ''} to the right of the decimal point.`, 'Put the decimal point in the right place.'], alt: Number((v / fac).toFixed(3)) };
  }
  if (L === 2) {
    const x = int(r, 11, 999) / 100, answer = dp3(x * fac); if (Math.round(x * 100) % 10 === 0) return null;
    mk(m, dp3(answer * 10), 'One place too many.', answer); mk(m, dp3(answer / 10), 'One place too few.', answer); mk(m, dp3(x / fac), 'Converting to a smaller unit means multiplying.', answer);
    return { text: `${c.actor} measures ${x.toFixed(2)} ${big}. How many ${small} is that?`, answer, mistakes: m, params: { big, x },
      hints: [`1 ${big.slice(0, -1)} = ${f(fac)} ${small}. Going to a smaller unit, so multiply.`, `Move each digit ${Math.log10(fac)} place${fac > 10 ? 's' : ''} to the left.`, 'Fill any gaps with zeros if needed.'], alt: Number(((Math.round(x * 100) * fac) / 100).toFixed(3)) };
  }
  const w = int(r, 1, 9), rest = int(r, 11, 99), answer = dp3(w + rest / fac);
  mk(m, dp3(w + rest / 100), `${rest} ${small} is not ${rest} hundredths. There are ${f(fac)} ${small} in 1 ${big.slice(0, -1)}.`, answer); mk(m, dp3(w * fac + rest), 'That is in the smaller unit. The question asks for the bigger unit.', answer); mk(m, dp3(w + rest), 'The small part must be changed into the bigger unit first.', answer);
  const phrase = big === 'kilograms' ? 'a parcel that weighs' : big === 'litres' ? 'a bottle that holds' : big === 'metres' ? 'a ribbon that is' : 'a path that is';
  return { text: `${c.actor} has ${phrase} ${w} ${big === 'kilograms' ? 'kg' : big === 'litres' ? 'litres' : big === 'metres' ? 'm' : 'km'} and ${rest} ${small === 'grams' ? 'g' : small === 'millilitres' ? 'ml' : small === 'centimetres' ? 'cm' : 'm'}. Write the total as a decimal number of ${big}.`, answer, mistakes: m, params: { big, w, rest },
    hints: [`Change the ${small} part into ${big} first.`, `${rest} ${small} is ${rest} ÷ ${f(fac)} of 1 ${big.slice(0, -1)}.`, 'Add it to the whole number part.'], alt: Number((w + rest / fac).toFixed(3)) };
}),

T6('Y6-ME-03', 'MA-Y6-ME-03', (r, c, L) => {
  const m: Mistake[] = [], fact = '5 miles is about 8 kilometres';
  if (L === 1) {
    const k = int(r, 2, 12), mi = 5 * k, answer = 8 * k;
    mk(m, mi * 8, `Use the fact: ${mi} miles is ${k} lots of 5 miles.`, answer); mk(m, mi + 3, 'That adds 3. Use multiplying: 5 miles → 8 km.', answer); mk(m, k * 5 / 8, 'That divides the wrong way.', answer);
    return { text: `${fact}. ${c.actor}'s run is ${mi} miles. About how many kilometres is that?`, answer, mistakes: m, params: { mi },
      hints: [`How many lots of 5 miles are in ${mi} miles?`, `${mi} ÷ 5 = ${k}. Each lot is 8 km.`, `Work out ${k} × 8.`], alt: (mi / 5) * 8 };
  }
  if (L === 2) {
    const k = int(r, 2, 12), km = 8 * k, answer = 5 * k;
    mk(m, km * 5, 'That multiplies by 5. Work out how many lots of 8 km there are.', answer); mk(m, km - 3, 'That subtracts 3. Use dividing: 8 km → 5 miles.', answer);
    return { text: `${fact}. ${c.actor}'s walk is ${km} kilometres. About how many miles is that?`, answer, mistakes: m, params: { km },
      hints: [`How many lots of 8 km are in ${km} km?`, `${km} ÷ 8 = ${k}. Each lot is 5 miles.`, `Work out ${k} × 5.`], alt: (km / 8) * 5 };
  }
  const k1 = int(r, 2, 6), k2 = int(r, 2, 6), mi = 5 * k1, km = 8 * k2, answer = 8 * k1 + km;
  mk(m, mi + km, 'You cannot add miles and kilometres. Change miles into kilometres first.', answer); mk(m, 8 * k1, 'That is only the miles part, changed into kilometres. Add the kilometres too.', answer);
  return { text: `${fact}. ${c.actor} cycles ${mi} miles and then walks ${km} kilometres. About how many kilometres is that altogether?`, answer, mistakes: m, params: { mi, km },
    hints: ['Change the miles into kilometres first so both parts are in the same unit.', `${mi} miles is ${k1} lots of 5 miles.`, `Add the ${km} km to the kilometres from the miles.`], alt: (mi / 5) * 8 + km };
}),

T6('Y6-ME-06', 'MA-Y6-ME-06', (r, c, L) => {
  const m: Mistake[] = [];
  if (L === 1) {
    const b = int(r, 4, 14), h = int(r, 3, 12), answer = b * h;
    mk(m, 2 * (b + h), 'That is not the area. Area of a parallelogram is base × height.', answer); mk(m, b + h, 'That adds. Area is base × height.', answer);
    return { text: `${c.actor}'s flag is a parallelogram with a base of ${b} cm and a perpendicular height of ${h} cm. What is its area, in square centimetres?`, answer, mistakes: m, params: { b, h },
      hints: ['The area of a parallelogram is base × perpendicular height.', 'Use the height at right angles to the base.', `Work out ${b} × ${h}.`], alt: h * b };
  }
  if (L === 2) {
    const b = 2 * int(r, 2, 9), h = int(r, 3, 12), answer = (b * h) / 2;
    mk(m, b * h, 'That is the area of a rectangle. A triangle is half of that.', answer); mk(m, b + h, 'That adds. Area is ½ × base × height.', answer);
    return { text: `${c.actor}'s pennant is a triangle with a base of ${b} cm and a perpendicular height of ${h} cm. What is its area, in square centimetres?`, answer, mistakes: m, params: { b, h },
      hints: ['A triangle is half of a rectangle with the same base and height.', 'Area = ½ × base × height.', `Work out ${b} × ${h} then halve it.`], alt: (h * b) / 2 };
  }
  const b = int(r, 4, 16), h = int(r, 3, 12), A = (b * h) / 2; if (!Number.isInteger(A)) return null;
  mk(m, A / b, 'The area was halved when it was made. Double it first.', h); mk(m, A - b, 'That subtracts. Use division.', h);
  return { text: `${c.actor}'s pennant is a triangle with an area of ${A} square centimetres and a base of ${b} cm. What is its perpendicular height, in centimetres?`, answer: h, mistakes: m, params: { A, b },
    hints: ['Area = ½ × base × height, so base × height = 2 × area.', `Work out 2 × ${A}.`, `Then divide by the base, ${b}.`], alt: (2 * A) / b };
}),

T6('Y6-ME-07', 'MA-Y6-ME-07', (r, c, L) => {
  const m: Mistake[] = [];
  if (L < 3) {
    const l = int(r, 3, L === 1 ? 9 : 15), w = int(r, 2, L === 1 ? 8 : 12), h = int(r, 2, L === 1 ? 7 : 10), answer = l * w * h;
    mk(m, l + w + h, 'That adds the edges. Volume is length × width × height.', answer); mk(m, l * w, 'That is only the area of the base. Multiply by the height too.', answer); mk(m, 2 * (l * w + w * h + l * h), 'That is the surface area. Volume is the space inside.', answer);
    return { text: `${c.actor}'s box is a cuboid, ${l} cm long, ${w} cm wide and ${h} cm high. What is its volume, in cubic centimetres?`, answer, mistakes: m, params: { l, w, h },
      hints: ['Volume is the amount of space inside. Count how many 1 cm cubes fit.', 'Volume = length × width × height.', `Multiply ${l} × ${w} first, then multiply by ${h}.`], alt: h * (w * l) };
  }
  const w = int(r, 3, 9), h = int(r, 3, 9), l = int(r, 4, 12), V = l * w * h;
  mk(m, V / w / h / 2, 'Check: length × width × height should equal the volume.', l); mk(m, V - w - h, 'Use division to find a missing edge.', l); mk(m, V / w, 'That divides by only one edge. Divide by the height too.', l);
  return { text: `${c.actor}'s cuboid has a volume of ${V} cubic centimetres. It is ${w} cm wide and ${h} cm high. How long is it, in centimetres?`, answer: l, mistakes: m, params: { V, w, h },
    hints: ['Volume = length × width × height.', `Multiply the width and height: ${w} × ${h}.`, 'Divide the volume by that answer to find the length.'], alt: V / (w * h) };
}),

// ===== GEOMETRY =====
T6('Y6-GPS-03', 'MA-Y6-GPS-03', (r, c, L) => {
  const m: Mistake[] = [];
  if (L === 1) {
    const a = int(r, 30, 90), b = int(r, 30, 90), answer = 180 - a - b; if (answer < 15 || answer === a || answer === b) return null;
    mk(m, 360 - a - b, 'The angles in a triangle add up to 180°, not 360°.', answer); mk(m, 180 - a, 'You need to take away both known angles.', answer);
    return { text: `${c.actor} draws a triangle. Two of its angles are ${a}° and ${b}°. What is the third angle, in degrees?`, answer, mistakes: m, params: { a, b },
      hints: ['The angles in a triangle add up to 180°.', `Add the two angles you know: ${a} + ${b}.`, 'Subtract that total from 180.'], alt: 180 - (a + b) };
  }
  if (L === 2) {
    const a = int(r, 60, 120), b = int(r, 60, 120), cc = int(r, 60, 120), answer = 360 - a - b - cc; if (answer < 20 || [a, b, cc].includes(answer)) return null;
    mk(m, 180 - a - b - cc, 'The angles in a quadrilateral add up to 360°, not 180°.', answer); mk(m, 360 - a - b, 'You need to take away all three known angles.', answer);
    return { text: `${c.actor} draws a four-sided shape (a quadrilateral). Three of its angles are ${a}°, ${b}° and ${cc}°. What is the fourth angle, in degrees?`, answer, mistakes: m, params: { a, b, cc },
      hints: ['The angles in a quadrilateral add up to 360°.', 'Add the three angles you know.', 'Subtract that total from 360.'], alt: 360 - (a + b + cc) };
  }
  const n = pick(r, [5, 6, 8, 9, 10, 12]), answer = ((n - 2) * 180) / n;
  mk(m, 360 / n, `That is the angle you turn through at each corner (the exterior angle). The question asks for the angle inside.`, answer); mk(m, (n - 2) * 180, 'That is the sum of all the angles. Divide by the number of angles.', answer);
  return { text: `${c.actor} draws a regular polygon with ${n} equal sides. What is the size of each angle inside the polygon, in degrees?`, answer, mistakes: m, params: { n },
    hints: ['Split the polygon into triangles from one corner. Each triangle has angles adding to 180°.', `A polygon with ${n} sides makes ${n - 2} triangles.`, `Find the total, then divide by ${n}.`], alt: (180 * n - 360) / n };
}),

T6('Y6-GPS-04', 'MA-Y6-GPS-04', (r, c, L) => {
  const m: Mistake[] = [];
  if (L === 1) {
    const rad = int(r, 3, 40), answer = 2 * rad;
    mk(m, rad / 2, 'The diameter is twice the radius, so multiply by 2.', answer); mk(m, rad + 2, 'That adds 2. The diameter is 2 × the radius.', answer);
    return { text: `${c.actor}'s circular plate has a radius of ${rad} cm. What is its diameter, in centimetres?`, answer, mistakes: m, params: { rad },
      hints: ['The radius goes from the centre to the edge. The diameter goes all the way across.', 'The diameter is twice the radius.', `Work out 2 × ${rad}.`], alt: rad + rad };
  }
  if (L === 2) {
    const d = 2 * int(r, 3, 40) + pick(r, [0, 1]), answer = d / 2;
    mk(m, d * 2, 'The radius is half the diameter, so divide by 2.', answer, true);
    return { text: `${c.actor}'s circular drum has a diameter of ${d} cm. What is its radius, in centimetres?`, answer, mistakes: m, params: { d },
      hints: ['The radius goes from the centre to the edge. The diameter goes all the way across.', 'The radius is half the diameter.', `Work out ${d} ÷ 2.`], alt: d * 0.5 };
  }
  const rad = int(r, 10, 40), diff = int(r, 3, 9), answer = 2 * (rad + diff);
  mk(m, 2 * rad + diff, 'The radius grows by the extra amount, so the diameter grows by twice as much.', answer); mk(m, rad + diff, 'That is the new radius. The question asks for the diameter.', answer);
  return { text: `${c.actor}'s first wheel has a radius of ${rad} cm. A second wheel has a radius that is ${diff} cm longer. What is the diameter of the second wheel, in centimetres?`, answer, mistakes: m, params: { rad, diff },
    hints: ['Find the radius of the second wheel first.', `The second radius is ${rad} + ${diff}.`, 'The diameter is twice the radius.'], alt: 2 * rad + 2 * diff };
}),

T6('Y6-GPS-05', 'MA-Y6-GPS-05', (r, c, L) => {
  const m: Mistake[] = [];
  if (L === 1) {
    const a = int(r, 25, 155); if (a === 90) return null; const answer = 180 - a;
    mk(m, a, 'Opposite angles are equal, but you were asked for a neighbouring angle on the same line.', answer); mk(m, 90 - a, 'Angles on a straight line add up to 180°, not 90°.', answer);
    return { text: `${c.actor} draws two straight lines that cross. One angle is ${a}°. What is the size of an angle next to it, on the same straight line, in degrees?`, answer, mistakes: m, params: { a },
      hints: ['Angles on a straight line add up to 180°.', `The angle next to ${a}° is on the same straight line.`, `Work out 180 − ${a}.`], alt: 180 - a };
  }
  if (L === 2) {
    const a = int(r, 25, 155); if (a === 90) return null; const answer = 360 - a;
    mk(m, 180 - a, 'That is only one of the other angles. There are three angles to add.', answer); mk(m, a * 3, 'The other angles are not all equal to this one.', answer);
    return { text: `${c.actor} draws two straight lines that cross, making four angles. One of the angles is ${a}°. What do the other three angles add up to, in degrees?`, answer, mistakes: m, params: { a },
      hints: ['The four angles around the crossing point add up to 360°.', `One of them is ${a}°.`, `Work out 360 − ${a}.`], alt: 360 - a };
  }
  const k = int(r, 2, 5), small = 180 / (k + 1);
  if (!Number.isInteger(small)) return null;
  const answer = small;
  mk(m, 180 / k, `That shares 180° into ${k} parts. There are ${k} + 1 parts altogether.`, answer); mk(m, 180 - small, 'That is the bigger angle. The question asks for the smaller one.', answer);
  return { text: `${c.actor} draws two angles next to each other on a straight line. One angle is ${k} times as big as the other. What is the size of the smaller angle, in degrees?`, answer, mistakes: m, params: { k },
    hints: ['Angles on a straight line add up to 180°.', `The smaller angle is 1 part and the bigger is ${k} parts.`, `Divide 180 by ${k + 1}.`], alt: 180 / (k + 1) };
}),

// ===== STATISTICS =====
T6('Y6-ST-02', 'MA-Y6-ST-02', (r, c, L) => {
  const m: Mistake[] = [];
  if (L < 3) {
    const n = L === 1 ? 3 : 5, mean = int(r, 6, 40);
    const vals: number[] = [];
    for (let i = 0; i < n - 1; i++) vals.push(mean + int(r, -5, 5));
    vals.push(mean * n - vals.reduce((x, y) => x + y, 0));
    if (vals.some(v => v < 1) || new Set(vals).size < n) return null;
    const sorted = [...vals].sort((x, y) => x - y);
    mk(m, vals.reduce((x, y) => x + y, 0), 'That is the total. Divide by how many numbers there are.', mean); mk(m, sorted[Math.floor(n / 2)]!, 'That is the middle number (median). The mean needs the total divided by the count.', mean); mk(m, sorted[n - 1]! - sorted[0]!, 'That is the range. The mean is the total divided by the count.', mean);
    return { text: `${c.actor} scores ${vals.join(', ')} in ${n} games. What is the mean score?`, answer: mean, mistakes: m, params: { vals: vals.join(',') },
      hints: ['The mean is the total divided by how many numbers there are.', 'Add up all the scores.', `Divide the total by ${n}.`], alt: vals.reduce((x, y) => x + y, 0) / n };
  }
  const mean = int(r, 8, 30), n = 4, known = [mean + int(r, -4, 4), mean + int(r, -4, 4), mean + int(r, -4, 4)];
  const answer = mean * n - known.reduce((x, y) => x + y, 0); if (answer < 1 || known.includes(answer)) return null;
  mk(m, mean, 'That is the mean, not the missing score.', answer); mk(m, mean * n, 'That is the total of all four scores. Take away the three you know.', answer); mk(m, mean - (known.reduce((x, y) => x + y, 0) - mean * 3), 'Use the total: mean × number of scores.', answer);
  return { text: `${c.actor} scores ${known.join(', ')} in three games. The mean score over four games is ${mean}. What was the score in the fourth game?`, answer, mistakes: m, params: { mean, k: known.join(',') },
    hints: [`The mean of 4 scores is the total divided by 4. So the total is ${mean} × 4.`, `Work out ${mean} × 4 to find the total of all four games.`, 'Subtract the three scores you know from that total.'], alt: mean * 4 - known.reduce((x, y) => x + y, 0) };
}),
];
