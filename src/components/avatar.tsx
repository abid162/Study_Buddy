import { useId } from 'react'

/** The child's own avatar: either built from preset parts or drawn from a photo by the n8n workflow. */

export interface AvatarLook {
  skin: number
  hair: number
  hairColor: number
  top: number
  extra: number
}

export type ChildAvatarData = { kind: 'built'; look: AvatarLook } | { kind: 'photo'; src: string }

export const SKIN = ['#F9DCC4', '#F1C3A0', '#E0A47A', '#C68255', '#9A5B36', '#6B3E22']
export const SKIN_NAMES = ['Light', 'Light medium', 'Medium', 'Medium tan', 'Brown', 'Dark brown']
export const HAIR_COLOR = ['#2B1B12', '#4A2C17', '#7A4A23', '#A0461E', '#E1B85A', '#3E5BD8', '#E35D9B']
export const HAIR_COLOR_NAMES = ['Black', 'Dark brown', 'Brown', 'Auburn', 'Blonde', 'Blue', 'Pink']
export const HAIR = ['Short', 'Curly', 'Long', 'Bun', 'Afro', 'Spiky']
export const TOP = ['#7C5CFF', '#3E8EF0', '#22C58B', '#FF6B57', '#FFC93C', '#1E1B4F']
export const TOP_NAMES = ['Purple', 'Blue', 'Green', 'Coral', 'Yellow', 'Navy']
export const EXTRA = ['None', 'Glasses', 'Cap', 'Headphones', 'Headscarf']

export const DEFAULT_LOOK: AvatarLook = { skin: 1, hair: 1, hairColor: 1, top: 0, extra: 0 }

export function AvatarFigure({ look, className, title }: { look: AvatarLook; className?: string; title?: string }) {
  const skin = SKIN[look.skin] ?? SKIN[0]
  const hair = HAIR_COLOR[look.hairColor] ?? HAIR_COLOR[0]
  const top = TOP[look.top] ?? TOP[0]
  const scarf = look.extra === 4
  const style = HAIR[look.hair] ?? HAIR[0]
  const clip = `av-${useId().replace(/:/g, '')}`
  return (
    <svg viewBox="0 0 160 160" className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <circle cx={80} cy={80} r={80} fill="#ECE6FF" />
      <clipPath id={clip}>
        <circle cx={80} cy={80} r={80} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        {/* back hair */}
        {!scarf && style === 'Long' && <path d="M38 70 Q36 30 80 26 Q124 30 122 70 L126 138 L34 138 Z" fill={hair} />}
        {!scarf && style === 'Afro' && <circle cx={80} cy={62} r={52} fill={hair} />}
        {scarf && <path d="M30 150 Q28 40 80 24 Q132 40 130 150 Z" fill={top} opacity={0.92} />}
        {/* body */}
        <path d="M22 164 Q24 122 56 116 H104 Q136 122 138 164 Z" fill={top} />
        <path d="M66 116 Q80 132 94 116" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={4} strokeLinecap="round" />
        <rect x={70} y={98} width={20} height={20} rx={8} fill={skin} />
        {/* ears + head */}
        {!scarf && <ellipse cx={41} cy={74} rx={7} ry={9} fill={skin} />}
        {!scarf && <ellipse cx={119} cy={74} rx={7} ry={9} fill={skin} />}
        <ellipse cx={80} cy={70} rx={39} ry={42} fill={skin} />
        {/* front hair */}
        {!scarf && style === 'Short' && <path d="M41 66 Q38 28 80 26 Q122 28 119 66 Q108 44 80 44 Q52 44 41 66 Z" fill={hair} />}
        {!scarf && style === 'Curly' && (
          <g fill={hair}>
            {[46, 58, 70, 82, 94, 106, 116].map((x, i) => (
              <circle key={x} cx={x} cy={i % 2 ? 34 : 42} r={12} />
            ))}
            <circle cx={40} cy={58} r={9} />
            <circle cx={120} cy={58} r={9} />
          </g>
        )}
        {!scarf && style === 'Long' && <path d="M41 70 Q40 30 80 28 Q120 30 119 70 Q112 46 92 42 Q74 52 48 50 Q42 58 41 70 Z" fill={hair} />}
        {!scarf && style === 'Bun' && (
          <g fill={hair}>
            <circle cx={80} cy={22} r={15} />
            <path d="M41 64 Q40 30 80 30 Q120 30 119 64 Q108 46 80 46 Q52 46 41 64 Z" />
          </g>
        )}
        {!scarf && style === 'Afro' && <path d="M44 56 Q60 40 80 42 Q100 40 116 56 Q110 34 80 32 Q50 34 44 56 Z" fill={hair} />}
        {!scarf && style === 'Spiky' && <path d="M40 64 L44 34 L54 44 L60 22 L70 38 L80 18 L90 38 L100 22 L106 44 L116 34 L120 64 Q108 46 80 46 Q52 46 40 64 Z" fill={hair} />}
        {scarf && <path d="M42 74 Q42 36 80 34 Q118 36 118 74 Q116 50 80 48 Q44 50 42 74 Z" fill={top} />}
        {scarf && <path d="M41 70 Q40 112 80 116 Q120 112 119 70" fill="none" stroke={top} strokeWidth={8} />}
        {/* face */}
        <ellipse cx={65} cy={74} rx={5.5} ry={7} fill="#17153A" />
        <ellipse cx={95} cy={74} rx={5.5} ry={7} fill="#17153A" />
        <circle cx={67} cy={71} r={2} fill="#fff" />
        <circle cx={97} cy={71} r={2} fill="#fff" />
        <ellipse cx={56} cy={88} rx={7} ry={4} fill="#FF7A8A" opacity={0.35} />
        <ellipse cx={104} cy={88} rx={7} ry={4} fill="#FF7A8A" opacity={0.35} />
        <path d="M68 92 Q80 102 92 92" fill="none" stroke="#17153A" strokeWidth={4} strokeLinecap="round" />
        {/* extras */}
        {look.extra === 1 && (
          <g fill="none" stroke="#17153A" strokeWidth={3.5}>
            <circle cx={65} cy={74} r={12} />
            <circle cx={95} cy={74} r={12} />
            <path d="M77 74 H83 M53 72 L42 68 M107 72 L118 68" />
          </g>
        )}
        {look.extra === 2 && (
          <g>
            <path d="M40 54 Q42 22 80 22 Q118 22 120 54 Z" fill={TOP[(look.top + 3) % TOP.length]} />
            <path d="M80 50 H134 Q138 58 128 58 H80 Z" fill={TOP[(look.top + 3) % TOP.length]} />
            <path d="M40 54 H120" stroke="rgba(0,0,0,0.18)" strokeWidth={3} />
          </g>
        )}
        {look.extra === 3 && (
          <g>
            <path d="M38 76 Q36 18 80 18 Q124 18 122 76" fill="none" stroke="#17153A" strokeWidth={7} strokeLinecap="round" />
            <rect x={28} y={64} width={16} height={26} rx={7} fill="#17153A" />
            <rect x={116} y={64} width={16} height={26} rx={7} fill="#17153A" />
          </g>
        )}
      </g>
    </svg>
  )
}

export function ChildAvatar({ data, className, title }: { data?: ChildAvatarData | null; className?: string; title?: string }) {
  if (data?.kind === 'photo')
    return <img src={data.src} alt={title ?? ''} className={`rounded-full object-cover ${className ?? ''}`} draggable={false} />
  return <AvatarFigure look={data?.kind === 'built' ? data.look : DEFAULT_LOOK} className={className} title={title} />
}
