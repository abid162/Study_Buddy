import { useState, type FormEvent, type ReactNode } from 'react'
import { Check, Lock } from 'lucide-react'
import type { Focus, ThemeId, Year } from '../data/questions'
import { THEMES } from '../data/themes'
import { Avatar, BrickModel, EXTRAS, HAIR_COLORS, HAIR_STYLES, SKINS, THEME_ICON, TOPS, type AvatarLook } from '../components/art'

export const PASSCODE = 'buddy2026'

/* ---------- shared bits ---------- */

export function StepTrack({ step }: { step: 1 | 2 | 3 }) {
  const names = ['Grown-up setup', 'Interests', 'Avatar']
  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-bold" aria-label="Setup progress">
      {names.map((n, i) => {
        const state = i + 1 < step ? 'done' : i + 1 === step ? 'now' : 'next'
        return (
          <li key={n} className="flex items-center gap-2" aria-current={state === 'now' ? 'step' : undefined}>
            <span
              className={`grid h-7 w-7 place-items-center rounded-lg tabular ${
                state === 'done' ? 'bg-brick-greenDeep text-white' : state === 'now' ? 'bg-ink text-white' : 'bg-paper text-ink-soft ring-2 ring-inset ring-sky-deep'
              }`}
            >
              {state === 'done' ? <Check size={16} strokeWidth={3} aria-hidden /> : i + 1}
            </span>
            <span className={state === 'next' ? 'text-ink-soft' : 'text-ink'}>{n}</span>
            {i < names.length - 1 && <span className="mx-1 hidden h-0.5 w-6 rounded bg-sky-deep sm:block" aria-hidden />}
          </li>
        )
      })}
    </ol>
  )
}

function Segmented<T extends string | number>({
  legend,
  options,
  value,
  onChange,
  render,
}: {
  legend: string
  options: T[]
  value: T
  onChange: (v: T) => void
  render?: (v: T) => ReactNode
}) {
  return (
    <fieldset>
      <legend className="field-label">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = o === value
          return (
            <button
              key={String(o)}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(o)}
              className={`min-h-[52px] rounded-xl px-5 text-lg font-bold transition-colors duration-150 ${
                on ? 'bg-ink text-white' : 'bg-paper text-ink ring-2 ring-inset ring-sky-deep hover:bg-sky-soft'
              }`}
            >
              {render ? render(o) : o}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

/* ---------- gate ---------- */

export function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (code.trim().toLowerCase() === PASSCODE) onUnlock()
    else setError("That passcode doesn't match. Check the code in your invite and try again.")
  }
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-10">
      <div className="w-full max-w-[460px]">
        <BrickModel rows={THEMES[5].model} built={6} label="A rocket built from bricks" className="mx-auto mb-6 h-44 w-auto" />
        <form onSubmit={submit} className="panel p-8" noValidate>
          <h1 className="font-display text-[2.5rem] leading-none tracking-[0.01em]">Study Buddy</h1>
          <p className="mt-3 text-ink-soft">This is a private demo. Enter the passcode from your invite to open it.</p>
          <label htmlFor="code" className="field-label mt-6">
            Passcode
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" size={20} aria-hidden />
            <input
              id="code"
              className="text-input pl-12"
              type="password"
              autoComplete="off"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError('')
              }}
              aria-invalid={!!error}
              aria-describedby={error ? 'code-error' : undefined}
            />
          </div>
          {error && (
            <p id="code-error" role="alert" className="mt-3 font-bold text-brick-redDeep">
              {error}
            </p>
          )}
          <button className="btn btn-primary mt-6 w-full" type="submit">
            Open demo
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-ink-soft">Prepared by Cleartwo. Sample data only; nothing you enter is saved.</p>
      </div>
    </main>
  )
}

/* ---------- parent setup ---------- */

const FOCUS_LABEL: Record<Focus, string> = {
  mixed: 'Mixed practice',
  times: 'Times tables and division',
  fractions: 'Fractions and decimals',
  measure: 'Area and measures',
}

