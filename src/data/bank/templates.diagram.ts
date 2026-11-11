/**
 * Picture questions for the 28 statements tagged DIAGRAM or INTERACTIVE in the tagging workbook.
 * Each draft carries a `diagram` (drawn by src/components/Diagram.tsx) and, where the answer is not a typed number,
 * `choices` (answer = index of the right choice) or `pick` (answer = encodePoint(x, y), the child taps the grid).
 */
import type { Template, Mistake } from './types'
import type { Rng } from './rng'
import { int, pick, f } from './rng'
import { TY, M } from './helpers'
import { encodePoint, type Pt, type GalleryItem } from './diagram'
import { flatById, drawFlat, SOLIDS, solidById, NETS, regular, type Flat } from './shapes'

const T4 = TY(4)
const T5 = TY(5)
const T6 = TY(6)
const LETTERS = ['A', 'B', 'C', 'D']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const DAY_NAMES: Record<string, string> = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday' }

function shuffle<T>(r: Rng, xs: readonly T[]): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}
const sample = <T,>(r: Rng, xs: readonly T[], n: number) => shuffle(r, xs).slice(0, n)

/** Multiple choice: the right choice plus wrong ones, each with Nova's message. */
function mc(r: Rng, right: string, wrong: [string, string][]) {
  const choices = shuffle(r, [right, ...wrong.map((w) => w[0])])
  const mistakes: Mistake[] = wrong.map(([t, message]) => ({ value: choices.indexOf(t), message }))
  return { choices, answer: choices.indexOf(right), mistakes }
}
/** Point mistakes: [x, y, message] rows, skipping the right point and duplicates. */
function pm(ans: Pt, rows: [number, number, string][]): Mistake[] {
  const out: Mistake[] = []
  for (const [x, y, message] of rows) {
    const v = encodePoint(x, y)
    if (v !== encodePoint(ans[0], ans[1]) && !out.some((m) => m.value === v)) out.push({ value: v, message })
  }
  return out
}
const pl = (n: number, one: string, many = `${one}s`) => `${f(n)} ${n === 1 ? one : many}`
const P = (p: Pt) => `(${f(p[0])}, ${f(p[1])})`

/* ============================== YEAR 4 ============================== */

