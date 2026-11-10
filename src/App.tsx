import { useEffect, useState } from 'react'
import { Shell, type Tab } from './components/shell'
import type { IslandId } from './data/world'
import { Gate } from './screens/Gate'
import { Home } from './screens/Home'
import { Tutor } from './screens/Tutor'
import { World } from './screens/World'
import { Scan } from './screens/Scan'
import { Soon } from './screens/Soon'
import { Grownups } from './screens/Grownups'
import { Onboarding } from './screens/Onboarding'
import { ProfileProvider, useProfile } from './data/profile'
import { ProgressProvider, nextQuest, useProgress } from './data/progress'
import type { QuestDef, Subject, Year } from './data/syllabus'

const UNLOCK_KEY = 'study-buddy-preview-unlocked'

export default function App() {
  return (
    <ProfileProvider>
      <ProgressProvider>
        <Root />
      </ProgressProvider>
    </ProfileProvider>
  )
}

type Play = { world: IslandId; subject: Subject; questId: string; key: number }

function Root() {
  const { profile, ready } = useProfile()
  const progress = useProgress()
  const [unlocked, setUnlocked] = useState(false)
  const [tab, setTab] = useState<Tab>('home')
  const [world, setWorld] = useState<IslandId | null>(null)
  const [play, setPlay] = useState<Play | null>(null)
  const [from, setFrom] = useState<Tab>('home')

  useEffect(() => {
    try {
      if (sessionStorage.getItem(UNLOCK_KEY) === '1') setUnlocked(true)
    } catch {
      /* storage blocked: ask for the passcode */
    }
  }, [])

  const top = () => window.scrollTo({ top: 0 })

  const start = (w: IslandId, subject: Subject, q: QuestDef, back: Tab = tab) => {
    setFrom(back === 'tutor' ? 'home' : back)
    setPlay({ world: w, subject, questId: q.id, key: Date.now() })
    setTab('tutor')
    top()
  }

  const go = (t: Tab) => {
    if (t === 'tutor' && profile) {
      // the Tutor tab continues the next maths quest in the child's first world
      const w = world ?? profile.interests[0] ?? 'football'
      const q = nextQuest(progress.world(w), profile.year as Year, 'maths')
      if (q) return start(w, 'maths', q, tab)
    }
    if (t === 'home') setWorld(null)
    setTab(t)
    top()
  }

  if (!unlocked)
    return (
      <Gate
        onUnlock={() => {
          try {
            sessionStorage.setItem(UNLOCK_KEY, '1')
          } catch {
            /* fine: unlocked for this page only */
          }
          setUnlocked(true)
        }}
      />
    )

  if (!ready) return <div className="min-h-dvh bg-night" />
  if (!profile) return <Onboarding />

  return (
    <Shell tab={tab} onTab={go} hideNav={tab === 'tutor'}>
      {tab === 'home' && !world && (
        <Home
          onWorld={(w) => {
            setWorld(w)
            top()
          }}
          onPlay={(w, s, q) => start(w, s, q, 'home')}
        />
      )}
      {tab === 'home' && world && (
        <World
          world={world}
          onBack={() => {
            setWorld(null)
            top()
          }}
          onPlay={(s, q) => start(world, s, q, 'home')}
        />
      )}
      {tab === 'tutor' && play && (
        <Tutor
          key={play.key}
          world={play.world}
          subject={play.subject}
          questId={play.questId}
          onExit={() => {
            setTab(from)
            if (from === 'home') setWorld(play.world)
            top()
          }}
          onQuest={(q) => start(play.world, play.subject, q, from)}
        />
      )}
      {tab === 'scan' && <Scan onPractise={(w, s, q) => start(w, s, q, 'scan')} />}
      {tab === 'read' && <Soon tab={tab} onHome={() => go('home')} />}
      {tab === 'parent' && <Grownups onHome={() => go('home')} />}
    </Shell>
  )
}
