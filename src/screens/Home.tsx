import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowLeftRight, BookOpen, Calculator, Check, ChevronRight, Flame, Gem, Map as MapIcon, Mic, Play, ScanLine, Shirt, Sparkles, Swords, Target, type LucideIcon } from 'lucide-react'
import { CHILD, DAILY, islandById, type IslandId } from '../data/world'
import { Photo, StageMap, WorldMap } from '../components/art'
import { Bar, SkyScene } from '../components/scene'
import { TeamPicker } from '../components/journey'
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

const XP_PER_LEVEL = 500
const rise = (i: number) => ({ initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.06 * i, ease: [0.16, 1, 0.3, 1] as const } })

const MISSION: Record<string, { icon: LucideIcon; tone: string }> = {
  quest: { icon: Target, tone: 'linear-gradient(180deg,#8F72FF,#6E4BF5)' },
  read: { icon: Mic, tone: 'linear-gradient(180deg,#8AD4FF,#3E8EF0)' },
  scan: { icon: ScanLine, tone: 'linear-gradient(180deg,#5FE0AC,#17A873)' },
}

/** The child's avatar inside a ring that fills as they earn XP, with their level pinned on. */
function LevelAvatar({ value, level, children }: { value: number; level: number; children: React.ReactNode }) {
  const R = 37
  const C = 2 * Math.PI * R
  return (
    <div className="relative h-[84px] w-[84px] shrink-0">
      <svg viewBox="0 0 84 84" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
        <circle cx={42} cy={42} r={R} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={7} />
        <motion.circle cx={42} cy={42} r={R} fill="none" stroke="#FFC93C" strokeWidth={7} strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - Math.max(0.04, value)) }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} />
      </svg>
      <div className="absolute inset-[9px] overflow-hidden rounded-full bg-white">{children}</div>
      <span className="absolute -bottom-1 -right-1 grid h-8 min-w-8 place-items-center rounded-full px-1.5 font-display text-base font-bold text-ink tabular ring-[3px] ring-white" style={{ background: 'linear-gradient(180deg,#FFD95E,#FFB81F)', boxShadow: '0 3px 0 #C98F00' }} aria-hidden>
        {level}
      </span>
    </div>
  )
}

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
  const hour = new Date().getHours()
  const [teamOpen, setTeamOpen] = useState(false)
  const [picked, setPicked] = useState<IslandId | null>(null)
  /** one world: always show its stage road; several: the island map until one is tapped */
  const focus: IslandId | null = picks.length === 1 ? picks[0]! : picked
  const mapStages = Object.fromEntries(
    picks.map((w) => {
      const st = worldStats(progress.world(w), year)
      const info = stageInfo(w, st.answered, st.questions)
      return [w, { n: info.index + 1, name: info.stage.name, within: info.next ? info.within : 1 }]
    }),
  )
  const subjectFraction = (s: Subject) => picks.reduce((a, w) => a + worldStats(progress.world(w), year, s).fraction, 0) / picks.length
  const nextTopic = (s: Subject) => {
    const q = nextQuest(fwp, year, s)
    return q ? (s === 'maths' ? domainName(q.domain) : q.domain) : 'All done!'
  }

  return (
    <main className="mx-auto w-full max-w-[1240px]">
      <header className="relative overflow-hidden px-5 pb-28 pt-[calc(env(safe-area-inset-top,0px)+18px)] text-white sm:px-8 lg:mx-4 lg:mt-4 lg:rounded-[36px]">
        <SkyScene night={hour >= 18 || hour < 6} />
        <div className="relative flex items-center gap-4">
          <LevelAvatar value={xp / XP_PER_LEVEL} level={level}>
            <ChildAvatar data={profile?.avatar} className="h-full w-full" title={`${name}'s avatar`} />
          </LevelAvatar>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-white/85">{greeting()},</p>
            <h1 className="title-pop truncate font-display text-[2.1rem] font-semibold leading-none sm:text-[2.5rem]">{name}!</h1>
          </div>
          <button
            type="button"
            onClick={reset}
            aria-label={`Not ${name}? Switch explorer`}
            className="hud !min-h-[44px] shrink-0 !pl-3 transition-transform hover:-translate-y-0.5 active:translate-y-0.5 max-sm:!h-11 max-sm:!w-11 max-sm:justify-center max-sm:!p-0"
          >
            <ArrowLeftRight size={18} aria-hidden /> <span className="text-sm max-sm:hidden">Switch explorer</span>
          </button>
        </div>

        <div className="relative mt-5 flex flex-wrap items-center gap-2.5">
          <span className="hud">
            <span className="hud-icon bg-coral">
              <Flame size={18} className="flicker fill-sun text-sun" aria-hidden />
            </span>
            <span className="tabular">{CHILD.streak}</span> <span className="text-sm font-medium text-white/85">day streak</span>
          </span>
          <motion.span key={progress.gems} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="hud">
            <span className="hud-icon bg-sea">
              <Gem size={17} className="fill-sea-soft text-white" aria-hidden />
            </span>
            <span className="tabular">{progress.gems}</span> <span className="text-sm font-medium text-white/85">gems</span>
          </motion.span>
          <div className="min-w-[200px] flex-1 basis-full sm:basis-0">
            <div className="mb-1 flex justify-between gap-3 text-xs font-bold text-white/90">
              <span>
                Level {level} explorer · Year {year}
              </span>
              <span className="tabular">
                {xp} / {XP_PER_LEVEL} XP
              </span>
            </div>
            <Bar value={xp / XP_PER_LEVEL} tone="#FFC93C" dark className="h-3.5" />
          </div>
        </div>
      </header>

      <div className="relative -mt-20 grid gap-6 px-4 pb-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="grid min-w-0 gap-6">
          {up && (
            <motion.section {...rise(0)} className="overflow-hidden rounded-[32px] bg-paper shadow-pop" aria-labelledby="quest-title">
              <div className="relative">
                <Photo island={featured.id} alt={`${featured.name} photo`} className="h-48 sm:h-60" w={1200} banner />
                <div className="absolute inset-0 bg-gradient-to-t from-night-deep via-night-deep/45 to-transparent" aria-hidden />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full py-1.5 pl-2 pr-3.5 font-display text-sm font-semibold text-ink sm:left-6" style={{ background: 'linear-gradient(180deg,#FFD95E,#FFB81F)', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.6), 0 3px 0 #C98F00' }}>
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white/70">
                    <Sparkles size={14} aria-hidden />
                  </span>
                  Today's quest
                </span>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                  <p className="font-bold text-sun">
                    {featured.name} · {journey.title}
                  </p>
                  <h2 id="quest-title" className="title-pop mt-0.5 font-display text-[1.6rem] font-semibold leading-tight sm:text-[2rem]">
                    {up.title}
                  </h2>
                  <p className="text-white/90">
                    {domainName(up.domain)}, Year {year} maths
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 p-5 sm:p-6">
                <div className="min-w-[180px] flex-1">
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-sm font-bold">
                    <span>{upP ? `${upP.answered} of ${up.size} done` : `${up.size} questions`}</span>
                    <span className="chip bg-sea-soft/60 py-0.5 text-ink">
                      <Gem size={14} className="fill-sea-soft text-sea-deep" aria-hidden /> +{up.size * 10} gems
                    </span>
                  </div>
                  <Bar value={upP ? upP.answered / up.size : 0} tone="#22C58B" className="h-3.5" />
                </div>
                <button type="button" className="btn btn-sun sheen w-full text-xl sm:w-auto sm:px-8" onClick={() => onPlay(featured.id, 'maths', up)}>
                  <Play size={22} className="fill-ink" aria-hidden /> {upP ? 'Continue quest' : 'Start quest'}
                </button>
              </div>
            </motion.section>
          )}

          <motion.section {...rise(1)} className="card overflow-hidden p-3 sm:p-4" aria-labelledby="world-title">
            {focus ? (
              <StagePanel
                world={focus}
                year={year}
                onBack={picks.length > 1 ? () => setPicked(null) : undefined}
                onOpen={() => onWorld(focus)}
                onPlay={(sub, q) => onPlay(focus, sub, q)}
                onTeam={() => setTeamOpen(true)}
              />
            ) : (
              <>
                <div className="flex items-center gap-3 px-2 pb-3 pt-1">
                  <span className="tile h-12 w-12" style={{ background: 'linear-gradient(180deg,#6FD3FF,#3E8EF0)' }}>
                    <MapIcon size={24} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 id="world-title" className="font-display text-2xl font-semibold leading-tight">
                      Your world
                    </h2>
                    <p className="text-ink-soft">Tap an island to see its stages.</p>
                  </div>
                  <span className="chip shrink-0 whitespace-nowrap bg-grape-soft text-grape-deep">{picks.length} worlds</span>
                </div>
                <div className="mx-auto max-w-[560px]">
                  <WorldMap picks={picks} current={featured.id} onPick={(i) => setPicked(i.id)} stages={mapStages} />
                </div>
              </>
            )}
          </motion.section>
        </div>

        <aside className="grid gap-6 lg:sticky lg:top-6">
          <motion.section {...rise(2)} className="relative flex items-center gap-4 overflow-hidden rounded-[28px] p-5 shadow-card" style={{ background: 'linear-gradient(135deg,#FFF6D6 0%,#FFE7C2 100%)' }} aria-label="Message from Nova">
            <BuddyDuo data={profile?.avatar} mood="wink" name={name} />
            <div className="relative min-w-0 flex-1 rounded-3xl rounded-bl-lg bg-paper px-4 py-3 shadow-[0_3px_0_rgba(23,21,58,0.08)]">
              <p className="font-display text-lg font-semibold leading-tight">Nova says</p>
              <p className="text-ink-soft">{up ? `Ready, ${name}? Your next ${journey.quest.toLowerCase()} in ${featured.name} is waiting.` : `Amazing, ${name}! Try another world.`}</p>
            </div>
          </motion.section>

          <motion.section {...rise(3)} className="card p-5" aria-labelledby="daily-title">
            <div className="mb-3 flex items-center gap-3">
              <span className="tile h-11 w-11" style={{ background: 'linear-gradient(180deg,#FF9A7A,#FF6B57)' }}>
                <Swords size={22} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="daily-title" className="font-display text-xl font-semibold leading-tight">
                  Daily missions
                </h2>
                <p className="text-sm text-ink-soft">New ones at midnight</p>
              </div>
            </div>
            <ul className="grid gap-2.5">
              {DAILY.map((d) => {
                const done = d.done >= d.total
                const m = MISSION[d.id] ?? MISSION.quest!
                return (
                  <li key={d.id} className="flex items-center gap-3 rounded-[20px] bg-[#F4F5FE] p-3 shadow-[inset_0_0_0_2px_rgba(23,21,58,0.04)]">
                    <span className="tile h-11 w-11" style={{ background: done ? 'linear-gradient(180deg,#5FE0AC,#17A873)' : m.tone }}>
                      {done ? <Check size={22} strokeWidth={3} aria-hidden /> : <m.icon size={22} aria-hidden />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="font-bold leading-tight">{d.label}</span>
                        <span className="shrink-0 text-xs font-bold text-ink-soft tabular">
                          {d.done}/{d.total}
                        </span>
                      </span>
                      <Bar value={d.done / d.total} tone="#7C5CFF" className="mt-1.5 h-2.5" />
                    </span>
                    <span className="chip shrink-0 bg-paper text-ink shadow-[0_2px_0_rgba(23,21,58,0.1)]">
                      <Gem size={14} className="fill-sea-soft text-sea-deep" aria-hidden /> {d.reward}
                    </span>
                  </li>
                )
              })}
            </ul>
          </motion.section>

          <motion.section {...rise(4)} className="grid grid-cols-2 gap-4" aria-label="Subjects">
            {(
              [
                { id: 'maths', name: 'Maths', icon: Calculator, bg: 'linear-gradient(150deg,#7C5CFF 0%,#5B3BE0 100%)', edge: '#3F25B0' },
                { id: 'english', name: 'English', icon: BookOpen, bg: 'linear-gradient(150deg,#13996B 0%,#0B6E4C 100%)', edge: '#07513A' },
              ] as const
            ).map((s) => {
              const v = subjectFraction(s.id)
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => onWorld(featured.id)}
                  className="relative overflow-hidden rounded-[26px] p-4 text-left text-white transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-1"
                  style={{ background: s.bg, boxShadow: `inset 0 2px 0 rgba(255,255,255,0.3), 0 6px 0 ${s.edge}, 0 18px 26px -14px ${s.edge}` }}
                >
                  <s.icon size={86} className="pointer-events-none absolute -right-4 -top-3 rotate-12 text-white/15" aria-hidden />
                  <span className="relative grid h-11 w-11 place-items-center rounded-2xl bg-white/20 shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.3)]">
                    <s.icon size={24} aria-hidden />
                  </span>
                  <p className="relative mt-3 font-display text-xl font-semibold leading-tight">{s.name}</p>
                  <p className="relative truncate text-sm text-white/90">Next: {nextTopic(s.id)}</p>
                  <div className="relative mt-3 flex items-center gap-2">
                    <Bar value={v} tone="#FFC93C" dark className="h-2.5 flex-1" />
                    <span className="text-sm font-bold tabular">{Math.round(v * 100)}%</span>
                  </div>
                </button>
              )
            })}
          </motion.section>
        </aside>
      </div>
      <TeamPicker open={teamOpen} onClose={() => setTeamOpen(false)} />
    </main>
  )
}

