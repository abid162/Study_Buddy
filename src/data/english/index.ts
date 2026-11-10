import type { EnItem, EnStatement } from './types'
import { enCtx } from './skins'
import { Y4_ENGLISH } from './items.y4'
import { Y5_ENGLISH } from './items.y5'
import { Y6_ENGLISH } from './items.y6'
import { readingStatements } from './reading'

const ORDER = ['Spelling', 'Grammar', 'Punctuation', 'Reading', 'Writing'] as const
const sortByDomain = (xs: EnStatement[]) => [...xs].sort((a, b) => ORDER.indexOf(a.domain) - ORDER.indexOf(b.domain))

export const ENGLISH_BY_YEAR: Record<4 | 5 | 6, EnStatement[]> = {
  4: sortByDomain([...Y4_ENGLISH, ...readingStatements(4)]),
  5: sortByDomain([...Y5_ENGLISH, ...readingStatements(5)]),
  6: sortByDomain([...Y6_ENGLISH, ...readingStatements(6)]),
}
export const ALL_ENGLISH: EnStatement[] = [...ENGLISH_BY_YEAR[4], ...ENGLISH_BY_YEAR[5], ...ENGLISH_BY_YEAR[6]]

/** Render one item of a statement for a world. Same statement, index and world = same item every time. */
export function renderEn(st: EnStatement, k: number, world: string): EnItem {
  const [level, gen] = st.items[k]!
  const coreId = `${st.id}.i${k}`
  const { c, r } = enCtx(world, coreId)
  const d = gen(c, r)
  return { ...d, id: `${coreId}@${world}`, coreId, curriculumId: st.id, year: st.year, level, world, hints: st.hints }
}

export type { EnItem, EnStatement } from './types'
export { EN_WORLDS } from './skins'
