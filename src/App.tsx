import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Users } from 'lucide-react'
import { buildSession, type Focus, type ThemeId, type Year } from './data/questions'
import { Avatar, type AvatarLook } from './components/art'
import { AvatarScreen, Gate, Interests, Setup } from './screens/onboarding'
import { Home, ParentView, Results, Session, type SessionResult } from './screens/play'

type Stage = 'gate' | 'setup' | 'interests' | 'avatar' | 'home' | 'session' | 'results' | 'parent'

const UNLOCK_KEY = 'study-buddy-demo-unlocked'

function readUnlocked() {
  try {
    return sessionStorage.getItem(UNLOCK_KEY) === '1'
  } catch {
    return false
  }
}

function BrickMark() {
  return (
    <svg viewBox="0 0 40 28" className="h-6 w-auto" aria-hidden>
      <rect x={7} y={1} width={10} height={6} rx={1.5} fill="#F6C21C" stroke="#B98C00" strokeWidth={1.5} />
      <rect x={23} y={1} width={10} height={6} rx={1.5} fill="#F6C21C" stroke="#B98C00" strokeWidth={1.5} />
      <rect x={1} y={6} width={38} height={21} rx={3} fill="#F6C21C" stroke="#B98C00" strokeWidth={1.5} />
    </svg>
  )
}

export default function App() {
  const [stage, setStage] = useState<Stage>('gate')
  const [name, setName] = useState('')
  const [year, setYear] = useState<Year>(5)
  const [focus, setFocus] = useState<Focus>('mixed')
  const [interests, setInterests] = useState<ThemeId[]>([])
  const [look, setLook] = useState<AvatarLook>({ skin: 1, hair: 1, hairColor: 0, top: 0, extra: 2 })
  const [build, setBuild] = useState<ThemeId>('football')
  const [seed, setSeed] = useState(20261102)
  const [result, setResult] = useState<SessionResult | null>(null)
  const [returnTo, setReturnTo] = useState<Stage>('home')

  useEffect(() => {
    setSeed(Math.floor(Math.random() * 1e9))
    if (readUnlocked()) setStage('setup')
  }, [])

  const ordered = useMemo(() => [build, ...interests.filter((t) => t !== build)], [build, interests])
  const questions = useMemo(() => buildSession(ordered, year, focus, seed), [ordered, year, focus, seed])

  const go = (s: Stage) => {
    setStage(s)
    window.scrollTo({ top: 0 })
  }
  const onboarded = interests.length > 0 && !!name
  const inApp = stage !== 'gate'

  return (
    <div className="flex min-h-dvh flex-col">
      {inApp && (
        <header className="sticky top-0 z-20 bg-ink text-white">
          <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-5">
            <div className="flex items-center gap-2.5">
              <BrickMark />
              <span className="font-display text-[1.5rem] leading-none tracking-[0.01em]">Study Buddy</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {onboarded && stage !== 'parent' && (
                <span className="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3">
                  <span className="grid h-9 w-9 place-items-end overflow-hidden rounded-full bg-sky">
                    <Avatar look={look} className="h-8 w-auto" title={`${name}'s avatar`} />
                  </span>
                  <span className="max-w-[10ch] truncate font-bold">{name}</span>
                </span>
              )}
              {onboarded && stage !== 'session' && (
                stage === 'parent' ? (
                  <button type="button" onClick={() => go(returnTo)} className="flex min-h-[44px] items-center gap-2 rounded-xl px-3 font-bold hover:bg-white/10">
                    <ArrowLeft size={20} aria-hidden />
                    <span className="hidden sm:inline">Back to {name}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setReturnTo(stage)
                      go('parent')
                    }}
                    className="flex min-h-[44px] items-center gap-2 rounded-xl px-3 font-bold hover:bg-white/10"
                  >
                    <Users size={20} aria-hidden />
                    <span>Grown-ups</span>
                  </button>
                )
              )}
            </div>
          </div>
        </header>
      )}

      <div className="flex-1">
        {stage === 'gate' && (
          <Gate
            onUnlock={() => {
              try {
                sessionStorage.setItem(UNLOCK_KEY, '1')
              } catch {
                /* private mode: unlock for this page only */
              }
              go('setup')
            }}
          />
        )}
        {stage === 'setup' && (
          <Setup
            initial={{ name, year, focus }}
            onDone={(v) => {
              setName(v.name)
              setYear(v.year)
              setFocus(v.focus)
              go('interests')
            }}
          />
        )}
        {stage === 'interests' && (
          <Interests
            name={name}
            initial={interests}
            onBack={() => go('setup')}
            onDone={(ids) => {
              setInterests(ids)
              if (!ids.includes(build)) setBuild(ids[0])
              go('avatar')
            }}
          />
        )}
        {stage === 'avatar' && (
          <AvatarScreen
            name={name}
            initial={look}
            onBack={() => go('interests')}
            onDone={(l) => {
              setLook(l)
              go('home')
            }}
          />
        )}
        {stage === 'home' && (
          <Home
            name={name}
            look={look}
            interests={interests}
            build={build}
            onPickBuild={setBuild}
            year={year}
            plan={questions.map((q) => q.skill)}
            onStart={() => go('session')}
          />
        )}
        {stage === 'session' && (
          <Session
            key={seed}
            questions={questions}
            build={build}
            year={year}
            onQuit={() => go('home')}
            onFinish={(r) => {
              setResult(r)
              go('results')
            }}
          />
        )}
        {stage === 'results' && result && (
          <Results
            result={result}
            name={name}
            onAgain={() => {
              setSeed((s) => s + 1)
              go('home')
            }}
            onParent={() => {
              setReturnTo('home')
              setSeed((s) => s + 1)
              go('parent')
            }}
          />
        )}
        {stage === 'parent' && <ParentView name={name} year={year} result={result} onBack={() => go(returnTo === 'results' ? 'home' : returnTo)} />}
      </div>

      {inApp && (
        <footer className="mx-auto w-full max-w-[1280px] px-5 pb-6 text-sm text-ink-soft">
          Private demo prepared by Cleartwo. Sample data only; nothing is saved.
        </footer>
      )}
    </div>
  )
}
