import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { IslandId } from './world'
import type { ChildAvatarData } from '../components/avatar'
import { useAccount } from './account'

export interface Profile {
  /** the child's Supabase id (signed-in families only) */
  id?: string
  name: string
  year: 4 | 5 | 6
  interests: IslandId[]
  avatar?: ChildAvatarData
  /** favourite Premier League club, for the football world */
  team?: string
}

const KEY = 'study-buddy-preview-profile'

interface Ctx {
  profile: Profile | null
  /** demo: saved in this tab; signed in: saved to the child's row in Supabase */
  save: (p: Profile) => Promise<void>
  /** demo: start again; signed in: back to "Who's learning today?" */
  reset: () => void
  ready: boolean
}

const ProfileContext = createContext<Ctx>({ profile: null, save: async () => {}, reset: () => {}, ready: false })

/** Tidy a typed name: trim, collapse spaces, capitalise each part ("mary-jane o'neil" -> "Mary-Jane O'Neil"). */
export function tidyName(raw: string) {
  return raw
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/(^|[\s'-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase())
}

export const NAME_PATTERN = /^[\p{L}][\p{L}' -]{0,15}$/u

export function ProfileProvider({ children }: { children: ReactNode }) {
  const account = useAccount()
  const parent = account.mode === 'parent'
  const [local, setLocal] = useState<Profile | null>(null)
  const [localReady, setLocalReady] = useState(false)

  // demo profile: this tab only, as before
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY)
      if (raw) {
        const p = JSON.parse(raw) as Profile
        if (p && typeof p.name === 'string' && p.name && [4, 5, 6].includes(p.year)) setLocal(p)
      }
    } catch {
      /* storage blocked or bad data: start fresh */
    }
    setLocalReady(true)
  }, [])

  const kid = parent ? account.kids.find((k) => k.id === account.activeId) ?? null : null
  const profile: Profile | null = parent ? kid : local

  const { saveChild, choose } = account
  const save = useCallback(
    async (p: Profile) => {
      if (parent) {
        const child = await saveChild({ id: p.id ?? kid?.id, name: p.name, year: p.year, interests: p.interests, avatar: p.avatar, team: p.team })
        choose(child.id)
        return
      }
      setLocal(p)
      try {
        sessionStorage.setItem(KEY, JSON.stringify(p))
      } catch {
        /* fine: profile lives for this page only */
      }
    },
    [parent, kid?.id, saveChild, choose],
  )

  const reset = useCallback(() => {
    if (parent) {
      choose(null)
      return
    }
    setLocal(null)
    try {
      sessionStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  }, [parent, choose])

  const ready = parent ? account.kidsReady : localReady
  const value = useMemo(() => ({ profile, save, reset, ready }), [profile, save, reset, ready])
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export const useProfile = () => useContext(ProfileContext)
