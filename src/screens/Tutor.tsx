import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Gem, Image as ImageIcon, Lightbulb, RefreshCw, SendHorizontal, Sparkles, Trophy } from 'lucide-react'
import { Buddy, Photo, type Mood } from '../components/art'
import { CHILD, islandById, type IslandId, type ProblemSpec } from '../data/world'
import { useProfile } from '../data/profile'
import { BuddyDuo, ChildAvatar } from '../components/avatar'
import { FOOTBALL_STARS, WRESTLING_STARS, type Star } from '../data/stars'

/* ---------------- scripted problems (answers checked in code, never by AI) ---------------- */

interface Problem {
  id: string
  step: number
  scene: string
  ask: string
  total: number
  groups: number
  take: number
  unit: string
  noun: string
  answer: number
  hints: [string, string, string]
  differently: string
  wrong: Record<number, string>
  star?: Star
}

const FRAC: Record<number, [string, string]> = { 2: ['half', 'halves'], 3: ['third', 'thirds'], 4: ['quarter', 'quarters'], 5: ['fifth', 'fifths'] }
const WORD = ['zero', 'one', 'two', 'three', 'four']
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

/** Builds a full problem (answer, hints, mistake messages) from a themed spec. Maths is computed here, not written by hand. */
const CAST: Partial<Record<IslandId, Star[]>> = { football: FOOTBALL_STARS, wrestling: WRESTLING_STARS }

/** Fill {star}, {He}/{he}, {His}/{his}, {Him}/{him} with the chosen star. */
function cast(text: string, star?: Star) {
  if (!star) return text
  const he = star.pronoun === 'she' ? 'she' : 'he'
  const his = star.pronoun === 'she' ? 'her' : 'his'
  const him = star.pronoun === 'she' ? 'her' : 'him'
  return text
    .replace(/\{star\}/g, star.name)
    .replace(/\{He\}/g, cap(he))
    .replace(/\{he\}/g, he)
    .replace(/\{His\}/g, cap(his))
    .replace(/\{his\}/g, his)
    .replace(/\{Him\}/g, cap(him))
    .replace(/\{him\}/g, him)
}

export function makeProblem(spec: ProblemSpec, id: string, step: number, island?: IslandId): Problem {
  const { total, groups, take, noun } = spec
  const list = island ? CAST[island] : undefined
  const star = list && spec.star !== undefined ? list[spec.star % list.length] : undefined
  const per = total / groups
  const frac = `${WORD[take]} ${take === 1 ? FRAC[groups][0] : FRAC[groups][1]}`
  const answer = per * take
  const wrong: Record<number, string> = {
    [per]: `That's one ${FRAC[groups][0]}: the size of one group. ${cap(frac)} means ${WORD[take]} of the groups.`,
    [per * (take + 1)]: `That's one group too many. ${cap(frac)} means exactly ${WORD[take]} ${take === 1 ? 'group' : 'groups'}.`,
    [total * take]: `That's ${total} × ${take}. Split into ${groups} equal groups first, then take ${take} of them.`,
    [total * groups]: `That's ${total} × ${groups}. Sharing into ${groups} groups makes the answer smaller, not bigger.`,
    [total + take]: `That's ${total} + ${take}. A fraction of an amount means sharing into equal groups.`,
    [total - take]: `That's ${total} − ${take}. Try sharing the ${total} ${noun} into ${groups} equal groups.`,
  }
  delete wrong[answer]
  return {
    id,
    step,
    scene: cast(spec.scene, star),
    ask: cast(spec.ask.replace('{frac}', frac).replace('{Frac}', cap(frac)), star),
    total,
    groups,
    take,
    unit: spec.unit,
    noun,
    answer,
    hints: [
      `${cap(frac)} means: split the ${total} ${noun} into ${groups} equal groups, then count ${take === 1 ? 'just one group' : `${WORD[take]} of the groups`}.`,
      `Each group has ${total} ÷ ${groups} ${noun}. How many is that?`,
      take === 1 ? `Each group has ${per} ${noun}, and you only need one group.` : `Each group has ${per} ${noun}. ${cap(WORD[take])} groups is ${per} × ${take}.`,
    ],
    differently: `Imagine ${groups} friends share ${total} ${noun} equally, so everyone gets the same. ${cap(frac)} is what ${take === 1 ? 'one friend gets' : `${WORD[take]} of those friends have together`}.`,
    wrong,
    star,
  }
}

