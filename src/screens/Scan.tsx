import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Camera, Check, ChevronDown, CircleHelp, ImageUp, Play, RotateCcw, ScanLine, Sparkles, TriangleAlert, X } from 'lucide-react'
import { Buddy } from '../components/art'
import { useProfile } from '../data/profile'
import { prepareSheet, scanHomework, type ScanItem, type ScanResult } from '../data/ai'
import { sampleResult } from '../data/scanSamples'
import { allQuests, statementById, type QuestDef, type Subject, type Year } from '../data/syllabus'
import { islandById, type IslandId } from '../data/world'

type Pick = 'maths' | 'english' | 'auto'
type Step = { s: 'start' } | { s: 'ready'; base64: string; preview: string } | { s: 'scanning'; preview?: string } | { s: 'result'; result: ScanResult; preview?: string; sample: boolean } | { s: 'error'; message: string; base64?: string; preview?: string }

const LINES = ['Nova is reading your sheet…', 'Finding each question…', 'Checking your answers…', 'Matching them to your Year {y} curriculum…', 'Writing helpful tips…']

const STATUS: Record<ScanItem['status'], { label: string; cls: string; icon: typeof Check }> = {
  correct: { label: 'Correct', cls: 'bg-mint-soft text-mint-deep', icon: Check },
  incorrect: { label: 'Have another go', cls: 'bg-coral-soft text-coral-deep', icon: X },
  partly: { label: 'Nearly', cls: 'bg-sun-soft text-ink', icon: Sparkles },
  unanswered: { label: 'Not answered', cls: 'bg-mist text-ink-soft', icon: CircleHelp },
  unclear: { label: 'Hard to read', cls: 'bg-mist text-ink-soft', icon: CircleHelp },
}

