import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Delete, Lightbulb, RotateCcw } from 'lucide-react'
import {
  checkAnswer,
  formatAnswer,
  objective,
  SKILL_LABEL,
  type Question,
  type Skill,
  type ThemeId,
  type Year,
} from '../data/questions'
import { themeById } from '../data/themes'
import { Avatar, BrickModel, Buddy, THEME_ICON, type AvatarLook } from '../components/art'

export type Outcome = 'first' | 'helped' | 'shown'
export interface StepRecord {
  skill: Skill
  theme: ThemeId
  attempts: number
  hints: number
  outcome: Outcome
  tags: string[]
}
export interface SessionResult {
  build: ThemeId
  year: Year
  records: StepRecord[]
  minutes: number
}

/* ---------- home ---------- */

export function Home({
  name,
  look,
  interests,
  build,
  onPickBuild,
  year,
  plan,
  onStart,
}: {
  name: string
  look: AvatarLook
  interests: ThemeId[]
  build: ThemeId
  onPickBuild: (t: ThemeId) => void
  year: Year
  plan: Skill[]
  onStart: () => void
}) {
  const theme = themeById(build)
  const counts = plan.reduce<Record<string, number>>((acc, s) => ({ ...acc, [s]: (acc[s] ?? 0) + 1 }), {})
  return (
    <main className="mx-auto grid w-full max-w-[1180px] gap-8 px-5 pb-16 pt-8 lg:grid-cols-[1fr_420px] lg:items-start">
      <section className="panel p-7 sm:p-10">
        <div className="flex items-center gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-end overflow-hidden rounded-2xl bg-sky">
            <Avatar look={look} className="h-[72px] w-auto" title={`${name}'s avatar`} />
          </div>
          <div>
            <h1 className="font-display text-[2.25rem] leading-tight">Ready to build, {name}?</h1>
            <p className="text-ink-soft">6 steps of Year {year} maths. About 8 minutes.</p>
          </div>
        </div>

        <fieldset className="mt-9">
          <legend className="field-label">Choose today's build</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {interests.map((id) => {
              const t = themeById(id)
              const Icon = THEME_ICON[id]
              const on = id === build
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onPickBuild(id)}
                  className={`flex min-h-[64px] items-center gap-3 rounded-xl px-4 text-left font-bold transition-colors duration-150 ${
                    on ? 'bg-ink text-white' : 'bg-paper ring-2 ring-inset ring-sky-deep hover:bg-sky-soft'
                  }`}
                >
                  <Icon size={22} aria-hidden className={on ? 'text-brick-yellow' : 'text-brick-blue'} />
                  {t.build}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="mt-8 rounded-2xl bg-sky-soft p-5 ring-2 ring-inset ring-sky-deep">
          <h2 className="font-bold">In this build</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {Object.entries(counts).map(([s, n]) => (
              <li key={s} className="flex items-center gap-2 rounded-lg bg-paper px-3 py-2 shadow-sm">
                <span className="font-display text-lg leading-none text-brick-blue tabular">{n}x</span>
                <span className="font-bold">{SKILL_LABEL[s as Skill]}</span>
              </li>
            ))}
          </ul>
        </div>

        <button type="button" className="btn btn-go mt-9 min-h-[60px] px-8 text-xl" onClick={onStart}>
          Start building
        </button>
      </section>

      <section aria-label={`${theme.build} preview`} className="grid place-items-center rounded-3xl bg-sky-deep/50 p-8">
        <BrickModel rows={theme.model} built={0} ghostAll label={`Outline of the ${theme.build}, not built yet`} className="h-auto w-full max-w-[340px]" />
        <p className="mt-4 text-center text-lg font-bold">{theme.build}</p>
        <p className="text-center text-ink-soft">Each right answer adds a row.</p>
      </section>
    </main>
  )
}

/* ---------- number pad ---------- */

