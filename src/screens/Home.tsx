import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Calculator, Check, ChevronRight, Flame, Gem, Play, Shirt, Sparkles } from 'lucide-react'
import { CHILD, DAILY, islandById, type IslandId } from '../data/world'
import { Photo } from '../components/art'
import { StageTrack, TeamPicker } from '../components/journey'
import { STAGES, leagueTable, ordinal, stageInfo } from '../data/stages'
import { useProfile } from '../data/profile'
import { BuddyDuo, ChildAvatar } from '../components/avatar'
import { nextQuest, useProgress, worldStats } from '../data/progress'
import { domainName, type QuestDef, type Subject, type Year } from '../data/syllabus'
import { JOURNEYS } from '../data/journeys'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

function Progress({ value, tone = 'sun' }: { value: number; tone?: 'sun' | 'mint' | 'grape' }) {
  const color = tone === 'sun' ? 'bg-sun' : tone === 'mint' ? 'bg-mint' : 'bg-grape'
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/15" role="presentation">
      <motion.div className={`h-full rounded-full ${color}`} initial={{ width: 0 }} animate={{ width: `${Math.round(value * 100)}%` }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
    </div>
  )
}

const XP_PER_LEVEL = 500

export function Home({ onWorld, onPlay }: { onWorld: (w: IslandId) => void; onPlay: (w: IslandId, s: Subject, q: QuestDef) => void }) {
  const { profile, reset } = useProfile()
  const progress = useProgress()
  const name = profile?.name ?? 'Explorer'
  const year = (profile?.year ?? 5) as Year
  const picks: IslandId[] = profile?.interests.length ? profile.interests : ['football']
  const featured = islandById(picks[0]!)
  const journey = JOURNEYS[featured.id]
  const fwp = progress.world(featured.id)
  const up = nextQuest(fwp, year, 'maths')
  const upP = up ? fwp[up.id] : undefined
  const level = 1 + Math.floor(progress.gems / XP_PER_LEVEL)
  const xp = progress.gems % XP_PER_LEVEL
  const [teamOpen, setTeamOpen] = useState(false)
  const subjectFraction = (s: Subject) => picks.reduce((a, w) => a + worldStats(progress.world(w), year, s).fraction, 0) / picks.length
  const nextTopic = (s: Subject) => {
    const q = nextQuest(fwp, year, s)
    return q ? (s === 'maths' ? domainName(q.domain) : q.domain) : 'All done!'
  }

  const stat = (
    <div className="flex flex-wrap gap-2">
      <span className="chip bg-white/10 text-white ring-1 ring-inset ring-white/15">
        <Flame size={16} className="text-coral" aria-hidden /> <span className="tabular">{CHILD.streak}</span> day streak
      </span>
      <span className="chip bg-white/10 text-white ring-1 ring-inset ring-white/15">
        <Gem size={16} className="text-sea-soft" aria-hidden /> <span className="tabular">{progress.gems}</span>
      </span>
    </div>
  )

  return (
    <main className="mx-auto w-full max-w-[1240px]">
      <header className="relative overflow-hidden bg-night px-5 pb-24 pt-[calc(env(safe-area-inset-top,0px)+20px)] text-white sm:px-8 lg:rounded-b-4xl">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-grape/40 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-sea/30 blur-3xl" aria-hidden />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full ring-4 ring-white/20">
              <ChildAvatar data={profile?.avatar} className="h-16 w-16" title={`${name}'s avatar`} />
            </div>
            <div>
              <p className="text-sm text-white/70">{greeting()},</p>
              <h1 className="font-display text-[1.75rem] font-semibold leading-tight">{name}</h1>
              <button type="button" onClick={reset} className="text-sm font-bold text-white/70 underline decoration-white/40 underline-offset-4 hover:text-white">
                Not {name}? Switch explorer
              </button>
            </div>
          </div>
          <div className="hidden sm:block">{stat}</div>
        </div>
        <div className="relative mt-5 sm:hidden">{stat}</div>
        <div className="relative mt-5 flex items-center gap-3">
          <span className="grid h-9 min-w-9 place-items-center rounded-xl bg-sun px-2 font-display text-lg font-bold text-ink tabular">{level}</span>
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-xs font-bold text-white/75">
              <span>Level {level} explorer · Year {year}</span>
              <span className="tabular">
                {xp} / {XP_PER_LEVEL} XP
              </span>
            </div>
            <Progress value={xp / XP_PER_LEVEL} />
          </div>
        </div>
      </header>

      <div className="relative -mt-16 grid gap-6 px-4 pb-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="grid min-w-0 gap-6">
          {up && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden rounded-4xl bg-paper shadow-pop"
              aria-labelledby="quest-title"
            >
              <div className="relative">
                <Photo island={featured.id} alt={`${featured.name} photo`} className="h-44 sm:h-56" w={1200} />
                <div className="absolute inset-0 bg-gradient-to-t from-night-deep/90 via-night-deep/30 to-transparent" aria-hidden />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                  <span className="chip bg-sun text-ink">
                    <Sparkles size={14} aria-hidden /> Today's quest · {journey.title}
                  </span>
                  <h2 id="quest-title" className="mt-2 font-display text-[1.6rem] font-semibold leading-tight sm:text-[2rem]">
                    {up.title}
                  </h2>
                  <p className="text-white/85">
                    {featured.name}. {domainName(up.domain)}, Year {year} maths.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 p-5 sm:p-6">
                <div className="min-w-[180px] flex-1">
                  <div className="mb-1.5 flex justify-between text-sm font-bold">
                    <span>
                      {upP ? `${upP.answered} of ${up.size} done` : `${up.size} questions`}
                    </span>
                    <span className="text-ink-soft">+{up.size * 10} gems to finish</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-mist-deep">
                    <div className="h-full rounded-full bg-mint" style={{ width: `${upP ? (upP.answered / up.size) * 100 : 0}%` }} />
                  </div>
                </div>
                <button type="button" className="btn btn-sun w-full sm:w-auto" onClick={() => onPlay(featured.id, 'maths', up)}>
                  <Play size={20} className="fill-ink" aria-hidden /> {upP ? 'Continue quest' : 'Start quest'}
                </button>
              </div>
            </motion.section>
          )}

          <section aria-labelledby="world-title" className="grid gap-4">
            <div className="flex items-end justify-between gap-3 px-1">
              <div>
                <h2 id="world-title" className="font-display text-2xl font-semibold">
                  Your journeys
                </h2>
                <p className="text-ink-soft">Every world covers the whole Year {year} syllabus. Climb the stages in each one.</p>
              </div>
              <span className="chip shrink-0 whitespace-nowrap bg-paper text-ink-soft shadow-card">
                {picks.length} {picks.length === 1 ? 'world' : 'worlds'}
              </span>
            </div>
            {picks.map((w, i) => (
              <JourneyCard key={w} world={w} year={year} delay={i * 0.06} onOpen={() => onWorld(w)} onPlay={(s, q) => onPlay(w, s, q)} onTeam={() => setTeamOpen(true)} />
            ))}
          </section>
        </div>

        <aside className="grid gap-6 lg:sticky lg:top-6">
          <section className="card flex items-center gap-4 p-5" aria-label="Message from Nova">
            <BuddyDuo data={profile?.avatar} mood="wink" name={name} />
            <div>
              <p className="font-display text-lg font-semibold">Nova says</p>
              <p className="text-ink-soft">{up ? `Ready, ${name}? Your next ${journey.quest.toLowerCase()} in ${featured.name} is waiting.` : `Amazing, ${name}! Try another world.`}</p>
            </div>
          </section>

          <section className="card p-5" aria-labelledby="daily-title">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="daily-title" className="font-display text-xl font-semibold">
                Daily missions
              </h2>
              <span className="text-sm font-bold text-ink-soft">Resets at midnight</span>
            </div>
            <ul className="grid gap-3">
              {DAILY.map((d) => {
                const done = d.done >= d.total
                return (
                  <li key={d.id} className="flex items-center gap-3 rounded-2xl bg-mist p-3">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${done ? 'bg-mint text-white' : 'bg-paper text-ink-faint ring-2 ring-inset ring-mist-deep'}`}>
                      {done ? <Check size={18} strokeWidth={3} aria-hidden /> : <span className="text-sm font-bold tabular">{Math.round((d.done / d.total) * 100)}%</span>}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold leading-tight">{d.label}</span>
                      <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-mist-deep">
                        <span className="block h-full rounded-full bg-grape" style={{ width: `${(d.done / d.total) * 100}%` }} />
                      </span>
                    </span>
                    <span className="chip shrink-0 bg-sun-soft text-ink">
                      <Gem size={14} className="text-sea" aria-hidden /> {d.reward}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="grid grid-cols-2 gap-4" aria-label="Subjects">
            {(
              [
                { id: 'maths', name: 'Maths', icon: Calculator, tone: 'bg-grape', soft: 'bg-grape-soft text-grape-deep' },
                { id: 'english', name: 'English', icon: BookOpen, tone: 'bg-mint', soft: 'bg-mint-soft text-mint-deep' },
              ] as const
            ).map((s) => {
              const v = subjectFraction(s.id)
              return (
                <button key={s.name} type="button" onClick={() => onWorld(featured.id)} className="card p-4 text-left">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${s.soft}`}>
                    <s.icon size={22} aria-hidden />
                  </span>
                  <p className="mt-3 font-display text-lg font-semibold">{s.name}</p>
                  <p className="truncate text-sm text-ink-soft">Next: {nextTopic(s.id)}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-mist-deep">
                      <div className={`h-full rounded-full ${s.tone}`} style={{ width: `${Math.max(2, v * 100)}%` }} />
                    </div>
                    <span className="text-sm font-bold tabular">{Math.round(v * 100)}%</span>
                  </div>
                </button>
              )
            })}
          </section>
        </aside>
      </div>
      <TeamPicker open={teamOpen} onClose={() => setTeamOpen(false)} />
    </main>
  )
}

