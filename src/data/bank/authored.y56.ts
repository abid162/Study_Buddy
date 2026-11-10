import type { Template, Ctx, Draft, Level } from './types';
import { f } from './rng';
import { M } from './helpers';
import { roundTo } from './templates.y4';

/**
 * Hand-written Year 5 and Year 6 problems (the statements tagged HAND).
 * Numbers are fixed; only the words (character, objects, place) change per world.
 * `alt` is an independent recomputation of each answer, checked by verify.ts.
 */
const A = (year: 5 | 6) => (id: string, curriculumId: string, level: Level, build: (c: Ctx) => Omit<Draft, 'params'> & { params?: Draft['params'] }): Template => ({
  id: `T-${id}`, curriculumId, year, fixed: true, levels: [level],
  build: (_r, c) => { const d = build(c); return { ...d, params: { item: id, ...(d.params ?? {}) } }; },
});
const A5 = A(5), A6 = A(6);

export const Y5_AUTHORED: Template[] = [

// ===== MA-Y5-PV-05: number and practical problems (place value) =====
A5('Y5-PV-05-1a', 'MA-Y5-PV-05', 1, c => ({
  text: `${f(246800)} ${c.crowd} visited ${c.place} in a year. ${c.actor} rounds this to the nearest 10,000 for a poster. What number goes on the poster?`,
  answer: 250000, alt: roundTo(246800, 10000),
  mistakes: M(250000, [[240000, 'The thousands digit is 6, so round up, not down.'], [247000, 'That is the nearest 1,000. The poster uses the nearest 10,000.'], [200000, 'That rounds to the nearest 100,000.']]),
  hints: ['Find the ten-thousands digit, then look at the digit to its right.', 'The thousands digit is 6. Is that 5 or more, or 4 or less?', 'Round up and make the rest of the digits zeros.'],
})),
A5('Y5-PV-05-1b', 'MA-Y5-PV-05', 1, c => ({
  text: `${c.actor} starts at 350,000 and counts forwards in steps of 10,000. What number is reached after 6 steps?`,
  answer: 410000, alt: 350000 + 6 * 10000,
  mistakes: M(410000, [[400000, 'That is 5 steps. Count 6.'], [420000, 'That is 7 steps. Count 6.'], [350006, 'Each step adds 10,000, not 1.']]),
  hints: ['Each step adds 10,000. Only the ten-thousands digit changes.', 'The ten-thousands digit is 5. It goes up by 1 each step.', '6 steps add 60,000 altogether.'],
})),
A5('Y5-PV-05-2a', 'MA-Y5-PV-05', 2, c => ({
  text: `A venue has ${f(48360)} seats. ${c.actor} adds 20,000 more seats. How many seats are there now, to the nearest 1,000?`,
  answer: 68000, alt: roundTo(48360 + 20000, 1000),
  mistakes: M(68000, [[68360, 'That is the exact number. The question asks for the nearest 1,000.'], [69000, 'The hundreds digit is 3, so round down.'], [48000, 'Add the 20,000 first, then round.']]),
  hints: ['This has two steps: add first, then round.', 'Adding 20,000 changes only the ten-thousands digit.', 'Look at the hundreds digit of the new number to round to the nearest 1,000.'],
})),
A5('Y5-PV-05-2b', 'MA-Y5-PV-05', 2, c => ({
  text: `${c.actor} has four totals of ${c.thing}: 345,210, 345,021, 354,120 and 345,201. Which is the second largest total?`,
  answer: 345210, params: { shown: 345210 }, alt: [345210, 345021, 354120, 345201].sort((a, b) => b - a)[1]!,
  mistakes: M(345210, [[354120, 'That is the largest total, not the second largest.'], [345201, 'That is the third largest.'], [345021, 'That is the smallest.']]),
  hints: ['Put the numbers in order. Start by finding the largest.', 'Three numbers start 345. Compare their tens and ones.', 'The largest is the one with 354 at the start. Then order the other three.'],
})),
A5('Y5-PV-05-3a', 'MA-Y5-PV-05', 3, c => ({
  text: `${c.actor}'s submarine is at −45 m (45 m below sea level). It rises 28 m, then dives 60 m. What is its position now, in metres?`,
  answer: -77, alt: -45 + 28 - 60,
  mistakes: M(-77, [[77, 'The submarine is below sea level, so the number is negative.'], [-17, 'That is the position after rising only. It then dives 60 m.'], [-133, 'Rising means going up, so add 28, not subtract it.']], true),
  hints: ['Use a number line. Going up means adding, going down means subtracting.', 'Step 1: from −45, rise 28 m. Where is that?', 'Step 2: from there, go down 60 m.'],
})),
A5('Y5-PV-05-3b', 'MA-Y5-PV-05', 3, c => ({
  text: `${c.actor} reads MDCCCLXXXVIII on a plaque at ${c.place}. It is the year the club was founded. In which year does the club turn 150?`,
  answer: 2038, alt: (1000 + 800 + 80 + 8) + 150,
  mistakes: M(2038, [[1888, 'That is the founding year. The question asks for 150 years later.'], [1738, 'Turning 150 means adding 150, not taking it away.'], [2188, 'Check the Roman numerals: MDCCCLXXXVIII = 1000 + 800 + 80 + 8.']]),
  hints: ['First change the Roman numeral into a normal number.', 'M = 1,000, DCCC = 800, LXXX = 80, VIII = 8.', 'Add 150 to the year the club was founded.'],
})),

// ===== MA-Y5-AS-04: multi-step addition and subtraction =====
A5('Y5-AS-04-1a', 'MA-Y5-AS-04', 1, c => ({
  text: `On Friday ${f(24500)} ${c.crowd} came to ${c.place}. On Saturday ${f(8750)} more ${c.crowd} came than on Friday. How many came over the two days?`,
  answer: 57750, alt: 24500 + (24500 + 8750),
  mistakes: M(57750, [[33250, 'That is only Saturday. Add Friday too.'], [42000, 'Saturday is 8,750 more than Friday, not 8,750 more than Saturday.']]),
  hints: ['Work out Saturday first. It is Friday plus 8,750.', 'Then add Friday and Saturday together.', 'Line up the columns carefully.'],
})),
A5('Y5-AS-04-1b', 'MA-Y5-AS-04', 1, c => ({
  text: `${c.actor} has ${f(52000)} ${c.thing}. ${c.actor} sells ${f(18400)} in January and ${f(15650)} in February. How many ${c.thing} are left?`,
  answer: 17950, alt: 52000 - (18400 + 15650),
  mistakes: M(17950, [[33600, 'That only takes away January. February sales must come off too.'], [36350, 'That only takes away February. January sales must come off too.'], [86050, 'That adds all three numbers. Sales mean taking away.']]),
  hints: ['There are two amounts to take away.', 'Take away January first, then February. Or add the two sales and take away once.', 'Check by adding your answer to both sales. You should get 52,000.'],
})),
A5('Y5-AS-04-2a', 'MA-Y5-AS-04', 2, c => ({
  text: `The ticket office at ${c.place} sold ${f(36480)} tickets in the morning and ${f(41275)} in the afternoon. It had ${f(100000)} tickets to sell. How many tickets are unsold?`,
  answer: 22245, alt: 100000 - 36480 - 41275,
  mistakes: M(22245, [[77755, 'That is how many were sold. The question asks how many are unsold.'], [63520, 'That only takes away the morning sales.'], [58725, 'That only takes away the afternoon sales.']]),
  hints: ['Find how many were sold altogether first.', 'Add the morning and afternoon sales.', 'Subtract that total from 100,000.'],
})),
A5('Y5-AS-04-2b', 'MA-Y5-AS-04', 2, c => ({
  text: `There are ${f(80000)} ${c.crowd} at ${c.place}. ${f(12350)} leave at half time, then ${f(5800)} more arrive. How many ${c.crowd} are there now?`,
  answer: 73450, alt: 80000 + 5800 - 12350,
  mistakes: M(73450, [[61850, 'People arriving means adding, not taking away.'], [98150, 'People leaving means taking away, not adding.'], [67650, 'That forgets the 5,800 who arrive.']]),
  hints: ['There are two changes. Think about whether each one adds or takes away.', 'Leaving takes away. Arriving adds.', 'Do the two steps one after the other.'],
})),
A5('Y5-AS-04-3a', 'MA-Y5-AS-04', 3, c => ({
  text: `${c.actor}'s club raised £${f(256400)} in year 1. In year 2 it raised £${f(38750)} less than in year 1. In year 3 it raised £${f(120000)} more than in year 2. How much did the club raise altogether, in pounds?`,
  answer: 811700, alt: 256400 + (256400 - 38750) + (256400 - 38750 + 120000),
  mistakes: M(811700, [[474050, 'That leaves out year 3.'], [966700, '"Less than" means take away, not add.'], [217650, 'That is year 2 only. Find all three years and add them.']]),
  hints: ['Work out each year one at a time. Year 2 is less than year 1.', 'Year 3 is more than year 2, not more than year 1.', 'Add the three years together at the end.'],
})),
A5('Y5-AS-04-3b', 'MA-Y5-AS-04', 3, c => ({
  text: `${c.actor} plans to make ${f(600000)} ${c.thing}. In week 1 ${c.actor} makes ${f(148250)}. In week 2 ${c.actor} makes ${f(97500)} fewer than in week 1. How many ${c.thing} still need to be made?`,
  answer: 401000, alt: 600000 - 148250 - (148250 - 97500),
  mistakes: M(401000, [[206000, '"Fewer" means take away from week 1, not add.'], [451750, 'That only takes away week 1. Week 2 must come off too.'], [549250, 'That only takes away week 2. Week 1 must come off too.']]),
  hints: ['Find the number made in week 2 first. It is fewer than week 1.', 'Add the two weeks to find the total made.', 'Subtract the total made from the plan of 600,000.'],
})),

// ===== MA-Y5-MD-09: problems with factors, multiples, squares and cubes =====
A5('Y5-MD-09-1a', 'MA-Y5-MD-09', 1, c => ({
  text: `${c.actor} has 36 ${c.thing} and puts them in equal rows with none left over. A row of 1 or a single row of 36 is allowed. How many different row lengths are possible?`,
  answer: 9, alt: Array.from({ length: 36 }, (_, i) => i + 1).filter(x => 36 % x === 0).length,
  mistakes: M(9, [[8, 'Do not leave out 1 or 36. Both are factors.'], [4, 'That counts factor pairs. You need every different factor.'], [6, 'Check for more factors. Try every number from 1 up to 36.']]),
  hints: ['Each row length is a factor of 36.', 'Find them in pairs: 1 × 36, 2 × 18, and so on.', 'Count every number in your pairs. Do not count a number twice.'],
})),
A5('Y5-MD-09-1b', 'MA-Y5-MD-09', 1, c => ({
  text: `${c.actor} makes a square patio from square tiles with 7 tiles along each side. How many tiles are needed?`,
  answer: 49, alt: 7 * 7,
  mistakes: M(49, [[14, 'That is 7 + 7. A square patio has 7 rows of 7.'], [28, 'That is 7 × 4, which counts the edge. You need the whole square.'], [343, 'That is 7 cubed. A flat patio is 7 squared.']]),
  hints: ['A square patio has the same number of rows as tiles in each row.', '7 rows of 7 tiles.', 'Work out 7 × 7.'],
})),
A5('Y5-MD-09-2a', 'MA-Y5-MD-09', 2, c => ({
  text: `Two lights at ${c.place} flash together at the start. One flashes every 6 seconds and the other every 8 seconds. How many times do they flash together in the next 120 seconds, not counting the start?`,
  answer: 5, alt: Array.from({ length: 120 }, (_, i) => i + 1).filter(s => s % 6 === 0 && s % 8 === 0).length,
  mistakes: M(5, [[6, 'Do not count the start. They flash together at 24, 48, 72, 96 and 120 seconds.'], [4, 'Include the flash at 120 seconds.'], [20, 'That is how many times the first light flashes in 120 seconds. You need when both flash together.']]),
  hints: ['They flash together at common multiples of 6 and 8.', 'Find the lowest common multiple of 6 and 8.', 'How many times does that number go into 120?'],
})),
A5('Y5-MD-09-2b', 'MA-Y5-MD-09', 2, c => ({
  text: `${c.actor} builds a big cube from small cubes. It is 4 small cubes long, 4 wide and 4 high. How many small cubes are used?`,
  answer: 64, alt: 4 * 4 * 4,
  mistakes: M(64, [[12, 'That is 4 + 4 + 4. A cube is 4 × 4 × 4.'], [16, 'That is one layer of the cube. There are 4 layers.'], [48, 'That is 4 × 4 × 3. There are 4 layers, not 3.']]),
  hints: ['One layer is 4 rows of 4 cubes.', 'There are 4 layers in the cube.', 'Work out 4 × 4 × 4. This is 4 cubed.'],
})),
A5('Y5-MD-09-3a', 'MA-Y5-MD-09', 3, c => ({
  text: `${c.actor} is thinking of a number. It is a square number, it is a multiple of 7 and it is between 100 and 200. What is the number?`,
  answer: 196, alt: Array.from({ length: 99 }, (_, i) => i + 101).filter(n => Number.isInteger(Math.sqrt(n)) && n % 7 === 0)[0]!,
  mistakes: M(196, [[49, '49 is a square and a multiple of 7, but it is not between 100 and 200.'], [147, '147 is a multiple of 7, but it is not a square number.'], [169, '169 is a square number, but it is not a multiple of 7.']]),
  hints: ['List the square numbers between 100 and 200.', 'They are 11², 12², 13² and 14². Work out each one.', 'Check each one: is it a multiple of 7?'],
})),
A5('Y5-MD-09-3b', 'MA-Y5-MD-09', 3, c => ({
  text: `${c.actor} is thinking of an even number. It is a cube number and it is between 50 and 150. What is the number?`,
  answer: 64, alt: Array.from({ length: 99 }, (_, i) => i + 51).filter(n => Number.isInteger(Math.round(Math.cbrt(n))) && Math.round(Math.cbrt(n)) ** 3 === n && n % 2 === 0)[0]!,
  mistakes: M(64, [[125, '125 is a cube (5 × 5 × 5), but it is odd.'], [216, '216 is a cube, but it is bigger than 150.'], [100, '100 is a square number, not a cube number.']]),
  hints: ['List the cube numbers by multiplying: 1 × 1 × 1, 2 × 2 × 2, 3 × 3 × 3 and so on.', 'Which of them are between 50 and 150?', 'Which one of those is even?'],
})),

// ===== MA-Y5-MD-10: mixed four-operation problems, meaning of equals =====
A5('Y5-MD-10-1a', 'MA-Y5-MD-10', 1, c => ({
  text: `${c.actor} writes 8 × 7 = 50 + ☐. What number goes in the box?`,
  answer: 6, alt: 8 * 7 - 50,
  mistakes: M(6, [[56, 'That is the answer to 8 × 7. The two sides must be equal.'], [58, 'That adds 8 and 50. The left side is 8 × 7.'], [106, 'That adds 56 and 50. Both sides must have the same value.']]),
  hints: ['The equals sign means both sides have the same value.', 'Work out the left side first: 8 × 7.', 'What do you add to 50 to make that number?'],
})),
A5('Y5-MD-10-1b', 'MA-Y5-MD-10', 1, c => ({
  text: `${c.actor} has 4 bags with 12 ${c.thing} in each bag, and 5 more ${c.thing} loose. How many ${c.thing} are there altogether?`,
  answer: 53, alt: 12 + 12 + 12 + 12 + 5,
  mistakes: M(53, [[21, 'That adds 4, 12 and 5. Each of the 4 bags has 12.'], [68, 'That is 4 × 17. The 5 loose ones are not in the bags.'], [48, 'That forgets the 5 loose ones.']]),
  hints: ['There are two parts: the bags and the loose ones.', 'Work out the number in the bags first.', 'Then add the loose ones.'],
})),
A5('Y5-MD-10-2a', 'MA-Y5-MD-10', 2, c => ({
  text: `${c.actor} writes 15 + 9 = 6 × ☐. What number goes in the box?`,
  answer: 4, alt: (15 + 9) / 6,
  mistakes: M(4, [[24, 'That is the value of the left side. You need the number that is multiplied by 6.'], [144, 'That is 24 × 6. Divide, do not multiply.'], [3, 'Check: 6 × 3 = 18, not 24.']]),
  hints: ['The two sides of an equals sign have the same value.', 'Work out the left side: 15 + 9.', 'What number multiplied by 6 gives that answer?'],
})),
A5('Y5-MD-10-2b', 'MA-Y5-MD-10', 2, c => ({
  text: `Tickets for ${c.place} cost £8 for an adult and £5 for a child. ${c.actor} buys 3 adult tickets and 4 child tickets and pays with a £50 note. How much change is there, in pounds?`,
  answer: 6, alt: 50 - (3 * 8 + 4 * 5),
  mistakes: M(6, [[44, 'That is how much was spent. The question asks for the change.'], [26, 'That only takes away the adult tickets. The child tickets must come off too.'], [30, 'That only takes away the child tickets. The adult tickets must come off too.']]),
  hints: ['Find the cost of the adult tickets and the cost of the child tickets.', 'Add the two costs to find the total spent.', 'Take the total away from £50.'],
})),
A5('Y5-MD-10-3a', 'MA-Y5-MD-10', 3, c => ({
  text: `${c.actor} has ${f(1260)} ${c.thing}. They are packed into boxes of 15. ${c.actor} sells 12 of the boxes. How many ${c.thing} are left?`,
  answer: 1080, alt: 1260 - 12 * 15,
  mistakes: M(1080, [[72, 'That is the number of boxes left. The question asks for the number of items.'], [1248, 'That takes 12 away from the number of items. Each box holds 15.'], [180, 'That is the number of items in the 12 boxes sold. Take it away from the total.']]),
  hints: ['Find how many items are in the 12 boxes that were sold.', 'Then subtract that from the total number of items.', 'You can also find the number of boxes first: 1,260 ÷ 15.'],
})),
A5('Y5-MD-10-3b', 'MA-Y5-MD-10', 3, c => ({
  text: `${c.actor} writes 72 ÷ 8 + 4 × 3 = ☐ + 9. What number goes in the box?`,
  answer: 12, alt: 72 / 8 + 4 * 3 - 9,
  mistakes: M(12, [[21, 'That is the value of the left side. You still need to take away 9.'], [30, 'Remember to do multiplication and division before addition: 4 × 3 first.'], [9, 'Check: 9 + 9 = 18, which is not the left side.']]),
  hints: ['Work out the left side first. Divide and multiply before you add.', '72 ÷ 8 = 9 and 4 × 3 = 12. Add them together.', 'What do you add to 9 to make that total?'],
})),

// ===== MA-Y5-MD-11: scaling by simple fractions; simple rates =====
A5('Y5-MD-11-1a', 'MA-Y5-MD-11', 1, c => ({
  text: `${c.actor}'s rope is 24 m long. A second rope is 1/4 as long. How long is the second rope, in metres?`,
  answer: 6, alt: 24 / 4,
  mistakes: M(6, [[96, '1/4 as long means shorter, so divide, do not multiply.'], [20, 'That takes 4 away. 1/4 means divide by 4.'], [12, 'That is half. 1/4 means divide by 4.']]),
  hints: ['1/4 of a length means sharing it into 4 equal parts and taking one part.', 'Divide 24 by 4.', 'Check: 4 lots of your answer make 24.'],
})),
A5('Y5-MD-11-1b', 'MA-Y5-MD-11', 1, c => ({
  text: `${c.actor} reads 15 pages in 1 hour. At the same rate, how many pages does ${c.actor} read in 4 hours?`,
  answer: 60, alt: 15 + 15 + 15 + 15,
  mistakes: M(60, [[19, 'That adds 15 and 4. Each hour is 15 pages.'], [45, 'That is 3 hours. You need 4 hours.'], [75, 'That is 5 hours. You need 4 hours.']]),
  hints: ['The same rate means the same number of pages every hour.', '4 hours is 4 lots of 1 hour.', 'Work out 4 × 15.'],
})),
A5('Y5-MD-11-2a', 'MA-Y5-MD-11', 2, c => ({
  text: `${c.actor}'s toy is 36 cm tall. A model of it is 3/4 as tall. How tall is the model, in centimetres?`,
  answer: 27, alt: (36 / 4) * 3,
  mistakes: M(27, [[9, 'That is 1/4. You need 3/4.'], [48, 'That is 4/3 of 36. 3/4 as tall means shorter.'], [33, 'That takes 3 away. Find 1/4 first, then multiply by 3.']]),
  hints: ['Find 1/4 of 36 first.', '36 ÷ 4 = 9. That is one quarter.', 'You need 3 quarters. Multiply by 3.'],
})),
A5('Y5-MD-11-2b', 'MA-Y5-MD-11', 2, c => ({
  text: `A machine at ${c.place} packs 45 bags of ${c.thing} in 5 minutes. At the same rate, how many bags does it pack in 12 minutes?`,
  answer: 108, alt: (45 / 5) * 12,
  mistakes: M(108, [[9, 'That is how many bags per minute. You need 12 minutes.'], [540, 'That multiplies 45 by 12. First find the rate for 1 minute.'], [57, 'That adds 45 and 12. Use the rate.']]),
  hints: ['Find how many bags the machine packs in 1 minute.', '45 ÷ 5 = 9 bags each minute.', 'Multiply by 12 minutes.'],
})),
A5('Y5-MD-11-3a', 'MA-Y5-MD-11', 3, c => ({
  text: `${c.actor} cycles 6 km in 15 minutes at a steady speed. At the same speed, how far does ${c.actor} cycle in 1 hour, in kilometres?`,
  answer: 24, alt: 6 * (60 / 15),
  mistakes: M(24, [[90, 'That multiplies 6 by 15. Find how many 15-minute blocks fit in an hour.'], [21, 'That adds. The distance grows in equal steps.'], [12, 'That is 30 minutes. An hour is 60 minutes.']]),
  hints: ['How many 15-minute blocks are in 1 hour?', 'There are 4 blocks of 15 minutes in an hour.', 'Each block is 6 km. Work out 4 × 6.'],
})),
A5('Y5-MD-11-3b', 'MA-Y5-MD-11', 3, c => ({
  text: `A recipe for 8 people uses 360 g of flour. ${c.actor} scales it down for 6 people, which is 3/4 of the amount. How much flour is needed, in grams?`,
  answer: 270, alt: (360 / 4) * 3,
  mistakes: M(270, [[45, 'That is the amount for 1 person. You need 6 people.'], [180, 'That is half. 6 people is 3/4 of 8 people.'], [90, 'That is 1/4. You need 3/4.']]),
  hints: ['3/4 of the amount means 3 out of every 4 equal parts.', 'Find 1/4 of 360 first.', 'Multiply that by 3.'],
})),

// ===== MA-Y5-FR-10: problems with numbers up to three decimal places =====
A5('Y5-FR-10-1a', 'MA-Y5-FR-10', 1, c => ({
  text: `${c.actor} runs 2.35 km on Monday and 1.8 km on Tuesday. How far does ${c.actor} run altogether, in kilometres?`,
  answer: 4.15, alt: (235 + 180) / 100,
  mistakes: M(4.15, [[2.53, 'Line up the decimal points. 1.8 is the same as 1.80.'], [3.53, 'Line up the decimal points and add each column.']]),
  hints: ['Write 1.8 as 1.80 so both numbers have two decimal places.', 'Line up the decimal points.', 'Add the hundredths, then the tenths, then the ones.'],
})),
A5('Y5-FR-10-1b', 'MA-Y5-FR-10', 1, c => ({
  text: `${c.actor}'s bag weighs 1.250 kg and a box weighs 0.875 kg. How much heavier is the bag than the box, in kilograms?`,
  answer: 0.375, alt: (1250 - 875) / 1000,
  mistakes: M(0.375, [[2.125, 'That adds. "How much heavier" means find the difference.'], [0.425, 'Line up the decimal points and subtract each column carefully.'], [0.625, 'Check the exchange from the next column when you subtract.']]),
  hints: ['Finding how much heavier means subtracting.', 'Line up the decimal points: 1.250 − 0.875.', 'Subtract the thousandths first. Exchange if you need to.'],
})),
A5('Y5-FR-10-2a', 'MA-Y5-FR-10', 2, c => ({
  text: `${c.actor} has two cords. One is 3.456 m long and the other is 2.78 m long. How long are they together, in metres?`,
  answer: 6.236, alt: (3456 + 2780) / 1000,
  mistakes: M(6.236, [[3.734, 'Line up the decimal points. 2.78 is the same as 2.780.'], [5.234, 'Write 2.78 as 2.780 and add each column.']]),
  hints: ['Write 2.78 as 2.780 so both numbers have three decimal places.', 'Line up the decimal points.', 'Add from the thousandths column, carrying when needed.'],
})),
A5('Y5-FR-10-2b', 'MA-Y5-FR-10', 2, c => ({
  text: `${c.actor} has a jug with 2.5 litres of juice. ${c.actor} pours 0.375 litres into each of 4 cups. How much juice is left in the jug, in litres?`,
  answer: 1, alt: (2500 - 4 * 375) / 1000,
  mistakes: M(1, [[2.125, 'That only takes away one cup. There are 4 cups.'], [1.5, 'That is how much was poured. The question asks how much is left.']]),
  hints: ['Find out how much juice is poured into all 4 cups.', 'Work out 4 × 0.375.', 'Subtract that from 2.5.'],
})),
A5('Y5-FR-10-3a', 'MA-Y5-FR-10', 3, c => ({
  text: `${c.actor} jumps 4.3 m in the first round and 4.275 m in the second round. How much longer is the first jump, in metres?`,
  answer: 0.025, alt: (4300 - 4275) / 1000,
  mistakes: M(0.025, [[0.25, 'Line up the decimal points: 4.300 − 4.275.'], [0.075, 'Write 4.3 as 4.300 and subtract each column.'], [0.125, 'Check the thousandths: 0 − 5 needs an exchange.']]),
  hints: ['Write 4.3 as 4.300 so both numbers have three decimal places.', 'Line up the decimal points and subtract.', 'The answer is smaller than 0.1. Check your decimal point.'],
})),
A5('Y5-FR-10-3b', 'MA-Y5-FR-10', 3, c => ({
  text: `${c.actor} has 12 packs of ${c.thing}. Each pack weighs 0.125 kg. How much do the 12 packs weigh altogether, in kilograms?`,
  answer: 1.5, alt: (125 * 12) / 1000,
  mistakes: M(1.5, [[15, 'The decimal point is two places too far right.'], [1.25, 'That is 10 of the blocks. There are 12.'], [0.137, 'That adds 0.125 and 12. Each block weighs 0.125 kg, so multiply.']]),
  hints: ['Multiply 0.125 by 12.', 'Ignore the decimal point and work out 125 × 12.', 'Put the decimal point back so the answer has three decimal places.'],
})),

// ===== MA-Y5-ME-07: four operations with measures in decimal notation =====
A5('Y5-ME-07-1a', 'MA-Y5-ME-07', 1, c => ({
  text: `${c.actor} has a ribbon that is 2.5 m long. ${c.actor} cuts off 4 pieces, each 0.35 m long. How much ribbon is left, in metres?`,
  answer: 1.1, alt: (250 - 4 * 35) / 100,
  mistakes: M(1.1, [[1.4, 'That is the total length cut off. The question asks how much is left.'], [2.15, 'That only takes away one piece. 4 pieces are cut off.']]),
  hints: ['Find the total length of the 4 pieces first.', 'Work out 4 × 0.35.', 'Take that away from 2.5.'],
})),
A5('Y5-ME-07-1b', 'MA-Y5-ME-07', 1, c => ({
  text: `${c.actor} buys 3 ${c.thing} at £1.45 each and 1 poster for £2.30. How much does ${c.actor} spend altogether, in pounds?`,
  answer: 6.65, alt: (3 * 145 + 230) / 100,
  mistakes: M(6.65, [[3.75, 'That only counts one of the £1.45 items. There are 3.'], [4.35, 'That forgets the poster.']]),
  hints: ['Find the cost of the 3 items first.', 'Work out 3 × £1.45.', 'Then add the poster.'],
})),
A5('Y5-ME-07-2a', 'MA-Y5-ME-07', 2, c => ({
  text: `A tank at ${c.place} holds 20 litres of water. ${c.actor} uses 3.75 litres a day for 4 days. How many litres are left?`,
  answer: 5, alt: 20 - 4 * 3.75,
  mistakes: M(5, [[15, 'That is how much was used. The question asks how much is left.'], [16.25, 'That is the amount left after 1 day. There are 4 days.']]),
  hints: ['Find how much is used in the 4 days.', 'Work out 4 × 3.75.', 'Take that away from 20.'],
})),
A5('Y5-ME-07-2b', 'MA-Y5-ME-07', 2, c => ({
  text: `Bags of flour each weigh 1.5 kg. ${c.actor} needs 12.6 kg of flour. How many bags must ${c.actor} buy?`,
  answer: 9, alt: Math.ceil(12.6 / 1.5),
  mistakes: M(9, [[8, '8 bags only gives 12 kg, which is not enough. Round up.'], [8.4, 'You cannot buy part of a bag. Round up to a whole bag.'], [10, '10 bags would be more than needed. Check 9 × 1.5.']]),
  hints: ['Divide the weight needed by the weight of one bag.', '12.6 ÷ 1.5 does not come out exactly.', 'You must have enough flour, so round up to the next whole bag.'],
})),
A5('Y5-ME-07-3a', 'MA-Y5-ME-07', 3, c => ({
  text: `${c.thing[0]!.toUpperCase()}${c.thing.slice(1)} are sold in packs of 6 for £4.80. How much do 9 ${c.thing} cost at the same price each, in pounds?`,
  answer: 7.2, alt: (480 / 6) * 9 / 100,
  mistakes: M(7.2, [[0.8, 'That is the price of one. You need 9.'], [43.2, 'That is 9 whole packs. You need 9 single items.'], [7.8, 'That adds 3. Use the price of one item.']]),
  hints: ['Find the cost of 1 item first.', '£4.80 ÷ 6.', 'Multiply that by 9.'],
})),
A5('Y5-ME-07-3b', 'MA-Y5-ME-07', 3, c => ({
  text: `${c.actor}'s path at ${c.place} is 1.2 km long. ${c.actor} walks along it 5 times and then walks another 0.75 km. How far does ${c.actor} walk altogether, in kilometres?`,
  answer: 6.75, alt: (5 * 120 + 75) / 100,
  mistakes: M(6.75, [[6, 'That forgets the extra 0.75 km.'], [1.95, 'That adds 1.2 and 0.75. The path is walked 5 times.'], [7.5, 'Check 5 × 1.2 = 6, then add 0.75.']]),
  hints: ['Find the distance for 5 walks along the path first.', 'Work out 5 × 1.2.', 'Then add the extra 0.75 km.'],
})),
];

