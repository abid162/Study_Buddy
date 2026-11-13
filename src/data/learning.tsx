import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useProfile } from './profile'
import { useAccount } from './account'
import { supabase } from './supabase'
import type { Json } from './database.types'

/**
 * What the child has shown they understand. Every answered question (quests and adventures) and every homework
 * scan becomes an event; mastery per curriculum statement comes from the recent events.
 * Kept on the device for everyone, and loaded from Supabase (answers and scans) for signed-in families.
 */

export type Outcome = 'first_try' | 'helped' | 'shown'
export type Source = 'quest' | 'adventure' | 'scan'

export interface LearnEvent {
  at: string
  cid: string
  outcome: Outcome
  source: Source
  world?: string
}

export interface ScanTricky {
  cid: string
  question: string
  correct: string
  feedback: string
  steps: string[]
}

export interface ScanNote {
  id: string
  at: string
  subject: string
  score: { correct: number; total: number }
  tricky: ScanTricky[]
  sample?: boolean
  /** the child has gone through Nova's explanation */
  done?: boolean
}

export type Status = 'new' | 'learning' | 'secure' | 'tricky'
export type Trend = 'improving' | 'steady' | 'dropping' | 'unknown'

export interface Mastery {
  cid: string
  attempts: number
  /** 0 to 1 over the recent answers: right first time 1, with help 0.5, shown 0 */
  score: number
  status: Status
  trend: Trend
  last: string
  /** most recent evidence came from a homework scan */
  fromScan: boolean
}

const VALUE: Record<Outcome, number> = { first_try: 1, helped: 0.5, shown: 0 }
const KEEP = 3000

export function masteryOf(events: LearnEvent[]): Map<string, Mastery> {
  const by = new Map<string, LearnEvent[]>()
  for (const e of events) {
    const l = by.get(e.cid) ?? []
    l.push(e)
    by.set(e.cid, l)
  }
  const out = new Map<string, Mastery>()
  for (const [cid, list] of by) {
    list.sort((a, b) => a.at.localeCompare(b.at))
    const recent = list.slice(-8)
    const avg = (xs: LearnEvent[]) => xs.reduce((n, e) => n + VALUE[e.outcome], 0) / Math.max(1, xs.length)
    const score = avg(recent)
    const last = list[list.length - 1]!
    const scanMiss = last.source === 'scan' && last.outcome === 'shown'
    let status: Status = 'learning'
    if (scanMiss || (recent.length >= 3 && score < 0.45)) status = 'tricky'
    else if (recent.length >= 4 && score >= 0.8) status = 'secure'
    let trend: Trend = 'unknown'
    if (list.length >= 6) {
      const d = avg(list.slice(-4)) - avg(list.slice(-8, -4))
      trend = d > 0.15 ? 'improving' : d < -0.15 ? 'dropping' : 'steady'
    }
    out.set(cid, { cid, attempts: list.length, score, status, trend, last: last.at, fromScan: last.source === 'scan' })
  }
  return out
}

/* ---------------- storage ---------------- */

interface Store {
  events: LearnEvent[]
  scans: ScanNote[]
}
const key = (child: string) => `study-buddy-learning:${child}`
const sameEvent = (e: LearnEvent) => `${e.cid}|${Date.parse(e.at)}|${e.source}`

function load(child: string): Store {
  try {
    const raw = localStorage.getItem(key(child))
    if (raw) return JSON.parse(raw) as Store
  } catch {
    /* fine */
  }
  return { events: [], scans: [] }
}

function save(child: string, s: Store) {
  try {
    localStorage.setItem(key(child), JSON.stringify({ events: s.events.slice(-KEEP), scans: s.scans.slice(-20) }))
  } catch {
    /* full or blocked: kept for this visit */
  }
}

export function scanEvents(n: ScanNote, all: { cid: string; ok: boolean }[]): LearnEvent[] {
  return all.filter((x) => x.cid).map((x) => ({ at: n.at, cid: x.cid, outcome: x.ok ? 'first_try' : 'shown', source: 'scan' as const }))
}

/* ---------------- context ---------------- */

interface Ctx {
  events: LearnEvent[]
  scans: ScanNote[]
  mastery: Map<string, Mastery>
  record: (e: Omit<LearnEvent, 'at'> & { at?: string }) => void
  /** a marked homework sheet: every question becomes evidence; the tricky ones feed Nova and the next session */
  addScan: (n: ScanNote, all: { cid: string; ok: boolean }[], raw?: unknown) => void
  markScanDone: (id: string) => void
  /** the newest scan with something tricky that Nova hasn't gone through yet */
  pendingScan: ScanNote | null
  /** curriculum ids the homework found tricky (recent, not yet practised) */
  scanWeak: Set<string>
}

