import type { Rng } from '../bank/rng'
import { clock, fmt, int, mmss, money, numberQ, pickOne, wordQ, type AdvQuestion, type StoryChoices, type Year } from './types'

/**
 * Skill builders shared by the adventures. Each one does the maths in code and lists the mistakes children
 * typically make, so a wrong tap gets a specific explanation. The episode supplies the story words.
 */

type Words<T> = (v: T, c: StoryChoices) => string
const cid = (year: Year, ids: Partial<Record<Year, string>>) => ids[year] ?? ids[5] ?? Object.values(ids)[0]!

/** Units-digit addition that forgets to carry, a classic slip. */
export function noCarryAdd(a: number, b: number) {
  let out = 0
  let place = 1
  while (a > 0 || b > 0) {
    out += ((a % 10) + (b % 10)) % 10 * place
    a = Math.floor(a / 10)
    b = Math.floor(b / 10)
    place *= 10
  }
  return out
}

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a))
const frac = (n: number, d: number) => {
  const g = gcd(n, d)
  return `${n / g}/${d / g}`
}

/* ---------------- time ---------------- */

/** m min s s → seconds. */
export function toSeconds(r: Rng, year: Year, c: StoryChoices, words: Words<{ len: string }>, len?: number): AdvQuestion {
  const total = len ?? int(r, 150, 290)
  const m = Math.floor(total / 60)
  const s = total % 60
  return numberQ(
    {
      format: 'convert',
      curriculumId: cid(year, { 4: 'MA-Y4-ME-06', 5: 'MA-Y5-ME-06', 6: 'MA-Y6-ME-02' }),
      text: words({ len: mmss(total) }, c),
      hints: ['There are 60 seconds in every minute.', `Change the minutes first: ${m} minutes is ${m} lots of 60 seconds. Then add the extra seconds.`, `${m} × 60 = ${m * 60}. Then ${m * 60} + ${s} = ${total}.`],
      explain: `${m} minutes is ${m * 60} seconds, plus ${s} more makes ${total} seconds.`,
    },
    total,
    [
      { value: m * 100 + s, why: 'A minute has 60 seconds, not 100.' },
      { value: m * 60, why: `That’s just the ${m} whole minutes. Add the ${s} extra seconds too.` },
      { value: m + s, why: 'Turn the minutes into seconds first: each minute is 60 seconds.' },
    ],
    `secs|${total}`,
  )
}

/** Two lengths added (one played twice), answer as minutes and seconds. */
export function addTimes(r: Rng, year: Year, c: StoryChoices, words: Words<{ a: string; b: string }>, lenA?: number): AdvQuestion {
  const a = lenA ?? int(r, 160, 250)
  const b = int(r, 140, 230)
  const total = 2 * a + b
  const noCarry = (Math.floor(a / 60) * 2 + Math.floor(b / 60)) * 60 + ((2 * (a % 60) + (b % 60)) % 60)
  return numberQ(
    {
      format: 'work-out',
      curriculumId: cid(year, { 5: 'MA-Y5-ME-06', 6: 'MA-Y6-ASMD-07', 4: 'MA-Y4-ME-06' }),
      text: words({ a: mmss(a), b: mmss(b) }, c),
      hints: ['Add the minutes and the seconds separately, then tidy up.', 'If the seconds come to 60 or more, swap 60 seconds for 1 more minute.', `Seconds: ${a % 60} + ${a % 60} + ${b % 60} = ${2 * (a % 60) + (b % 60)}. Minutes: ${Math.floor(a / 60)} + ${Math.floor(a / 60)} + ${Math.floor(b / 60)}. Then carry any 60 seconds into minutes.`],
      explain: `${mmss(a)} twice plus ${mmss(b)} comes to ${mmss(total)}.`,
    },
    total,
    [
      { value: a + b, why: 'It’s played twice, so count that one twice.' },
      { value: noCarry, why: 'Close! The seconds went past 60, so one more whole minute carries over.' },
    ],
    `addt|${a}|${b}`,
    mmss,
  )
}

/** How many equal steps fit in a length of time (division). */
export function stepsIn(r: Rng, year: Year, c: StoryChoices, words: Words<{ len: string; every: number }>): AdvQuestion {
  const every = pickOne(r, [10, 12, 15, 20])
  const n = int(r, Math.ceil(160 / every), Math.floor(290 / every))
  const total = every * n
  return numberQ(
    {
      format: 'work-out',
      curriculumId: cid(year, { 6: 'MA-Y6-ASMD-03', 5: 'MA-Y5-MD-05', 4: 'MA-Y4-MD-01' }),
      text: words({ len: mmss(total), every }, c),
      hints: ['First turn the whole time into seconds.', `How many lots of ${every} seconds fit into it? That’s a division.`, `${mmss(total)} is ${total} seconds. ${total} ÷ ${every} = ${n}.`],
      explain: `${total} seconds ÷ ${every} = ${n}.`,
    },
    n,
    [
      { value: n + 1, why: 'Count the gaps: each change takes a whole step of time.' },
      { value: Math.floor(total / 10), why: `Divide by ${every}, not by 10.` },
    ],
    `steps|${total}|${every}`,
  )
}