export const Y6_AUTHORED: Template[] = [

// ===== MA-Y6-PV-04: number and practical problems (up to 10,000,000) =====
A6('Y6-PV-04-1a', 'MA-Y6-PV-04', 1, c => ({
  text: `${c.actor}'s factory made ${f(4382615)} ${c.thing} last year. ${c.actor} rounds this to the nearest million for a report. What number goes in the report?`,
  answer: 4000000, alt: roundTo(4382615, 1000000),
  mistakes: M(4000000, [[5000000, 'The hundred-thousands digit is 3, so round down.'], [4400000, 'That is the nearest 100,000. The report uses the nearest million.'], [4380000, 'That is the nearest 10,000.']]),
  hints: ['Find the millions digit, then look at the digit to its right.', 'The hundred-thousands digit is 3. Is that 5 or more?', 'Round down and make every other digit zero.'],
})),
A6('Y6-PV-04-1b', 'MA-Y6-PV-04', 1, c => ({
  text: `${c.actor} starts at 2,350,000 and counts forwards in steps of 100,000. What number is reached after 7 steps?`,
  answer: 3050000, alt: 2350000 + 7 * 100000,
  mistakes: M(3050000, [[2950000, 'That is 6 steps. Count 7.'], [3150000, 'That is 8 steps. Count 7.'], [2350007, 'Each step adds 100,000, not 1.']]),
  hints: ['Each step adds 100,000. Only the hundred-thousands digit changes at first.', '7 steps add 700,000 altogether.', 'Watch out when the hundred-thousands digit passes 9: it carries into the millions.'],
})),
A6('Y6-PV-04-2a', 'MA-Y6-PV-04', 2, c => ({
  text: `${c.actor} has three totals of ${c.thing}: 6,507,240, 6,057,420 and 6,570,042. What is the difference between the largest and the smallest total?`,
  answer: 512622, alt: Math.max(6507240, 6057420, 6570042) - Math.min(6507240, 6057420, 6570042),
  mistakes: M(512622, [[62802, 'That is the difference between the largest and the middle total.'], [449820, 'That is the difference between the middle and smallest total.']]),
  hints: ['Find the largest and the smallest total first.', 'Compare from the millions, then the hundred-thousands, then the ten-thousands.', 'Subtract the smallest from the largest.'],
})),
A6('Y6-PV-04-2b', 'MA-Y6-PV-04', 2, c => ({
  text: `${f(7250000)} ${c.crowd} visited ${c.place} one year. The next year there were 1,000,000 fewer. Rounded to the nearest 100,000, how many ${c.crowd} visited the next year?`,
  answer: 6300000, alt: roundTo(7250000 - 1000000, 100000),
  mistakes: M(6300000, [[6200000, 'The ten-thousands digit is 5, so round up (exactly halfway rounds up).'], [6250000, 'That is the exact number. The question asks for the nearest 100,000.'], [7300000, 'Take the 1,000,000 away first, then round.']]),
  hints: ['This has two steps: subtract first, then round.', 'Subtracting 1,000,000 changes only the millions digit.', 'Look at the ten-thousands digit of the new number. Exactly 5 rounds up.'],
})),
A6('Y6-PV-04-3a', 'MA-Y6-PV-04', 3, c => ({
  text: `At ${c.place} it is −26°C at midnight. The temperature rises by 41°C by noon, then falls by 19°C by evening. What is the temperature in the evening, in °C?`,
  answer: -4, alt: -26 + 41 - 19,
  mistakes: M(-4, [[4, 'The answer is below zero, so it is negative.'], [34, 'A fall means you take away, not add.'], [-86, 'A rise means you add, not take away.']], true),
  hints: ['Take the two changes one at a time. Use a number line.', 'Step 1: −26 rising by 41 passes zero. Where does it end?', 'Step 2: fall by 19 from there.'],
})),
A6('Y6-PV-04-3b', 'MA-Y6-PV-04', 3, c => ({
  text: `${c.actor} writes the largest 7-digit number and the smallest 7-digit number that each use the digits 1, 2, 3, 4, 5, 6 and 7 exactly once. What is the difference between the two numbers?`,
  answer: 6419754, alt: 7654321 - 1234567,
  mistakes: M(6419754, [[7654321, 'That is the largest number only. Subtract the smallest.'], [8888888, 'That adds the two numbers. Find the difference.'], [6419764, 'Check the subtraction column by column.']]),
  hints: ['For the largest number, put the biggest digit first.', 'For the smallest number, put the smallest digit first.', 'Subtract the smaller number from the larger.'],
})),

// ===== MA-Y6-ASMD-07: multi-step addition and subtraction =====
A6('Y6-ASMD-07-1a', 'MA-Y6-ASMD-07', 1, c => ({
  text: `${c.actor} buys ${f(1245)} ${c.thing} on Monday and ${f(2380)} on Tuesday, then sells ${f(1590)}. How many ${c.thing} are left?`,
  answer: 2035, alt: 1245 + 2380 - 1590,
  mistakes: M(2035, [[3625, 'That is the number bought. The sales must be taken away.'], [5215, 'That adds the sales. Selling means taking away.']]),
  hints: ['Find the total bought first.', 'Add Monday and Tuesday.', 'Then take away the number sold.'],
})),
A6('Y6-ASMD-07-1b', 'MA-Y6-ASMD-07', 1, c => ({
  text: `A train carries ${f(18650)} ${c.crowd}. At station A, ${f(4275)} get off and ${f(3890)} get on. At station B, ${f(5160)} get off. How many ${c.crowd} are on the train now?`,
  answer: 13105, alt: 18650 - 4275 + 3890 - 5160,
  mistakes: M(13105, [[5325, 'People getting on means adding, not taking away.'], [14375, 'That forgets station B.']]),
  hints: ['Take each stop one at a time. Getting off takes away. Getting on adds.', 'After station A: 18,650 − 4,275 + 3,890.', 'Then take away the people who get off at station B.'],
})),
A6('Y6-ASMD-07-2a', 'MA-Y6-ASMD-07', 2, c => ({
  text: `${c.actor}'s club raised £${f(458300)} in 2023 and £${f(37650)} more in 2024 than in 2023. The club then spent £${f(120500)}. How much money does the club have left from the two years, in pounds?`,
  answer: 833750, alt: 458300 + (458300 + 37650) - 120500,
  mistakes: M(833750, [[954250, 'That forgets to take away the money spent.'], [375350, 'That is the amount raised in 2023 less the money spent. Include 2024.']]),
  hints: ['Find how much was raised in 2024 first.', 'Add 2023 and 2024 together.', 'Then take away the money spent.'],
})),
A6('Y6-ASMD-07-2b', 'MA-Y6-ASMD-07', 2, c => ({
  text: `${c.actor} has ${f(250000)} tickets to sell for ${c.place}. ${f(87450)} sell in week 1 and ${f(64820)} sell in week 2. Then ${f(12350)} tickets are returned and go back on sale. How many tickets are unsold now?`,
  answer: 110080, alt: 250000 - (87450 + 64820 - 12350),
  mistakes: M(110080, [[97730, 'That forgets the returned tickets. They are unsold again.'], [85380, 'Returned tickets go back to unsold, so they add to the unsold number.']]),
  hints: ['Find how many tickets are sold after the returns.', 'Add the two weeks, then take away the returned tickets.', 'Subtract the number sold from 250,000.'],
})),
A6('Y6-ASMD-07-3a', 'MA-Y6-ASMD-07', 3, c => ({
  text: `${c.actor} lists the populations of three towns. Town A has ${f(1250400)} people. Town B has ${f(385950)} fewer people than town A. Town C has ${f(120725)} more people than town B. How many people live in the three towns altogether?`,
  answer: 3100025, alt: 1250400 + (1250400 - 385950) + (1250400 - 385950 + 120725),
  mistakes: M(3100025, [[2114850, 'That leaves out town C.'], [4117575, '"Fewer" means take away, not add.']]),
  hints: ['Work out town B first. It has fewer people than town A.', 'Town C is more than town B, not more than town A.', 'Add the three towns together.'],
})),
A6('Y6-ASMD-07-3b', 'MA-Y6-ASMD-07', 3, c => ({
  text: `A reservoir near ${c.place} holds ${f(5000000)} litres. On day 1, ${f(1235000)} litres are used. On day 2, ${f(148000)} litres fewer than on day 1 are used. On day 3, ${f(900000)} litres are added. How many litres are in the reservoir at the end?`,
  answer: 3578000, alt: 5000000 - 1235000 - (1235000 - 148000) + 900000,
  mistakes: M(3578000, [[2678000, 'That forgets the 900,000 added on day 3.'], [3282000, '"Fewer" means take away from day 1, not add.']]),
  hints: ['Work out how much is used on day 2 first.', 'Add the water used on both days and take it from the start.', 'Then add the water added on day 3.'],
})),

// ===== MA-Y6-ASMD-08: problems with all four operations =====
A6('Y6-ASMD-08-1a', 'MA-Y6-ASMD-08', 1, c => ({
  text: `${c.actor} buys 24 packs of ${c.thing} at £3 each and pays with a £100 note. How much change is there, in pounds?`,
  answer: 28, alt: 100 - 24 * 3,
  mistakes: M(28, [[72, 'That is how much was spent. The question asks for the change.'], [97, 'That takes away only £3. There are 24 packs.']]),
  hints: ['Find the total cost first.', 'Work out 24 × 3.', 'Take that away from £100.'],
})),
A6('Y6-ASMD-08-1b', 'MA-Y6-ASMD-08', 1, c => ({
  text: `${c.actor} shares ${f(2400)} ${c.thing} equally between 16 boxes. Then 5 of the boxes are sold. How many ${c.thing} are left in the remaining boxes?`,
  answer: 1650, alt: (2400 / 16) * (16 - 5),
  mistakes: M(1650, [[150, 'That is how many are in each box. Count the boxes that are left.'], [750, 'That is how many are in the 5 boxes sold.'], [2395, 'That takes 5 away from the number of items, not the number of boxes.']]),
  hints: ['Find how many are in each box first.', 'Work out 2,400 ÷ 16.', 'How many boxes are left? Multiply by that.'],
})),
A6('Y6-ASMD-08-2a', 'MA-Y6-ASMD-08', 2, c => ({
  text: `${f(1250)} ${c.crowd} travel to ${c.place} by coach. Each coach holds 48 ${c.crowd}. How many coaches are needed?`,
  answer: 27, alt: Math.ceil(1250 / 48),
  mistakes: M(27, [[26, 'That leaves some people behind. The remainder still needs a coach.'], [28, 'That is one more than needed.'], [602, 'Divide, do not subtract.']]),
  hints: ['Divide the number of people by the number that fit on a coach.', 'The division does not come out exactly.', 'The remainder still needs a coach, so round up.'],
})),
A6('Y6-ASMD-08-2b', 'MA-Y6-ASMD-08', 2, c => ({
  text: `${c.actor} runs 25 teams. Each team has 14 players and 3 coaches. How many people are in the teams altogether?`,
  answer: 425, alt: 25 * 14 + 25 * 3,
  mistakes: M(425, [[350, 'That only counts the players. Add the coaches.'], [89, 'That multiplies only the coaches by 25. Each team has 14 players and 3 coaches.'], [42, 'That adds 14, 3 and 25. Multiply the team size by 25.']]),
  hints: ['Find how many people are in one team.', '14 players + 3 coaches.', 'Multiply by the 25 teams.'],
})),
A6('Y6-ASMD-08-3a', 'MA-Y6-ASMD-08', 3, c => ({
  text: `${c.actor} saves £15 each week for 36 weeks. ${c.actor} spends £128 on ${c.thing} and is then given a £45 gift. How much money does ${c.actor} have now, in pounds?`,
  answer: 457, alt: 15 * 36 - 128 + 45,
  mistakes: M(457, [[540, 'That is the savings only. Take away the money spent and add the gift.'], [367, 'A gift means money added, not taken away.'], [412, 'That forgets the £45 gift.']]),
  hints: ['Find the total saved first.', 'Work out 15 × 36.', 'Take away the money spent, then add the gift.'],
})),
A6('Y6-ASMD-08-3b', 'MA-Y6-ASMD-08', 3, c => ({
  text: `A factory near ${c.place} makes ${f(1250)} ${c.thing} an hour for 8 hours, then ${f(975)} an hour for 6 hours. They are packed in boxes of 25. How many boxes are filled?`,
  answer: 634, alt: (1250 * 8 + 975 * 6) / 25,
  mistakes: M(634, [[15850, 'That is the number of items. Divide by 25 to find the boxes.'], [633, 'Check: 633 × 25 = 15,825, which is less than the total.'], [250, 'That forgets the second part of the day.']]),
  hints: ['Find the number made in each part of the day.', 'Add the two amounts to find the total.', 'Divide the total by 25.'],
})),

// ===== MA-Y6-FR-10: problems needing answers rounded to a given accuracy =====
A6('Y6-FR-10-1a', 'MA-Y6-FR-10', 1, c => ({
  text: `${c.actor} shares £50 equally between 3 friends. How much does each friend get, to the nearest penny? Give the answer in pounds.`,
  answer: 16.67, alt: Math.round((5000 / 3)) / 100,
  mistakes: M(16.67, [[16.66, '50 ÷ 3 = 16.666... The next digit is 6, so round up.'], [16.7, 'That is rounded to the nearest 10p. The question asks for the nearest penny.'], [16.6, 'That is rounded down to the nearest 10p.']]),
  hints: ['Divide 50 by 3. The answer keeps going: 16.666...', 'You need 2 decimal places, so look at the third decimal place.', 'The third decimal place is 6, which is 5 or more, so round up.'],
})),
A6('Y6-FR-10-1b', 'MA-Y6-FR-10', 1, c => ({
  text: `${c.actor} cuts a 10 m ribbon into 3 equal pieces. How long is each piece, to 1 decimal place, in metres?`,
  answer: 3.3, alt: Math.round((10 / 3) * 10) / 10,
  mistakes: M(3.3, [[3.4, 'The second decimal place is 3, so round down.'], [3.33, 'That is to 2 decimal places. The question asks for 1.'], [3, 'That is rounded to the nearest whole number.']]),
  hints: ['Divide 10 by 3. The answer keeps going: 3.333...', 'You need 1 decimal place, so look at the second decimal place.', 'The second decimal place is 3, which is 4 or less, so round down.'],
})),
A6('Y6-FR-10-2a', 'MA-Y6-FR-10', 2, c => ({
  text: `7 tickets for ${c.place} cost £23.50 altogether. All the tickets cost the same. How much does 1 ticket cost, to the nearest penny, in pounds?`,
  answer: 3.36, alt: Math.round((2350 / 7)) / 100,
  mistakes: M(3.36, [[3.35, '23.50 ÷ 7 = 3.357... The third decimal place is 7, so round up.'], [3.4, 'That is rounded to the nearest 10p.'], [3.3, 'That is rounded down to the nearest 10p.']]),
  hints: ['Divide £23.50 by 7.', 'The answer is 3.357... and carries on.', 'Look at the third decimal place to round to the nearest penny.'],
})),
A6('Y6-FR-10-2b', 'MA-Y6-FR-10', 2, c => ({
  text: `A bottle holds 1.5 litres. ${c.actor} fills cups that each hold 0.2 litres. How many cups can ${c.actor} fill completely?`,
  answer: 7, alt: Math.floor(1.5 / 0.2 + 1e-9),
  mistakes: M(7, [[8, 'The last cup would not be full. Only count full cups.'], [7.5, 'You can only fill whole cups. Round down.'], [0.3, 'That subtracts. Divide to find how many cups fit.']]),
  hints: ['Divide 1.5 by 0.2 to find how many cups fit.', 'You get 7.5. Half a cup is not a full cup.', 'Count only the cups that are completely full.'],
})),
A6('Y6-FR-10-3a', 'MA-Y6-FR-10', 3, c => ({
  text: `${c.actor} shares £11.50 equally between 7 friends. How much does each friend get, to the nearest 10p? Give the answer in pounds.`,
  answer: 1.6, alt: Math.round((1150 / 7) / 10) / 10,
  mistakes: M(1.6, [[1.64, 'That is to the nearest penny. The question asks for the nearest 10p.'], [1.7, 'The hundredths digit is 4, so round down.'], [1.65, 'That is rounded to the nearest 5p.']]),
  hints: ['Divide £11.50 by 7. You get 1.642...', 'You need the nearest 10p, which is 1 decimal place.', 'Look at the hundredths digit to decide whether to round up or down.'],
})),
A6('Y6-FR-10-3b', 'MA-Y6-FR-10', 3, c => ({
  text: `${c.actor} has 12.7 kg of ${c.thing} to put into 9 equal bags. How much goes in each bag, to 2 decimal places, in kilograms?`,
  answer: 1.41, alt: Math.round((1270 / 9)) / 100,
  mistakes: M(1.41, [[1.4, 'That is to 1 decimal place. The question asks for 2.'], [1.42, 'The third decimal place is 1, so round down.'], [1.411, 'That is to 3 decimal places. The question asks for 2.']]),
  hints: ['Divide 12.7 by 9. The answer keeps going: 1.4111...', 'You need 2 decimal places, so look at the third decimal place.', 'The third decimal place is 1, which is 4 or less, so round down.'],
})),

// ===== MA-Y6-ALG-05: enumerate possibilities of combinations of two variables =====
A6('Y6-ALG-05-1a', 'MA-Y6-ALG-05', 1, c => ({
  text: `${c.actor} has 3 hats and 4 scarves. An outfit is one hat and one scarf. How many different outfits can ${c.actor} make?`,
  answer: 12, alt: 3 * 4,
  mistakes: M(12, [[7, 'That adds 3 and 4. Each hat can go with each scarf.'], [4, 'That is the number of outfits with just one hat.'], [24, 'That is 3 × 4 × 2. Do not count each outfit twice.']]),
  hints: ['Pick one hat. How many outfits can it make with the scarves?', 'Each of the 3 hats can go with each of the 4 scarves.', 'Work out 3 × 4.'],
})),
A6('Y6-ALG-05-1b', 'MA-Y6-ALG-05', 1, c => ({
  text: `${c.actor} is thinking of two whole numbers, a and b. Both are greater than 0 and a + b = 7. How many different pairs (a, b) are there? (1, 6) and (6, 1) count as different pairs.`,
  answer: 6, alt: Array.from({ length: 7 }, (_, i) => i).filter(a => a >= 1 && 7 - a >= 1).length,
  mistakes: M(6, [[7, 'a cannot be 0 or 7. Both numbers must be greater than 0.'], [3, 'That counts (1, 6) and (6, 1) as the same pair. They count as different.'], [5, 'Check a = 1 up to a = 6. Count each one.']]),
  hints: ['Start with a = 1. What must b be?', 'Then try a = 2, a = 3, and so on.', 'Stop when b would be 0. Count the pairs.'],
})),
A6('Y6-ALG-05-2a', 'MA-Y6-ALG-05', 2, c => ({
  text: `${c.actor} rolls two dice numbered 1 to 6 and adds the scores. In how many different ways can the total be 8? (A 2 then a 6 is different from a 6 then a 2.)`,
  answer: 5, alt: (() => { let n = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === 8) n++; return n; })(),
  mistakes: M(5, [[4, 'Count (4, 4) as well as the other pairs.'], [6, 'There are only 5 ways. The first die cannot be 1, because the second would need to be 7.'], [3, 'That counts (2, 6) and (6, 2) as the same way. They are different.']]),
  hints: ['List the possible scores for the first die and the score needed on the second.', 'First die 2 needs a 6. First die 3 needs a 5.', 'Carry on until the second die would have to be more than 6.'],
})),
A6('Y6-ALG-05-2b', 'MA-Y6-ALG-05', 2, c => ({
  text: `${c.actor} is thinking of two whole numbers, a and b, with a × b = 24. Both are greater than 0. How many different pairs (a, b) are there? (2, 12) and (12, 2) count as different pairs.`,
  answer: 8, alt: Array.from({ length: 24 }, (_, i) => i + 1).filter(a => 24 % a === 0).length,
  mistakes: M(8, [[4, 'That counts (2, 12) and (12, 2) as the same pair. They count as different.'], [6, 'There are more factors of 24. Try every number from 1 up to 24.'], [7, 'Check each factor of 24 gives a pair.']]),
  hints: ['Each pair uses a factor of 24 for a.', 'List the factor pairs, then count each order separately.', 'Count how many factors 24 has.'],
})),
A6('Y6-ALG-05-3a', 'MA-Y6-ALG-05', 3, c => ({
  text: `${c.actor} has a 10p coin, a 20p coin and a 50p coin, with plenty of each. ${c.actor} picks exactly 2 coins (they can be the same kind). How many different totals are possible?`,
  answer: 6, alt: (() => { const s = new Set<number>(); for (const a of [10, 20, 50]) for (const b of [10, 20, 50]) s.add(a + b); return s.size; })(),
  mistakes: M(6, [[3, 'That only counts pairs of different coins. The two coins can be the same.'], [9, 'That counts the same total more than once. 10p + 20p and 20p + 10p give the same total.'], [5, 'Check every pair: three pairs of different coins and three pairs of matching coins.']]),
  hints: ['List the totals using two different coins first.', 'Then list the totals using two coins of the same kind.', 'Count the different totals. Do not count the same total twice.'],
})),
A6('Y6-ALG-05-3b', 'MA-Y6-ALG-05', 3, c => ({
  text: `${c.actor} makes a 2-digit code using only the digits 1, 2, 3 and 4. A digit can be used twice. How many different codes can ${c.actor} make?`,
  answer: 16, alt: (() => { let n = 0; for (const a of [1, 2, 3, 4]) for (const b of [1, 2, 3, 4]) { n++; void a; void b; } return n; })(),
  mistakes: M(16, [[12, 'That does not allow a digit to be used twice. Codes like 11 and 22 are allowed.'], [8, 'That is 4 + 4. Each first digit can go with each second digit.'], [24, 'That would be for 3-digit codes with no repeats.']]),
  hints: ['How many choices are there for the first digit?', 'For each first digit, how many choices are there for the second digit?', 'Multiply the two numbers of choices.'],
})),

