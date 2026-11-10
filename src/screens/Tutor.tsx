import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, BookOpen, Eye, Gem, Lightbulb, SendHorizontal, Sparkles, Trophy, Volume2 } from 'lucide-react'
import { Buddy, Photo, Stars, type Mood } from '../components/art'
import { islandById, type IslandId } from '../data/world'
import { useProfile } from '../data/profile'
import { BuddyDuo, ChildAvatar } from '../components/avatar'
import { STARS, type Star } from '../data/stars'
import { allQuests, findQuest, questQuestions, type QuestDef, type Subject, type TutorQ, type Year } from '../data/syllabus'
import { JOURNEYS } from '../data/journeys'
import { isDone, starsFor, useProgress, worldStats } from '../data/progress'
import { STAGES, stageInfo } from '../data/stages'
import { StageClimb, StageStrip } from '../components/journey'
import { checkAnswer } from '../data/bank'
import { checkEn } from '../data/english/mark'
import { markEnglish } from '../data/ai'
import { ENGLISH_BY_YEAR } from '../data/english'

/* ---------------- confetti ---------------- */

function Confetti({ run }: { run: number }) {
  const colors = ['#FFC93C', '#FF6B57', '#22C58B', '#7C5CFF', '#3E8EF0']
  return (
    <AnimatePresence>
      {run > 0 && (
        <motion.div key={run} className="pointer-events-none fixed inset-0 z-50 overflow-hidden" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 1.4, duration: 0.5 }} aria-hidden>
          {Array.from({ length: 36 }, (_, i) => (
            <motion.span
              key={i}
              className="absolute top-1/3 block h-3 w-2 rounded-sm"
              style={{ left: `${(i * 97) % 100}%`, background: colors[i % colors.length] }}
              initial={{ y: 0, rotate: 0, opacity: 1 }}
              animate={{ y: [0, -140 - (i % 5) * 30, 420], x: ((i % 7) - 3) * 22, rotate: 360 + i * 20 }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ---------------- helpers ---------------- */

const CAST: Partial<Record<IslandId, Star[]>> = STARS
const starIn = (world: IslandId, text: string) => CAST[world]?.find((s) => text.includes(s.name))
const textOf = (t: TutorQ) => (t.kind === 'maths' ? t.q.text : `${t.q.extract ?? ''} ${t.q.prompt}`)
const hintsOf = (t: TutorQ) => t.q.hints
const answerOf = (t: TutorQ) =>
  t.kind === 'maths' ? t.q.answer.toLocaleString('en-GB', { maximumFractionDigits: 3 }) : t.q.kind === 'open' ? (t.q.model ?? '') : t.q.kind === 'text' ? (t.q.accept ?? [])[0]! : (t.q.answer ?? '')

function speak(text: string) {
  try {
    const synth = window.speechSynthesis
    if (!synth) return false
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    const v = synth.getVoices().find((x) => x.lang === 'en-GB') ?? synth.getVoices().find((x) => x.lang.startsWith('en'))
    if (v) u.voice = v
    u.lang = 'en-GB'
    u.rate = 0.85
    synth.speak(u)
    return true
  } catch {
    return false
  }
}

/* ---------------- chat model ---------------- */

type Msg =
  | { id: number; from: 'buddy'; text: string; mood?: Mood }
  | { id: number; from: 'child'; text: string }
  | { id: number; from: 'card'; index: number }
  | { id: number; from: 'hint'; level: number; text: string }
  | { id: number; from: 'next'; index: number }
  | { id: number; from: 'stage'; name: string; blurb: string }
  | { id: number; from: 'done' }

type NewMsg = { [K in Msg['from']]: Omit<Extract<Msg, { from: K }>, 'id'> }[Msg['from']]
let uid = 0
const nextId = () => ++uid

function BuddyBubble({ children, mood = 'happy' }: { children: ReactNode; mood?: Mood }) {
  return (
    <div className="flex items-end gap-2.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-paper shadow-card">
        <Buddy mood={mood} className="h-9 w-9" />
      </span>
      <div className="max-w-[86%] whitespace-pre-line rounded-3xl rounded-bl-lg bg-paper px-4 py-3 text-[1.0625rem] leading-snug shadow-card">{children}</div>
    </div>
  )
}

function Passage({ text }: { text: string }) {
  const [open, setOpen] = useState(text.length < 400)
  const [title, ...rest] = text.split('\n\n')
  const isLong = text.length >= 400
  return (
    <div className="mb-4 rounded-2xl bg-mist p-4 ring-1 ring-inset ring-mist-deep">
      {isLong && (
        <p className="mb-2 flex items-center gap-2 font-display text-lg font-semibold">
          <BookOpen size={18} aria-hidden /> {title}
        </p>
      )}
      <div className={`relative overflow-hidden ${open ? '' : 'max-h-28'}`}>
        <p className="whitespace-pre-line text-[1.0625rem] leading-relaxed">{isLong ? rest.join('\n\n') : text}</p>
        {!open && <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-mist to-transparent" aria-hidden />}
      </div>
      {isLong && (
        <button type="button" onClick={() => setOpen((o) => !o)} className="mt-2 text-sm font-bold text-grape-deep underline underline-offset-4">
          {open ? 'Show less' : 'Read the whole passage'}
        </button>
      )}
    </div>
  )
}

/* ---------------- tutor ---------------- */

export function Tutor({ world, subject, questId, onExit, onQuest }: { world: IslandId; subject: Subject; questId: string; onExit: () => void; onQuest: (q: QuestDef) => void }) {
  const { profile } = useProfile()
  const year = (profile?.year ?? 5) as Year
  const childName = profile?.name ?? 'explorer'
  const island = islandById(world)
  const journey = JOURNEYS[world]
  const quest = findQuest(year, subject, questId)
  const QS = useMemo(() => questQuestions(year, subject, questId, world), [year, subject, questId, world])
  const progress = useProgress()
  const saved = progress.get(world, questId)
  const resumeAt = saved && !isDone(saved) ? Math.min(saved.answered, QS.length - 1) : 0
  const statement = subject === 'english' ? ENGLISH_BY_YEAR[year].find((s) => s.id === quest?.curriculumId)?.text ?? quest?.title ?? '' : quest?.title ?? ''

  const [idx, setIdx] = useState(resumeAt)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [typing, setTyping] = useState(false)
  const [hint, setHint] = useState(0)
  const [misses, setMisses] = useState(0)
  const [solved, setSolved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [value, setValue] = useState('')
  const [confetti, setConfetti] = useState(0)
  const firstTry = useRef(saved && !isDone(saved) ? saved.firstTry : 0)
  const helped = useRef(saved && !isDone(saved) ? saved.helped ?? 0 : 0)
  const team = profile?.team
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null)
  const timers = useRef<number[]>([])
  const cur = QS[idx]
  /** each quest starts at a different photo, then moves to the next photo for every question */
  const photoStart = useMemo(() => [...questId].reduce((a, ch) => a + ch.charCodeAt(0), 0), [questId])
  const nextQuestDef = useMemo(() => {
    const list = allQuests(year, subject).filter((q) => q.playable)
    const i = list.findIndex((q) => q.id === questId)
    return list[i + 1]
  }, [year, subject, questId])

  const say = useCallback((items: NewMsg[], gap = 650) => {
    items.forEach((m, i) => {
      timers.current.push(window.setTimeout(() => setTyping(true), i * gap))
      timers.current.push(
        window.setTimeout(() => {
          setTyping(false)
          setMsgs((c) => [...c, { ...m, id: nextId() } as Msg])
        }, i * gap + gap - 120),
      )
    })
  }, [])

  useEffect(() => {
    const t = timers.current
    if (!QS.length) {
      say([{ from: 'buddy', text: 'These questions are still being made. Try another quest!', mood: 'think' }])
      return () => t.forEach(clearTimeout)
    }
    const hello =
      resumeAt > 0
        ? `Welcome back, ${childName}! Picking up at question ${resumeAt + 1} of ${QS.length}.`
        : `${journey.quest} time, ${childName}! ${QS.length} questions on: ${statement}.`
    say([
      { from: 'buddy', text: hello, mood: 'cheer' },
      { from: 'card', index: resumeAt },
    ])
    return () => t.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [msgs, typing])

  // read spelling words aloud when their card appears
  useEffect(() => {
    const last = msgs[msgs.length - 1]
    if (last?.from === 'card') {
      const q = QS[last.index]
      if (q?.kind === 'english' && q.q.kind === 'spell' && q.q.say) speak(q.q.say)
    }
  }, [msgs, QS])

  const save = (answered: number) => progress.record(world, questId, { answered, firstTry: firstTry.current, helped: helped.current, total: QS.length })

  /** Answering one more question: did that unlock a new stage in this world? */
  const stageUp = (): NewMsg | null => {
    const ws = worldStats(progress.world(world), year)
    const before = stageInfo(world, ws.answered, ws.questions)
    const after = stageInfo(world, ws.answered + 1, ws.questions)
    return after.index > before.index ? { from: 'stage', name: after.stage.name, blurb: after.stage.blurb } : null
  }

  /** What Nova says for a right answer, in the world's own language. */
  const cheerFor = (clean: boolean) => {
    const ws = worldStats(progress.world(world), year)
    const next = stageInfo(world, ws.answered + 1, ws.questions).next
    if (world === 'football') {
      const side = team ?? 'your team'
      return clean
        ? `GOAL! ${childName} scores for ${side}! That’s goal number ${ws.firstTry + 1} this season. +3 points.`
        : `Assist! ${childName} sets it up and ${side} score. +3 points.`
    }
    if (world === 'wrestling') return `${journey.cheer[idx % journey.cheer.length]} ${next ? `One step closer to the ${next.name}.` : 'Still the champion!'}`
    return journey.cheer[idx % journey.cheer.length]!
  }

  const win = (text: string, extra?: string) => {
    if (!cur) return
    const clean = hint === 0 && misses === 0
    if (clean) firstTry.current += 1
    else helped.current += 1
    const up = stageUp()
    const cheer = cheerFor(clean)
    setSolved(true)
    setConfetti((k) => k + 1)
    save(idx + 1)
    const last = idx === QS.length - 1
    say([
      { from: 'buddy', text: `${cheer} ${text}${clean && world !== 'football' ? ' First try, no hints!' : ''}${extra ? `\n${extra}` : ''}`, mood: 'cheer' },
      ...(up ? [up] : []),
      last ? { from: 'done' } : { from: 'next', index: idx },
    ])
  }

  const giveHint = () => {
    if (solved || !cur || hint >= 3) return
    const level = hint + 1
    setHint(level)
    setMsgs((c) => [...c, { id: nextId(), from: 'child', text: hint === 0 ? 'Can I have a hint?' : 'Another hint, please' }])
    say([{ from: 'hint', level, text: hintsOf(cur)[level - 1]! }])
  }

  const reveal = () => {
    if (solved || !cur) return
    setMsgs((c) => [...c, { id: nextId(), from: 'child', text: 'Show me the answer' }])
    const up = stageUp()
    setSolved(true)
    save(idx + 1)
    const ans = answerOf(cur)
    const why = cur.kind === 'english' ? cur.q.explain : cur.q.hints[2]
    say([
      { from: 'buddy', text: cur.kind === 'english' && cur.q.kind === 'open' ? `Here’s one way to answer:\n“${ans}”` : `The answer is ${ans}. ${why}`, mood: 'think' },
      ...(up ? [up] : []),
      idx === QS.length - 1 ? { from: 'done' } : { from: 'next', index: idx },
    ])
  }

  const miss = (message?: string) => {
    setMisses((m) => m + 1)
    say([{ from: 'buddy', text: message ?? 'Not quite yet. Have another look.', mood: 'think' }])
    if (hint === 0 && cur) {
      setHint(1)
      say([{ from: 'hint', level: 1, text: hintsOf(cur)[0]! }], 1300)
    }
  }

  const askAI = async (answer: string) => {
    if (!cur || cur.kind !== 'english') return
    setBusy(true)
    setTyping(true)
    try {
      const r = await markEnglish(cur.q, statement, answer)
      setTyping(false)
      if (r.verdict === 'correct') win(r.feedback, r.tip || undefined)
      else miss(`${r.feedback}${r.tip ? `\nTip: ${r.tip}` : ''}`)
    } catch {
      setTyping(false)
      if (cur.q.kind === 'open') {
        // marking helper offline: show the example answer and move on
        setSolved(true)
        save(idx + 1)
        say([
          { from: 'buddy', text: `My marking helper is offline right now, so here’s an example to compare with yours:\n“${cur.q.model}”`, mood: 'think' },
          idx === QS.length - 1 ? { from: 'done' } : { from: 'next', index: idx },
        ])
      } else miss()
    } finally {
      setBusy(false)
    }
  }

  const submit = (raw: string) => {
    if (solved || busy || !cur) return
    const a = raw.trim()
    if (!a) {
      inputRef.current?.focus()
      return
    }
    setValue('')
    setMsgs((c) => [...c, { id: nextId(), from: 'child', text: a }])
    if (cur.kind === 'maths') {
      const r = checkAnswer(cur.q, a)
      if (!r.valid) return miss('That doesn’t look like a number. Type just the number, for example 42 or 7.5.')
      if (r.correct) return win(`${answerOf(cur)} is right.`)
      return miss(r.message)
    }
    const r = checkEn(cur.q, a)
    if (r.correct) return win(cur.q.explain)
    if (r.askAI) return void askAI(a)
    return miss(r.message)
  }

  const onForm = (e: FormEvent) => {
    e.preventDefault()
    submit(value)
  }

  const goNext = () => {
    const ni = idx + 1
    setIdx(ni)
    setHint(0)
    setMisses(0)
    setSolved(false)
    say([{ from: 'card', index: ni }], 400)
  }

  const isSpell = cur?.kind === 'english' && cur.q.kind === 'spell'
  const isChoice = cur?.kind === 'english' && cur.q.kind === 'choice'
  const isOpen = cur?.kind === 'english' && cur.q.kind === 'open'
  const canReveal = hint >= 3 || misses >= 2
  const chips = [
    ...(isSpell && cur?.kind === 'english' ? [{ label: 'Hear it again', icon: Volume2, on: () => speak(cur.q.say ?? ''), disabled: false }] : []),
    { label: hint === 0 ? 'Give me a hint' : hint < 3 ? 'Another hint' : 'All hints used', icon: Lightbulb, on: giveHint, disabled: hint >= 3 },
    { label: isOpen ? 'Show me an example' : 'Show me the answer', icon: Eye, on: reveal, disabled: !canReveal },
  ]
  const finalP = progress.get(world, questId)
  const total = QS.length
  // live stage position: moves after every answer
  const liveStats = worldStats(progress.world(world), year)
  const live = stageInfo(world, liveStats.answered, liveStats.questions)
  const me = <ChildAvatar data={profile?.avatar} className="h-full w-full" />

  return (
    <div className="flex h-dvh flex-col bg-mist lg:h-auto lg:min-h-dvh">
      <Confetti run={confetti} />
      <header className="z-20 bg-night text-white" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="mx-auto flex h-16 w-full max-w-[1160px] items-center gap-3 px-3 sm:px-6">
          <button type="button" onClick={onExit} className="grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-white/10" aria-label="Back to your world">
            <ArrowLeft size={24} aria-hidden />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-semibold leading-tight">
              {island.name} · {journey.quest} {Math.max(1, allQuests(year, subject).findIndex((q) => q.id === questId) + 1)}
            </p>
            <div className="mt-1.5 h-1.5 max-w-[260px] overflow-hidden rounded-full bg-white/20" aria-label={`${Math.min(idx + (solved ? 1 : 0), total)} of ${total} questions done`}>
              <motion.div className="h-full rounded-full bg-mint" animate={{ width: `${total ? ((idx + (solved ? 1 : 0)) / total) * 100 : 0}%` }} />
            </div>
          </div>
          <motion.span key={progress.gems} initial={{ scale: 1.25 }} animate={{ scale: 1 }} className="chip shrink-0 bg-white/10 text-white ring-1 ring-inset ring-white/15">
            <Gem size={16} className="text-sea-soft" aria-hidden /> <span className="tabular">{progress.gems}</span>
          </motion.span>
        </div>
        <StageStrip world={world} info={live} avatar={me} />
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-[1160px] flex-1 gap-6 lg:px-6 lg:py-6">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col lg:rounded-4xl lg:bg-[#E6E9F8]" aria-label={`Chat with Nova: ${island.name}`}>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-6" aria-live="polite">
            <div className="mx-auto grid max-w-[680px] gap-4">
              {msgs.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
                  {m.from === 'buddy' && <BuddyBubble mood={m.mood}>{m.text}</BuddyBubble>}
                  {m.from === 'child' && (
                    <div className="flex items-end justify-end gap-2.5">
                      <div className="max-w-[78%] whitespace-pre-line break-words rounded-3xl rounded-br-lg bg-grape px-4 py-3 font-bold text-white shadow-card">{m.text}</div>
                      <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full shadow-card">
                        <ChildAvatar data={profile?.avatar} className="h-10 w-10" />
                      </span>
                    </div>
                  )}
                  {m.from === 'hint' && (
                    <div className="ml-12 rounded-3xl bg-sun-soft p-4 ring-2 ring-inset ring-sun">
                      <p className="mb-1 flex items-center gap-2 text-sm font-bold text-ink">
                        <Lightbulb size={16} aria-hidden /> Hint {m.level} of 3
                      </p>
                      <p className="text-[1.0625rem] leading-snug">{m.text}</p>
                    </div>
                  )}
                  {m.from === 'card' && QS[m.index] && <QuestionCard t={QS[m.index]!} n={m.index} total={total} world={world} year={year} subject={subject} statement={statement} photo={photoStart + m.index} />}
                  {m.from === 'next' && (
                    <div className="flex flex-wrap gap-3 pl-12">
                      <button type="button" className="btn btn-sun flex-1 whitespace-nowrap px-4 text-base" onClick={goNext} disabled={idx !== m.index}>
                        Next question
                      </button>
                      <button type="button" className="btn btn-ghost flex-1 whitespace-nowrap px-4 text-base" onClick={onExit}>
                        Save and exit
                      </button>
                    </div>
                  )}
                  {m.from === 'stage' && (
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="overflow-hidden rounded-4xl bg-gradient-to-br from-sun to-coral p-5 text-ink shadow-pop">
                      <p className="text-sm font-bold uppercase tracking-wide">New stage unlocked · {STAGES[world].title}</p>
                      <p className="mt-1 font-display text-2xl font-semibold">{m.name}</p>
                      <p>{m.blurb}</p>
                    </motion.div>
                  )}
                  {m.from === 'done' && (
                    <div className="rounded-4xl bg-night p-5 text-white shadow-pop">
                      <div className="flex items-center gap-4">
                        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sun text-ink">
                          <Trophy size={28} aria-hidden />
                        </span>
                        <div>
                          <p className="font-display text-xl font-semibold">{journey.win}</p>
                          <p className="text-white/80">
                            {finalP?.firstTry ?? 0} of {total} first try. <Stars n={starsFor(finalP)} />
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {nextQuestDef && (
                          <button type="button" className="btn btn-sun flex-1 whitespace-nowrap px-4 text-base" onClick={() => onQuest(nextQuestDef)}>
                            Next {journey.quest.toLowerCase()}
                          </button>
                        )}
                        <button type="button" className="btn flex-1 whitespace-nowrap bg-white/10 px-4 text-base text-white ring-1 ring-inset ring-white/20 hover:bg-white/15" onClick={onExit}>
                          Back to {island.name}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              {typing && (
                <div className="flex items-end gap-2.5" aria-label="Nova is typing">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-paper shadow-card">
                    <Buddy mood="think" className="h-9 w-9" />
                  </span>
                  <div className="flex gap-1.5 rounded-3xl rounded-bl-lg bg-paper px-4 py-4 shadow-card">
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} className="h-2 w-2 rounded-full bg-ink-faint" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          {/* composer */}
          <div className="border-t border-mist-deep bg-paper/95 px-3 pt-3 backdrop-blur sm:px-6 lg:rounded-b-4xl" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))' }}>
            <div className="mx-auto max-w-[680px]">
              <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1">
                {chips.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={c.on}
                    disabled={c.disabled || solved || busy || !cur}
                    className="flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full bg-mist px-3.5 text-sm font-bold text-ink ring-1 ring-inset ring-mist-deep transition-colors hover:bg-mist-deep disabled:opacity-45"
                  >
                    <c.icon size={16} aria-hidden /> {c.label}
                  </button>
                ))}
              </div>
              {isChoice && cur?.kind === 'english' && !solved ? (
                <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Choose an answer">
                  {(cur.q.options ?? []).map((o) => (
                    <button key={o} type="button" onClick={() => submit(o)} disabled={busy} className="min-h-[54px] whitespace-pre-line rounded-2xl bg-paper px-4 py-3 text-left text-[1.0625rem] font-bold text-ink ring-2 ring-inset ring-mist-deep transition-colors hover:bg-grape-soft hover:ring-grape">
                      {o}
                    </button>
                  ))}
                </div>
              ) : (
                <form onSubmit={onForm} className="flex items-end gap-2">
                  <label htmlFor="answer" className="sr-only">
                    Your answer
                  </label>
                  {cur?.kind === 'maths' && !solved && (
                    <button
                      type="button"
                      onClick={() => setValue((v) => (v.startsWith('-') ? v.slice(1) : `-${v}`))}
                      className="grid min-h-[54px] w-14 shrink-0 place-items-center rounded-2xl bg-mist font-sans text-lg font-bold ring-1 ring-inset ring-mist-deep"
                      aria-label="Make the number negative or positive"
                    >
                      +/−
                    </button>
                  )}
                  {isOpen ? (
                    <textarea
                      id="answer"
                      ref={inputRef}
                      value={value}
                      onChange={(e) => setValue(e.target.value.slice(0, 1200))}
                      rows={3}
                      disabled={solved || busy || !cur}
                      placeholder={solved ? 'Done! Tap Next question above' : busy ? 'Nova is reading your answer…' : 'Write your answer here'}
                      className="min-h-[96px] min-w-0 flex-1 resize-none rounded-2xl border-2 border-mist-deep bg-paper px-4 py-3 text-lg text-ink placeholder:text-ink-faint focus:border-grape focus:outline-none disabled:bg-mist"
                    />
                  ) : (
                    <input
                      id="answer"
                      ref={inputRef}
                      value={value}
                      onChange={(e) => setValue(e.target.value.slice(0, cur?.kind === 'maths' ? 14 : 240))}
                      inputMode={cur?.kind === 'maths' ? 'decimal' : 'text'}
                      autoComplete="off"
                      autoCapitalize={isSpell ? 'none' : 'sentences'}
                      autoCorrect="off"
                      spellCheck={false}
                      disabled={solved || busy || !cur}
                      placeholder={solved ? (idx === total - 1 ? 'Quest complete!' : 'Solved! Tap Next question above') : isSpell ? 'Type the word you hear' : cur?.kind === 'maths' ? 'Type your answer' : 'Type your answer'}
                      className="min-h-[54px] min-w-0 flex-1 rounded-2xl border-2 border-mist-deep bg-paper px-4 text-lg font-bold text-ink placeholder:font-normal placeholder:text-ink-faint focus:border-grape focus:outline-none disabled:bg-mist"
                    />
                  )}
                  <button type="submit" disabled={solved || busy || !cur} className="btn btn-grape min-h-[54px] px-4 sm:px-5" aria-label="Check my answer">
                    <SendHorizontal size={20} aria-hidden />
                    <span className="hidden sm:inline">{isOpen ? 'Send' : 'Check'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        <aside className="hidden w-[300px] shrink-0 flex-col gap-5 lg:flex" aria-label="Your stage">
          <StageClimb world={world} info={live} avatar={me} />
          <div className="card flex items-center gap-4 p-4">
            <BuddyDuo data={profile?.avatar} mood={solved ? 'cheer' : hint > 0 ? 'think' : 'happy'} name={childName} />
            <p className="text-sm text-ink-soft">{solved ? 'You did it!' : busy ? 'Reading your answer…' : hint > 0 ? 'Thinking it through with you.' : 'Stuck? Tap “Give me a hint”.'}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function QuestionCard({ t, n, total, world, year, subject, statement, photo }: { t: TutorQ; n: number; total: number; world: IslandId; year: number; subject: Subject; statement: string; photo: number }) {
  const journey = JOURNEYS[world]
  const island = islandById(world)
  const star = starIn(world, textOf(t))
  const level = t.q.level
  return (
    <article className="overflow-hidden rounded-4xl bg-paper shadow-pop">
      <div className="relative">
        <Photo island={world} n={photo} credit alt={`${island.name} photo`} className="h-40 sm:h-52" />
        <div className="absolute inset-0 bg-gradient-to-t from-night-deep/80 to-transparent" aria-hidden />
        <span className="chip absolute bottom-3 left-4 bg-sun text-ink">
          <Sparkles size={14} aria-hidden /> {journey.leadIn(n)} · {n + 1} of {total}
        </span>
        <span className="chip absolute bottom-3 right-4 bg-white/90 text-ink" aria-label={`Level ${level} of 3`}>
          {'●'.repeat(level)}
          <span className="text-ink-faint">{'●'.repeat(3 - level)}</span>
        </span>
      </div>
      <div className="p-5">
        {star && (
          <p className="mb-3 flex items-center gap-2.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-night font-display text-sm font-semibold text-sun">
              {star.name
                .split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)}
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block font-display font-semibold">
                {star.name}
                {star.nickname && <span className="font-sans font-normal text-ink-soft"> “{star.nickname}”</span>}
              </span>
              <span className="block text-sm text-ink-soft">{star.role}</span>
            </span>
          </p>
        )}
        {t.kind === 'maths' ? (
          <p className="font-display text-xl font-semibold leading-snug sm:text-2xl">{t.q.text}</p>
        ) : (
          <>
            {t.q.extract && t.q.kind !== 'spell' && <Passage text={t.q.extract} />}
            {t.q.kind === 'spell' && (
              <p className="mb-3 rounded-2xl bg-mist p-4 text-center font-display text-2xl font-semibold tracking-wide">{t.q.extract}</p>
            )}
            <p className="font-display text-xl font-semibold leading-snug sm:text-2xl">{t.q.prompt}</p>
          </>
        )}
        <p className="mt-3 text-sm text-ink-soft">
          Year {year} {subject}: {statement}
        </p>
      </div>
    </article>
  )
}
