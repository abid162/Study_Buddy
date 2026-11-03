import type { ReactNode } from 'react'
import { BookOpen, House, MessageCircleHeart, ScanLine, Users, type LucideIcon } from 'lucide-react'
import { Buddy } from './art'

export type Tab = 'home' | 'tutor' | 'scan' | 'read' | 'parent'

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'World', icon: House },
  { id: 'tutor', label: 'Tutor', icon: MessageCircleHeart },
  { id: 'scan', label: 'Scan', icon: ScanLine },
  { id: 'read', label: 'Read', icon: BookOpen },
  { id: 'parent', label: 'Grown-ups', icon: Users },
]

export function Shell({ tab, onTab, children, hideNav = false }: { tab: Tab; onTab: (t: Tab) => void; children: ReactNode; hideNav?: boolean }) {
  return (
    <div className="min-h-dvh lg:flex">
      {!hideNav && (
        <nav aria-label="Main" className="sticky top-0 hidden h-dvh w-[104px] shrink-0 flex-col items-center gap-2 bg-night py-6 lg:flex">
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-night-soft">
            <Buddy className="h-11 w-11" title="Study Buddy" />
          </div>
          {TABS.map((t) => {
            const on = t.id === tab
            const Icon = t.icon
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onTab(t.id)}
                aria-current={on ? 'page' : undefined}
                className={`flex w-[84px] flex-col items-center gap-1 rounded-2xl py-3 text-xs font-bold transition-colors ${
                  on ? 'bg-sun text-ink' : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={24} strokeWidth={2.2} aria-hidden />
                {t.label}
              </button>
            )
          })}
        </nav>
      )}
      <div className={`min-w-0 flex-1 ${hideNav ? '' : 'pb-[calc(84px+env(safe-area-inset-bottom,0px))] lg:pb-0'}`}>{children}</div>
      {!hideNav && (
        <nav
          aria-label="Main"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-night/95 backdrop-blur lg:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <ul className="mx-auto grid h-[76px] max-w-[560px] grid-cols-5 px-2">
            {TABS.map((t) => {
              const on = t.id === tab
              const Icon = t.icon
              return (
                <li key={t.id} className="grid place-items-center">
                  <button
                    type="button"
                    onClick={() => onTab(t.id)}
                    aria-current={on ? 'page' : undefined}
                    className={`flex min-w-[64px] flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 text-[11px] font-bold transition-colors ${
                      on ? 'text-sun' : 'text-white/70'
                    }`}
                  >
                    <span className={`grid h-9 w-12 place-items-center rounded-full transition-colors ${on ? 'bg-sun text-ink' : ''}`}>
                      <Icon size={22} strokeWidth={2.2} aria-hidden />
                    </span>
                    {t.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      )}
    </div>
  )
}