function JourneyCard({ world, year, delay, onOpen, onPlay, onTeam }: { world: IslandId; year: Year; delay: number; onOpen: () => void; onPlay: (s: Subject, q: QuestDef) => void; onTeam: () => void }) {
  const { profile } = useProfile()
  const progress = useProgress()
  const island = islandById(world)
  const wp = progress.world(world)
  const stats = worldStats(wp, year)
  const info = stageInfo(world, stats.answered, stats.questions)
  const up = nextQuest(wp, year, 'maths')
  const team = profile?.team
  const table = world === 'football' && team ? leagueTable(team, stats.answered, stats.firstTry + stats.helped, 0) : null
  const pos = table ? table.findIndex((r) => r.you) + 1 : 0
  return (
    <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="overflow-hidden rounded-4xl bg-paper shadow-card">
      <button type="button" onClick={onOpen} className="relative block w-full text-left" aria-label={`Open ${island.name}`}>
        <Photo island={world} n={info.index} alt={`${island.name} photo`} className="h-32 sm:h-40" w={1000} />
        <div className="absolute inset-0 bg-gradient-to-t from-night-deep/90 via-night-deep/40 to-transparent" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white">
          <div className="min-w-0">
            <p className="text-sm font-bold text-sun">
              {island.name} · {STAGES[world].title}
            </p>
            <p className="truncate font-display text-2xl font-semibold leading-tight">{info.stage.name}</p>
          </div>
          <ChevronRight size={24} className="shrink-0" aria-hidden />
        </div>
      </button>
      <div className="grid gap-3 p-4">
        <StageTrack world={world} info={info} />
        {world === 'football' &&
          (team ? (
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                ['Position', ordinal(pos)],
                ['Points', String((stats.firstTry + stats.helped) * 3)],
                ['Goals', String(stats.firstTry)],
                ['Assists', String(stats.helped)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-mist p-2">
                  <p className="font-display text-xl font-semibold tabular">{v}</p>
                  <p className="text-xs font-bold text-ink-soft">{k}</p>
                </div>
              ))}
              <button type="button" onClick={onTeam} className="col-span-4 flex items-center justify-center gap-2 text-sm font-bold text-ink-soft underline underline-offset-4">
                <Shirt size={16} aria-hidden /> {team} · change team
              </button>
            </div>
          ) : (
            <button type="button" onClick={onTeam} className="btn btn-ghost w-full">
              <Shirt size={20} aria-hidden /> Pick your Premier League team
            </button>
          ))}
        <div className="flex flex-wrap items-center gap-3">
          <p className="min-w-0 flex-1 text-sm text-ink-soft">
            {info.next ? (
              <>
                <span className="font-bold text-ink">{info.needed}</span> more {info.needed === 1 ? 'answer' : 'answers'} to reach <span className="font-bold text-ink">{info.next.name}</span>
              </>
            ) : (
              'Top of the ladder. Champion!'
            )}
          </p>
          {up && (
            <button type="button" className="btn btn-sun min-h-[48px] px-5 text-base" onClick={() => onPlay('maths', up)}>
              <Play size={18} className="fill-ink" aria-hidden /> Play
            </button>
          )}
        </div>
      </div>
    </motion.article>
  )
}