// ===== MA-Y6-ME-01: unit calculation and conversion problems =====
A6('Y6-ME-01-1a', 'MA-Y6-ME-01', 1, c => ({
  text: `A bottle holds 0.75 litres. ${c.actor} fills 6 bottles. How many millilitres is that altogether?`,
  answer: 4500, alt: 6 * 750,
  mistakes: M(4500, [[4.5, 'That is in litres. The question asks for millilitres.'], [450, 'One place too few. 1 litre is 1,000 millilitres.'], [750, 'That is the amount in one bottle. There are 6 bottles.']]),
  hints: ['Change litres into millilitres first. 1 litre = 1,000 millilitres.', '0.75 litres is 750 millilitres.', 'Multiply by 6.'],
})),
A6('Y6-ME-01-1b', 'MA-Y6-ME-01', 1, c => ({
  text: `${c.actor} has a rope that is 2.4 m long. ${c.actor} cuts off 85 cm. How many centimetres of rope are left?`,
  answer: 155, alt: 240 - 85,
  mistakes: M(155, [[1.55, 'That is in metres. The question asks for centimetres.'], [325, 'That adds 240 and 85. Cutting off means taking away.']]),
  hints: ['Change 2.4 m into centimetres first. 1 m = 100 cm.', '2.4 m = 240 cm.', 'Subtract 85 cm.'],
})),
A6('Y6-ME-01-2a', 'MA-Y6-ME-01', 2, c => ({
  text: `${c.actor} has two parcels. One weighs 2.35 kg and the other weighs 750 g. How much do they weigh together, in kilograms?`,
  answer: 3.1, alt: 2.35 + 750 / 1000,
  mistakes: M(3.1, [[752.35, 'Change 750 g into kilograms before adding.'], [3.85, '750 g is 0.75 kg, not 1.5 kg.'], [2.42, '750 g is 0.750 kg. Line up the decimal points.']]),
  hints: ['Both weights must be in the same unit before you add.', '1 kg = 1,000 g. Change 750 g into kilograms.', 'Add 2.35 kg and 0.75 kg.'],
})),
A6('Y6-ME-01-2b', 'MA-Y6-ME-01', 2, c => ({
  text: `${c.actor} has a tank with 3.2 litres of juice. Each cup holds 250 millilitres. How many cups can ${c.actor} fill completely?`,
  answer: 12, alt: Math.floor(3200 / 250),
  mistakes: M(12, [[13, 'The last cup would not be full. Only count full cups.'], [12.8, 'You can only fill whole cups. Round down.'], [128, 'That divides 3.2 by 0.025. Change both amounts into the same unit first.']]),
  hints: ['Change litres into millilitres first.', '3.2 litres is 3,200 millilitres.', 'Divide by 250 and count only the full cups.'],
})),
A6('Y6-ME-01-3a', 'MA-Y6-ME-01', 3, c => ({
  text: `${c.actor}'s path at ${c.place} is 1.35 km long. ${c.actor} has walked 850 m along it. How many metres are left to walk?`,
  answer: 500, alt: 1350 - 850,
  mistakes: M(500, [[0.5, 'That is in kilometres. The question asks for metres.'], [2200, 'That adds 1,350 and 850. "Left to walk" means taking away.']]),
  hints: ['Both distances must be in the same unit.', '1 km = 1,000 m. Change 1.35 km into metres.', 'Subtract the distance already walked.'],
})),
A6('Y6-ME-01-3b', 'MA-Y6-ME-01', 3, c => ({
  text: `${c.actor} has a jug with 2.075 litres of squash. ${c.actor} pours 6 glasses of 325 millilitres each. How many millilitres of squash are left in the jug?`,
  answer: 125, alt: 2075 - 6 * 325,
  mistakes: M(125, [[0.125, 'That is in litres. The question asks for millilitres.'], [1950, 'That is how much was poured. The question asks how much is left.'], [1750, 'That only takes away 1 glass.']]),
  hints: ['Change the jug amount into millilitres: 2.075 litres.', 'Find how much is poured in total: 6 × 325 ml.', 'Subtract the amount poured from the amount in the jug.'],
})),

