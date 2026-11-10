import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'
import { Buddy, Photo, type Mood } from '../components/art'
import { ISLANDS, type IslandId } from '../data/world'
import { NAME_PATTERN, tidyName, useProfile, type Profile } from '../data/profile'
import { AvatarStep } from './AvatarStep'
import { NightPage } from '../components/scene'
import type { ChildAvatarData } from '../components/avatar'

const YEARS: { y: Profile['year']; age: string; bg: string; edge: string }[] = [
  { y: 4, age: 'Age 8 to 9', bg: 'linear-gradient(180deg,#4FA2F7,#2563C9)', edge: '#1A4796' },
  { y: 5, age: 'Age 9 to 10', bg: 'linear-gradient(180deg,#8F72FF,#6541EE)', edge: '#4A2DC4' },
  { y: 6, age: 'Age 10 to 11', bg: 'linear-gradient(180deg,#F0638F,#C2256E)', edge: '#8F1650' },
]

function Speech({ children, mood = 'happy' }: { children: string; mood?: Mood }) {
  return (
    <div className="flex items-end gap-3">
      <Buddy mood={mood} className="float h-24 w-24 shrink-0 drop-shadow-xl sm:h-28 sm:w-28" title="Nova the fox" />
      <motion.p
        key={children}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 rounded-3xl rounded-bl-lg bg-paper px-5 py-4 font-display text-xl font-medium leading-snug text-ink shadow-pop sm:text-2xl"
      >
        {children}
      </motion.p>
    </div>
  )
}

