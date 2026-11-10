import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Lock } from 'lucide-react'
import { Buddy } from '../components/art'
import { NightPage, Sparkle } from '../components/scene'

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
    <NightPage moon className="grid place-items-center px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="relative mx-auto w-full max-w-[440px]">
        <Sparkle className="twinkle absolute -left-2 top-10 h-6 w-6" />
        <Sparkle className="twinkle absolute right-2 top-24 h-4 w-4" color="#FF8EBB" />
        <Buddy mood="wink" className="float mx-auto -mb-6 h-36 w-36 drop-shadow-xl" title="Nova the fox" />
        <form onSubmit={submit} className="rounded-4xl bg-paper p-7 pt-10 shadow-pop sm:p-9 sm:pt-12" noValidate>
          <h1 className="text-center font-display text-[2.6rem] font-semibold leading-none">
            <span className="text-grape-deep">Study</span> <span className="text-[#E26A00]">Buddy</span>
          </h1>
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
              className="min-h-[58px] w-full rounded-[20px] border-[2.5px] border-[#CFD4F0] bg-[#F8F9FF] pl-12 pr-4 text-lg focus:border-grape focus:bg-paper focus:shadow-[0_0_0_4px_rgba(124,92,255,0.2)] focus:outline-none"
            />
          </div>
          {error && (
            <p id="code-error" role="alert" className="mt-3 font-bold text-coral-deep">
              {error}
            </p>
          )}
          <button className="btn btn-sun sheen mt-6 w-full text-xl" type="submit">
            Enter the world <ArrowRight size={22} strokeWidth={3} aria-hidden />
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-white/85">Prepared by Cleartwo. Sample data only; nothing is saved.</p>
      </motion.div>
    </NightPage>
  )
}