/** Clock time after a number of minutes (with a break). Answers are 24-hour times. */
export function clockAfter(r: Rng, year: Year, c: StoryChoices, words: Words<{ start: string; minute: number; brk: number }>, startMins: number, brk: number, firstHalf: number): AdvQuestion {
  const minute = int(r, firstHalf + 3, firstHalf * 2 - 2)
  const ans = startMins + minute + brk
  const opts: Record<string, string> = {
    [clock(startMins + minute)]: `Don’t forget the ${brk}-minute break in the middle.`,
    [clock(startMins + minute + brk + 10)]: 'Count on carefully: minutes first, then hours.',
    [clock(startMins + minute - 60 + brk)]: 'Check the hour: count on from the start time.',
  }
  return wordQ(
    {
      format: 'work-out',
      curriculumId: cid(year, { 4: 'MA-Y4-ME-05', 5: 'MA-Y5-ST-02', 6: 'MA-Y6-ASMD-07' }),
      text: words({ start: clock(startMins), minute, brk }, c),
      hints: ['Start at the start time and count on.', `Add the ${minute} minutes, and the ${brk}-minute break as well.`, `${clock(startMins)} + ${minute} minutes + ${brk} minutes = ${clock(ans)}.`],
      explain: `${minute} minutes plus the ${brk}-minute break after ${clock(startMins)} is ${clock(ans)}.`,
    },
    clock(ans),
    opts,
    r,
  )
}

/** Pick the one item that fits a time limit (best plan). */
export function fitsLimit(r: Rng, year: Year, c: StoryChoices, names: string[], words: Words<{ limit: string }>): AdvQuestion {
  const limitMin = int(r, 5, 8)
  const limit = limitMin * 60
  const fit = limit - int(r, 5, 40)
  const lens = [fit, limit + int(r, 5, 25), limit + int(r, 30, 70), limit + int(r, 75, 120)]
  const items = names.slice(0, 4).map((n, i) => ({ label: `${n} (${mmss(lens[i]!)})`, len: lens[i]! }))
  const wrong: Record<string, string> = {}
  for (const it of items.slice(1)) wrong[it.label] = `That one is ${it.len - limit} seconds too long.`
  return wordQ(
    {
      format: 'best-plan',
      curriculumId: cid(year, { 4: 'MA-Y4-ME-06', 5: 'MA-Y5-ME-06', 6: 'MA-Y6-ASMD-09' }),
      text: words({ limit: `${limitMin} minutes` }, c),
      hints: [`${limitMin} minutes is ${limitMin} min 00 s. Which one is not longer than that?`, 'Compare the minutes first. If the minutes match, compare the seconds.', `Only ${items[0]!.label} is under ${limitMin} min 00 s.`],
      explain: `${items[0]!.label} fits; all the others go over ${limitMin} minutes.`,
    },
    items[0]!.label,
    wrong,
    r,
  )
}

/** Which pair fits a time limit (Year 5/6 best plan). */
export function pairFits(r: Rng, year: Year, c: StoryChoices, names: [string, string, string], words: Words<{ limit: string; list: string }>): AdvQuestion {
  const A = int(r, 150, 230)
  const B = int(r, 150, 230)
  const C = int(r, 150, 230)
  const lens = [A, B, C]
  const pairs: [number, number][] = [[0, 1], [0, 2], [1, 2]]
  const sums = pairs.map(([i, j]) => lens[i]! + lens[j]!)
  const best = sums.indexOf(Math.min(...sums))
  const second = Math.min(...sums.filter((_, i) => i !== best))
  if (second - sums[best]! < 15) return pairFits(r, year, c, names, words)
  const limit = sums[best]! + Math.floor((second - sums[best]!) / 2)
  const label = (k: number) => `${names[pairs[k]![0]]} + ${names[pairs[k]![1]]}`
  const wrong: Record<string, string> = {}
  pairs.forEach((_, k) => {
    if (k !== best) wrong[label(k)] = `Together those take ${mmss(sums[k]!)}: over the limit.`
  })
  wrong['All three'] = `All three take ${mmss(A + B + C)}: far too long.`
  return wordQ(
    {
      format: 'best-plan',
      curriculumId: cid(year, { 5: 'MA-Y5-AS-04', 6: 'MA-Y6-ASMD-07', 4: 'MA-Y4-AS-03' }),
      text: words({ limit: mmss(limit), list: names.map((n, i) => `${n} ${mmss(lens[i]!)}`).join(', ') }, c),
      hints: ['Add up each pair and compare it with the time you have.', 'Turn the times into seconds to make adding easier.', `${label(best)} takes ${mmss(sums[best]!)}, which is under ${mmss(limit)}.`],
      explain: `${label(best)} takes ${mmss(sums[best]!)}, the only pair under ${mmss(limit)}.`,
    },
    label(best),
    wrong,
    r,
  )
}