export function Onboarding() {
  const { profile, save } = useProfile()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [name, setName] = useState(profile?.name ?? '')
  const [year, setYear] = useState<Profile['year'] | null>(profile?.year ?? null)
  const [picks, setPicks] = useState<IslandId[]>(profile?.interests ?? [])
  const [tried, setTried] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === 1) inputRef.current?.focus()
  }, [step])

  const clean = tidyName(name)
  const nameError = !tried
    ? ''
    : !clean
      ? 'Type your first name or a nickname.'
      : clean.length > 16
        ? 'That’s a bit long. Try 16 letters or fewer.'
        : !NAME_PATTERN.test(clean)
          ? 'Use letters only, please (spaces, hyphens and apostrophes are fine).'
          : ''
  const yearError = tried && !year ? 'Pick your school year.' : ''

  const next = (e: FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (!clean || clean.length > 16 || !NAME_PATTERN.test(clean) || !year) return
    setName(clean)
    setTried(false)
    setStep(2)
    window.scrollTo({ top: 0 })
  }

  const toggle = (id: IslandId) => setPicks((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  const allPicked = picks.length === ISLANDS.length
  const toggleAll = () => setPicks(allPicked ? [] : ISLANDS.map((i) => i.id))

  const finish = (avatar: ChildAvatarData) => {
    if (!picks.length || !year) return
    save({ name: clean, year, interests: picks, avatar })
  }

  return (
    <NightPage className="px-4 pb-10 pt-[calc(env(safe-area-inset-top,0px)+24px)] sm:px-8">

      <div className="relative mx-auto w-full max-w-[640px]">
        <div className="mb-6 flex items-center gap-3">
          {step > 1 && (
            <button type="button" onClick={() => setStep(step === 3 ? 2 : 1)} className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.25)] hover:bg-white/25" aria-label="Back">
              <ArrowLeft size={24} aria-hidden />
            </button>
          )}
          <div className="flex flex-1 items-center gap-2" role="img" aria-label={`Step ${step} of 3`}>
            {[1, 2, 3].map((s) => (
              <span key={s} className="track track-dark h-3 flex-1">
                <span className="fill bg-sun transition-[width] duration-500" style={{ width: s <= step ? '100%' : '0%' }} />
              </span>
            ))}
            <span className="hud !min-h-[32px] !px-3 text-sm tabular">{step}/3</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 3 ? (
            <motion.div key="s3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              <Speech mood="cheer">{`Last thing, ${clean}! Let’s make your avatar.`}</Speech>
              <AvatarStep name={clean} initial={profile?.avatar} onBack={() => setStep(2)} onDone={finish} />
            </motion.div>
          ) : step === 1 ? (
            <motion.div key="s1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              <Speech mood="wink">Hi, I’m Nova! I’ll be your study buddy. What should I call you?</Speech>
              <form onSubmit={next} noValidate className="mt-4 rounded-4xl bg-paper p-6 shadow-pop sm:p-8">
                <label htmlFor="name" className="mb-2 block font-bold">
                  Your first name
                </label>
                <input
                  id="name"
                  ref={inputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 24))}
                  autoComplete="off"
                  autoCapitalize="words"
                  enterKeyHint="next"
                  aria-invalid={!!nameError}
                  aria-describedby={nameError ? 'name-error' : 'name-help'}
                  className="min-h-[62px] w-full rounded-[20px] border-[2.5px] border-[#CFD4F0] bg-[#F8F9FF] px-5 font-display text-2xl font-semibold text-ink placeholder:font-sans placeholder:text-lg placeholder:font-normal placeholder:text-ink-soft focus:border-grape focus:bg-paper focus:shadow-[0_0_0_4px_rgba(124,92,255,0.2)] focus:outline-none"
                  placeholder="e.g. Alex"
                />
                {nameError ? (
                  <p id="name-error" role="alert" className="mt-2 font-bold text-coral-deep">
                    {nameError}
                  </p>
                ) : (
                  <p id="name-help" className="mt-2 text-sm text-ink-soft">
                    A first name or nickname is all we need.
                  </p>
                )}

                <fieldset className="mt-7">
                  <legend className="mb-2 font-bold">Your school year</legend>
                  <div className="grid grid-cols-3 gap-2.5">
                    {YEARS.map(({ y, age, bg, edge }) => {
                      const on = year === y
                      return (
                        <button
                          key={y}
                          type="button"
                          aria-pressed={on}
                          onClick={() => setYear(y)}
                          className={`flex min-h-[84px] flex-col items-center justify-center rounded-[20px] px-2 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-1 ${
                            on ? 'scale-[1.04] text-white' : 'bg-paper text-ink shadow-[inset_0_0_0_2.5px_#DCE0F5,0_5px_0_#CDD2EE]'
                          }`}
                          style={on ? { background: bg, boxShadow: `inset 0 2px 0 rgba(255,255,255,0.35), 0 5px 0 ${edge}` } : undefined}
                        >
                          <span className="font-display text-xl font-semibold">Year {y}</span>
                          <span className={`text-sm ${on ? 'text-white/95' : 'text-ink-soft'}`}>{age}</span>
                        </button>
                      )
                    })}
                  </div>
                  {yearError && (
                    <p role="alert" className="mt-2 font-bold text-coral-deep">
                      {yearError}
                    </p>
                  )}
                </fieldset>

                <button type="submit" className="btn btn-sun sheen mt-8 w-full text-xl">
                  Next
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="s2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              <Speech mood="cheer">{`Nice to meet you, ${clean}! Which worlds should we explore first?`}</Speech>
              <div className="mt-4 rounded-4xl bg-paper p-5 shadow-pop sm:p-7">
                <div className="mb-4 flex items-baseline justify-between gap-3">
                  <p className="font-bold">
                    Pick as many as you like <span className="font-normal text-ink-soft tabular" aria-live="polite">({picks.length} picked)</span>
                  </p>
                  <button type="button" onClick={toggleAll} className="min-h-[44px] shrink-0 rounded-full bg-grape-soft px-4 text-sm font-bold text-grape-deep hover:bg-[#DFD5FF]">
                    {allPicked ? 'Clear all' : 'Pick all'}
                  </button>
                </div>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {ISLANDS.map((isl) => {
                    const on = picks.includes(isl.id)
                                        return (
                      <li key={isl.id}>
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggle(isl.id)}
                          className={`group relative block aspect-[4/3] w-full overflow-hidden rounded-3xl text-left transition-[box-shadow,transform,opacity] duration-200 hover:-translate-y-0.5 active:scale-[0.97] ${
                            on ? '-rotate-1 scale-[1.02] shadow-[0_0_0_4px_#FFC93C,0_6px_0_4px_#C98F00]' : 'shadow-[0_5px_0_rgba(23,21,58,0.18)]'
                          }`}
                        >
                          <span className="absolute inset-0">
                            <Photo island={isl.id} alt="" className="h-full w-full" w={500} />
                          </span>
                          <span className="absolute inset-0" style={{ background: `linear-gradient(0deg, ${isl.tint[1]}F2 0%, ${isl.tint[1]}66 45%, transparent 100%)` }} aria-hidden />
                          <span className="absolute inset-x-0 bottom-0 p-3">
                            <span className="block font-display text-lg font-semibold leading-tight text-white">{isl.name}</span>
                            <span className="block text-xs text-white/95">{isl.tagline}</span>
                          </span>
                          {on && (
                            <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 14 }} className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-sun text-ink shadow-[inset_0_2px_0_rgba(255,255,255,0.6),0_3px_0_#C98F00] ring-2 ring-white">
                              <Check size={20} strokeWidth={3.5} aria-hidden />
                            </motion.span>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
                <button type="button" className="btn btn-sun mt-6 w-full" disabled={!picks.length} onClick={() => setStep(3)}>
                  {picks.length ? 'Next: make your avatar' : 'Pick at least one world'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NightPage>
  )
}
