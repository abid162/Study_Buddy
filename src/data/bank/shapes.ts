/** Shape drawings for diagram questions, in a 0–100 box with y pointing up. */
import type { GalleryItem, Pt } from './diagram'

const R2 = (n: number) => Math.round(n * 10) / 10

/** Scale and centre points to fit the 6–94 box, keeping proportions. */
export function fit(pts: Pt[]): Pt[] {
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const k = 88 / Math.max(x1 - x0, y1 - y0)
  const ox = (100 - (x1 - x0) * k) / 2
  const oy = (100 - (y1 - y0) * k) / 2
  return pts.map(([x, y]) => [R2(ox + (x - x0) * k), R2(oy + (y - y0) * k)])
}

export function rotate(pts: Pt[], deg: number): Pt[] {
  const r = (deg * Math.PI) / 180
  return pts.map(([x, y]) => [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)])
}

export const regular = (n: number, turn = 0): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const a = ((90 + turn + (360 / n) * i) * Math.PI) / 180
    return [R2(50 + 44 * Math.cos(a)), R2(50 + 44 * Math.sin(a))] as Pt
  })

/** Flat shapes with the facts the questions ask about. */
export interface Flat {
  id: string
  name: string
  pts: Pt[]
  sides: number
  /** lines of symmetry */
  sym: number
  /** pairs of parallel sides */
  par: number
  right: number
  /** all sides equal */
  equalSides: boolean
  /** all sides and angles equal */
  regular: boolean
}

const flat = (id: string, name: string, pts: Pt[], o: Omit<Flat, 'id' | 'name' | 'pts' | 'sides'>): Flat => ({ id, name, pts, sides: pts.length, ...o })

export const FLATS: Flat[] = [
  flat('square', 'square', [[0, 0], [10, 0], [10, 10], [0, 10]], { sym: 4, par: 2, right: 4, equalSides: true, regular: true }),
  flat('rectangle', 'rectangle', [[0, 0], [16, 0], [16, 8], [0, 8]], { sym: 2, par: 2, right: 4, equalSides: false, regular: false }),
  flat('rhombus', 'rhombus', [[0, 0], [10, 0], [16, 8], [6, 8]], { sym: 2, par: 2, right: 0, equalSides: true, regular: false }),
  flat('parallelogram', 'parallelogram', [[0, 0], [12, 0], [17, 7], [5, 7]], { sym: 0, par: 2, right: 0, equalSides: false, regular: false }),
  flat('trapezium', 'trapezium', [[0, 0], [16, 0], [12, 8], [4, 8]], { sym: 1, par: 1, right: 0, equalSides: false, regular: false }),
  flat('kite', 'kite', [[6, 0], [12, 9], [6, 14], [0, 9]], { sym: 1, par: 0, right: 0, equalSides: false, regular: false }),
  flat('equilateral', 'equilateral triangle', [[0, 0], [10, 0], [5, 8.66]], { sym: 3, par: 0, right: 0, equalSides: true, regular: true }),
  flat('isosceles', 'isosceles triangle', [[0, 0], [8, 0], [4, 12]], { sym: 1, par: 0, right: 0, equalSides: false, regular: false }),
  flat('scalene', 'scalene triangle', [[0, 0], [14, 0], [4, 7]], { sym: 0, par: 0, right: 0, equalSides: false, regular: false }),
  flat('right', 'right-angled triangle', [[0, 0], [12, 0], [0, 7]], { sym: 0, par: 0, right: 1, equalSides: false, regular: false }),
  flat('pentagon', 'regular pentagon', regular(5), { sym: 5, par: 0, right: 0, equalSides: true, regular: true }),
  flat('hexagon', 'regular hexagon', regular(6, 30), { sym: 6, par: 3, right: 0, equalSides: true, regular: true }),
  flat('octagon', 'regular octagon', regular(8, 22.5), { sym: 8, par: 4, right: 0, equalSides: true, regular: true }),
  flat('ipentagon', 'irregular pentagon', [[0, 0], [12, 0], [14, 7], [6, 12], [-2, 6]], { sym: 0, par: 0, right: 0, equalSides: false, regular: false }),
  flat('ihexagon', 'irregular hexagon', [[0, 0], [10, 0], [14, 5], [10, 11], [2, 12], [-3, 6]], { sym: 0, par: 0, right: 0, equalSides: false, regular: false }),
  flat('lshape', 'L-shaped hexagon', [[0, 0], [12, 0], [12, 5], [5, 5], [5, 12], [0, 12]], { sym: 1, par: 0, right: 5, equalSides: false, regular: false }),
  flat('iquad', 'irregular quadrilateral', [[0, 0], [13, 2], [10, 10], [2, 7]], { sym: 0, par: 0, right: 0, equalSides: false, regular: false }),
  flat('ioctagon', 'irregular octagon', [[0, 0], [16, 0], [16, 4], [13, 10], [6, 12], [2, 12], [-1, 8], [1, 4]], { sym: 0, par: 0, right: 0, equalSides: false, regular: false }),
]
export const flatById = (id: string) => FLATS.find((s) => s.id === id)!
export const drawFlat = (s: Flat, turn = 0): Pt[] => fit(rotate(s.pts, turn))