/* ---------------- place value, adding and subtracting ---------------- */

export function addTwo(r: Rng, year: Year, c: StoryChoices, words: Words<{ a: string; b: string }>): AdvQuestion {
  const a = year === 4 ? int(r, 1200, 4800) : year === 5 ? int(r, 12000, 48000) : int(r, 120000, 480000)
  const b = year === 4 ? int(r, 350, 980) : year === 5 ? int(r, 3500, 9800) : int(r, 35000, 98000)
  const ans = a + b
  const nc = noCarryAdd(a, b)
  return numberQ(
    {
      format: 'work-out',
      curriculumId: cid(year, { 4: 'MA-Y4-AS-01', 5: 'MA-Y5-AS-01', 6: 'MA-Y6-ASMD-07' }),
      text: words({ a: fmt(a), b: fmt(b) }, c),
      hints: ['Line the numbers up by place value and add from the ones.', 'When a column makes 10 or more, carry 1 into the next column.', `${fmt(a)} + ${fmt(b)}: start with the ones, carrying where you need to. It comes to ${fmt(ans)}.`],
      explain: `${fmt(a)} + ${fmt(b)} = ${fmt(ans)}.`,
    },
    ans,
    [
      ...(nc !== ans ? [{ value: nc, why: 'Check your carrying: when a column adds to 10 or more, carry 1 to the next column.' }] : []),
      { value: a - b, why: 'This one is adding: they all count.' },
    ],
    `add|${a}|${b}`,
  )
}

export function leftOver(r: Rng, year: Year, c: StoryChoices, words: Words<{ cap: string; a: string; b: string }>): AdvQuestion {
  const cap = year === 4 ? int(r, 8, 19) * 500 : year === 5 ? int(r, 24, 60) * 500 : int(r, 60, 180) * 500
  const a = Math.round(cap * (0.4 + r() * 0.2))
  const b = Math.round(cap * (0.2 + r() * 0.15))
  const ans = cap - a - b
  return numberQ(
    {
      format: 'work-out',
      curriculumId: cid(year, { 4: 'MA-Y4-AS-03', 5: 'MA-Y5-AS-04', 6: 'MA-Y6-ASMD-07' }),
      text: words({ cap: fmt(cap), a: fmt(a), b: fmt(b) }, c),
      hints: ['There are two steps here.', `First add the two amounts that are used up, then take that from ${fmt(cap)}.`, `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}. Then ${fmt(cap)} − ${fmt(a + b)} = ${fmt(ans)}.`],
      explain: `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}, and ${fmt(cap)} − ${fmt(a + b)} = ${fmt(ans)}.`,
    },
    ans,
    [
      { value: cap - a, why: `That only takes away the first amount. Take away the ${fmt(b)} too.` },
      { value: a + b, why: 'That’s how many are used. The question asks how many are left.' },
      { value: cap - a + b, why: `Both amounts are used up, so take both away from ${fmt(cap)}.` },
    ],
    `left|${cap}|${a}|${b}`,
  )
}

