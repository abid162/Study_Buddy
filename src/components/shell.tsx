import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, House, MessageCircleHeart, ScanLine, Users, type LucideIcon } from 'lucide-react'
import { Buddy } from './art'

export type Tab = 'home' | 'tutor' | 'scan' | 'read' | 'parent'

/** every tab has its own colour, so children can find it without reading the label */
const TABS: { id: Tab; label: string; icon: LucideIcon; tone: string; edge: string }[] = [
  { id: 'home', label: 'World', icon: House, tone: 'linear-gradient(180deg,#FFD95E,#FFB81F)', edge: '#C98F00' },
  { id: 'tutor', label: 'Tutor', icon: MessageCircleHeart, tone: 'linear-gradient(180deg,#FF8EBB,#FF5FA2)', edge: '#C2256E' },
  { id: 'scan', label: 'Scan', icon: ScanLine, tone: 'linear-gradient(180deg,#5FE0AC,#22C58B)', edge: '#0F8A5F' },
  { id: 'read', label: 'Read', icon: BookOpen, tone: 'linear-gradient(180deg,#8AD4FF,#4FB0F5)', edge: '#2563C9' },
  { id: 'parent', label: 'Grown-ups', icon: Users, tone: 'linear-gradient(180deg,#FFB08A,#FF7F5C)', edge: '#D94530' },
]

export function Shell({ tab, onTab, children, hideNav = false }: { tab: Tab; onTab: (t: Tab) => void; children: ReactNode; hideNav?: boolean }) {
  return (
    <div className="min-h-dvh lg:flex">
      {!hideNav && (
        <nav aria-label="Main" className="sticky top-0 hidden h-dvh w-[112px] shrink-0 flex-col items-center gap-2.5 overflow-hidden py-6 lg:flex" style={{ background: 'linear-gradient(180deg, #2B1F86 0%, #1A1550 100%)' }}>
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
            {Array.from({ length: 14 }, (_, i) => (
              <circle key={i} className="twinkle" style={{ animationDelay: `${i * 0.35}s` }} cx={`${(i * 41 + 9) % 100}%`} cy={`${(i * 29 + 5) % 100}%`} r={(i % 2) + 1} fill="#fff" />
            ))}
          </svg>
          <div className="relative mb-5 grid h-16 w-16 place-items-center rounded-[22px] bg-white/10 shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.2),0_4px_0_rgba(10,8,40,0.4)]">
            <Buddy className="float h-12 w-12" title="Study Buddy" />
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
                className={`group relative flex w-[92px] flex-col items-center gap-1.5 rounded-[22px] py-2.5 text-xs font-bold transition-colors ${on ? 'bg-white/15 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}
              >
                <span
                  className={`grid h-11 w-11 place-items-center rounded-2xl transition-transform duration-200 group-hover:-translate-y-0.5 ${on ? 'text-ink' : 'bg-white/10 text-white'}`}
                  style={on ? { background: t.tone, boxShadow: `inset 0 2px 0 rgba(255,255,255,0.55), 0 4px 0 ${t.edge}` } : undefined}
                >
                  <Icon size={24} strokeWidth={2.3} aria-hidden />
                </span>
                {t.label}
              </button>
            )
          })}
        </nav>
      )}
      <div className={`min-w-0 flex-1 ${hideNav ? '' : 'pb-[calc(104px+env(safe-area-inset-bottom,0px))] lg:pb-0'}`}>{children}</div>
      {!hideNav && (
        <nav aria-label="Main" className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-3 lg:hidden" style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom, 0px))' }}>
          <ul
            className="pointer-events-auto mx-auto grid h-[76px] max-w-[520px] grid-cols-5 rounded-[30px] px-1.5"
            style={{ background: 'linear-gradient(180deg, #2D2389 0%, #1B1657 100%)', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.14), inset 0 2px 0 rgba(255,255,255,0.12), 0 6px 0 #100D38, 0 18px 30px -8px rgba(16,13,56,0.6)' }}
          >
            {TABS.map((t) => {
              const on = t.id === tab
              const Icon = t.icon
              return (
                <li key={t.id} className="grid place-items-center">
                  <button
                    type="button"
                    onClick={() => onTab(t.id)}
                    aria-current={on ? 'page' : undefined}
                    className={`relative flex h-[68px] w-full min-w-0 flex-col items-center justify-end gap-0.5 pb-1.5 text-[11px] font-bold ${on ? 'text-white' : 'text-white/70'}`}
                  >
                    <span className="relative grid h-10 w-12 place-items-center">
                      {on && (
                        <motion.span
                          layoutId="tab-bubble"
                          className="absolute inset-x-0 -top-3 mx-auto h-12 w-12 rounded-[18px] ring-4 ring-[#231C70]"
                          style={{ background: t.tone, boxShadow: `inset 0 2px 0 rgba(255,255,255,0.6), 0 4px 0 ${t.edge}` }}
                          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                        />
                      )}
                      <motion.span className={`relative ${on ? 'text-ink' : ''}`} animate={{ y: on ? -12 : 0, scale: on ? 1.08 : 1 }} transition={{ type: 'spring', stiffness: 420, damping: 22 }}>
                        <Icon size={23} strokeWidth={2.3} aria-hidden />
                      </motion.span>
                    </span>
                    <span className="max-w-full truncate px-0.5">{t.label}</span>
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
