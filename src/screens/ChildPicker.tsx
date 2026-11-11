import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Plus, RefreshCw } from 'lucide-react'
import { Buddy } from '../components/art'
import { ChildAvatar } from '../components/avatar'
import { NightPage } from '../components/scene'
import { useAccount } from '../data/account'
import { islandById } from '../data/world'

/** Signed-in grown-ups: pick which child is learning, add a child, or sign out. */
export function ChildPicker({ onAdd }: { onAdd: () => void }) {
  const { kids, kidsError, reloadKids, choose, email, signOut, hasTerms, agreeTerms } = useAccount()
  const [agreed, setAgreed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const needsTerms = hasTerms === false

  const accept = async () => {
    setBusy(true)
    setError('')
    try {
      await agreeTerms()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <NightPage className="px-4 pb-16 pt-[calc(env(safe-area-inset-top,0px)+24px)] sm:px-8">
      <div className="relative mx-auto w-full max-w-[560px]">
        <div className="mb-5 flex items-end gap-3">
          <Buddy mood={needsTerms ? 'think' : 'cheer'} className="float h-24 w-24 shrink-0 drop-shadow-xl" title="Nova the fox" />
          <h1 className="mb-3 font-display text-[2rem] font-semibold leading-tight text-white sm:text-[2.4rem]">{needsTerms ? 'Welcome to Study Buddy' : kids.length ? 'Who’s learning today?' : 'Let’s add your first explorer'}</h1>
        </div>

        {needsTerms ? (
          <section className="rounded-4xl bg-paper p-6 shadow-pop sm:p-8" aria-labelledby="terms-title">
            <h2 id="terms-title" className="font-display text-2xl font-semibold">
              Before you add a child
            </h2>
            <p className="mt-2 text-ink-soft">Study Buddy saves each child’s first name, school year, chosen worlds, avatar and answers, so their progress follows them to any device and you can see how they’re doing.</p>
            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl bg-mist p-4">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-6 w-6 shrink-0 accent-[#7C5CFF]" />
              <span className="font-bold leading-snug">I’m the parent or guardian of the children I add, and I agree to Study Buddy saving this information for them.</span>
            </label>
            {error && (
              <p role="alert" className="mt-3 font-bold text-coral-deep">
                {error}
              </p>
            )}
            <button type="button" className="btn btn-sun sheen mt-6 w-full text-xl" disabled={!agreed || busy} onClick={() => void accept()}>
              {busy ? 'Saving…' : 'Continue'}
            </button>
          </section>
        ) : (
          <section className="rounded-4xl bg-paper p-5 shadow-pop sm:p-7">
            {kidsError ? (
              <div role="alert" className="grid gap-4">
                <p className="font-bold text-coral-deep">{kidsError}</p>
                <button type="button" className="btn btn-ghost" onClick={() => void reloadKids()}>
                  <RefreshCw size={20} aria-hidden /> Try again
                </button>
              </div>
            ) : (
              <>
                {kids.length > 0 && (
                  <ul className="grid gap-3">
                    {kids.map((k, i) => (
                      <motion.li key={k.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <button
                          type="button"
                          onClick={() => choose(k.id)}
                          className="flex min-h-[84px] w-full items-center gap-4 rounded-3xl bg-mist p-3 pr-5 text-left shadow-[inset_0_0_0_2px_#DCE0F5,0_5px_0_#CDD2EE] transition-transform hover:-translate-y-0.5 active:translate-y-1"
                        >
                          <ChildAvatar data={k.avatar} className="h-16 w-16 shrink-0" title="" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-display text-2xl font-semibold leading-tight">{k.name}</span>
                            <span className="block truncate text-sm text-ink-soft">
                              Year {k.year} · {k.interests.map((w) => islandById(w).name).join(', ')}
                            </span>
                          </span>
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                )}
                <button type="button" className={`btn ${kids.length ? 'btn-ghost mt-4' : 'btn-sun sheen text-xl'} w-full`} onClick={onAdd}>
                  <Plus size={22} strokeWidth={2.8} aria-hidden /> {kids.length ? 'Add another child' : 'Add a child'}
                </button>
              </>
            )}
          </section>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-white/85">
          <span className="break-all">Signed in as {email}</span>
          <button type="button" onClick={() => void signOut()} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 font-bold text-white hover:bg-white/10">
            <LogOut size={18} aria-hidden /> Sign out
          </button>
        </div>
      </div>
    </NightPage>
  )
}
