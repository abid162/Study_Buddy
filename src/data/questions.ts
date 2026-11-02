export type ThemeId = 'football' | 'wrestling' | 'kpop' | 'building' | 'music' | 'space'
export type Skill = 'times' | 'divide' | 'fraction' | 'areaPerimeter' | 'rounding' | 'decimals'
export type Year = 4 | 5 | 6
export type Focus = 'mixed' | 'times' | 'fractions' | 'measure'

export interface Part {
  count: string
  label: string
}

export interface Misconception {
  value: number
  tag: string
  message: string
}

export interface Question {
  id: string
  skill: Skill
  theme: ThemeId
  scene: string
  ask: string
  answer: number
  prefix?: string
  unit?: string
  parts: Part[]
  hints: [string, string, string]
  solution: string
  misconceptions: Misconception[]
}

export const SKILL_LABEL: Record<Skill, string> = {
  times: 'Multiplication',
  divide: 'Division',
  fraction: 'Fractions of amounts',
  areaPerimeter: 'Area and perimeter',
  rounding: 'Rounding',
  decimals: 'Adding decimals',
}

export function objective(skill: Skill, year: Year): string {
  const map: Record<Skill, Record<Year, string>> = {
    times: {
      4: 'Recall multiplication facts up to 12 × 12',
      5: 'Multiply a 2-digit number by a 1-digit number',
      6: 'Multiply multi-digit numbers by a 1-digit number',
    },
    divide: {
      4: 'Use multiplication facts to divide',
      5: 'Divide by a 1-digit number',
      6: 'Divide larger numbers by a 1-digit number',
    },
    fraction: {
      4: 'Find fractions of a quantity',
      5: 'Find non-unit fractions of amounts',
      6: 'Find non-unit fractions of larger amounts',
    },
    areaPerimeter: {
      4: 'Find the perimeter and area of rectangles',
      5: 'Calculate the perimeter and area of rectangles',
      6: 'Solve area and perimeter problems',
    },
    rounding: {
      4: 'Round to the nearest 10 or 100',
      5: 'Round to the nearest 100 or 1,000',
      6: 'Round to the nearest 1,000 or 10,000',
    },
    decimals: {
      4: 'Add numbers with one decimal place',
      5: 'Add numbers with up to two decimal places',
      6: 'Add numbers with up to two decimal places',
    },
  }
  return `Year ${year}: ${map[skill][year]}`
}

/* ---------- deterministic helpers ---------- */

export function rng(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

const int = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1))
const pick = <T,>(r: () => number, xs: T[]): T => xs[Math.floor(r() * xs.length)]
export const fmt = (n: number) => n.toLocaleString('en-GB', { maximumFractionDigits: 2 })
const money = (n: number) => n.toFixed(2)
const cents = (n: number) => Math.round(n * 100)

const FRACTION_WORDS: Record<number, [string, string]> = {
  2: ['half', 'halves'],
  3: ['third', 'thirds'],
  4: ['quarter', 'quarters'],
  5: ['fifth', 'fifths'],
  8: ['eighth', 'eighths'],
  10: ['tenth', 'tenths'],
}
const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
const fractionWords = (n: number, d: number) =>
  `${NUMBER_WORDS[n]} ${n === 1 ? FRACTION_WORDS[d][0] : FRACTION_WORDS[d][1]}`

/* ---------- answer checking: rules, never AI ---------- */

