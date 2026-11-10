import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, BookOpen, Calculator, Check, Clock, Play, RotateCcw, Shirt, Star, Table2, X } from 'lucide-react'
import { Buddy, Photo, Stars } from '../components/art'
import { islandById, type IslandId } from '../data/world'
import { useProfile } from '../data/profile'
import { domainName, syllabus, type QuestDef, type Subject, type Year } from '../data/syllabus'
import { JOURNEYS } from '../data/journeys'
import { STAGES, stageInfo } from '../data/stages'
import { FootballBoards, StageLadder, StageTrack, TeamPicker } from '../components/journey'
import { isDone, nextQuest, starsFor, useProgress, worldStats, type QuestProgress } from '../data/progress'

/** Zig-zag offsets (px) for the stepping stones, repeating. */
const ZIG = [0, 56, 84, 56, 0, -56, -84, -56]

export function World({ world, onBack, onPlay }: { world: IslandId; onBack: () => void; onPlay: (subject: Subject, q: QuestDef) => void }) {
  const { profile } = useProfile()
  const year = (profile?.year ?? 5) as Year
  const island = islandById(world)
  const journey = JOURNEYS[world]
  const progress = useProgress()
  const wp = progress.world(world)
  const [subject, setSubject] = useState<Subject>('maths')
  const topics = syllabus(year, subject)
  const stats = worldStats(wp, year)
  const info = stageInfo(world, stats.answered, stats.questions)
  const up = nextQuest(wp, year, subject)
  const [teamOpen, setTeamOpen] = useState(false)
  const [boardsOpen, setBoardsOpen] = useState(false)
  const [picked, setPicked] = useState<QuestDef | null>(null)
  const currentRef = useRef<HTMLDivElement>(null)

  // bring the next stepping stone into view when the screen opens or the subject changes
  useEffect(() => {
    const t = setTimeout(() => currentRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 350)
    return () => clearTimeout(t)
  }, [subject, world])

  let stone = 0
  const tint = `linear-gradient(135deg, ${island.tint[0]}, ${island.tint[1]})`

  return (
    <main className="mx-auto w-full max-w-[1100px] pb-16">
      {/* banner */}
      <header className="relative">
        <Photo island={world} alt={`${island.name} banner`} className="h-52 sm:h-64 lg:rounded-b-4xl" w={1400} banner />
        <div className="absolute inset-0 bg-gradient-to-t from-night-deep via-night-deep/40 to-night-deep/10 lg:rounded-b-4xl" aria-hidden />
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to your world map"
          className="absolute left-4 grid h-12 w-12 place-items-center rounded-full bg-white/90 text-ink shadow-card"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
        >
          <ArrowLeft size={24} aria-hidden />
        </button>
        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
          <h1 className="font-display text-[2.1rem] font-semibold leading-none sm:text-[2.6rem]">{island.name}</h1>
          <p className="mt-1 max-w-[46ch] text-white/85">{journey.pitch}</p>
        </div>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 px-4 pt-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5">
          {/* stage card (phones and tablets; the ladder sits in the side column on desktop) */}
          <section className="card p-4 lg:hidden" aria-label={`${STAGES[world].title}: your stage`}>
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white shadow-pop" style={{ background: tint }}>
                <span className="text-center leading-none">
                  <span className="block text-[10px] font-bold uppercase tracking-wide opacity-85">Stage</span>
                  <span className="block font-display text-2xl font-semibold">{info.index + 1}</span>
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink-soft">{STAGES[world].title}</p>
                <p className="truncate font-display text-xl font-semibold leading-tight">{info.stage.name}</p>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-mist-deep">
                  <motion.div className="h-full rounded-full" style={{ background: tint }} initial={{ width: 0 }} animate={{ width: `${Math.max(3, (info.next ? info.within : 1) * 100)}%` }} />
                </div>
              </div>
            </div>
            <p className="mt-2 text-sm text-ink-soft">
              {info.next ? (
                <>
                  <span className="font-bold text-ink">{info.needed}</span> more {info.needed === 1 ? 'answer' : 'answers'} to reach <span className="font-bold text-ink">{info.next.name}</span>
                </>
              ) : (
                'Top of the ladder. Champion!'
              )}
            </p>
            <div className="mt-2">
              <StageTrack world={world} info={info} />
            </div>
            {world === 'football' && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => (profile?.team ? setBoardsOpen(true) : setTeamOpen(true))} className="btn btn-ghost min-h-[48px] px-3 text-base">
                  <Table2 size={18} aria-hidden /> {profile?.team ? 'League table' : 'Pick team'}
                </button>
                <button type="button" onClick={() => setTeamOpen(true)} className="btn btn-ghost min-h-[48px] px-3 text-base">
                  <Shirt size={18} aria-hidden /> <span className="truncate">{profile?.team ?? 'Your team'}</span>
                </button>
              </div>
            )}
          </section>

          {/* subject switch */}
          <div className="sticky top-2 z-20 grid grid-cols-2 gap-2 rounded-3xl bg-paper/95 p-1.5 shadow-card backdrop-blur" role="tablist" aria-label="Subject">
            {(
              [
                ['maths', 'Maths', Calculator, 'bg-grape'],
                ['english', 'English', BookOpen, 'bg-mint-deep'],
              ] as const
            ).map(([id, label, Icon, on]) => {
              const s = worldStats(wp, year, id)
              const active = subject === id
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSubject(id)}
                  className={`flex min-h-[60px] items-center justify-center gap-2 rounded-2xl font-display text-xl font-semibold transition-colors ${active ? `${on} text-white shadow-pop` : 'text-ink-soft hover:bg-mist'}`}
                >
                  <Icon size={24} aria-hidden /> {label}
                  <span className={`rounded-full px-2 py-0.5 text-sm font-bold tabular ${active ? 'bg-white/20' : 'bg-mist'}`}>{Math.round(s.fraction * 100)}%</span>
                </button>
              )
            })}
          </div>

          {/* the path */}
          <div className="grid gap-8 pb-4">
            {topics.map((t, ti) => {
              const playable = t.quests.filter((q) => q.playable)
              const done = playable.filter((q) => isDone(wp[q.id])).length
              return (
                <section key={`${subject}|${t.domain}`} aria-label={journey.topic(ti, t.domain)}>
                  {/* signpost */}
                  <div className="mx-auto flex max-w-[460px] items-center gap-3 rounded-3xl p-3 pr-4 text-white shadow-pop" style={{ background: tint }}>
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20 font-display text-2xl font-semibold">{ti + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-white/80">{journey.topic(ti, t.domain)}</span>
                      <span className="block font-display text-lg font-semibold leading-tight">{subject === 'maths' ? domainName(t.domain) : t.domain}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-sm font-bold tabular">
                      <Star size={14} className="fill-sun text-sun" aria-hidden /> {done}/{playable.length}
                    </span>
                  </div>

                  {/* stepping stones */}
                  <ol className="mt-6 flex flex-col items-center gap-5">
                    {t.quests.map((q) => {
                      const i = stone++
                      const isUp = q.id === up?.id
                      return (
                        <li key={q.id} style={{ transform: `translateX(${ZIG[i % ZIG.length]}px)` }}>
                          <div ref={isUp ? currentRef : undefined}>
                            <StoneButton q={q} p={wp[q.id]} isUp={isUp} tint={tint} n={i + 1} onTap={() => setPicked(q)} label={journey.quest} />
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                </section>
              )
            })}
            <div className="mx-auto mt-2 grid max-w-[360px] place-items-center gap-2 text-center">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-sun shadow-pop">
                <TrophyIcon />
              </span>
              <p className="font-display text-xl font-semibold">{STAGES[world].stages[STAGES[world].stages.length - 1]?.name ?? 'The finish'}</p>
              <p className="text-sm text-ink-soft">Finish every {journey.quest.toLowerCase()} in Maths and English to get here.</p>
            </div>
          </div>
        </div>

        {/* desktop side column */}
        <aside className="hidden gap-5 lg:sticky lg:top-6 lg:grid">
          <StageLadder world={world} info={info} />
          {world === 'football' &&
            (profile?.team ? (
              <>
                <FootballBoards played={stats.answered} goals={stats.firstTry} assists={stats.helped} compact />
                <button type="button" onClick={() => setTeamOpen(true)} className="text-sm font-bold text-ink-soft underline underline-offset-4">
                  {profile.team} · change team
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setTeamOpen(true)} className="btn btn-sun">
                <Shirt size={20} aria-hidden /> Pick your Premier League team
              </button>
            ))}
        </aside>
      </div>

      <QuestSheet
        q={picked}
        p={picked ? wp[picked.id] : undefined}
        world={world}
        topic={picked ? (subject === 'maths' ? domainName(picked.domain) : picked.domain) : ''}
        onClose={() => setPicked(null)}
        onPlay={(q) => {
          setPicked(null)
          onPlay(subject, q)
        }}
      />
      <Sheet open={boardsOpen} onClose={() => setBoardsOpen(false)} title="League table">
        <FootballBoards played={stats.answered} goals={stats.firstTry} assists={stats.helped} />
      </Sheet>
      <TeamPicker open={teamOpen} onClose={() => setTeamOpen(false)} />
    </main>
  )
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden>
      <path d="M14 8h20v8a10 10 0 0 1-20 0z" fill="#fff" stroke="#17153A" strokeWidth={2.5} />
      <path d="M14 11H8a6 6 0 0 0 6 7M34 11h6a6 6 0 0 1-6 7" fill="none" stroke="#17153A" strokeWidth={2.5} />
      <path d="M21 26h6v6h5v6H16v-6h5z" fill="#fff" stroke="#17153A" strokeWidth={2.5} strokeLinejoin="round" />
    </svg>
  )
}