const LearningContext = createContext<Ctx | null>(null)

export function LearningProvider({ children }: { children: ReactNode }) {
  const { profile } = useProfile()
  const { mode } = useAccount()
  const child = profile ? profile.id ?? `${profile.name.toLowerCase()}|${profile.year}` : ''
  const childId = mode === 'parent' ? profile?.id ?? null : null
  const [store, setStore] = useState<Store>({ events: [], scans: [] })

  useEffect(() => {
    setStore(child ? load(child) : { events: [], scans: [] })
  }, [child])

  // signed in: bring in answers and scans from other devices
  useEffect(() => {
    if (!supabase || !childId || !child) return
    let alive = true
    ;(async () => {
      const [a, s] = await Promise.all([
        supabase.from('answers').select('curriculum_id,outcome,answered_at,world,quest_id').eq('child_id', childId).order('answered_at', { ascending: false }).limit(1500),
        supabase.from('scans').select('id,created_at,subject,score,total,result').eq('child_id', childId).order('created_at', { ascending: false }).limit(20),
      ])
      if (!alive) return
      setStore((cur) => {
        const seen = new Set(cur.events.map(sameEvent))
        const events = [...cur.events]
        for (const r of a.data ?? []) {
          const e: LearnEvent = { at: r.answered_at, cid: r.curriculum_id, outcome: r.outcome as Outcome, source: r.quest_id.startsWith('adventure:') ? 'adventure' : 'quest', world: r.world }
          if (!seen.has(sameEvent(e))) events.push(e)
        }
        const scans = [...cur.scans]
        for (const r of s.data ?? []) {
          if (scans.some((x) => x.id === r.id)) continue
          const res = r.result as { note?: ScanNote; all?: { cid: string; ok: boolean }[] }
          if (!res?.note) continue
          scans.push({ ...res.note, id: r.id })
          for (const e of scanEvents(res.note, res.all ?? [])) if (!seen.has(sameEvent(e))) events.push(e)
        }
        events.sort((x, y) => x.at.localeCompare(y.at))
        scans.sort((x, y) => x.at.localeCompare(y.at))
        const next = { events, scans }
        save(child, next)
        return next
      })
    })()
    return () => {
      alive = false
    }
  }, [childId, child])

  const record = useCallback(
    (e: Omit<LearnEvent, 'at'> & { at?: string }) => {
      if (!child) return
      setStore((cur) => {
        const next = { ...cur, events: [...cur.events, { ...e, at: e.at ?? new Date().toISOString() }] }
        save(child, next)
        return next
      })
    },
    [child],
  )

  const addScan = useCallback(
    (n: ScanNote, all: { cid: string; ok: boolean }[]) => {
      if (!child) return
      setStore((cur) => {
        const next = { events: [...cur.events, ...scanEvents(n, all)], scans: [...cur.scans, n] }
        save(child, next)
        return next
      })
      // signed in: keep the marking (never the photo) with the child's history
      if (supabase && childId && !n.sample) {
        void supabase.from('scans').insert({ id: n.id, child_id: childId, year: profile?.year ?? 5, subject: n.subject, score: n.score.correct, total: n.score.total, result: { note: n, all } as unknown as Json })
      }
    },
    [child, childId, profile?.year],
  )

  const markScanDone = useCallback(
    (id: string) => {
      if (!child) return
      setStore((cur) => {
        const next = { ...cur, scans: cur.scans.map((s) => (s.id === id ? { ...s, done: true } : s)) }
        save(child, next)
        return next
      })
    },
    [child],
  )

  const value = useMemo<Ctx>(() => {
    const mastery = masteryOf(store.events)
    const fortnight = Date.now() - 14 * 864e5
    const recent = store.scans.filter((s) => Date.parse(s.at) > fortnight && s.tricky.length)
    const pendingScan = [...recent].reverse().find((s) => !s.done) ?? null
    const scanWeak = new Set<string>()
    for (const s of recent) for (const t of s.tricky) if (mastery.get(t.cid)?.status !== 'secure') scanWeak.add(t.cid)
    return { events: store.events, scans: store.scans, mastery, record, addScan, markScanDone, pendingScan, scanWeak }
  }, [store, record, addScan, markScanDone])

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>
}

export function useLearning() {
  const ctx = useContext(LearningContext)
  if (!ctx) throw new Error('useLearning must be used inside LearningProvider')
  return ctx
}
