import { Award, Blocks, Goal, MicVocal, Music, Rocket, type LucideIcon } from 'lucide-react'
import type { ThemeId } from '../data/questions'
import type { Brick, BrickColor } from '../data/themes'

export const THEME_ICON: Record<ThemeId, LucideIcon> = {
  football: Goal,
  wrestling: Award,
  kpop: MicVocal,
  building: Blocks,
  music: Music,
  space: Rocket,
}

const FILL: Record<BrickColor, { face: string; edge: string; shine: string }> = {
  red: { face: '#D9312B', edge: '#9E1F1A', shine: '#EC6A64' },
  yellow: { face: '#F6C21C', edge: '#B98C00', shine: '#FFDD6E' },
  blue: { face: '#1C5FCC', edge: '#0F3D8A', shine: '#5A8FE6' },
  green: { face: '#2E9E4F', edge: '#1B6B33', shine: '#62C27F' },
  white: { face: '#FFFFFF', edge: '#9AB0CC', shine: '#FFFFFF' },
  ink: { face: '#14284B', edge: '#07152D', shine: '#3D5478' },
}

const U = 30
const H = 24
const STUD_W = 14
const STUD_H = 6

function BrickShape({ b, y, ghost, next, drop, delay }: { b: Brick; y: number; ghost?: boolean; next?: boolean; drop?: boolean; delay?: number }) {
  const x = b.x * U
  const w = b.w * U
  const studs = Array.from({ length: Math.max(1, Math.round(b.w)) }, (_, i) => x + i * U + (U - STUD_W) / 2 + (b.w % 1 ? (U * (b.w % 1)) / 2 : 0))
  if (ghost) {
    const stroke = next ? '#1C5FCC' : '#7F93B2'
    return (
      <g opacity={next ? 1 : 0.7}>
        {studs.map((sx, i) => (
          <rect key={i} x={sx} y={y - STUD_H} width={STUD_W} height={STUD_H} rx={2} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="3 3" />
        ))}
        <rect x={x + 1} y={y + 1} width={w - 2} height={H - 2} rx={3} fill={next ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.3)'} stroke={stroke} strokeWidth={next ? 2 : 1.5} strokeDasharray="4 4" />
      </g>
    )
  }
  const f = FILL[b.c]
  return (
    <g className={drop ? 'brick-drop' : undefined} style={drop ? { animationDelay: `${delay ?? 0}ms` } : undefined}>
      {studs.map((sx, i) => (
        <g key={i}>
          <rect x={sx} y={y - STUD_H} width={STUD_W} height={STUD_H + 2} rx={2} fill={f.face} stroke={f.edge} strokeWidth={1.5} />
          <rect x={sx + 3} y={y - STUD_H + 1.5} width={4} height={2} rx={1} fill={f.shine} opacity={0.8} />
        </g>
      ))}
      <rect x={x + 0.75} y={y} width={w - 1.5} height={H} rx={3} fill={f.face} stroke={f.edge} strokeWidth={1.5} />
      <rect x={x + 4} y={y + 3} width={w - 8} height={3} rx={1.5} fill={f.shine} opacity={0.55} />
    </g>
  )
}

export function BrickModel({
  rows,
  built,
  ghostNext = false,
  ghostAll = false,
  dropRow,
  label,
  className,
}: {
  rows: Brick[][]
  built: number
  ghostNext?: boolean
  ghostAll?: boolean
  dropRow?: number
  label: string
  className?: string
}) {
  const plateY = rows.length * H + 22
  const width = 8 * U + 20
  const height = plateY + 22
  return (
    <svg viewBox={`-10 -6 ${width} ${height}`} role="img" aria-label={label} className={className}>
      <rect x={-6} y={plateY} width={8 * U + 12} height={14} rx={3} fill="#5E7699" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={i * U + (U - STUD_W) / 2} y={plateY - 4} width={STUD_W} height={5} rx={1.5} fill="#5E7699" />
      ))}
      {rows.map((row, i) => {
        const y = plateY - (i + 1) * H
        if (i < built) return row.map((b, j) => <BrickShape key={`${i}-${j}`} b={b} y={y} drop={dropRow === i} delay={j * 60} />)
        if ((ghostNext && i === built) || (ghostAll && i >= built))
          return row.map((b, j) => <BrickShape key={`${i}-${j}`} b={b} y={y} ghost next={ghostNext && i === built} />)
        return null
      })}
    </svg>
  )
}

export interface AvatarLook {
  skin: number
  hair: number
  hairColor: number
  top: number
  extra: number
}

export const SKINS = ['#F7D7BC', '#EBB892', '#C98B60', '#91603F', '#5E3B27']
export const HAIR_COLORS = ['#2B1B12', '#6B3E1F', '#C9852F', '#1C5FCC']
export const TOPS = ['#1C5FCC', '#D9312B', '#2E9E4F', '#F6C21C']
export const HAIR_STYLES = ['Short', 'Curly', 'Bun', 'Spiky']
export const EXTRAS = ['None', 'Cap', 'Headphones', 'Glasses']

