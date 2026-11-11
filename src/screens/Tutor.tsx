import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, BookOpen, Eye, Gem, Lightbulb, SendHorizontal, Sparkles, Star as StarIcon, Trophy, Volume2 } from 'lucide-react'
import { Buddy, Photo, type Mood } from '../components/art'
import { Sparkle } from '../components/scene'
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
import { fmtPoint, type Pt } from '../data/bank/diagram'
import { Diagram } from '../components/Diagram'
import { checkEn } from '../data/english/mark'
import { markEnglish } from '../data/ai'
import { ENGLISH_BY_YEAR } from '../data/english'

/* ---------------- confetti ---------------- */

function Confetti({ run }: { run: number }) {
  const colors = ['#FFC93C', '#FF6B57', '#22C58B', '#7C5CFF', '#3E8EF0', '#FF5FA2']
  return (
    <AnimatePresence>
      {run > 0 && (
        <motion.div key={run} className="pointer-events-none fixed inset-0 z-50 overflow-hidden" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 1.5, duration: 0.5 }} aria-hidden>
          {Array.from({ length: 44 }, (_, i) => {
            const shape = i % 4
            return (
              <motion.span
                key={i}
                className={`absolute top-[38%] block ${shape === 0 ? 'h-3 w-3 rounded-full' : shape === 1 ? 'h-4 w-2 rounded-sm' : shape === 2 ? 'h-2.5 w-2.5 rotate-45 rounded-[2px]' : 'h-5 w-5'}`}
                style={{ left: `${(i * 97) % 100}%`, background: shape === 3 ? undefined : colors[i % colors.length] }}
                initial={{ y: 0, rotate: 0, opacity: 1, scale: 0.4 }}
                animate={{ y: [0, -170 - (i % 5) * 36, 460], x: ((i % 9) - 4) * 26, rotate: 360 + i * 24, scale: 1 }}
                transition={{ duration: 1.7, ease: 'easeOut', delay: (i % 6) * 0.02 }}
              >
                {shape === 3 && <Sparkle className="h-5 w-5" color={colors[i % colors.length]} />}
              </motion.span>
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Big stars for the quest-complete card: they pop in one by one. */
function BigStars({ n }: { n: number }) {
  return (
    <span className="flex items-end justify-center gap-2" role="img" aria-label={`${n} of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <motion.span key={i} initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 14, delay: 0.25 + i * 0.22 }} className={i === 1 ? '-translate-y-2' : ''}>
          <StarIcon size={i === 1 ? 60 : 48} strokeWidth={1.8} className={i < n ? 'fill-sun text-[#C98F00] drop-shadow-[0_4px_0_rgba(0,0,0,0.25)]' : 'fill-white/10 text-white/35'} aria-hidden />
        </motion.span>
      ))}
    </span>
  )
}

/* ---------------- helpers ---------------- */

/** answer tiles: a colour and a letter each, so they are easy to tell apart and to talk about */
const CAST: Partial<Record<IslandId, Star[]>> = STARS
const starIn = (world: IslandId, text: string) => CAST[world]?.find((s) => text.includes(s.name))
const textOf = (t: TutorQ) => (t.kind === 'maths' ? t.q.text : `${t.q.extract ?? ''} ${t.q.prompt}`)
const hintsOf = (t: TutorQ) => t.q.hints
const answerOf = (t: TutorQ) =>
  t.kind === 'maths'
    ? t.q.choices
      ? t.q.choices[t.q.answer]!
      : t.q.pick
        ? fmtPoint(t.q.answer)
        : t.q.answer.toLocaleString('en-GB', { maximumFractionDigits: 3 }) : t.q.kind === 'open' ? (t.q.model ?? '') : t.q.kind === 'text' ? (t.q.accept ?? [])[0]! : (t.q.answer ?? '')

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
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#FFE7C2] shadow-[inset_0_0_0_2.5px_#fff,0_3px_0_rgba(23,21,58,0.14)]">
        <Buddy mood={mood} className="h-10 w-10" />
      </span>
      <div className="max-w-[84%] whitespace-pre-line rounded-3xl rounded-bl-lg bg-paper px-4 py-3 text-[1.0625rem] leading-snug shadow-card">{children}</div>
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
  /** tap-the-grid answer for the current question */
  const [picked, setPicked] = useState<Pt | null>(null)
  const [confetti, setConfetti] = useState(0)
  const [gain, setGain] = useState({ k: 0, n: 0 })
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
  /** one row in the answer log per finished question (signed-in families only) */
  const logAnswer = (outcome: 'first_try' | 'helped' | 'shown') =>
    progress.log({ world, subject, questId, curriculumId: quest?.curriculumId ?? questId, outcome, hints: hint })

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
    setGain((g) => ({ k: g.k + 1, n: clean ? 15 : 10 }))
    save(idx + 1)
    logAnswer(clean ? 'first_try' : 'helped')
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
    logAnswer('shown')
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
        logAnswer('shown')
        say([
          { from: 'buddy', text: `My marking helper is offline right now, so here’s an example to compare with yours:\n“${cur.q.model}”`, mood: 'think' },
          idx === QS.length - 1 ? { from: 'done' } : { from: 'next', index: idx },
        ])
      } else miss()
    } finally {
      setBusy(false)
    }
  }

  const submit = (raw: string, shown?: string) => {
    if (solved || busy || !cur) return
    const a = raw.trim()
    if (!a) {
      if (cur.kind === 'maths' && cur.q.pick) return miss('Tap a point on the grid first, then press Check.')
      inputRef.current?.focus()
      return
    }
    setValue('')
    setPicked(null)
    setMsgs((c) => [...c, { id: nextId(), from: 'child', text: shown ?? (cur.kind === 'maths' && cur.q.pick ? `(${a.replace(/[()\s]/g, '').replace(',', ', ')})` : a) }])
    if (cur.kind === 'maths') {
      const r = checkAnswer(cur.q, a)
      if (!r.valid) return miss(cur.q.pick ? 'Tap a point on the grid, or type the coordinates like 3, 5.' : 'That doesn’t look like a number. Type just the number, for example 42 or 7.5.')
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
    setPicked(null)
    setValue('')
    setHint(0)
    setMisses(0)
    setSolved(false)
    say([{ from: 'card', index: ni }], 400)
  }

  const isSpell = cur?.kind === 'english' && cur.q.kind === 'spell'
  const isChoice = (cur?.kind === 'english' && cur.q.kind === 'choice') || (cur?.kind === 'maths' && !!cur.q.choices)
  const choiceList = cur?.kind === 'maths' ? (cur.q.choices ?? []) : cur?.kind === 'english' ? (cur.q.options ?? []) : []
  const isPick = cur?.kind === 'maths' && !!cur.q.pick
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
    <div className="relative flex h-dvh flex-col lg:h-auto lg:min-h-dvh">
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: `linear-gradient(180deg, ${island.tint[0]}33 0%, ${island.tint[0]}10 60%, transparent 100%)` }} aria-hidden />
      <Confetti run={confetti} />
      <header className="relative z-20 overflow-hidden text-white shadow-[0_5px_0_rgba(20,18,56,0.18)] lg:mx-4 lg:mt-4 lg:rounded-[30px]" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', background: `linear-gradient(120deg, #1E1B4F 0%, #2B1F86 45%, ${island.tint[1]} 100%)` }}>
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          {Array.from({ length: 12 }, (_, i) => (
            <circle key={i} className="twinkle" style={{ animationDelay: `${i * 0.4}s` }} cx={`${(i * 43 + 7) % 100}%`} cy={`${(i * 31 + 12) % 100}%`} r={(i % 2) + 0.8} fill="#fff" />
          ))}
        </svg>
        <div className="relative mx-auto flex h-[68px] w-full max-w-[1160px] items-center gap-3 px-3 sm:px-6">
          <button type="button" onClick={onExit} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15 shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.25)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5" aria-label="Back to your world">
            <ArrowLeft size={24} aria-hidden />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-semibold leading-tight">
              {island.name} · {journey.quest} {Math.max(1, allQuests(year, subject).findIndex((q) => q.id === questId) + 1)}
            </p>
            {/* one pip per question; long quests fall back to a bar */}
            {total > 0 && total <= 14 ? (
              <div className="mt-1.5 flex max-w-[280px] gap-1" role="img" aria-label={`${Math.min(idx + (solved ? 1 : 0), total)} of ${total} questions done`}>
                {Array.from({ length: total }, (_, i) => {
                  const d = i < idx + (solved ? 1 : 0)
                  return <motion.span key={i} className={`h-2 flex-1 rounded-full ${d ? 'bg-sun' : i === idx ? 'bg-white/70' : 'bg-white/25'}`} animate={d ? { scale: [1, 1.5, 1] } : { scale: 1 }} transition={{ duration: 0.4 }} />
                })}
              </div>
            ) : (
              <div className="mt-1.5 h-2 max-w-[280px] overflow-hidden rounded-full bg-white/25" role="img" aria-label={`${Math.min(idx + (solved ? 1 : 0), total)} of ${total} questions done`}>
                <motion.div className="h-full rounded-full bg-sun" animate={{ width: `${total ? ((idx + (solved ? 1 : 0)) / total) * 100 : 0}%` }} />
              </div>
            )}
          </div>
          <span className="relative shrink-0">
            <motion.span key={progress.gems} initial={{ scale: 1.3 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 12 }} className="hud">
              <span className="hud-icon bg-sea">
                <Gem size={17} className="fill-sea-soft text-white" aria-hidden />
              </span>
              <span className="tabular">{progress.gems}</span>
            </motion.span>
            <AnimatePresence>
              {gain.k > 0 && (
                <motion.span key={gain.k} className="pointer-events-none absolute right-1 top-full font-display text-xl font-bold text-sun title-pop" initial={{ opacity: 0, y: 26, scale: 0.6 }} animate={{ opacity: [0, 1, 1, 0], y: [26, 6, 0, -14], scale: 1 }} transition={{ duration: 1.5, times: [0, 0.2, 0.7, 1] }} aria-hidden>
                  +{gain.n}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </div>
        <StageStrip world={world} info={live} avatar={me} />
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-[1160px] flex-1 gap-6 lg:px-6 lg:py-6">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col lg:overflow-hidden lg:rounded-4xl lg:bg-white/55 lg:shadow-card" aria-label={`Chat with Nova: ${island.name}`}>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-6" aria-live="polite">
            <div className="mx-auto grid max-w-[680px] gap-4">
              {msgs.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
                  {m.from === 'buddy' && <BuddyBubble mood={m.mood}>{m.text}</BuddyBubble>}
                  {m.from === 'child' && (
                    <div className="flex items-end justify-end gap-2.5">
                      <div className="max-w-[78%] whitespace-pre-line break-words rounded-3xl rounded-br-lg px-4 py-3 text-[1.0625rem] font-bold text-white" style={{ background: 'linear-gradient(180deg,#8567FF,#6541EE)', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.25), 0 4px 0 #4A2DC4' }}>{m.text}</div>
                      <span className="h-12 w-12 shrink-0 overflow-hidden rounded-full shadow-[inset_0_0_0_2.5px_#fff,0_3px_0_rgba(23,21,58,0.14)] ring-[2.5px] ring-white">
                        <ChildAvatar data={profile?.avatar} className="h-12 w-12" />
                      </span>
                    </div>
                  )}
                  {m.from === 'hint' && (
                    <div className="ml-14 flex gap-3 rounded-3xl p-4" style={{ background: 'linear-gradient(135deg,#FFF6D6,#FFEBB0)', boxShadow: 'inset 0 0 0 2.5px #FFC93C, 0 4px 0 #E8A900' }}>
                      <motion.span initial={{ rotate: -20, scale: 0.6 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 12 }} className="tile h-11 w-11 !text-ink" style={{ background: 'linear-gradient(180deg,#FFE27A,#FFBE2B)' }}>
                        <Lightbulb size={22} aria-hidden />
                      </motion.span>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 text-sm font-bold text-ink">
                          Hint {m.level} of 3
                          <span className="flex gap-1" aria-hidden>
                            {[1, 2, 3].map((l) => (
                              <span key={l} className={`h-2 w-5 rounded-full ${l <= m.level ? 'bg-[#C98F00]' : 'bg-[#C98F00]/25'}`} />
                            ))}
                          </span>
                        </p>
                        <p className="mt-0.5 text-[1.0625rem] leading-snug">{m.text}</p>
                      </div>
                    </div>
                  )}
                  {m.from === 'card' && QS[m.index] && <QuestionCard t={QS[m.index]!} n={m.index} total={total} world={world} year={year} subject={subject} statement={statement} photo={photoStart + m.index} picked={m.index === idx && !solved ? picked : null} onPick={m.index === idx && !solved ? (p) => { setPicked(p); setValue(`${p[0]},${p[1]}`) } : undefined} />}
                  {m.from === 'next' && (
                    <div className="flex flex-wrap gap-3 pl-14">
                      <button type="button" className={`btn btn-sun flex-1 basis-full whitespace-nowrap px-4 sm:basis-0 ${idx === m.index ? 'sheen' : ''}`} onClick={goNext} disabled={idx !== m.index}>
                        Next question <ArrowRight size={20} strokeWidth={3} aria-hidden />
                      </button>
                      <button type="button" className="btn btn-ghost flex-1 whitespace-nowrap px-4 text-base" onClick={onExit}>
                        Save and exit
                      </button>
                    </div>
                  )}
                  {m.from === 'stage' && (
                    <motion.div initial={{ scale: 0.8, rotate: -2 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} className="sheen relative flex items-center gap-4 overflow-hidden rounded-4xl p-5 text-ink" style={{ background: 'linear-gradient(135deg,#FFE27A 0%,#FFB81F 55%,#FF8A5C 100%)', boxShadow: 'inset 0 3px 0 rgba(255,255,255,0.55), 0 7px 0 #C96A1E' }}>
                      <span className="float grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white/60 shadow-[inset_0_0_0_3px_#fff]">
                        <Trophy size={32} aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold uppercase tracking-wide">New stage unlocked · {STAGES[world].title}</p>
                        <p className="font-display text-2xl font-semibold leading-tight">{m.name}</p>
                        <p>{m.blurb}</p>
                      </div>
                      <Sparkle className="twinkle absolute right-4 top-3 h-6 w-6" color="#fff" />
                    </motion.div>
                  )}
                  {m.from === 'done' && (
                    <div className="relative overflow-hidden rounded-4xl p-6 text-center text-white" style={{ background: `linear-gradient(150deg, #2B1F86 0%, #1E1B4F 45%, ${island.tint[1]} 100%)`, boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.18), 0 7px 0 #100D38' }}>
                      <Sparkle className="twinkle absolute left-5 top-5 h-5 w-5" />
                      <Sparkle className="twinkle absolute right-6 top-9 h-7 w-7" color="#FF8EBB" />
                      <Sparkle className="twinkle absolute bottom-24 left-9 h-4 w-4" color="#8AD4FF" />
                      <BigStars n={starsFor(finalP)} />
                      <p className="title-pop mt-2 font-display text-[1.7rem] font-semibold leading-tight">{journey.win}</p>
                      <p className="text-white/90">
                        {finalP?.firstTry ?? 0} of {total} right first try
                      </p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        {nextQuestDef && (
                          <button type="button" className="btn btn-sun sheen flex-1 whitespace-nowrap px-4" onClick={() => onQuest(nextQuestDef)}>
                            Next {journey.quest.toLowerCase()} <ArrowRight size={20} strokeWidth={3} aria-hidden />
                          </button>
                        )}
                        <button type="button" className="btn flex-1 whitespace-nowrap bg-white/15 px-4 text-base text-white shadow-[inset_0_0_0_2px_rgba(255,255,255,0.3),0_5px_0_rgba(10,8,40,0.45)]" onClick={onExit}>
                          Back to {island.name}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              {typing && (
                <div className="flex items-end gap-2.5" aria-label="Nova is typing">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[#FFE7C2] shadow-[inset_0_0_0_2.5px_#fff,0_3px_0_rgba(23,21,58,0.14)]">
                    <Buddy mood="think" className="h-10 w-10" />
                  </span>
                  <div className="flex gap-1.5 rounded-3xl rounded-bl-lg bg-paper px-4 py-4 shadow-card">
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} className={`h-2.5 w-2.5 rounded-full ${['bg-grape', 'bg-rose', 'bg-sun-deep'][i]}`} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          {/* composer */}
          <div className="rounded-t-[28px] bg-paper px-3 pt-3 shadow-[0_-2px_0_rgba(23,21,58,0.06),0_-14px_30px_-18px_rgba(23,21,58,0.35)] sm:px-6 lg:rounded-none" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))' }}>
            <div className="mx-auto max-w-[680px]">
              <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1">
                {chips.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={c.on}
                    disabled={c.disabled || solved || busy || !cur}
                    className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full bg-sun-soft px-4 text-sm font-bold text-ink shadow-[inset_0_0_0_2px_#FFD86B,0_3px_0_#E8C55A] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 disabled:bg-mist disabled:opacity-50 disabled:shadow-[inset_0_0_0_2px_#DCE0F5]"
                  >
                    <c.icon size={17} aria-hidden /> {c.label}
                  </button>
                ))}
              </div>
              {isChoice && !solved ? (
                <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Choose an answer">
                  {choiceList.map((o, oi) => (
                    <motion.button
                      key={o}
                      type="button"
                      onClick={() => (cur?.kind === 'maths' ? submit(String(oi), o) : submit(o))}
                      disabled={busy}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: oi * 0.05 }}
                      whileTap={{ y: 3 }}
                      className="min-h-[58px] whitespace-pre-line rounded-[20px] bg-paper px-4 py-3 text-left text-[1.0625rem] font-bold text-ink ring-2 ring-inset ring-mist-deep transition-colors hover:bg-grape-soft hover:ring-grape"
                    >
                      {o}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <form onSubmit={onForm} className="flex items-end gap-2">
                  <label htmlFor="answer" className="sr-only">
                    Your answer
                  </label>
                  {cur?.kind === 'maths' && !solved && !isPick && (
                    <button
                      type="button"
                      onClick={() => setValue((v) => (v.startsWith('-') ? v.slice(1) : `-${v}`))}
                      className="grid min-h-[58px] w-14 shrink-0 place-items-center rounded-[20px] bg-paper font-sans text-lg font-bold shadow-[inset_0_0_0_2px_#DCE0F5,0_4px_0_#CDD2EE] active:translate-y-0.5"
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
                      className="min-h-[96px] min-w-0 flex-1 resize-none rounded-[20px] border-[2.5px] border-[#CFD4F0] bg-[#F8F9FF] px-4 py-3 text-lg text-ink placeholder:text-ink-soft focus:border-grape focus:bg-paper focus:shadow-[0_0_0_4px_rgba(124,92,255,0.2)] focus:outline-none disabled:bg-mist"
                    />
                  ) : (
                    <input
                      id="answer"
                      ref={inputRef}
                      value={value}
                      onChange={(e) => setValue(e.target.value.slice(0, cur?.kind === 'maths' ? 14 : 240))}
                      inputMode={isPick ? 'none' : cur?.kind === 'maths' ? 'decimal' : 'text'}
                      readOnly={isPick}
                      autoComplete="off"
                      autoCapitalize={isSpell ? 'none' : 'sentences'}
                      autoCorrect="off"
                      spellCheck={false}
                      disabled={solved || busy || !cur}
                      placeholder={solved ? (idx === total - 1 ? 'Quest complete!' : 'Solved! Tap Next question above') : isSpell ? 'Type the word you hear' : isPick ? 'Tap the grid above' : 'Type your answer'}
                      className="min-h-[58px] min-w-0 flex-1 rounded-[20px] border-[2.5px] border-[#CFD4F0] bg-[#F8F9FF] px-4 font-display text-xl font-semibold text-ink placeholder:font-sans placeholder:text-lg placeholder:font-normal placeholder:text-ink-soft focus:border-grape focus:bg-paper focus:shadow-[0_0_0_4px_rgba(124,92,255,0.2)] focus:outline-none disabled:bg-mist"
                    />
                  )}
                  <button type="submit" disabled={solved || busy || !cur} className="btn btn-grape min-h-[58px] px-4 sm:px-5" aria-label="Check my answer">
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

function QuestionCard({ t, n, total, world, year, subject, statement, photo, picked, onPick }: { t: TutorQ; n: number; total: number; world: IslandId; year: number; subject: Subject; statement: string; photo: number; picked?: Pt | null; onPick?: (p: Pt) => void }) {
  const journey = JOURNEYS[world]
  const island = islandById(world)
  const star = starIn(world, textOf(t))
  const level = t.q.level
  return (
    <article className="overflow-hidden rounded-4xl bg-paper shadow-pop">
      <div className="relative">
        <Photo island={world} n={photo} credit alt={`${island.name} photo`} className={t.kind === 'maths' && t.q.diagram ? 'h-24 sm:h-32' : 'h-40 sm:h-52'} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(0deg, ${island.tint[1]}E6 0%, ${island.tint[1]}40 45%, transparent 100%)` }} aria-hidden />
        <span className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 rounded-full py-1 pl-1.5 pr-3 font-display text-sm font-semibold text-ink" style={{ background: 'linear-gradient(180deg,#FFD95E,#FFB81F)', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.6), 0 3px 0 #C98F00' }}>
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/70">
            <Sparkles size={14} aria-hidden />
          </span>
          {journey.leadIn(n)} · {n + 1} of {total}
        </span>
        <span className="absolute bottom-3 right-4 inline-flex items-center gap-0.5 rounded-full bg-white px-2.5 py-1.5 shadow-[0_3px_0_rgba(20,18,56,0.25)]" role="img" aria-label={`Level ${level} of 3`}>
          {[1, 2, 3].map((l) => (
            <StarIcon key={l} size={15} className={l <= level ? 'fill-sun text-[#C98F00]' : 'fill-mist-deep text-mist-deep'} aria-hidden />
          ))}
        </span>
      </div>
      <div className="p-5">
        {star && (
          <p className="mb-3 flex items-center gap-2.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-sm font-semibold text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.3),0_3px_0_rgba(23,21,58,0.2)]" style={{ background: `linear-gradient(135deg, ${island.tint[0]}, ${island.tint[1]})` }}>
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
          <>
            <p className="font-display text-xl font-semibold leading-snug sm:text-2xl">{t.q.text}</p>
            {t.q.diagram && <Diagram d={t.q.diagram} picked={picked} onPick={onPick} />}
            {t.q.pick && onPick && <p className="mt-2 text-center text-sm font-bold text-ink-soft">{picked ? `You picked (${picked[0]}, ${picked[1]}). Press Check, or tap again to change it.` : 'Tap a point where the grid lines cross.'}</p>}
          </>
        ) : (
          <>
            {t.q.extract && t.q.kind !== 'spell' && <Passage text={t.q.extract} />}
            {t.q.kind === 'spell' && (
              <p className="mb-3 rounded-2xl bg-mist p-4 text-center font-display text-2xl font-semibold tracking-wide">{t.q.extract}</p>
            )}
            <p className="font-display text-xl font-semibold leading-snug sm:text-2xl">{t.q.prompt}</p>
          </>
        )}
        <p className="mt-4 rounded-2xl bg-[#F4F5FE] px-3 py-2 text-sm text-ink-soft">
          Year {year} {subject}: {statement}
        </p>
      </div>
    </article>
  )
}
