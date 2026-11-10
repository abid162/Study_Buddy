import type { ReactNode } from 'react'

/** Decorative backdrops shared by the screens. Everything here is aria-hidden and ignores pointer events. */

const STARS: [number, number, number][] = Array.from({ length: 34 }, (_, i) => [(i * 37 + 11) % 100, (i * 53 + 7) % 100, (i % 3) + 1])

/** A four-point sparkle. */
export function Sparkle({ className, color = '#FFE38A' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z" fill={color} />
    </svg>
  )
}

function Cloud({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 50" className={className} style={style} aria-hidden>
      <path d="M22 44 a16 16 0 0 1 2 -32 a22 22 0 0 1 42 -4 a18 18 0 0 1 32 10 a13 13 0 0 1 0 26 z" fill="#fff" />
    </svg>
  )
}

/**
 * The sky behind headers. `night` shows a moon and more stars (sign-in, onboarding, evenings);
 * otherwise a sun with slow rays. Colours stay deep enough for white text on top.
 */
export function SkyScene({ night = false, hills = true, orb = true, className = '' }: { night?: boolean; hills?: boolean; orb?: boolean; className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: night
            ? 'linear-gradient(165deg, #1A1550 0%, #2B1F86 45%, #4A2DC4 100%)'
            : 'linear-gradient(165deg, #3A1FB0 0%, #5B3BE0 38%, #2F6FE0 78%, #2A7FE6 100%)',
        }}
      />
      {/* glow */}
      <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full blur-3xl" style={{ background: night ? 'rgba(124,92,255,0.55)' : 'rgba(255,201,60,0.45)' }} />
      <div className="absolute -left-16 top-1/3 h-56 w-56 rounded-full bg-rose/25 blur-3xl" />
      {/* stars */}
      <svg className="absolute inset-0 h-full w-full">
        {STARS.slice(0, night ? 34 : 14).map(([x, y, r], i) => (
          <circle key={i} className="twinkle" style={{ animationDelay: `${(i % 7) * 0.4}s` }} cx={`${x}%`} cy={`${y * (night ? 1 : 0.6)}%`} r={r * 0.9} fill="#fff" />
        ))}
      </svg>
      {/* sun or moon */}
      {!orb ? null : night ? (
        <svg viewBox="0 0 100 100" className="absolute right-[76px] top-[calc(env(safe-area-inset-top,0px)+10px)] h-14 w-14 sm:right-[240px] sm:h-20 sm:w-20">
          <circle cx={50} cy={50} r={46} fill="#FFE9A8" opacity={0.18} />
          <circle cx={50} cy={50} r={32} fill="#FFF3C9" />
          <circle cx={40} cy={42} r={6} fill="#F2DE9C" />
          <circle cx={60} cy={58} r={8} fill="#F2DE9C" />
          <circle cx={58} cy={36} r={3.5} fill="#F2DE9C" />
        </svg>
      ) : (
        <svg viewBox="0 0 120 120" className="absolute -top-8 right-[52px] h-32 w-32 sm:-top-6 sm:right-[220px] sm:h-44 sm:w-44">
          <g className="spin-slow" opacity={0.5}>
            {Array.from({ length: 12 }, (_, i) => (
              <path key={i} d="M60 4 L64 26 H56 Z" fill="#FFE38A" transform={`rotate(${i * 30} 60 60)`} />
            ))}
          </g>
          <circle cx={60} cy={60} r={30} fill="#FFD95E" />
          <circle cx={60} cy={60} r={24} fill="#FFE894" />
        </svg>
      )}
      {/* clouds */}
      <div className="drift absolute left-0 top-[18%] w-full" style={{ animationDuration: '70s' }}>
        <Cloud className="h-10 w-24 opacity-25" />
      </div>
      <div className="drift absolute left-0 top-[46%] w-full" style={{ animationDuration: '95s', animationDelay: '-40s' }}>
        <Cloud className="h-14 w-32 opacity-20" />
      </div>
      <div className="drift absolute left-0 top-[6%] w-full" style={{ animationDuration: '120s', animationDelay: '-75s' }}>
        <Cloud className="h-8 w-20 opacity-20" />
      </div>
      {/* hills */}
      {hills && (
        <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-16 w-full sm:h-24">
          <path d="M0 60 V34 C50 10 90 18 140 32 C200 50 250 8 310 20 C350 28 380 22 400 14 V60 Z" fill="#fff" opacity={0.1} />
          <path d="M0 60 V46 C60 26 110 44 170 40 C240 34 280 52 340 38 C370 32 390 36 400 40 V60 Z" fill="#fff" opacity={0.12} />
        </svg>
      )}
    </div>
  )
}

