import { useRef } from 'react'
import type { Diagram as D, GalleryItem, Pt } from '../data/bank/diagram'

const INK = '#17153A'
const SOFT = '#5B5880'
const LINE = '#DCE0F5'
const A = '#7C5CFF'
const A_SOFT = '#E9E3FF'
const B = '#22C58B'
const B_SOFT = '#D8F6EA'
const SUN = '#FFC93C'
const FONT = 'Atkinson Hyperlegible Next Variable, system-ui, sans-serif'
const PALETTE = ['#7C5CFF', '#22C58B', '#FFB020', '#F0638F', '#3E8EF0', '#14B8A6', '#A855F7', '#F97316']

const T = (p: { x: number; y: number; children: React.ReactNode; size?: number; anchor?: 'start' | 'middle' | 'end'; weight?: number; fill?: string }) => (
  <text x={p.x} y={p.y} fontSize={p.size ?? 13} textAnchor={p.anchor ?? 'middle'} fontWeight={p.weight ?? 600} fill={p.fill ?? INK} fontFamily={FONT}>
    {p.children}
  </text>
)

/** A maths picture. With `onPick`, a grid diagram becomes tappable and reports the nearest grid point. */
export function Diagram({ d, picked, onPick }: { d: D; picked?: Pt | null; onPick?: (p: Pt) => void }) {
  const body = (() => {
    switch (d.type) {
      case 'clock':
        return <Clock h={d.h} m={d.m} />
      case 'grid':
        return <Grid d={d} picked={picked} onPick={d.pick ? onPick : undefined} />
      case 'gallery':
        return <Gallery items={d.items} />
      case 'angle':
        return <Angle deg={d.deg} protractor={d.protractor} turn={d.turn ?? 0} />
      case 'bar':
        return <Bars d={d} />
      case 'picto':
        return <Picto d={d} />
      case 'table':
        return <Table d={d} />
      case 'line':
        return <LineGraph d={d} />
      case 'pie':
        return <Pie d={d} />
      case 'parts':
        return <Parts of={d.of} shaded={d.shaded} />
      case 'numberline':
        return <NumberLine d={d} />
      case 'jug':
        return <Jug d={d} />
      case 'cubes':
        return <Cubes l={d.l} w={d.w} h={d.h} />
      case 'rects':
        return <Rects d={d} />
    }
  })()
  return <div className="mt-4 rounded-3xl bg-[#F8F9FF] p-3 ring-1 ring-inset ring-[#E4E7F7]">{body}</div>
}

/* ---------------- clock ---------------- */
function Clock({ h, m }: { h: number; m: number }) {
  const hand = (deg: number, len: number) => {
    const r = ((deg - 90) * Math.PI) / 180
    return [100 + Math.cos(r) * len, 100 + Math.sin(r) * len]
  }
  const [mx, my] = hand(m * 6, 70)
  const [hx, hy] = hand(((h % 12) + m / 60) * 30, 46)
  return (
    <svg viewBox="0 0 200 200" className="mx-auto block w-full max-w-[240px]" role="img" aria-label="An analogue clock">
      <circle cx={100} cy={100} r={92} fill="#fff" stroke={INK} strokeWidth={5} />
      {Array.from({ length: 60 }, (_, i) => {
        const r = (i * 6 * Math.PI) / 180
        const big = i % 5 === 0
        return <line key={i} x1={100 + Math.sin(r) * (big ? 76 : 82)} y1={100 - Math.cos(r) * (big ? 76 : 82)} x2={100 + Math.sin(r) * 86} y2={100 - Math.cos(r) * 86} stroke={big ? INK : '#9A98B8'} strokeWidth={big ? 3 : 1.2} />
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const r = ((i + 1) * 30 * Math.PI) / 180
        return (
          <T key={i} x={100 + Math.sin(r) * 62} y={100 - Math.cos(r) * 62 + 6} size={17} weight={700}>
            {i + 1}
          </T>
        )
      })}
      <line x1={100} y1={100} x2={hx} y2={hy} stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <line x1={100} y1={100} x2={mx} y2={my} stroke={A} strokeWidth={5} strokeLinecap="round" />
      <circle cx={100} cy={100} r={7} fill={SUN} stroke={INK} strokeWidth={2.5} />
    </svg>
  )
}

