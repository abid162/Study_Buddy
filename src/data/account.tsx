import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AVATAR_BUCKET, supabase } from './supabase'
import type { Json } from './database.types'
import type { IslandId } from './world'
import type { ChildAvatarData } from '../components/avatar'

/**
 * Who is using the app.
 * - demo: the passcode preview; profile and progress stay in this browser, nothing reaches Supabase.
 * - parent: a signed-in grown-up; children and their progress live in Supabase (London).
 */
export type Mode = 'demo' | 'parent'

export interface Child {
  id: string
  name: string
  year: 4 | 5 | 6
  interests: IslandId[]
  avatar?: ChildAvatarData
  team?: string
}

/** What onboarding hands over when a child is created or edited. */
export interface ChildInput {
  id?: string
  name: string
  year: 4 | 5 | 6
  interests: IslandId[]
  avatar?: ChildAvatarData
  team?: string
}

const DEMO_KEY = 'study-buddy-preview-unlocked'
const activeKey = (uid: string) => `study-buddy-active-child:${uid}`

interface Ctx {
  /** false when the Supabase variables are missing: demo only */
  configured: boolean
  /** auth state has been read */
  ready: boolean
  mode: Mode | null
  session: Session | null
  email: string | null
  userId: string | null
  startDemo: () => void
  leaveDemo: () => void
  sendCode: (email: string) => Promise<void>
  verifyCode: (email: string, code: string) => Promise<void>
  /** finish a sign-in from the email button (needs a tap, so mail scanners can't use the link up) */
  verifyLink: (tokenHash: string, type: 'email' | 'signup') => Promise<void>
  signOut: () => Promise<void>
  /** children of the signed-in parent */
  kids: Child[]
  kidsReady: boolean
  kidsError: string
  reloadKids: () => Promise<void>
  hasTerms: boolean | null
  agreeTerms: () => Promise<void>
  activeId: string | null
  choose: (id: string | null) => void
  saveChild: (c: ChildInput) => Promise<Child>
}

const AccountContext = createContext<Ctx | null>(null)

/** Turn an auth or network error into words a parent can act on. */
export function friendlyError(e: unknown): string {
  const msg = (e as { message?: string })?.message ?? String(e)
  const status = (e as { status?: number })?.status
  if (/rate limit|too many|429/i.test(msg) || status === 429) return 'Too many emails were sent just now. Wait a minute, then try again.'
  if (/expired|invalid.*(otp|token)|token.*(invalid|expired)|not found/i.test(msg)) return 'That code or link has expired or was already used. Send yourself a new one and use the newest email.'
  if (/invalid.*email|email.*invalid/i.test(msg)) return 'That email address doesn’t look right. Check it and try again.'
  if (/fetch|network|failed to/i.test(msg)) return 'Study Buddy can’t reach the server. Check your internet connection and try again.'
  return msg || 'Something went wrong. Try again.'
}

type Row = { id: string; name: string; year: number; worlds: string[]; avatar: Json | null; team: string | null }

async function toChild(r: Row): Promise<Child> {
  let avatar = (r.avatar ?? undefined) as ChildAvatarData | undefined
  // photo avatars live in the private bucket: show them through a short-lived signed link
  if (avatar?.kind === 'photo' && avatar.path && supabase) {
    const { data } = await supabase.storage.from(AVATAR_BUCKET).createSignedUrl(avatar.path, 60 * 60 * 24)
    avatar = data?.signedUrl ? { ...avatar, src: data.signedUrl } : undefined
  }
  return { id: r.id, name: r.name, year: r.year as Child['year'], interests: r.worlds as IslandId[], avatar, team: r.team ?? undefined }
}

const dataUrlToBlob = async (src: string) => (await fetch(src)).blob()

