import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useProfile } from './profile'
import { useAccount } from './account'
import { supabase } from './supabase'
import { enqueue, flush, type ProgressRow } from './progress.sync'
import type { IslandId } from './world'
import { allQuests, type Subject, type Year } from './syllabus'

/**
 * Progress is kept separately for every world (a child can complete Fractions in Wrestling and still play it fresh in Football).
 * Demo: stored in this browser only (localStorage), keyed by the child's name and year.
 * Signed in: stored in Supabase (quest_progress), with this browser's copy kept as an offline cache keyed by the child's id.
 */

export interface QuestProgress {
  /** questions answered so far (resume point) */
  answered: number
  /** answered correctly at the first attempt, with no hints */
  firstTry: number
  /** answered correctly after a hint or a wrong try (not counting answers that were shown) */
  helped?: number
  total: number
}

/** One finished question, for the parent portal, streaks and daily missions. */
export interface AnswerLog {
  world: IslandId
  subject: Subject
  questId: string
  curriculumId: string
  outcome: 'first_try' | 'helped' | 'shown'
  hints: number
}

type WorldStore = Partial<Record<IslandId, Record<string, QuestProgress>>>
type Store = Record<string, WorldStore>
const KEY = 'study-buddy-progress-v1'

interface Ctx {
  get: (world: IslandId, questId: string) => QuestProgress | undefined
  record: (world: IslandId, questId: string, p: QuestProgress) => void
  /** log a finished question (signed-in families only; ignored in the demo) */
  log: (a: AnswerLog) => void
  world: (world: IslandId) => Record<string, QuestProgress>
  gems: number
  answeredAll: number
}

const ProgressContext = createContext<Ctx>({ get: () => undefined, record: () => {}, log: () => {}, world: () => ({}), gems: 0, answeredAll: 0 })

const toRow = (childId: string, world: string, questId: string, p: QuestProgress): ProgressRow => ({
  child_id: childId,
  world,
  quest_id: questId,
  answered: p.answered,
  first_try: p.firstTry,
  helped: p.helped ?? 0,
  total: p.total,
})