/** Full-screen night sky for sign-in and set-up screens. */
export function NightPage({ children, className = '', moon = false }: { children: ReactNode; className?: string; moon?: boolean }) {
  return (
    <main className={`relative min-h-dvh overflow-hidden ${className}`}>
      <SkyScene night hills={false} orb={moon} className="!fixed" />
      {/* hills on the horizon, with two little floating islands */}
      <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="pointer-events-none fixed inset-x-0 bottom-0 h-24 w-full sm:h-32" aria-hidden>
        <path d="M0 60 V24 C40 0 90 10 130 22 C190 40 240 -2 300 10 C340 18 380 6 400 0 V60 Z" fill="#17124A" />
        <path d="M0 60 V40 C60 22 120 38 180 34 C250 28 290 46 350 32 C375 26 392 30 400 34 V60 Z" fill="#100D38" />
      </svg>
      <svg viewBox="0 0 80 80" className="bob pointer-events-none fixed bottom-14 left-[4%] h-20 w-20 sm:bottom-20 sm:h-28 sm:w-28" aria-hidden>
        <path d="M14 47 Q40 78 66 47 Z" fill="#7A4A23" />
        <ellipse cx={40} cy={46} rx={28} ry={8} fill="#3BB56A" />
        <rect x={37} y={24} width={5} height={20} fill="#5B3A1B" />
        <circle cx={39} cy={19} r={13} fill="#2FBF6B" />
        <circle cx={34} cy={15} r={4} fill="#fff" opacity={0.25} />
      </svg>
      <svg viewBox="0 0 80 80" className="bob pointer-events-none fixed bottom-20 right-[4%] h-16 w-16 sm:bottom-28 sm:h-24 sm:w-24" style={{ animationDelay: '-2s' }} aria-hidden>
        <path d="M18 49 Q40 74 62 49 Z" fill="#7A4A23" />
        <ellipse cx={40} cy={48} rx={24} ry={7} fill="#3BB56A" />
        <path d="M36 46 v-24 l18 7 l-18 7" fill="#FFC93C" stroke="#17153A" strokeWidth={2} strokeLinejoin="round" />
      </svg>
      <div className="relative">{children}</div>
    </main>
  )
}

/** A candy progress bar. `tone` is any CSS colour or gradient. */
export function Bar({ value, tone = '#22C58B', dark = false, className = 'h-3', label }: { value: number; tone?: string; dark?: boolean; className?: string; label?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  return (
    <div className={`track ${dark ? 'track-dark' : ''} ${className}`} role={label ? 'img' : 'presentation'} aria-label={label}>
      <span className="fill transition-[width] duration-700 ease-out" style={{ width: `${pct > 0 ? Math.max(pct, 6) : 0}%`, backgroundColor: tone.startsWith('#') ? tone : undefined, backgroundImage: tone.startsWith('#') ? undefined : `linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 55%), repeating-linear-gradient(115deg, rgba(255,255,255,0.22) 0 10px, rgba(255,255,255,0) 10px 20px), ${tone}`, backgroundSize: tone.startsWith('#') ? undefined : '100% 100%, 40px 100%, 100% 100%' }} />
    </div>
  )
}