/* ---------------- visual: items grouped into equal parts ---------------- */

function Token({ on, island }: { on: boolean; island: IslandId }) {
  const [a] = islandById(island).tint
  const fill = on ? a : '#C9CDE3'
  const glyph: Record<Exclude<IslandId, 'football'>, ReactNode> = {
    wrestling: <path d="M7 12 h10 M9 9 h6 v6 h-6 z" stroke="#fff" strokeWidth={1.8} fill="none" strokeLinejoin="round" />,
    music: <path d="M10 16 a2 2 0 1 1 -1 -1.7 V7.5 l6 -1.5 v8 a2 2 0 1 1 -1 -1.7 V8.6 l-4 1" fill="#fff" />,
    story: <path d="M7 8 h4.5 a1 1 0 0 1 1 1 v7 a1 1 0 0 0 -1 -1 H7 z M17 8 h-4.5 v8 a1 1 0 0 1 1 -1 H17 z" fill="#fff" />,
    bricks: <g fill="#fff"><rect x={6.5} y={10} width={11} height={6} rx={1} /><rect x={8} y={8} width={3} height={2} rx={0.6} /><rect x={13} y={8} width={3} height={2} rx={0.6} /></g>,
    space: <path d="M12 6 l1.8 3.8 4.2 .5 -3.1 2.9 .8 4.2 -3.7 -2.1 -3.7 2.1 .8 -4.2 -3.1 -2.9 4.2 -.5 z" fill="#fff" />,
  }
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
      <circle cx={12} cy={12} r={10.5} fill={fill} stroke="#17153A" strokeWidth={1.4} />
      {glyph[island as Exclude<IslandId, 'football'>]}
    </svg>
  )
}

function Ball({ on, island }: { on: boolean; island: IslandId }) {
  if (island !== 'football') return <Token on={on} island={island} />
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
      <circle cx={12} cy={12} r={10.5} fill={on ? '#fff' : '#F4F5FB'} stroke="#17153A" strokeWidth={1.6} />
      <path d="M12 7.2 l3.4 2.5 -1.3 4 h-4.2 l-1.3 -4 z" fill={on ? '#17153A' : '#B9BED6'} />
      <path d="M12 7.2 V3 M15.4 9.7 l3.6 -1.6 M14.1 13.7 l2.4 3.4 M9.9 13.7 l-2.4 3.4 M8.6 9.7 L5 8.1" stroke={on ? '#17153A' : '#B9BED6'} strokeWidth={1.2} />
    </svg>
  )
}