const Y4: Template[] = [
  // ---- Number line: identify, represent and estimate numbers ----
  T4('D-Y4-PV-06', 'MA-Y4-PV-06', (r, c, L) => {
    const span = L === 1 ? 100 : L === 2 ? 1000 : 10000
    const from = L === 1 ? 0 : L === 2 ? pick(r, [0, 1000, 2000, 3000, 4000]) : pick(r, [0, 10000, 20000])
    const step = span / 10
    const k = int(r, 1, 9)
    const at = from + k * step + (L === 3 ? step / 2 : 0)
    if (L === 3 && k === 9) return null
    const m = M(at, [
      [at + step, `That is one mark too far. Each small jump is worth ${f(step)}.`],
      [at - step, `That is one mark short. Count the jumps again from ${f(from)}.`],
      [k, `${k} is the number of jumps. Each jump is worth ${f(step)}, not 1.`],
      [from + k * (step / 10), `Each jump is worth ${f(step)}, not ${f(step / 10)}: the line goes from ${f(from)} to ${f(from + span)} in 10 jumps.`],
    ])
    return {
      text: L === 3
        ? `${c.actor} marks a number halfway between two marks on this line. What number is the arrow pointing to?`
        : `${c.actor} marks a number on this line. What number is the arrow pointing to?`,
      answer: at, mistakes: m, params: { from, k, L },
      diagram: { type: 'numberline', from, to: from + span, ticks: 10, at, labelEvery: 10 },
      hints: [
        `The line goes from ${f(from)} to ${f(from + span)} in 10 equal jumps. What is each jump worth?`,
        `Each jump is worth ${f(step)}. Count the jumps from ${f(from)} to the arrow.${L === 3 ? ' Then add half a jump.' : ''}`,
        L === 3
          ? `${k} jumps of ${f(step)} is ${f(k * step)}, so the mark before the arrow is ${f(from + k * step)}. Half a jump more is ${f(step / 2)}, so the answer is ${f(at)}.`
          : `${k} jumps of ${f(step)} is ${f(k * step)}. ${f(from)} + ${f(k * step)} = ${f(at)}.`,
      ],
    }
  }),

  // ---- Area by counting squares ----
  T4('D-Y4-ME-03', 'MA-Y4-ME-03', (r, c, L) => {
    const cells = new Set<string>()
    const add = (x0: number, y0: number, w: number, h: number) => {
      for (let x = x0; x < x0 + w; x++) for (let y = y0; y < y0 + h; y++) cells.add(`${x},${y}`)
    }
    const w1 = int(r, 2, L === 1 ? 4 : 5)
    const h1 = int(r, 2, 3)
    add(1, 1, w1, h1)
    if (L >= 2) add(1, 1 + h1, int(r, 1, w1 - 1), int(r, 1, 2))
    if (L === 3) add(1 + w1, 1, int(r, 1, 2), int(r, 1, h1 - 1 || 1))
    const list = [...cells].map((s) => s.split(',').map(Number) as Pt)
    const area = list.length
    // perimeter: count cell edges not shared with another cell
    let per = 0
    for (const [x, y] of list) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!cells.has(`${x + dx!},${y + dy!}`)) per++
    const xs = list.map((p) => p[0])
    const ys = list.map((p) => p[1])
    const box = (Math.max(...xs) - Math.min(...xs) + 1) * (Math.max(...ys) - Math.min(...ys) + 1)
    return {
      text: `${c.actor} shades a floor plan on squared paper. Each square is 1 square centimetre. What is the area of the shaded shape, in square centimetres?`,
      answer: area,
      mistakes: M(area, [
        [per, `${per} is the distance around the edge (the perimeter). Area counts the squares inside.`],
        [area - 1, 'Close! You missed one square. Try counting row by row.'],
        [area + 1, 'Close! You counted one square twice. Try counting row by row.'],
        [box, `${box} is the whole rectangle around the shape. Only count the shaded squares.`],
      ]),
      params: { key: [...cells].sort().join(';') },
      diagram: { type: 'grid', x: [0, 9], y: [0, 7], cells: list },
      hints: [
        'Area is the number of squares inside the shape.',
        'Count the shaded squares one row at a time, then add the rows.',
        `Counting every shaded square gives ${area}, so the area is ${area} square centimetres.`,
      ],
    }
  }),

  // ---- Telling the time ----
  T4('D-Y4-ME-05', 'MA-Y4-ME-05', (r, c, L) => {
    const h = int(r, 1, 11)
    const m = pick(r, L === 1 ? [5, 10, 15, 20, 25, 35, 40, 45, 50, 55] : [5, 10, 20, 25, 35, 40, 50, 55])
    const mm = String(m).padStart(2, '0')
    const diagram = { type: 'clock' as const, h, m }
    if (L === 3) {
      const ans = 60 - m
      return {
        text: `${c.actor} needs to be at ${c.place} at ${h + 1 === 12 ? 12 : (h % 12) + 1} o'clock. How many minutes is that from the time on the clock?`,
        answer: ans, diagram, params: { h, m, L },
        mistakes: M(ans, [
          [m, `${m} is how many minutes past ${h} it is now. How many minutes are left until the next o'clock?`],
          [Math.round(m / 5), `The minute hand points at ${m / 5}, but each number on the clock is 5 minutes.`],
          [ans + 5, 'One step too many. Count on in fives from the minute hand to the 12.'],
        ]),
        hints: [
          'The long hand shows the minutes. How far is it from the 12?',
          'Count on in fives from where the long hand is to the 12 at the top.',
          `The clock shows ${h}:${mm}. From ${m} minutes past to the hour is 60 − ${m} = ${ans} minutes.`,
        ],
      }
    }
    const right = L === 1 ? `${h}:${mm}` : `${String(h + 12).padStart(2, '0')}:${mm}`
    const swapH = Math.round(m / 5) || 12
    const wrong: [string, string][] = L === 1
      ? [
          [`${h}:${String(Math.round(m / 5)).padStart(2, '0')}`, `The minute hand points at ${m / 5}, but each number is worth 5 minutes, so it is ${m} minutes.`],
          [`${(h % 12) + 1}:${mm}`, `The hour hand has not reached ${(h % 12) + 1} yet. It is still after ${h}.`],
          [`${swapH}:${String(h * 5 % 60).padStart(2, '0')}`, 'The hands are mixed up. The short hand shows the hour and the long hand shows the minutes.'],
        ]
      : [
          [`0${h}:${mm}`.slice(-5), `${`0${h}`.slice(-2)}:${mm} is in the morning. In the afternoon, add 12 to the hour.`],
          [`${String(h + 11).padStart(2, '0')}:${mm}`, 'Add 12 to the hour for the afternoon, not 11.'],
          [`${String(h + 12).padStart(2, '0')}:${String(Math.round(m / 5)).padStart(2, '0')}`, `Each number on the clock is worth 5 minutes, so the minutes are ${mm}.`],
        ]
    const uniq = wrong.filter((w, i) => w[0] !== right && wrong.findIndex((x) => x[0] === w[0]) === i)
    if (uniq.length < 3) return null
    const q = mc(r, right, uniq)
    return {
      text: L === 1 ? `${c.actor} looks at the clock. What time does it show?` : `It is the afternoon at ${c.place}. Which 24-hour time does the clock show?`,
      ...q, diagram, params: { h, m, L },
      hints: [
        'The short hand shows the hour. The long hand shows the minutes.',
        L === 1 ? 'Count the minutes in fives from the 12 to the long hand.' : 'First read the time on the clock, then add 12 to the hour because it is the afternoon.',
        L === 1 ? `The short hand is just after ${h} and the long hand shows ${m} minutes, so it is ${h}:${mm}.` : `The clock shows ${h}:${mm}. In the afternoon that is ${right}.`,
      ],
    }
  }),

  // ---- Classify shapes by properties ----
  T4('D-Y4-GPS-01', 'MA-Y4-GPS-01', (r, c, L) => {
    const quads = ['square', 'rectangle', 'rhombus', 'parallelogram', 'trapezium', 'kite', 'iquad']
    const tris = ['equilateral', 'isosceles', 'scalene', 'right']
    type Q = { ask: string; pool: string[]; target: string; ok: (s: Flat) => boolean; why: (s: Flat) => string }
    const QS: Q[][] = [
      [
        { ask: 'is a trapezium', pool: quads, target: 'trapezium', ok: (s) => s.par === 1, why: (s) => (s.par === 2 ? `Shape that is a ${s.name} has two pairs of parallel sides. A trapezium has exactly one pair.` : `That is a ${s.name}. A trapezium has exactly one pair of parallel sides.`) },
        { ask: 'is a kite', pool: quads, target: 'kite', ok: (s) => s.id === 'kite', why: (s) => `That is a ${s.name}. A kite has two pairs of equal sides that are next to each other.` },
        { ask: 'is a rectangle', pool: quads.filter((x) => x !== 'square'), target: 'rectangle', ok: (s) => s.right === 4, why: (s) => `That is a ${s.name}. A rectangle has four right angles.` },
        { ask: 'is an equilateral triangle', pool: tris, target: 'equilateral', ok: (s) => s.id === 'equilateral', why: (s) => `That is a ${s.name}. An equilateral triangle has three equal sides.` },
      ],
      [
        { ask: 'has exactly one pair of parallel sides', pool: quads, target: 'trapezium', ok: (s) => s.par === 1, why: (s) => (s.par === 2 ? `That ${s.name} has two pairs of parallel sides.` : `That ${s.name} has no parallel sides.`) },
        { ask: 'has four equal sides but no right angles', pool: quads, target: 'rhombus', ok: (s) => s.equalSides && s.right === 0, why: (s) => (s.right ? `That ${s.name} has right angles.` : `The sides of that ${s.name} are not all equal.`) },
        { ask: 'has a right angle', pool: tris, target: 'right', ok: (s) => s.right > 0, why: (s) => `That ${s.name} has no right angle. Look for a square corner.` },
        { ask: 'has no parallel sides', pool: quads, target: 'kite', ok: (s) => s.par === 0, why: (s) => `That ${s.name} has ${s.par === 1 ? 'one pair' : 'two pairs'} of parallel sides.` },
      ],
      [
        { ask: 'has two pairs of parallel sides, no right angles and sides that are not all equal', pool: quads, target: 'parallelogram', ok: (s) => s.par === 2 && s.right === 0 && !s.equalSides, why: (s) => (s.par !== 2 ? `That ${s.name} does not have two pairs of parallel sides.` : s.right ? `That ${s.name} has right angles.` : `All the sides of that ${s.name} are equal.`) },
        { ask: 'has exactly two equal sides', pool: tris, target: 'isosceles', ok: (s) => s.id === 'isosceles', why: (s) => (s.equalSides ? `All three sides of that ${s.name} are equal.` : `That ${s.name} has no equal sides.`) },
        { ask: 'has no equal sides and no right angle', pool: tris, target: 'scalene', ok: (s) => !s.equalSides && s.id !== 'isosceles' && s.right === 0, why: (s) => (s.right ? `That ${s.name} has a right angle.` : `That ${s.name} has equal sides.`) },
        { ask: 'has four right angles but sides that are not all equal', pool: quads, target: 'rectangle', ok: (s) => s.right === 4 && !s.equalSides, why: (s) => (s.right === 4 ? `All four sides of that ${s.name} are equal.` : `That ${s.name} does not have four right angles.`) },
      ],
    ]
    const q = pick(r, QS[L - 1]!)
    const wrongPool = q.pool.filter((id) => !q.ok(flatById(id)))
    if (wrongPool.length < 3) return null
    const shapes = shuffle(r, [q.target, ...sample(r, wrongPool, 3)])
    const turns = shapes.map(() => pick(r, [0, 0, 15, -15, 90]))
    const items: GalleryItem[] = shapes.map((id, i) => ({ label: LETTERS[i]!, polys: [drawFlat(flatById(id), turns[i])] }))
    const answer = shapes.indexOf(q.target)
    const mistakes: Mistake[] = shapes.map((id, i) => ({ value: i, message: `Shape ${LETTERS[i]}: ${q.why(flatById(id))}` })).filter((m) => m.value !== answer)
    return {
      text: `${c.actor} sorts some shapes. Which shape ${q.ask}?`,
      choices: LETTERS.map((l) => `Shape ${l}`), answer, mistakes, diagram: { type: 'gallery', items },
      params: { order: shapes.join(','), turns: turns.join(','), ask: q.ask },
      hints: [
        'Check each shape against the rule one at a time.',
        'Look at the sides (equal? parallel?) and the corners (right angles?).',
        `Shape ${LETTERS[answer]} is the ${flatById(q.target).name}, which ${q.ask}.`,
      ],
    }
  }),

  // ---- Acute and obtuse angles; order angles ----
  T4('D-Y4-GPS-02', 'MA-Y4-GPS-02', (r, c, L) => {
    const asks = L === 1 ? ['obtuse', 'acute'] : L === 2 ? ['largest', 'right'] : ['smallest', 'largest']
    const ask = pick(r, asks)
    let degs: number[]
    if (ask === 'obtuse') degs = [int(r, 10, 16) * 10, int(r, 2, 4) * 10, int(r, 5, 8) * 10, 90]
    else if (ask === 'acute') degs = [int(r, 2, 8) * 10, int(r, 10, 13) * 10, int(r, 14, 17) * 10, 90]
    else if (ask === 'right') degs = [90, int(r, 3, 7) * 10, int(r, 11, 15) * 10, int(r, 8, 8) * 10 - 5]
    else {
      const base = sample(r, L === 2 ? [30, 60, 90, 120, 150, 170] : [40, 50, 60, 70, 100, 110, 120, 130], 4)
      degs = ask === 'largest' ? [...base].sort((a, b) => b - a) : [...base].sort((a, b) => a - b)
    }
    const order = shuffle(r, [0, 1, 2, 3])
    const shown = order.map((i) => degs[i]!)
    const turns = shown.map(() => pick(r, [0, 20, 40, 60, -20]))
    const items: GalleryItem[] = shown.map((d, i) => {
      const t = turns[i]!
      const ray = (a: number): Pt => [Math.round((15 + 70 * Math.cos(((a + t) * Math.PI) / 180)) * 10) / 10, Math.round((25 + 70 * Math.sin(((a + t) * Math.PI) / 180)) * 10) / 10]
      return { label: LETTERS[i]!, polys: [], lines: [[ray(0), [15, 25], ray(d)]] }
    })
    // fit angles that point left
    for (const it of items) it.lines = it.lines!.map((ln) => ln.map(([x, y]) => [Math.max(2, Math.min(98, x)), Math.max(2, Math.min(98, y))] as Pt))
    const answer = order.indexOf(0)
    const kind = (d: number) => (d < 90 ? 'acute (less than a right angle)' : d === 90 ? 'a right angle' : 'obtuse (more than a right angle)')
    const mistakes: Mistake[] = shown.map((d, i) => ({ value: i, message: `Angle ${LETTERS[i]} is ${kind(d)}.${ask === 'largest' || ask === 'smallest' ? ' Compare how wide open the arms are.' : ''}` })).filter((m) => m.value !== answer)
    const want = ask === 'obtuse' ? 'is obtuse' : ask === 'acute' ? 'is acute' : ask === 'right' ? 'is a right angle' : `is the ${ask}`
    return {
      text: `${c.actor} draws four angles. Which angle ${want}?`,
      choices: LETTERS.map((l) => `Angle ${l}`), answer, mistakes, diagram: { type: 'gallery', items },
      params: { degs: shown.join(','), turns: turns.join(','), ask },
      hints: [
        'Compare each angle with a right angle, like the corner of a page.',
        'Acute is smaller than a right angle. Obtuse is bigger than a right angle but less than a straight line. A bigger angle has its arms opened wider.',
        `Angle ${LETTERS[answer]} ${want}.`,
      ],
    }
  }),

  // ---- Lines of symmetry ----
  T4('D-Y4-GPS-03', 'MA-Y4-GPS-03', (r, c, L) => {
    const ids = L === 1 ? ['square', 'rectangle', 'isosceles', 'kite', 'scalene', 'lshape'] : L === 2 ? ['rhombus', 'trapezium', 'parallelogram', 'equilateral', 'right', 'rectangle'] : ['pentagon', 'hexagon', 'octagon', 'equilateral', 'parallelogram', 'square']
    const s = flatById(pick(r, ids))
    const turn = pick(r, [0, 0, 30, 45, 90])
    const ans = s.sym
    return {
      text: `${c.actor} draws this shape. How many lines of symmetry does it have?`,
      answer: ans, diagram: { type: 'gallery', items: [{ label: '', polys: [drawFlat(s, turn)] }] },
      params: { id: s.id, turn },
      mistakes: M(ans, [
        [s.id === 'rectangle' ? 4 : ans === 4 ? 2 : ans + 1, s.id === 'rectangle' ? 'The diagonals of a rectangle are not lines of symmetry. Fold along one and the halves do not match.' : `Check each fold carefully. This ${s.name} has a different number.`],
        [s.id === 'parallelogram' ? 2 : ans === 0 ? 1 : ans - 1, s.id === 'parallelogram' ? 'A parallelogram has no lines of symmetry. Folding it never makes the halves match.' : 'You missed one. Try folding the shape in every direction, including corner to corner.'],
        [s.sides, `A ${s.name} has ${s.sides} sides, but that is not always the number of lines of symmetry.`],
      ]),
      hints: [
        'A line of symmetry is a fold line where both halves match exactly.',
        'Imagine folding the shape: across, up and down, and corner to corner. Count the folds that match.',
        `A ${s.name} has ${ans === 0 ? 'no lines' : pl(ans, 'line')} of symmetry.`,
      ],
    }
  }),

  // ---- Complete a symmetric figure (tap) ----
  T4('D-Y4-GPS-04', 'MA-Y4-GPS-04', (r, c, L) => {
    const vertical = L !== 2
    const m = vertical ? 5 : 4
    if (L < 3) {
      const p: Pt = vertical ? [int(r, 1, 4), int(r, 1, 7)] : [int(r, 1, 9), int(r, 5, 7)]
      const ans: Pt = vertical ? [2 * m - p[0], p[1]] : [p[0], 2 * m - p[1]]
      return {
        text: `${c.actor} puts a dot on one side of the mirror line. Tap where its reflection goes.`,
        answer: encodePoint(...ans), pick: true, params: { x: p[0], y: p[1], L },
        diagram: { type: 'grid', x: [0, 10], y: [0, 8], mirror: vertical ? { x: m } : { y: m }, points: [{ x: p[0], y: p[1], tone: 'a' }], pick: true },
        mistakes: pm(ans, [
          [p[0], p[1], 'That is where the dot already is. Its reflection is on the other side of the mirror line.'],
          vertical ? [ans[0] + 1, ans[1], 'Nearly! Count the squares from the dot to the mirror, then the same number on the other side.'] : [ans[0], ans[1] + 1, 'Nearly! Count the squares from the dot to the mirror, then the same number on the other side.'],
          vertical ? [ans[0] - 1, ans[1], 'Nearly! Count the squares from the dot to the mirror, then the same number on the other side.'] : [ans[0], ans[1] - 1, 'Nearly! Count the squares from the dot to the mirror, then the same number on the other side.'],
        ]),
        hints: [
          'A reflection is the same distance from the mirror line, on the other side.',
          `Count how many squares the dot is from the mirror line. Go the same number of squares past the line, ${vertical ? 'staying on the same row' : 'staying in the same column'}.`,
          `The dot is ${pl(Math.abs((vertical ? p[0] : p[1]) - m), 'square')} from the line, so its reflection is ${pl(Math.abs((vertical ? p[0] : p[1]) - m), 'square')} on the other side.`,
        ],
      }
    }
    // L3: half a shape drawn; tap the missing corner of the other half
    const a: Pt = [int(r, 1, 3), int(r, 1, 3)]
    const b: Pt = [int(r, 2, 4), int(r, 5, 7)]
    const shape: Pt[] = [[m, a[1]], a, b, [m, b[1] + 1]]
    const mirrorOf = (p: Pt): Pt => [2 * m - p[0], p[1]]
    const ans = mirrorOf(b)
    return {
      text: `${c.actor} is drawing a shape that is symmetric about the mirror line. The right half is started. Tap where the reflection of corner P goes.`,
      answer: encodePoint(...ans), pick: true, params: { ax: a[0], ay: a[1], bx: b[0], by: b[1] },
      diagram: { type: 'grid', x: [0, 10], y: [0, 8], mirror: { x: m }, shapes: [{ pts: shape }, { pts: [[m, a[1]], mirrorOf(a)], tone: 'ghost' }], points: [{ x: b[0], y: b[1], label: 'P' }, { x: mirrorOf(a)[0], y: mirrorOf(a)[1], tone: 'b' }], pick: true },
      mistakes: pm(ans, [
        [b[0], b[1], 'That is corner P itself. Its reflection is on the other side of the mirror.'],
        [ans[0] + 1, ans[1], 'One square too far. P is the same distance from the mirror as its reflection.'],
        [ans[0] - 1, ans[1], 'One square short. P is the same distance from the mirror as its reflection.'],
        [ans[0], ans[1] - 1, 'Stay on the same row as P: a mirror line going up and down does not move points up or down.'],
      ]),
      hints: [
        'Each corner on the left has a matching corner on the right, the same distance from the mirror line.',
        `P is ${pl(m - b[0], 'square')} to the left of the mirror. Its reflection is the same distance to the right, on the same row.`,
        `Count ${pl(m - b[0], 'square')} right from the mirror line, on P's row. That is the missing corner.`,
      ],
    }
  }),

  // ---- Coordinates in the first quadrant ----
  T4('D-Y4-GPD-01a', 'MA-Y4-GPD-01', (r, c, L) => {
    const max = L === 1 ? 6 : 8
    const x = int(r, 1, max)
    const y = int(r, 1, max)
    if (x === y) return null
    return {
      text: `${c.actor} hides some ${c.thing} at the point ${P([x, y])}. Tap that point on the grid.`,
      answer: encodePoint(x, y), pick: true, params: { x, y },
      diagram: { type: 'grid', x: [0, max], y: [0, max], axes: true, pick: true },
      mistakes: pm([x, y], [
        [y, x, `You went ${y} across and ${x} up. The first number is how far across, the second is how far up.`],
        [x + 1, y, 'One square too far across. Start counting from 0.'],
        [x, y + 1, 'One square too far up. Start counting from 0.'],
      ]),
      hints: ['Coordinates are written (across, up).', `Start at 0. Go ${x} across, then ${y} up.`, `Go along the bottom to ${x}, then straight up to ${y}. Tap where the lines cross.`],
    }
  }),
  T4('D-Y4-GPD-01b', 'MA-Y4-GPD-01', (r, c, L) => {
    const max = L === 3 ? 10 : 8
    const target: Pt = [int(r, 1, max), int(r, 1, max)]
    if (target[0] === target[1]) return null
    const decoys: Pt[] = [[target[1], target[0]], [target[0] + 1 > max ? target[0] - 1 : target[0] + 1, target[1]], [target[0], target[1] - 1 < 1 ? target[1] + 1 : target[1] - 1]]
    const pts = shuffle(r, [target, ...decoys])
    const answer = pts.indexOf(target)
    const mistakes: Mistake[] = pts.map((p, i) => ({ value: i, message: `Point ${LETTERS[i]} is at ${P(p)}.${p[0] === target[1] && p[1] === target[0] ? ' The numbers are the other way round: across comes first.' : ''}` })).filter((m) => m.value !== answer)
    return {
      text: `${c.actor} plots four points. Which point is at ${P(target)}?`,
      choices: LETTERS.map((l) => `Point ${l}`), answer, mistakes, params: { tx: target[0], ty: target[1], order: pts.map((p) => p.join(':')).join(',') },
      diagram: { type: 'grid', x: [0, max], y: [0, max], axes: true, points: pts.map((p, i) => ({ x: p[0], y: p[1], label: LETTERS[i] })) },
      hints: ['The first number tells you how far across. The second tells you how far up.', `Find ${target[0]} along the bottom, then go up to ${target[1]}.`, `Point ${LETTERS[answer]} is at ${P(target)}.`],
    }
  }),

  // ---- Translations ----
  T4('D-Y4-GPD-02', 'MA-Y4-GPD-02', (r, c, L) => {
    const dx = pick(r, [-4, -3, -2, 2, 3, 4])
    const dy = L === 1 ? 0 : pick(r, [-3, -2, 2, 3])
    const base: Pt[] = [[0, 0], [2, 0], [2, 2], [0, 2]].map(([x, y]) => [x!, y!] as Pt)
    const ox = dx > 0 ? int(r, 1, 3) : int(r, 5, 6)
    const oy = dy > 0 ? int(r, 1, 2) : dy < 0 ? int(r, 4, 5) : int(r, 2, 4)
    const A = base.map(([x, y]) => [x + ox, y + oy] as Pt)
    const B = A.map(([x, y]) => [x + dx, y + dy] as Pt)
    const h = (n: number) => `${pl(Math.abs(n), 'square')} ${n > 0 ? 'right' : 'left'}`
    const v = (n: number) => `${pl(Math.abs(n), 'square')} ${n > 0 ? 'up' : 'down'}`
    const say = (x: number, y: number) => (y === 0 ? h(x) : x === 0 ? v(y) : `${h(x)}, ${v(y)}`)
    if (L === 3) {
      const p = A[2]!
      const ans: Pt = [p[0] + dx, p[1] + dy]
      return {
        text: `${c.actor} moves this square ${say(dx, dy)}. Tap where the corner marked P ends up.`,
        answer: encodePoint(...ans), pick: true, params: { dx, dy, ox, oy, L },
        diagram: { type: 'grid', x: [0, 10], y: [0, 8], shapes: [{ pts: A, label: 'A' }], points: [{ x: p[0], y: p[1], label: 'P' }], pick: true },
        mistakes: pm(ans, [
          [p[0] - dx, p[1] + dy, 'You went the wrong way across. Check: left or right?'],
          [p[0] + dx, p[1] - dy, 'You went the wrong way up or down. Check the direction again.'],
          [p[0] + dy, p[1] + dx, 'The across and up-down moves are swapped.'],
        ]),
        hints: ['Move the corner one step at a time: first across, then up or down.', `From P, count ${h(dx)}. Then count ${v(dy)}.`, `P moves to ${P(ans)}.`],
      }
    }
    const right = say(dx, dy)
    const wrong: [string, string][] = [
      [say(-dx, dy), 'Check the direction across: is B to the left or the right of A?'],
      [dy === 0 ? say(dx + (dx > 0 ? 1 : -1), 0) : say(dx, -dy), dy === 0 ? 'Count the squares between matching corners, not the gaps after the shape.' : 'Check the direction up or down.'],
      [dy === 0 ? say(dx - (dx > 0 ? 1 : -1), 0) : say(dy, dx), dy === 0 ? 'Count from one corner of A to the matching corner of B.' : 'The across and up-down moves are swapped.'],
    ]
    const q = mc(r, right, wrong.filter((w, i) => w[0] !== right && wrong.findIndex((x) => x[0] === w[0]) === i))
    if (q.choices.length < 4) return null
    return {
      text: `${c.actor} slides shape A to make shape B. Which move did ${c.actor} make?`,
      ...q, params: { dx, dy, ox, oy, L },
      diagram: { type: 'grid', x: [0, 10], y: [0, 8], shapes: [{ pts: A, label: 'A' }, { pts: B, label: 'B', tone: 'b' }] },
      hints: ['Pick one corner of A and find the same corner on B.', 'Count the squares across between the two corners, then the squares up or down.', `B is ${right} from A.`],
    }
  }),

  // ---- Plot points and draw a polygon (tap) ----
  T4('D-Y4-GPD-03', 'MA-Y4-GPD-03', (r, c, L) => {
    const x1 = int(r, 1, 3)
    const y1 = int(r, 1, 3)
    const w = int(r, 2, 4)
    const h = L === 2 ? w : int(r, 2, 4)
    const shift = L === 3 ? int(r, 1, 2) : 0
    if (L === 1 && w === h) return null
    // A bottom-left, B top-left, C top-right; find D
    const A: Pt = [x1, y1]
    const B: Pt = [x1 + shift, y1 + h]
    const C: Pt = [x1 + shift + w, y1 + h]
    const D: Pt = [x1 + w, y1]
    const name = L === 1 ? 'rectangle' : L === 2 ? 'square' : 'parallelogram'
    return {
      text: `${c.actor} plots three corners of a ${name}: A ${P(A)}, B ${P(B)} and C ${P(C)}. Tap where the fourth corner, D, goes.`,
      answer: encodePoint(...D), pick: true, params: { x1, y1, w, h, shift },
      diagram: { type: 'grid', x: [0, 8], y: [0, 8], axes: true, points: [{ x: A[0], y: A[1], label: 'A' }, { x: B[0], y: B[1], label: 'B' }, { x: C[0], y: C[1], label: 'C' }], shapes: [{ pts: [A, B, C], tone: 'ghost' }], pick: true },
      mistakes: pm(D, [
        [C[0], A[1] + 0, L === 3 ? 'In a parallelogram the bottom side is the same length as the top side, but it starts at A, not under C.' : 'Check your corner lines up with A and C.'],
        [D[1], D[0], 'The coordinates are swapped: across first, then up.'],
        [D[0], D[1] + 1, 'D should be level with A.'],
      ]),
      hints: [
        L === 3 ? 'Opposite sides of a parallelogram are the same length and point the same way.' : `Opposite sides of a ${name} are equal and the corners are right angles.`,
        `D is level with A. Go from A the same distance across as from B to C (${pl(w, 'square')}).`,
        `A is at ${P(A)}. ${pl(w, 'square')} across from A is ${P(D)}.`,
      ],
    }
  }),

  // ---- Bar charts and time graphs ----
  T4('D-Y4-ST-01a', 'MA-Y4-ST-01', (r, c, L) => {
    const step = L === 1 ? 2 : L === 2 ? 5 : 10
    const max = step * 10
    const values = DAYS.map(() => (L === 3 ? int(r, 1, 9) * step + pick(r, [0, step / 2]) : int(r, 1, 10) * step))
    const i = int(r, 0, 4)
    const ans = values[i]!
    if (L === 3 && ans % step === 0) return null
    return {
      text: `The bar chart shows how many ${c.thing} ${c.actor} collected each day. How many did ${c.actor} collect on ${DAY_NAMES[DAYS[i]!]}?`,
      answer: ans, params: { values: values.join(','), i },
      diagram: { type: 'bar', labels: DAYS, values, max, step, title: `${c.thing[0]!.toUpperCase()}${c.thing.slice(1)} collected` },
      mistakes: M(ans, [
        [ans / step, `${ans / step} is the number of lines up, but each line is worth ${step}.`],
        [ans - step / 2, 'Look where the top of the bar ends. Is it between two lines?'],
        [ans + step, 'That is one line too high. Read across from the top of the bar.'],
        [values[i === 0 ? 1 : i - 1]!, 'That is a different day. Find the right bar first.'],
      ]),
      hints: [`Find the bar for ${DAY_NAMES[DAYS[i]!]}.`, `Each line on the scale is worth ${step}. Read across from the top of the bar to the scale.${L === 3 ? ' If it stops between two lines, it is halfway.' : ''}`, `The ${DAY_NAMES[DAYS[i]!]} bar reaches ${ans}.`],
    }
  }),
  T4('D-Y4-ST-01b', 'MA-Y4-ST-01', (r, c, L) => {
    const step = L === 1 ? 10 : L === 2 ? 20 : 25
    const times = ['9:00', '10:00', '11:00', '12:00', '1:00', '2:00']
    let d = 0
    const ys = times.map((_, k) => (k === 0 ? 0 : (d += int(r, 0, 3) * step)))
    const max = Math.max(step * 4, Math.ceil(ys[5]! / step) * step + step)
    const k = int(r, 1, 5)
    const ans = ys[k]!
    if (ans <= step || max > step * 10) return null
    return {
      text: `The time graph shows how far the ${c.crowd}' bus had travelled. How many kilometres had it travelled by ${times[k]}?`,
      answer: ans, params: { ys: ys.join(','), k },
      diagram: { type: 'line', xs: times, ys, max, step, unit: 'km', xTitle: 'time' },
      mistakes: M(ans, [
        [ans / step, `Each line on the scale is worth ${step} km, not 1.`],
        [ys[k - 1]!, `That is the distance at ${times[k - 1]}. Find ${times[k]} along the bottom.`],
        [k < 5 ? ys[k + 1]! : ans + step, k < 5 ? `That is the distance at ${times[k + 1]}.` : 'Read across from the point to the scale carefully.'],
      ]),
      hints: [`Find ${times[k]} along the bottom.`, `Go up to the line, then across to the scale. Each line is worth ${step} km.`, `At ${times[k]} the line is at ${ans} km.`],
    }
  }),

  // ---- Pictograms and tables ----
  T4('D-Y4-ST-02a', 'MA-Y4-ST-02', (r, c, L) => {
    const per = L === 1 ? 2 : L === 2 ? 4 : 10
    const labels = sample(r, ['Red team', 'Blue team', 'Green team', 'Gold team', 'Silver team'], 4)
    const values = labels.map(() => int(r, 1, 8) * per + (L >= 2 && r() < 0.5 ? per / 2 : 0))
    const [a, b] = sample(r, [0, 1, 2, 3], 2)
    const kind = L === 1 ? 'total' : 'diff'
    if (values[a!] === values[b!]) return null
    const hi = values[a!]! > values[b!]! ? a! : b!
    const lo = hi === a ? b! : a!
    const ans = kind === 'total' ? values[a!]! + values[b!]! : values[hi]! - values[lo]!
    const icon = pick(r, ['⭐', '⚽', '🎵', '🌟'])
    return {
      text: kind === 'total'
        ? `The pictogram shows the ${c.thing} each team collected. How many did the ${labels[a!]} and the ${labels[b!]} collect altogether?`
        : `The pictogram shows the ${c.thing} each team collected. How many more did the ${labels[hi]} collect than the ${labels[lo]}?`,
      answer: ans, params: { values: values.join(','), a: a!, b: b!, kind },
      diagram: { type: 'picto', labels, values, per, icon, title: `${c.thing[0]!.toUpperCase()}${c.thing.slice(1)} collected` },
      mistakes: M(ans, [
        [kind === 'total' ? (values[a!]! + values[b!]!) / per : (values[hi]! - values[lo]!) / per, `That is the number of pictures. Each picture is worth ${per}.`],
        [kind === 'total' ? Math.abs(values[a!]! - values[b!]!) : values[hi]! + values[lo]!, kind === 'total' ? 'Altogether means add, not find the difference.' : 'How many more means find the difference, not add.'],
        [kind === 'total' ? ans - per / 2 : ans + per / 2, 'Check the half pictures: half a picture is worth half the key.'],
      ]),
      hints: [`The key says each picture is worth ${per}.${L >= 2 ? ` Half a picture is worth ${per / 2}.` : ''}`, `Work out each team's total first: ${labels[a!]} and ${labels[b!]}.`, `${labels[a!]}: ${values[a!]}. ${labels[b!]}: ${values[b!]}. ${kind === 'total' ? `${values[a!]} + ${values[b!]} = ${ans}` : `${values[hi]} − ${values[lo]} = ${ans}`}.`],
    }
  }),
  T4('D-Y4-ST-02b', 'MA-Y4-ST-02', (r, c, L) => {
    const cols = ['Mon', 'Tue', 'Wed']
    const rows = sample(r, c.thing === c.thing2 ? [c.thing] : [c.thing, c.thing2, 'badges'], 3)
    const big = L === 3 ? 100 : L === 2 ? 50 : 10
    const data = rows.map(() => cols.map(() => int(r, 2, 19) * (big / 10) + (L === 3 ? int(r, 0, 9) : 0)))
    const ri = int(r, 0, 2)
    const kind = L === 1 ? 'row' : L === 2 ? 'col' : 'diff'
    const ans = kind === 'row' ? data[ri]!.reduce((s, v) => s + v, 0) : kind === 'col' ? data.reduce((s, row) => s + row[0]!, 0) : Math.abs(data[ri]![2]! - data[ri]![0]!)
    if (ans === 0) return null
    const name = (s: string) => `${s[0]!.toUpperCase()}${s.slice(1)}`
    return {
      text: kind === 'row'
        ? `${c.actor} made a table of things given out. How many ${rows[ri]} were given out altogether on the three days?`
        : kind === 'col'
          ? `${c.actor} made a table of things given out. How many things were given out altogether on Monday?`
          : `${c.actor} made a table of things given out. What is the difference between the number of ${rows[ri]} given out on Monday and on Wednesday?`,
      answer: ans, params: { data: data.flat().join(','), ri, kind },
      diagram: { type: 'table', head: ['', ...cols], rows: rows.map((rw, i) => [name(rw), ...data[i]!]) },
      mistakes: M(ans, [
        [kind === 'row' ? data[ri]![0]! : kind === 'col' ? data[0]![0]! : data[ri]![2]! + data[ri]![0]!, kind === 'diff' ? 'The difference means subtract, not add.' : 'Add up all of the numbers you need, not just one.'],
        [kind === 'row' ? data.reduce((s, row) => s + row[0]!, 0) : kind === 'col' ? data[ri]!.reduce((s, v) => s + v, 0) : Math.abs(data[ri]![1]! - data[ri]![0]!), kind === 'row' ? 'That adds a column. You need a row.' : kind === 'col' ? 'That adds a row. You need the Monday column.' : 'Use the Monday and Wednesday numbers.'],
      ]),
      hints: [kind === 'col' ? 'Find the Monday column.' : `Find the ${rows[ri]} row.`, kind === 'diff' ? 'Subtract the smaller number from the bigger one.' : 'Add the numbers together.', kind === 'row' ? `${data[ri]!.join(' + ')} = ${ans}.` : kind === 'col' ? `${data.map((row) => row[0]).join(' + ')} = ${ans}.` : `${Math.max(data[ri]![0]!, data[ri]![2]!)} − ${Math.min(data[ri]![0]!, data[ri]![2]!)} = ${ans}.`],
    }
  }),
]

