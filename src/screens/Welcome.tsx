import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react'
import { Buddy } from '../components/art'
import { NightPage, Sparkle } from '../components/scene'
import { useAccount } from '../data/account'

export const PASSCODE = 'buddy2026'

type View = 'choose' | 'email' | 'code' | 'demo'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const inputCls =
  'min-h-[58px] w-full rounded-[20px] border-[2.5px] border-[#CFD4F0] bg-[#F8F9FF] pl-12 pr-4 text-lg focus:border-grape focus:bg-paper focus:shadow-[0_0_0_4px_rgba(124,92,255,0.2)] focus:outline-none'
const slide = { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const } }

/** First screen: grown-ups sign in to save progress, or anyone with the passcode tries the demo. */
export function Welcome() {
  const { configured, sendCode, verifyCode, startDemo } = useAccount()
  const [view, setView] = useState<View>(configured ? 'choose' : 'demo')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [wait, setWait] = useState(0)
  const focusRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (view !== 'choose') focusRef.current?.focus()
  }, [view])

  useEffect(() => {
    if (!wait) return
    const t = window.setTimeout(() => setWait((w) => w - 1), 1000)
    return () => window.clearTimeout(t)
  }, [wait])

  const go = (v: View) => {
    setError('')
    setView(v)
  }

  const send = async (e?: FormEvent) => {
    e?.preventDefault()
    const clean = email.trim().toLowerCase()
    if (!EMAIL.test(clean)) return setError('Type your full email address, like name@example.com.')
    setBusy(true)
    setError('')
    try {
      await sendCode(clean)
      setEmail(clean)
      setCode('')
      setWait(60)
      setView('code')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const verify = async (e: FormEvent) => {
    e.preventDefault()
    const digits = code.replace(/\D/g, '')
    if (digits.length < 6) return setError('Type the code from the email. It’s 6 digits.')
    setBusy(true)
    setError('')
    try {
      await verifyCode(email, digits)
      // the account context switches the app over as soon as the session arrives
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  const unlock = (e: FormEvent) => {
    e.preventDefault()
    if (pass.trim().toLowerCase() === PASSCODE) startDemo()
    else setError("That passcode doesn't match. Check the code in your invite and try again.")
  }

  const back = (to: View) => (
    <button type="button" onClick={() => go(to)} className="mb-4 inline-flex min-h-[44px] items-center gap-1.5 rounded-full pr-3 font-bold text-ink-soft hover:text-ink">
      <ArrowLeft size={20} aria-hidden /> Back
    </button>
  )

  const errorLine = error && (
    <p id="welcome-error" role="alert" className="mt-3 font-bold text-coral-deep">
      {error}
    </p>
  )

  return (
    <NightPage moon className="grid place-items-center px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="relative mx-auto w-full max-w-[440px]">
        <Sparkle className="twinkle absolute -left-2 top-10 h-6 w-6" />
        <Sparkle className="twinkle absolute right-2 top-24 h-4 w-4" color="#FF8EBB" />
        <Buddy mood={view === 'code' ? 'cheer' : 'wink'} className="float mx-auto -mb-6 h-36 w-36 drop-shadow-xl" title="Nova the fox" />
        <div className="overflow-hidden rounded-4xl bg-paper p-7 pt-10 shadow-pop sm:p-9 sm:pt-12">
          <h1 className="text-center font-display text-[2.6rem] font-semibold leading-none">
            <span className="text-grape-deep">Study</span> <span className="text-[#E26A00]">Buddy</span>
          </h1>

          <AnimatePresence mode="wait" initial={false}>
            {view === 'choose' && (
              <motion.div key="choose" {...slide}>
                <p className="mx-auto mt-3 max-w-[32ch] text-center text-ink-soft">Grown-ups, sign in to save each child’s progress on any phone, tablet or computer.</p>
                <button type="button" className="btn btn-sun sheen mt-7 w-full text-xl" onClick={() => go('email')}>
                  <Mail size={22} strokeWidth={2.6} aria-hidden /> Sign in with email
                </button>
                <button type="button" className="btn btn-ghost mt-3 w-full" onClick={() => go('demo')}>
                  <Sparkles size={20} aria-hidden /> Try the demo
                </button>
                <p className="mt-4 text-center text-sm text-ink-soft">New here? Signing in creates your account. No password needed.</p>
              </motion.div>
            )}

            {view === 'email' && (
              <motion.form key="email" {...slide} onSubmit={send} noValidate className="mt-6">
                {back('choose')}
                <label htmlFor="email" className="mb-2 block font-bold">
                  Your email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" size={20} aria-hidden />
                  <input
                    id="email"
                    ref={focusRef}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    enterKeyHint="send"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'welcome-error' : 'email-help'}
                    className={inputCls}
                    placeholder="name@example.com"
                  />
                </div>
                {errorLine || (
                  <p id="email-help" className="mt-2 text-sm text-ink-soft">
                    We’ll email you a 6-digit code and a sign-in link. Use whichever is easier.
                  </p>
                )}
                <button className="btn btn-sun sheen mt-6 w-full text-xl" type="submit" disabled={busy}>
                  {busy ? 'Sending…' : 'Email me a code'}
                </button>
              </motion.form>
            )}

            {view === 'code' && (
              <motion.form key="code" {...slide} onSubmit={verify} noValidate className="mt-6">
                {back('email')}
                <p className="mb-5 text-ink-soft">
                  We sent a code to <strong className="break-all text-ink">{email}</strong>. Type it below, or tap the link in the email on this device.
                </p>
                <label htmlFor="otp" className="mb-2 block font-bold">
                  Code from the email
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" size={20} aria-hidden />
                  <input
                    id="otp"
                    ref={focusRef}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    enterKeyHint="go"
                    maxLength={10}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/[^\d ]/g, ''))
                      setError('')
                    }}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'welcome-error' : undefined}
                    className={`${inputCls} font-display text-2xl tracking-[0.3em] tabular`}
                    placeholder="••••••"
                  />
                </div>
                {errorLine}
                <button className="btn btn-sun sheen mt-6 w-full text-xl" type="submit" disabled={busy}>
                  {busy ? 'Checking…' : 'Sign in'}
                </button>
                <p className="mt-4 text-center text-sm text-ink-soft">
                  No email after a minute? Check spam, or{' '}
                  {wait ? (
                    <span className="tabular">send a new code in {wait}s.</span>
                  ) : (
                    <button type="button" onClick={() => void send()} className="min-h-[44px] font-bold text-grape-deep underline underline-offset-2">
                      send a new code
                    </button>
                  )}
                </p>
              </motion.form>
            )}

            {view === 'demo' && (
              <motion.form key="demo" {...slide} onSubmit={unlock} noValidate className="mt-6">
                {configured && back('choose')}
                <p className="mb-5 text-ink-soft">The demo is a private preview. Progress stays on this device and nothing is saved to an account.</p>
                <label htmlFor="code" className="mb-2 block font-bold">
                  Passcode
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" size={20} aria-hidden />
                  <input
                    id="code"
                    ref={focusRef}
                    type="password"
                    autoComplete="off"
                    value={pass}
                    onChange={(e) => {
                      setPass(e.target.value)
                      setError('')
                    }}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'welcome-error' : undefined}
                    className={inputCls}
                  />
                </div>
                {errorLine}
                <button className="btn btn-sun sheen mt-6 w-full text-xl" type="submit">
                  Enter the world <ArrowRight size={22} strokeWidth={3} aria-hidden />
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
        <p className="mt-6 text-center text-sm text-white/85">Prepared by Cleartwo. Signed-in progress is stored securely in the UK.</p>
      </motion.div>
    </NightPage>
  )
}
