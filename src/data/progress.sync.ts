import { supabase } from './supabase'

/**
 * Offline-safe writes to Supabase. Every change is queued in localStorage first and then sent;
 * anything that fails stays queued and is retried when the connection returns or the app reopens.
 * One queue per parent account, so two parents sharing a device never mix.
 */

export interface ProgressRow {
  child_id: string
  world: string
  quest_id: string
  answered: number
  first_try: number
  helped: number
  total: number
}

export interface AnswerRow {
  child_id: string
  world: string
  subject: 'maths' | 'english'
  quest_id: string
  curriculum_id: string
  outcome: 'first_try' | 'helped' | 'shown'
  hints: number
  answered_at: string
}

type Item = { id: string; kind: 'progress'; row: ProgressRow } | { id: string; kind: 'answer'; row: AnswerRow }

const keyFor = (uid: string) => `study-buddy-sync-queue:${uid}`

function read(uid: string): Item[] {
  try {
    const raw = localStorage.getItem(keyFor(uid))
    return raw ? (JSON.parse(raw) as Item[]) : []
  } catch {
    return []
  }
}

function write(uid: string, items: Item[]) {
  try {
    if (items.length) localStorage.setItem(keyFor(uid), JSON.stringify(items))
    else localStorage.removeItem(keyFor(uid))
  } catch {
    /* storage full or blocked: the in-memory send still happens */
  }
}

const progressKey = (r: ProgressRow) => `${r.child_id}|${r.world}|${r.quest_id}`

export function enqueue(uid: string, item: { kind: 'progress'; row: ProgressRow } | { kind: 'answer'; row: AnswerRow }) {
  let items = read(uid)
  // only the latest state of a quest needs sending
  if (item.kind === 'progress') {
    const k = progressKey(item.row)
    items = items.filter((i) => i.kind !== 'progress' || progressKey(i.row) !== k)
  }
  items.push({ ...item, id: crypto.randomUUID() } as Item)
  write(uid, items)
}

export const pendingCount = (uid: string) => read(uid).length

/** Errors that will never succeed on retry (child deleted, not this parent's child, bad value): drop those writes. */
const hopeless = (code?: string) => code === '23503' || code === '42501' || code === '23514' || code === '22P02'

let flushing = false
/** a write arrived while a send was in flight: send again straight after */
let again = false

/** Send everything queued. Returns true when the queue is empty afterwards. */
export async function flush(uid: string): Promise<boolean> {
  if (!supabase) return false
  if (flushing) {
    again = true
    return false
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false
  const items = read(uid)
  if (!items.length) return true
  flushing = true
  try {
    const sent = new Set<string>()
    const progress = items.filter((i): i is Extract<Item, { kind: 'progress' }> => i.kind === 'progress')
    const answers = items.filter((i): i is Extract<Item, { kind: 'answer' }> => i.kind === 'answer')
    if (progress.length) {
      const { error } = await supabase.from('quest_progress').upsert(
        progress.map((i) => i.row),
        { onConflict: 'child_id,world,quest_id' },
      )
      if (!error || hopeless(error.code)) progress.forEach((i) => sent.add(i.id))
    }
    if (answers.length) {
      const { error } = await supabase.from('answers').insert(answers.map((i) => i.row))
      if (!error || hopeless(error.code)) answers.forEach((i) => sent.add(i.id))
    }
    // keep anything added while we were sending, drop what went through
    const left = read(uid).filter((i) => !sent.has(i.id))
    write(uid, left)
    return left.length === 0
  } catch {
    return false
  } finally {
    flushing = false
    if (again) {
      again = false
      void flush(uid)
    }
  }
}
