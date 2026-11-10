import { BookOpen, ScanLine, Users, type LucideIcon } from 'lucide-react'
import { Buddy } from '../components/art'
import { Sparkle } from '../components/scene'
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
        <div className="relative mx-auto grid h-52 w-52 place-items-center rounded-full" style={{ background: 'radial-gradient(circle at 50% 40%, #FFF3C9 0%, #FFE0A0 55%, #FFD27A 100%)', boxShadow: 'inset 0 0 0 6px #fff, 0 8px 0 rgba(23,21,58,0.1)' }}>
          <Buddy mood="happy" className="float h-36 w-36 drop-shadow-lg" />
          <span className="tile absolute -right-1 bottom-4 h-14 w-14 -rotate-6 !text-ink ring-4 ring-white" style={{ background: 'linear-gradient(180deg,#FFD95E,#FFB81F)' }}>
            <c.icon size={28} aria-hidden />
          </span>
          <Sparkle className="twinkle absolute -left-3 top-6 h-7 w-7" color="#7C5CFF" />
          <Sparkle className="twinkle absolute right-2 top-0 h-5 w-5" color="#FF5FA2" />
          <Sparkle className="twinkle absolute -left-1 bottom-8 h-4 w-4" color="#3E8EF0" />
        </div>
        <h1 className="mt-6 font-display text-[2rem] font-semibold">{c.title}</h1>
        <p className="mx-auto mt-2 max-w-[38ch] text-lg text-ink-soft">{c.body}</p>
        <p className="mx-auto mt-4 inline-block rounded-full bg-grape-soft px-4 py-2 text-sm font-bold text-grape-deep shadow-[inset_0_0_0_2px_rgba(91,59,224,0.18)]">Arriving in the next preview</p>
        <div className="mt-8">
          <button type="button" className="btn btn-grape" onClick={onHome}>
            Back to your world
          </button>
        </div>
      </div>
    </main>
  )
}
