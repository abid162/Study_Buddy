import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, BookOpen, Check, Feather, Lightbulb, Mic, RotateCcw, ShieldCheck, Square, TriangleAlert, Volume2, type LucideIcon } from 'lucide-react'
import { Buddy } from '../components/art'
import { useProfile } from '../data/profile'
import { islandById, type IslandId } from '../data/world'
import { KIND_LABEL, readingTextById, textsFor, type ReadingKind, type ReadingText } from '../data/reading/texts'
import { useReadingConsent, useReadingLog, type ReadingSession } from '../data/reading/log'
import { MAX_SECONDS, useRecorder } from '../data/recorder'
import { checkReading, type ReadReply } from '../data/ai'
import { canSpeak, speak, speakWords, stopSpeaking } from '../data/speech'

const KIND_ICON: Record<ReadingKind, LucideIcon> = { story: BookOpen, poem: Feather, facts: Lightbulb }
const SKY = 'linear-gradient(180deg,#8AD4FF,#4FB0F5)'
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

/** Reading coach: the child reads a text aloud, one part at a time, and Nova says which words came through clearly. */
export function Read() {
  const [openId, setOpenId] = useState<string | null>(null)
  const text = openId ? readingTextById(openId) : undefined
  return text ? <Reader key={text.id} text={text} onBack={() => setOpenId(null)} /> : <Library onOpen={setOpenId} />
}

/* ---------------- choosing a text ---------------- */

function Library({ onOpen }: { onOpen: (id: string) => void }) {
  const { profile } = useProfile()
  const { sessions } = useReadingLog()
  const worlds = useMemo(() => (profile?.interests ?? []) as IslandId[], [profile?.interests])
  const texts = useMemo(() => textsFor(worlds), [worlds])
  const mine = texts.filter((t) => worlds.includes(t.world))
  const more = texts.filter((t) => !worlds.includes(t.world))
  const lastRead = (id: string) => [...sessions].reverse().find((s) => s.textId === id)

  return (
    <main className="mx-auto w-full max-w-[920px] px-4 pb-10 pt-[calc(env(safe-area-inset-top,0px)+20px)] sm:px-8">
      <header className="mb-5 flex items-center gap-4">
        <span className="tile h-16 w-16 -rotate-3 !rounded-[22px] !text-ink" style={{ background: SKY }}>
          <BookOpen size={28} aria-hidden />
        </span>
        <div>
          <h1 className="font-display text-[1.9rem] font-semibold leading-tight">Reading coach</h1>
          <p className="text-ink-soft">Read out loud to Nova, one part at a time.</p>
        </div>
      </header>

      <TextGrid texts={mine} lastRead={lastRead} onOpen={onOpen} />
      {more.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 font-display text-xl font-semibold">From other worlds</h2>
          <TextGrid texts={more} lastRead={lastRead} onOpen={onOpen} />
        </>
      )}
    </main>
  )
}

