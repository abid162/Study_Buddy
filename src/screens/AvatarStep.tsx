import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Camera, Check, RefreshCw, Shuffle, Sparkles, X } from 'lucide-react'
import { Buddy } from '../components/art'
import {
  AvatarFigure,
  DEFAULT_LOOK,
  EXTRA,
  HAIR,
  HAIR_COLOR,
  HAIR_COLOR_NAMES,
  SKIN,
  SKIN_NAMES,
  TOP,
  TOP_NAMES,
  type AvatarLook,
  type ChildAvatarData,
} from '../components/avatar'
import { drawAvatar, preparePhoto } from '../data/avatarApi'

type Mode = 'build' | 'photo'
type PhotoState =
  | { s: 'idle' }
  | { s: 'ready'; base64: string; preview: string }
  | { s: 'drawing'; preview: string }
  | { s: 'done'; preview: string; avatar: string }
  | { s: 'error'; preview?: string; base64?: string; message: string }

const DRAWING_LINES = ['Nova is sketching your face…', 'Choosing your colours…', 'Adding the finishing touches…', 'Almost ready. Good things take a minute!']

function Swatches({ legend, colors, names, value, onChange }: { legend: string; colors: string[]; names: string[]; value: number; onChange: (i: number) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-bold">{legend}</legend>
      <div className="flex flex-wrap gap-2.5">
        {colors.map((c, i) => (
          <button
            key={c}
            type="button"
            aria-label={names[i]}
            aria-pressed={value === i}
            onClick={() => onChange(i)}
            className={`h-11 w-11 rounded-full transition-shadow duration-150 ${value === i ? 'ring-4 ring-grape ring-offset-2 ring-offset-paper' : 'ring-2 ring-inset ring-black/10 hover:ring-black/25'}`}
            style={{ background: c }}
          />
        ))}
      </div>
    </fieldset>
  )
}

