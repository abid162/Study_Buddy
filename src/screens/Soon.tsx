import { BookOpen, ScanLine, Users, type LucideIcon } from 'lucide-react'
import { Buddy } from '../components/art'
import type { Tab } from '../components/shell'

const COPY: Partial<Record<Tab, { title: string; body: string; icon: LucideIcon }>> = {
  scan: { title: 'Homework scanner', body: 'Snap a worksheet and Nova talks through each question, step by step.', icon: ScanLine },
  read: { title: 'Reading coach', body: 'Read a story aloud while Nova follows along and cheers you on.', icon: BookOpen },
  parent: { title: 'Grown-ups', body: 'Weekly reports, mastery by topic and what to practise next.', icon: Users },
}

export function Soon({ tab, onHome }: { tab: Tab; onHome: () => void }) {
  const c = COPY[tab] ?? COPY.scan!
  return (
    <main className="mx-auto grid min-h-[70dvh] w-full max-w-[640px] place-items-center px-5 py-16 text-center">
      <div>
        <div className="relative mx-auto h-36 w-36">
          <Buddy mood="think" className="float h-36 w-36" />
          <span className="absolute -right-2 bottom-2 grid h-12 w-12 place-items-center rounded-2xl bg-sun text-ink shadow-pop">
            <c.icon size={24} aria-hidden />
          </span>
        </div>
        <h1 className="mt-6 font-display text-[2rem] font-semibold">{c.title}</h1>
        <p className="mx-auto mt-2 max-w-[38ch] text-lg text-ink-soft">{c.body}</p>
        <p className="mx-auto mt-4 inline-block rounded-full bg-paper px-4 py-2 text-sm font-bold text-ink-soft shadow-card">Arriving in the next preview</p>
        <div className="mt-8">
          <button type="button" className="btn btn-grape" onClick={onHome}>
            Back to your world
          </button>
        </div>
      </div>
    </main>
  )
}