/** One world's stages on the map card: the stage road with the child on it, then Play. */
function StagePanel({
  world,
  year,
  onBack,
  onOpen,
  onPlay,
  onTeam,
}: {
  world: IslandId
  year: Year
  onBack?: () => void
  onOpen: () => void
  onPlay: (s: Subject, q: QuestDef) => void
  onTeam: () => void
}) {
  const { profile } = useProfile()
  const progress = useProgress()
  const island = islandById(world)
  const journey = JOURNEYS[world]
  const wp = progress.world(world)
  const stats = worldStats(wp, year)
  const info = stageInfo(world, stats.answered, stats.questions)
  const maths = nextQuest(wp, year, 'maths')
  const english = nextQuest(wp, year, 'english')
  const team = profile?.team
  const table = world === 'football' && team ? leagueTable(team, stats.answered, stats.firstTry + stats.helped, 0) : null
  const pos = table ? table.findIndex((r) => r.you) + 1 : 0
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4">
      <div className="flex items-center gap-3 px-1 pt-1">
        {onBack && (
          <button type="button" onClick={onBack} aria-label="Back to all worlds" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper text-ink shadow-[inset_0_0_0_2px_#DCE0F5,0_3px_0_#CDD2EE] transition-transform hover:-translate-y-0.5 active:translate-y-0.5">
            <ArrowLeft size={22} aria-hidden />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold" style={{ color: island.tint[1] }}>
            {island.name} · {STAGES[world].title}
          </p>
          <h2 id="world-title" className="truncate font-display text-2xl font-semibold leading-tight">
            Stage {info.index + 1}: {info.stage.name}
          </h2>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[440px]">
        <StageMap
          world={world}
          names={info.list.map((s) => s.name)}
          index={info.index}
          within={info.next ? info.within : 0}
          marker={<ChildAvatar data={profile?.avatar} className="h-[38px] w-[38px]" />}
        />
      </div>
      <p className="px-1 text-center text-ink-soft">
        {info.next ? (
          <>
            <span className="font-bold text-ink">{info.needed}</span> more {info.needed === 1 ? 'answer' : 'answers'} to reach <span className="font-bold text-ink">{info.next.name}</span>
          </>
        ) : (
          'Top of the ladder. Champion!'
        )}
      </p>
      {world === 'football' &&
        (team ? (
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              ['Position', ordinal(pos)],
              ['Points', String((stats.firstTry + stats.helped) * 3)],
              ['Goals', String(stats.firstTry)],
              ['Assists', String(stats.helped)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-[#E6F8EE] p-2 shadow-[inset_0_0_0_2px_rgba(15,138,95,0.12)]">
                <p className="font-display text-xl font-semibold tabular text-[#0B6B45]">{v}</p>
                <p className="text-xs font-bold text-ink-soft">{k}</p>
              </div>
            ))}
            <button type="button" onClick={onTeam} className="col-span-4 flex min-h-[44px] items-center justify-center gap-2 text-sm font-bold text-ink-soft underline underline-offset-4">
              <Shirt size={16} aria-hidden /> {team} · change team
            </button>
          </div>
        ) : (
          <button type="button" onClick={onTeam} className="btn btn-ghost w-full">
            <Shirt size={20} aria-hidden /> Pick your Premier League team
          </button>
        ))}
      <div className="grid grid-cols-2 gap-3">
        {(
          [
            ['maths', 'Maths', Calculator, maths, 'linear-gradient(150deg,#7C5CFF 0%,#5B3BE0 100%)', '#3F25B0'],
            ['english', 'English', BookOpen, english, 'linear-gradient(150deg,#13996B 0%,#0B6E4C 100%)', '#07513A'],
          ] as const
        ).map(([sub, label, Icon, q, bg, edge]) => (
          <button
            key={sub}
            type="button"
            disabled={!q}
            onClick={() => q && onPlay(sub, q)}
            className="flex min-h-[104px] flex-col items-start justify-between rounded-3xl p-4 text-left text-white transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-1 disabled:opacity-50"
            style={{ background: bg, boxShadow: `inset 0 2px 0 rgba(255,255,255,0.3), 0 6px 0 ${edge}` }}
          >
            <span className="flex w-full items-center justify-between">
              <Icon size={28} aria-hidden />
              <span className="grid h-9 w-9 place-items-center rounded-full bg-sun text-ink shadow-[0_3px_0_#C98F00]">
                <Play size={18} className="ml-0.5 fill-current" aria-hidden />
              </span>
            </span>
            <span className="w-full min-w-0">
              <span className="block font-display text-xl font-semibold leading-tight">{label}</span>
              <span className="block truncate text-sm text-white/90">{q ? q.title : 'All done!'}</span>
            </span>
          </button>
        ))}
      </div>
      <button type="button" onClick={onOpen} className="btn btn-ghost w-full">
        See all {plural(journey.quest.toLowerCase())} <ChevronRight size={20} aria-hidden />
      </button>
    </motion.div>
  )
}

const plural = (w: string) => (/(ch|sh|s|x)$/.test(w) ? `${w}es` : `${w}s`)