function Pad({ onKey, disabled }: { onKey: (k: string) => void; disabled: boolean }) {
  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', 'del']
  return (
    <div className="grid grid-cols-3 gap-2.5" role="group" aria-label="Number pad">
      {keys.map((k) => (
        <button
          key={k}
          type="button"
          disabled={disabled}
          onClick={() => onKey(k)}
          aria-label={k === 'del' ? 'Delete last digit' : k === '.' ? 'Decimal point' : k}
          className="grid h-[60px] place-items-center rounded-xl lg:h-[64px] bg-sky-soft text-2xl font-bold text-ink ring-2 ring-inset ring-sky-deep transition-[background-color,transform] duration-100 hover:bg-sky active:translate-y-0.5 disabled:opacity-40 tabular"
        >
          {k === 'del' ? <Delete size={24} aria-hidden /> : k}
        </button>
      ))}
    </div>
  )
}

/* ---------- session ---------- */

type Phase = 'answering' | 'correct' | 'shown'

export function Session({
  questions,
  build,
  onFinish,
  onQuit,
  year,
}: {
  questions: Question[]
  build: ThemeId
  year: Year
  onFinish: (r: SessionResult) => void
  onQuit: () => void
}) {
  const theme = themeById(build)
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [phase, setPhase] = useState<Phase>('answering')
  const [attempts, setAttempts] = useState(0)
  const [hintLevel, setHintLevel] = useState(0)
  const [message, setMessage] = useState<{ tone: 'wrong' | 'empty' | 'right'; text: string } | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [records, setRecords] = useState<StepRecord[]>([])
  const [shake, setShake] = useState(0)
  const [dropRow, setDropRow] = useState<number | undefined>(undefined)
  const startRef = useRef(Date.now())
  const nextRef = useRef<HTMLButtonElement>(null)
  const q = questions[index]
  const built = records.length

  const key = useCallback(
    (k: string) => {
      if (phase !== 'answering') return
      setMessage(null)
      setInput((v) => {
        if (k === 'del') return v.slice(0, -1)
        if (k === '.' && v.includes('.')) return v
        if (v.length >= 9) return v
        return v + k
      })
    },
    [phase],
  )

  const record = (outcome: Outcome) => {
    const rec: StepRecord = { skill: q.skill, theme: q.theme, attempts: attempts + 1, hints: hintLevel, outcome, tags }
    setRecords((r) => [...r, rec])
    setDropRow(records.length)
  }

  const check = useCallback(() => {
    if (phase !== 'answering') return
    const res = checkAnswer(q, input)
    if (res.status === 'empty') {
      setMessage({ tone: 'empty', text: 'Type your answer on the number pad first.' })
      return
    }
    if (res.status === 'correct') {
      setPhase('correct')
      setMessage({ tone: 'right', text: `Correct! Row ${records.length + 1} clicks into place.` })
      record(attempts === 0 && hintLevel === 0 ? 'first' : 'helped')
      return
    }
    const n = attempts + 1
    setAttempts(n)
    setShake((s) => s + 1)
    if (res.misconception) setTags((t) => (t.includes(res.misconception!.tag) ? t : [...t, res.misconception!.tag]))
    if (n >= 3) {
      setPhase('shown')
      setHintLevel(3)
      setMessage({ tone: 'wrong', text: "That one's tricky. Here's how it works, then we'll add the bricks." })
      return
    }
    setHintLevel((h) => Math.max(h, n))
    setMessage({
      tone: 'wrong',
      text: res.misconception ? res.misconception.message : n === 1 ? 'Not quite. Check the hint below and have another go.' : 'Close. One more hint has opened below.',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, q, input, attempts, hintLevel, records.length, tags])

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (/^[0-9.]$/.test(e.key)) key(e.key)
      else if (e.key === 'Backspace') key('del')
      else if (e.key === 'Enter' && phase === 'answering' && !(e.target instanceof HTMLButtonElement)) check()
    }
    window.addEventListener('keydown', onDown)
    return () => window.removeEventListener('keydown', onDown)
  }, [key, check, phase])

  useEffect(() => {
    if (phase !== 'answering') nextRef.current?.focus()
  }, [phase])

  const next = () => {
    if (phase === 'shown') {
      record('shown')
      setPhase('correct')
      setMessage({ tone: 'right', text: `Row ${records.length + 1} added. You'll see this one again soon.` })
      return
    }
    if (index + 1 >= questions.length) {
      onFinish({ build, year, records, minutes: Math.max(1, Math.round((Date.now() - startRef.current) / 60000)) })
      return
    }
    setIndex((i) => i + 1)
    setInput('')
    setPhase('answering')
    setAttempts(0)
    setHintLevel(0)
    setTags([])
    setMessage(null)
    setDropRow(undefined)
  }

  const Icon = THEME_ICON[q.theme]
  const last = index + 1 >= questions.length

  return (
    <main className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-6 px-4 pb-10 pt-6 sm:px-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="panel min-w-0 p-5 sm:p-9" aria-labelledby="step-title">
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-[4.5rem] leading-[0.85] text-ink tabular" aria-hidden>
              {index + 1}
            </span>
            <span className="text-lg font-bold text-ink-soft">of {questions.length}</span>
            <h1 id="step-title" className="sr-only">
              Step {index + 1} of {questions.length}
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-sky-soft px-3 py-1.5 text-sm font-bold text-ink">
            <Icon size={18} aria-hidden className="text-brick-blue" />
            {themeById(q.theme).label}
          </div>
        </header>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_228px]">
          <div className="min-w-0">
            <p className="max-w-[46ch] text-[1.375rem] leading-snug">{q.scene}</p>
            <p className="mt-3 max-w-[46ch] text-[1.5rem] font-bold leading-snug">{q.ask}</p>

            <div key={shake} className={`mt-7 flex min-h-[76px] max-w-[420px] items-center rounded-2xl border-[3px] bg-paper px-5 ${shake ? 'nudge' : ''} ${
              phase === 'correct' ? 'border-brick-green' : message?.tone === 'wrong' ? 'border-brick-red' : 'border-ink'
            }`}>
              <output aria-label="Your answer" className="flex w-full items-baseline gap-2 text-[2rem] font-bold tabular">
                {q.prefix && <span className="text-ink-soft">{q.prefix}</span>}
                <span className={input ? '' : 'text-ink-faint'}>{input || '?'}</span>
                {phase === 'answering' && <span className="ml-0.5 h-8 w-[3px] animate-pulse self-center rounded bg-brick-blue" aria-hidden />}
                {q.unit && <span className="ml-auto text-xl text-ink-soft">{q.unit}</span>}
              </output>
            </div>

            <div aria-live="polite" className="min-h-[3.5rem]">
              {message && (
                <p
                  className={`rise mt-4 flex max-w-[52ch] items-start gap-2 text-lg font-bold ${
                    message.tone === 'right' ? 'text-brick-greenDeep' : message.tone === 'wrong' ? 'text-brick-redDeep' : 'text-ink-soft'
                  }`}
                >
                  {message.tone === 'right' && <Check size={24} strokeWidth={3} className="mt-0.5 shrink-0" aria-hidden />}
                  {message.text}
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {phase === 'answering' ? (
                <>
                  <button type="button" className="btn btn-primary min-w-[200px]" onClick={check}>
                    Check answer
                  </button>
                  {hintLevel < 3 && (
                    <button
                      type="button"
                      className="btn bg-brick-yellow text-ink shadow-lift hover:bg-[#E9B40B]"
                      onClick={() => setHintLevel((h) => Math.min(3, h + 1))}
                    >
                      <Lightbulb size={20} aria-hidden />
                      {hintLevel === 0 ? 'Get a hint' : 'Another hint'}
                    </button>
                  )}
                </>
              ) : (
                <button ref={nextRef} type="button" className="btn btn-go min-w-[200px]" onClick={next}>
                  {phase === 'shown' ? 'Add the bricks' : last ? 'Finish the build' : 'Next step'}
                </button>
              )}
            </div>
          </div>

          <div className="lg:pt-1">
            <Pad onKey={key} disabled={phase !== 'answering'} />
          </div>
        </div>

        {(hintLevel > 0 || phase === 'shown') && (
          <section className="rise mt-8 rounded-2xl bg-brick-yellowSoft p-5 ring-2 ring-inset ring-brick-yellow sm:p-6" aria-label="Hints from Pip">
            <div className="flex gap-4">
              <Buddy className="hidden h-20 w-auto shrink-0 sm:block" mood={phase === 'shown' ? 'thinking' : 'happy'} />
              <div className="min-w-0 flex-1">
                <h2 className="font-bold">You'll need</h2>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {q.parts.map((p) => (
                    <li key={p.label} className="flex items-center gap-2 rounded-lg bg-paper px-3 py-1.5 ring-2 ring-inset ring-brick-yellow">
                      <span className="font-display text-lg leading-none tabular">{p.count}</span>
                      <span className="font-bold">{p.label}</span>
                    </li>
                  ))}
                </ul>
                <ol className="mt-4 grid gap-2">
                  {q.hints.slice(0, hintLevel).map((h, i) => (
                    <li key={i} className="rise grid grid-cols-[28px_1fr] gap-2 text-lg">
                      <span className="grid h-7 w-7 place-items-center rounded-md bg-ink text-sm font-bold text-white tabular">{i + 1}</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ol>
                {phase === 'shown' && (
                  <p className="mt-4 rounded-xl bg-paper p-4 text-lg">
                    <span className="font-bold">The answer is {formatAnswer(q)}.</span> {q.solution}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t-2 border-sky-soft pt-5">
          <p className="text-sm text-ink-soft">{objective(q.skill, year)}</p>
          <button type="button" onClick={onQuit} className="text-sm font-bold text-ink-soft underline decoration-2 underline-offset-4 hover:text-ink">
            Stop and save for later
          </button>
        </footer>
      </section>

      <aside className="order-first lg:order-none" aria-label="Your build">
        <div className="flex items-center gap-4 rounded-3xl bg-sky-deep/50 p-4 lg:sticky lg:top-24 lg:flex-col lg:items-stretch lg:p-7">
          <div className="lg:mb-1">
            <p className="text-lg font-bold">{theme.build}</p>
            <p className="text-ink-soft tabular">
              {built} of {theme.model.length} rows built
            </p>
          </div>
          <BrickModel
            rows={theme.model}
            built={built}
            ghostAll
            ghostNext
            dropRow={dropRow}
            label={`${theme.build}: ${built} of ${theme.model.length} rows built`}
            className="order-first h-28 w-auto shrink-0 lg:order-none lg:h-auto lg:w-full"
          />
          <ol className="mt-2 hidden gap-1.5 lg:flex" aria-hidden>
            {questions.map((_, i) => (
              <li
                key={i}
                className={`h-3 flex-1 rounded-sm lg:h-3.5 ${i < built ? 'bg-brick-greenDeep' : i === built ? 'bg-brick-blue' : 'bg-paper/70'}`}
                style={{ minWidth: 14 }}
              />
            ))}
          </ol>
        </div>
      </aside>
    </main>
  )
}

/* ---------- results ---------- */

export function Results({ result, name, onAgain, onParent }: { result: SessionResult; name: string; onAgain: () => void; onParent: () => void }) {
  const theme = themeById(result.build)
  const first = result.records.filter((r) => r.outcome === 'first').length
  const hints = result.records.reduce((n, r) => n + r.hints, 0)
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => headingRef.current?.focus(), [])
  return (
    <main className="mx-auto grid w-full max-w-[1100px] items-center gap-10 px-5 pb-16 pt-10 md:grid-cols-[1fr_1fr]">
      <div className="relative grid place-items-center rounded-3xl bg-sky-deep/50 p-8">
        <BrickModel rows={theme.model} built={theme.model.length} dropRow={theme.model.length - 1} label={`Your finished ${theme.build}`} className="h-auto w-full max-w-[360px]" />
        <Buddy mood="cheer" className="absolute -bottom-6 right-6 h-28 w-auto" />
      </div>
      <div>
        <h1 ref={headingRef} tabIndex={-1} className="font-display text-[3rem] leading-[1.05] focus:outline-none">
          You built the {theme.build}!
        </h1>
        <p className="mt-4 max-w-[44ch] text-xl">
          {first === result.records.length
            ? `All ${first} steps right first time, ${name}. That's a perfect build.`
            : `You got ${first} of ${result.records.length} steps right first time${hints ? ` and used ${hints} hint${hints === 1 ? '' : 's'} to work out the rest` : ''}. Hints are part of building.`}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" className="btn btn-go" onClick={onAgain}>
            <RotateCcw size={20} aria-hidden />
            Build another
          </button>
          <button type="button" className="btn btn-quiet" onClick={onParent}>
            Show a grown-up
          </button>
        </div>
      </div>
    </main>
  )
}

/* ---------- parent view ---------- */

const PARENT_NOTE: Record<string, string> = {
  'area-perimeter-mixup': 'Mixed up area and perimeter. Try it at home: tape around the edge of a table is perimeter; covering the top with paper is area.',
  'added-sides': 'Added two sides to find area. Area means multiplying length by width.',
  'two-sides-only': 'Added only two sides for a perimeter. A rectangle has four sides to go around.',
  'added-not-multiplied': 'Added instead of multiplying once. Talking through "groups of" helps.',
  'multiplied-not-divided': 'Multiplied when the question needed sharing. Ask "will each group get more or fewer?"',
  'subtracted-not-divided': 'Subtracted when the question needed sharing into equal groups.',
  'found-one-part': 'Found one part of a fraction but not the full amount. The top number says how many parts to take.',
  'divided-by-numerator': 'Divided by the top number of a fraction. Divide by the bottom number first.',
  'rounded-wrong-way': 'Rounded in the wrong direction. The digit to the right decides: 5 or more rounds up.',
  'wrong-place': 'Rounded to a different place value than asked.',
  'misaligned-decimals': 'Added decimals without lining up the decimal points.',
}

const OUTCOME: Record<Outcome, { label: string; brick: string; badge: string }> = {
  first: { label: 'Secure', brick: '#2E9E4F', badge: 'bg-brick-greenSoft text-brick-greenDeep' },
  helped: { label: 'Getting there', brick: '#F6C21C', badge: 'bg-brick-yellowSoft text-ink' },
  shown: { label: 'Needs practice', brick: '#D9312B', badge: 'bg-[#FBE3E2] text-brick-redDeep' },
}

export function ParentView({ name, year, result, onBack }: { name: string; year: Year; result: SessionResult | null; onBack: () => void }) {
  if (!result) {
    return (
      <main className="mx-auto w-full max-w-[1000px] px-5 pb-16 pt-10">
        <h1 className="font-display text-[2.5rem] leading-tight">{name}'s progress</h1>
        <div className="panel mt-8 flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center">
          <Buddy className="h-24 w-auto shrink-0" />
          <div>
            <h2 className="text-xl font-bold">No builds yet</h2>
            <p className="mt-1 max-w-[56ch] text-ink-soft">When {name} finishes their first build, you'll see each skill they practised, where hints helped, and what to try next.</p>
          </div>
        </div>
        <button type="button" className="btn btn-primary mt-8" onClick={onBack}>
          Back to {name}'s builds
        </button>
      </main>
    )
  }
  const theme = themeById(result.build)
  const first = result.records.filter((r) => r.outcome === 'first').length
  const notes = Array.from(new Set(result.records.flatMap((r) => r.tags))).map((t) => PARENT_NOTE[t]).filter(Boolean)
  const weakest = result.records.find((r) => r.outcome === 'shown') ?? result.records.find((r) => r.outcome === 'helped')
  return (
    <main className="mx-auto w-full max-w-[1100px] px-5 pb-16 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[2.5rem] leading-tight">{name}'s progress</h1>
          <p className="mt-1 text-ink-soft">
            Year {year} maths. {theme.build} build, {result.records.length} steps in about {result.minutes} minute{result.minutes === 1 ? '' : 's'}.
          </p>
        </div>
        <p className="rounded-full bg-paper px-4 py-2 text-sm font-bold text-ink-soft ring-2 ring-inset ring-sky-deep">Sample data from this demo session. Nothing is saved.</p>
      </div>

      <section className="panel mt-8 p-6 sm:p-8" aria-labelledby="build-steps">
        <h2 id="build-steps" className="text-xl font-bold">
          How each step went
        </h2>
        <p className="mt-1 text-ink-soft">
          {first} of {result.records.length} right first time.
        </p>
        <ol className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {result.records.map((r, i) => (
            <li key={i} className="flex flex-col gap-2">
              <svg viewBox="0 0 120 40" className="w-full" aria-hidden>
                {[18, 48, 78].map((x) => (
                  <rect key={x} x={x} y={2} width={24} height={8} rx={2} fill={OUTCOME[r.outcome].brick} stroke="rgba(20,40,75,0.35)" strokeWidth={1.5} />
                ))}
                <rect x={2} y={8} width={116} height={30} rx={4} fill={OUTCOME[r.outcome].brick} stroke="rgba(20,40,75,0.35)" strokeWidth={1.5} />
              </svg>
              <span className="text-sm font-bold">
                Step {i + 1}: {SKILL_LABEL[r.skill]}
              </span>
              <span className={`w-fit rounded-md px-2 py-0.5 text-sm font-bold ${OUTCOME[r.outcome].badge}`}>{OUTCOME[r.outcome].label}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="panel overflow-hidden" aria-labelledby="skills">
          <h2 id="skills" className="px-6 pt-6 text-xl font-bold sm:px-8 sm:pt-8">
            Skills against the curriculum
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b-2 border-sky-soft text-sm text-ink-soft">
                  <th scope="col" className="px-6 py-3 font-bold sm:px-8">Skill</th>
                  <th scope="col" className="py-3 pr-4 font-bold">Tries</th>
                  <th scope="col" className="py-3 pr-4 font-bold">Hints</th>
                  <th scope="col" className="py-3 pr-6 font-bold sm:pr-8">Result</th>
                </tr>
              </thead>
              <tbody>
                {result.records.map((r, i) => (
                  <tr key={i} className="border-b border-sky-soft last:border-0">
                    <td className="px-6 py-4 sm:px-8">
                      <span className="block font-bold">{SKILL_LABEL[r.skill]}</span>
                      <span className="text-sm text-ink-soft">{objective(r.skill, year)}</span>
                    </td>
                    <td className="py-4 pr-4 tabular">{r.attempts}</td>
                    <td className="py-4 pr-4 tabular">{r.hints}</td>
                    <td className="py-4 pr-6 sm:pr-8">
                      <span className={`whitespace-nowrap rounded-md px-2 py-1 text-sm font-bold ${OUTCOME[r.outcome].badge}`}>{OUTCOME[r.outcome].label}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid content-start gap-8">
          <section className="panel p-6 sm:p-8" aria-labelledby="noticed">
            <h2 id="noticed" className="text-xl font-bold">
              What Pip noticed
            </h2>
            {notes.length ? (
              <ul className="mt-4 grid gap-4">
                {notes.map((n) => (
                  <li key={n} className="grid grid-cols-[12px_1fr] gap-3">
                    <span className="mt-2 h-3 w-3 rounded-sm bg-brick-yellow" aria-hidden />
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-ink-soft">No common mistakes spotted in this build.</p>
            )}
          </section>
          <section className="rounded-3xl bg-ink p-6 text-white sm:p-8" aria-labelledby="next">
            <h2 id="next" className="text-xl font-bold">
              Suggested next build
            </h2>
            <p className="mt-2 text-white/85">
              {weakest
                ? `More ${SKILL_LABEL[weakest.skill].toLowerCase()}, written around ${themeById(weakest.theme).label.toLowerCase()}, with hints ready.`
                : `${name} is secure on everything in this build. Next time, Pip will step up the difficulty.`}
            </p>
          </section>
        </div>
      </div>

      <button type="button" className="btn btn-primary mt-10" onClick={onBack}>
        Back to {name}'s builds
      </button>
    </main>
  )
}