export function roundIt(r: Rng, year: Year, c: StoryChoices, words: Words<{ n: string; to: string }>): AdvQuestion {
  const to = year === 4 ? pickOne(r, [100, 1000]) : year === 5 ? pickOne(r, [1000, 10000]) : pickOne(r, [10000, 100000])
  const n = year === 4 ? int(r, 1100, 9899) : year === 5 ? int(r, 21000, 489000) : int(r, 210000, 4890000)
  if (n % to === 0 || Math.abs((n % to) - to / 2) < to / 20) return roundIt(r, year, c, words)
  const ans = Math.round(n / to) * to
  const down = Math.floor(n / to) * to
  const up = down + to
  return numberQ(
    {
      format: 'estimate',
      curriculumId: cid(year, { 4: 'MA-Y4-PV-07', 5: 'MA-Y5-PV-04', 6: 'MA-Y6-PV-02' }),
      text: words({ n: fmt(n), to: fmt(to) }, c),
      hints: [`Which two multiples of ${fmt(to)} is ${fmt(n)} between?`, `It’s between ${fmt(down)} and ${fmt(up)}. Look at the next digit: 5 or more rounds up.`, `${fmt(n)} is nearer to ${fmt(ans)}.`],
      explain: `${fmt(n)} is between ${fmt(down)} and ${fmt(up)}, and nearer to ${fmt(ans)}.`,
    },
    ans,
    [
      { value: ans === down ? up : down, why: 'Look at the digit after the one you’re rounding to: 5 or more rounds up, 4 or less rounds down.' },
      { value: Math.round(n / (to / 10)) * (to / 10), why: `That’s rounded to the nearest ${fmt(to / 10)}. Round to the nearest ${fmt(to)}.` },
    ],
    `round|${n}|${to}`,
  )
}

/** Which of three close numbers is biggest; the options are names. */
export function mostOf(r: Rng, year: Year, c: StoryChoices, names: [string, string, string], words: Words<{ list: string }>): AdvQuestion {
  const place = year === 4 ? 1000 : year === 5 ? 100000 : 1000000
  const base = int(r, 2, 9) * place
  // same leading digit, so the child has to look further along
  const vals = [base + int(r, 0, place - 1), base + int(r, 0, place - 1), base + int(r, 0, place - 1)]
  const uniq = new Set(vals)
  if (uniq.size < 3) return mostOf(r, year, c, names, words)
  const top = vals.indexOf(Math.max(...vals))
  const wrong: Record<string, string> = {}
  names.forEach((nm, i) => {
    if (i !== top) wrong[nm] = `${nm} has ${fmt(vals[i]!)}. Compare the digits from the left, one place at a time.`
  })
  return wordQ(
    {
      format: 'compare',
      curriculumId: cid(year, { 4: 'MA-Y4-PV-05', 5: 'MA-Y5-PV-01', 6: 'MA-Y6-PV-01' }),
      text: words({ list: names.map((n, i) => `${n}: ${fmt(vals[i]!)}`).join(', ') }, c),
      hints: ['Look at the biggest place value first.', 'If those digits match, move one place to the right and compare again.', `${names[top]} has ${fmt(vals[top]!)}, the largest.`],
      explain: `${names[top]} has the most with ${fmt(vals[top]!)}.`,
    },
    names[top]!,
    wrong,
    r,
  )
}

export function difference(r: Rng, year: Year, c: StoryChoices, words: Words<{ a: string; b: string }>): AdvQuestion {
  const a = year === 4 ? int(r, 3000, 9000) : year === 5 ? int(r, 300000, 900000) : int(r, 3000000, 9000000)
  const b = Math.round(a * (0.45 + r() * 0.35))
  const ans = a - b
  return numberQ(
    {
      format: 'work-out',
      curriculumId: cid(year, { 4: 'MA-Y4-AS-01', 5: 'MA-Y5-AS-01', 6: 'MA-Y6-PV-04' }),
      text: words({ a: fmt(a), b: fmt(b) }, c),
      hints: ['“How many more” means find the difference: take the smaller from the bigger.', 'Line up the place values. Exchange from the next column when you need to.', `${fmt(a)} − ${fmt(b)} = ${fmt(ans)}.`],
      explain: `${fmt(a)} − ${fmt(b)} = ${fmt(ans)}.`,
    },
    ans,
    [
      { value: a + b, why: '“How many more” is a difference, so subtract.' },
      { value: ans + 1000 > a ? ans + 10 : ans + 1000, why: 'Check your exchanging in the subtraction.' },
    ],
    `diff|${a}|${b}`,
  )
}

/* ---------------- multiplying and dividing ---------------- */