export function Avatar({ look, className, title }: { look: AvatarLook; className?: string; title?: string }) {
  const skin = SKINS[look.skin]
  const hair = HAIR_COLORS[look.hairColor]
  const top = TOPS[look.top]
  return (
    <svg viewBox="0 0 120 130" className={className} role="img" aria-label={title ?? 'Your avatar'}>
      <path d="M22 130 V104 Q22 86 40 84 H80 Q98 86 98 104 V130 Z" fill={top} />
      <path d="M48 84 L60 98 L72 84" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={53} y={70} width={14} height={16} rx={4} fill={skin} />
      {look.hair === 2 && <circle cx={60} cy={14} r={13} fill={hair} />}
      <ellipse cx={60} cy={48} rx={29} ry={30} fill={skin} />
      {look.hair === 0 && <path d="M31 46 Q30 18 60 17 Q90 18 89 46 Q82 30 60 30 Q40 30 31 46 Z" fill={hair} />}
      {look.hair === 1 && (
        <g fill={hair}>
          {[34, 44, 54, 64, 74, 84].map((cx, i) => (
            <circle key={cx} cx={cx} cy={i % 2 ? 24 : 30} r={10} />
          ))}
          <circle cx={30} cy={42} r={8} />
          <circle cx={90} cy={42} r={8} />
        </g>
      )}
      {look.hair === 2 && <path d="M31 46 Q32 20 60 20 Q88 20 89 46 Q80 32 60 31 Q40 32 31 46 Z" fill={hair} />}
      {look.hair === 3 && <path d="M30 44 L34 22 L42 30 L48 12 L56 26 L62 8 L68 26 L76 12 L80 30 L88 22 L90 44 Q80 32 60 31 Q40 32 30 44 Z" fill={hair} />}
      <ellipse cx={48} cy={50} rx={3.6} ry={4.4} fill="#14284B" />
      <ellipse cx={72} cy={50} rx={3.6} ry={4.4} fill="#14284B" />
      <circle cx={49.2} cy={48.6} r={1.2} fill="#fff" />
      <circle cx={73.2} cy={48.6} r={1.2} fill="#fff" />
      <path d="M50 62 Q60 70 70 62" fill="none" stroke="#14284B" strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={42} cy={60} rx={5} ry={3} fill="#E5735F" opacity={0.25} />
      <ellipse cx={78} cy={60} rx={5} ry={3} fill="#E5735F" opacity={0.25} />
      {look.extra === 1 && (
        <g>
          <path d="M30 36 Q32 14 60 14 Q88 14 90 36 Z" fill="#D9312B" />
          <path d="M60 34 H100 Q102 40 96 40 H60 Z" fill="#B3221D" />
        </g>
      )}
      {look.extra === 2 && (
        <g>
          <path d="M28 52 Q28 12 60 12 Q92 12 92 52" fill="none" stroke="#14284B" strokeWidth={5} strokeLinecap="round" />
          <rect x={22} y={44} width={12} height={20} rx={5} fill="#14284B" />
          <rect x={86} y={44} width={12} height={20} rx={5} fill="#14284B" />
        </g>
      )}
      {look.extra === 3 && (
        <g fill="none" stroke="#14284B" strokeWidth={3}>
          <circle cx={48} cy={50} r={9} />
          <circle cx={72} cy={50} r={9} />
          <path d="M57 50 H63" />
        </g>
      )}
    </svg>
  )
}

/** Pip, the Study Buddy: built from bricks, like everything else here. */
export function Buddy({ className, mood = 'happy' }: { className?: string; mood?: 'happy' | 'thinking' | 'cheer' }) {
  return (
    <svg viewBox="0 0 80 96" className={className} aria-hidden="true">
      <line x1={40} y1={4} x2={40} y2={16} stroke="#14284B" strokeWidth={3} strokeLinecap="round" />
      <circle cx={40} cy={5} r={4} fill={mood === 'cheer' ? '#2E9E4F' : '#D9312B'} />
      <rect x={30} y={13} width={8} height={5} rx={1.5} fill="#1C5FCC" stroke="#0F3D8A" strokeWidth={1.2} />
      <rect x={42} y={13} width={8} height={5} rx={1.5} fill="#1C5FCC" stroke="#0F3D8A" strokeWidth={1.2} />
      <rect x={14} y={17} width={52} height={36} rx={6} fill="#1C5FCC" stroke="#0F3D8A" strokeWidth={2} />
      <rect x={20} y={23} width={40} height={22} rx={5} fill="#E6F1FB" />
      {mood === 'thinking' ? (
        <>
          <rect x={27} y={32} width={8} height={3} rx={1.5} fill="#14284B" />
          <circle cx={50} cy={33} r={4} fill="#14284B" />
        </>
      ) : (
        <>
          <circle cx={31} cy={32} r={4} fill="#14284B" />
          <circle cx={49} cy={32} r={4} fill="#14284B" />
          <path d="M33 39 Q40 44 47 39" fill="none" stroke="#14284B" strokeWidth={2.5} strokeLinecap="round" />
        </>
      )}
      <rect x={18} y={56} width={44} height={30} rx={5} fill="#F6C21C" stroke="#B98C00" strokeWidth={2} />
      <rect x={25} y={64} width={30} height={6} rx={3} fill="#FFDD6E" />
      {mood === 'cheer' ? (
        <>
          <rect x={2} y={40} width={12} height={22} rx={5} fill="#F6C21C" stroke="#B98C00" strokeWidth={2} transform="rotate(-25 8 51)" />
          <rect x={66} y={40} width={12} height={22} rx={5} fill="#F6C21C" stroke="#B98C00" strokeWidth={2} transform="rotate(25 72 51)" />
        </>
      ) : (
        <>
          <rect x={6} y={58} width={12} height={22} rx={5} fill="#F6C21C" stroke="#B98C00" strokeWidth={2} />
          <rect x={62} y={58} width={12} height={22} rx={5} fill="#F6C21C" stroke="#B98C00" strokeWidth={2} />
        </>
      )}
      <rect x={24} y={86} width={12} height={8} rx={2} fill="#14284B" />
      <rect x={44} y={86} width={12} height={8} rx={2} fill="#14284B" />
    </svg>
  )
}
