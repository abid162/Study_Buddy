import { useMemo, useState } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight, CheckCircle2, FileSearch, Minus, Sparkles, TrendingUp, TriangleAlert } from 'lucide-react'
import { useLearning, masteryOf, type LearnEvent, type Mastery, type ScanNote } from '../data/learning'
import { useProfile } from '../data/profile'
import { allQuests, statementById, type QuestDef, type Subject, type Year } from '../data/syllabus'
import { islandById, type IslandId } from '../data/world'
import { MATHS_STATEMENTS } from '../data/curriculum.maths'

const DAY = 864e5
const pct = (x: number) => `${Math.round(x * 100)}%`
const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

/** Made-up answers for the "sample report" button, so a parent can see what the report will look like. */
function sampleEvents(year: Year): { events: LearnEvent[]; scans: ScanNote[] } {
  const ids = MATHS_STATEMENTS.filter((s) => s.year === year).map((s) => s.id)
  const pickIds = [ids[0], ids[3], ids[6], ids[10], ids[12], ids[17], ids[20], ids[24]].filter(Boolean) as string[]
  const plan: Record<string, number[]> = {
    [pickIds[0]!]: [1, 1, 1, 1, 1, 0.5],
    [pickIds[1]!]: [0.5, 1, 1, 1, 1, 1],
    [pickIds[2]!]: [0, 0.5, 0, 0.5, 0],
    [pickIds[3]!]: [0, 0, 0.5, 0.5, 1, 1, 1, 1],
    [pickIds[4]!]: [1, 0.5, 1],
    [pickIds[5]!]: [0.5, 0, 0.5, 0.5],
    [pickIds[6]!]: [1, 1, 1, 1],
  }
  const events: LearnEvent[] = []
  Object.entries(plan).forEach(([cid, vals], i) =>
    vals.forEach((v, k) => events.push({ cid, at: new Date(Date.now() - ((vals.length - k) * 1.5 + i * 0.3) * DAY).toISOString(), outcome: v === 1 ? 'first_try' : v === 0.5 ? 'helped' : 'shown', source: 'quest' })),
  )
  const tricky = pickIds[7] ?? pickIds[2]!
  const at = new Date(Date.now() - 2 * DAY).toISOString()
  events.push({ cid: tricky, at, outcome: 'shown', source: 'scan' })
  return {
    events,
    scans: [{ id: 'sample', at, subject: 'maths', score: { correct: 7, total: 10 }, sample: true, tricky: [{ cid: tricky, question: 'Sample homework question', correct: '—', feedback: 'Mixed up the steps on this one.', steps: [] }] }],
  }
}

