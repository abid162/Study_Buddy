import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Lock, Shirt, Trophy, X } from 'lucide-react'
import type { IslandId } from '../data/world'
import { islandById } from '../data/world'
import { CLUBS, STAGES, assistChart, goldenBoot, leagueTable, ordinal, stageInfo } from '../data/stages'
import { useProfile } from '../data/profile'

type Info = ReturnType<typeof stageInfo>

/** Horizontal stage road: done stages ticked, the current one glowing, the rest locked. */
export function StageTrack({ world, info }: { world: IslandId; info: Info }) {
  const tint = islandById(world).tint
  const ref = useRef<HTMLOListElement>(null)
  useEffect(() => {
    const el = ref.current?.children[info.index] as HTMLElement | undefined
    if (el && ref.current) ref.current.scrollLeft = el.offsetLeft - ref.current.clientWidth / 2 + el.clientWidth / 2
  }, [info.index])
  return (
    <ol ref={ref} className="-mx-1 flex snap-x gap-0 overflow-x-auto px-1 pb-2 pt-1" aria-label={`${STAGES[world].title} stages`}>
      {info.list.map((s, i) => {
        const done = i < info.index
        const now = i === info.index
        return (
          <li key={s.name} className="relative flex w-[92px] shrink-0 snap-center flex-col items-center text-center" aria-current={now ? 'step' : undefined}>
            {i > 0 && <span className={`absolute left-0 top-[22px] h-1 w-1/2 -translate-x-0 ${i <= info.index ? '' : 'bg-mist-deep'}`} style={i <= info.index ? { background: tint[0] } : undefined} aria-hidden />}
            {i < info.list.length - 1 && <span className={`absolute right-0 top-[22px] h-1 w-1/2 ${i < info.index ? '' : 'bg-mist-deep'}`} style={i < info.index ? { background: tint[0] } : undefined} aria-hidden />}
            <span
              className={`relative z-10 grid h-11 w-11 place-items-center rounded-full ring-4 ${now ? 'ring-sun' : done ? 'ring-paper' : 'ring-paper'} ${done || now ? 'text-white' : 'bg-mist-deep text-ink-faint'}`}
              style={done || now ? { background: `linear-gradient(135deg, ${tint[0]}, ${tint[1]})` } : undefined}
            >
              {done ? <Check size={20} strokeWidth={3} aria-hidden /> : now ? <Trophy size={20} aria-hidden /> : <Lock size={16} aria-hidden />}
            </span>
            <span className={`mt-1.5 px-1 text-xs leading-tight ${now ? 'font-bold text-ink' : done ? 'font-bold text-ink-soft' : 'text-ink-faint'}`}>{s.name}</span>
          </li>
        )
      })}
    </ol>
  )
}