export function normaliseInput(raw: string): number | null {
  const cleaned = raw.replace(/[£,\s]/g, '').replace(/m²|cm²|m|cm|kg|km$/g, '')
  if (cleaned === '' || cleaned === '.' || !/^\d*\.?\d*$/.test(cleaned)) return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

export type CheckResult =
  | { status: 'correct' }
  | { status: 'empty' }
  | { status: 'wrong'; misconception?: Misconception }

export function checkAnswer(q: Question, raw: string): CheckResult {
  const n = normaliseInput(raw)
  if (n === null) return { status: 'empty' }
  if (cents(n) === cents(q.answer)) return { status: 'correct' }
  const m = q.misconceptions.find((x) => cents(x.value) === cents(n))
  return { status: 'wrong', misconception: m }
}

/* ---------- generators ---------- */

type Gen = (r: () => number, theme: ThemeId, year: Year) => Omit<Question, 'id' | 'theme' | 'skill'>

const times: Gen = (r, theme, year) => {
  const a = year === 4 ? int(r, 3, 12) : year === 5 ? int(r, 13, 48) : int(r, 24, 96)
  const b = year === 4 ? int(r, 3, 12) : int(r, 3, 9)
  const answer = a * b
  const scenes: Record<ThemeId, [string, string, string]> = {
    football: [`Your team opens ${a} sticker packs. Each pack has ${b} stickers.`, 'How many stickers is that?', 'stickers'],
    wrestling: [`A tournament has ${a} rounds. Each round lasts ${b} minutes.`, 'How many minutes is that altogether?', 'minutes'],
    kpop: [`A dance routine has ${a} sections with ${b} counts in each.`, 'How many counts are in the routine?', 'counts'],
    building: [`You build ${a} rows of bricks with ${b} bricks in each row.`, 'How many bricks do you use?', 'bricks'],
    music: [`A song has ${a} bars with ${b} beats in each bar.`, 'How many beats are in the song?', 'beats'],
    space: [`A rocket burns ${b} tonnes of fuel every minute for ${a} minutes.`, 'How many tonnes of fuel does it burn?', 'tonnes'],
  }
  const [scene, ask, unit] = scenes[theme]
  const split = a >= 10
  const t = Math.floor(a / 10) * 10
  const o = a % 10
  const hints: [string, string, string] = split
    ? [
        `You need ${fmt(a)} groups of ${b}.`,
        `Split ${fmt(a)} into ${t} and ${o}, and multiply each part by ${b}.`,
        `${t} × ${b} = ${fmt(t * b)} and ${o} × ${b} = ${o * b}. Now add them together.`,
      ]
    : [
        `You need ${a} groups of ${b}.`,
        `Use a fact you know: ${a} × ${b} is ${a} × ${b - 1} plus one more ${a}.`,
        `${a} × ${b - 1} = ${a * (b - 1)}. Add one more ${a}.`,
      ]
  return {
    scene,
    ask,
    unit,
    answer,
    parts: [
      { count: `${fmt(a)}x`, label: `groups of ${b}` },
      { count: '1x', label: 'multiply' },
    ],
    hints,
    solution: split
      ? `${t} × ${b} = ${fmt(t * b)}, ${o} × ${b} = ${o * b}, and ${fmt(t * b)} + ${o * b} = ${fmt(answer)}.`
      : `${a} × ${b} = ${answer}.`,
    misconceptions: [{ value: a + b, tag: 'added-not-multiplied', message: `That's ${a} + ${b}. This one needs ${a} groups of ${b}, so multiply.` }],
  }
}

const divide: Gen = (r, theme, year) => {
  const b = int(r, 3, 9)
  const a = year === 4 ? int(r, 3, 12) : year === 5 ? int(r, 12, 40) : int(r, 25, 120)
  const total = a * b
  const scenes: Record<ThemeId, [string, string, string]> = {
    football: [`${fmt(total)} fans travel to the match on coaches. Each coach holds ${b} fans.`, 'How many coaches are full?', 'coaches'],
    wrestling: [`${fmt(total)} tickets are shared equally between ${b} ticket booths.`, 'How many tickets does each booth get?', 'tickets'],
    kpop: [`${fmt(total)} lightsticks are packed into boxes of ${b}.`, 'How many boxes are needed?', 'boxes'],
    building: [`${fmt(total)} bricks are shared equally between ${b} builders.`, 'How many bricks does each builder get?', 'bricks'],
    music: [`A band plays ${fmt(total)} beats, split equally into bars of ${b}.`, 'How many bars is that?', 'bars'],
    space: [`${fmt(total)} kg of supplies are loaded equally onto ${b} rockets.`, 'How many kg go on each rocket?', 'kg'],
  }
  const [scene, ask, unit] = scenes[theme]
  const tens = Math.floor(a / 10) * 10
  return {
    scene,
    ask,
    unit,
    answer: a,
    parts: [
      { count: fmt(total), label: 'to share' },
      { count: `${b}x`, label: 'equal groups' },
    ],
    hints: [
      `Division is sharing ${fmt(total)} into equal groups of ${b}.`,
      `Think backwards: what number times ${b} makes ${fmt(total)}?`,
      tens > 0
        ? `${b} × ${tens} = ${fmt(b * tens)}. How many more ${b}s get you to ${fmt(total)}?`
        : `Count up in ${b}s until you reach ${fmt(total)}.`,
    ],
    solution: `${b} × ${a} = ${fmt(total)}, so ${fmt(total)} ÷ ${b} = ${a}.`,
    misconceptions: [
      { value: total * b, tag: 'multiplied-not-divided', message: `That answer got bigger. Sharing makes each group smaller, so divide.` },
      { value: total - b, tag: 'subtracted-not-divided', message: `That's ${fmt(total)} − ${b}. Sharing into equal groups means dividing.` },
    ],
  }
}

const fraction: Gen = (r, theme, year) => {
  const d = pick(r, year === 4 ? [2, 3, 4, 5, 10] : [3, 4, 5, 8, 10])
  const options = Array.from({ length: d - 1 }, (_, i) => i + 1).filter((k) => gcd(k, d) === 1 && (year === 4 || k > 1 || d === 2))
  const n = pick(r, options)
  const unitPart = year === 4 ? int(r, 3, 12) : year === 5 ? int(r, 6, 25) : int(r, 15, 60)
  const amount = unitPart * d
  const answer = unitPart * n
  const words = fractionWords(n, d)
  const scenes: Record<ThemeId, [string, string, string]> = {
    football: [`One stand has ${fmt(amount)} seats. ${cap(words)} of them are for home fans.`, 'How many seats are for home fans?', 'seats'],
    wrestling: [`${fmt(amount)} fans are in the arena. ${cap(words)} of them wear team shirts.`, 'How many fans wear team shirts?', 'fans'],
    kpop: [`A concert sells ${fmt(amount)} tickets. ${cap(words)} of them are standing tickets.`, 'How many standing tickets are sold?', 'tickets'],
    building: [`A kit has ${fmt(amount)} bricks. ${cap(words)} of them are blue.`, 'How many blue bricks are there?', 'bricks'],
    music: [`A playlist has ${fmt(amount)} songs. ${cap(words)} of them are dance tracks.`, 'How many dance tracks are there?', 'songs'],
    space: [`A rocket carries ${fmt(amount)} litres of fuel. It uses ${words} of it to leave Earth.`, 'How many litres does it use?', 'litres'],
  }
  const [scene, ask, unit] = scenes[theme]
  const ms: Misconception[] = []
  if (n > 1) ms.push({ value: unitPart, tag: 'found-one-part', message: `${fmt(unitPart)} is one part. You need ${n} parts.` })
  ms.push({ value: amount / n === Math.round(amount / n) ? amount / n : -1, tag: 'divided-by-numerator', message: `Divide by the bottom number (${d}) first, then multiply by the top number (${n}).` })
  return {
    scene,
    ask,
    unit,
    answer,
    parts: [
      { count: `${d}x`, label: 'equal parts' },
      { count: `${n}x`, label: `part${n > 1 ? 's' : ''} to take` },
    ],
    hints: [
      `${cap(words)} means split ${fmt(amount)} into ${d} equal parts and take ${n}.`,
      `One part is ${fmt(amount)} ÷ ${d}.`,
      `One part is ${fmt(unitPart)}. Now find ${n} part${n > 1 ? 's' : ''}: ${fmt(unitPart)} × ${n}.`,
    ],
    solution: `${fmt(amount)} ÷ ${d} = ${fmt(unitPart)}, and ${fmt(unitPart)} × ${n} = ${fmt(answer)}.`,
    misconceptions: ms,
  }
}

const areaPerimeter: Gen = (r, theme, year) => {
  const l = year === 4 ? int(r, 4, 12) : year === 5 ? int(r, 8, 20) : int(r, 12, 35)
  let w = year === 4 ? int(r, 2, 9) : int(r, 3, 12)
  if (l * w === 2 * (l + w)) w += 1
  const askArea = r() > 0.5
  const area = l * w
  const perim = 2 * (l + w)
  const big: Record<ThemeId, [string, string, string, string]> = {
    football: [`A training pitch is a rectangle ${l} m long and ${w} m wide.`, 'What is the area of the pitch?', 'How far is one lap around the edge?', 'm'],
    wrestling: [`The ring mat is a rectangle ${l} m long and ${w} m wide.`, 'What is the area of the mat?', 'How much rope goes once around the edge?', 'm'],
    kpop: [`The stage floor is ${l} m long and ${w} m wide.`, 'What is the area of the stage?', 'How many metres of lights fit once around the edge?', 'm'],
    building: [`A brick wall panel is ${l} cm long and ${w} cm tall.`, 'What is the area of the panel?', 'How long is the frame around the edge?', 'cm'],
    music: [`A gig poster is ${l} cm long and ${w} cm wide.`, 'What is the area of the poster?', 'How much ribbon goes once around the edge?', 'cm'],
    space: [`A solar panel is a rectangle ${l} m long and ${w} m wide.`, 'What is the area of the panel?', 'How long is the frame around the edge?', 'm'],
  }
  const [scene, areaAsk, perimAsk, u] = big[theme]
  return askArea
    ? {
        scene,
        ask: areaAsk,
        unit: `${u}²`,
        answer: area,
        parts: [
          { count: `${l}`, label: 'length' },
          { count: `${w}`, label: 'width' },
        ],
        hints: [
          'Area is the space inside the shape. Multiply length by width.',
          `Picture ${w} rows with ${l} squares in each row.`,
          `Work out ${l} × ${w}.`,
        ],
        solution: `Area = ${l} × ${w} = ${area} ${u}².`,
        misconceptions: [
          { value: perim, tag: 'area-perimeter-mixup', message: `That's the perimeter, the distance around the edge. Area is the space inside.` },
          { value: l + w, tag: 'added-sides', message: `That adds two sides. Area means multiplying length by width.` },
        ],
      }
    : {
        scene,
        ask: perimAsk,
        unit: u,
        answer: perim,
        parts: [
          { count: '2x', label: `sides of ${l}` },
          { count: '2x', label: `sides of ${w}` },
        ],
        hints: [
          'Perimeter is the distance all the way around. A rectangle has four sides.',
          `Two sides are ${l} and two sides are ${w}.`,
          `Add ${l} + ${w} + ${l} + ${w}.`,
        ],
        solution: `${l} + ${w} + ${l} + ${w} = ${perim} ${u}.`,
        misconceptions: [
          { value: area, tag: 'area-perimeter-mixup', message: `That's the area, the space inside. Perimeter is the distance around the edge.` },
          { value: l + w, tag: 'two-sides-only', message: `That's only two sides. Go all the way around: four sides.` },
        ],
      }
}

const rounding: Gen = (r, theme, year) => {
  const place = year === 4 ? pick(r, [10, 100]) : year === 5 ? pick(r, [100, 1000]) : pick(r, [1000, 10000])
  const n = year === 4 ? int(r, 120, 9890) : year === 5 ? int(r, 1200, 98900) : int(r, 12000, 989000)
  const nudged = n % place === 0 ? n + Math.floor(place / 3) : n
  const answer = Math.round(nudged / place) * place
  const lo = Math.floor(nudged / place) * place
  const hi = lo + place
  const lower = place / 10
  const digit = Math.floor((nudged % place) / lower)
  const placeName = (p: number) => (p === 1 ? 'ones' : p === 10 ? 'tens' : p === 100 ? 'hundreds' : p === 1000 ? 'thousands' : 'ten thousands')
  const scenes: Record<ThemeId, string> = {
    football: `${fmt(nudged)} fans came to the cup final.`,
    wrestling: `The champion's match was watched ${fmt(nudged)} times.`,
    kpop: `A new music video has ${fmt(nudged)} likes.`,
    building: `A giant brick model uses ${fmt(nudged)} bricks.`,
    music: `A song has been played ${fmt(nudged)} times.`,
    space: `A space probe has travelled ${fmt(nudged)} km.`,
  }
  const otherPlace = place === 10 ? 100 : place / 10
  const ms: Misconception[] = [
    { value: answer === lo ? hi : lo, tag: 'rounded-wrong-way', message: `Check the ${placeName(lower)} digit. 5 or more rounds up; 4 or less rounds down.` },
  ]
  const other = Math.round(nudged / otherPlace) * otherPlace
  if (other !== answer) ms.push({ value: other, tag: 'wrong-place', message: `That's rounded to the nearest ${fmt(otherPlace)}. This one asks for the nearest ${fmt(place)}.` })
  return {
    scene: scenes[theme],
    ask: `Round ${fmt(nudged)} to the nearest ${fmt(place)}.`,
    answer,
    parts: [
      { count: '1x', label: `${placeName(lower)} digit to check` },
      { count: '2x', label: 'possible answers' },
    ],
    hints: [
      `Look at the ${placeName(lower)} digit. It decides which way to round.`,
      `${fmt(nudged)} is between ${fmt(lo)} and ${fmt(hi)}.`,
      `The ${placeName(lower)} digit is ${digit}. 5 or more rounds up; 4 or less rounds down.`,
    ],
    solution: `The ${placeName(lower)} digit is ${digit}, so ${fmt(nudged)} rounds ${answer === hi ? 'up' : 'down'} to ${fmt(answer)}.`,
    misconceptions: ms,
  }
}

const decimals: Gen = (r, theme, year) => {
  const a = year === 4 ? int(r, 12, 89) / 10 : int(r, 105, 899) / 100
  const b = year === 4 ? int(r, 11, 79) / 10 : int(r, 11, 89) / 10
  const answer = Math.round((a + b) * 100) / 100
  const isMoney = theme === 'kpop' || theme === 'music'
  const show = (x: number) => (isMoney ? money(x) : fmt(x))
  const scenes: Record<ThemeId, [string, string, string?, string?]> = {
    football: [`A striker runs ${show(a)} km in the first half and ${show(b)} km in the second half.`, 'How far do they run altogether?', undefined, 'km'],
    wrestling: [`A wrestler trains for ${show(a)} hours on Monday and ${show(b)} hours on Tuesday.`, 'How many hours is that altogether?', undefined, 'hours'],
    kpop: [`A poster costs £${show(a)} and a lightstick costs £${show(b)}.`, 'How much do they cost altogether?', '£'],
    building: [`A tower is ${show(a)} m tall. You add another ${show(b)} m on top.`, 'How tall is the tower now?', undefined, 'm'],
    music: [`New drumsticks cost £${show(a)} and guitar strings cost £${show(b)}.`, 'How much is that altogether?', '£'],
    space: [`One moon rock weighs ${show(a)} kg and another weighs ${show(b)} kg.`, 'How much do they weigh altogether?', undefined, 'kg'],
  }
  const [scene, ask, prefix, unit] = scenes[theme]
  const aWhole = Math.floor(a)
  const bWhole = Math.floor(b)
  const aFracDigits = Math.round((a - aWhole) * 100)
  const bFracDigits = Math.round((b - bWhole) * 10)
  const misaligned = aWhole + bWhole + (aFracDigits + bFracDigits) / 100
  const ms: Misconception[] = []
  if (year > 4 && cents(misaligned) !== cents(answer))
    ms.push({ value: misaligned, tag: 'misaligned-decimals', message: 'Line up the decimal points before adding, so tenths add to tenths.' })
  return {
    scene,
    ask,
    prefix,
    unit,
    answer,
    parts: [
      { count: '1x', label: 'line up the decimal points' },
      { count: '3x', label: 'columns: ones, tenths, hundredths' },
    ],
    hints: [
      'Line up the decimal points, one number above the other.',
      year === 4 ? 'Add the ones, then add the tenths.' : `Write ${show(b)} as ${b.toFixed(2)} so both numbers have two decimal places.`,
      `Add ${show(a)} + ${show(b)} column by column, starting from the right.`,
    ],
    solution: `${show(a)} + ${show(b)} = ${isMoney ? money(answer) : fmt(answer)}.`,
    misconceptions: ms,
  }
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const GENERATORS: Record<Skill, Gen> = { times, divide, fraction, areaPerimeter, rounding, decimals }

const PLANS: Record<Focus, Skill[]> = {
  mixed: ['times', 'fraction', 'areaPerimeter', 'rounding', 'divide', 'decimals'],
  times: ['times', 'divide', 'times', 'divide', 'times', 'fraction'],
  fractions: ['fraction', 'times', 'fraction', 'decimals', 'fraction', 'divide'],
  measure: ['areaPerimeter', 'times', 'areaPerimeter', 'decimals', 'areaPerimeter', 'rounding'],
}

export function buildSession(themes: ThemeId[], year: Year, focus: Focus, seed: number): Question[] {
  const r = rng(seed)
  return PLANS[focus].map((skill, i) => {
    const theme = themes[i % themes.length]
    const q = GENERATORS[skill](r, theme, year)
    const misconceptions = q.misconceptions.filter((m) => m.value > 0 && cents(m.value) !== cents(q.answer))
    return { ...q, misconceptions, id: `${seed}-${i}`, skill, theme }
  })
}

export function formatAnswer(q: Question) {
  const value = q.prefix === '£' ? money(q.answer) : fmt(q.answer)
  return `${q.prefix ?? ''}${value}${q.unit ? ` ${q.unit}` : ''}`
}
