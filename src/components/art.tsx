import { useId, useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { ISLANDS, type Island, type IslandId } from '../data/world'
import { photosFor, picUrl, worldPic } from '../data/photos'

/* ---------------- Nova, the study buddy (preset cartoon character) ---------------- */

export type Mood = 'happy' | 'think' | 'cheer' | 'wink'

export function Buddy({ mood = 'happy', className, title }: { mood?: Mood; className?: string; title?: string }) {
  const fur = `nova-fur-${useId().replace(/:/g, '')}`
  const eyes =
    mood === 'cheer' ? (
      <g fill="none" stroke="#17153A" strokeWidth={4.5} strokeLinecap="round">
        <path d="M38 60 q7 -8 14 0" />
        <path d="M68 60 q7 -8 14 0" />
      </g>
    ) : mood === 'wink' ? (
      <g>
        <ellipse cx={45} cy={59} rx={6.5} ry={8} fill="#17153A" />
        <circle cx={47.5} cy={55.5} r={2.4} fill="#fff" />
        <path d="M68 60 q7 -6 14 0" fill="none" stroke="#17153A" strokeWidth={4.5} strokeLinecap="round" />
      </g>
    ) : (
      <g>
        <ellipse cx={45} cy={mood === 'think' ? 56 : 59} rx={6.5} ry={8} fill="#17153A" />
        <ellipse cx={75} cy={mood === 'think' ? 56 : 59} rx={6.5} ry={8} fill="#17153A" />
        <circle cx={47.5} cy={mood === 'think' ? 52.5 : 55.5} r={2.4} fill="#fff" />
        <circle cx={77.5} cy={mood === 'think' ? 52.5 : 55.5} r={2.4} fill="#fff" />
      </g>
    )
  const mouth =
    mood === 'cheer' ? (
      <path d="M52 77 q8 12 16 0 z" fill="#17153A" />
    ) : mood === 'think' ? (
      <path d="M55 79 q5 -2 10 0" fill="none" stroke="#17153A" strokeWidth={3.5} strokeLinecap="round" />
    ) : (
      <path d="M53 76 q7 7 14 0" fill="none" stroke="#17153A" strokeWidth={3.5} strokeLinecap="round" />
    )
  return (
    <svg viewBox="0 0 120 120" className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <radialGradient id={fur} cx="40%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFAE5C" />
          <stop offset="100%" stopColor="#F2701F" />
        </radialGradient>
      </defs>
      <path d="M86 98 C112 96 116 68 104 56 C112 78 98 90 82 88 Z" fill="#F2701F" />
      <path d="M100 66 C108 74 106 86 98 90 C102 82 102 74 100 66 Z" fill="#FFF4E6" />
      <ellipse cx={60} cy={102} rx={28} ry={16} fill={`url(#${fur})`} />
      <ellipse cx={60} cy={106} rx={14} ry={9} fill="#FFF4E6" />
      <path d="M24 44 L30 10 L52 32 Z" fill={`url(#${fur})`} />
      <path d="M96 44 L90 10 L68 32 Z" fill={`url(#${fur})`} />
      <path d="M30 38 L33 19 L45 31 Z" fill="#FFC2B0" />
      <path d="M90 38 L87 19 L75 31 Z" fill="#FFC2B0" />
      <circle cx={60} cy={60} r={36} fill={`url(#${fur})`} />
      <path d="M28 66 C34 92 86 92 92 66 C84 74 72 70 60 72 C48 70 36 74 28 66 Z" fill="#FFF4E6" />
      {eyes}
      <ellipse cx={60} cy={70} rx={5} ry={3.6} fill="#17153A" />
      {mouth}
      <ellipse cx={34} cy={72} rx={6} ry={3.6} fill="#FF7A8A" opacity={0.45} />
      <ellipse cx={86} cy={72} rx={6} ry={3.6} fill="#FF7A8A" opacity={0.45} />
    </svg>
  )
}

/* ---------------- Photo with illustrated fallback ---------------- */

/** A world photo. `n` picks a photo from the world's set (0 = cover). `credit` shows the photographer. */
/** `banner`: wide header photos; photos far too small for it are skipped (they still show on question cards and sheets). */
export function Photo({ island, alt, className, w = 900, n = 0, credit = false, banner = false }: { island: IslandId; alt: string; className?: string; w?: number; n?: number; credit?: boolean; banner?: boolean }) {
  /** photos skipped because they are far too small or the wrong shape for this box (e.g. a small portrait photo in a wide banner) */
  const key = `${island}|${n}`
  const [skipped, setSkipped] = useState({ key, by: 0 })
  const skip = skipped.key === key ? skipped.by : 0
  const total = photosFor(island).length
  const pic = worldPic(island, n + skip)
  const [failed, setFailed] = useState<string | null>(null)
  /** src of a photo too small to fill its box sharply: shown whole over a blurred copy instead of stretched */
  const [small, setSmall] = useState<string | null>(null)
  const tint = ISLANDS.find((i) => i.id === island)!.tint
  const src = picUrl(pic, w)
  const fit = small === src
  const onLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const box = img.parentElement
    if (!box) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    // object-cover scales by the larger ratio; if that blows the image up past ~1.6x of its real pixels it looks soft
    const scale = Math.max((box.clientWidth * dpr) / img.naturalWidth, (box.clientHeight * dpr) / img.naturalHeight)
    if (scale <= 1.6) return setSmall(null)
    // shown whole it would fill less than half the box's width: try the next photo instead
    const shownWidth = img.naturalWidth * Math.min(1, box.clientHeight / img.naturalHeight)
    if (banner && shownWidth < box.clientWidth * 0.5 && skip < total - 1) return setSkipped({ key, by: skip + 1 })
    setSmall(src)
  }
  return (
    <div className={`relative overflow-hidden ${className ?? ''}`} style={{ background: `linear-gradient(135deg, ${tint[0]}, ${tint[1]})` }}>
      {failed !== src && fit && <img src={src} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-2xl" />}
      {failed !== src && (
        <img
          key={src}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={onLoad}
          onError={() => setFailed(src)}
          className={`absolute inset-0 h-full w-full ${fit ? 'object-contain' : 'object-cover'}`}
        />
      )}
      {credit && failed !== src && (
        <span className="absolute right-2 top-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold text-white/85">
          {pic.local ? pic.credit : `Photo: ${pic.credit} / Unsplash`}
        </span>
      )}
      {failed === src && (
        <svg viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full opacity-30" aria-hidden>
          {Array.from({ length: 14 }, (_, i) => (
            <circle key={i} cx={(i * 37) % 200} cy={(i * 23) % 100} r={6 + (i % 4) * 5} fill="#fff" opacity={0.25} />
          ))}
        </svg>
      )}
    </div>
  )
}

/* ---------------- Island landmarks (picture-book style) ---------------- */

function Landmark({ id }: { id: IslandId }) {
  switch (id) {
    case 'football':
      return (
        <g>
          <ellipse cx={0} cy={-6} rx={26} ry={13} fill="#E8EEF7" stroke="#17153A" strokeWidth={2} />
          <ellipse cx={0} cy={-8} rx={19} ry={8} fill="#2FBF6B" stroke="#17153A" strokeWidth={1.5} />
          <line x1={0} y1={-16} x2={0} y2={0} stroke="#fff" strokeWidth={1.5} />
          <circle cx={0} cy={-8} r={3} fill="none" stroke="#fff" strokeWidth={1.2} />
          <rect x={-27} y={-30} width={3} height={22} fill="#17153A" />
          <rect x={24} y={-30} width={3} height={22} fill="#17153A" />
          <rect x={-31} y={-34} width={11} height={6} rx={2} fill="#FFC93C" stroke="#17153A" strokeWidth={1.5} />
          <rect x={20} y={-34} width={11} height={6} rx={2} fill="#FFC93C" stroke="#17153A" strokeWidth={1.5} />
        </g>
      )
    case 'wrestling':
      return (
        <g>
          <path d="M-22 -2 L22 -2 L18 -14 L-18 -14 Z" fill="#3E8EF0" stroke="#17153A" strokeWidth={2} />
          {[-18, 18].map((x) => (
            <rect key={x} x={x - 2} y={-32} width={4} height={20} fill="#17153A" />
          ))}
          {[-26, -21].map((y) => (
            <line key={y} x1={-16} y1={y} x2={16} y2={y} stroke="#FF6B57" strokeWidth={2.5} />
          ))}
          <path d="M-8 -40 h16 l-3 8 h-10 z" fill="#FFC93C" stroke="#17153A" strokeWidth={1.5} />
        </g>
      )
    case 'music':
      return (
        <g>
          <path d="M-26 -2 h52 v-8 h-52 z" fill="#17153A" />
          <path d="M-24 -10 Q0 -44 24 -10 Z" fill="#7C5CFF" stroke="#17153A" strokeWidth={2} />
          <path d="M-14 -10 Q0 -32 14 -10 Z" fill="#FFC93C" opacity={0.9} />
          <circle cx={-6} cy={-36} r={3} fill="#FF6B57" />
          <circle cx={8} cy={-40} r={3} fill="#22C58B" />
          <path d="M14 -44 v-10 l7 -2 v9" fill="none" stroke="#17153A" strokeWidth={2} strokeLinecap="round" />
        </g>
      )
    case 'story':
      return (
        <g>
          {[-14, 0, 14].map((x, i) => (
            <g key={x}>
              <rect x={x - 2} y={-14} width={4} height={12} fill="#7A4A23" />
              <circle cx={x} cy={-22 - (i === 1 ? 8 : 0)} r={i === 1 ? 14 : 11} fill={i === 1 ? '#1FA463' : '#2FBF6B'} stroke="#17153A" strokeWidth={2} />
            </g>
          ))}
          <path d="M-10 -4 h20 l-2 -8 h-16 z" fill="#FFF4E6" stroke="#17153A" strokeWidth={1.5} />
        </g>
      )
    case 'bricks':
      return (
        <g>
          {[
            [-20, -10, 16, '#FF6B57'],
            [-2, -10, 16, '#3E8EF0'],
            [-11, -22, 16, '#FFC93C'],
            [7, -22, 12, '#22C58B'],
            [-4, -34, 12, '#7C5CFF'],
          ].map(([x, y, w, c], i) => (
            <g key={i}>
              <rect x={x as number} y={y as number} width={w as number} height={10} rx={2} fill={c as string} stroke="#17153A" strokeWidth={1.5} />
              <rect x={(x as number) + 3} y={(y as number) - 3} width={4} height={3} rx={1} fill={c as string} stroke="#17153A" strokeWidth={1} />
            </g>
          ))}
        </g>
      )
    case 'space':
      return (
        <g>
          <path d="M0 -46 C10 -34 10 -14 6 -4 h-12 C-10 -14 -10 -34 0 -46 Z" fill="#FFFFFF" stroke="#17153A" strokeWidth={2} />
          <circle cx={0} cy={-28} r={4} fill="#3E8EF0" stroke="#17153A" strokeWidth={1.5} />
          <path d="M-6 -12 l-8 10 h8 z M6 -12 l8 10 h-8 z" fill="#FF6B57" stroke="#17153A" strokeWidth={1.5} />
        </g>
      )
  }
}

/* ---------------- World map ---------------- */

/** Island positions on a 360-wide map, by how many worlds the child picked. No paths, no locks: every world is open. */
const SLOTS: Record<number, { h: number; at: [number, number][] }> = {
  1: { h: 260, at: [[180, 116]] },
  2: { h: 290, at: [[100, 110], [262, 160]] },
  3: { h: 390, at: [[96, 104], [266, 140], [170, 286]] },
  4: { h: 400, at: [[96, 104], [266, 116], [98, 284], [264, 300]] },
  5: { h: 510, at: [[94, 104], [268, 96], [272, 252], [92, 280], [180, 420]] },
  6: { h: 540, at: [[92, 104], [268, 96], [272, 252], [90, 284], [92, 446], [268, 418]] },
}

/** Stage shown on an island: number (1 = first), its name, and progress towards the next one (0 to 1). */
export interface IslandStage {
  n: number
  name: string
  within: number
}

/** The sea both maps sit on: deep-to-shallow water, drifting wave lines, glints, a little sailing boat. */
function Sea({ id, H, boat }: { id: string; H: number; boat?: [number, number] }) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#6FD3FF" />
          <stop offset="55%" stopColor="#3FA2F7" />
          <stop offset="100%" stopColor="#3B7BF0" />
        </linearGradient>
        <radialGradient id="isl-grass" cx="50%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#B4F2A6" />
          <stop offset="100%" stopColor="#3FBF63" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <rect width={360} height={H} rx={30} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect width={360} height={H} fill={`url(#${id})`} />
        {/* light patches under the surface */}
        <g fill="#fff" opacity={0.1}>
          <ellipse cx={60} cy={H * 0.3} rx={90} ry={34} />
          <ellipse cx={300} cy={H * 0.62} rx={110} ry={40} />
          <ellipse cx={150} cy={H * 0.92} rx={120} ry={30} />
        </g>
        <g className="wave" opacity={0.55} fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round">
          {[[26, 44], [222, 30], [150, 0.36], [18, 0.78], [300, 0.6], [140, 0.86], [250, 0.9], [176, 0.42], [40, 0.3], [310, 0.2]].map(([x, y], i) => {
            const yy = y! <= 1 ? y! * H : y!
            return <path key={i} d={`M${x} ${yy} q6 -5 12 0 t12 0`} />
          })}
        </g>
        {[[40, 0.14], [320, 0.44], [200, 0.7], [70, 0.94], [330, 0.86]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y! * H}) scale(0.5)`}>
            <path className="twinkle" style={{ animationDelay: `${i * 0.5}s` }} d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z" fill="#fff" />
          </g>
        ))}
        {/* clouds drifting over the water */}
        <g fill="#fff" opacity={0.9}>
          <g className="float">
            <ellipse cx={176} cy={24} rx={24} ry={9} />
            <ellipse cx={194} cy={19} rx={15} ry={9} />
            <ellipse cx={160} cy={21} rx={11} ry={7} />
          </g>
          <g className="float" style={{ animationDelay: '-1.6s' }}>
            <ellipse cx={28} cy={H - 26} rx={20} ry={7} />
            <ellipse cx={42} cy={H - 31} rx={12} ry={7} />
          </g>
        </g>
        {boat && (
          <g transform={`translate(${boat[0]} ${boat[1]})`}>
            <g className="bob">
              <path d="M-14 0 h28 l-5 8 h-18 z" fill="#FF6B57" stroke="#17153A" strokeWidth={1.8} strokeLinejoin="round" />
              <line x1={0} y1={0} x2={0} y2={-22} stroke="#17153A" strokeWidth={1.8} />
              <path d="M2 -21 L14 -4 H2 Z" fill="#fff" stroke="#17153A" strokeWidth={1.8} strokeLinejoin="round" />
              <path d="M-2 -18 L-10 -4 H-2 Z" fill="#FFC93C" stroke="#17153A" strokeWidth={1.8} strokeLinejoin="round" />
            </g>
          </g>
        )}
      </g>
    </>
  )
}

/** Where the little boat sails, by number of worlds (kept clear of islands and labels). */
const BOAT: Record<number, [number, number]> = { 1: [300, 210], 2: [300, 60], 3: [300, 300], 4: [180, 200], 5: [300, 430], 6: [182, 330] }

export function WorldMap({ picks, current, onPick, stages = {} }: { picks: IslandId[]; current: IslandId; onPick: (i: Island) => void; stages?: Partial<Record<IslandId, IslandStage>> }) {
  const shown = picks.map((id) => ISLANDS.find((i) => i.id === id)!).filter(Boolean)
  const count = Math.min(Math.max(shown.length, 1), 6)
  const slot = SLOTS[count]
  const H = slot.h
  const pos = (i: number) => slot.at[i] ?? slot.at[slot.at.length - 1]
  const ci = Math.max(0, shown.findIndex((i) => i.id === current))
  const [bx, by] = pos(ci)
  // a dotted sea route that links the islands in order
  const route = shown
    .map((_, i) => {
      const [x, y] = pos(i)
      if (i === 0) return `M${x} ${y}`
      const [px, py] = pos(i - 1)
      return `Q${(px + x) / 2 + (i % 2 ? 26 : -26)} ${(py + y) / 2 - 14} ${x} ${y}`
    })
    .join(' ')
  return (
    <svg viewBox={`0 0 360 ${H}`} className="h-auto w-full" role="group" aria-label="Your world map">
      <Sea id="sea" H={H} boat={BOAT[count]} />
      {shown.length > 1 && <path className="dash" d={route} fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={3} strokeDasharray="3 13" strokeLinecap="round" />}

      {shown.map((isl, i) => {
        const [x, y] = pos(i)
        const active = isl.id === current
        const st = stages[isl.id]
        return (
          <g
            key={isl.id}
            transform={`translate(${x} ${y})`}
            role="button"
            tabIndex={0}
            aria-label={`${isl.name}: stage ${stages[isl.id]?.n ?? 1}, ${stages[isl.id]?.name ?? ''}. Open`}
            onClick={() => onPick(isl)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onPick(isl)
              }
            }}
            style={{ cursor: 'pointer', outline: 'none' }}
          >
            {/* shallow water and foam around the island */}
            <ellipse cx={0} cy={8} rx={66} ry={31} fill="#B9ECFF" opacity={0.45} />
            <ellipse cx={0} cy={7} rx={59} ry={27} fill="none" stroke="#fff" strokeWidth={2} opacity={0.8} strokeDasharray="14 8" />
            {active && <ellipse className="dash" cx={0} cy={7} rx={66} ry={31} fill="none" stroke="#FFC93C" strokeWidth={3.5} strokeDasharray="8 8" strokeLinecap="round" />}
            <g className="bob" style={{ animationDelay: `${-i * 0.9}s` }}>
              <ellipse cx={0} cy={11} rx={54} ry={22} fill="#1F5FB8" opacity={0.3} />
              <ellipse cx={0} cy={5} rx={54} ry={23} fill="#FFE3A3" stroke="#17153A" strokeWidth={2.2} />
              <ellipse cx={0} cy={0} rx={46} ry={18} fill="url(#isl-grass)" />
              <ellipse cx={-14} cy={-6} rx={18} ry={5} fill="#fff" opacity={0.25} />
              <circle cx={-36} cy={2} r={5} fill="#2FA85A" stroke="#17153A" strokeWidth={1.4} />
              <circle cx={37} cy={3} r={4} fill="#2FA85A" stroke="#17153A" strokeWidth={1.4} />
              <g transform="translate(0 2) scale(1.22)">
                <Landmark id={isl.id} />
              </g>
            </g>
            {/* name plate */}
            <g transform="translate(0 46)">
              <rect x={-66} y={-11} width={132} height={st ? 44 : 26} rx={14} fill="#17153A" opacity={0.25} />
              <rect x={-66} y={-15} width={132} height={st ? 44 : 26} rx={14} fill="#fff" stroke="#17153A" strokeWidth={2} />
              <text x={0} y={2} textAnchor="middle" fontSize={13} fontWeight={700} fill="#17153A" fontFamily="Fredoka Variable, sans-serif">
                {isl.name}
              </text>
              {st && (
                <>
                  <text x={0} y={15} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={isl.tint[1]} fontFamily="Fredoka Variable, sans-serif">
                    {st.name.length > 22 ? `${st.name.slice(0, 21)}…` : st.name}
                  </text>
                  <rect x={-50} y={19.5} width={100} height={5} rx={2.5} fill="#17153A" opacity={0.12} />
                  <rect x={-50} y={19.5} width={Math.max(6, 100 * st.within)} height={5} rx={2.5} fill={isl.tint[0]} />
                </>
              )}
            </g>
            {/* stage badge */}
            <g transform="translate(46 -30)">
              <circle r={17} cy={2.5} fill="#17153A" opacity={0.25} />
              <circle r={17} fill="#FFC93C" stroke="#17153A" strokeWidth={2.2} />
              <circle r={12.5} fill="none" stroke="#fff" strokeWidth={1.5} opacity={0.7} />
              <text y={-3.5} textAnchor="middle" fontSize={6.5} fontWeight={700} fill="#17153A" fontFamily="Fredoka Variable, sans-serif" letterSpacing={0.4}>
                STAGE
              </text>
              <text y={10} textAnchor="middle" fontSize={15} fontWeight={700} fill="#17153A" fontFamily="Fredoka Variable, sans-serif">
                {st?.n ?? 1}
              </text>
            </g>
          </g>
        )
      })}

      {shown.length > 0 && (
        <motion.g animate={{ y: [0, -6, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
          <g transform={`translate(${bx - 78} ${by - 64})`}>
            <circle cx={20} cy={22.5} r={22} fill="#17153A" opacity={0.25} />
            <circle cx={20} cy={20} r={22} fill="#fff" stroke="#17153A" strokeWidth={2.2} />
            <foreignObject x={2} y={2} width={36} height={36}>
              <Buddy className="h-9 w-9" />
            </foreignObject>
          </g>
        </motion.g>
      )}
    </svg>
  )
}

export function Stars({ n, of = 3 }: { n: number; of?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${n} of ${of} stars`}>
      {Array.from({ length: of }, (_, i) => (
        <Star key={i} size={16} className={i < n ? 'fill-sun text-sun-deep' : 'text-mist-deep'} aria-hidden />
      ))}
    </span>
  )
}