export function ParentReport({ onPractise }: { onPractise: (w: IslandId, s: Subject, q: QuestDef) => void }) {
  const { profile } = useProfile()
  const live = useLearning()
  const [sample, setSample] = useState(false)
  const year = (profile?.year ?? 5) as Year
  const name = profile?.name ?? 'Your child'
  const world: IslandId = profile?.interests[0] ?? 'football'

  const data = useMemo(() => {
    const src = sample ? sampleEvents(year) : { events: live.events, scans: live.scans }
    return { ...src, mastery: sample ? masteryOf(src.events) : live.mastery }
  }, [sample, year, live.events, live.scans, live.mastery])

  const now = Date.now()
  const practice = data.events.filter((e) => e.source !== 'scan')
  const week = practice.filter((e) => now - Date.parse(e.at) < 7 * DAY)
  const prev = practice.filter((e) => now - Date.parse(e.at) >= 7 * DAY && now - Date.parse(e.at) < 14 * DAY)
  const rate = (xs: LearnEvent[]) => (xs.length ? xs.filter((e) => e.outcome === 'first_try').length / xs.length : null)
  const rNow = rate(week)
  const rPrev = rate(prev)

  const all = [...data.mastery.values()].filter((m) => statementById(m.cid))
  const secure = all.filter((m) => m.status === 'secure').sort((a, b) => b.last.localeCompare(a.last))
  const tricky = all.filter((m) => m.status === 'tricky').sort((a, b) => Number(b.fromScan) - Number(a.fromScan) || a.score - b.score)
  const improving = all.filter((m) => m.trend === 'improving' && m.status !== 'tricky')

  const areas = useMemo(() => {
    const by = new Map<string, Mastery[]>()
    for (const m of all) {
      const st = statementById(m.cid)!
      const k = `${st.subject === 'maths' ? 'Maths' : 'English'}: ${st.domain}`
      by.set(k, [...(by.get(k) ?? []), m])
    }
    return [...by.entries()].map(([k, ms]) => ({ k, n: ms.length, score: ms.reduce((s, m) => s + m.score, 0) / ms.length, secure: ms.filter((m) => m.status === 'secure').length })).sort((a, b) => b.n - a.n)
  }, [all])

  const questFor = (cid: string): [Subject, QuestDef] | undefined => {
    const st = statementById(cid)
    if (!st) return
    const q = allQuests(year, st.subject).find((x) => x.curriculumId === cid && x.playable)
    return q ? [st.subject, q] : undefined
  }

  const evidence = (m: Mastery) => {
    const list = data.events.filter((e) => e.cid === m.cid)
    const scan = data.scans.slice().reverse().find((s) => s.tricky.some((t) => t.cid === m.cid))
    if (m.fromScan && scan) return { line: `Came up in homework on ${shortDate(scan.at)}.`, tip: scan.tricky.find((t) => t.cid === m.cid)?.feedback }
    const recent = list.slice(-5)
    const help = recent.filter((e) => e.outcome !== 'first_try').length
    return { line: `Needed help on ${help} of the last ${recent.length} questions.`, tip: undefined }
  }

  if (!data.events.length)
    return (
      <section className="card mb-6 p-6" aria-labelledby="report-title">
        <h2 id="report-title" className="font-display text-2xl font-semibold">
          How {name} is learning
        </h2>
        <p className="mt-2 text-ink-soft">Once {name} has answered a few questions, this shows what they’ve understood, what they’re finding tricky and how they’re improving, topic by topic. Homework scans feed in too.</p>
        <button type="button" className="btn btn-ghost mt-4" onClick={() => setSample(true)}>
          <Sparkles size={18} aria-hidden /> See a sample report
        </button>
      </section>
    )

  return (
    <section className="mb-6 grid gap-5" aria-labelledby="report-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="report-title" className="font-display text-[1.7rem] font-semibold leading-tight">
          How {name} is learning
        </h2>
        {sample && (
          <button type="button" className="chip bg-sun-soft font-bold" onClick={() => setSample(false)}>
            Sample report · show real data
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Answered this week" value={String(week.length)} note={prev.length ? `${prev.length} the week before` : undefined} />
        <Stat
          label="Right first time"
          value={rNow === null ? '–' : pct(rNow)}
          note={rNow !== null && rPrev !== null ? `${rNow >= rPrev ? 'Up' : 'Down'} from ${pct(rPrev)} last week` : undefined}
          trend={rNow !== null && rPrev !== null ? (rNow - rPrev > 0.05 ? 'up' : rNow - rPrev < -0.05 ? 'down' : 'flat') : undefined}
        />
        <Stat label="Topics understood" value={`${secure.length} of ${all.length}`} note="topics practised so far" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
            <TriangleAlert size={22} className="text-coral-deep" aria-hidden /> Finding tricky
          </h3>
          {tricky.length ? (
            <ul className="mt-3 grid gap-3">
              {tricky.slice(0, 5).map((m) => {
                const st = statementById(m.cid)!
                const ev = evidence(m)
                const q = questFor(m.cid)
                return (
                  <li key={m.cid} className="rounded-2xl bg-coral-soft/60 p-4">
                    <p className="font-bold leading-snug">{st.text}</p>
                    <p className="mt-1 text-sm text-ink-soft">
                      {ev.line}
                      {ev.tip ? ` ${ev.tip}` : ''}
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">Nova will explain it a different way and bring it into the next session.</p>
                    {q && !sample && (
                      <button type="button" className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-paper px-4 font-bold shadow-[inset_0_0_0_2px_#FFB4A9]" onClick={() => onPractise(world, q[0], q[1])}>
                        Practise together in {islandById(world).name} <ArrowRight size={16} aria-hidden />
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="mt-3 text-ink-soft">Nothing stands out as tricky right now.</p>
          )}
        </div>

        <div className="grid gap-5">
          <div className="card p-5">
            <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
              <CheckCircle2 size={22} className="text-mint-deep" aria-hidden /> Understood
            </h3>
            {secure.length ? (
              <ul className="mt-3 grid gap-2">
                {secure.slice(0, 6).map((m) => (
                  <li key={m.cid} className="rounded-xl bg-mint-soft px-3 py-2 text-sm font-semibold">
                    {statementById(m.cid)!.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-ink-soft">A topic counts as understood after several answers right first time.</p>
            )}
          </div>
          <div className="card p-5">
            <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
              <TrendingUp size={22} className="text-sea-deep" aria-hidden /> Getting better
            </h3>
            {improving.length ? (
              <ul className="mt-3 grid gap-2">
                {improving.slice(0, 5).map((m) => (
                  <li key={m.cid} className="rounded-xl bg-sky-soft px-3 py-2 text-sm font-semibold">
                    {statementById(m.cid)!.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-ink-soft">Improvement shows here once a topic has been practised a few times.</p>
            )}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-display text-xl font-semibold">By area</h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {areas.map((a) => (
            <li key={a.k}>
              <div className="mb-1 flex justify-between gap-2 text-sm font-bold">
                <span>{a.k}</span>
                <span className="text-ink-soft">
                  {a.secure} of {a.n} understood
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-mist" role="img" aria-label={`${pct(a.score)} secure`}>
                <div className="h-full rounded-full" style={{ width: pct(Math.max(0.04, a.score)), background: a.score >= 0.8 ? '#22C58B' : a.score >= 0.45 ? '#FFC93C' : '#FF6B57' }} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {data.scans.length > 0 && (
        <div className="card p-5">
          <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
            <FileSearch size={22} className="text-grape-deep" aria-hidden /> Homework scans
          </h3>
          <ul className="mt-3 grid gap-2">
            {data.scans
              .slice(-5)
              .reverse()
              .map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-mist px-3 py-2 text-sm">
                  <span className="font-bold">
                    {shortDate(s.at)} · {s.subject === 'maths' ? 'Maths' : 'English'}
                    {s.sample ? ' (sample sheet)' : ''}
                  </span>
                  <span>
                    {s.score.correct} of {s.score.total} right
                    {s.tricky.length ? ` · ${s.tricky.length} to practise` : ''}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </section>
  )
}

function Stat({ label, value, note, trend }: { label: string; value: string; note?: string; trend?: 'up' | 'down' | 'flat' }) {
  const Icon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus
  return (
    <div className="card p-4">
      <p className="text-sm font-bold text-ink-soft">{label}</p>
      <p className="mt-1 flex items-center gap-2 font-display text-3xl font-semibold">
        {value}
        {trend && <Icon size={24} className={trend === 'up' ? 'text-mint-deep' : trend === 'down' ? 'text-coral-deep' : 'text-ink-faint'} aria-label={trend === 'up' ? 'up' : trend === 'down' ? 'down' : 'about the same'} />}
      </p>
      {note && <p className="text-sm text-ink-soft">{note}</p>}
    </div>
  )
}