/* ---------------- 3-D shapes ---------------- */
const ellipse = (cx: number, cy: number, rx: number, ry: number, from: number, to: number, n = 18): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = ((from + ((to - from) * i) / n) * Math.PI) / 180
    return [R2(cx + rx * Math.cos(a)), R2(cy + ry * Math.sin(a))] as Pt
  })

export interface Solid {
  id: string
  name: string
  faces: number
  edges: number
  vertices: number
  draw: Pick<GalleryItem, 'polys' | 'dashed'>
}

function prism(n: number): Pick<GalleryItem, 'polys' | 'dashed'> {
  const front = Array.from({ length: n }, (_, i) => {
    const a = ((90 + (n === 4 ? 45 : 0) + (360 / n) * i) * Math.PI) / 180
    return [R2(32 + 26 * Math.cos(a)), R2(36 + 26 * Math.sin(a))] as Pt
  })
  const back = front.map(([x, y]) => [x + 34, y + 28] as Pt)
  // visible side faces: those whose edge faces up or right
  const polys: Pt[][] = []
  for (let i = 0; i < n; i++) {
    const a = front[i]!
    const b = front[(i + 1) % n]!
    const nx = b[1] - a[1]
    const ny = -(b[0] - a[0])
    // outward normal (polygon is anticlockwise) pointing up/right is visible from the front-right
    if (nx * 34 + ny * 28 > 0) polys.push([a, b, back[(i + 1) % n]!, back[i]!])
  }
  polys.push(front)
  return { polys }
}