export function checkProduct(r: Rng, year: Year, c: StoryChoices, words: Words<{ rows: number; each: number; said: string }>): AdvQuestion {
  const rows = year === 4 ? int(r, 3, 9) : year === 5 ? int(r, 12, 28) : int(r, 14, 38)
  const each = year === 4 ? int(r, 23, 68) : year === 5 ? int(r, 21, 64) : int(r, 115, 245)
  const ans = rows * each
  const tens = Math.floor(rows / 10) * 10
  const slip = year === 4 ? ans - 40 : (rows % 10) * each + Math.floor(rows / 10) * each // forgot the tens row's zero
  const said = slip === ans ? ans + 100 : slip
  return numberQ(
    {
      format: 'spot-mistake',
      curriculumId: cid(year, { 4: 'MA-Y4-MD-04', 5: 'MA-Y5-MD-04', 6: 'MA-Y6-ASMD-01' }),
      text: words({ rows, each, said: fmt(said) }, c),
      hints: [`Work out ${rows} × ${each} yourself and compare.`, year === 4 ? `Split ${each} into tens and ones: ${rows} × ${Math.floor(each / 10) * 10} and ${rows} × ${each % 10}, then add.` : `Split ${rows} into ${tens} and ${rows % 10}: ${tens} × ${each} and ${rows % 10} × ${each}, then add.`, `${rows} × ${each} = ${fmt(ans)}.`],
      explain: `${rows} × ${each} = ${fmt(ans)}, so ${fmt(said)} was a slip.`,
    },
    ans,
    [
      { value: said, why: `That’s the number that was said. Check it: ${rows} × ${each} is something else.` },
      { value: rows + each, why: `${rows} rows of ${each} means multiply, not add.` },
    ],
    `prod|${rows}|${each}`,
  )
}

export function shareOut(r: Rng, year: Year, c: StoryChoices, words: Words<{ n: string; size: number }>, roundUp: boolean): AdvQuestion {
  const size = year === 4 ? int(r, 3, 12) : year === 5 ? int(r, 4, 9) : int(r, 12, 32)
  const k = year === 4 ? int(r, 4, 12) : year === 5 ? int(r, 14, 45) : int(r, 25, 60)
  const extra = roundUp ? int(r, 1, size - 1) : 0
  const n = size * k + extra
  const ans = roundUp ? k + 1 : k
  return numberQ(
    {
      format: roundUp ? 'best-plan' : 'work-out',
      curriculumId: roundUp ? 'MA-Y5-MD-06' : cid(year, { 4: 'MA-Y4-MD-01', 5: 'MA-Y5-MD-06', 6: 'MA-Y6-ASMD-02' }),
      text: words({ n: fmt(n), size }, c),
      hints: [`How many ${size}s go into ${fmt(n)}? That’s ${fmt(n)} ÷ ${size}.`, roundUp ? 'If there are some left over, they still need a place: that means one more.' : `Use your ${size} times table, or split ${fmt(n)} into easier parts.`, roundUp ? `${fmt(n)} ÷ ${size} = ${k} remainder ${extra}, so you need ${ans}.` : `${fmt(n)} ÷ ${size} = ${ans}.`],
      explain: roundUp ? `${fmt(n)} ÷ ${size} = ${k} r ${extra}. The ${extra} left over need one more, so ${ans}.` : `${fmt(n)} ÷ ${size} = ${ans}.`,
    },
    ans,
    [
      ...(roundUp ? [{ value: k, why: `Nearly! There are ${extra} left over, and they need one too.` }] : [{ value: ans + 1, why: `Check with multiplying: ${ans + 1} × ${size} is more than ${fmt(n)}.` }]),
      { value: n * size > 100000 ? n - size : n * size, why: 'Sharing into equal groups is dividing, not multiplying.' },
    ],
    `share|${n}|${size}|${roundUp}`,
  )
}

/* ---------------- fractions, percentages, ratio ---------------- */

export function fractionOf(r: Rng, year: Year, c: StoryChoices, words: Words<{ n: number; f: string }>): AdvQuestion {
  const d = pickOne(r, [3, 4, 5, 6, 8])
  // a fraction in its simplest form (no 2/4)
  const tops = Array.from({ length: d - 1 }, (_, i) => i + 1).filter((t) => gcd(t, d) === 1)
  const top = pickOne(r, tops)
  const n = d * int(r, 3, 6)
  const ans = (n / d) * top
  return numberQ(
    {
      format: 'work-out',
      curriculumId: cid(year, { 4: 'MA-Y4-FR-03', 5: 'MA-Y5-MD-11', 6: 'MA-Y6-RP-02' }),
      text: words({ n, f: `${top}/${d}` }, c),
      hints: [`Find 1/${d} first: share ${n} into ${d} equal parts.`, `1/${d} of ${n} is ${n / d}. You need ${top} of those parts.`, `${n} ÷ ${d} = ${n / d}, and ${n / d} × ${top} = ${ans}.`],
      explain: `1/${d} of ${n} is ${n / d}, so ${top}/${d} is ${ans}.`,
    },
    ans,
    [
      { value: n / d, why: `That’s 1/${d}. You need ${top}/${d}, so ${top} of those parts.` },
      { value: n - top, why: `Find 1/${d} of ${n} first, then multiply by ${top}.` },
    ],
    `fof|${n}|${top}|${d}`,
  )
}

