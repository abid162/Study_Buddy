import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, Calculator, Check, Flame, Gem, Play, Sparkles, X } from 'lucide-react'
import { CHILD, DAILY, islandById, type Island, type IslandId, type Quest } from '../data/world'
import { Photo, WorldMap } from '../components/art'
import { useProfile } from '../data/profile'
import { BuddyDuo, ChildAvatar } from '../components/avatar'

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

function StatChips() {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="chip bg-white/10 text-white ring-1 ring-inset ring-white/15">
        <Flame size={16} className="text-coral" aria-hidden /> <span className="tabular">{CHILD.streak}</span> day streak
      </span>
      <span className="chip bg-white/10 text-white ring-1 ring-inset ring-white/15">
        <Gem size={16} className="text-sea-soft" aria-hidden /> <span className="tabular">{CHILD.gems}</span>
      </span>
    </div>
  )
}

export function Home({ onPlay }: { onPlay: (island: IslandId) => void }) {
  const [sheet, setSheet] = useState<Island | null>(null)
  const { profile, reset } = useProfile()
  const name = profile?.name ?? 'Explorer'
  const year = profile?.year ?? 5
  const picks: IslandId[] = profile?.interests.length ? profile.interests : ['football']
  const featured = islandById(picks[0])
  const quest = featured.quests.find((q) => q.playable) ?? featured.quests[0]
  const levelProgress = CHILD.xp / CHILD.xpNext

  return (
    <main className="mx-auto w-full max-w-[1240px]">
      {/* header */}
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
          <div className="hidden sm:block">
            <StatChips />
          </div>
        </div>
        <div className="relative mt-5 sm:hidden">
          <StatChips />
        </div>
        <div className="relative mt-5 flex items-center gap-3">
          <span className="grid h-9 min-w-9 place-items-center rounded-xl bg-sun px-2 font-display text-lg font-bold text-ink tabular">{CHILD.level}</span>
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-xs font-bold text-white/75">
              <span>Level {CHILD.level} explorer</span>
              <span className="tabular">
                {CHILD.xp} / {CHILD.xpNext} XP
              </span>
            </div>
            <Progress value={levelProgress} />
          </div>
        </div>
      </header>

      <div className="relative -mt-16 grid gap-6 px-4 pb-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="grid min-w-0 gap-6">
          {/* today's quest */}
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
                  <Sparkles size={14} aria-hidden /> Today's quest
                </span>
                <h2 id="quest-title" className="mt-2 font-display text-[1.75rem] font-semibold leading-tight sm:text-[2rem]">
                  {quest.title}
                </h2>
                <p className="text-white/85">
                  {featured.name}. {quest.skill}, Year {year}.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 p-5 sm:p-6">
              <div className="min-w-[180px] flex-1">
                <div className="mb-1.5 flex justify-between text-sm font-bold">
                  <span>
                    Step {quest.done + 1} of {quest.steps}
                  </span>
                  <span className="text-ink-soft">+60 gems to finish</span>
                </div>
                <div className="flex gap-1.5">
                  {Array.from({ length: quest.steps }, (_, i) => (
                    <span key={i} className={`h-2.5 flex-1 rounded-full ${i < quest.done ? 'bg-mint' : i === quest.done ? 'bg-sun' : 'bg-mist-deep'}`} />
                  ))}
                </div>
              </div>
              <button type="button" className="btn btn-sun w-full sm:w-auto" onClick={() => onPlay(featured.id)}>
                <Play size={20} className="fill-ink" aria-hidden /> Continue quest
              </button>
            </div>
          </motion.section>

          {/* world map */}
          <section className="card overflow-hidden p-3 sm:p-4" aria-labelledby="world-title">
            <div className="flex items-end justify-between gap-3 px-2 pb-3 pt-1">
              <div>
                <h2 id="world-title" className="font-display text-2xl font-semibold">
                  Your world
                </h2>
                <p className="text-ink-soft">Tap any world to jump straight into its quests.</p>
              </div>
              <span className="chip shrink-0 whitespace-nowrap bg-mist text-ink-soft">
                {picks.length} {picks.length === 1 ? 'world' : 'worlds'}
              </span>
            </div>
            <div className="mx-auto max-w-[560px]">
              <WorldMap picks={picks} current={featured.id} onPick={setSheet} />
            </div>
          </section>
        </div>

        <aside className="grid gap-6 lg:sticky lg:top-6">
          {/* buddy tip */}
          <section className="card flex items-center gap-4 p-5" aria-label="Message from Nova">
            <BuddyDuo data={profile?.avatar} mood="wink" name={name} />
            <div>
              <p className="font-display text-lg font-semibold">Nova says</p>
              <p className="text-ink-soft">{`Ready, ${name}? ${quest.title} in ${featured.name} is waiting for you.`}</p>
            </div>
          </section>

          {/* daily missions */}
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

          {/* subjects */}
          <section className="grid grid-cols-2 gap-4" aria-label="Subjects">
            {[
              { name: 'Maths', icon: Calculator, value: 0.68, tone: 'bg-grape', soft: 'bg-grape-soft text-grape-deep', note: 'Fractions next' },
              { name: 'English', icon: BookOpen, value: 0.54, tone: 'bg-mint', soft: 'bg-mint-soft text-mint-deep', note: 'Reading aloud' },
            ].map((s) => (
              <div key={s.name} className="card p-4">
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${s.soft}`}>
                  <s.icon size={22} aria-hidden />
                </span>
                <p className="mt-3 font-display text-lg font-semibold">{s.name}</p>
                <p className="text-sm text-ink-soft">{s.note}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-mist-deep">
                    <div className={`h-full rounded-full ${s.tone}`} style={{ width: `${s.value * 100}%` }} />
                  </div>
                  <span className="text-sm font-bold tabular">{Math.round(s.value * 100)}%</span>
                </div>
              </div>
            ))}
          </section>
        </aside>
      </div>

      <IslandSheet island={sheet} onClose={() => setSheet(null)} onPlay={onPlay} />
    </main>
  )
}

function QuestRow({ q, onPlay }: { q: Quest; onPlay: () => void }) {
  const complete = q.done >= q.steps
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-mist p-3">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${q.subject === 'Maths' ? 'bg-grape-soft text-grape-deep' : 'bg-mint-soft text-mint-deep'}`}>
        {q.subject === 'Maths' ? <Calculator size={20} aria-hidden /> : <BookOpen size={20} aria-hidden />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold leading-tight">{q.title}</span>
        <span className="block text-sm text-ink-soft">
          {q.subject}: {q.skill}
        </span>
      </span>
      {complete ? (
        <span className="chip bg-mint-soft text-mint-deep">
          <Check size={14} strokeWidth={3} aria-hidden /> Done
        </span>
      ) : q.playable ? (
        <button type="button" onClick={onPlay} className="btn btn-sun min-h-[44px] px-4 text-base">
          Play
        </button>
      ) : (
        <span className="text-sm font-bold text-ink-faint tabular">
          {q.done}/{q.steps}
        </span>
      )}
    </li>
  )
}

function IslandSheet({ island, onClose, onPlay }: { island: Island | null; onClose: () => void; onPlay: (id: IslandId) => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!island) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [island, onClose])

  return (
    <AnimatePresence>
      {island && (
        <motion.div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="Close" className="absolute inset-0 bg-night-deep/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
            className="relative w-full max-w-[520px] overflow-hidden rounded-t-4xl bg-paper shadow-pop sm:rounded-4xl"
            initial={{ y: 60, opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          >
            <div className="relative">
              <Photo island={island.id} alt={`${island.name} postcard`} className="h-40 sm:h-48" />
              <div className="absolute inset-0 bg-gradient-to-t from-night-deep/85 to-transparent" aria-hidden />
              <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-ink">
                <X size={22} aria-hidden />
              </button>
              <div className="absolute bottom-0 left-0 p-5 text-white">
                <h2 id="sheet-title" className="font-display text-[1.75rem] font-semibold leading-tight">
                  {island.name}
                </h2>
                <p className="text-white/85">{island.tagline}</p>
              </div>
            </div>
            <div className="p-5 safe-bottom" style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom, 0px))' }}>
              <div className="mb-3 flex items-center justify-between">
                <span className="font-bold">Level {island.level} world</span>
                <span className="chip bg-sun-soft text-ink">{island.stars} {island.stars === 1 ? 'star' : 'stars'} collected</span>
              </div>
              <ul className="grid gap-2.5">
                {island.quests.map((q) => (
                  <QuestRow key={q.id} q={q} onPlay={() => onPlay(island.id)} />
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
