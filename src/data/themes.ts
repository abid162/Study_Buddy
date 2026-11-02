import type { ThemeId } from './questions'

export type BrickColor = 'red' | 'yellow' | 'blue' | 'green' | 'white' | 'ink'

/** One brick: x position and width in stud units, on an 8-stud grid. */
export interface Brick {
  x: number
  w: number
  c: BrickColor
}

export interface Theme {
  id: ThemeId
  label: string
  blurb: string
  build: string
  /** Six rows, bottom to top. Each correct answer adds one row. */
  model: Brick[][]
}

export const THEMES: Theme[] = [
  {
    id: 'football',
    label: 'Football',
    blurb: 'Goals, stickers, match days',
    build: 'Stadium',
    model: [
      [{ x: 0, w: 8, c: 'green' }],
      [{ x: 0, w: 2, c: 'blue' }, { x: 3, w: 2, c: 'white' }, { x: 6, w: 2, c: 'blue' }],
      [{ x: 0, w: 2, c: 'blue' }, { x: 6, w: 2, c: 'blue' }],
      [{ x: 0, w: 2, c: 'red' }, { x: 6, w: 2, c: 'red' }],
      [{ x: 0.5, w: 1, c: 'ink' }, { x: 6.5, w: 1, c: 'ink' }],
      [{ x: 0, w: 2, c: 'yellow' }, { x: 6, w: 2, c: 'yellow' }],
    ],
  },
  {
    id: 'wrestling',
    label: 'Wrestling',
    blurb: 'Big entrances, title belts',
    build: 'Arena ring',
    model: [
      [{ x: 0, w: 8, c: 'ink' }],
      [{ x: 0, w: 1, c: 'red' }, { x: 1, w: 6, c: 'white' }, { x: 7, w: 1, c: 'red' }],
      [{ x: 0, w: 1, c: 'red' }, { x: 7, w: 1, c: 'red' }],
      [{ x: 0, w: 1, c: 'red' }, { x: 1, w: 6, c: 'blue' }, { x: 7, w: 1, c: 'red' }],
      [{ x: 0, w: 1, c: 'red' }, { x: 7, w: 1, c: 'red' }],
      [{ x: 2.5, w: 3, c: 'yellow' }],
    ],
  },
  {
    id: 'kpop',
    label: 'K-pop',
    blurb: 'Dance routines, concerts',
    build: 'Concert stage',
    model: [
      [{ x: 0, w: 8, c: 'ink' }],
      [{ x: 0, w: 1, c: 'blue' }, { x: 3, w: 2, c: 'red' }, { x: 7, w: 1, c: 'blue' }],
      [{ x: 0, w: 1, c: 'blue' }, { x: 3, w: 2, c: 'yellow' }, { x: 7, w: 1, c: 'blue' }],
      [{ x: 0, w: 1, c: 'blue' }, { x: 7, w: 1, c: 'blue' }],
      [{ x: 0, w: 8, c: 'red' }],
      [{ x: 1, w: 1, c: 'yellow' }, { x: 3.5, w: 1, c: 'yellow' }, { x: 6, w: 1, c: 'yellow' }],
    ],
  },
  {
    id: 'building',
    label: 'Building',
    blurb: 'Bricks, towers, big builds',
    build: 'Castle tower',
    model: [
      [{ x: 1, w: 6, c: 'blue' }],
      [{ x: 1, w: 2, c: 'blue' }, { x: 3, w: 2, c: 'ink' }, { x: 5, w: 2, c: 'blue' }],
      [{ x: 1, w: 6, c: 'blue' }],
      [{ x: 1, w: 6, c: 'yellow' }],
      [{ x: 1, w: 1, c: 'red' }, { x: 3.5, w: 1, c: 'red' }, { x: 6, w: 1, c: 'red' }],
      [{ x: 3.5, w: 1, c: 'green' }],
    ],
  },
  {
    id: 'music',
    label: 'Music',
    blurb: 'Songs, bands, playlists',
    build: 'Electric guitar',
    model: [
      [{ x: 2, w: 4, c: 'red' }],
      [{ x: 1, w: 6, c: 'red' }],
      [{ x: 2, w: 1, c: 'red' }, { x: 3, w: 2, c: 'ink' }, { x: 5, w: 1, c: 'red' }],
      [{ x: 3.5, w: 1, c: 'ink' }],
      [{ x: 3.5, w: 1, c: 'ink' }],
      [{ x: 3, w: 2, c: 'yellow' }],
    ],
  },
  {
    id: 'space',
    label: 'Space',
    blurb: 'Rockets, planets, astronauts',
    build: 'Rocket',
    model: [
      [{ x: 1, w: 2, c: 'red' }, { x: 3, w: 2, c: 'white' }, { x: 5, w: 2, c: 'red' }],
      [{ x: 2.5, w: 3, c: 'white' }],
      [{ x: 2.5, w: 1, c: 'white' }, { x: 3.5, w: 1, c: 'blue' }, { x: 4.5, w: 1, c: 'white' }],
      [{ x: 2.5, w: 3, c: 'white' }],
      [{ x: 3, w: 2, c: 'red' }],
      [{ x: 3.5, w: 1, c: 'red' }],
    ],
  },
]

export const themeById = (id: ThemeId) => THEMES.find((t) => t.id === id)!