/* ---------------- grid ---------------- */
function Grid({ d, picked, onPick }: { d: Extract<D, { type: 'grid' }>; picked?: Pt | null; onPick?: (p: Pt) => void }) {
  const svg = useRef<SVGSVGElement>(null)
  const [x0, x1] = d.x
  const [y0, y1] = d.y
  const S = 34
  const pad = d.axes ? 30 : 14
  const W = (x1 - x0) * S + pad * 2
  const H = (y1 - y0) * S + pad * 2
  const X = (x: number) => pad + (x - x0) * S
  const Y = (y: number) => pad + (y1 - y) * S
  const tap = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!onPick || !svg.current) return
    const ctm = svg.current.getScreenCTM()
    if (!ctm) return
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
    const gx = Math.round((p.x - pad) / S + x0)
    const gy = Math.round(y1 - (p.y - pad) / S)
    if (gx < x0 || gx > x1 || gy < y0 || gy > y1) return
    onPick([gx, gy])
  }
  const lines = []
  for (let x = x0; x <= x1; x++) lines.push(<line key={`v${x}`} x1={X(x)} y1={Y(y0)} x2={X(x)} y2={Y(y1)} stroke={d.axes && x === 0 ? INK : LINE} strokeWidth={d.axes && x === 0 ? 2.5 : 1.2} />)
  for (let y = y0; y <= y1; y++) lines.push(<line key={`h${y}`} x1={X(x0)} y1={Y(y)} x2={X(x1)} y2={Y(y)} stroke={d.axes && y === 0 ? INK : LINE} strokeWidth={d.axes && y === 0 ? 2.5 : 1.2} />)
  const centre = (pts: Pt[]) => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length] as Pt
  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${W} ${H}`}
      className={`mx-auto block w-full ${W > H ? 'max-w-[520px]' : 'max-w-[400px]'} touch-manipulation ${onPick ? 'cursor-crosshair' : ''}`}
      role={onPick ? 'application' : 'img'}
      aria-label={onPick ? 'Grid. Tap a point to choose it, or type the coordinates in the answer box.' : 'A grid'}
      onPointerUp={tap}
    >
      <rect x={X(x0)} y={Y(y1)} width={(x1 - x0) * S} height={(y1 - y0) * S} fill={d.plain ? 'none' : '#fff'} />
      {(d.cells ?? []).map(([cx, cy], i) => (
        <rect key={i} x={X(cx)} y={Y(cy + 1)} width={S} height={S} fill={A_SOFT} stroke={A} strokeWidth={1.5} />
      ))}
      {!d.plain && lines}
      {d.axes && (
        <>
          {Array.from({ length: x1 - x0 + 1 }, (_, i) => x0 + i).map((x) => (
            <T key={`tx${x}`} x={X(x) + (x === 0 && y0 < 0 ? -8 : 0)} y={Y(Math.max(y0, Math.min(0, y1))) + 17} size={11} fill={SOFT}>
              {x}
            </T>
          ))}
          {Array.from({ length: y1 - y0 + 1 }, (_, i) => y0 + i)
            .filter((y) => y !== 0 || y0 >= 0)
            .filter((y) => !(y === 0 && x0 < 0))
            .map((y) => (
              <T key={`ty${y}`} x={X(Math.max(x0, Math.min(0, x1))) - 9} y={Y(y) + 4} size={11} anchor="end" fill={SOFT}>
                {y}
              </T>
            ))}
          <T x={X(x1) + 14} y={Y(Math.max(y0, Math.min(0, y1))) + 4} size={13} weight={700}>
            x
          </T>
          <T x={X(Math.max(x0, Math.min(0, x1)))} y={Y(y1) - 10} size={13} weight={700}>
            y
          </T>
        </>
      )}
      {d.mirror && (
        <line
          x1={d.mirror.x !== undefined ? X(d.mirror.x) : X(x0)}
          y1={d.mirror.y !== undefined ? Y(d.mirror.y) : Y(y0)}
          x2={d.mirror.x !== undefined ? X(d.mirror.x) : X(x1)}
          y2={d.mirror.y !== undefined ? Y(d.mirror.y) : Y(y1)}
          stroke="#F0638F"
          strokeWidth={3.5}
          strokeDasharray="10 6"
        />
      )}
      {(d.shapes ?? []).map((s, i) => {
        const ghost = s.tone === 'ghost'
        const col = s.tone === 'b' ? B : A
        const [cx, cy] = centre(s.pts)
        return (
          <g key={i}>
            <polygon points={s.pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')} fill={ghost ? 'none' : s.tone === 'b' ? B_SOFT : A_SOFT} stroke={ghost ? SOFT : col} strokeWidth={ghost ? 2 : 3} strokeDasharray={ghost ? '6 5' : undefined} strokeLinejoin="round" fillOpacity={0.85} />
            {s.sides?.map((lab, k) => {
              if (!lab) return null
              const p = s.pts[k]!
              const q = s.pts[(k + 1) % s.pts.length]!
              const mx = (X(p[0]) + X(q[0])) / 2
              const my = (Y(p[1]) + Y(q[1])) / 2
              // push the label away from the shape's centre
              const dx = mx - X(cx)
              const dy = my - Y(cy)
              const len = Math.hypot(dx, dy) || 1
              return (
                <g key={k}>
                  <rect x={mx + (dx / len) * 16 - 22} y={my + (dy / len) * 14 - 10} width={44} height={20} rx={6} fill="#fff" opacity={0.92} />
                  <T x={mx + (dx / len) * 16} y={my + (dy / len) * 14 + 5} size={13} weight={700}>
                    {lab}
                  </T>
                </g>
              )
            })}
            {s.label && (
              <T x={X(cx)} y={Y(cy) + 5} size={15} weight={700} fill={ghost ? SOFT : col}>
                {s.label}
              </T>
            )}
          </g>
        )
      })}
      {d.arrow && (
        <g>
          <defs>
            <marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0 0 L8 4 L0 8 z" fill="#F0638F" />
            </marker>
          </defs>
          <line x1={X(d.arrow[0][0])} y1={Y(d.arrow[0][1])} x2={X(d.arrow[1][0])} y2={Y(d.arrow[1][1])} stroke="#F0638F" strokeWidth={3} markerEnd="url(#ah)" />
        </g>
      )}
      {(d.points ?? []).map((p, i) => (
        <g key={i}>
          <circle cx={X(p.x)} cy={Y(p.y)} r={6.5} fill={p.tone === 'b' ? B : A} stroke="#fff" strokeWidth={2} />
          {p.label && (
            <g>
              <rect x={X(p.x) + 7} y={Y(p.y) - 25} width={p.label.length * 8 + 10} height={19} rx={6} fill="#fff" opacity={0.9} />
              <T x={X(p.x) + 12} y={Y(p.y) - 11} size={14} weight={700} anchor="start">
                {p.label}
              </T>
            </g>
          )}
        </g>
      ))}
      {onPick && picked && (
        <g pointerEvents="none">
          <circle cx={X(picked[0])} cy={Y(picked[1])} r={13} fill={SUN} fillOpacity={0.35} stroke={SUN} strokeWidth={3} />
          <circle cx={X(picked[0])} cy={Y(picked[1])} r={5} fill={INK} />
        </g>
      )}
    </svg>
  )
}

/* ---------------- gallery (shapes, solids, nets) ---------------- */
function Gallery({ items }: { items: GalleryItem[] }) {
  const n = items.length
  return (
    <div className={`grid gap-2 ${n === 1 ? 'mx-auto max-w-[220px] grid-cols-1' : n === 2 ? 'grid-cols-2' : n === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
      {items.map((it, i) => (
        <figure key={i} className="rounded-2xl bg-white p-2 ring-1 ring-inset ring-[#E4E7F7]">
          <svg viewBox="-8 -8 116 116" className="block w-full" role="img" aria-label={`Shape ${it.label}`}>
            {it.polys.map((p, k) => (
              <polygon key={k} points={p.map(([x, y]) => `${x},${100 - y}`).join(' ')} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.2} stroke={PALETTE[i % PALETTE.length]} strokeWidth={3} strokeLinejoin="round" />
            ))}
            {(it.lines ?? []).map((p, k) => (
              <polyline key={`l${k}`} points={p.map(([x, y]) => `${x},${100 - y}`).join(' ')} fill="none" stroke={PALETTE[i % PALETTE.length]} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {(it.dashed ?? []).map((p, k) => (
              <polyline key={k} points={p.map(([x, y]) => `${x},${100 - y}`).join(' ')} fill="none" stroke={SOFT} strokeWidth={2} strokeDasharray="5 5" />
            ))}
          </svg>
          {it.label && <figcaption className="text-center font-display text-lg font-semibold">{it.label}</figcaption>}
        </figure>
      ))}
    </div>
  )
}

/* ---------------- angle ---------------- */
function Angle({ deg, protractor, turn }: { deg: number; protractor?: boolean; turn: number }) {
  const cx = 130
  const cy = protractor ? 150 : 110
  const R = protractor ? 110 : 90
  const ray = (a: number, len: number) => {
    const r = ((a + turn) * Math.PI) / 180
    return [cx + Math.cos(r) * len, cy - Math.sin(r) * len]
  }
  const [ax, ay] = ray(0, R)
  const [bx, by] = ray(deg, R)
  const arcR = deg > 180 ? 26 : 34
  const [sx, sy] = ray(0, arcR)
  const [ex, ey] = ray(deg, arcR)
  return (
    <svg viewBox={`0 0 260 ${protractor ? 175 : 220}`} className="mx-auto block w-full max-w-[360px]" role="img" aria-label="An angle">
      {protractor && (
        <g>
          <path d={`M${cx - 120} ${cy} A120 120 0 0 1 ${cx + 120} ${cy} Z`} fill="#EAF4FF" fillOpacity={0.85} stroke="#3E8EF0" strokeWidth={2} />
          {Array.from({ length: 181 }, (_, i) => i)
            .filter((i) => i % 5 === 0)
            .map((i) => {
              const r = (i * Math.PI) / 180
              const big = i % 10 === 0
              return <line key={i} x1={cx + Math.cos(r) * (big ? 104 : 110)} y1={cy - Math.sin(r) * (big ? 104 : 110)} x2={cx + Math.cos(r) * 120} y2={cy - Math.sin(r) * 120} stroke="#3E8EF0" strokeWidth={big ? 1.8 : 1} />
            })}
          {Array.from({ length: 19 }, (_, i) => i * 10).map((a) => {
            const r = (a * Math.PI) / 180
            return (
              <T key={a} x={cx + Math.cos(r) * 92} y={cy - Math.sin(r) * 92 + 4} size={9} fill="#2563C9">
                {a}
              </T>
            )
          })}
        </g>
      )}
      <path d={`M${sx} ${sy} A${arcR} ${arcR} 0 ${deg > 180 ? 1 : 0} 0 ${ex} ${ey}`} fill="none" stroke={SUN} strokeWidth={5} />
      {deg === 90 && !protractor && <path d={`M${ray(0, 18)[0]} ${ray(0, 18)[1]} L${ray(45, 25.5)[0]} ${ray(45, 25.5)[1]} L${ray(90, 18)[0]} ${ray(90, 18)[1]}`} fill="none" stroke={INK} strokeWidth={2} />}
      <line x1={cx} y1={cy} x2={ax} y2={ay} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={bx} y2={by} stroke={A} strokeWidth={4} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={5} fill={INK} />
    </svg>
  )
}

/* ---------------- charts ---------------- */
function Axes({ W, H, L, B, max, step, min = 0, unit }: { W: number; H: number; L: number; B: number; max: number; step: number; min?: number; unit?: string }) {
  const Y = (v: number) => B - ((v - min) / (max - min)) * (B - 16)
  const ticks = []
  for (let v = min; v <= max + 1e-9; v += step) ticks.push(v)
  return (
    <g>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={L} y1={Y(v)} x2={W - 8} y2={Y(v)} stroke={LINE} strokeWidth={1.2} />
          <T x={L - 6} y={Y(v) + 4} size={11} anchor="end" fill={SOFT}>
            {Number(v.toFixed(2))}
          </T>
        </g>
      ))}
      <line x1={L} y1={B} x2={W - 8} y2={B} stroke={INK} strokeWidth={2} />
      <line x1={L} y1={B} x2={L} y2={8} stroke={INK} strokeWidth={2} />
      {unit && (
        <T x={L} y={H - 2} size={10} anchor="start" fill={SOFT}>
          {unit}
        </T>
      )}
    </g>
  )
}