/** One stepping stone on the path. */
function StoneButton({ q, p, isUp, tint, n, onTap, label }: { q: QuestDef; p?: QuestProgress; isUp: boolean; tint: string; n: number; onTap: () => void; label: string }) {
  const complete = isDone(p)
  const pct = p && q.size ? p.answered / q.size : 0
  if (!q.playable) {
    return (
      <button type="button" onClick={onTap} aria-label={`${q.title}. Coming soon`} className="grid h-16 w-16 place-items-center rounded-full bg-mist-deep text-ink-faint shadow-[0_5px_0_#c5cae6]">
        <Clock size={24} aria-hidden />
      </button>
    )
  }
  if (isUp) {
    return (
      <div className="relative flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 max-w-[220px] rounded-2xl bg-night px-3 py-2 text-center text-sm font-bold leading-tight text-white shadow-pop after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-night relative"
        >
          {p ? 'Keep going!' : `Next ${label.toLowerCase()}`}
          <span className="block font-normal text-white/80">{q.title.length > 48 ? `${q.title.slice(0, 46)}…` : q.title}</span>
        </motion.span>
        <span className="relative">
          <motion.span className="absolute inset-0 rounded-full bg-sun/50" animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }} transition={{ duration: 2, repeat: Infinity }} aria-hidden />
          <motion.button
            type="button"
            onClick={onTap}
            aria-label={`${q.title}. ${p ? 'Continue' : 'Start'}`}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="relative grid h-24 w-24 place-items-center rounded-full bg-sun text-ink shadow-[0_7px_0_#E8A900] ring-4 ring-white"
          >
            <Play size={40} className="ml-1 fill-ink" aria-hidden />
          </motion.button>
          <span className="absolute -right-14 top-1 grid h-12 w-12 place-items-center rounded-full bg-white shadow-card ring-2 ring-mist-deep" aria-hidden>
            <Buddy mood="cheer" className="h-10 w-10" />
          </span>
        </span>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={onTap}
        aria-label={`${q.title}. ${complete ? 'Done' : p ? `${Math.round(pct * 100)}% done` : 'Not started'}`}
        className={`relative grid h-[72px] w-[72px] place-items-center rounded-full transition-transform active:translate-y-1 ${complete ? 'text-white shadow-[0_6px_0_rgba(23,21,58,0.28)]' : 'bg-paper text-ink-soft shadow-[0_6px_0_#DCE0F5] ring-2 ring-mist-deep'}`}
        style={complete ? { background: tint } : p ? { background: `conic-gradient(#22C58B ${pct * 360}deg, #fff 0deg)` } : undefined}
      >
        {complete ? (
          <Check size={34} strokeWidth={3.5} aria-hidden />
        ) : (
          <span className={`grid h-[58px] w-[58px] place-items-center rounded-full bg-paper font-display text-2xl font-semibold tabular ${p ? '' : ''}`}>{n}</span>
        )}
      </button>
      {complete && (
        <span className="mt-1.5">
          <Stars n={starsFor(p)} />
        </span>
      )}
    </div>
  )
}