export function Scan({ onPractise }: { onPractise: (world: IslandId, subject: Subject, q: QuestDef) => void }) {
  const { profile } = useProfile()
  const year = (profile?.year ?? 5) as Year
  const world: IslandId = profile?.interests[0] ?? 'football'
  const [pick, setPick] = useState<Pick>('maths')
  const [step, setStep] = useState<Step>({ s: 'start' })
  const [line, setLine] = useState(0)
  const camRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const abort = useRef<AbortController | null>(null)

  useEffect(() => {
    if (step.s !== 'scanning') return
    setLine(0)
    const t = window.setInterval(() => setLine((l) => (l + 1) % LINES.length), 2200)
    return () => window.clearInterval(t)
  }, [step.s])

  useEffect(() => () => abort.current?.abort(), [])

  const onFile = async (f?: File) => {
    if (!f) return
    try {
      const { base64, preview } = await prepareSheet(f)
      setStep({ s: 'ready', base64, preview })
    } catch (e) {
      setStep({ s: 'error', message: (e as Error).message })
    }
  }

  const run = async (base64: string, preview: string) => {
    setStep({ s: 'scanning', preview })
    abort.current = new AbortController()
    try {
      const result = await scanHomework(base64, year, pick, abort.current.signal)
      if (!result.readable || !result.items.length) setStep({ s: 'error', message: 'Nova couldn’t read that sheet clearly. Try a sharper photo in good light, with the whole page in the frame.', base64, preview })
      else setStep({ s: 'result', result, preview, sample: false })
    } catch (e) {
      setStep({ s: 'error', message: `${(e as Error).message || 'Something went wrong.'} You can try again, or look at a sample sheet.`, base64, preview })
    }
  }

  const sample = () => {
    setStep({ s: 'scanning' })
    window.setTimeout(() => setStep({ s: 'result', result: sampleResult(year, pick === 'english' ? 'english' : 'maths'), sample: true }), 2600)
  }

  const questFor = (cid: string): [Subject, QuestDef] | undefined => {
    const st = statementById(cid)
    if (!st) return
    const q = allQuests(year, st.subject).find((x) => x.curriculumId === cid && x.playable)
    return q ? [st.subject, q] : undefined
  }

  return (
    <main className="mx-auto w-full max-w-[860px] px-4 pb-10 pt-[calc(env(safe-area-inset-top,0px)+20px)] sm:px-8">
      <header className="mb-5 flex items-center gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-night text-sun shadow-pop">
          <ScanLine size={28} aria-hidden />
        </span>
        <div>
          <h1 className="font-display text-[1.9rem] font-semibold leading-tight">Homework scanner</h1>
          <p className="text-ink-soft">Snap a worksheet. Nova checks it against the Year {year} curriculum.</p>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {(step.s === 'start' || step.s === 'error') && (
          <motion.section key="start" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-5">
            {step.s === 'error' && (
              <div className="flex gap-3 rounded-3xl bg-coral-soft p-4 text-ink ring-2 ring-inset ring-coral" role="alert">
                <TriangleAlert className="mt-0.5 shrink-0 text-coral-deep" size={22} aria-hidden />
                <div className="flex-1">
                  <p className="font-bold">{step.message}</p>
                  {step.base64 && step.preview && (
                    <button type="button" className="mt-2 font-bold text-coral-deep underline underline-offset-4" onClick={() => run(step.base64!, step.preview!)}>
                      Try this photo again
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="card p-5">
              <p className="mb-3 font-display text-lg font-semibold">Which subject is the homework?</p>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Subject">
                {(
                  [
                    ['maths', 'Maths'],
                    ['english', 'English'],
                    ['auto', 'Not sure'],
                  ] as const
                ).map(([id, label]) => (
                  <button key={id} type="button" role="radio" aria-checked={pick === id} onClick={() => setPick(id)} className={`min-h-[52px] rounded-2xl font-display text-lg font-semibold ring-2 ring-inset transition-colors ${pick === id ? 'bg-grape text-white ring-grape' : 'bg-mist text-ink ring-mist-deep hover:bg-mist-deep'}`}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button type="button" className="btn btn-sun" onClick={() => camRef.current?.click()}>
                  <Camera size={22} aria-hidden /> Take a photo
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
                  <ImageUp size={22} aria-hidden /> Choose a photo
                </button>
              </div>
              <input ref={camRef} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} onChange={(e) => onFile(e.target.files?.[0])} />
              <input ref={fileRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={(e) => onFile(e.target.files?.[0])} />
              <button type="button" onClick={sample} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl p-3 font-bold text-grape-deep hover:bg-grape-soft">
                <Play size={18} aria-hidden /> Try a sample sheet
              </button>
            </div>
            <div className="card flex items-center gap-4 p-5">
              <Buddy mood="wink" className="h-16 w-16 shrink-0" />
              <ul className="grid gap-1 text-ink-soft">
                <li>• Lay the sheet flat, in good light.</li>
                <li>• Fit the whole page in the photo.</li>
                <li>• Grown-ups: the photo is only used to mark the sheet and is not kept.</li>
              </ul>
            </div>
          </motion.section>
        )}

        {step.s === 'ready' && (
          <motion.section key="ready" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card grid gap-4 p-5">
            <img src={step.preview} alt="Your homework sheet" className="max-h-[60dvh] w-full rounded-2xl bg-mist object-contain" />
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" className="btn btn-sun" onClick={() => run(step.base64, step.preview)}>
                <ScanLine size={22} aria-hidden /> Scan with Nova
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setStep({ s: 'start' })}>
                <RotateCcw size={20} aria-hidden /> Choose another
              </button>
            </div>
          </motion.section>
        )}

        {step.s === 'scanning' && (
          <motion.section key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="card grid place-items-center gap-5 p-6 text-center" aria-live="polite">
            <div className="relative w-full max-w-[360px] overflow-hidden rounded-3xl bg-night">
              {step.preview ? (
                <img src={step.preview} alt="" className="h-72 w-full object-contain opacity-80" />
              ) : (
                <div className="grid h-72 place-items-center p-6">
                  <div className="grid w-full gap-3">
                    {Array.from({ length: 7 }, (_, i) => (
                      <div key={i} className="h-3 rounded-full bg-white/20" style={{ width: `${55 + ((i * 37) % 40)}%` }} />
                    ))}
                  </div>
                </div>
              )}
              <motion.div className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-sun/60 to-transparent" animate={{ top: ['-15%', '95%', '-15%'] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }} aria-hidden />
            </div>
            <div className="flex items-center gap-3">
              <Buddy mood="think" className="h-12 w-12" />
              <AnimatePresence mode="wait">
                <motion.p key={line} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="font-display text-lg font-semibold">
                  {LINES[line]!.replace('{y}', String(year))}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.section>
        )}

        {step.s === 'result' && (
          <motion.section key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4">
            <div className="overflow-hidden rounded-4xl bg-night p-5 text-white shadow-pop sm:p-6">
              {step.sample && <p className="chip mb-3 bg-white/10 text-white ring-1 ring-inset ring-white/20">Sample sheet</p>}
              <div className="flex items-center gap-4">
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-sun text-ink">
                  <span className="font-display text-2xl font-bold tabular">
                    {step.result.score.correct}/{step.result.score.total}
                  </span>
                </div>
                <div>
                  <p className="font-display text-xl font-semibold">{step.result.praise}</p>
                  <p className="text-white/75">{step.result.summary}</p>
                </div>
              </div>
            </div>
            <ul className="grid gap-3">
              {step.result.items.map((it, i) => (
                <ResultRow key={i} it={it} n={i + 1} practise={questFor(it.curriculum_id)} world={world} onPractise={onPractise} />
              ))}
            </ul>
            <div className="card flex items-center gap-4 p-5">
              <Buddy mood="cheer" className="h-14 w-14 shrink-0" />
              <p>
                <span className="font-bold">Next step: </span>
                {step.result.next_step}
              </p>
            </div>
            <button type="button" className="btn btn-sun" onClick={() => setStep({ s: 'start' })}>
              <Camera size={20} aria-hidden /> Scan another sheet
            </button>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  )
}

function ResultRow({ it, n, practise, world, onPractise }: { it: ScanItem; n: number; practise?: [Subject, QuestDef]; world: IslandId; onPractise: (w: IslandId, s: Subject, q: QuestDef) => void }) {
  const [open, setOpen] = useState(it.status !== 'correct')
  const st = STATUS[it.status] ?? STATUS.unclear
  const info = statementById(it.curriculum_id)
  return (
    <li className="card overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-3 p-4 text-left">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${st.cls}`}>
          <st.icon size={20} strokeWidth={3} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-ink-soft">
            Question {n} · {st.label}
          </span>
          <span className="block font-bold leading-snug">{it.question}</span>
        </span>
        <ChevronDown size={20} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && (
        <div className="grid gap-3 border-t border-mist-deep p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <p className="rounded-2xl bg-mist p-3">
              <span className="block text-xs font-bold uppercase tracking-wide text-ink-soft">Your answer</span>
              <span className="font-bold">{it.child_answer || '(blank)'}</span>
            </p>
            {it.status !== 'correct' && (
              <p className="rounded-2xl bg-mint-soft p-3">
                <span className="block text-xs font-bold uppercase tracking-wide text-mint-deep">Answer</span>
                <span className="font-bold">{it.correct_answer}</span>
              </p>
            )}
          </div>
          <p>{it.feedback}</p>
          {it.steps.length > 0 && (
            <ol className="grid gap-1.5">
              {it.steps.map((s, i) => (
                <li key={i} className="flex gap-3 rounded-xl bg-sun-soft p-2.5">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-sun text-sm font-bold">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          )}
          {info && (
            <p className="text-sm text-ink-soft">
              Curriculum: Year {info.year} {info.subject}, {info.domain}: {info.text}
            </p>
          )}
          {practise && it.status !== 'correct' && (
            <button type="button" className="btn btn-grape" onClick={() => onPractise(world, practise[0], practise[1])}>
              Practise this in {islandById(world).name}
            </button>
          )}
        </div>
      )}
    </li>
  )
}
