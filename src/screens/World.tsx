import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, Calculator, Check, ChevronDown, Clock, Play, RotateCcw } from 'lucide-react'
import { Photo, Stars } from '../components/art'
import { islandById, type IslandId } from '../data/world'
import { useProfile } from '../data/profile'
import { domainName, syllabus, type QuestDef, type Subject, type Year } from '../data/syllabus'
import { JOURNEYS } from '../data/journeys'
import { stageInfo } from '../data/stages'
import { FootballBoards, StageLadder, TeamPicker } from '../components/journey'
import { isDone, nextQuest, starsFor, useProgress, worldStats } from '../data/progress'

const plural = (w: string, n: number) => (n === 1 ? w : /(ch|sh|s|x)$/.test(w) ? `${w}es` : `${w}s`)

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
  const subStats = worldStats(wp, year, subject)
  const [teamOpen, setTeamOpen] = useState(false)
  const up = nextQuest(wp, year, subject)
  const firstOpen = Math.max(0, topics.findIndex((t) => t.quests.some((q) => q.id === up?.id)))
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const isOpen = (d: string, i: number) => open[`${subject}|${d}`] ?? i === firstOpen

  return (
    <main className="mx-auto w-full max-w-[1100px] pb-10">
      <header className="relative">
        <Photo island={world} alt={`${island.name} banner`} className="h-56 sm:h-64 lg:rounded-b-4xl" w={1400} />
        <div className="absolute inset-0 bg-gradient-to-t from-night-deep via-night-deep/40 to-night-deep/10 lg:rounded-b-4xl" aria-hidden />
        <button type="button" onClick={onBack} aria-label="Back to your world map" className="absolute left-4 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-ink shadow-card" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
          <ArrowLeft size={22} aria-hidden />
        </button>
        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
          <p className="chip bg-sun text-ink">{journey.title}</p>
          <h1 className="mt-2 font-display text-[2rem] font-semibold leading-tight sm:text-[2.5rem]">{island.name}</h1>
          <p className="max-w-[52ch] text-white/85">{journey.pitch}</p>
        </div>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 px-4 pt-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5">
          {/* continue */}
          {up && (
            <motion.button
              type="button"
              onClick={() => onPlay(subject, up)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full items-center gap-4 rounded-4xl bg-night p-4 text-left text-white shadow-pop sm:p-5"
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sun text-ink">
                <Play size={26} className="fill-ink" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-sun">{wp[up.id] ? 'Continue' : 'Up next'} · {subject === 'maths' ? 'Maths' : 'English'}</span>
                <span className="block truncate font-display text-lg font-semibold sm:text-xl">{up.title}</span>
                <span className="block text-sm text-white/70">
                  {wp[up.id] ? `${wp[up.id]!.answered} of ${up.size} done` : `${up.size} questions`}
                </span>
              </span>
            </motion.button>
          )}

          {/* subject switch */}
          <div className="grid grid-cols-2 gap-2 rounded-3xl bg-paper p-1.5 shadow-card" role="tablist" aria-label="Subject">
            {(
              [
                ['maths', 'Maths', Calculator],
                ['english', 'English', BookOpen],
              ] as const
            ).map(([id, label, Icon]) => {
              const s = worldStats(wp, year, id)
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={subject === id}
                  onClick={() => setSubject(id)}
                  className={`flex min-h-[56px] items-center justify-center gap-2 rounded-2xl font-display text-lg font-semibold transition-colors ${subject === id ? (id === 'maths' ? 'bg-grape text-white' : 'bg-mint-deep text-white') : 'text-ink-soft hover:bg-mist'}`}
                >
                  <Icon size={20} aria-hidden /> {label}
                  <span className={`text-sm font-bold tabular ${subject === id ? 'text-white/80' : 'text-ink-faint'}`}>{Math.round(s.fraction * 100)}%</span>
                </button>
              )
            })}
          </div>

          <p className="px-1 text-sm text-ink-soft">
            Year {year} {subject === 'maths' ? 'maths' : 'English'}: {subStats.quests} {plural(journey.quest.toLowerCase(), subStats.quests)}, {subStats.questions.toLocaleString('en-GB')} questions. The whole National Curriculum for the year, set in {island.name}.
          </p>

          {/* topics */}
          <div className="grid gap-3">
            {topics.map((t, i) => {
              const playable = t.quests.filter((q) => q.playable)
              const done = playable.filter((q) => isDone(wp[q.id])).length
              const opened = isOpen(t.domain, i)
              return (
                <section key={t.domain} className="card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpen((o) => ({ ...o, [`${subject}|${t.domain}`]: !opened }))}
                    aria-expanded={opened}
                    className="flex w-full items-center gap-3 p-4 text-left sm:p-5"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl font-display text-lg font-bold text-white" style={{ background: `linear-gradient(135deg, ${island.tint[0]}, ${island.tint[1]})` }}>
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-ink-soft">{journey.topic(i, t.domain)}</span>
                      <span className="block font-display text-lg font-semibold leading-tight">{subject === 'maths' ? domainName(t.domain) : t.domain}</span>
                    </span>
                    <span className="text-sm font-bold text-ink-soft tabular">
                      {done}/{playable.length}
                    </span>
                    <ChevronDown size={20} className={`shrink-0 transition-transform ${opened ? 'rotate-180' : ''}`} aria-hidden />
                  </button>
                  {opened && (
                    <ul className="grid gap-2 border-t border-mist-deep p-3 sm:p-4">
                      {t.quests.map((q) => {
                        const p = wp[q.id]
                        const complete = isDone(p)
                        return (
                          <li key={q.id} className={`flex items-center gap-3 rounded-2xl p-3 ${q.playable ? 'bg-mist' : 'bg-mist/50'}`}>
                            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${complete ? 'bg-mint text-white' : q.playable ? 'bg-paper text-ink-soft ring-2 ring-inset ring-mist-deep' : 'bg-paper text-ink-faint'}`}>
                              {complete ? <Check size={20} strokeWidth={3} aria-hidden /> : q.playable ? <span className="text-sm font-bold tabular">{p ? Math.round((p.answered / q.size) * 100) : 0}%</span> : <Clock size={18} aria-hidden />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className={`block font-bold leading-tight ${q.playable ? '' : 'text-ink-soft'}`}>{q.title}</span>
                              <span className="mt-0.5 flex items-center gap-2 text-sm text-ink-soft">
                                {q.playable ? (
                                  <>
                                    {q.size} questions{complete && <Stars n={starsFor(p)} />}
                                  </>
                                ) : (
                                  q.note
                                )}
                              </span>
                            </span>
                            {q.playable &&
                              (complete ? (
                                <button type="button" onClick={() => onPlay(subject, q)} className="grid h-11 w-11 place-items-center rounded-xl bg-paper text-ink-soft ring-1 ring-inset ring-mist-deep" aria-label={`Play ${q.title} again`}>
                                  <RotateCcw size={18} aria-hidden />
                                </button>
                              ) : (
                                <button type="button" onClick={() => onPlay(subject, q)} className="btn btn-sun min-h-[44px] px-4 text-base">
                                  {p ? 'Continue' : 'Play'}
                                </button>
                              ))}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </section>
              )
            })}
          </div>
        </div>

        {/* stages */}
        <aside className="grid gap-5 lg:sticky lg:top-6">
          <StageLadder world={world} info={stageInfo(world, stats.answered, stats.questions)} />
          {world === 'football' &&
            (profile?.team ? (
              <>
                <FootballBoards played={stats.answered} goals={stats.firstTry} assists={stats.helped} />
                <button type="button" onClick={() => setTeamOpen(true)} className="text-sm font-bold text-ink-soft underline underline-offset-4">
                  {profile.team} · change team
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setTeamOpen(true)} className="btn btn-sun">
                Pick your Premier League team
              </button>
            ))}
          <p className="px-1 text-sm text-ink-soft">
            {stats.answered.toLocaleString('en-GB')} of {stats.questions.toLocaleString('en-GB')} questions answered in this world · {stats.stars} {stats.stars === 1 ? 'star' : 'stars'}
          </p>
        </aside>
      </div>
      <TeamPicker open={teamOpen} onClose={() => setTeamOpen(false)} />
    </main>
  )
}