/* ============================== YEAR 5 ============================== */

const Y5: Template[] = [
  // ---- Equivalent fractions, shown visually ----
  T5('D-Y5-FR-02', 'MA-Y5-FR-02', (r, c, L) => {
    if (L === 1) {
      const k = int(r, 1, 9)
      return {
        text: `${c.actor} shades part of a strip split into 10 equal parts. How many hundredths are the same as the shaded part?`,
        answer: k * 10, params: { k, L }, diagram: { type: 'parts', of: 10, shaded: k },
        mistakes: M(k * 10, [[k, `${k} is the number of tenths shaded. Each tenth is the same as 10 hundredths.`], [k * 100, 'Each tenth is 10 hundredths, not 100.']]),
        hints: ['Count how many tenths are shaded.', 'One tenth is the same as 10 hundredths.', `${k} tenths = ${k} × 10 = ${k * 10} hundredths.`],
      }
    }
    if (L === 2) {
      const k = int(r, 1, 9)
      return {
        text: `${c.actor} shades part of a hundred square. How many tenths are the same as the shaded part?`,
        answer: k, params: { k, L }, diagram: { type: 'parts', of: 100, shaded: k * 10 },
        mistakes: M(k, [[k * 10, `${k * 10} is the number of hundredths. Each column of 10 hundredths is one tenth.`], [k + 1, 'Count the full columns again.']]),
        hints: ['Each column of 10 small squares is one tenth.', 'Count the shaded columns.', `${k * 10} hundredths = ${k} tenths.`],
      }
    }
    const n = int(r, 11, 99)
    if (n % 10 === 0) return null
    const ans = n / 100
    return {
      text: `${c.actor} shades part of a hundred square. Write the shaded part as a decimal.`,
      answer: ans, params: { n, L }, diagram: { type: 'parts', of: 100, shaded: n },
      mistakes: M(ans, [[n / 10, `That is ${n} tenths. Each small square is one hundredth.`], [n, 'Write it as a decimal: hundredths go in the second place after the decimal point.'], [n / 1000, 'That is thousandths. Each small square is one hundredth.']]),
      hints: ['Each small square is one hundredth: 0.01.', 'Count the full columns (tenths), then the extra squares (hundredths).', `${Math.floor(n / 10)} columns and ${n % 10} squares make ${n} hundredths, which is ${ans}.`],
    }
  }),

  // ---- Perimeter of composite rectilinear shapes ----
  T5('D-Y5-ME-03', 'MA-Y5-ME-03', (r, c, L) => {
    const W = int(r, 5, 9)
    const H = int(r, 4, 7)
    const cw = int(r, 2, W - 2)
    const ch = int(r, 2, H - 2)
    // L-shape with the top-right corner cut out
    const pts: Pt[] = [[0, 0], [W, 0], [W, H - ch], [W - cw, H - ch], [W - cw, H], [0, H]]
    const lens = [W, H - ch, cw, ch, W - cw, H]
    const per = 2 * (W + H)
    const unit = pick(r, ['cm', 'm'])
    const shown = L === 1 ? [0, 1, 2, 3, 4, 5] : L === 2 ? [0, 1, 2, 4, 5] : [0, 1, 4, 5]
    const sides = lens.map((v, i) => (shown.includes(i) ? `${v} ${unit}` : ''))
    const area = W * H - cw * ch
    const known = shown.reduce((s, i) => s + lens[i]!, 0)
    return {
      text: L === 1
        ? `${c.actor} measures the edge of an L-shaped ${pick(r, ['stage', 'room', 'garden', 'mat'])}. What is its perimeter, in ${unit}?`
        : `${c.actor} measures the edge of an L-shaped ${pick(r, ['stage', 'room', 'garden', 'mat'])}. Some lengths are missing. What is the perimeter, in ${unit}?`,
      answer: per, params: { W, H, cw, ch, L, unit },
      diagram: { type: 'grid', x: [-1, W + 1], y: [-1, H + 1], plain: true, shapes: [{ pts, sides }] },
      mistakes: M(per, [
        [area, `${area} is the area. Perimeter is the distance all the way round the edge.`],
        [known, 'You added only the lengths that are shown. Work out the missing sides too.'],
        [per - lens[3]!, 'You missed out one side. Count the sides: an L-shape has 6.'],
        [W + H, 'That is only halfway round. Keep going all the way back to the start.'],
      ]),
      hints: [
        'The perimeter is the total length of all 6 sides.',
        L === 1 ? 'Add all six lengths.' : 'Use the long sides to find missing ones: the top pieces add up to the bottom, and the right-hand pieces add up to the left.',
        `The sides are ${lens.join(', ')}. ${lens.join(' + ')} = ${per} ${unit}.`,
      ],
    }
  }),

  // ---- Estimate volume and capacity ----
  T5('D-Y5-ME-05a', 'MA-Y5-ME-05', (r, c, L) => {
    const max = L === 1 ? 500 : 1000
    const step = L === 1 ? 50 : L === 2 ? 100 : 50
    const labelEvery = L === 1 ? 100 : L === 2 ? 200 : 250
    const level = int(r, 1, max / step - 1) * step
    if (level === step || level === labelEvery) return null
    return {
      text: `${c.actor} pours water into a measuring jug for the ${c.crowd}. How many millilitres of water are in the jug?`,
      answer: level, params: { level, L }, diagram: { type: 'jug', max, step, level, unit: 'ml', labelEvery },
      mistakes: M(level, [
        [level + step, 'Read the mark at the very top of the water, not the one above it.'],
        [level - step, 'That is one mark below the water. Read the mark level with the top of the water.'],
        [(level / step) * 10, `Each small mark is ${step} ml, not 10 ml.`],
      ]),
      hints: [`The labelled marks go up in ${labelEvery} ml.`, `Count the small marks between labels: each one is ${step} ml.`, `The water reaches ${level} ml.`],
    }
  }),
  T5('D-Y5-ME-05b', 'MA-Y5-ME-05', (r, c, L) => {
    const l = int(r, 2, L === 1 ? 3 : 5)
    const w = int(r, 2, L === 1 ? 2 : 3)
    const h = int(r, L === 1 ? 1 : 2, L === 3 ? 4 : 3)
    const v = l * w * h
    return {
      text: `${c.actor} builds a cuboid out of 1 cm cubes. What is its volume, in cubic centimetres?`,
      answer: v, params: { l, w, h }, diagram: { type: 'cubes', l, w, h },
      mistakes: M(v, [
        [l * w, `${l * w} is one layer. There are ${h} layers.`],
        [l + w + h, 'Volume is length × width × height, not length + width + height.'],
        [l * w + w * h + l * h, 'That counts the faces you can see. Count all the cubes, including hidden ones.'],
      ]),
      hints: ['Volume counts every cube, even the hidden ones.', `Count the cubes in one layer (${l} × ${w}), then multiply by the number of layers.`, `${l} × ${w} × ${h} = ${v} cubic centimetres.`],
    }
  }),

  // ---- 3-D shapes from 2-D drawings ----
  T5('D-Y5-GPS-01a', 'MA-Y5-GPS-01', (r, c, L) => {
    const pool = L === 1 ? ['cube', 'cuboid', 'cylinder', 'cone', 'sphere', 'sqpyramid'] : L === 2 ? ['triprism', 'sqpyramid', 'cylinder', 'cuboid', 'cone', 'tetra'] : ['tetra', 'pentprism', 'hexprism', 'triprism', 'sqpyramid']
    const s = solidById(pick(r, pool))
    const near: Record<string, string[]> = {
      cube: ['cuboid', 'sqpyramid', 'triprism'], cuboid: ['cube', 'triprism', 'cylinder'], cylinder: ['cone', 'sphere', 'cuboid'], cone: ['cylinder', 'sqpyramid', 'sphere'], sphere: ['cylinder', 'cone', 'cube'],
      sqpyramid: ['tetra', 'triprism', 'cone'], triprism: ['tetra', 'cuboid', 'sqpyramid'], tetra: ['sqpyramid', 'triprism', 'cone'], pentprism: ['hexprism', 'triprism', 'cuboid'], hexprism: ['pentprism', 'cuboid', 'cylinder'],
    }
    const wrong: [string, string][] = near[s.id]!.map((id) => [solidById(id).name, `A ${solidById(id).name} looks different: count the faces and look at their shapes.`])
    const q = mc(r, s.name, wrong)
    return {
      text: `${c.actor} draws a 3-D shape. What is it called?`, ...q, params: { id: s.id },
      diagram: { type: 'gallery', items: [{ label: '', ...s.draw }] },
      hints: ['Look at the shape of the faces, and whether any are curved.', 'Dashed lines show edges you cannot see from the front.', `It is a ${s.name}.`],
    }
  }),
  T5('D-Y5-GPS-01b', 'MA-Y5-GPS-01', (r, c, L) => {
    const s = solidById(pick(r, L === 1 ? ['cube', 'cuboid', 'sqpyramid'] : L === 2 ? ['triprism', 'sqpyramid', 'tetra', 'cuboid'] : ['pentprism', 'hexprism', 'triprism', 'tetra']))
    const what = pick(r, ['faces', 'edges', 'vertices'] as const)
    const ans = s[what]
    return {
      text: `${c.actor} draws a ${s.name}. How many ${what} does it have?`,
      answer: ans, params: { id: s.id, what }, diagram: { type: 'gallery', items: [{ label: '', ...s.draw }] },
      mistakes: M(ans, [
        [what === 'faces' ? s.edges : s.faces, what === 'faces' ? 'Those are edges (where faces meet). Faces are the flat surfaces.' : 'Those are faces. Edges are where two faces meet.'],
        [what === 'vertices' ? s.faces : s.vertices, what === 'vertices' ? 'Vertices are corners, where edges meet.' : 'Those are vertices (corners).'],
        [ans - 1, 'Close: remember the hidden ones at the back (the dashed lines).'],
      ]),
      hints: [what === 'faces' ? 'Faces are the flat surfaces.' : what === 'edges' ? 'Edges are the lines where two faces meet.' : 'Vertices are the corners.', 'Count the ones you can see, then the hidden ones shown by dashed lines.', `A ${s.name} has ${ans} ${what}.`],
    }
  }),

  // ---- Estimate and compare acute, obtuse and reflex angles ----
  T5('D-Y5-GPS-02', 'MA-Y5-GPS-02', (r, c, L) => {
    const deg = L === 1 ? pick(r, [35, 50, 70, 90, 110, 140, 160, 200, 250, 300]) : L === 2 ? int(r, 2, 17) * 10 : int(r, 20, 34) * 10
    const turn = pick(r, [0, 20, 40, -30, 60])
    if (L === 1) {
      const right = deg < 90 ? 'acute' : deg === 90 ? 'right angle' : deg < 180 ? 'obtuse' : 'reflex'
      const all: [string, string][] = [
        ['acute', 'Acute angles are less than 90°.'],
        ['right angle', 'A right angle is exactly 90°, like the corner of a square.'],
        ['obtuse', 'Obtuse angles are between 90° and 180°.'],
        ['reflex', 'Reflex angles are more than 180°: bigger than a straight line.'],
      ]
      const q = mc(r, right, all.filter((a) => a[0] !== right))
      return {
        text: `${c.actor} measures this angle. What type of angle is it?`, ...q, params: { deg, turn },
        diagram: { type: 'angle', deg, turn },
        hints: ['Compare it with a right angle (90°) and a straight line (180°).', 'Less than 90° is acute. Between 90° and 180° is obtuse. More than 180° is reflex.', `It is ${right === 'right angle' ? 'a right angle' : `${right === 'acute' || right === 'obtuse' ? 'an' : 'a'} ${right} angle`}.`],
      }
    }
    const opts = [deg, deg + 60 > 350 ? deg - 90 : deg + 60, deg - 50 < 10 ? deg + 110 : deg - 50, 360 - deg === deg ? deg + 30 : 360 - deg].map((d) => Math.max(10, Math.min(350, d)))
    if (new Set(opts).size < 4) return null
    const q = mc(r, `${deg}°`, opts.slice(1).map((d) => [`${d}°`, d === 360 - deg ? `${d}° is the angle on the other side. The marked angle is the one with the arc.` : `${d}° is too ${d > deg ? 'big' : 'small'}. Compare with 90° and 180°.`]))
    return {
      text: `${c.actor} estimates the size of the marked angle. Which is the best estimate?`, ...q, params: { deg, turn, L },
      diagram: { type: 'angle', deg, turn },
      hints: ['Is it less than 90°, between 90° and 180°, or more than 180°?', 'Use 90° and 180° as guides, then decide how far past them it goes.', `The angle is about ${deg}°.`],
    }
  }),

  // ---- Measure angles with a protractor ----
  T5('D-Y5-GPS-03', 'MA-Y5-GPS-03', (r, c, L) => {
    const deg = L === 1 ? int(r, 2, 16) * 10 : L === 2 ? int(r, 3, 33) * 5 : int(r, 19, 35) * 5
    if (deg === 90 || deg % 10 === 0 && L > 1) return null
    return {
      text: `${c.actor} lines up a protractor on this angle. How many degrees is the angle?`,
      answer: deg, params: { deg }, diagram: { type: 'angle', deg, protractor: true },
      mistakes: M(deg, [
        [180 - deg, `${180 - deg}° is the reading on the other scale. Start from 0 on the arm along the bottom.`],
        [deg + 5, 'Look closely: each small mark is 5°.'],
        [deg - 5, 'Look closely: each small mark is 5°.'],
      ]),
      hints: ['One arm lies along 0. Follow the other arm out to the scale.', 'The bigger marks go up in 10s and each small mark is 5°. Count up from 0.', `The arm points to ${deg}°.`],
    }
  }),

  // ---- Regular and irregular polygons ----
  T5('D-Y5-GPS-06', 'MA-Y5-GPS-06', (r, c, L) => {
    if (L === 3) {
      const n = pick(r, [5, 6, 8])
      const side = int(r, 3, 12)
      const name = n === 5 ? 'pentagon' : n === 6 ? 'hexagon' : 'octagon'
      const ans = n * side
      return {
        text: `${c.actor} draws a regular ${name} with sides of ${side} cm. What is its perimeter, in centimetres?`,
        answer: ans, params: { n, side }, diagram: { type: 'gallery', items: [{ label: '', polys: [regular(n, n === 6 ? 30 : n === 8 ? 22.5 : 0)] }] },
        mistakes: M(ans, [[side * (n - 1), 'You missed a side. Count them all.'], [side * 4, `A ${name} has ${n} sides, not 4.`], [side + n, 'Multiply the side length by the number of sides.']]),
        hints: ['Regular means all the sides are the same length.', `A ${name} has ${n} sides. Multiply.`, `${n} × ${side} = ${ans} cm.`],
      }
    }
    const regs = ['square', 'equilateral', 'pentagon', 'hexagon', 'octagon']
    const irregs = ['rectangle', 'rhombus', 'kite', 'ipentagon', 'ihexagon', 'isosceles', 'lshape', 'ioctagon']
    const askReg = L === 1 || r() < 0.5
    const target = pick(r, askReg ? regs : irregs)
    const others = sample(r, askReg ? irregs : regs, 3)
    const shapes = shuffle(r, [target, ...others])
    const items: GalleryItem[] = shapes.map((id, i) => ({ label: LETTERS[i]!, polys: [drawFlat(flatById(id))] }))
    const answer = shapes.indexOf(target)
    const mistakes: Mistake[] = shapes
      .map((id, i) => ({ value: i, message: flatById(id).regular ? `Shape ${LETTERS[i]} has equal sides and equal angles, so it is regular.` : `Shape ${LETTERS[i]} does not have all sides and angles equal, so it is irregular.` }))
      .filter((m) => m.value !== answer)
    return {
      text: `${c.actor} sorts some polygons. Which one is ${askReg ? 'a regular' : 'an irregular'} polygon?`,
      choices: LETTERS.map((l) => `Shape ${l}`), answer, mistakes, params: { order: shapes.join(','), askReg: askReg ? 1 : 0 },
      diagram: { type: 'gallery', items },
      hints: ['A regular polygon has all its sides equal and all its angles equal.', 'Check the sides and the corners of each shape.', `Shape ${LETTERS[answer]} is ${askReg ? 'regular' : 'irregular'}.`],
    }
  }),

  // ---- Reflection and translation (tap) ----
  T5('D-Y5-GPD-01', 'MA-Y5-GPD-01', (r, c, L) => {
    if (L === 2) {
      const dx = pick(r, [-3, -2, 2, 3, 4])
      const dy = pick(r, [-3, -2, 2, 3])
      const p: Pt = [dx > 0 ? int(r, 1, 4) : int(r, 5, 8), dy > 0 ? int(r, 1, 4) : int(r, 4, 7)]
      const ans: Pt = [p[0] + dx, p[1] + dy]
      const say = `${pl(Math.abs(dx), 'square')} ${dx > 0 ? 'right' : 'left'} and ${pl(Math.abs(dy), 'square')} ${dy > 0 ? 'up' : 'down'}`
      return {
        text: `${c.actor} translates point P ${say}. Tap where P ends up.`,
        answer: encodePoint(...ans), pick: true, params: { px: p[0], py: p[1], dx, dy },
        diagram: { type: 'grid', x: [0, 10], y: [0, 8], axes: true, points: [{ x: p[0], y: p[1], label: 'P' }], pick: true },
        mistakes: pm(ans, [[p[0] - dx, p[1] + dy, 'Wrong way across: check left or right.'], [p[0] + dx, p[1] - dy, 'Wrong way up or down.'], [p[0] + dy, p[1] + dx, 'The moves are swapped.']]),
        hints: ['Translate means slide without turning.', `Count ${pl(Math.abs(dx), 'square')} ${dx > 0 ? 'right' : 'left'} first, then ${pl(Math.abs(dy), 'square')} ${dy > 0 ? 'up' : 'down'}.`, `P ${P(p)} moves to ${P(ans)}.`],
      }
    }
    const vertical = L === 1 || r() < 0.5
    const m = vertical ? int(r, 4, 6) : int(r, 3, 5)
    const tri: Pt[] = vertical ? [[m - int(r, 1, 2), 1], [m - 4, 2], [m - 2, int(r, 4, 6)]] : [[1, m + 1], [4, m + int(r, 1, 2)], [int(r, 2, 6), m + 3]]
    const p = tri[L === 1 ? 2 : 1]!
    const ans: Pt = vertical ? [2 * m - p[0], p[1]] : [p[0], 2 * m - p[1]]
    return {
      text: `${c.actor} reflects the triangle in the mirror line. Tap where the corner marked P lands.`,
      answer: encodePoint(...ans), pick: true, params: { m, t: tri.flat().join(','), vertical: vertical ? 1 : 0 },
      diagram: { type: 'grid', x: [0, 10], y: [0, 8], axes: true, mirror: vertical ? { x: m } : { y: m }, shapes: [{ pts: tri }], points: [{ x: p[0], y: p[1], label: 'P' }], pick: true },
      mistakes: pm(ans, [
        [p[0], p[1], 'That is P itself. Its reflection is on the other side of the line.'],
        vertical ? [2 * m - p[0] + 1, p[1], 'One square off. P and its reflection are the same distance from the mirror.'] : [p[0], 2 * m - p[1] - 1, 'One square off. P and its reflection are the same distance from the mirror.'],
        vertical ? [p[0], 2 * m - p[1], 'Reflect across the line that is drawn: this mirror goes up and down.'] : [2 * m - p[0], p[1], 'Reflect across the line that is drawn: this mirror goes across.'],
      ]),
      hints: ['The reflection is the same distance from the mirror line, on the other side.', `Count the squares from P to the mirror line (${pl(Math.abs((vertical ? p[0] : p[1]) - m), 'square')}).`, `Go the same distance on the other side: P lands at ${P(ans)}.`],
    }
  }),

  // ---- Line graphs ----
  T5('D-Y5-ST-01', 'MA-Y5-ST-01', (r, c, L) => {
    const step = L === 1 ? 2 : L === 2 ? 5 : 10
    const xs = ['8am', '9am', '10am', '11am', '12pm', '1pm']
    const ys = xs.map(() => int(r, 1, 9) * step + (L === 3 ? pick(r, [0, step / 2]) : 0))
    const a = int(r, 0, 3)
    const b = int(r, a + 1, 5)
    const ans = Math.abs(ys[b]! - ys[a]!)
    if (ans === 0) return null
    const what = pick(r, ['temperature in °C', 'number of people in the queue'])
    return {
      text: `The line graph shows the ${what} at ${c.place}. What is the difference between ${xs[a]} and ${xs[b]}?`,
      answer: ans, params: { ys: ys.join(','), a, b },
      diagram: { type: 'line', xs, ys, max: step * 10, step, title: what[0]!.toUpperCase() + what.slice(1) },
      mistakes: M(ans, [[ys[b]!, `${ys[b]} is the reading at ${xs[b]}. Find the difference between the two readings.`], [ys[a]! + ys[b]!, 'Difference means subtract, not add.'], [ans / step, `Each line on the scale is worth ${step}.`]]),
      hints: [`Read the graph at ${xs[a]} and at ${xs[b]}.`, `Each line on the scale is ${step}. Subtract the smaller reading from the larger.`, `${Math.max(ys[a]!, ys[b]!)} − ${Math.min(ys[a]!, ys[b]!)} = ${ans}.`],
    }
  }),
]

