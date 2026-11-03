import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'
import { Buddy, Photo, type Mood } from '../components/art'
import { ISLANDS, type IslandId } from '../data/world'
import { NAME_PATTERN, tidyName, useProfile, type Profile } from '../data/profile'

const YEARS: { y: Profile['year']; age: string }[] = [
  { y: 4, age: 'Age 8 to 9' },
  { y: 5, age: 'Age 9 to 10' },
  { y: 6, age: 'Age 10 to 11' },
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
  const [step, setStep] = useState<1 | 2>(1)
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

  const finish = () => {
    if (!picks.length || !year) return
    save({ name: clean, year, interests: picks })
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-night px-4 pb-10 pt-[calc(env(safe-area-inset-top,0px)+24px)] sm:px-8">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-grape/50 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-sea/40 blur-3xl" aria-hidden />

      <div className="relative mx-auto w-full max-w-[640px]">
        <div className="mb-6 flex items-center gap-3">
          {step === 2 && (
            <button type="button" onClick={() => setStep(1)} className="grid h-11 w-11 place-items-center rounded-full text-white hover:bg-white/10" aria-label="Back">
              <ArrowLeft size={24} aria-hidden />
            </button>
          )}
          <div className="flex flex-1 gap-2" aria-label={`Step ${step} of 2`}>
            {[1, 2].map((s) => (
              <span key={s} className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-sun' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
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
                  className="min-h-[60px] w-full rounded-2xl border-2 border-mist-deep bg-paper px-5 font-display text-2xl font-semibold text-ink placeholder:font-sans placeholder:text-lg placeholder:font-normal placeholder:text-ink-faint focus:border-grape focus:outline-none"
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
                    {YEARS.map(({ y, age }) => {
                      const on = year === y
                      return (
                        <button
                          key={y}
                          type="button"
                          aria-pressed={on}
                          onClick={() => setYear(y)}
                          className={`flex min-h-[76px] flex-col items-center justify-center rounded-2xl px-2 transition-[background-color,box-shadow,transform] duration-150 active:translate-y-0.5 ${
                            on ? 'bg-grape text-white shadow-[0_4px_0_#4A2DC4]' : 'bg-mist text-ink ring-2 ring-inset ring-mist-deep hover:bg-mist-deep'
                          }`}
                        >
                          <span className="font-display text-xl font-semibold">Year {y}</span>
                          <span className={`text-sm ${on ? 'text-white/85' : 'text-ink-soft'}`}>{age}</span>
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

                <button type="submit" className="btn btn-sun mt-8 w-full">
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
                  <button type="button" onClick={toggleAll} className="shrink-0 rounded-full px-3 py-1.5 text-sm font-bold text-grape-deep hover:bg-grape-soft">
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
                          className={`group relative block aspect-[4/3] w-full overflow-hidden rounded-3xl text-left transition-[box-shadow,transform,opacity] duration-150 active:scale-[0.98] ${
                            on ? 'shadow-[0_0_0_4px_#FFC93C]' : 'shadow-card'
                          }`}
                        >
                          <span className="absolute inset-0">
                            <Photo island={isl.id} alt="" className="h-full w-full" w={500} />
                          </span>
                          <span className="absolute inset-0 bg-gradient-to-t from-night-deep/90 via-night-deep/30 to-transparent" aria-hidden />
                          <span className="absolute inset-x-0 bottom-0 p-3">
                            <span className="block font-display text-lg font-semibold leading-tight text-white">{isl.name}</span>
                            <span className="block text-xs text-white/80">{isl.tagline}</span>
                          </span>
                          {on && (
                            <span className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-sun text-ink">
                              <Check size={18} strokeWidth={3} aria-hidden />
                            </span>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
                <button type="button" className="btn btn-sun mt-6 w-full" disabled={!picks.length} onClick={finish}>
                  {picks.length ? 'Let’s go!' : 'Pick at least one world'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