export function percentOf(r: Rng, year: Year, c: StoryChoices, words: Words<{ k: number; n: number }>): AdvQuestion {
  const n = pickOne(r, [10, 20, 25, 50])
  const k = int(r, 1, n - 1)
  const ans = (k * 100) / n
  return numberQ(
    {
      format: 'convert',
      curriculumId: cid(year, { 5: 'MA-Y5-FR-12', 6: 'MA-Y6-FR-11', 4: 'MA-Y4-FR-05' }),
      text: words({ k, n }, c),
      hints: ['Per cent means “out of 100”.', `Make ${k}/${n} into a fraction out of 100: multiply the top and bottom by ${100 / n}.`, `${k}/${n} = ${ans}/100 = ${ans}%.`],
      explain: `${k} out of ${n} is the same as ${ans} out of 100, which is ${ans}%.`,
    },
    ans,
    [
      { value: k, why: `${k} out of ${n} isn’t the same as ${k} out of 100. Scale it up to 100 first.` },
      { value: 100 - ans, why: 'That’s the other part. Read again which part the question asks about.' },
    ],
    `pct|${k}|${n}`,
    (v) => `${fmt(v)}%`,
  )
}

export function priceAfter(r: Rng, _year: Year, c: StoryChoices, words: Words<{ price: string; pct: number }>): AdvQuestion {
  const price = pickOne(r, [20, 24, 30, 40, 45, 50, 60, 80])
  const pct = pickOne(r, [10, 20, 25, 50])
  const off = (price * pct) / 100
  const ans = price - off
  return numberQ(
    {
      format: 'work-out',
      curriculumId: 'MA-Y6-RP-02',
      text: words({ price: money(price), pct }, c),
      hints: [`Find ${pct}% of ${money(price)} first: that’s how much you save.`, pct === 25 ? '25% is a quarter.' : pct === 50 ? '50% is a half.' : `10% is ${money(price / 10)}; use that to build ${pct}%.`, `${pct}% of ${money(price)} is ${money(off)}. ${money(price)} − ${money(off)} = ${money(ans)}.`],
      explain: `${pct}% of ${money(price)} is ${money(off)}, so the new price is ${money(ans)}.`,
    },
    ans,
    [
      { value: off, why: 'That’s the amount you save. Take it away from the price.' },
      { value: price - pct, why: `${pct}% isn’t £${pct}. Work out ${pct}% of ${money(price)} first.` },
    ],
    `disc|${price}|${pct}`,
    money,
  )
}

export function changeFrom(r: Rng, year: Year, c: StoryChoices, words: Words<{ a: string; b: string; paid: string }>): AdvQuestion {
  const paid = year === 4 ? 20 : 50
  const a = year === 4 ? int(r, 8, 12) : int(r, 18, 28) + 0.99
  const b = year === 4 ? int(r, 2, 5) + pickOne(r, [0.25, 0.5, 0.75]) : int(r, 6, 12) + pickOne(r, [0.5, 0.25, 0.49])
  const total = Math.round((a + b) * 100) / 100
  const ans = Math.round((paid - total) * 100) / 100
  return numberQ(
    {
      format: 'work-out',
      curriculumId: cid(year, { 4: 'MA-Y4-ME-04', 5: 'MA-Y5-FR-10', 6: 'MA-Y6-ASMD-08' }),
      text: words({ a: money(a), b: money(b), paid: money(paid) }, c),
      hints: ['Two steps: add up the cost, then take it from what was paid.', `${money(a)} + ${money(b)} = ${money(total)}. Now count on from ${money(total)} to ${money(paid)}.`, `${money(paid)} − ${money(total)} = ${money(ans)}.`],
      explain: `The things cost ${money(total)}, so the change from ${money(paid)} is ${money(ans)}.`,
    },
    ans,
    [
      { value: total, why: 'That’s the total cost. The question asks for the change.' },
      { value: Math.round((paid - a) * 100) / 100, why: `Don’t forget the ${money(b)} as well.` },
      { value: Math.round((ans + 1) * 100) / 100, why: 'Count on carefully from the total to the amount paid.' },
    ],
    `chg|${a}|${b}|${paid}`,
    money,
  )
}