function persist(store: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    /* fine */
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { profile } = useProfile()
  const { mode, userId } = useAccount()
  const childId = mode === 'parent' ? profile?.id ?? null : null
  const who = childId ? `id:${childId}` : profile ? `${profile.name.toLowerCase()}|${profile.year}` : ''
  const legacy = profile ? `${profile.name.toLowerCase()}|${profile.year}` : ''
  const [store, setStore] = useState<Store>(() => {
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? (JSON.parse(raw) as Store) : {}
    } catch {
      return {} /* storage blocked: progress lasts for this page only */
    }
  })
  const storeRef = useRef(store)
  storeRef.current = store

  // signed in: load the child's progress from Supabase and merge it with this browser's copy
  useEffect(() => {
    if (!supabase || !childId || !userId) return
    let alive = true
    const key = `id:${childId}`
    ;(async () => {
      await flush(userId)
      const { data, error } = await supabase.from('quest_progress').select('world,quest_id,answered,first_try,helped,total').eq('child_id', childId)
      if (!alive || error) return
      const cached = storeRef.current[key] ?? {}
      const server: WorldStore = {}
      for (const r of data) {
        const w = r.world as IslandId
        server[w] = { ...(server[w] ?? {}), [r.quest_id]: { answered: r.answered, firstTry: r.first_try, helped: r.helped, total: r.total } }
      }
      // first sign-in on a browser that already has demo progress for this name and year: bring it across
      const local = data.length === 0 && !Object.keys(cached).length ? storeRef.current[legacy] ?? {} : cached
      const merged: WorldStore = { ...server }
      for (const [w, quests] of Object.entries(local) as [IslandId, Record<string, QuestProgress>][]) {
        for (const [q, p] of Object.entries(quests ?? {})) {
          const s = server[w]?.[q]
          if (!s || p.answered > s.answered) {
            merged[w] = { ...(merged[w] ?? {}), [q]: p }
            enqueue(userId, { kind: 'progress', row: toRow(childId, w, q, p) })
          }
        }
      }
      setStore((cur) => {
        const next = { ...cur, [key]: merged }
        persist(next)
        return next
      })
      void flush(userId)
    })()
    return () => {
      alive = false
    }
  }, [childId, userId, legacy])

  // retry queued writes when the connection comes back or the app is reopened
  useEffect(() => {
    if (!userId) return
    const retry = () => void flush(userId)
    window.addEventListener('online', retry)
    document.addEventListener('visibilitychange', retry)
    const t = window.setInterval(retry, 30_000)
    return () => {
      window.removeEventListener('online', retry)
      document.removeEventListener('visibilitychange', retry)
      window.clearInterval(t)
    }
  }, [userId])

  const mine = useMemo(() => store[who] ?? {}, [store, who])

  const record = useCallback(
    (world: IslandId, questId: string, p: QuestProgress) => {
      if (!who) return
      setStore((cur) => {
        const next: Store = { ...cur, [who]: { ...(cur[who] ?? {}), [world]: { ...(cur[who]?.[world] ?? {}), [questId]: p } } }
        persist(next)
        return next
      })
      if (childId && userId) {
        enqueue(userId, { kind: 'progress', row: toRow(childId, world, questId, p) })
        void flush(userId)
      }
    },
    [who, childId, userId],
  )

  const log = useCallback(
    (a: AnswerLog) => {
      if (!childId || !userId) return
      enqueue(userId, {
        kind: 'answer',
        row: { child_id: childId, world: a.world, subject: a.subject, quest_id: a.questId, curriculum_id: a.curriculumId, outcome: a.outcome, hints: a.hints, answered_at: new Date().toISOString() },
      })
      void flush(userId)
    },
    [childId, userId],
  )

  const value = useMemo<Ctx>(() => {
    let answeredAll = 0
    let first = 0
    for (const w of Object.values(mine)) for (const q of Object.values(w ?? {})) {
      answeredAll += q.answered
      first += q.firstTry
    }
    return {
      get: (world, id) => mine[world]?.[id],
      world: (world) => mine[world] ?? {},
      record,
      log,
      answeredAll,
      /** 10 gems per answer, plus 5 for a first-try answer with no hints */
      gems: answeredAll * 10 + first * 5,
    }
  }, [mine, record, log])

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export const useProgress = () => useContext(ProgressContext)

export const isDone = (p?: QuestProgress) => !!p && p.answered >= p.total
/** 3 stars for 80%+ first try, 2 for 50%+, otherwise 1. */
export const starsFor = (p?: QuestProgress) => (!isDone(p) ? 0 : p!.firstTry / p!.total >= 0.8 ? 3 : p!.firstTry / p!.total >= 0.5 ? 2 : 1)

/** How far through a subject (or both) a world is. */
export function worldStats(progress: Record<string, QuestProgress>, year: Year, subject?: Subject) {
  const subjects: Subject[] = subject ? [subject] : ['maths', 'english']
  let quests = 0
  let done = 0
  let questions = 0
  let answered = 0
  let stars = 0
  let firstTry = 0
  let helped = 0
  for (const s of subjects)
    for (const q of allQuests(year, s)) {
      if (!q.playable) continue
      quests++
      questions += q.size
      const p = progress[q.id]
      if (p) {
        answered += Math.min(p.answered, q.size)
        firstTry += p.firstTry
        helped += p.helped ?? 0
      }
      if (isDone(p)) done++
      stars += starsFor(p)
    }
  return { quests, done, questions, answered, stars, firstTry, helped, fraction: questions ? answered / questions : 0 }
}

/** The next quest to play in a world: the first one started but not finished, else the first not started. */
export function nextQuest(progress: Record<string, QuestProgress>, year: Year, subject: Subject) {
  const qs = allQuests(year, subject).filter((q) => q.playable)
  return qs.find((q) => progress[q.id] && !isDone(progress[q.id])) ?? qs.find((q) => !progress[q.id]) ?? qs[0]
}