/* ============================== YEAR 6 ============================== */

const Y6: Template[] = [
  // ---- Similar shapes with a known scale factor ----
  T6('D-Y6-RP-03', 'MA-Y6-RP-03', (r, c, L) => {
    const w = int(r, 2, 6)
    const h = int(r, 2, 5)
    if (w === h) return null
    const k = L === 1 ? pick(r, [2, 3]) : L === 2 ? pick(r, [3, 4, 5]) : pick(r, [1.5, 2.5])
    const W = w * k
    const H = h * k
    if (L === 3 && (W % 1 || H % 1)) return null
    const askH = r() < 0.5
    const ans = askH ? H : W
    return {
      text: `${c.actor} enlarges rectangle A by a scale factor of ${k} to make rectangle B. What is the missing length, in centimetres?`,
      answer: ans, params: { w, h, k, askH: askH ? 1 : 0 },
      diagram: { type: 'rects', items: [{ w, h, label: 'A', top: `${w} cm`, side: `${h} cm` }, { w: W, h: H, label: 'B', top: askH ? `${W} cm` : '?', side: askH ? '?' : `${H} cm`, tone: 'b' }] },
      mistakes: M(ans, [
        [askH ? h + k : w + k, `A scale factor means multiply every length by ${k}, not add ${k}.`],
        [askH ? W : H, 'That is the other side. Find the side marked with a question mark.'],
        [askH ? h : w, 'That is the length on A. B is bigger.'],
      ]),
      hints: ['Every length in B is the matching length in A multiplied by the scale factor.', `The matching side on A is ${askH ? h : w} cm.`, `${askH ? h : w} × ${k} = ${ans} cm.`],
    }
  }),

  // ---- Same area, different perimeter ----
  T6('D-Y6-ME-04', 'MA-Y6-ME-04', (r, c, L) => {
    const area = pick(r, [12, 16, 18, 20, 24, 30, 36])
    const pairs: [number, number][] = []
    for (let a = 1; a <= area; a++) if (area % a === 0 && a <= area / a) pairs.push([area / a, a])
    if (pairs.length < 2) return null
    const [p1, p2] = sample(r, pairs, 2)
    const per = (p: [number, number]) => 2 * (p[0] + p[1])
    if (L === 1) {
      const ans = per(p2!)
      return {
        text: `${c.actor} draws two rectangles that both have an area of ${area} square centimetres. What is the perimeter of rectangle B, in centimetres?`,
        answer: ans, params: { area, a: p1!.join('x'), b: p2!.join('x'), L },
        diagram: { type: 'rects', items: [{ w: p1![0], h: p1![1], label: 'A', top: `${p1![0]} cm`, side: `${p1![1]} cm` }, { w: p2![0], h: p2![1], label: 'B', top: `${p2![0]} cm`, side: `${p2![1]} cm`, tone: 'b' }] },
        mistakes: M(ans, [[area, 'That is the area. Perimeter is the distance around the edge.'], [p2![0] + p2![1], 'That is only two sides. A rectangle has four.'], [per(p1!), 'That is the perimeter of A.']]),
        hints: ['Perimeter is the total of all four sides.', `B is ${p2![0]} cm by ${p2![1]} cm. Add all four sides.`, `${p2![0]} + ${p2![1]} + ${p2![0]} + ${p2![1]} = ${ans} cm.`],
      }
    }
    if (L === 2) {
      const ans = p2![1]
      return {
        text: `${c.actor} draws rectangles A and B. Both have an area of ${area} square centimetres. What is the missing side of B, in centimetres?`,
        answer: ans, params: { area, a: p1!.join('x'), b: p2!.join('x'), L },
        diagram: { type: 'rects', items: [{ w: p1![0], h: p1![1], label: 'A', top: `${p1![0]} cm`, side: `${p1![1]} cm` }, { w: p2![0], h: p2![1], label: 'B', top: `${p2![0]} cm`, side: '?', tone: 'b' }] },
        mistakes: M(ans, [[area - p2![0], 'Area means multiply the sides, so divide to find the missing one.'], [p1![1], 'That is a side of A. B has different sides.'], [area * p2![0], 'Divide the area by the known side.']]),
        hints: ['Area of a rectangle = length × width.', `${p2![0]} × ? = ${area}.`, `${area} ÷ ${p2![0]} = ${ans} cm.`],
      }
    }
    const ans = Math.abs(per(p1!) - per(p2!))
    if (ans === 0) return null
    return {
      text: `${c.actor} draws two rectangles with the same area. What is the difference between their perimeters, in centimetres?`,
      answer: ans, params: { area, a: p1!.join('x'), b: p2!.join('x'), L },
      diagram: { type: 'rects', items: [{ w: p1![0], h: p1![1], label: 'A', top: `${p1![0]} cm`, side: `${p1![1]} cm` }, { w: p2![0], h: p2![1], label: 'B', top: `${p2![0]} cm`, side: `${p2![1]} cm`, tone: 'b' }] },
      mistakes: M(ans, [[0, 'Same area does not mean same perimeter. Work out both.'], [Math.max(per(p1!), per(p2!)), 'That is one perimeter. Find both, then subtract.'], [Math.abs(p1![0] + p1![1] - p2![0] - p2![1]), 'Use all four sides of each rectangle.']]),
      hints: ['Work out the perimeter of each rectangle.', `A: 2 × (${p1![0]} + ${p1![1]}). B: 2 × (${p2![0]} + ${p2![1]}).`, `${per(p1!)} and ${per(p2!)}: the difference is ${ans} cm.`],
    }
  }),

  // ---- Draw 2-D shapes from given dimensions (tap) ----
  T6('D-Y6-GPS-01', 'MA-Y6-GPS-01', (r, c, L) => {
    const ax = int(r, 1, 3)
    const ay = int(r, 1, 2)
    const w = int(r, 3, 6)
    const h = int(r, 2, 5)
    const A: Pt = [ax, ay]
    const B: Pt = [ax + w, ay]
    let ans: Pt
    let text: string
    let hint2: string
    if (L === 1) {
      ans = [ax + w, ay + h]
      text = `${c.actor} is drawing a rectangle ${pl(w, 'square')} wide and ${pl(h, 'square')} tall. Two corners are A and B. Tap the corner above B.`
      hint2 = `From B, count ${pl(h, 'square')} straight up.`
    } else if (L === 2) {
      ans = [ax, ay + h]
      text = `${c.actor} is drawing a right-angled triangle. The right angle is at A, and the side going up from A is ${pl(h, 'square')} long. Tap the third corner.`
      hint2 = `The right angle is at A, so the third corner is straight above A, ${pl(h, 'square')} up.`
    } else {
      if (w % 2) return null
      ans = [ax + w / 2, ay + h]
      text = `${c.actor} is drawing an isosceles triangle with base AB and a height of ${pl(h, 'square')}. Tap the top corner.`
      hint2 = `The top of an isosceles triangle is above the middle of the base. The middle of AB is ${pl(w / 2, 'square')} from A.`
    }
    return {
      text, answer: encodePoint(...ans), pick: true, params: { ax, ay, w, h, L },
      diagram: { type: 'grid', x: [0, 10], y: [0, 8], points: [{ x: A[0], y: A[1], label: 'A' }, { x: B[0], y: B[1], label: 'B' }], shapes: [{ pts: [A, B], tone: 'ghost' }], pick: true },
      mistakes: pm(ans, [[ans[0], ans[1] - 1, 'One square short. Count the height again from the bottom.'], [ans[0], ans[1] + 1, 'One square too high.'], [L === 3 ? ax : ans[0] === ax ? ax + w : ax, ans[1], L === 3 ? 'An isosceles triangle has its top in the middle, above the centre of the base.' : 'Check which corner the side goes up from.']]),
      hints: ['Start from the corners you already have.', hint2, `The corner goes at ${P(ans)}.`],
    }
  }),

  // ---- 3-D shapes and nets ----
  T6('D-Y6-GPS-02', 'MA-Y6-GPS-02', (r, c, L) => {
    const net = pick(r, L === 1 ? NETS.filter((n) => ['cube1', 'cube2', 'sqpyramid', 'cylinder'].includes(n.id)) : NETS)
    const draw = { type: 'gallery' as const, items: [{ label: '', ...net.draw }] }
    if (L === 3) {
      const s = SOLIDS.find((x) => x.name === net.shape)!
      if (s.id === 'cylinder') return null
      return {
        text: `${c.actor} folds this net into a 3-D shape. How many vertices (corners) will the shape have?`,
        answer: s.vertices, params: { net: net.id, L }, diagram: draw,
        mistakes: M(s.vertices, [[s.faces, `${s.faces} is the number of faces (the flat pieces of the net).`], [s.edges, `${s.edges} is the number of edges.`], [net.draw.polys.reduce((t, p) => t + p.length, 0), 'Corners join up when the net is folded, so count them on the finished shape.']]),
        hints: ['First work out which shape the net makes.', `It folds into a ${s.name}. Count its corners.`, `A ${s.name} has ${s.vertices} vertices.`],
      }
    }
    const names = ['cube', 'triangular prism', 'square-based pyramid', 'triangular-based pyramid', 'cylinder', 'cuboid', 'cone']
    const wrong = sample(r, names.filter((n) => n !== net.shape && !(net.shape === 'cube' && n === 'cuboid')), 3).map((n) => [n, `Count the faces in the net and look at their shapes. A ${n} needs different faces.`] as [string, string])
    const q = mc(r, net.shape, wrong)
    return {
      text: `${c.actor} cuts out this net. Which 3-D shape does it fold into?`, ...q, params: { net: net.id, L, w: q.choices.join(',') }, diagram: draw,
      hints: ['Each flat piece of the net becomes one face.', 'Count the pieces and look at their shapes: squares, rectangles, triangles or circles?', `It folds into a ${net.shape}.`],
    }
  }),

  // ---- All four quadrants ----
  T6('D-Y6-GPD-01a', 'MA-Y6-GPD-01', (r, c, L) => {
    const x = int(r, -5, 5)
    const y = int(r, -5, 5)
    if (x === 0 || y === 0 || x === y || (L === 1 && x > 0 && y > 0) || (L >= 2 && !(x < 0 && y < 0) && r() < 0.4)) return null
    return {
      text: `${c.actor} hides some ${c.thing} at ${P([x, y])}. Tap that point.`,
      answer: encodePoint(x, y), pick: true, params: { x, y },
      diagram: { type: 'grid', x: [-6, 6], y: [-6, 6], axes: true, pick: true },
      mistakes: pm([x, y], [[-x, y, 'Check the sign of the first number: negative is to the left of 0.'], [x, -y, 'Check the sign of the second number: negative is below 0.'], [y, x, 'Across first, then up or down.']]),
      hints: ['Start at (0, 0) in the middle.', `${x < 0 ? `Go ${-x} left` : `Go ${x} right`}, then ${y < 0 ? `${-y} down` : `${y} up`}.`, `Tap ${P([x, y])}.`],
    }
  }),
  T6('D-Y6-GPD-01b', 'MA-Y6-GPD-01', (r, c, _L) => {
    const x = int(r, -5, 5)
    const y = int(r, -5, 5)
    if (x === 0 || y === 0 || x === y || x === -y || (x > 0 && y > 0)) return null
    const ask = pick(r, ['x', 'y'] as const)
    const ans = ask === 'x' ? x : y
    return {
      text: `${c.actor} marks point P. What is the ${ask}-coordinate of P?`,
      answer: ans, params: { x, y, ask },
      diagram: { type: 'grid', x: [-6, 6], y: [-6, 6], axes: true, points: [{ x, y, label: 'P' }] },
      mistakes: M(ans, [[-ans, 'Check the sign: left of 0 or below 0 is negative.'], [ask === 'x' ? y : x, `That is the ${ask === 'x' ? 'y' : 'x'}-coordinate.`]], true),
      hints: [ask === 'x' ? 'The x-coordinate is how far across: left of 0 is negative.' : 'The y-coordinate is how far up or down: below 0 is negative.', ask === 'x' ? 'Read straight down or up from P to the x-axis.' : 'Read straight across from P to the y-axis.', `P is at ${P([x, y])}, so the ${ask}-coordinate is ${f(ans)}.`],
    }
  }),

  // ---- Translate and reflect on the coordinate plane (tap) ----
  T6('D-Y6-GPD-02', 'MA-Y6-GPD-02', (r, c, L) => {
    const p: Pt = [int(r, -5, 5), int(r, -5, 5)]
    if (p[0] === 0 || p[1] === 0) return null
    if (L === 3) {
      const dx = pick(r, [-6, -5, -4, 4, 5, 6])
      const dy = pick(r, [-5, -4, -3, 3, 4, 5])
      const ans: Pt = [p[0] + dx, p[1] + dy]
      if (Math.abs(ans[0]) > 6 || Math.abs(ans[1]) > 6 || Math.sign(ans[0]) === Math.sign(p[0])) return null
      return {
        text: `${c.actor} translates P ${pl(Math.abs(dx), 'unit')} ${dx > 0 ? 'right' : 'left'} and ${pl(Math.abs(dy), 'unit')} ${dy > 0 ? 'up' : 'down'}. Tap where P ends up.`,
        answer: encodePoint(...ans), pick: true, params: { px: p[0], py: p[1], dx, dy },
        diagram: { type: 'grid', x: [-6, 6], y: [-6, 6], axes: true, points: [{ x: p[0], y: p[1], label: 'P' }], pick: true },
        mistakes: pm(ans, [[p[0] - dx, p[1] + dy, 'Wrong way across.'], [p[0] + dx, p[1] - dy, 'Wrong way up or down.'], [p[0] + dy, p[1] + dx, 'The moves are swapped.']]),
        hints: ['Add the move to each coordinate: right is +, left is −, up is +, down is −.', `New x: ${f(p[0])} + ${f(dx)}. New y: ${f(p[1])} + ${f(dy)}.`, `P moves to ${P(ans)}.`],
      }
    }
    const axis = L === 1 ? 'y' : pick(r, ['x', 'y'] as const)
    const ans: Pt = axis === 'y' ? [-p[0], p[1]] : [p[0], -p[1]]
    return {
      text: `${c.actor} reflects point P in the ${axis}-axis. Tap where its reflection goes.`,
      answer: encodePoint(...ans), pick: true, params: { px: p[0], py: p[1], axis },
      diagram: { type: 'grid', x: [-6, 6], y: [-6, 6], axes: true, mirror: axis === 'y' ? { x: 0 } : { y: 0 }, points: [{ x: p[0], y: p[1], label: 'P' }], pick: true },
      mistakes: pm(ans, [[axis === 'y' ? p[0] : -p[0], axis === 'y' ? -p[1] : p[1], `That reflects in the ${axis === 'y' ? 'x' : 'y'}-axis. The mirror here is the ${axis}-axis.`], [-p[0], -p[1], 'Only one coordinate changes sign in a reflection in an axis.'], [p[0], p[1], 'That is P itself.']]),
      hints: [`The ${axis}-axis is the mirror line.`, `Reflecting in the ${axis}-axis changes the sign of the ${axis === 'y' ? 'x' : 'y'}-coordinate only.`, `P ${P(p)} reflects to ${P(ans)}.`],
    }
  }),

  // ---- Pie charts and line graphs ----
  T6('D-Y6-ST-01a', 'MA-Y6-ST-01', (r, c, L) => {
    const total = pick(r, L === 1 ? [20, 40, 60, 80, 100] : L === 2 ? [24, 48, 72, 96, 120] : [30, 60, 90, 180, 360])
    const sets: Record<number, number[][]> = {
      1: [[1 / 2, 1 / 4, 1 / 4], [1 / 2, 1 / 2]],
      2: [[1 / 2, 1 / 4, 1 / 8, 1 / 8], [1 / 4, 1 / 4, 1 / 4, 1 / 8, 1 / 8]],
      3: [[1 / 3, 1 / 3, 1 / 6, 1 / 6], [1 / 2, 1 / 6, 1 / 3]],
    }
    const fr = pick(r, sets[L]!)
    const labels = sample(r, [c.thing, c.thing2, 'music', 'books', 'games', 'art'].filter((v, i, a) => a.indexOf(v) === i), fr.length)
    const i = int(r, 0, fr.length - 1)
    const ans = fr[i]! * total
    if (ans % 1) return null
    const fName = (x: number) => (x === 1 / 2 ? 'half' : x === 1 / 4 ? 'a quarter' : x === 1 / 8 ? 'an eighth' : x === 1 / 3 ? 'a third' : 'a sixth')
    const name = (s: string) => `${s[0]!.toUpperCase()}${s.slice(1)}`
    return {
      text: `${total} ${c.crowd} chose their favourite thing. The pie chart shows the results. How many chose ${labels[i]}?`,
      answer: ans, params: { total, fr: fr.join(','), i },
      diagram: { type: 'pie', slices: fr.map((x, k) => ({ label: name(labels[k]!), value: x })) },
      mistakes: M(ans, [[fr[i]! * 100, 'That is a percentage. Find that fraction of the total number of people.'], [total, 'That is everyone. Find the size of that slice as a fraction.'], [Math.round(total / fr.length), 'The slices are not all the same size.']]),
      hints: [`What fraction of the circle is the ${labels[i]} slice?`, `It is ${fName(fr[i]!)} of the circle. Find ${fName(fr[i]!)} of ${total}.`, `${fName(fr[i]!)} of ${total} is ${ans}.`],
    }
  }),
  T6('D-Y6-ST-01b', 'MA-Y6-ST-01', (r, c, L) => {
    // conversion graph: miles to kilometres (5 miles = 8 km)
    const xs = ['0', '10', '20', '30', '40', '50']
    const ys = [0, 16, 32, 48, 64, 80]
    if (L === 3) {
      const k = int(r, 1, 4)
      const miles = k * 10 + 5
      const ans = (miles / 5) * 8
      return {
        text: `${c.actor} uses this conversion graph. About how many kilometres is ${miles} miles?`,
        answer: ans, params: { miles }, diagram: { type: 'line', xs, ys, max: 80, step: 8, unit: 'km', xTitle: 'miles' },
        mistakes: M(ans, [[miles, 'That is the number of miles. Read the kilometres off the graph.'], [ys[k]!, `That is ${k * 10} miles. ${miles} miles is halfway to the next mark.`], [ys[k + 1]!, `That is ${(k + 1) * 10} miles.`]]),
        hints: [`${miles} miles is halfway between ${k * 10} and ${(k + 1) * 10} on the bottom scale.`, `Halfway between ${ys[k]} km and ${ys[k + 1]} km.`, `${miles} miles is ${ans} km.`],
      }
    }
    const k = int(r, 1, 5)
    const toKm = L === 1 || r() < 0.5
    const ans = toKm ? ys[k]! : k * 10
    return {
      text: toKm ? `${c.actor} uses this conversion graph. How many kilometres is ${k * 10} miles?` : `${c.actor} uses this conversion graph. How many miles is ${ys[k]} km?`,
      answer: ans, params: { k, toKm: toKm ? 1 : 0, L }, diagram: { type: 'line', xs, ys, max: 80, step: 8, unit: 'km', xTitle: 'miles' },
      mistakes: M(ans, [[toKm ? k * 10 : ys[k]!, toKm ? 'That is the miles. Read across to the kilometre scale.' : 'That is the kilometres. Read down to the miles scale.'], [toKm ? ys[k - 1]! : (k - 1) * 10, 'Check you are reading the right mark.']]),
      hints: [toKm ? `Find ${k * 10} miles along the bottom.` : `Find ${ys[k]} km on the side scale.`, toKm ? 'Go up to the line, then across to the kilometres.' : 'Go across to the line, then down to the miles.', toKm ? `${k * 10} miles is ${ys[k]} km.` : `${ys[k]} km is ${k * 10} miles.`],
    }
  }),
]

export const DIAGRAM_TEMPLATES: Template[] = [...Y4, ...Y5, ...Y6]
