import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { Buddy } from '../components/art'

export const PASSCODE = 'buddy2026'

export function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (code.trim().toLowerCase() === PASSCODE) onUnlock()
    else setError("That passcode doesn't match. Check the code in your invite and try again.")
  }
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-night px-5 py-10">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-grape/50 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-sea/40 blur-3xl" aria-hidden />
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-40" aria-hidden>
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={`${(i * 37) % 100}%`} cy={`${(i * 53) % 100}%`} r={(i % 3) + 1} fill="#fff" opacity={0.5} />
        ))}
      </svg>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="relative w-full max-w-[440px]">
        <Buddy mood="wink" className="float mx-auto -mb-6 h-36 w-36 drop-shadow-xl" title="Nova the fox" />
        <form onSubmit={submit} className="rounded-4xl bg-paper p-7 pt-10 shadow-pop sm:p-9 sm:pt-12" noValidate>
          <h1 className="text-center font-display text-[2.25rem] font-semibold leading-none">Study Buddy</h1>
          <p className="mx-auto mt-3 max-w-[30ch] text-center text-ink-soft">A private preview. Enter the passcode from your invite to explore.</p>
          <label htmlFor="code" className="mb-2 mt-7 block font-bold">
            Passcode
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" size={20} aria-hidden />
            <input
              id="code"
              type="password"
              autoComplete="off"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError('')
              }}
              aria-invalid={!!error}
              aria-describedby={error ? 'code-error' : undefined}
              className="min-h-[56px] w-full rounded-2xl border-2 border-mist-deep bg-paper pl-12 pr-4 text-lg focus:border-grape focus:outline-none"
            />
          </div>
          {error && (
            <p id="code-error" role="alert" className="mt-3 font-bold text-coral-deep">
              {error}
            </p>
          )}
          <button className="btn btn-sun mt-6 w-full" type="submit">
            Enter the world
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-white/70">Prepared by Cleartwo. Sample data only; nothing is saved.</p>
      </motion.div>
    </main>
  )
}
