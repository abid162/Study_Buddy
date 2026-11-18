import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useAccount } from '../account'
import { useProfile } from '../profile'
import type { ReadingKind } from './texts'

/**
 * What the reading coach remembers: one row per text read (how many words, how many came through clearly, which words to
 * practise). Never the recording, never a transcript. Kept in this browser for everyone and in Supabase
 * (reading_sessions) for signed-in families, where a parent can clear it from the Grown-ups tab.
 */

export interface ReadingSession {
  id: string
  at: string
  textId: string
  world: string
  kind: ReadingKind
  title: string
  /** parts read / parts in the text */
  parts: number
  partsTotal: number
  words: number
  clear: number
  practice: string[]
}

const key = (child: string) => `study-buddy-reading:${child}`
const consentKey = (child: string) => `study-buddy-reading-consent:${child}`

function loadLocal(child: string): ReadingSession[] {
  try {
    return JSON.parse(localStorage.getItem(key(child)) ?? '[]') as ReadingSession[]
  } catch {
    return []
  }
}

function saveLocal(child: string, xs: ReadingSession[]) {
  try {
    localStorage.setItem(key(child), JSON.stringify(xs.slice(-100)))
  } catch {
    /* full or blocked: kept for this visit */
  }
}

function useChild() {
  const { profile } = useProfile()
  const { mode, userId } = useAccount()
  const child = profile ? (profile.id ?? `${profile.name.toLowerCase()}|${profile.year}`) : ''
  const childId = mode === 'parent' ? (profile?.id ?? null) : null
  return { child, childId, userId: mode === 'parent' ? userId : null }
}

/** Reading history for the current child: this browser's copy, merged with Supabase when signed in. */
export function useReadingLog() {
  const { child, childId } = useChild()
  const [sessions, setSessions] = useState<ReadingSession[]>(() => (child ? loadLocal(child) : []))

  useEffect(() => {
    setSessions(child ? loadLocal(child) : [])
    if (!supabase || !childId || !child) return
    let alive = true
    void supabase
      .from('reading_sessions')
      .select('id,created_at,text_id,world,kind,title,parts,parts_total,words,clear,practice')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (!alive || !data) return
        setSessions((cur) => {
          const have = new Set(cur.map((s) => s.id))
          const merged = [...cur]
          for (const r of data) {
            if (have.has(r.id)) continue
            merged.push({ id: r.id, at: r.created_at, textId: r.text_id, world: r.world, kind: r.kind as ReadingKind, title: r.title, parts: r.parts, partsTotal: r.parts_total, words: r.words, clear: r.clear, practice: r.practice ?? [] })
          }
          merged.sort((a, b) => a.at.localeCompare(b.at))
          saveLocal(child, merged)
          return merged
        })
      })
    return () => {
      alive = false
    }
  }, [child, childId])

  const add = useCallback(
    (s: ReadingSession) => {
      if (!child) return
      setSessions((cur) => {
        const next = [...cur.filter((x) => x.id !== s.id), s]
        saveLocal(child, next)
        return next
      })
      if (supabase && childId) {
        void supabase.from('reading_sessions').insert({ id: s.id, child_id: childId, text_id: s.textId, world: s.world, kind: s.kind, title: s.title, parts: s.parts, parts_total: s.partsTotal, words: s.words, clear: s.clear, practice: s.practice, created_at: s.at })
      }
    },
    [child, childId],
  )

  /** a grown-up clears the reading history (this browser and, when signed in, the account) */
  const clear = useCallback(async () => {
    if (!child) return
    saveLocal(child, [])
    setSessions([])
    if (supabase && childId) await supabase.from('reading_sessions').delete().eq('child_id', childId)
  }, [child, childId])

  return { sessions, add, clear }
}

/**
 * A grown-up's permission for the microphone. Signed in: a 'reading_voice' row in consents (one per parent account).
 * Demo: remembered in this browser for this child.
 */
export function useReadingConsent() {
  const { child, userId } = useChild()
  const [granted, setGranted] = useState<boolean | null>(null)

  useEffect(() => {
    if (!child) return setGranted(null)
    if (supabase && userId) {
      let alive = true
      void supabase
        .from('consents')
        .select('kind')
        .eq('parent_id', userId)
        .eq('kind', 'reading_voice')
        .maybeSingle()
        .then(({ data }) => alive && setGranted(!!data))
      return () => {
        alive = false
      }
    }
    try {
      setGranted(localStorage.getItem(consentKey(child)) === '1')
    } catch {
      setGranted(false)
    }
  }, [child, userId])

  const grant = useCallback(async () => {
    if (supabase && userId) {
      const { error } = await supabase.from('consents').upsert({ parent_id: userId, kind: 'reading_voice' }, { onConflict: 'parent_id,kind', ignoreDuplicates: true })
      if (error) throw new Error('Permission couldn’t be saved. Check your connection and try again.')
    } else {
      try {
        localStorage.setItem(consentKey(child), '1')
      } catch {
        /* this visit only */
      }
    }
    setGranted(true)
  }, [child, userId])

  const withdraw = useCallback(async () => {
    if (supabase && userId) await supabase.from('consents').delete().eq('parent_id', userId).eq('kind', 'reading_voice')
    try {
      localStorage.removeItem(consentKey(child))
    } catch {
      /* fine */
    }
    setGranted(false)
  }, [child, userId])

  return { granted, grant, withdraw }
}