// ===== MA-Y6-ME-05: know when area and volume formulae can be used =====
A6('Y6-ME-05-1a', 'MA-Y6-ME-05', 1, c => ({
  text: `${c.actor} knows the formula area = length × width. It can be used for only one of these shapes. Which one? Type its number. 1) a circle; 2) a rectangle; 3) a triangle; 4) a lake with a curvy edge`,
  answer: 2, alt: ['circle', 'rectangle', 'triangle', 'lake'].indexOf('rectangle') + 1,
  mistakes: M(2, [[1, 'A circle has no length and width. It has a different formula.'], [3, 'A triangle uses a different formula: half of base × height.'], [4, 'A curvy shape has no simple length and width.']]),
  hints: ['The formula length × width needs a shape with a length and a width.', 'Which shape has straight sides with right-angled corners?', 'Pick the shape made of equal rows of squares.'],
})),
A6('Y6-ME-05-1b', 'MA-Y6-ME-05', 1, c => ({
  text: `${c.actor} knows the formula volume = length × width × height. It can be used for only one of these. Which one? Type its number. 1) a football; 2) a cuboid box; 3) a squashed bag of sand; 4) a cone`,
  answer: 2, alt: ['football', 'cuboid', 'bag', 'cone'].indexOf('cuboid') + 1,
  mistakes: M(2, [[1, 'A ball is round. It has a different formula.'], [3, 'A squashed bag has no fixed length, width and height.'], [4, 'A cone has a different formula.']]),
  hints: ['The formula needs a shape with a length, a width and a height.', 'Which shape has flat faces and right-angled corners?', 'Pick the shape that is a box.'],
})),
A6('Y6-ME-05-2a', 'MA-Y6-ME-05', 2, c => ({
  text: `${c.actor}'s floor is shaped like an L made from two rectangles joined together. One rectangle is 6 m by 4 m and the other is 3 m by 2 m. What is the total area of the floor, in square metres?`,
  answer: 30, alt: 6 * 4 + 3 * 2,
  mistakes: M(30, [[10, 'That adds the lengths. Find the area of each rectangle first.'], [144, 'That multiplies all four numbers. Find each area, then add.'], [24, 'That is only the larger rectangle. Add the other one.']]),
  hints: ['Split the L-shape into its two rectangles.', 'Use length × width for each rectangle.', 'Add the two areas.'],
})),
A6('Y6-ME-05-2b', 'MA-Y6-ME-05', 2, c => ({
  text: `${c.actor}'s block is a cuboid 5 cm long, 4 cm wide and 3 cm high. A small cuboid 2 cm by 2 cm by 1 cm is cut out of it. What is the volume of the block that is left, in cubic centimetres?`,
  answer: 56, alt: 5 * 4 * 3 - 2 * 2 * 1,
  mistakes: M(56, [[64, 'That adds the small cuboid. It is cut out, so take it away.'], [60, 'That is the volume before the cut. Take away the small cuboid.'], [4, 'That is only the small cuboid. Take it away from the whole block.']]),
  hints: ['Find the volume of the whole block first.', 'Then find the volume of the piece that is cut out.', 'Subtract the small volume from the large volume.'],
})),
A6('Y6-ME-05-3a', 'MA-Y6-ME-05', 3, c => ({
  text: `${c.actor} knows the formula area = base × height ÷ 2. It can be used for only one of these shapes. Which one? Type its number. 1) a rectangle; 2) a right-angled triangle; 3) a parallelogram; 4) a square`,
  answer: 2, alt: ['rectangle', 'triangle', 'parallelogram', 'square'].indexOf('triangle') + 1,
  mistakes: M(2, [[1, 'A rectangle uses length × width, with no division by 2.'], [3, 'A parallelogram uses base × height, with no division by 2.'], [4, 'A square uses side × side, with no division by 2.']]),
  hints: ['Dividing by 2 means the shape is half of a rectangle.', 'Which of these shapes is half of a rectangle?', 'Cut a rectangle along a diagonal to make it.'],
})),
A6('Y6-ME-05-3b', 'MA-Y6-ME-05', 3, c => ({
  text: `${c.actor}'s garden at ${c.place} is a rectangle 10 m by 8 m. A rectangular patio 4 m by 3 m is built inside it. The rest of the garden is grass. What is the area of the grass, in square metres?`,
  answer: 68, alt: 10 * 8 - 4 * 3,
  mistakes: M(68, [[12, 'That is only the patio. The question asks for the grass.'], [92, 'That adds the patio. The patio is not grass, so take it away.'], [18, 'That adds the sides. Use area, not perimeter.']]),
  hints: ['Find the area of the whole garden first.', 'Then find the area of the patio.', 'Subtract the patio from the whole garden.'],
})),
];

export const Y56_AUTHORED: Template[] = [...Y5_AUTHORED, ...Y6_AUTHORED];
