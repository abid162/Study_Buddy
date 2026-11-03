import { useEffect, useState } from 'react'
import { Shell, type Tab } from './components/shell'
import { Gate } from './screens/Gate'
import { Home } from './screens/Home'
import { Tutor } from './screens/Tutor'
import { Soon } from './screens/Soon'

const UNLOCK_KEY = 'study-buddy-preview-unlocked'

export default function App() {
  const [unlocked, setUnlocked] = useState(false)
  const [tab, setTab] = useState<Tab>('home')
  const [tutorKey, setTutorKey] = useState(0)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(UNLOCK_KEY) === '1') setUnlocked(true)
    } catch {
      /* storage blocked: ask for the passcode */
    }
  }, [])

  const go = (t: Tab) => {
    if (t === 'tutor') setTutorKey((k) => k + 1)
    setTab(t)
    window.scrollTo({ top: 0 })
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

  return (
    <Shell tab={tab} onTab={go} hideNav={tab === 'tutor'}>
      {tab === 'home' && <Home onPlay={() => go('tutor')} />}
      {tab === 'tutor' && <Tutor key={tutorKey} onExit={() => go('home')} />}
      {(tab === 'scan' || tab === 'read' || tab === 'parent') && <Soon tab={tab} onHome={() => go('home')} />}
    </Shell>
  )
}