export function AccountProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(!supabase)
  const [demo, setDemo] = useState(() => {
    try {
      return sessionStorage.getItem(DEMO_KEY) === '1'
    } catch {
      return false
    }
  })
  const [kids, setKids] = useState<Child[]>([])
  const [kidsReady, setKidsReady] = useState(false)
  const [kidsError, setKidsError] = useState('')
  const [hasTerms, setHasTerms] = useState<boolean | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const userId = session?.user.id ?? null

  // read the stored session (and any magic-link tokens in the address bar), then follow changes
  useEffect(() => {
    if (!supabase) return
    let alive = true
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setSession(data.session)
      setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setReady(true)
      // tidy the magic-link tokens out of the address bar
      if (s && window.location.hash.includes('access_token')) history.replaceState(null, '', window.location.pathname + window.location.search)
    })
    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const reloadKids = useCallback(async () => {
    if (!supabase || !userId) return
    setKidsError('')
    const [kidsRes, termsRes] = await Promise.all([
      supabase.from('children').select('id,name,year,worlds,avatar,team').order('created_at'),
      supabase.from('consents').select('kind').eq('kind', 'terms').maybeSingle(),
    ])
    if (kidsRes.error) {
      setKidsError(friendlyError(kidsRes.error))
      setKidsReady(true)
      return
    }
    setKids(await Promise.all(kidsRes.data.map(toChild)))
    setHasTerms(termsRes.error ? null : !!termsRes.data)
    setKidsReady(true)
  }, [userId])

  // load a parent's children when they sign in; forget everything when they sign out
  useEffect(() => {
    setKids([])
    setKidsReady(false)
    setHasTerms(null)
    if (!userId) {
      setActiveId(null)
      return
    }
    try {
      setActiveId(localStorage.getItem(activeKey(userId)))
    } catch {
      setActiveId(null)
    }
    void reloadKids()
  }, [userId, reloadKids])

  const choose = useCallback(
    (id: string | null) => {
      setActiveId(id)
      if (!userId) return
      try {
        if (id) localStorage.setItem(activeKey(userId), id)
        else localStorage.removeItem(activeKey(userId))
      } catch {
        /* fine: remembered for this page only */
      }
    },
    [userId],
  )

  const startDemo = useCallback(() => {
    try {
      sessionStorage.setItem(DEMO_KEY, '1')
    } catch {
      /* fine */
    }
    setDemo(true)
  }, [])

  const leaveDemo = useCallback(() => {
    try {
      sessionStorage.removeItem(DEMO_KEY)
    } catch {
      /* ignore */
    }
    setDemo(false)
  }, [])

  const sendCode = useCallback(async (email: string) => {
    if (!supabase) throw new Error('Sign-in isn’t set up on this site yet.')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, emailRedirectTo: window.location.origin + window.location.pathname },
    })
    if (error) throw new Error(friendlyError(error))
  }, [])

  const verifyCode = useCallback(async (email: string, code: string) => {
    if (!supabase) throw new Error('Sign-in isn’t set up on this site yet.')
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
    if (error) throw new Error(friendlyError(error))
  }, [])

  const verifyLink = useCallback(async (tokenHash: string, type: 'email' | 'signup') => {
    if (!supabase) throw new Error('Sign-in isn’t set up on this site yet.')
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (error) throw new Error(friendlyError(error))
  }, [])

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    setSession(null)
  }, [])

  const agreeTerms = useCallback(async () => {
    if (!supabase || !userId) return
    const { error } = await supabase.from('consents').upsert({ parent_id: userId, kind: 'terms' }, { onConflict: 'parent_id,kind', ignoreDuplicates: true })
    if (error) throw new Error(friendlyError(error))
    setHasTerms(true)
  }, [userId])

  const saveChild = useCallback(
    async (c: ChildInput): Promise<Child> => {
      if (!supabase || !userId) throw new Error('Please sign in again.')
      const id = c.id ?? crypto.randomUUID()
      let avatar: ChildAvatarData | undefined = c.avatar
      // a fresh photo avatar (a data: URL) goes to private storage; the row keeps only its path
      if (avatar?.kind === 'photo' && avatar.src.startsWith('data:')) {
        const blob = await dataUrlToBlob(avatar.src)
        const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/jpeg' ? 'jpg' : 'webp'
        const path = `${userId}/${id}.${ext}`
        const up = await supabase.storage.from(AVATAR_BUCKET).upload(path, blob, { upsert: true, contentType: blob.type || 'image/webp' })
        if (up.error) throw new Error(friendlyError(up.error))
        avatar = { kind: 'photo', src: '', path }
      }
      const stored: Json | null = !avatar ? null : avatar.kind === 'photo' ? { kind: 'photo', path: avatar.path ?? null } : (avatar as unknown as Json)
      const { data, error } = await supabase
        .from('children')
        .upsert({ id, parent_id: userId, name: c.name, year: c.year, worlds: c.interests, avatar: stored, team: c.team ?? null })
        .select('id,name,year,worlds,avatar,team')
        .single()
      if (error) throw new Error(friendlyError(error))
      const child = await toChild(data)
      setKids((cur) => (cur.some((k) => k.id === child.id) ? cur.map((k) => (k.id === child.id ? child : k)) : [...cur, child]))
      return child
    },
    [userId],
  )

  const mode: Mode | null = session ? 'parent' : demo ? 'demo' : null

  const value = useMemo<Ctx>(
    () => ({
      configured: !!supabase,
      ready,
      mode,
      session,
      email: session?.user.email ?? null,
      userId,
      startDemo,
      leaveDemo,
      sendCode,
      verifyCode,
      verifyLink,
      signOut,
      kids,
      kidsReady,
      kidsError,
      reloadKids,
      hasTerms,
      agreeTerms,
      activeId,
      choose,
      saveChild,
    }),
    [ready, mode, session, userId, startDemo, leaveDemo, sendCode, verifyCode, verifyLink, signOut, kids, kidsReady, kidsError, reloadKids, hasTerms, agreeTerms, activeId, choose, saveChild],
  )

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

export function useAccount() {
  const ctx = useContext(AccountContext)
  if (!ctx) throw new Error('useAccount must be used inside AccountProvider')
  return ctx
}