function TextGrid({ texts, lastRead, onOpen }: { texts: ReadingText[]; lastRead: (id: string) => ReadingSession | undefined; onOpen: (id: string) => void }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {texts.map((t) => {
        const island = islandById(t.world)
        const Icon = KIND_ICON[t.kind]
        const done = lastRead(t.id)
        return (
          <li key={t.id}>
            <button type="button" onClick={() => onOpen(t.id)} className="card flex min-h-[96px] w-full items-center gap-4 p-4 text-left transition-transform hover:-translate-y-0.5 active:translate-y-0.5">
              <span className="tile h-14 w-14 shrink-0 !rounded-[18px]" style={{ background: `linear-gradient(180deg, ${island.tint[0]}, ${island.tint[1]})` }}>
                <Icon size={24} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg font-semibold leading-snug">{t.title}</span>
                <span className="block text-sm text-ink-soft">
                  {island.name} {KIND_LABEL[t.kind].toLowerCase()}, {t.parts.length} {t.parts.length === 1 ? 'part' : 'parts'}
                </span>
              </span>
              {done && (
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mint text-white" title={`Read on ${new Date(done.at).toLocaleDateString('en-GB')}`}>
                  <Check size={18} strokeWidth={3} aria-label="Read before" />
                </span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/* ---------------- reading one text ---------------- */

type Phase =
  | { p: 'ready' }
  | { p: 'recording' }
  | { p: 'checking' }
  | { p: 'result'; reply: ReadReply }
  | { p: 'error'; message: string; clip?: Blob }
  | { p: 'done' }

/** Printed words with their position in the text, in the same order the matching uses. */
function tokensOf(part: string) {
  const lines = part.split('\n')
  const out: { line: number; text: string; idx: number | null; at: number; heading: boolean }[] = []
  let idx = 0
  let at = 0
  lines.forEach((line, li) => {
    const heading = /^[A-Z0-9 '’?!.-]{3,}$/.test(line.trim()) && /[A-Z]{3}/.test(line)
    const re = /\S+/g
    let m: RegExpExecArray | null
    while ((m = re.exec(line))) {
      const word = /[A-Za-z0-9]/.test(m[0]) ? idx++ : null
      out.push({ line: li, text: m[0], idx: word, at: at + m.index, heading })
    }
    at += line.length + 1
  })
  return { lines: lines.length, tokens: out }
}

function Reader({ text, onBack }: { text: ReadingText; onBack: () => void }) {
  const { profile } = useProfile()
  const name = profile?.name ?? 'your child'
  const year = profile?.year ?? 5
  const island = islandById(text.world)
  const { add } = useReadingLog()
  const consent = useReadingConsent()
  const mic = useRecorder()
  const [part, setPart] = useState(0)
  const [phase, setPhase] = useState<Phase>({ p: 'ready' })
  const [results, setResults] = useState<Record<number, ReadReply>>({})
  const [speaking, setSpeaking] = useState<number | null>(null)
  const [askGrownUp, setAskGrownUp] = useState(false)
  const abort = useRef<AbortController | null>(null)
  const sessionId = useRef(crypto.randomUUID())
  const saved = useRef(false)
  const resultsRef = useRef(results)
  resultsRef.current = results

  const words = text.parts[part]!
  const { tokens, lines } = useMemo(() => tokensOf(words), [words])
  const reply = phase.p === 'result' ? phase.reply : undefined

  /* keep what was read (never the recording) when the child finishes or leaves */
  const save = useCallback(() => {
    const done = Object.values(resultsRef.current).filter((r) => r.heard === 'ok')
    if (saved.current || !done.length) return
    saved.current = true
    const practice = [...new Set(done.flatMap((r) => r.practice.map((p) => p.word)))].slice(0, 10)
    add({ id: sessionId.current, at: new Date().toISOString(), textId: text.id, world: text.world, kind: text.kind, title: text.title, parts: done.length, partsTotal: text.parts.length, words: done.reduce((n, r) => n + r.total, 0), clear: done.reduce((n, r) => n + r.correct, 0), practice })
  }, [add, text])

  useEffect(
    () => () => {
      abort.current?.abort()
      stopSpeaking()
      save()
    },
    [save],
  )

  /* the clip stopped by itself at the time limit: send it */
  useEffect(() => {
    if (phase.p === 'recording' && mic.state === 'idle') void finish()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mic.state])

  const listen = () => {
    if (speaking !== null) {
      stopSpeaking()
      return setSpeaking(null)
    }
    speakWords(words, (at) => {
      if (at === null) return setSpeaking(null)
      const t = [...tokens].reverse().find((x) => x.idx !== null && x.at <= at)
      setSpeaking(t?.idx ?? null)
    })
    setSpeaking(-1)
  }

  const begin = async () => {
    if (consent.granted !== true) return setAskGrownUp(true)
    stopSpeaking()
    setSpeaking(null)
    if (await mic.start()) setPhase({ p: 'recording' })
  }

  const send = async (clip: Blob) => {
    setPhase({ p: 'checking' })
    abort.current = new AbortController()
    try {
      const r = await checkReading(clip, words, year, abort.current.signal)
      setResults((cur) => ({ ...cur, [part]: r }))
      setPhase({ p: 'result', reply: r })
    } catch (e) {
      setPhase({ p: 'error', message: (e as Error).message, clip })
    }
  }

  async function finish() {
    const clip = await mic.stop()
    if (!clip || clip.size < 1500) return setPhase({ p: 'error', message: 'That was very short. Tap the microphone, read the whole part, then tap stop.' })
    await send(clip)
  }

  const goPart = (n: number) => {
    stopSpeaking()
    setSpeaking(null)
    mic.cancel()
    setPart(n)
    setPhase(results[n] ? { p: 'result', reply: results[n]! } : { p: 'ready' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const next = () => {
    if (part + 1 < text.parts.length) goPart(part + 1)
    else {
      save()
      setPhase({ p: 'done' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const leave = () => {
    mic.cancel()
    save()
    onBack()
  }

  if (phase.p === 'done') return <Summary text={text} results={results} onAgain={() => { sessionId.current = crypto.randomUUID(); saved.current = false; setResults({}); goPart(0) }} onBack={leave} />

  const statusOf = (idx: number | null) => (idx === null || !reply ? undefined : reply.words[idx])
  const recording = phase.p === 'recording'

  return (
    <main className="mx-auto w-full max-w-[860px] px-4 pb-10 pt-[calc(env(safe-area-inset-top,0px)+16px)] sm:px-8">
      <header className="mb-4 flex items-center gap-3">
        <button type="button" onClick={leave} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-paper shadow-card" aria-label="Back to all texts">
          <ArrowLeft size={22} aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-[1.6rem] font-semibold leading-tight">{text.title}</h1>
          <p className="text-sm text-ink-soft">
            {island.name} {KIND_LABEL[text.kind].toLowerCase()}, part {part + 1} of {text.parts.length}
          </p>
        </div>
      </header>

      {text.parts.length > 1 && (
        <ol className="mb-4 flex flex-wrap gap-2" aria-label="Parts">
          {text.parts.map((_, n) => {
            const r = results[n]
            const on = n === part
            return (
              <li key={n}>
                <button
                  type="button"
                  onClick={() => goPart(n)}
                  disabled={recording || phase.p === 'checking'}
                  aria-current={on ? 'step' : undefined}
                  aria-label={`Part ${n + 1}${r ? ', read' : ''}`}
                  className={`grid h-11 w-11 place-items-center rounded-full font-display text-lg font-semibold transition-colors ${on ? 'bg-night text-white' : r ? 'bg-mint text-white' : 'bg-paper text-ink shadow-[inset_0_0_0_2px_#DCE0F5]'}`}
                >
                  {r && !on ? <Check size={18} strokeWidth={3} aria-hidden /> : n + 1}
                </button>
              </li>
            )
          })}
        </ol>
      )}

      {/* the page the child reads */}
      <section className={`card relative p-5 sm:p-7 ${recording ? 'ring-4 ring-sea' : ''}`} aria-label="Text to read">
        <div className={text.kind === 'poem' ? 'text-[1.15rem] leading-[1.8] sm:text-[1.5rem]' : 'text-[1.35rem] leading-[1.9] sm:text-[1.6rem]'} style={{ fontFeatureSettings: '"kern"' }}>
          {Array.from({ length: lines }, (_, li) => {
            const lineTokens = tokens.filter((t) => t.line === li)
            if (!lineTokens.length) return <div key={li} className="h-4" aria-hidden />
            return (
              <p key={li} className={lineTokens[0]!.heading ? 'mt-1 font-display text-[1.05em] font-semibold tracking-wide text-sea-deep' : text.kind === 'poem' ? '' : 'mb-1'}>
                {lineTokens.map((t, k) => {
                  const w = statusOf(t.idx)
                  const lit = speaking !== null && speaking === t.idx
                  const practise = w && !w.minor && (w.status === 'skipped' || w.status === 'swapped')
                  const clear = w && (w.status === 'read' || w.status === 'close')
                  const faint = w?.status === 'unreached'
                  const cls = `rounded-lg px-[2px] transition-colors ${lit ? 'bg-sun' : ''} ${practise ? 'bg-sun-soft font-semibold shadow-[inset_0_0_0_2px_#FFC93C]' : ''} ${clear ? 'underline decoration-mint decoration-[3px] underline-offset-[7px]' : ''} ${faint ? 'text-ink-faint' : ''}`
                  return (
                    <span key={k}>
                      {reply && t.idx !== null ? (
                        <button type="button" className={cls} onClick={() => speak(t.text.replace(/[^A-Za-z0-9'’-]/g, ''))} aria-label={`${t.text}${practise ? ', try this word' : ''}. Tap to hear it.`}>
                          {t.text}
                        </button>
                      ) : (
                        <span className={cls}>{t.text}</span>
                      )}{' '}
                    </span>
                  )
                })}
              </p>
            )
          })}
        </div>
      </section>

      {/* controls */}
      <div className="mt-5" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {(phase.p === 'ready' || phase.p === 'error') && (
            <motion.div key="ready" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-4">
              {phase.p === 'error' && (
                <div className="flex gap-3 rounded-3xl bg-coral-soft p-4 ring-2 ring-inset ring-coral" role="alert">
                  <TriangleAlert className="mt-0.5 shrink-0 text-coral-deep" size={22} aria-hidden />
                  <div className="flex-1">
                    <p className="font-bold">{phase.message}</p>
                    {phase.clip && (
                      <button type="button" className="mt-2 font-bold text-coral-deep underline underline-offset-4" onClick={() => void send(phase.clip!)}>
                        Send the same reading again
                      </button>
                    )}
                  </div>
                </div>
              )}
              <MicHelp state={mic.state} />
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" className="btn btn-sun min-h-[64px] flex-1 text-lg sm:flex-none sm:px-8" onClick={() => void begin()} disabled={mic.state === 'unsupported' || mic.state === 'asking'}>
                  <Mic size={24} aria-hidden /> {results[part] ? 'Read it again' : 'Start reading'}
                </button>
                {canSpeak() && (
                  <button type="button" className="btn btn-ghost min-h-[64px]" onClick={listen} aria-pressed={speaking !== null}>
                    {speaking !== null ? <Square size={20} aria-hidden /> : <Volume2 size={22} aria-hidden />} {speaking !== null ? 'Stop' : 'Hear Nova read it'}
                  </button>
                )}
              </div>
              <p className="flex items-start gap-2 text-sm text-ink-soft">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-mint-deep" aria-hidden />
                The microphone is only on while you’re reading. The recording isn’t saved.
              </p>
            </motion.div>
          )}

          {recording && (
            <motion.div key="rec" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card grid gap-4 p-5">
              <div className="flex items-center gap-3">
                <span className="relative grid h-4 w-4 place-items-center" aria-hidden>
                  <span className="absolute h-4 w-4 animate-ping rounded-full bg-coral opacity-60 motion-reduce:animate-none" />
                  <span className="h-3 w-3 rounded-full bg-coral" />
                </span>
                <p className="font-display text-lg font-semibold">Nova is listening</p>
                <p className="ml-auto font-display text-lg tabular-nums text-ink-soft" aria-label={`${mic.seconds} seconds`}>
                  {clock(mic.seconds)}
                </p>
              </div>
              <Waveform levels={mic.levels} />
              {mic.seconds >= MAX_SECONDS - 15 && <p className="text-sm text-ink-soft">Nearly at the time limit. Nova will stop listening at {clock(MAX_SECONDS)}.</p>}
              <div className="flex flex-wrap gap-3">
                <button type="button" className="btn btn-grape min-h-[64px] flex-1 text-lg" onClick={() => void finish()}>
                  <Square size={20} aria-hidden /> I’ve finished
                </button>
                <button
                  type="button"
                  className="btn btn-ghost min-h-[64px]"
                  onClick={() => {
                    mic.cancel()
                    setPhase({ p: 'ready' })
                  }}
                >
                  <RotateCcw size={20} aria-hidden /> Start again
                </button>
              </div>
            </motion.div>
          )}

          {phase.p === 'checking' && (
            <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="card flex items-center gap-4 p-5">
              <Buddy mood="think" className="float h-16 w-16 shrink-0" />
              <p className="font-display text-lg font-semibold">Nova is listening back to your reading…</p>
            </motion.div>
          )}

          {reply && (
            <motion.div key={`result-${part}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-4">
              <div className="flex items-end gap-3">
                <Buddy mood={reply.heard === 'ok' && reply.accuracy >= 0.85 ? 'cheer' : 'happy'} className="h-16 w-16 shrink-0" />
                <div className="rounded-3xl rounded-bl-lg bg-paper px-4 py-3 shadow-card">
                  <p className="font-display text-xl font-semibold">{reply.praise}</p>
                  <p className="text-ink-soft">{reply.tip}</p>
                </div>
              </div>
              {reply.heard === 'ok' && (
                <p className="text-ink-soft">
                  <span className="font-bold text-ink">
                    {reply.correct} of {reply.total}
                  </span>{' '}
                  words came through clearly.{reply.practice.length ? ' The yellow words are worth another go.' : ''}
                </p>
              )}
              {reply.practice.length > 0 && (
                <ul className="flex flex-wrap gap-2" aria-label="Words to practise">
                  {reply.practice.map((p) => (
                    <li key={p.word}>
                      <button type="button" onClick={() => speak(p.word)} className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-sun-soft px-4 font-display text-lg font-semibold shadow-[inset_0_0_0_2px_#FFC93C]">
                        <Volume2 size={18} aria-hidden /> {p.word}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap gap-3">
                <button type="button" className="btn btn-ghost min-h-[60px]" onClick={() => void begin()}>
                  <Mic size={22} aria-hidden /> Read it again
                </button>
                <button type="button" className="btn btn-sun min-h-[60px] flex-1 sm:flex-none sm:px-8" onClick={next}>
                  {part + 1 < text.parts.length ? (
                    <>
                      Next part <ArrowRight size={20} aria-hidden />
                    </>
                  ) : (
                    <>
                      <Check size={20} aria-hidden /> Finish
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {askGrownUp && (
        <GrownUpGate
          name={name}
          onAllow={async () => {
            await consent.grant()
            setAskGrownUp(false)
            if (await mic.start()) setPhase({ p: 'recording' })
          }}
          onClose={() => setAskGrownUp(false)}
        />
      )}
    </main>
  )
}

function MicHelp({ state }: { state: string }) {
  if (state === 'denied')
    return (
      <p className="rounded-2xl bg-sun-soft p-4 font-semibold">
        The microphone is blocked. Ask a grown-up to allow the microphone for this site in the browser settings, then tap Start reading again.
      </p>
    )
  if (state === 'unsupported')
    return <p className="rounded-2xl bg-sun-soft p-4 font-semibold">This browser can’t record sound. Try Chrome, Edge or Safari, outside any app’s built-in browser.</p>
  return null
}

/** live loudness bars while the child reads */
function Waveform({ levels }: { levels: { current: number[] } }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    let raf = 0
    const draw = () => {
      const c = ref.current
      if (c) {
        const dpr = window.devicePixelRatio || 1
        const w = c.clientWidth
        const h = c.clientHeight
        if (c.width !== w * dpr) {
          c.width = w * dpr
          c.height = h * dpr
        }
        const g = c.getContext('2d')!
        g.setTransform(dpr, 0, 0, dpr, 0, 0)
        g.clearRect(0, 0, w, h)
        const bars = Math.floor(w / 7)
        const xs = levels.current.slice(-bars)
        g.fillStyle = '#3E8EF0'
        xs.forEach((v, i) => {
          const bh = Math.max(4, v * (h - 8))
          const x = w - (xs.length - i) * 7
          g.beginPath()
          g.roundRect(x, (h - bh) / 2, 4, bh, 2)
          g.fill()
        })
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [levels])
  return <canvas ref={ref} className="h-20 w-full rounded-2xl bg-sky-soft" aria-hidden />
}

/** A grown-up says yes before the microphone is used for the first time. */
function GrownUpGate({ name, onAllow, onClose }: { name: string; onAllow: () => Promise<void>; onClose: () => void }) {
  const [ok, setOk] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-night/60 p-3 sm:place-items-center" role="dialog" aria-modal="true" aria-labelledby="gate-title">
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card max-h-[90dvh] w-full max-w-[520px] overflow-y-auto p-6">
        <div className="mb-3 flex items-center gap-3">
          <span className="tile h-12 w-12 !rounded-2xl" style={{ background: 'linear-gradient(180deg,#FFB08A,#FF7F5C)' }}>
            <ShieldCheck size={24} aria-hidden />
          </span>
          <h2 id="gate-title" className="font-display text-2xl font-semibold">
            Ask a grown-up
          </h2>
        </div>
        <p className="mb-3">Before {name} reads to Nova, a parent or carer needs to say yes to the microphone.</p>
        <ul className="mb-4 grid gap-2 text-ink-soft">
          <li>• The microphone is only on after {name} taps Start reading, and goes off when they stop.</li>
          <li>• Each recording is sent to OpenAI’s speech service to turn it into words, checked against the text, then deleted. It is never saved.</li>
          <li>• Study Buddy keeps only what was read and which words to practise. You can clear this in Grown-ups.</li>
        </ul>
        <label className="mb-4 flex items-start gap-3 rounded-2xl bg-mist p-3 font-semibold">
          <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#7C5CFF]" />
          I’m {name}’s parent or carer, and I’m happy for them to use the microphone for reading practice.
        </label>
        {error && (
          <p className="mb-3 font-semibold text-coral-deep" role="alert">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn btn-grape flex-1"
            disabled={!ok || busy}
            onClick={async () => {
              setBusy(true)
              setError('')
              try {
                await onAllow()
              } catch (e) {
                setError((e as Error).message)
                setBusy(false)
              }
            }}
          >
            <Mic size={20} aria-hidden /> Allow microphone
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Not now
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function Summary({ text, results, onAgain, onBack }: { text: ReadingText; results: Record<number, ReadReply>; onAgain: () => void; onBack: () => void }) {
  const done = Object.values(results).filter((r) => r.heard === 'ok')
  const total = done.reduce((n, r) => n + r.total, 0)
  const clear = done.reduce((n, r) => n + r.correct, 0)
  const practice = [...new Set(done.flatMap((r) => r.practice.map((p) => p.word)))].slice(0, 8)
  return (
    <main className="mx-auto grid w-full max-w-[640px] gap-5 px-4 pb-10 pt-[calc(env(safe-area-inset-top,0px)+28px)] sm:px-8">
      <motion.section initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-4xl bg-night p-6 text-center text-white shadow-pop">
        <Buddy mood="cheer" className="mx-auto h-24 w-24" />
        <h1 className="mt-2 font-display text-[1.9rem] font-semibold">{done.length === text.parts.length ? `You read ${text.title}!` : `Great reading in ${text.title}!`}</h1>
        <p className="mt-1 text-lg text-white/80">
          {done.length} of {text.parts.length} {text.parts.length === 1 ? 'part' : 'parts'}, with {clear} of {total} words coming through clearly.
        </p>
      </motion.section>
      {practice.length > 0 && (
        <section className="card p-5">
          <h2 className="mb-3 font-display text-xl font-semibold">Words to practise</h2>
          <ul className="flex flex-wrap gap-2">
            {practice.map((w) => (
              <li key={w}>
                <button type="button" onClick={() => speak(w)} className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-sun-soft px-4 font-display text-lg font-semibold shadow-[inset_0_0_0_2px_#FFC93C]">
                  <Volume2 size={18} aria-hidden /> {w}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" className="btn btn-sun" onClick={onBack}>
          <BookOpen size={20} aria-hidden /> Read something else
        </button>
        <button type="button" className="btn btn-ghost" onClick={onAgain}>
          <RotateCcw size={20} aria-hidden /> Read it again
        </button>
      </div>
    </main>
  )
}