function Chips({ legend, options, value, onChange }: { legend: string; options: string[]; value: number; onChange: (i: number) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-bold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o, i) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === i}
            onClick={() => onChange(i)}
            className={`min-h-[44px] rounded-2xl px-4 font-bold transition-colors duration-150 ${value === i ? 'bg-grape text-white' : 'bg-mist text-ink ring-2 ring-inset ring-mist-deep hover:bg-mist-deep'}`}
          >
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function AvatarStep({ name, initial, onBack, onDone }: { name: string; initial?: ChildAvatarData | null; onBack: () => void; onDone: (a: ChildAvatarData) => void }) {
  const [mode, setMode] = useState<Mode>(initial?.kind === 'photo' ? 'photo' : 'build')
  const [look, setLook] = useState<AvatarLook>(initial?.kind === 'built' ? initial.look : DEFAULT_LOOK)
  const [consent, setConsent] = useState(false)
  const [photo, setPhoto] = useState<PhotoState>(initial?.kind === 'photo' ? { s: 'done', preview: initial.src, avatar: initial.src } : { s: 'idle' })
  const [line, setLine] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (photo.s !== 'drawing') return
    setLine(0)
    const t = window.setInterval(() => setLine((l) => Math.min(l + 1, DRAWING_LINES.length - 1)), 9000)
    return () => window.clearInterval(t)
  }, [photo.s])

  useEffect(() => () => abortRef.current?.abort(), [])

  const set = (k: keyof AvatarLook) => (v: number) => setLook((l) => ({ ...l, [k]: v }))
  const surprise = () =>
    setLook({
      skin: Math.floor(Math.random() * SKIN.length),
      hair: Math.floor(Math.random() * HAIR.length),
      hairColor: Math.floor(Math.random() * HAIR_COLOR.length),
      top: Math.floor(Math.random() * TOP.length),
      extra: Math.floor(Math.random() * EXTRA.length),
    })

  const pick = async (file?: File) => {
    if (!file) return
    try {
      const { base64, preview } = await preparePhoto(file)
      setPhoto({ s: 'ready', base64, preview })
    } catch (e) {
      setPhoto({ s: 'error', message: (e as Error).message })
    }
  }

  const draw = async (base64: string, preview: string) => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setPhoto({ s: 'drawing', preview })
    try {
      const avatar = await drawAvatar(base64, ctrl.signal)
      setPhoto({ s: 'done', preview, avatar })
    } catch (e) {
      if ((e as Error).name === 'AbortError') return setPhoto({ s: 'ready', base64, preview })
      setPhoto({ s: 'error', preview, base64, message: (e as Error).message })
    }
  }

  const cancel = () => abortRef.current?.abort()

  const canFinish = mode === 'build' || photo.s === 'done'
  const finish = () => {
    if (mode === 'build') onDone({ kind: 'built', look })
    else if (photo.s === 'done') onDone({ kind: 'photo', src: photo.avatar })
  }

  return (
    <div className="mt-4 rounded-4xl bg-paper p-5 shadow-pop sm:p-7">
      <div className="mb-5 grid grid-cols-2 gap-1.5 rounded-2xl bg-mist p-1.5" role="tablist" aria-label="How to make your avatar">
        {(
          [
            ['build', 'Build it', Sparkles],
            ['photo', 'Use a photo', Camera],
          ] as const
        ).map(([m, label, Icon]) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl font-display text-lg font-semibold transition-colors duration-150 ${mode === m ? 'bg-paper text-ink shadow-card' : 'text-ink-soft hover:text-ink'}`}
          >
            <Icon size={20} aria-hidden /> {label}
          </button>
        ))}
      </div>

      {mode === 'build' ? (
        <div className="grid gap-6 sm:grid-cols-[180px_1fr] sm:items-start">
          <div className="grid justify-items-center gap-3 sm:sticky sm:top-6">
            <motion.div key={JSON.stringify(look)} initial={{ scale: 0.94 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 20 }}>
              <AvatarFigure look={look} className="h-40 w-40 drop-shadow-md" title={`${name}'s avatar`} />
            </motion.div>
            <button type="button" onClick={surprise} className="flex min-h-[44px] items-center gap-2 rounded-full bg-sun-soft px-4 font-bold text-ink hover:bg-sun">
              <Shuffle size={18} aria-hidden /> Surprise me
            </button>
          </div>
          <div className="grid gap-5">
            <Swatches legend="Skin" colors={SKIN} names={SKIN_NAMES} value={look.skin} onChange={set('skin')} />
            <Chips legend="Hair" options={HAIR} value={look.hair} onChange={set('hair')} />
            <Swatches legend="Hair colour" colors={HAIR_COLOR} names={HAIR_COLOR_NAMES} value={look.hairColor} onChange={set('hairColor')} />
            <Swatches legend="Top" colors={TOP} names={TOP_NAMES} value={look.top} onChange={set('top')} />
            <Chips legend="Extras" options={EXTRA} value={look.extra} onChange={set('extra')} />
          </div>
        </div>
      ) : (
        <div className="grid gap-5">
          <AnimatePresence mode="wait">
            {photo.s === 'drawing' ? (
              <motion.div key="drawing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid justify-items-center gap-4 py-4 text-center" aria-live="polite">
                <div className="relative h-40 w-40">
                  <img src={photo.preview} alt="" className="h-40 w-40 rounded-full object-cover opacity-40 blur-[2px]" />
                  <motion.span className="absolute inset-0 rounded-full border-4 border-dashed border-grape" animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} aria-hidden />
                  <Buddy mood="think" className="absolute -bottom-3 -right-6 h-20 w-20" />
                </div>
                <p className="font-display text-xl font-semibold">{DRAWING_LINES[line]}</p>
                <div className="h-2 w-full max-w-[280px] overflow-hidden rounded-full bg-mist-deep" role="presentation">
                  <motion.div className="h-full w-1/3 rounded-full bg-grape" animate={{ x: ['-100%', '300%'] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} />
                </div>
                <p className="text-sm text-ink-soft">This usually takes under a minute.</p>
                <button type="button" onClick={cancel} className="flex min-h-[44px] items-center gap-1.5 rounded-full px-4 font-bold text-ink-soft hover:bg-mist">
                  <X size={18} aria-hidden /> Cancel
                </button>
              </motion.div>
            ) : photo.s === 'done' ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="grid justify-items-center gap-3 py-2 text-center">
                <img src={photo.avatar} alt={`${name}'s cartoon avatar`} className="h-44 w-44 rounded-full object-cover shadow-pop ring-4 ring-sun" />
                <p className="font-display text-xl font-semibold">Ta-da! Here you are, {name}.</p>
                <button
                  type="button"
                  onClick={() => {
                    setPhoto({ s: 'idle' })
                    fileRef.current?.click()
                  }}
                  className="flex min-h-[44px] items-center gap-1.5 rounded-full px-4 font-bold text-grape-deep hover:bg-grape-soft"
                >
                  <RefreshCw size={18} aria-hidden /> Try another photo
                </button>
              </motion.div>
            ) : (
              <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4">
                <div className="rounded-3xl bg-sun-soft p-4 ring-2 ring-inset ring-sun">
                  <p className="font-bold">Grown-ups, this part is for you</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    Nova turns a photo into a cartoon using an AI drawing tool (OpenAI). The photo is used once to draw the cartoon, then thrown away. We don’t keep the photo or any copy of your child’s face.
                  </p>
                  <label className="mt-3 flex cursor-pointer items-start gap-3">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#7C5CFF]" />
                    <span className="font-bold">I’m {name}’s parent or carer and I’m happy for this photo to be used to draw the cartoon.</span>
                  </label>
                </div>

                {photo.s === 'ready' || (photo.s === 'error' && photo.preview) ? (
                  <div className="flex items-center gap-4">
                    <img src={(photo as { preview: string }).preview} alt="Your chosen photo" className="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-mist-deep" />
                    <button type="button" onClick={() => fileRef.current?.click()} className="font-bold text-grape-deep underline decoration-2 underline-offset-4">
                      Choose a different photo
                    </button>
                  </div>
                ) : null}

                {photo.s === 'error' && (
                  <p role="alert" className="rounded-2xl bg-coral-soft p-3 font-bold text-coral-deep">
                    {photo.message}
                  </p>
                )}

                <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => pick(e.target.files?.[0] ?? undefined)} tabIndex={-1} aria-hidden />

                {photo.s === 'ready' || (photo.s === 'error' && photo.base64) ? (
                  <button
                    type="button"
                    disabled={!consent}
                    onClick={() => {
                      const p = photo as { base64: string; preview: string }
                      draw(p.base64, p.preview)
                    }}
                    className="btn btn-grape w-full"
                  >
                    <Sparkles size={20} aria-hidden /> {photo.s === 'error' ? 'Try drawing again' : 'Draw my avatar'}
                  </button>
                ) : (
                  <button type="button" disabled={!consent} onClick={() => fileRef.current?.click()} className="btn btn-grape w-full">
                    <Camera size={20} aria-hidden /> Choose or take a photo
                  </button>
                )}
                {!consent && <p className="-mt-2 text-center text-sm text-ink-soft">Tick the box above to continue.</p>}
                <p className="text-center text-sm text-ink-soft">Tip: a clear, front-facing photo of one face works best.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <button type="button" onClick={onBack} className="btn btn-ghost">
          Back
        </button>
        <button type="button" onClick={finish} disabled={!canFinish || photo.s === 'drawing'} className="btn btn-sun flex-1">
          <Check size={20} aria-hidden /> {mode === 'photo' && photo.s !== 'done' ? 'Draw your avatar first' : 'Let’s go!'}
        </button>
      </div>
      <button type="button" onClick={() => onDone({ kind: 'built', look: DEFAULT_LOOK })} className="mt-2 min-h-[44px] w-full text-center text-sm font-bold text-ink-soft underline decoration-2 underline-offset-4 hover:text-ink">
        Skip for now
      </button>
    </div>
  )
}