/** Vertical stage ladder with blurbs (world screen). */
export function StageLadder({ world, info }: { world: IslandId; info: Info }) {
  const tint = islandById(world).tint
  return (
    <section className="card p-5" aria-label={`${STAGES[world].title} stages`}>
      <p className="text-sm font-bold text-ink-soft">{STAGES[world].title}</p>
      <p className="font-display text-2xl font-semibold leading-tight">{info.stage.name}</p>
      <p className="text-sm text-ink-soft">{info.next ? `${info.needed} more ${info.needed === 1 ? 'answer' : 'answers'} to reach ${info.next.name}` : 'Top of the ladder!'}</p>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-mist-deep">
        <motion.div className="h-full rounded-full" style={{ background: tint[0] }} initial={{ width: 0 }} animate={{ width: `${Math.round(info.within * 100)}%` }} />
      </div>
      <ol className="mt-4 grid gap-1.5">
        {[...info.list].map((s, i) => ({ s, i })).reverse().map(({ s, i }) => {
          const done = i < info.index
          const now = i === info.index
          return (
            <li key={s.name} className={`flex items-center gap-3 rounded-2xl p-2 ${now ? 'bg-sun-soft ring-2 ring-inset ring-sun' : ''}`}>
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-white ${done || now ? '' : 'bg-mist-deep text-ink-faint'}`} style={done || now ? { background: tint[0] } : undefined}>
                {done ? <Check size={16} strokeWidth={3} aria-hidden /> : now ? <Trophy size={16} aria-hidden /> : <Lock size={14} aria-hidden />}
              </span>
              <span className="min-w-0">
                <span className={`block text-sm leading-tight ${now ? 'font-bold' : done ? 'font-bold text-ink-soft' : 'text-ink-faint'}`}>{s.name}</span>
                {now && <span className="block text-xs text-ink-soft">{s.blurb}</span>}
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

/** League table, Golden Boot and assists charts for the football world. */
export function FootballBoards({ played, goals, assists, compact = false }: { played: number; goals: number; assists: number; compact?: boolean }) {
  const { profile } = useProfile()
  const team = profile?.team
  const name = profile?.name ?? 'You'
  if (!team) return null
  const table = leagueTable(team, played, goals + assists, 0)
  const pos = table.findIndex((r) => r.you)
  const shown = compact ? table.filter((_, i) => i < 3 || Math.abs(i - pos) <= 1) : table
  const boot = goldenBoot(team, played, name, goals).slice(0, compact ? 3 : 6)
  const ast = assistChart(team, played, name, assists).slice(0, compact ? 3 : 6)
  const Row = ({ r, i }: { r: (typeof table)[number]; i: number }) => (
    <li className={`grid grid-cols-[22px_1fr_28px_28px_36px] items-center gap-1 rounded-lg px-2 py-1.5 text-sm ${r.you ? 'bg-sun-soft font-bold ring-2 ring-inset ring-sun' : i % 2 ? '' : 'bg-mist'}`}>
      <span className="text-ink-soft tabular">{table.indexOf(r) + 1}</span>
      <span className="truncate">{r.club}</span>
      <span className="text-right tabular text-ink-soft">{r.p}</span>
      <span className="text-right tabular text-ink-soft">{r.w}</span>
      <span className="text-right font-bold tabular">{r.pts}</span>
    </li>
  )
  const Chart = ({ title, rows, unit }: { title: string; rows: ReturnType<typeof goldenBoot>; unit: string }) => (
    <section className="card p-4">
      <p className="mb-2 font-display text-lg font-semibold">{title}</p>
      <ol className="grid gap-1">
        {rows.map((r, i) => (
          <li key={r.name} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${r.you ? 'bg-sun-soft font-bold ring-2 ring-inset ring-sun' : i % 2 ? '' : 'bg-mist'}`}>
            <span className="w-5 text-ink-soft tabular">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate">
              {r.name} <span className="font-normal text-ink-soft">· {r.club}</span>
            </span>
            <span className="tabular">
              {r.n} {unit}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
  return (
    <div className="grid gap-4">
      <section className="card p-4" aria-label="League table">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="font-display text-lg font-semibold">League table</p>
          <p className="text-sm font-bold">{team} are {ordinal(pos + 1)}</p>
        </div>
        <div className="grid grid-cols-[22px_1fr_28px_28px_36px] gap-1 px-2 pb-1 text-xs font-bold text-ink-faint">
          <span>#</span>
          <span>Club</span>
          <span className="text-right">P</span>
          <span className="text-right">W</span>
          <span className="text-right">Pts</span>
        </div>
        <ol className="grid gap-0.5">
          {shown.map((r, i) => (
            <Row key={r.club} r={r} i={i} />
          ))}
        </ol>
        <p className="mt-2 text-xs text-ink-soft">Every right answer is a win: +3 points. Rival results and players are invented.</p>
      </section>
      <div className={`grid gap-4 ${compact ? '' : 'sm:grid-cols-2'}`}>
        <Chart title="Golden Boot" rows={boot} unit={boot[0]?.n === 1 ? 'goal' : 'goals'} />
        <Chart title="Assists" rows={ast} unit="" />
      </div>
    </div>
  )
}

/** Pick a favourite Premier League club (names only). */
export function TeamPicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile, save } = useProfile()
  return (
    <AnimatePresence>
      {open && profile && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="Close" className="absolute inset-0 bg-night-deep/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-title"
            className="relative max-h-[86dvh] w-full max-w-[520px] overflow-y-auto rounded-t-4xl bg-paper p-5 shadow-pop sm:rounded-4xl"
            initial={{ y: 60 }}
            animate={{ y: 0 }}
            exit={{ y: 80, opacity: 0 }}
            style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 id="team-title" className="font-display text-2xl font-semibold">
                  Pick your team
                </h2>
                <p className="text-ink-soft">Every right answer wins your team 3 points.</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-mist">
                <X size={22} aria-hidden />
              </button>
            </div>
            <ul className="grid grid-cols-2 gap-2">
              {CLUBS.map((c) => (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => {
                      void save({ ...profile, team: c }).catch(() => {})
                      onClose()
                    }}
                    className={`flex min-h-[52px] w-full items-center gap-2 rounded-2xl px-3 text-left font-bold ring-2 ring-inset transition-colors ${profile.team === c ? 'bg-sun-soft ring-sun' : 'bg-mist ring-mist-deep hover:bg-mist-deep'}`}
                  >
                    <Shirt size={18} className="shrink-0 text-ink-soft" aria-hidden />
                    <span className="leading-tight">{c}</span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Live stage tracker for the question screen (phones and tablets): the child walks from this stage to the next as they answer. */
export function StageStrip({ world, info, avatar }: { world: IslandId; info: Info; avatar: React.ReactNode }) {
  const p = info.next ? info.within : 1
  return (
    <div className="relative mx-auto w-full max-w-[1160px] px-4 pb-3 sm:px-6 lg:hidden" aria-label={`Stage ${info.index + 1}, ${info.stage.name}. ${info.next ? `${info.needed} more to ${info.next.name}` : 'Top stage'}`}>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs font-bold">
        <span className="truncate text-sun">
          Stage {info.index + 1} · {info.stage.name}
        </span>
        <span className="shrink-0 text-white/75">{info.next ? `${info.needed} to ${info.next.name}` : 'Champion!'}</span>
      </div>
      <div className="relative h-8">
        <div className="track track-dark absolute inset-x-4 top-1/2 h-3 -translate-y-1/2">
          <motion.div className="fill bg-sun" initial={false} animate={{ width: `${p * 100}%` }} transition={{ type: 'spring', stiffness: 90, damping: 18 }} />
        </div>
        <motion.span
          className="absolute top-0 h-8 w-8 -translate-x-1/2 overflow-hidden rounded-full bg-white shadow-[0_3px_0_rgba(10,8,40,0.4)] ring-[2.5px] ring-sun"
          initial={false}
          animate={{ left: `calc(1rem + (100% - 2rem) * ${p})` }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
          aria-hidden
        >
          {avatar}
        </motion.span>
        <span className="absolute right-0 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-sun text-ink shadow-[inset_0_2px_0_rgba(255,255,255,0.6),0_3px_0_#C98F00]" aria-hidden>
          <Trophy size={15} />
        </span>
      </div>
      <span className="sr-only">{STAGES[world].title}</span>
    </div>
  )
}

/** Live stage ladder for the question screen (desktop side column): the child climbs as they answer. */
export function StageClimb({ world, info, avatar }: { world: IslandId; info: Info; avatar: React.ReactNode }) {
  const tint = islandById(world).tint
  const n = info.list.length
  const ROW = 52
  // position on the ladder, 0 = first stage, n-1 = top
  const at = info.index + (info.next ? info.within : 0)
  return (
    <section className="card p-5" aria-label={`${STAGES[world].title}: stage ${info.index + 1} of ${n}`}>
      <p className="text-sm font-bold text-ink-soft">{STAGES[world].title}</p>
      <p className="font-display text-xl font-semibold leading-tight">{info.stage.name}</p>
      <p className="text-sm text-ink-soft">{info.next ? `${info.needed} more ${info.needed === 1 ? 'answer' : 'answers'} to ${info.next.name}` : 'Top of the ladder!'}</p>
      <div className="relative mt-4" style={{ height: ROW * (n - 1) + 36 }}>
        {/* rail */}
        <span className="absolute bottom-[18px] left-[17px] top-[18px] w-1.5 -translate-x-1/2 rounded-full bg-mist-deep" aria-hidden />
        <motion.span
          className="absolute bottom-[18px] left-[17px] w-1.5 -translate-x-1/2 rounded-full"
          style={{ background: tint[0] }}
          initial={false}
          animate={{ height: at * ROW }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
          aria-hidden
        />
        {info.list.map((s, i) => {
          const done = i < info.index
          const now = i === info.index
          return (
            <div key={s.name} className="absolute left-0 right-0 flex items-center gap-3" style={{ bottom: i * ROW }}>
              <span
                className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ${done || now ? 'text-white' : 'bg-mist-deep text-ink-faint'}`}
                style={done || now ? { background: tint[0] } : undefined}
              >
                {done ? <Check size={16} strokeWidth={3} aria-hidden /> : now ? <Trophy size={16} aria-hidden /> : <Lock size={14} aria-hidden />}
              </span>
              <span className={`min-w-0 truncate pl-8 text-sm ${now ? 'font-bold text-ink' : done ? 'font-bold text-ink-soft' : 'text-ink-faint'}`}>{s.name}</span>
            </div>
          )
        })}
        {/* the child, climbing */}
        <motion.span
          className="absolute left-[40px] z-20 h-9 w-9 overflow-hidden rounded-full bg-white shadow-card ring-2 ring-sun"
          initial={false}
          animate={{ bottom: at * ROW }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
          aria-hidden
        >
          {avatar}
        </motion.span>
      </div>
    </section>
  )
}
