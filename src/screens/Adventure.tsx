import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Eye, Lightbulb, Lock, RotateCcw, Square, Volume2, VolumeX, X } from 'lucide-react'
import { Buddy, Photo, type Mood } from '../components/art'
import { ChildAvatar } from '../components/avatar'
import { Sparkle } from '../components/scene'
import { useProfile } from '../data/profile'
import { useProgress } from '../data/progress'
import { useLearning } from '../data/learning'
import { islandById, type IslandId } from '../data/world'
import { CLUBS } from '../data/stages'
import { EPISODES, FORMAT_LABEL, buildSession, memoryLine, readMemory, rememberSession, writeMemory, type Beat, type BeatResult, type ChoiceDef, type Episode, type Outcome, type SessionBeat, type StoryChoices, type Year } from '../data/adventure'
import { canSpeak, getAutoRead, setAutoRead, speakNext, speakParts, stopSpeaking } from '../data/speech'

type Phase = { kind: 'choose'; step: number } | { kind: 'opening' } | { kind: 'story'; at: number } | { kind: 'end' }

/** One whole session as a story: the child shapes it, the maths moves it on, Nova remembers it. */
export function Adventure({ world, onExit }: { world: IslandId; onExit: () => void }) {
  const ep = EPISODES[world]!
  const island = islandById(world)
  const { profile } = useProfile()
  const progress = useProgress()
  const name = profile?.name ?? 'Explorer'
  const year = (profile?.year ?? 5) as Year
  const childKey = profile?.id ?? `${name.toLowerCase()}|${year}`
  const [memory, setMemory] = useState(() => readMemory(childKey, world))
  const learning = useLearning()
  const adapt = { status: (cid: string) => learning.mastery.get(cid)?.status, weak: learning.scanWeak }

  // fixed parts of the story the child doesn't choose
  const base = useMemo<StoryChoices>(() => {
    const team = profile?.team ?? 'Stadium FC'
    const rivals = CLUBS.filter((c) => c !== team)
    return { name, team, rival: rivals[Math.floor(Math.random() * rivals.length)]! }
  }, [name, profile?.team])

  const [choices, setChoices] = useState<StoryChoices>(() => ({ ...base, ...(memory.choices ?? {}), team: base.team, rival: base.rival, name }))
  const [phase, setPhase] = useState<Phase>({ kind: 'choose', step: 0 })
  const [session, setSession] = useState<SessionBeat[]>([])
  const [results, setResults] = useState<BeatResult[]>([])
  const [autoRead, setAuto] = useState(getAutoRead)

  useEffect(() => () => stopSpeaking(), [])

  const begin = () => {
    setSession(buildSession(ep, year, choices, memory, `${childKey}|${Date.now()}`, adapt))
    setResults([])
    setPhase({ kind: 'opening' })
  }

  const finishBeat = (b: SessionBeat, outcome: Outcome, hints: number) => {
    progress.log({ world, subject: 'maths', questId: `adventure:${ep.id}:${b.skillId}`, curriculumId: b.question.curriculumId, outcome, hints })
    setResults((rs) => [...rs, { beat: b.beatId, outcome }])
  }

  const next = () => {
    if (phase.kind !== 'story') return
    if (phase.at + 1 < session.length) setPhase({ kind: 'story', at: phase.at + 1 })
    else {
      const end = ep.ending(choices, results)
      const m = rememberSession(ep, memory, choices, session, results, end.won, end.title)
      writeMemory(childKey, world, m)
      setMemory(m)
      setPhase({ kind: 'end' })
    }
    window.scrollTo({ top: 0 })
  }

  const toggleAuto = () => {
    const on = !autoRead
    setAuto(on)
    setAutoRead(on)
    if (!on) stopSpeaking()
  }

  const meter = ep.meterValue(results, ep.beats)
  const at = phase.kind === 'story' ? phase.at : phase.kind === 'end' ? ep.beats.length : -1

  return (
    <div className="min-h-dvh pb-10" style={{ background: `linear-gradient(180deg, ${island.tint[0]}2A 0%, transparent 70%)` }}>
      <header className="sticky top-0 z-20 text-white shadow-[0_5px_0_rgba(20,18,56,0.18)]" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', background: `linear-gradient(120deg, #1E1B4F 0%, #2B1F86 45%, ${island.tint[1]} 100%)` }}>
        <div className="mx-auto flex h-[68px] max-w-[760px] items-center gap-3 px-3 sm:px-6">
          <button type="button" onClick={onExit} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15 shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.25)]" aria-label="Leave the adventure">
            <ArrowLeft size={24} aria-hidden />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-semibold leading-tight">
              {island.name} · {ep.title}
            </p>
            {at >= 0 && (
              <div className="mt-1.5 flex max-w-[300px] gap-1" role="img" aria-label={`Part ${Math.min(at + 1, ep.beats.length)} of ${ep.beats.length}`}>
                {ep.beats.map((b, i) => (
                  <span key={b.id} className={`h-2 flex-1 rounded-full ${i < at ? 'bg-sun' : i === at ? 'bg-white/80' : 'bg-white/25'}`} />
                ))}
              </div>
            )}
          </div>
          {canSpeak() && (
            <button type="button" onClick={toggleAuto} aria-pressed={autoRead} aria-label={autoRead ? 'Read-aloud is on. Tap to turn it off' : 'Read-aloud is off. Tap to turn it on'} className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${autoRead ? 'bg-sun text-ink shadow-[0_3px_0_#C98F00]' : 'bg-white/15 shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.25)]'}`}>
              {autoRead ? <Volume2 size={22} aria-hidden /> : <VolumeX size={22} aria-hidden />}
            </button>
          )}
          {phase.kind !== 'choose' && (
            <span className="hud shrink-0" aria-label={`${ep.meter.label}: ${meter}`}>
              <span aria-hidden>{ep.meter.icon}</span>
              <span className="tabular whitespace-nowrap text-sm">{meter}</span>
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto grid max-w-[760px] gap-5 px-4 pt-5 sm:px-6">
        {phase.kind === 'choose' && (
          <ChooseStep
            key={phase.step}
            def={ep.choices[phase.step]!}
            c={choices}
            plays={memory.plays}
            world={world}
            step={phase.step}
            total={ep.choices.length}
            intro={phase.step === 0 ? memoryLine(ep, memory, choices) : null}
            autoRead={autoRead}
            onPick={(v) => {
              const c2 = { ...choices, [ep.choices[phase.step]!.key]: v }
              setChoices(c2)
              if (phase.step + 1 < ep.choices.length) setPhase({ kind: 'choose', step: phase.step + 1 })
              else {
                setSession(buildSession(ep, year, c2, memory, `${childKey}|${Date.now()}`, adapt))
                setResults([])
                setPhase({ kind: 'opening' })
              }
            }}
          />
        )}

        {phase.kind === 'opening' && (
          <Scene world={world} photo={0}>
            <Narration mood="cheer" text={ep.opening(choices, null)} autoRead={autoRead} />
            <button type="button" className="btn btn-sun sheen w-full text-xl" onClick={() => setPhase({ kind: 'story', at: 0 })}>
              Let’s go! <ArrowRight size={22} strokeWidth={3} aria-hidden />
            </button>
          </Scene>
        )}

        {phase.kind === 'story' && session[phase.at] && (
          <BeatView
            key={`${phase.at}-${session[phase.at]!.skillId}`}
            sb={session[phase.at]!}
            beat={ep.beats.find((b) => b.id === session[phase.at]!.beatId)!}
            c={choices}
            world={world}
            photo={phase.at + 1}
            autoRead={autoRead}
            last={phase.at === session.length - 1}
            onDone={(o, h) => finishBeat(session[phase.at]!, o, h)}
            onNext={next}
          />
        )}

        {phase.kind === 'end' && (
          <Ending
            ep={ep}
            c={choices}
            results={results}
            plays={memory.plays}
            world={world}
            onAgain={() => setPhase({ kind: 'choose', step: 0 })}
            onReplay={begin}
            onExit={onExit}
          />
        )}
      </main>
    </div>
  )
}

/* ---------------- pieces ---------------- */

function Scene({ world, photo, children }: { world: IslandId; photo: number; children: ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-4xl bg-paper shadow-pop">
      <Photo island={world} n={photo} alt="" className="h-36 sm:h-48" />
      <div className="grid gap-4 p-5">{children}</div>
    </motion.section>
  )
}

function Narration({ text, mood = 'happy', autoRead }: { text: string; mood?: Mood; autoRead: boolean }) {
  useEffect(() => {
    if (autoRead) speakNext(text)
  }, [text, autoRead])
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#FFE7C2] shadow-[inset_0_0_0_3px_#fff,0_3px_0_rgba(23,21,58,0.14)]">
        <Buddy mood={mood} className="h-12 w-12" />
      </span>
      <p className="rounded-3xl rounded-tl-lg bg-grape-soft px-4 py-3 text-[1.0625rem] font-semibold leading-snug">{text}</p>
    </div>
  )
}

function ChooseStep({ def, c, plays, world, step, total, intro, autoRead, onPick }: { def: ChoiceDef; c: StoryChoices; plays: number; world: IslandId; step: number; total: number; intro: string | null; autoRead: boolean; onPick: (v: string) => void }) {
  const q = def.question(c)
  const opts = def.options(c)
  const before = c[def.key]
  return (
    <Scene world={world} photo={step + 5}>
      {intro && <Narration mood="cheer" text={intro} autoRead={autoRead} />}
      <p className="text-sm font-bold uppercase tracking-wide text-ink-soft">
        Your choice · {step + 1} of {total}
      </p>
      <Narration mood="wink" text={q} autoRead={autoRead} />
      <div className="grid gap-3 sm:grid-cols-2">
        {opts.map((o, i) => {
          const locked = (o.unlockAt ?? 0) > plays
          return (
            <motion.button
              key={o.value}
              type="button"
              disabled={locked}
              onClick={() => onPick(o.value)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ y: 4 }}
              className={`flex min-h-[68px] items-center justify-between gap-3 rounded-[22px] px-5 py-3 text-left font-display text-xl font-semibold ${locked ? 'bg-mist text-ink-faint shadow-[inset_0_0_0_2px_#DCE0F5]' : before === o.value ? 'bg-sun-soft text-ink shadow-[inset_0_0_0_3px_#FFC93C,0_5px_0_#E8C55A]' : 'bg-paper text-ink shadow-[inset_0_0_0_2.5px_#CFD4F0,0_5px_0_#CDD2EE] hover:bg-grape-soft'}`}
            >
              <span>
                {o.value}
                {o.note && <span className="block font-sans text-sm font-bold text-ink-soft">{o.note}</span>}
                {!locked && before === o.value && <span className="block font-sans text-sm font-bold text-[#A57400]">Your choice last time</span>}
              </span>
              {locked && <Lock size={20} aria-hidden />}
            </motion.button>
          )
        })}
      </div>
    </Scene>
  )
}

function BeatView({ sb, beat, c, world, photo, autoRead, last, onDone, onNext }: { sb: SessionBeat; beat: Beat; c: StoryChoices; world: IslandId; photo: number; autoRead: boolean; last: boolean; onDone: (o: Outcome, hints: number) => void; onNext: () => void }) {
  const q = sb.question
  const [tried, setTried] = useState<string[]>([])
  const [hint, setHint] = useState(0)
  const [note, setNote] = useState<{ text: string; kind: 'why' | 'hint' } | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [reading, setReading] = useState<number | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const parts = [beat.intro(c), q.text, ...q.options]

  useEffect(() => {
    if (autoRead) speakParts(parts, setReading)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (outcome) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [outcome])

  const finish = (o: Outcome) => {
    setOutcome(o)
    onDone(o, hint)
    stopSpeaking()
    setReading(null)
  }

  const choose = (opt: string) => {
    if (outcome || tried.includes(opt)) return
    stopSpeaking()
    setReading(null)
    if (opt === q.right) return finish(tried.length === 0 && hint === 0 ? 'first_try' : 'helped')
    const misses = tried.length + 1
    setTried((t) => [...t, opt])
    // first miss: what went wrong; second: explain it a different way; third: walk through it
    if (misses === 1) setNote({ kind: 'why', text: q.why[opt] ?? `Not quite. ${q.hints[0]}` })
    else if (misses === 2) {
      setHint((h) => Math.max(h, 2))
      setNote({ kind: 'hint', text: `Let’s look at it another way. ${q.hints[1]}` })
    } else {
      setHint(3)
      setNote({ kind: 'hint', text: q.hints[2] })
    }
  }

  const giveHint = () => {
    const h = Math.min(hint + 1, 3)
    setHint(h)
    setNote({ kind: 'hint', text: q.hints[h - 1]! })
    if (autoRead) speakNext(q.hints[h - 1]!)
  }

  const read = () => {
    if (reading !== null) {
      stopSpeaking()
      setReading(null)
    } else speakParts(parts, setReading)
  }

  useEffect(() => {
    if (note && autoRead) speakNext(note.text)
  }, [note, autoRead])

  const canShow = hint >= 3 || tried.length >= 2

  return (
    <>
      <Scene world={world} photo={photo}>
        <div className="flex flex-wrap gap-2">
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-night px-3 py-1 font-display text-sm font-semibold text-white">{beat.scene}</p>
          {sb.stretch === 1 && <p className="inline-flex w-fit items-center rounded-full bg-rose px-3 py-1 text-sm font-bold text-white">Stretch challenge</p>}
          {sb.stretch === -1 && <p className="inline-flex w-fit items-center rounded-full bg-sea px-3 py-1 text-sm font-bold text-white">Extra practice</p>}
        </div>
        <Narration text={beat.intro(c)} autoRead={false} />
        <div className={`rounded-3xl p-4 ${reading === 1 ? 'bg-sun-soft' : 'bg-mist'}`}>
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-grape-deep">{FORMAT_LABEL[q.format]}</p>
          <p className="font-display text-xl font-semibold leading-snug sm:text-2xl">{q.text}</p>
        </div>
        {canSpeak() && (
          <button type="button" onClick={read} className={`inline-flex min-h-[48px] w-fit items-center gap-2 rounded-full px-5 font-bold ${reading !== null ? 'bg-grape text-white shadow-[0_4px_0_#4B2FCC]' : 'bg-grape-soft text-grape-deep shadow-[inset_0_0_0_2px_#C9BEFF,0_4px_0_#C9BEFF]'}`}>
            {reading !== null ? <Square size={18} className="fill-current" aria-hidden /> : <Volume2 size={20} aria-hidden />}
            {reading !== null ? 'Stop reading' : 'Read it to me'}
          </button>
        )}
        <AnimatePresence mode="wait">
          {note && !outcome && (
            <motion.div key={note.text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status" className={`flex items-start gap-3 rounded-3xl p-3 pr-4 ${note.kind === 'hint' ? 'bg-sun-soft shadow-[inset_0_0_0_2px_#FFD86B]' : 'bg-coral-soft shadow-[inset_0_0_0_2px_#FFB4A9]'}`}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#FFE7C2] shadow-[inset_0_0_0_2.5px_#fff]">
                {note.kind === 'hint' ? <Lightbulb size={20} className="text-[#C98F00]" aria-hidden /> : <Buddy mood="think" className="h-9 w-9" />}
              </span>
              <p className="pt-1 text-[1.0625rem] font-semibold leading-snug">{note.text}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className={`grid gap-3 ${q.options.every((o) => o.length <= 14) ? 'grid-cols-2' : 'grid-cols-1'}`} role="group" aria-label="Choose an answer">
          {q.options.map((o, i) => {
            const wrong = tried.includes(o)
            const right = !!outcome && o === q.right
            const dim = !!outcome && !right
            return (
              <motion.button
                key={o}
                type="button"
                onClick={() => choose(o)}
                disabled={!!outcome || wrong}
                animate={wrong ? { x: [0, -6, 6, -4, 4, 0] } : right ? { scale: [1, 1.06, 1] } : {}}
                whileTap={{ y: 4 }}
                aria-label={wrong ? `${o}, not this one` : right ? `${o}, the right answer` : o}
                className={`flex min-h-[68px] items-center justify-center gap-2 rounded-[22px] px-4 py-3 text-center font-display text-xl font-semibold leading-snug sm:text-2xl ${o.length > 14 ? 'justify-start text-left text-lg sm:text-xl' : ''} ${
                  right ? 'bg-[#2BB673] text-white shadow-[0_5px_0_#1B8A55]' : wrong ? 'bg-coral-soft text-ink-soft line-through decoration-[3px] shadow-[inset_0_0_0_2px_#FFB4A9]' : dim ? 'bg-mist text-ink-soft opacity-60' : reading === 2 + i ? 'bg-sun-soft shadow-[inset_0_0_0_3px_#FFC93C,0_5px_0_#E8C55A]' : 'bg-paper shadow-[inset_0_0_0_2.5px_#CFD4F0,0_5px_0_#CDD2EE] hover:bg-grape-soft'
                }`}
              >
                {right && <Check size={24} strokeWidth={3} className="shrink-0" aria-hidden />}
                {wrong && <X size={22} strokeWidth={3} className="shrink-0 text-coral-deep" aria-hidden />}
                <span>{o}</span>
              </motion.button>
            )
          })}
        </div>
        {!outcome && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={giveHint} disabled={hint >= 3} className="flex min-h-[48px] items-center gap-1.5 rounded-full bg-sun-soft px-4 font-bold shadow-[inset_0_0_0_2px_#FFD86B,0_3px_0_#E8C55A] disabled:opacity-50">
              <Lightbulb size={18} aria-hidden /> {hint === 0 ? 'Give me a hint' : hint < 3 ? 'Another hint' : 'All hints used'}
            </button>
            <button type="button" onClick={() => finish('shown')} disabled={!canShow} className="flex min-h-[48px] items-center gap-1.5 rounded-full bg-mist px-4 font-bold shadow-[inset_0_0_0_2px_#DCE0F5] disabled:opacity-50">
              <Eye size={18} aria-hidden /> Show me the answer
            </button>
          </div>
        )}
      </Scene>

      {outcome && (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 rounded-4xl bg-paper p-5 shadow-pop">
          <Narration mood={outcome === 'shown' ? 'think' : 'cheer'} text={`${outcome === 'shown' ? `The answer is ${q.right}. ${q.explain}` : `${q.right}! ${q.explain}`} ${outcome === 'shown' ? beat.slip(c) : beat.win(c)}`} autoRead={autoRead} />
          <button type="button" className="btn btn-sun sheen w-full text-xl" onClick={onNext}>
            {last ? 'See how it ends' : 'Keep going'} <ArrowRight size={22} strokeWidth={3} aria-hidden />
          </button>
        </motion.section>
      )}
      <div ref={endRef} />
    </>
  )
}

function Ending({ ep, c, results, plays, world, onAgain, onReplay, onExit }: { ep: Episode; c: StoryChoices; results: BeatResult[]; plays: number; world: IslandId; onAgain: () => void; onReplay: () => void; onExit: () => void }) {
  const end = ep.ending(c, results)
  const { profile } = useProfile()
  const unlocked = ep.choices.flatMap((d) => d.options(c).filter((o) => o.unlockAt === plays).map((o) => o.value))
  const first = results.filter((r) => r.outcome === 'first_try').length
  return (
    <motion.section initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative overflow-hidden rounded-4xl p-6 text-center text-white" style={{ background: 'linear-gradient(150deg, #2B1F86 0%, #1E1B4F 55%, #3E3A9A 100%)', boxShadow: '0 7px 0 #100D38' }}>
      <Sparkle className="twinkle absolute left-5 top-5 h-6 w-6" />
      <Sparkle className="twinkle absolute right-6 top-10 h-7 w-7" color="#FF8EBB" />
      <div className="mx-auto mb-3 h-24 w-24 overflow-hidden rounded-full bg-white/15 p-1">
        <ChildAvatar data={profile?.avatar} className="h-full w-full" />
      </div>
      <p className="title-pop font-display text-[2rem] font-semibold leading-tight">{end.title}</p>
      <p className="mx-auto mt-2 max-w-[44ch] text-white/90">{end.text}</p>
      <p className="mt-3 font-bold text-sun">
        {first} of {results.length} right first time · {ep.meter.icon} {ep.meterValue(results, ep.beats)}
      </p>
      {unlocked.length > 0 && (
        <p className="mx-auto mt-4 w-fit rounded-full bg-sun px-4 py-2 font-bold text-ink">🎁 Unlocked: {unlocked.join(', ')}</p>
      )}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <button type="button" className="btn btn-sun sheen" onClick={onAgain}>
          {world === 'football' ? 'Next match' : 'Next show'} <ArrowRight size={20} aria-hidden />
        </button>
        <button type="button" className="btn bg-white/15 text-white shadow-[inset_0_0_0_2px_rgba(255,255,255,0.3)]" onClick={onReplay}>
          <RotateCcw size={18} aria-hidden /> Same choices
        </button>
        <button type="button" className="btn bg-white/15 text-white shadow-[inset_0_0_0_2px_rgba(255,255,255,0.3)]" onClick={onExit}>
          Back to {islandById(world).name}
        </button>
      </div>
    </motion.section>
  )
}