function Bars({ d }: { d: Extract<D, { type: 'bar' }> }) {
  const W = 360
  const H = 230
  const L = 40
  const B = 190
  const n = d.labels.length
  const slot = (W - L - 16) / n
  const Y = (v: number) => B - (v / d.max) * (B - 16)
  return (
    <figure>
      {d.title && <figcaption className="mb-1 text-center font-display text-base font-semibold">{d.title}</figcaption>}
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full max-w-[520px]" role="img" aria-label="Bar chart">
        <Axes W={W} H={H} L={L} B={B} max={d.max} step={d.step} />
        {d.values.map((v, i) => (
          <g key={i}>
            <rect x={L + i * slot + slot * 0.18} y={Y(v)} width={slot * 0.64} height={B - Y(v)} rx={4} fill={PALETTE[i % PALETTE.length]} />
            <T x={L + i * slot + slot / 2} y={B + 17} size={11}>
              {d.labels[i]}
            </T>
          </g>
        ))}
        {d.unit && (
          <T x={10} y={14} size={10} anchor="start" fill={SOFT}>
            {d.unit}
          </T>
        )}
      </svg>
    </figure>
  )
}

function LineGraph({ d }: { d: Extract<D, { type: 'line' }> }) {
  const W = 380
  const H = 240
  const L = 44
  const B = 196
  const min = d.min ?? 0
  const n = d.xs.length
  const X = (i: number) => L + 14 + (i * (W - L - 40)) / (n - 1)
  const Y = (v: number) => B - ((v - min) / (d.max - min)) * (B - 16)
  return (
    <figure>
      {d.title && <figcaption className="mb-1 text-center font-display text-base font-semibold">{d.title}</figcaption>}
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full max-w-[540px]" role="img" aria-label="Line graph">
        <Axes W={W} H={H} L={L} B={B} max={d.max} step={d.step} min={min} />
        {d.xs.map((x, i) => (
          <g key={i}>
            <line x1={X(i)} y1={B} x2={X(i)} y2={B + 5} stroke={INK} strokeWidth={1.5} />
            <T x={X(i)} y={B + 18} size={10.5}>
              {x}
            </T>
          </g>
        ))}
        <polyline points={d.ys.map((v, i) => `${X(i)},${Y(v)}`).join(' ')} fill="none" stroke={A} strokeWidth={3.5} strokeLinejoin="round" />
        {d.ys.map((v, i) => (
          <circle key={i} cx={X(i)} cy={Y(v)} r={5} fill="#fff" stroke={A} strokeWidth={3} />
        ))}
        {d.unit && (
          <T x={8} y={12} size={10} anchor="start" fill={SOFT}>
            {d.unit}
          </T>
        )}
        {d.xTitle && (
          <T x={W - 8} y={H - 4} size={10} anchor="end" fill={SOFT}>
            {d.xTitle}
          </T>
        )}
      </svg>
    </figure>
  )
}