export function Setup({
  initial,
  onDone,
}: {
  initial: { name: string; year: Year; focus: Focus }
  onDone: (v: { name: string; year: Year; focus: Focus }) => void
}) {
  const [name, setName] = useState(initial.name)
  const [year, setYear] = useState<Year>(initial.year)
  const [focus, setFocus] = useState<Focus>(initial.focus)
  const [consent, setConsent] = useState(false)
  const [tried, setTried] = useState(false)
  const nameError = tried && !name.trim() ? "Add your child's first name or a nickname." : ''
  const consentError = tried && !consent ? 'Tick the box to confirm before handing over.' : ''
  const submit = (e: FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (name.trim() && consent) onDone({ name: name.trim().slice(0, 20), year, focus })
  }
  return (
    <main className="mx-auto w-full max-w-[1100px] px-5 pb-16 pt-8">
      <StepTrack step={1} />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
        <form onSubmit={submit} className="panel p-7 sm:p-10" noValidate>
          <h1 className="font-display text-[2.25rem] leading-tight">Set up for your child</h1>
          <p className="mt-2 max-w-[56ch] text-ink-soft">A minute of setup, then hand the tablet over. You can see what they practised from the Grown-ups view.</p>

          <div className="mt-8 grid gap-7">
            <div>
              <label htmlFor="name" className="field-label">
                Child's first name or nickname
              </label>
              <input
                id="name"
                className="text-input max-w-[360px]"
                value={name}
                maxLength={20}
                autoComplete="off"
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!nameError}
                aria-describedby={nameError ? 'name-error' : 'name-help'}
              />
              {nameError ? (
                <p id="name-error" role="alert" className="mt-2 font-bold text-brick-redDeep">
                  {nameError}
                </p>
              ) : (
                <p id="name-help" className="mt-2 text-sm text-ink-soft">
                  First name only. We don't ask for surnames, birthdays or school names.
                </p>
              )}
            </div>

            <Segmented<Year> legend="School year" options={[4, 5, 6]} value={year} onChange={setYear} render={(y) => `Year ${y}`} />

            <fieldset>
              <legend className="field-label">What should they practise?</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {(Object.keys(FOCUS_LABEL) as Focus[]).map((f) => (
                  <label
                    key={f}
                    className={`flex min-h-[56px] cursor-pointer items-center gap-3 rounded-xl px-4 font-bold transition-colors duration-150 ${
                      focus === f ? 'bg-sky-soft ring-2 ring-inset ring-brick-blue' : 'bg-paper ring-2 ring-inset ring-sky-deep hover:bg-sky-soft'
                    }`}
                  >
                    <input type="radio" name="focus" className="h-5 w-5 accent-[#1C5FCC]" checked={focus === f} onChange={() => setFocus(f)} />
                    {FOCUS_LABEL[f]}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 shrink-0 accent-[#1C5FCC]"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  aria-invalid={!!consentError}
                  aria-describedby={consentError ? 'consent-error' : undefined}
                />
                <span>I'm this child's parent or carer, and I understand this demo uses sample data that isn't saved.</span>
              </label>
              {consentError && (
                <p id="consent-error" role="alert" className="mt-2 font-bold text-brick-redDeep">
                  {consentError}
                </p>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-9">
            Hand over to {name.trim() || 'your child'}
          </button>
        </form>

        <aside className="hidden lg:block" aria-label="How it works">
          <div className="rounded-3xl bg-sky-soft p-7 ring-2 ring-inset ring-sky-deep">
            <h2 className="text-xl font-bold">How a session works</h2>
            <ol className="mt-5 grid gap-5">
              {[
                ['They pick what they love', 'Football, music, space and more. Questions are written around their picks.'],
                ['Every answer builds something', 'Each step they get right adds a row of bricks to their model.'],
                ['Hints before answers', 'If they get stuck, Pip the buddy shows the method one piece at a time.'],
              ].map(([t, d], i) => (
                <li key={t} className="grid grid-cols-[36px_1fr] gap-3">
                  <span className="font-display text-[1.75rem] leading-none text-brick-blue tabular">{i + 1}</span>
                  <span>
                    <span className="block font-bold">{t}</span>
                    <span className="text-ink-soft">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </main>
  )
}

/* ---------- interests ---------- */

const BRICK_TINT: Record<ThemeId, { face: string; text: string }> = {
  football: { face: '#1F7A3B', text: '#FFFFFF' },
  wrestling: { face: '#14284B', text: '#FFFFFF' },
  kpop: { face: '#D9312B', text: '#FFFFFF' },
  building: { face: '#F6C21C', text: '#14284B' },
  music: { face: '#1C5FCC', text: '#FFFFFF' },
  space: { face: '#144AA3', text: '#FFFFFF' },
}

export function Interests({ name, initial, onBack, onDone }: { name: string; initial: ThemeId[]; onBack: () => void; onDone: (ids: ThemeId[]) => void }) {
  const [picked, setPicked] = useState<ThemeId[]>(initial)
  const toggle = (id: ThemeId) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 3 ? p : [...p, id]))
  const full = picked.length >= 3
  return (
    <main className="mx-auto w-full max-w-[1100px] px-5 pb-16 pt-8">
      <StepTrack step={2} />
      <h1 className="mt-8 font-display text-[2.5rem] leading-tight">Hi {name}! What are you into?</h1>
      <p className="mt-2 text-lg text-ink-soft">Pick up to three. Your maths questions will be about these.</p>
      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
        {THEMES.map((t) => {
          const Icon = THEME_ICON[t.id]
          const on = picked.includes(t.id)
          const disabled = !on && full
          const c = BRICK_TINT[t.id]
          return (
            <li key={t.id} className="pt-2">
              <button
                type="button"
                aria-pressed={on}
                disabled={disabled}
                onClick={() => toggle(t.id)}
                className={`group relative flex h-full min-h-[132px] w-full flex-col items-start justify-end gap-1 rounded-xl p-5 text-left transition-[transform,box-shadow] duration-150 ease-out active:translate-y-[3px] ${
                  disabled ? 'opacity-45' : ''
                } ${on ? 'translate-y-[2px] shadow-[0_2px_0_rgba(20,40,75,0.25)]' : 'shadow-[0_6px_0_#9AB0CC] hover:-translate-y-0.5'}`}
                style={{ background: on ? c.face : '#FFFFFF', color: on ? c.text : '#14284B', boxShadow: undefined }}
              >
                <span className="pointer-events-none absolute -top-[9px] left-0 right-0 flex justify-around px-[8%]" aria-hidden>
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="h-[10px] w-[16%] max-w-[44px] rounded-t-[4px]"
                      style={{ background: on ? c.face : '#FFFFFF', boxShadow: on ? 'none' : 'inset 0 2px 0 rgba(20,40,75,0.06)' }}
                    />
                  ))}
                </span>
                <Icon size={28} strokeWidth={2.25} aria-hidden className="mb-auto" style={{ color: on ? c.text : '#1C5FCC' }} />
                <span className="mt-4 text-xl font-bold">{t.label}</span>
                <span style={{ color: on ? c.text : '#3D5478', opacity: on ? 0.9 : 1 }}>{t.blurb}</span>
                {on && (
                  <span className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-paper text-ink">
                    <Check size={18} strokeWidth={3} aria-hidden />
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button type="button" className="btn btn-quiet" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn btn-primary" disabled={picked.length === 0} onClick={() => onDone(picked)}>
          Next: make your avatar
        </button>
        <p className="text-ink-soft" aria-live="polite">
          {picked.length === 0 ? 'Pick at least one to carry on.' : full ? 'Three picked. Tap one to swap it.' : `${picked.length} picked`}
        </p>
      </div>
    </main>
  )
}

/* ---------- avatar ---------- */

function Swatches({ legend, colors, value, onChange, names }: { legend: string; colors: string[]; value: number; onChange: (i: number) => void; names: string[] }) {
  return (
    <fieldset>
      <legend className="field-label">{legend}</legend>
      <div className="flex flex-wrap gap-3">
        {colors.map((c, i) => (
          <button
            key={c}
            type="button"
            aria-pressed={value === i}
            aria-label={names[i]}
            onClick={() => onChange(i)}
            className={`h-12 w-12 rounded-full transition-[box-shadow] duration-150 ${value === i ? 'ring-4 ring-ink ring-offset-2 ring-offset-paper' : 'ring-2 ring-sky-deep hover:ring-ink-faint'}`}
            style={{ background: c }}
          />
        ))}
      </div>
    </fieldset>
  )
}

export function AvatarScreen({ name, initial, onBack, onDone }: { name: string; initial: AvatarLook; onBack: () => void; onDone: (l: AvatarLook) => void }) {
  const [look, setLook] = useState<AvatarLook>(initial)
  const set = (k: keyof AvatarLook) => (v: number) => setLook((l) => ({ ...l, [k]: v }))
  return (
    <main className="mx-auto w-full max-w-[1100px] px-5 pb-16 pt-8">
      <StepTrack step={3} />
      <h1 className="mt-8 font-display text-[2.5rem] leading-tight">Make your avatar, {name}</h1>
      <p className="mt-2 text-lg text-ink-soft">This is you in Study Buddy. You can change it any time.</p>
      <div className="mt-8 grid gap-8 md:grid-cols-[300px_1fr] md:items-start">
        <div className="panel grid place-items-center p-6 md:sticky md:top-24">
          <div className="grid h-[240px] w-[240px] place-items-end overflow-hidden rounded-2xl bg-sky">
            <Avatar look={look} className="h-[220px] w-auto" title={`${name}'s avatar`} />
          </div>
          <p className="mt-4 text-xl font-bold">{name}</p>
        </div>
        <div className="panel grid gap-7 p-7 sm:p-9">
          <Swatches legend="Skin tone" colors={SKINS} value={look.skin} onChange={set('skin')} names={['Light', 'Light medium', 'Medium', 'Medium dark', 'Dark']} />
          <Segmented<number> legend="Hair" options={[0, 1, 2, 3]} value={look.hair} onChange={set('hair')} render={(i) => HAIR_STYLES[i]} />
          <Swatches legend="Hair colour" colors={HAIR_COLORS} value={look.hairColor} onChange={set('hairColor')} names={['Black', 'Brown', 'Ginger', 'Blue']} />
          <Swatches legend="Top" colors={TOPS} value={look.top} onChange={set('top')} names={['Blue', 'Red', 'Green', 'Yellow']} />
          <Segmented<number> legend="Extra" options={[0, 1, 2, 3]} value={look.extra} onChange={set('extra')} render={(i) => EXTRAS[i]} />
          <div className="flex flex-wrap gap-4 pt-2">
            <button type="button" className="btn btn-quiet" onClick={onBack}>
              Back
            </button>
            <button type="button" className="btn btn-go" onClick={() => onDone(look)}>
              Looks good, let's build
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