function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="Close" className="absolute inset-0 bg-night-deep/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative max-h-[90dvh] w-full max-w-[560px] overflow-y-auto rounded-t-4xl bg-mist p-4 shadow-pop sm:rounded-4xl"
            initial={{ y: 60 }}
            animate={{ y: 0 }}
            exit={{ y: 80, opacity: 0 }}
            style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">{title}</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="grid h-11 w-11 place-items-center rounded-full bg-paper">
                <X size={22} aria-hidden />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Tap a stepping stone: what it is, and a big Play button. */
function QuestSheet({ q, p, world, topic, onClose, onPlay }: { q: QuestDef | null; p?: QuestProgress; world: IslandId; topic: string; onClose: () => void; onPlay: (q: QuestDef) => void }) {
  const island = islandById(world)
  const complete = isDone(p)
  return (
    <AnimatePresence>
      {q && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="Close" className="absolute inset-0 bg-night-deep/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quest-sheet-title"
            className="relative w-full max-w-[460px] rounded-t-4xl bg-paper p-5 shadow-pop sm:rounded-4xl"
            initial={{ y: 60 }}
            animate={{ y: 0 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom, 0px))' }}
          >
            <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-mist">
              <X size={22} aria-hidden />
            </button>
            <div className="flex items-start gap-3 pr-12">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white" style={{ background: `linear-gradient(135deg, ${island.tint[0]}, ${island.tint[1]})` }}>
                {complete ? <Check size={28} strokeWidth={3} aria-hidden /> : q.playable ? <Play size={26} className="ml-0.5 fill-white" aria-hidden /> : <Clock size={24} aria-hidden />}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink-soft">{topic}</p>
                <h2 id="quest-sheet-title" className="font-display text-xl font-semibold leading-tight">
                  {q.title}
                </h2>
              </div>
            </div>
            {q.playable ? (
              <>
                <div className="mt-4 flex items-center justify-between text-sm font-bold">
                  <span>{p ? `${p.answered} of ${q.size} answered` : `${q.size} questions`}</span>
                  {complete ? <Stars n={starsFor(p)} /> : <span className="text-ink-soft">+{q.size * 10} gems</span>}
                </div>
                <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-mist-deep">
                  <div className="h-full rounded-full bg-mint" style={{ width: `${p ? (p.answered / q.size) * 100 : 0}%` }} />
                </div>
                <button type="button" onClick={() => onPlay(q)} className="btn btn-sun mt-5 w-full text-xl">
                  {complete ? <RotateCcw size={22} aria-hidden /> : <Play size={22} className="fill-ink" aria-hidden />}
                  {complete ? 'Play again' : p ? 'Continue' : "Let's go!"}
                </button>
              </>
            ) : (
              <p className="mt-4 rounded-2xl bg-mist p-3 text-ink-soft">{q.note ?? 'Coming soon. Nova is still building this one.'}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