/* ---------------- Stage road (one world's 8 stages as islands on the sea) ---------------- */

const STAGE_SPOTS: [number, number][] = [
  [96, 488],
  [262, 428],
  [100, 368],
  [262, 308],
  [100, 248],
  [262, 188],
  [100, 128],
  [262, 68],
]

/**
 * A world's stage ladder drawn as a road of small islands, stage 1 at the bottom.
 * `marker` (the child's avatar) sits on the current stage. `within` (0 to 1) shows how far along the road to the next stage.
 */
export function StageMap({ world, names, index, within, marker, onStage }: { world: IslandId; names: string[]; index: number; within: number; marker?: React.ReactNode; onStage?: (i: number) => void }) {
  const tint = ISLANDS.find((i) => i.id === world)!.tint
  const H = 540
  const path = STAGE_SPOTS.map(([x, y], i) => {
    if (i === 0) return `M${x} ${y}`
    const [px, py] = STAGE_SPOTS[i - 1]!
    const my = (py + y) / 2
    return `C${px} ${my} ${x} ${my} ${x} ${y}`
  }).join(' ')
  // the road travelled so far: whole stages plus the part towards the next one
  const seg = (i: number) => {
    const [px, py] = STAGE_SPOTS[i]!
    const [x, y] = STAGE_SPOTS[i + 1]!
    const my = (py + y) / 2
    return { px, py, x, y, my }
  }
  const done = STAGE_SPOTS.slice(0, index + 1)
    .map(([x, y], i) => {
      if (i === 0) return `M${x} ${y}`
      const s = seg(i - 1)
      return `C${s.px} ${s.my} ${s.x} ${s.my} ${s.x} ${s.y}`
    })
    .join(' ')
  const [cx, cy] = STAGE_SPOTS[index]!
  const nextSpot = STAGE_SPOTS[index + 1]
  // a point part-way to the next stage (straight-line estimate is close enough for the walker)
  const wx = nextSpot ? cx + (nextSpot[0] - cx) * within : cx
  const wy = nextSpot ? cy + (nextSpot[1] - cy) * within : cy
  // the avatar stands on the outer side of the island, away from the stage names
  const side = (x: number) => (x < 180 ? -1 : 1)
  const off = nextSpot ? side(cx) + (side(nextSpot[0]) - side(cx)) * within : side(cx)
  const ax = wx + off * 46
  const ay = wy - 10
  return (
    <svg viewBox={`0 0 360 ${H}`} className="h-auto w-full" role="group" aria-label={`Stages: you are on stage ${index + 1}, ${names[index]}`}>
      <Sea id="sea2" H={H} />
      <path d={path} fill="none" stroke="#fff" strokeOpacity={0.8} strokeWidth={5} strokeDasharray="2 11" strokeLinecap="round" />
      <path d={done} fill="none" stroke="#17153A" strokeOpacity={0.25} strokeWidth={10} strokeLinecap="round" />
      <path d={done} fill="none" stroke="#FFC93C" strokeWidth={7} strokeLinecap="round" />
      {nextSpot && <line x1={cx} y1={cy} x2={wx} y2={wy} stroke="#FFC93C" strokeWidth={6} strokeLinecap="round" />}

      {STAGE_SPOTS.map(([x, y], i) => {
        const isDone = i < index
        const now = i === index
        const left = x < 180
        const name = names[i] ?? ''
        const label = `${i + 1} · ${name}`
        const w = Math.min(170, 26 + label.length * 6.2)
        return (
          <g
            key={i}
            transform={`translate(${x} ${y})`}
            role={onStage ? 'button' : undefined}
            tabIndex={onStage ? 0 : undefined}
            aria-label={`Stage ${i + 1}: ${name}${isDone ? ', done' : now ? ', you are here' : ', locked'}`}
            onClick={onStage ? () => onStage(i) : undefined}
            style={onStage ? { cursor: 'pointer' } : undefined}
          >
            <ellipse cx={0} cy={7} rx={now ? 36 : 30} ry={now ? 15 : 12} fill="#1F5FB8" opacity={0.3} />
            <ellipse cx={0} cy={2} rx={now ? 36 : 30} ry={now ? 15 : 12} fill={isDone || now ? '#FFE3A3' : '#E1E5F2'} stroke="#17153A" strokeWidth={2} />
            <ellipse cx={0} cy={-1} rx={now ? 29 : 24} ry={now ? 10 : 8} fill={isDone || now ? 'url(#isl-grass)' : '#C5CAE6'} />
            {now && <ellipse className="dash" cx={0} cy={3} rx={44} ry={20} fill="none" stroke="#FFC93C" strokeWidth={3} strokeDasharray="7 7" strokeLinecap="round" />}
            {/* stage marker: flag when done, trophy when current, lock when ahead */}
            {isDone ? (
              <g>
                <line x1={0} y1={-2} x2={0} y2={-30} stroke="#17153A" strokeWidth={2.5} />
                <path d="M0 -30 h18 l-5 6 l5 6 h-18 z" fill={tint[0]} stroke="#17153A" strokeWidth={2} />
                <path d="M4 -24 l3 3 l6 -6" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            ) : now ? (
              <g transform="translate(0 -14)">
                <path d="M-11 -16 h22 v8 a11 11 0 0 1 -22 0 z" fill="#FFC93C" stroke="#17153A" strokeWidth={2} />
                <path d="M-3 3 h6 v4 h5 v4 h-16 v-4 h5 z" fill="#FFC93C" stroke="#17153A" strokeWidth={2} strokeLinejoin="round" />
              </g>
            ) : (
              <g transform="translate(0 -12)">
                <rect x={-8} y={-6} width={16} height={13} rx={3} fill="#8A88AD" stroke="#17153A" strokeWidth={1.5} />
                <path d="M-5 -6 v-4 a5 5 0 0 1 10 0 v4" fill="none" stroke="#17153A" strokeWidth={2} />
              </g>
            )}
            {/* name label, on the open side of the island */}
            <g transform={`translate(${left ? 44 : -44 - w} -10)`}>
              {(now || isDone) && <rect y={2.5} width={w} height={24} rx={12} fill="#17153A" opacity={0.25} />}
              <rect width={w} height={24} rx={12} fill={now ? '#FFC93C' : isDone ? '#fff' : '#17153A'} opacity={now || isDone ? 1 : 0.5} stroke={now || isDone ? '#17153A' : 'none'} strokeWidth={2} />
              <text x={w / 2} y={16} textAnchor="middle" fontSize={11} fontWeight={700} fill={now || isDone ? '#17153A' : '#fff'} fontFamily="Fredoka Variable, sans-serif">
                {label}
              </text>
            </g>
          </g>
        )
      })}

      {/* the child, walking towards the next stage */}
      {marker && (
        <motion.g initial={false} animate={{ x: ax, y: ay }} transition={{ type: 'spring', stiffness: 120, damping: 16 }}>
          <motion.g animate={{ y: [0, -5, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
            <g transform="translate(-22 -22)">
              <circle cx={22} cy={22} r={23} fill="#fff" stroke="#FFC93C" strokeWidth={3.5} />
              <foreignObject x={3} y={3} width={38} height={38}>
                {marker}
              </foreignObject>
            </g>
          </motion.g>
        </motion.g>
      )}
    </svg>
  )
}