function GroupVisual({ p, grouped, highlight, island }: { p: Problem; grouped: boolean; highlight: boolean; island: IslandId }) {
  const per = p.total / p.groups
  if (!grouped) {
    return (
      <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10" aria-label={`${p.total} footballs`}>
        {Array.from({ length: p.total }, (_, i) => (
          <motion.span key={i} className="aspect-square" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.02 }}>
            <Ball on island={island} />
          </motion.span>
        ))}
      </div>
    )
  }
  return (
    <div className={`grid gap-2 ${p.groups === 2 ? 'grid-cols-2' : p.groups === 4 ? 'grid-cols-2 sm:grid-cols-4' : p.groups === 5 ? 'grid-cols-3 sm:grid-cols-5' : 'grid-cols-3'}`} aria-label={`${p.total} footballs in ${p.groups} groups of ${per}`}>
      {Array.from({ length: p.groups }, (_, g) => {
        const lit = highlight && g < p.take
        return (
          <motion.div
            key={g}
            layout
            className={`rounded-2xl p-2 ring-2 ring-inset transition-colors ${lit ? 'bg-sun-soft ring-sun' : 'bg-mist ring-mist-deep'}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: g * 0.08 }}
          >
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: per }, (_, i) => (
                <span key={i} className="aspect-square">
                  <Ball on={!highlight || lit} island={island} />
                </span>
              ))}
            </div>
            <p className={`mt-1 text-center text-xs font-bold ${lit ? 'text-ink' : 'text-ink-soft'}`}>Group {g + 1}</p>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ---------------- confetti ---------------- */

function Confetti({ run }: { run: number }) {
  const colors = ['#FFC93C', '#FF6B57', '#22C58B', '#7C5CFF', '#3E8EF0']
  return (
    <AnimatePresence>
      {run > 0 && (
        <motion.div key={run} className="pointer-events-none fixed inset-0 z-50 overflow-hidden" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 1.4, duration: 0.5 }} aria-hidden>
          {Array.from({ length: 36 }, (_, i) => {
            const x = (i * 97) % 100
            return (
              <motion.span
                key={i}
                className="absolute top-1/3 block h-3 w-2 rounded-sm"
                style={{ left: `${x}%`, background: colors[i % colors.length] }}
                initial={{ y: 0, rotate: 0, opacity: 1 }}
                animate={{ y: [0, -140 - (i % 5) * 30, 420], x: ((i % 7) - 3) * 22, rotate: 360 + i * 20 }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
              />
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ---------------- chat model ---------------- */

type Msg =
  | { id: number; from: 'buddy'; text: string; mood?: Mood }
  | { id: number; from: 'child'; text: string }
  | { id: number; from: 'card'; problem: Problem }
  | { id: number; from: 'hint'; level: number; text: string }
  | { id: number; from: 'win'; problem: Problem; last: boolean }

type NewMsg = { [K in Msg['from']]: Omit<Extract<Msg, { from: K }>, 'id'> }[Msg['from']]

let uid = 0
const next = () => ++uid

function BuddyBubble({ children, mood = 'happy' }: { children: ReactNode; mood?: Mood }) {
  return (
    <div className="flex items-end gap-2.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-paper shadow-card">
        <Buddy mood={mood} className="h-9 w-9" />
      </span>
      <div className="max-w-[86%] rounded-3xl rounded-bl-lg bg-paper px-4 py-3 text-[1.0625rem] leading-snug shadow-card">{children}</div>
    </div>
  )
}

export function Tutor({ island: islandId, onExit }: { island: IslandId; onExit: () => void }) {
  const island = islandById(islandId)
  const quest = island.quests.find((q) => q.playable) ?? island.quests[0]
  const PROBLEMS = useRef(island.problems.map((sp, i) => makeProblem(sp, `${island.id}-${i}`, quest.done + 1 + i, island.id))).current
  const [pIndex, setPIndex] = useState(0)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [typing, setTyping] = useState(false)
  const [hint, setHint] = useState(0)
  const [grouped, setGrouped] = useState(false)
  const [highlight, setHighlight] = useState(false)
  const [solved, setSolved] = useState(false)
  const [value, setValue] = useState('')
  const [confetti, setConfetti] = useState(0)
  const [gems, setGems] = useState(CHILD.gems)
  const [stepsDone, setStepsDone] = useState(quest.done)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timers = useRef<number[]>([])
  const p = PROBLEMS[pIndex]
  const { profile } = useProfile()
  const childName = profile?.name ?? 'explorer'
  const year = profile?.year ?? 5

  const say = useCallback((items: NewMsg[], gap = 650) => {
    items.forEach((m, i) => {
      timers.current.push(window.setTimeout(() => setTyping(true), i * gap))
      timers.current.push(
        window.setTimeout(() => {
          setTyping(false)
          setMsgs((cur) => [...cur, { ...m, id: next() } as Msg])
        }, i * gap + gap - 120),
      )
    })
  }, [])

  useEffect(() => {
    const t = timers.current
    say([
      { from: 'buddy', text: `Welcome back, ${childName}! Step ${quest.done + 1} of ${quest.title}. Let’s go.`, mood: 'cheer' },
      { from: 'card', problem: PROBLEMS[0] },
      { from: 'buddy', text: 'Type your answer below, or ask me for a hint. No rush.' },
    ])
    return () => t.forEach(clearTimeout)
  }, [say, childName])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [msgs, typing])

  const giveHint = () => {
    if (solved) return
    const level = Math.min(3, hint + 1)
    if (level === hint) return
    setHint(level)
    setMsgs((c) => [...c, { id: next(), from: 'child', text: hint === 0 ? 'Can I have a hint?' : 'Another hint, please' }])
    if (level >= 1) setGrouped(true)
    if (level >= 2) setHighlight(true)
    say([{ from: 'hint', level, text: p.hints[level - 1] }])
  }

  const showPicture = () => {
    if (solved) return
    setMsgs((c) => [...c, { id: next(), from: 'child', text: 'Show me with a picture' }])
    setGrouped(true)
    setHighlight(true)
    say([{ from: 'buddy', text: `Look at the card: ${p.total} ${p.noun} in ${p.groups} equal groups. The yellow groups are the ${p.take} you need. Count them up.`, mood: 'wink' }])
  }

  const explain = () => {
    if (solved) return
    setMsgs((c) => [...c, { id: next(), from: 'child', text: 'Explain it differently' }])
    say([{ from: 'buddy', text: p.differently, mood: 'think' }])
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (solved) return
    const raw = value.trim()
    if (!raw) {
      inputRef.current?.focus()
      return
    }
    const n = Number(raw.replace(/[^\d.]/g, ''))
    setValue('')
    setMsgs((c) => [...c, { id: next(), from: 'child', text: raw }])
    if (n === p.answer) {
      setSolved(true)
      setHighlight(true)
      setGrouped(true)
      setConfetti((k) => k + 1)
      setGems((g) => g + 20)
      setStepsDone((s) => s + 1)
      say([
        { from: 'buddy', text: `${p.answer} ${p.unit}! ${hint === 0 ? 'First try, no hints. Brilliant.' : 'You worked it out step by step. That’s how champions do it.'}`, mood: 'cheer' },
        { from: 'win', problem: p, last: pIndex === PROBLEMS.length - 1 },
      ])
      return
    }
    const known = p.wrong[n]
    const autoLevel = Math.max(hint, 1)
    say([{ from: 'buddy', text: known ?? 'Not quite yet. I’ve opened a hint to help.', mood: 'think' }])
    if (hint === 0) {
      setHint(autoLevel)
      setGrouped(true)
      say([{ from: 'hint', level: 1, text: p.hints[0] }], 1300)
    }
  }

  const nextProblem = () => {
    const ni = pIndex + 1
    setPIndex(ni)
    setHint(0)
    setGrouped(false)
    setHighlight(false)
    setSolved(false)
    say([
      { from: 'buddy', text: 'Brilliant. Here’s the next one!', mood: 'cheer' },
      { from: 'card', problem: PROBLEMS[ni] },
    ])
  }

  const total = quest.steps
  const chips = [
    { label: hint === 0 ? 'Give me a hint' : hint < 3 ? 'Another hint' : 'All hints used', icon: Lightbulb, on: giveHint, disabled: hint >= 3 },
    { label: 'Show me a picture', icon: ImageIcon, on: showPicture, disabled: false },
    { label: 'Explain it differently', icon: RefreshCw, on: explain, disabled: false },
  ]

  return (
    <div className="flex h-dvh flex-col bg-mist lg:h-auto lg:min-h-dvh">
      <Confetti run={confetti} />
      {/* top bar */}
      <header className="z-20 bg-night text-white" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="mx-auto flex h-16 w-full max-w-[1160px] items-center gap-3 px-3 sm:px-6">
          <button type="button" onClick={onExit} className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10" aria-label="Back to your world">
            <ArrowLeft size={24} aria-hidden />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-semibold leading-tight">{quest.title}</p>
            <div className="mt-1 flex max-w-[220px] gap-1" aria-label={`${stepsDone} of ${total} steps done`}>
              {Array.from({ length: total }, (_, i) => (
                <span key={i} className={`h-1.5 flex-1 rounded-full ${i < stepsDone ? 'bg-mint' : i === stepsDone ? 'bg-sun' : 'bg-white/20'}`} />
              ))}
            </div>
          </div>
          <motion.span key={gems} initial={{ scale: 1.25 }} animate={{ scale: 1 }} className="chip bg-white/10 text-white ring-1 ring-inset ring-white/15">
            <Gem size={16} className="text-sea-soft" aria-hidden /> <span className="tabular">{gems}</span>
          </motion.span>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1160px] min-h-0 flex-1 gap-6 lg:px-6 lg:py-6">
        {/* chat */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col lg:rounded-4xl lg:bg-[#E6E9F8]" aria-label={`Chat with Nova: ${island.name}`}>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-6" aria-live="polite">
            <div className="mx-auto grid max-w-[680px] gap-4">
              {msgs.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
                  {m.from === 'buddy' && <BuddyBubble mood={m.mood}>{m.text}</BuddyBubble>}
                  {m.from === 'child' && (
                    <div className="flex items-end justify-end gap-2.5">
                      <div className="max-w-[78%] rounded-3xl rounded-br-lg bg-grape px-4 py-3 font-bold text-white shadow-card">{m.text}</div>
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
                  {m.from === 'card' && (
                    <article className="overflow-hidden rounded-4xl bg-paper shadow-pop">
                      <div className="relative">
                        <Photo island={island.id} alt={`${island.name} photo`} className="h-32 sm:h-40" />
                        <div className="absolute inset-0 bg-gradient-to-t from-night-deep/80 to-transparent" aria-hidden />
                        <span className="chip absolute bottom-3 left-4 bg-sun text-ink">
                          <Sparkles size={14} aria-hidden /> Step {m.problem.step} of {quest.steps}
                        </span>
                      </div>
                      <div className="p-5">
                        {m.problem.star && (
                          <p className="mb-3 flex items-center gap-2.5">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-night font-display text-sm font-semibold text-sun">
                              {m.problem.star.name
                                .split(' ')
                                .map((w) => w[0])
                                .join('')
                                .slice(0, 2)}
                            </span>
                            <span className="min-w-0 leading-tight">
                              <span className="block font-display font-semibold">
                                {m.problem.star.name}
                                {m.problem.star.nickname && <span className="font-sans font-normal text-ink-soft"> “{m.problem.star.nickname}”</span>}
                              </span>
                              <span className="block text-sm text-ink-soft">{m.problem.star.role}</span>
                            </span>
                          </p>
                        )}
                        <p className="text-lg leading-snug">{m.problem.scene}</p>
                        <p className="mt-1 font-display text-xl font-semibold leading-snug sm:text-2xl">{m.problem.ask}</p>
                        <div className="mt-4">
                          <GroupVisual island={island.id} p={m.problem} grouped={m.problem.id === p.id ? grouped : true} highlight={m.problem.id === p.id ? highlight : true} />
                        </div>
                        <p className="mt-3 text-sm text-ink-soft">Year {year} maths: find fractions of amounts.</p>
                      </div>
                    </article>
                  )}
                  {m.from === 'win' && (
                    <div className="rounded-4xl bg-night p-5 text-white shadow-pop">
                      <div className="flex items-center gap-4">
                        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sun text-ink">
                          <Trophy size={28} aria-hidden />
                        </span>
                        <div>
                          <p className="font-display text-xl font-semibold">{m.last ? `${quest.title} complete!` : 'Step complete'}</p>
                          <p className="text-white/80">{m.last ? `All ${PROBLEMS.length} steps done. +20 gems and a new star.` : '+20 gems. Nova is proud of you.'}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {m.last ? (
                          <button type="button" className="btn btn-sun flex-1" onClick={onExit}>
                            Back to your world
                          </button>
                        ) : (
                          <>
                            <button type="button" className="btn btn-sun flex-1" onClick={nextProblem} disabled={pIndex !== PROBLEMS.indexOf(m.problem)}>
                              Next step
                            </button>
                            <button type="button" className="btn flex-1 bg-white/10 text-white ring-1 ring-inset ring-white/20 hover:bg-white/15" onClick={onExit}>
                              Save and exit
                            </button>
                          </>
                        )}
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
                    disabled={c.disabled || solved}
                    className="flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full bg-mist px-3.5 text-sm font-bold text-ink ring-1 ring-inset ring-mist-deep transition-colors hover:bg-mist-deep disabled:opacity-45"
                  >
                    <c.icon size={16} aria-hidden /> {c.label}
                  </button>
                ))}
              </div>
              <form onSubmit={submit} className="flex items-center gap-2">
                <label htmlFor="answer" className="sr-only">
                  Your answer
                </label>
                <input
                  id="answer"
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value.slice(0, 8))}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={solved ? (pIndex === PROBLEMS.length - 1 ? 'Quest complete! Tap Back to your world' : 'Solved! Tap Next step above') : `Type how many ${p.unit}`}
                  disabled={solved}
                  className="min-h-[54px] min-w-0 flex-1 rounded-2xl border-2 border-mist-deep bg-paper px-4 text-lg font-bold text-ink placeholder:font-normal placeholder:text-ink-faint focus:border-grape focus:outline-none disabled:bg-mist"
                />
                <button type="submit" disabled={solved} className="btn btn-grape min-h-[54px] px-4 sm:px-5" aria-label="Check my answer">
                  <SendHorizontal size={20} aria-hidden />
                  <span className="hidden sm:inline">Check</span>
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* side panel (tablet landscape and desktop) */}
        <aside className="hidden w-[300px] shrink-0 flex-col gap-5 lg:flex" aria-label="Quest progress">
          <div className="card grid place-items-center p-6 text-center">
            <BuddyDuo data={profile?.avatar} mood={solved ? 'cheer' : hint > 0 ? 'think' : 'happy'} size="lg" name={childName} />
            <p className="mt-3 font-display text-xl font-semibold">{`${childName} & Nova`}</p>
            <p className="text-ink-soft">{solved ? 'You did it!' : hint > 0 ? 'Thinking it through with you.' : 'Here if you need a hint.'}</p>
          </div>
          <div className="card p-5">
            <p className="font-display text-lg font-semibold">Hint ladder</p>
            <ol className="mt-3 grid gap-2">
              {['Split into equal groups', 'Find one group', 'Take the groups you need'].map((t, i) => (
                <li key={t} className={`flex items-center gap-3 rounded-2xl p-2.5 ${i < hint ? 'bg-sun-soft' : 'bg-mist'}`}>
                  <span className={`grid h-8 w-8 place-items-center rounded-xl text-sm font-bold ${i < hint ? 'bg-sun text-ink' : 'bg-paper text-ink-faint'}`}>{i + 1}</span>
                  <span className={i < hint ? 'font-bold' : 'text-ink-soft'}>{t}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm text-ink-soft">Hints show the method one piece at a time. Answers are always checked by maths rules, not guessed by AI.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