export const SOLIDS: Solid[] = [
  {
    id: 'cube', name: 'cube', faces: 6, edges: 12, vertices: 8,
    draw: { polys: [[[10, 8], [62, 8], [62, 60], [10, 60]], [[10, 60], [62, 60], [90, 88], [38, 88]], [[62, 8], [90, 36], [90, 88], [62, 60]]], dashed: [[[10, 8], [38, 36], [90, 36]], [[38, 36], [38, 88]]] },
  },
  {
    id: 'cuboid', name: 'cuboid', faces: 6, edges: 12, vertices: 8,
    draw: { polys: [[[4, 14], [72, 14], [72, 52], [4, 52]], [[4, 52], [72, 52], [96, 76], [28, 76]], [[72, 14], [96, 38], [96, 76], [72, 52]]], dashed: [[[4, 14], [28, 38], [96, 38]], [[28, 38], [28, 76]]] },
  },
  {
    id: 'triprism', name: 'triangular prism', faces: 5, edges: 9, vertices: 6,
    draw: { polys: [[[4, 12], [40, 12], [22, 48]], [[40, 12], [94, 40], [76, 76], [22, 48]]], dashed: [[[4, 12], [58, 40], [94, 40]], [[58, 40], [76, 76]]] },
  },
  {
    id: 'sqpyramid', name: 'square-based pyramid', faces: 5, edges: 8, vertices: 5,
    draw: { polys: [[[8, 12], [68, 12], [50, 94]], [[68, 12], [92, 38], [50, 94]]], dashed: [[[8, 12], [32, 38], [92, 38]], [[32, 38], [50, 94]]] },
  },
  {
    id: 'tetra', name: 'triangular-based pyramid', faces: 4, edges: 6, vertices: 4,
    draw: { polys: [[[6, 14], [76, 8], [44, 92]], [[76, 8], [94, 40], [44, 92]]], dashed: [[[6, 14], [94, 40]]] },
  },
  {
    id: 'pentprism', name: 'pentagonal prism', faces: 7, edges: 15, vertices: 10,
    draw: prism(5),
  },
  {
    id: 'hexprism', name: 'hexagonal prism', faces: 8, edges: 18, vertices: 12,
    draw: prism(6),
  },
  {
    id: 'cylinder', name: 'cylinder', faces: 3, edges: 2, vertices: 0,
    draw: {
      polys: [ellipse(50, 82, 34, 10, 0, 360, 32), [...ellipse(50, 16, 34, 10, 180, 360), [84, 82], [16, 82]]],
      dashed: [ellipse(50, 16, 34, 10, 0, 180)],
    },
  },
  {
    id: 'cone', name: 'cone', faces: 2, edges: 1, vertices: 1,
    draw: { polys: [[...ellipse(50, 16, 38, 10, 180, 360), [50, 94]]], dashed: [ellipse(50, 16, 38, 10, 0, 180)] },
  },
  {
    id: 'sphere', name: 'sphere', faces: 1, edges: 0, vertices: 0,
    draw: { polys: [ellipse(50, 50, 44, 44, 0, 360, 40)], dashed: [ellipse(50, 50, 44, 12, 0, 180)] },
  },
]
export const solidById = (id: string) => SOLIDS.find((s) => s.id === id)!

/* ---------------- nets ---------------- */
const sq = (x: number, y: number, s: number): Pt[] => [[x, y], [x + s, y], [x + s, y + s], [x, y + s]]
const rect = (x: number, y: number, w: number, h: number): Pt[] => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]

export const NETS: { id: string; shape: string; draw: Pick<GalleryItem, 'polys'> }[] = [
  { id: 'cube1', shape: 'cube', draw: { polys: [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]].map(([x, y]) => sq(4 + x! * 23, 16 + y! * 23, 23)) } },
  { id: 'cube2', shape: 'cube', draw: { polys: [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2]].map(([x, y]) => sq(4 + x! * 23, 16 + y! * 23, 23)) } },
  { id: 'cube3', shape: 'cube', draw: { polys: [[2, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]].map(([x, y]) => sq(4 + x! * 23, 16 + y! * 23, 23)) } },
  {
    id: 'triprism', shape: 'triangular prism',
    draw: { polys: [rect(26, 4, 48, 28), rect(26, 32, 48, 28), rect(26, 60, 48, 28), [[26, 32], [26, 60], [2, 46]], [[74, 32], [74, 60], [98, 46]]] },
  },
  {
    id: 'sqpyramid', shape: 'square-based pyramid',
    draw: { polys: [sq(32, 32, 36), [[32, 68], [68, 68], [50, 98]], [[32, 32], [68, 32], [50, 2]], [[32, 32], [32, 68], [2, 50]], [[68, 32], [68, 68], [98, 50]]] },
  },
  {
    id: 'tetra', shape: 'triangular-based pyramid',
    draw: { polys: [[[4, 10], [50, 10], [27, 50]], [[50, 10], [96, 10], [73, 50]], [[27, 50], [73, 50], [50, 90]], [[50, 10], [73, 50], [27, 50]]] },
  },
  {
    id: 'cylinder', shape: 'cylinder',
    draw: { polys: [rect(10, 32, 80, 36), ellipse(50, 84, 14, 14, 0, 360, 24), ellipse(50, 16, 14, 14, 0, 360, 24)] },
  },
]