function Picto({ d }: { d: Extract<D, { type: 'picto' }> }) {
  return (
    <figure className="mx-auto max-w-[520px]">
      {d.title && <figcaption className="mb-2 text-center font-display text-base font-semibold">{d.title}</figcaption>}
      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-inset ring-[#E4E7F7]">
        {d.labels.map((l, i) => {
          const icons = d.values[i]! / d.per
          const whole = Math.floor(icons)
          const half = icons - whole >= 0.5
          return (
            <div key={l} className="flex items-center gap-3 border-b border-[#EEF0FA] px-3 py-2 last:border-0">
              <span className="w-24 shrink-0 text-sm font-bold">{l}</span>
              <span className="flex flex-wrap gap-1 text-2xl leading-none" aria-label={`${icons} icons`}>
                {Array.from({ length: whole }, (_, k) => (
                  <span key={k}>{d.icon}</span>
                ))}
                {half && <span className="inline-block w-[0.5em] overflow-hidden">{d.icon}</span>}
              </span>
            </div>
          )
        })}
      </div>
      <p className="mt-2 text-center text-sm font-bold text-ink-soft">
        Key: {d.icon} = {d.per}
      </p>
    </figure>
  )
}

function Table({ d }: { d: Extract<D, { type: 'table' }> }) {
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto min-w-[260px] overflow-hidden rounded-2xl bg-white text-center text-[0.95rem] ring-1 ring-[#E4E7F7]">
        <thead>
          <tr className="bg-grape text-white">
            {d.head.map((h) => (
              <th key={h} className="px-3 py-2 font-display font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {d.rows.map((r, i) => (
            <tr key={i} className="border-t border-[#EEF0FA]">
              {r.map((c, k) => (
                <td key={k} className={`px-3 py-2 ${k === 0 ? 'text-left font-bold' : 'tabular'}`}>
                  {typeof c === 'number' ? c.toLocaleString('en-GB') : c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Pie({ d }: { d: Extract<D, { type: 'pie' }> }) {
  const total = d.slices.reduce((s, x) => s + x.value, 0)
  let a = -90
  const R = 80
  return (
    <figure>
      {d.title && <figcaption className="mb-1 text-center font-display text-base font-semibold">{d.title}</figcaption>}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <svg viewBox="0 0 200 200" className="block w-full max-w-[220px]" role="img" aria-label="Pie chart">
          {d.slices.map((s, i) => {
            const sweep = (s.value / total) * 360
            const r1 = (a * Math.PI) / 180
            const r2 = ((a + sweep) * Math.PI) / 180
            const path = sweep >= 359.99 ? `M100 20 A80 80 0 1 1 99.99 20 Z` : `M100 100 L${100 + Math.cos(r1) * R} ${100 + Math.sin(r1) * R} A${R} ${R} 0 ${sweep > 180 ? 1 : 0} 1 ${100 + Math.cos(r2) * R} ${100 + Math.sin(r2) * R} Z`
            a += sweep
            return <path key={i} d={path} fill={PALETTE[i % PALETTE.length]} stroke="#fff" strokeWidth={2.5} />
          })}
        </svg>
        <ul className="grid gap-1.5 text-sm font-bold">
          {d.slices.map((s, i) => (
            <li key={s.label} className="flex items-center gap-2">
              <span className="h-4 w-4 rounded" style={{ background: PALETTE[i % PALETTE.length] }} aria-hidden />
              {s.label}
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}

/* ---------------- fractions, number line, measures ---------------- */
function Parts({ of, shaded }: { of: 10 | 100; shaded: number }) {
  if (of === 10)
    return (
      <svg viewBox="0 0 330 60" className="mx-auto block w-full max-w-[440px]" role="img" aria-label={`A strip split into 10 equal parts`}>
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={5 + i * 32} y={8} width={32} height={44} fill={i < shaded ? A : '#fff'} fillOpacity={i < shaded ? 0.75 : 1} stroke={INK} strokeWidth={2} />
        ))}
      </svg>
    )
  return (
    <svg viewBox="0 0 210 210" className="mx-auto block w-full max-w-[240px]" role="img" aria-label="A 10 by 10 grid of hundredths">
      {Array.from({ length: 100 }, (_, i) => {
        const col = Math.floor(i / 10)
        const row = i % 10
        return <rect key={i} x={5 + col * 20} y={5 + row * 20} width={20} height={20} fill={i < shaded ? B : '#fff'} fillOpacity={i < shaded ? 0.8 : 1} stroke="#9A98B8" strokeWidth={1} />
      })}
      <rect x={5} y={5} width={200} height={200} fill="none" stroke={INK} strokeWidth={2.5} />
    </svg>
  )
}

function NumberLine({ d }: { d: Extract<D, { type: 'numberline' }> }) {
  const W = 380
  const L = 24
  const R = W - 24
  const X = (v: number) => L + ((v - d.from) / (d.to - d.from)) * (R - L)
  const every = d.labelEvery ?? d.ticks
  return (
    <svg viewBox={`0 0 ${W} 100`} className="mx-auto block w-full max-w-[560px]" role="img" aria-label="A number line with an arrow">
      <line x1={L} y1={60} x2={R} y2={60} stroke={INK} strokeWidth={3} />
      {Array.from({ length: d.ticks + 1 }, (_, i) => {
        const v = d.from + ((d.to - d.from) * i) / d.ticks
        const lab = i % every === 0
        return (
          <g key={i}>
            <line x1={X(v)} y1={lab ? 48 : 52} x2={X(v)} y2={lab ? 72 : 68} stroke={INK} strokeWidth={lab ? 3 : 2} />
            {lab && (
              <T x={X(v)} y={90} size={13} weight={700}>
                {v.toLocaleString('en-GB')}
              </T>
            )}
          </g>
        )
      })}
      <path d={`M${X(d.at)} 44 l-9 -16 h18 z`} fill="#F0638F" />
      <line x1={X(d.at)} y1={30} x2={X(d.at)} y2={12} stroke="#F0638F" strokeWidth={4} />
    </svg>
  )
}

function Jug({ d }: { d: Extract<D, { type: 'jug' }> }) {
  const top = 20
  const bot = 210
  const Y = (v: number) => bot - (v / d.max) * (bot - top)
  const marks = []
  for (let v = 0; v <= d.max + 1e-9; v += d.step) marks.push(v)
  return (
    <svg viewBox="0 0 240 230" className="mx-auto block w-full max-w-[260px]" role="img" aria-label="A measuring jug">
      <rect x={60} y={Y(d.level)} width={110} height={bot - Y(d.level)} fill="#7CC7FF" fillOpacity={0.7} />
      <path d={`M60 ${top - 8} V${bot} H170 V${top - 8}`} fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M170 ${top + 20} q38 0 38 40 v50 q0 30 -38 30`} fill="none" stroke={INK} strokeWidth={4} />
      {marks.map((v) => {
        const lab = Math.abs(v / d.labelEvery - Math.round(v / d.labelEvery)) < 1e-9
        return (
          <g key={v}>
            <line x1={60} y1={Y(v)} x2={lab ? 84 : 74} y2={Y(v)} stroke={INK} strokeWidth={lab ? 2.5 : 1.5} />
            {lab && v > 0 && (
              <T x={88} y={Y(v) + 4} size={11} anchor="start">
                {`${v.toLocaleString('en-GB')} ${d.unit}`}
              </T>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function Cubes({ l, w, h }: { l: number; w: number; h: number }) {
  // isometric unit cubes, drawn back to front
  const s = Math.min(26, 170 / (l + w + h))
  const cx = (x: number, y: number) => 150 + (x - y) * s * 0.87
  const cy = (x: number, y: number, z: number) => 60 + (x + y) * s * 0.5 - z * s + h * s
  const cells: [number, number, number][] = []
  for (let z = 0; z < h; z++) for (let y = 0; y < w; y++) for (let x = 0; x < l; x++) cells.push([x, y, z])
  // painter's order: lower layers first, then from the back (small x + y) to the front
  cells.sort((a, b) => a[2] - b[2] || a[0] + a[1] - (b[0] + b[1]))
  const faces = cells.map(([x, y, z]) => {
      {
        const p = (X: number, Y: number, Z: number) => `${cx(X, Y)},${cy(X, Y, Z)}`
        return (
          <g key={`${x}-${y}-${z}`} stroke={INK} strokeWidth={1.4} strokeLinejoin="round">
            <polygon points={`${p(x, y, z + 1)} ${p(x + 1, y, z + 1)} ${p(x + 1, y + 1, z + 1)} ${p(x, y + 1, z + 1)}`} fill="#C9BCFF" />
            <polygon points={`${p(x + 1, y, z)} ${p(x + 1, y + 1, z)} ${p(x + 1, y + 1, z + 1)} ${p(x + 1, y, z + 1)}`} fill="#7C5CFF" />
            <polygon points={`${p(x, y + 1, z)} ${p(x + 1, y + 1, z)} ${p(x + 1, y + 1, z + 1)} ${p(x, y + 1, z + 1)}`} fill="#A28BFF" />
          </g>
        )
      }
  })
  return (
    <svg viewBox="0 0 300 260" className="mx-auto block w-full max-w-[320px]" role="img" aria-label={`A cuboid made of cubes`}>
      {faces}
    </svg>
  )
}

function Rects({ d }: { d: Extract<D, { type: 'rects' }> }) {
  const maxH = Math.max(...d.items.map((i) => i.h))
  const total = d.items.reduce((s, i) => s + i.w, 0)
  const S = Math.min(26, 300 / total, 150 / maxH)
  let x = 30
  return (
    <svg viewBox={`0 0 ${Math.max(360, total * S + 60 + d.items.length * 40)} ${maxH * S + 70}`} className="mx-auto block w-full max-w-[560px]" role="img" aria-label="Rectangles">
      {d.items.map((it, i) => {
        const x0 = x
        x += it.w * S + 50
        const y0 = 30 + (maxH - it.h) * S
        const col = it.tone === 'b' ? B : A
        return (
          <g key={i}>
            <rect x={x0} y={y0} width={it.w * S} height={it.h * S} fill={it.tone === 'b' ? B_SOFT : A_SOFT} stroke={col} strokeWidth={3} rx={2} />
            <T x={x0 + (it.w * S) / 2} y={y0 + (it.h * S) / 2 + 6} size={17} weight={700} fill={col}>
              {it.label}
            </T>
            {it.top && (
              <T x={x0 + (it.w * S) / 2} y={y0 - 8} size={13} weight={700}>
                {it.top}
              </T>
            )}
            {it.side && (
              <T x={x0 + it.w * S + 6} y={y0 + (it.h * S) / 2 + 5} size={13} weight={700} anchor="start">
                {it.side}
              </T>
            )}
          </g>
        )
      })}
    </svg>
  )
}
