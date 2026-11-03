import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { HERO_WORLDS, type HeroWorld, type IslandId } from './world'

export interface Profile {
  name: string
  year: 4 | 5 | 6
  interests: IslandId[]
  /** child-typed favourite player per world, optional */
  heroes?: Partial<Record<HeroWorld, string>>
}

/** The name that stars in a world's questions: the child's hero, or the invented fallback star. */
export function heroFor(profile: Profile | null, world: IslandId): string | null {
  if (world !== 'football' && world !== 'wrestling') return null
  return profile?.heroes?.[world]?.trim() || HERO_WORLDS[world].fallback
}

/** Names for heroes allow letters (any language), spaces, hyphens, apostrophes and full stops, up to 24 characters. */
export const HERO_PATTERN = /^[\p{L}][\p{L}' .-]{0,23}$/u

const KEY = 'study-buddy-preview-profile'

interface Ctx {
  profile: Profile | null
  save: (p: Profile) => void
  reset: () => void
  ready: boolean
}

const ProfileContext = createContext<Ctx>({ profile: null, save: () => {}, reset: () => {}, ready: false })

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
  const [profile, setProfile] = useState<Profile | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY)
      if (raw) {
        const p = JSON.parse(raw) as Profile
        if (p && typeof p.name === 'string' && p.name && [4, 5, 6].includes(p.year)) setProfile(p)
      }
    } catch {
      /* storage blocked or bad data: start fresh */
    }
    setReady(true)
  }, [])

  const save = (p: Profile) => {
    setProfile(p)
    try {
      sessionStorage.setItem(KEY, JSON.stringify(p))
    } catch {
      /* fine: profile lives for this page only */
    }
  }

  const reset = () => {
    setProfile(null)
    try {
      sessionStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  }

  return <ProfileContext.Provider value={{ profile, save, reset, ready }}>{children}</ProfileContext.Provider>
}

export const useProfile = () => useContext(ProfileContext)