export function costOfMany(r: Rng, year: Year, c: StoryChoices, words: Words<{ n: number; each: string }>): AdvQuestion {
  const n = int(r, 3, 6)
  const each = year === 4 ? int(r, 4, 9) + 0.5 : int(r, 12, 29) + 0.99
  const ans = Math.round(n * each * 100) / 100
  const whole = Math.ceil(each)
  return numberQ(
    {
      format: 'work-out',
      curriculumId: cid(year, { 4: 'MA-Y4-FR-10', 5: 'MA-Y5-FR-10', 6: 'MA-Y6-FR-08' }),
      text: words({ n, each: money(each) }, c),
      hints: [`${n} lots of ${money(each)} is a multiplication.`, `A quick way: ${money(each)} is ${money(whole)} take away ${Math.round((whole - each) * 100)}p.`, `${n} × ${money(whole)} = ${money(n * whole)}, then take away ${n} × ${Math.round((whole - each) * 100)}p to get ${money(ans)}.`],
      explain: `${n} × ${money(each)} = ${money(ans)}.`,
    },
    ans,
    [
      { value: n * whole, why: `That’s ${n} × ${money(whole)}. Each one is a little less than that.` },
      { value: Math.round((each + n) * 100) / 100, why: 'Multiply the price by how many, don’t add.' },
    ],
    `many|${n}|${each}`,
    money,
  )
}

export function ratioPart(r: Rng, year: Year, c: StoryChoices, words: Words<{ a: number; b: number; t: number }>): AdvQuestion {
  const a = int(r, 1, 4)
  const b = int(r, 1, 4)
  if (a === b) return ratioPart(r, year, c, words)
  const t = (a + b) * int(r, 3, 8)
  const ans = (t / (a + b)) * a
  return numberQ(
    {
      format: 'work-out',
      curriculumId: 'MA-Y6-RP-01',
      text: words({ a, b, t }, c),
      hints: [`A ratio of ${a} : ${b} means for every ${a + b}, ${a} are the first kind.`, `How many groups of ${a + b} are in ${t}?`, `${t} ÷ ${a + b} = ${t / (a + b)} groups, and ${t / (a + b)} × ${a} = ${ans}.`],
      explain: `${t} ÷ ${a + b} = ${t / (a + b)}, so ${a} × ${t / (a + b)} = ${ans}.`,
    },
    ans,
    [
      { value: (t / (a + b)) * b, why: 'That’s the other part of the ratio.' },
      { value: (t / a) | 0, why: `Divide by the total of the ratio (${a} + ${b} = ${a + b}), not by ${a}.` },
    ],
    `ratio|${a}|${b}|${t}`,
  )
}

export function fractionLeft(r: Rng, _year: Year, c: StoryChoices, words: Words<{ x: number; y: number }>): AdvQuestion {
  const [x, y] = pickOne(r, [[3, 4], [2, 5], [4, 6], [3, 6], [2, 3], [4, 5]] as [number, number][])
  const d = (x * y) / gcd(x, y)
  const used = d / x + d / y
  const ans = frac(d - used, d)
  const wrong: Record<string, string> = {
    [frac(used, d)]: 'That’s the part that is used. The question asks what’s left.',
    [`2/${x + y}`]: 'You can’t add the tops and the bottoms. Use a common denominator first.',
    [frac(1, x * y)]: 'Turn both fractions into the same denominator, then take them from 1 whole.',
  }
  return wordQ(
    {
      format: 'missing',
      curriculumId: 'MA-Y6-FR-03',
      text: words({ x, y }, c),
      hints: [`The whole thing is 1. Take away 1/${x} and 1/${y}.`, `Use ${d} as the common denominator: 1/${x} = ${d / x}/${d} and 1/${y} = ${d / y}/${d}.`, `1 − ${d / x}/${d} − ${d / y}/${d} = ${d - used}/${d} = ${ans}.`],
      explain: `1/${x} + 1/${y} = ${frac(used, d)}, so ${ans} is left.`,
    },
    ans,
    wrong,
    r,
  )
}

export function meanOf(r: Rng, _year: Year, c: StoryChoices, words: Words<{ list: string }>): AdvQuestion {
  const n = 4
  const mean = int(r, 120, 480)
  const vals = [mean + int(r, 5, 60), mean - int(r, 5, 60), mean + int(r, 5, 60)]
  vals.push(mean * n - vals.reduce((a, b) => a + b, 0))
  if (vals[3]! <= 0 || new Set(vals).size < 4) return meanOf(r, _year, c, words)
  const sum = mean * n
  return numberQ(
    {
      format: 'work-out',
      curriculumId: 'MA-Y6-ST-02',
      text: words({ list: vals.map(fmt).join(', ') }, c),
      hints: ['The mean shares the total out equally.', 'Add all four numbers, then divide by 4.', `${vals.map(fmt).join(' + ')} = ${fmt(sum)}. ${fmt(sum)} ÷ 4 = ${fmt(mean)}.`],
      explain: `The total is ${fmt(sum)}, and ${fmt(sum)} ÷ 4 = ${fmt(mean)}.`,
    },
    mean,
    [
      { value: sum, why: 'That’s the total. Divide it by how many numbers there are.' },
      { value: Math.round(sum / 3), why: 'There are 4 numbers, so divide by 4.' },
    ],
    `mean|${vals.join('|')}`,
  )
}

