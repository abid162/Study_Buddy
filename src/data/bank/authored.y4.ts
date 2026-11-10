import type { Template, Ctx, Draft, Level, Mistake } from './types';
import { f } from './rng';
import { mk } from './templates.y4';

/**
 * Hand-written Year 4 problems (PV-08, MD-05, FR-10).
 * Numbers are fixed. Only the words (character, objects, place) change per world.
 * `alt` is an independent recomputation of the answer, checked by verify.ts.
 */
const A = (id: string, curriculumId: string, level: Level, build: (c: Ctx) => Omit<Draft, 'params'>): Template => ({
  id: `T-${id}`, curriculumId, year: 4, fixed: true, levels: [level],
  build: (_r, c) => ({ ...build(c), params: { item: id } }),
});
const M = (answer: number, rows: [number, string][], neg = false): Mistake[] => {
  const m: Mistake[] = []; for (const [v, msg] of rows) mk(m, v, msg, answer, neg); return m;
};

export const Y4_AUTHORED: Template[] = [

// ===== MA-Y4-PV-08: number and practical problems with large numbers =====
A('Y4-PV-08-1a', 'MA-Y4-PV-08', 1, c => ({
  text: `${f(6482)} ${c.crowd} came to ${c.place} this month. For a poster, ${c.actor} rounds the number to the nearest 1,000. What number goes on the poster?`,
  answer: 6000,
  mistakes: M(6000, [[7000, 'You rounded up. The hundreds digit is 4, so round down.'], [6500, 'That is rounded to the nearest 100. The poster uses the nearest 1,000.'], [6480, 'That is rounded to the nearest 10.']]),
  hints: ['Look at the hundreds digit to decide whether to round up or down.', 'The hundreds digit is 4. Is that 5 or more, or 4 or less?', 'Keep the thousands digit and make the rest zeros.'],
  alt: Math.round(6482 / 1000) * 1000,
})),
A('Y4-PV-08-1b', 'MA-Y4-PV-08', 1, c => ({
  text: `${c.actor} has ${f(3405)} ${c.thing}. How many more ${c.thing} are needed to make 4,000?`,
  answer: 595,
  mistakes: M(595, [[605, 'Check: 3,405 + 605 = 4,010, which is too many.'], [600, 'Check: 3,405 + 600 = 4,005, which is 5 too many.'], [405, 'That is the hundreds and ones of 3,405. You need the gap up to 4,000.']]),
  hints: ['Count on from 3,405 up to the next hundred, then up to 4,000.', '3,405 + 95 = 3,500. How far is it from 3,500 to 4,000?', 'Add the two jumps together: 95 and 500.'],
  alt: 4000 - 3405,
})),
A('Y4-PV-08-2a', 'MA-Y4-PV-08', 2, c => ({
  text: `${f(7250)} ${c.crowd} came to ${c.place} on Friday. On Saturday 1,000 more came. Rounded to the nearest 1,000, how many ${c.crowd} came on Saturday?`,
  answer: 8000,
  mistakes: M(8000, [[8250, 'That is the exact number. The question asks you to round to the nearest 1,000.'], [9000, 'The hundreds digit is 2, so round down, not up.'], [7000, 'That rounds Friday. Add the 1,000 first, then round.']]),
  hints: ['This has two steps: add 1,000 first, then round.', 'Saturday has 7,250 + 1,000. Then look at the hundreds digit.', 'The hundreds digit is 2, so the thousands digit stays the same.'],
  alt: Math.round((7250 + 1000) / 1000) * 1000,
})),
A('Y4-PV-08-2b', 'MA-Y4-PV-08', 2, c => ({
  text: `${c.actor} stacks ${c.thing} in rows of 25. Counting in 25s, how many ${c.thing} are there after 12 rows?`,
  answer: 300,
  mistakes: M(300, [[37, 'That adds 25 and 12. Count in 25s, twelve times.'], [250, 'That is 10 rows. There are 12 rows.'], [275, 'That is 11 rows. There are 12 rows.']]),
  hints: ['Count in 25s: 25, 50, 75, 100, and keep going.', 'Every 4 rows makes 100.', '12 rows is 3 lots of 4 rows. Work out 3 × 100.'],
  alt: 25 * 12,
})),
A('Y4-PV-08-3a', 'MA-Y4-PV-08', 3, c => ({
  text: `On three days there were ${f(9874)}, ${f(10126)} and ${f(9998)} ${c.crowd} at ${c.place}. The next day has 1,000 fewer ${c.crowd} than the busiest day. How many ${c.crowd} is that?`,
  answer: 9126,
  mistakes: M(9126, [[8998, 'That is 1,000 fewer than 9,998, but 9,998 was not the busiest day.'], [11126, 'Fewer means less. Take 1,000 away, do not add.'], [8874, 'That is 1,000 fewer than 9,874, but 9,874 was not the busiest day.']]),
  hints: ['Find the busiest day first. One of the numbers has 5 digits.', 'The busiest day is the biggest number. Which is it?', 'Now take 1,000 away from the biggest number.'],
  alt: Math.max(9874, 10126, 9998) - 1000,
})),
A('Y4-PV-08-3b', 'MA-Y4-PV-08', 3, c => ({
  text: `At midnight it is −5°C at ${c.place}. The temperature rises by 9°C by noon, then falls by 6°C by evening. What is the temperature in the evening, in °C?`,
  answer: -2,
  mistakes: M(-2, [[2, 'The answer is below zero, so it is negative.'], [10, 'A fall means you take away, not add.'], [-10, 'The temperature rises first, so you count up from −5, not down.']], true),
  hints: ['Take the two changes one at a time. A number line helps.', 'Step 1: −5 rising by 9 passes zero and ends above it.', 'Step 1 ends at a number above zero. Now fall by 6 from there.'],
  alt: -5 + 9 - 6,
})),

// ===== MA-Y4-MD-05: multiplying and adding, distributive law, scaling, correspondence =====
A('Y4-MD-05-1a', 'MA-Y4-MD-05', 1, c => ({
  text: `${c.actor} has 7 ${c.thing}. A friend has 5 times as many. How many ${c.thing} does the friend have?`,
  answer: 35,
  mistakes: M(35, [[12, '"5 times as many" means 5 lots of 7, not 5 more.'], [28, 'That is 4 lots of 7. You need 5 lots.'], [42, 'That is 6 lots of 7. You need 5 lots.']]),
  hints: ['"5 times as many" means 5 lots of the amount.', 'You need 5 lots of 7.', 'Use the 5 times table or the 7 times table. Work out 5 × 7.'],
  alt: 7 * 5,
})),
A('Y4-MD-05-1b', 'MA-Y4-MD-05', 1, c => ({
  text: `${c.actor} packs 13 ${c.thing} into each of 4 boxes. How many ${c.thing} are packed altogether?`,
  answer: 52,
  mistakes: M(52, [[17, 'That adds 13 and 4. Equal boxes means multiply.'], [43, 'You multiplied the 10 by 4 but forgot to multiply the 3 by 4.'], [48, 'That is 12 × 4. There are 13 in each box.']]),
  hints: ['Split 13 into 10 and 3.', 'Work out 10 × 4 and 3 × 4 separately.', 'Add the two answers together: 40 and 12.'],
  alt: 13 * 4,
})),
A('Y4-MD-05-2a', 'MA-Y4-MD-05', 2, c => ({
  text: `${c.actor} makes a pair from one of 5 ${c.thing} and one of 4 ${c.thing2}. How many different pairs can be made?`,
  answer: 20,
  mistakes: M(20, [[9, 'That adds 5 and 4. Each of the 5 can be paired with each of the 4.'], [10, 'That is 5 × 2. Each one can pair with all 4 of the others.'], [16, 'That is 4 × 4. There are 5 of the first kind.']]),
  hints: ['Pick just one of the first kind. How many different pairs can it make?', 'Each of the 5 can be paired with each of the 4.', 'Work out 5 × 4.'],
  alt: 5 * 4,
})),
A('Y4-MD-05-2b', 'MA-Y4-MD-05', 2, c => ({
  text: `A crate holds 24 ${c.thing}. ${c.actor} fills 6 crates. How many ${c.thing} is that altogether?`,
  answer: 144,
  mistakes: M(144, [[30, 'That adds 24 and 6. Equal crates means multiply.'], [120, 'You multiplied the 20 by 6 but forgot the 4 × 6.'], [124, 'Check 4 × 6. It is 24, not 4.']]),
  hints: ['Split 24 into 20 and 4.', 'Work out 20 × 6 and 4 × 6 separately.', 'Add the two parts: 120 and 24.'],
  alt: 24 * 6,
})),
A('Y4-MD-05-3a', 'MA-Y4-MD-05', 3, c => ({
  text: `At ${c.place}, a small banner costs £8. A large banner costs 5 times as much, and a giant banner costs 3 times as much as the large one. How much does the giant banner cost, in pounds?`,
  answer: 120,
  mistakes: M(120, [[40, 'That is the cost of the large banner. The giant one costs 3 times more.'], [16, 'That adds 8, 5 and 3. "Times as much" means multiply.'], [24, 'That is 8 × 3. The giant banner is 3 times the large one, not the small one.']]),
  hints: ['Work out the large banner first.', 'Large banner: 5 × £8. Then the giant banner is 3 times that.', 'Work out 8 × 5 = 40, then 40 × 3.'],
  alt: 8 * 5 * 3,
})),
A('Y4-MD-05-3b', 'MA-Y4-MD-05', 3, c => ({
  text: `${c.actor} works out 7 × 38 by doing 7 × 40 and then taking something off. What is 7 × 38?`,
  answer: 266,
  mistakes: M(266, [[280, 'That is 7 × 40. 38 is 2 less than 40, so you must take off 2 lots of 7.'], [14, 'That is the amount to take off (7 × 2). It is not the answer.'], [252, 'That takes off 4 lots of 7. 38 is only 2 less than 40.']]),
  hints: ['38 is 2 less than 40.', '7 × 40 = 280, but that has 2 extra lots of 7 in it.', 'Subtract 2 × 7 from 280.'],
  alt: 7 * 40 - 7 * 2,
})),

// ===== MA-Y4-FR-10: money and measure problems with decimals and fractions =====
A('Y4-FR-10-1a', 'MA-Y4-FR-10', 1, c => ({
  text: `${c.actor} buys 3 packs of ${c.thing} at £2.50 each. How much does ${c.actor} spend altogether, in pounds?`,
  answer: 7.5,
  mistakes: M(7.5, [[5.5, 'That adds 2.50 and 3. Three packs means 3 lots of £2.50.'], [7.05, 'Three lots of 50p is £1.50, not 5p. Write it as £7.50.'], [6.5, 'Check the pence: 3 × 50p = £1.50.']]),
  hints: ['Find the cost of 3 lots of £2.50.', 'Split £2.50 into £2 and 50p. Do 3 × £2 and 3 × 50p.', '3 × £2 = £6 and 3 × 50p = £1.50. Add them.'],
  alt: (250 * 3) / 100,
})),
A('Y4-FR-10-1b', 'MA-Y4-FR-10', 1, c => ({
  text: `A rope is 3.5 m long. ${c.actor} cuts off 1.25 m. How long is the piece that is left, in metres?`,
  answer: 2.25,
  mistakes: M(2.25, [[4.75, 'That adds. Cutting off means take away.'], [2.35, 'Line up the decimal points: 3.5 is the same as 3.50.'], [2.75, 'Check the hundredths: 3.50 − 1.25.']]),
  hints: ['Write 3.5 as 3.50 so both numbers have two decimal places.', 'Line up the decimal points and subtract from the right.', '3.50 − 1.25. Take away 1 first, then 0.25.'],
  alt: (350 - 125) / 100,
})),
A('Y4-FR-10-2a', 'MA-Y4-FR-10', 2, c => ({
  text: `${c.actor} spends 1/4 of £18.00 on ${c.thing}. How much is that, in pounds?`,
  answer: 4.5,
  mistakes: M(4.5, [[13.5, 'That is how much is left. The question asks how much was spent.'], [4, 'Check: 4 × 4 = 16, not 18. There is a bit left over to share.'], [4.05, '£2 ÷ 4 is 50p, so write £4.50.']]),
  hints: ['1/4 means share into 4 equal parts and take one part.', 'Split £18 into £16 and £2 and divide each by 4.', '£16 ÷ 4 = £4 and £2 ÷ 4 = 50p. Add them.'],
  alt: 1800 / 4 / 100,
})),
A('Y4-FR-10-2b', 'MA-Y4-FR-10', 2, c => ({
  text: `A bottle holds 2.4 litres of juice. ${c.actor} pours out 3/4 of it. How many litres is that?`,
  answer: 1.8,
  mistakes: M(1.8, [[0.6, 'That is one quarter. You need three quarters.'], [0.8, 'That divides by 3. Divide by 4 to find one quarter, then multiply by 3.'], [7.2, 'That is 3 × 2.4. You need three quarters of 2.4, not three lots of it.']]),
  hints: ['Find 1/4 first, then use it to find 3/4.', '2.4 ÷ 4 = 0.6. That is one quarter.', 'You need 3 quarters. Work out 3 × 0.6.'],
  alt: (24 * 3) / 4 / 10,
})),
A('Y4-FR-10-3a', 'MA-Y4-FR-10', 3, c => ({
  text: `${c.actor} buys 2 of the ${c.thing} at £3.45 each and pays with a £10 note. How much change is there, in pounds?`,
  answer: 3.1,
  mistakes: M(3.1, [[6.9, 'That is how much was spent. The question asks for the change.'], [6.55, 'That is the change for just one. Two were bought.'], [3.55, 'Check: 2 × £3.45 = £6.90, not £6.45.']]),
  hints: ['There are two steps: find the cost of 2, then find the change from £10.', '2 × £3.45: do 2 × £3 and 2 × 45p.', 'The total spent is £6.90. Work out £10 − £6.90.'],
  alt: (1000 - 2 * 345) / 100,
})),
A('Y4-FR-10-3b', 'MA-Y4-FR-10', 3, c => ({
  text: `${c.actor} cuts a 4.5 m ribbon into 5 equal pieces. How long is each piece, in metres?`,
  answer: 0.9,
  mistakes: M(0.9, [[0.09, 'Check: 5 × 0.09 = 0.45, not 4.5.'], [9, 'Check: 5 × 9 = 45, not 4.5.'], [0.45, 'Check: 5 × 0.45 = 2.25, not 4.5.']]),
  hints: ['Share 4.5 into 5 equal parts. Think of 4.5 m as 45 tenths of a metre.', '45 tenths ÷ 5 = ? tenths.', 'Write that many tenths as a decimal.'],
  alt: 45 / 5 / 10,
})),
];
