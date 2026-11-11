/**
 * Diagrams for maths questions that need a picture (shapes, angles, grids, charts, clocks…).
 * A diagram is plain data, drawn by src/components/Diagram.tsx. Numbers in a diagram are the same in every world;
 * only labels (names, things) may change with the world.
 */

export type Pt = [number, number]

export interface GridShape {
  pts: Pt[]
  /** 'a' main colour, 'b' second colour, 'ghost' dashed outline (e.g. the image after a move) */
  tone?: 'a' | 'b' | 'ghost'
  label?: string
  /** label each side, in order (pts[0]→pts[1], …); '' for none */
  sides?: string[]
}

export interface GridPoint {
  x: number
  y: number
  label?: string
  tone?: 'a' | 'b'
}

export type Diagram =
  /** analogue clock */
  | { type: 'clock'; h: number; m: number }
  /** square grid; with axes it is a coordinate grid. `pick`: the child taps a grid point to answer */
  | {
      type: 'grid'
      x: [number, number]
      y: [number, number]
      axes?: boolean
      points?: GridPoint[]
      shapes?: GridShape[]
      /** shaded unit squares, by bottom-left corner */
      cells?: Pt[]
      mirror?: { x?: number; y?: number }
      /** arrow from one point to another (e.g. a translation) */
      arrow?: [Pt, Pt]
      pick?: boolean
      /** hide the grid lines (shapes drawn on plain paper) */
      plain?: boolean
    }
  /** a row of labelled pictures, each made of polygons in a 0–100 box */
  | { type: 'gallery'; items: GalleryItem[] }
  /** one angle, optionally with a protractor laid on it */
  | { type: 'angle'; deg: number; protractor?: boolean; turn?: number }
  /** bar chart */
  | { type: 'bar'; labels: string[]; values: number[]; max: number; step: number; unit?: string; title?: string }
  /** pictogram: each icon is worth `per`; halves allowed */
  | { type: 'picto'; labels: string[]; values: number[]; per: number; icon: string; title?: string }
  /** table */
  | { type: 'table'; head: string[]; rows: (string | number)[][] }
  /** line graph */
  | { type: 'line'; xs: string[]; ys: number[]; max: number; step: number; min?: number; unit?: string; title?: string; xTitle?: string }
  /** pie chart */
  | { type: 'pie'; slices: { label: string; value: number }[]; title?: string }
  /** strip of tenths, or a 10×10 grid of hundredths, with some shaded */
  | { type: 'parts'; of: 10 | 100; shaded: number }
  /** number line with an arrow */
  | { type: 'numberline'; from: number; to: number; ticks: number; at: number; labelEvery?: number }
  /** measuring jug */
  | { type: 'jug'; max: number; step: number; level: number; unit: string; labelEvery: number }
  /** cuboid built from unit cubes */
  | { type: 'cubes'; l: number; w: number; h: number }
  /** rectangles side by side, drawn to scale, with side labels */
  | { type: 'rects'; items: { w: number; h: number; label: string; top?: string; side?: string; tone?: 'a' | 'b' }[] }

export interface GalleryItem {
  label: string
  polys: Pt[][]
  /** dashed lines (hidden edges, fold lines) */
  dashed?: Pt[][]
  /** solid open lines (e.g. the arms of an angle) */
  lines?: Pt[][]
}

/** Tap-the-grid answers are stored as one number so the bank's checker and verifier work unchanged. */
export const encodePoint = (x: number, y: number) => (x + 500) * 1000 + (y + 500)
export const decodePoint = (n: number): Pt => [Math.floor(n / 1000) - 500, (n % 1000) - 500]
export const fmtPoint = (n: number) => {
  const [x, y] = decodePoint(n)
  return `(${x}, ${y})`
}