/** Points from wins and draws. */
export function points(r: Rng, year: Year, c: StoryChoices, words: Words<{ w: number; d: number }>): AdvQuestion {
  const w = int(r, 4, year === 4 ? 9 : 19)
  const d = int(r, 2, 8)
  const ans = 3 * w + d
  return numberQ(
    {
      format: 'work-out',
      curriculumId: cid(year, { 4: 'MA-Y4-MD-02', 5: 'MA-Y5-MD-10', 6: 'MA-Y6-ASMD-04' }),
      text: words({ w, d }, c),
      hints: ['A win is worth 3 points and a draw is worth 1.', `Multiply the wins by 3, then add the draws.`, `${w} × 3 = ${3 * w}, plus ${d} = ${ans}.`],
      explain: `${w} wins × 3 = ${3 * w} points, plus ${d} draws = ${ans} points.`,
    },
    ans,
    [
      { value: w + d, why: 'Each win is worth 3 points, not 1.' },
      { value: 3 * (w + d), why: 'Draws only get 1 point each.' },
      { value: 3 * w, why: `Don’t forget the ${d} points from draws.` },
    ],
    `pts|${w}|${d}`,
  )
}

export function goalDifference(r: Rng, _year: Year, c: StoryChoices, words: Words<{ s: number; a: number }>): AdvQuestion {
  const s = int(r, 22, 48)
  const a = s + int(r, -12, 12)
  if (a === s) return goalDifference(r, _year, c, words)
  const ans = s - a
  return numberQ(
    {
      format: 'work-out',
      curriculumId: _year === 5 ? 'MA-Y5-PV-03' : 'MA-Y6-PV-03',
      text: words({ s, a }, c),
      hints: ['Goal difference = goals scored − goals conceded.', ans < 0 ? 'You let in more than you scored, so the answer is below zero.' : 'You scored more than you let in, so it’s above zero.', `${s} − ${a} = ${fmt(ans)}.`],
      explain: `${s} − ${a} = ${fmt(ans)}.`,
    },
    ans,
    [
      { value: -ans, why: 'Scored minus conceded: check which way round you subtracted.' },
      { value: s + a, why: 'Goal difference subtracts the goals conceded.' },
    ],
    `gd|${s}|${a}`,
  )
}

export function lapsToKm(r: Rng, year: Year, c: StoryChoices, words: Words<{ laps: number; len: number }>): AdvQuestion {
  const len = pickOne(r, [200, 250, 400, 500])
  const laps = int(r, 3, 9)
  const m = len * laps
  const ans = m / 1000
  return numberQ(
    {
      format: 'convert',
      curriculumId: cid(year, { 4: 'MA-Y4-ME-01', 5: 'MA-Y5-ME-01', 6: 'MA-Y6-ME-02' }),
      text: words({ laps, len }, c),
      hints: [`First find the distance in metres: ${laps} laps of ${len} m.`, '1 km = 1,000 m, so divide the metres by 1,000.', `${laps} × ${len} = ${fmt(m)} m = ${fmt(ans)} km.`],
      explain: `${laps} × ${len} m = ${fmt(m)} m, which is ${fmt(ans)} km.`,
    },
    ans,
    [
      { value: m / 100, why: 'There are 1,000 metres in a kilometre, not 100.' },
      { value: m / 10000, why: 'Divide by 1,000 to change metres into kilometres.' },
    ],
    `laps|${laps}|${len}`,
    (v) => `${fmt(v)} km`,
  )
}

export function milesToKm(r: Rng, _year: Year, c: StoryChoices, words: Words<{ miles: number }>): AdvQuestion {
  const miles = 5 * int(r, 2, 9)
  const ans = (miles / 5) * 8
  return numberQ(
    {
      format: 'convert',
      curriculumId: 'MA-Y6-ME-03',
      text: words({ miles }, c),
      hints: ['5 miles is about 8 km.', `How many 5s are in ${miles}? Each one is 8 km.`, `${miles} ÷ 5 = ${miles / 5}, and ${miles / 5} × 8 = ${ans} km.`],
      explain: `${miles} miles is ${miles / 5} lots of 5 miles, so about ${miles / 5} × 8 = ${ans} km.`,
    },
    ans,
    [
      { value: (miles / 8) * 5, why: 'Kilometres are shorter than miles, so there are more of them.' },
      { value: miles + 3, why: 'Use 5 miles ≈ 8 km and scale it up.' },
    ],
    `mi|${miles}`,
    (v) => `${fmt(v)} km`,
  )
}
