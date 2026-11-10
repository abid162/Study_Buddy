import { useState } from 'react'
import { Images, Users } from 'lucide-react'
import { Buddy } from '../components/art'
import { ISLANDS } from '../data/world'
import { photosFor, picUrl } from '../data/photos'

/** Grown-ups tab: the parent portal is still to come; for now it holds the team's photo library. */
export function Grownups({ onHome }: { onHome: () => void }) {
  const [showPhotos, setShowPhotos] = useState(false)
  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 pb-12 pt-[calc(env(safe-area-inset-top,0px)+20px)] sm:px-8">
      <section className="card flex flex-wrap items-center gap-5 p-6">
        <div className="relative h-24 w-24 shrink-0">
          <Buddy mood="think" className="h-24 w-24" />
          <span className="tile absolute -right-1 bottom-0 h-10 w-10 !rounded-xl !text-ink" style={{ background: 'linear-gradient(180deg,#FFB08A,#FF7F5C)' }}>
            <Users size={20} aria-hidden />
          </span>
        </div>
        <div className="min-w-[220px] flex-1">
          <h1 className="font-display text-[1.75rem] font-semibold">Grown-ups</h1>
          <p className="text-ink-soft">Weekly reports, mastery by topic and what to practise next. Arriving in the next preview.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-ghost" onClick={() => setShowPhotos((s) => !s)} aria-expanded={showPhotos}>
            <Images size={20} aria-hidden /> {showPhotos ? 'Hide photo library' : 'Photo library'}
          </button>
          <button type="button" className="btn btn-grape" onClick={onHome}>
            Back to your world
          </button>
        </div>
      </section>

      {showPhotos && (
        <div className="mt-6 grid gap-8">
          <p className="text-ink-soft">Every photo the worlds use, in order. Photo 1 is the cover; question cards show the next photo each time. Free Unsplash photos, credited on screen. To add your own licensed photos, drop them into <code>src/assets/worlds/&lt;world&gt;/</code> and push: they appear first, in file-name order.</p>
          {ISLANDS.map((isl) => (
            <section key={isl.id} aria-labelledby={`ph-${isl.id}`}>
              <h2 id={`ph-${isl.id}`} className="mb-3 font-display text-2xl font-semibold">
                {isl.name} <span className="text-base font-normal text-ink-soft">({photosFor(isl.id).length} photos)</span>
              </h2>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {photosFor(isl.id).map((p, i) => (
                  <li key={`${isl.id}-${i}`} className="overflow-hidden rounded-2xl bg-paper shadow-card">
                    <div className="relative aspect-[4/3]" style={{ background: `linear-gradient(135deg, ${isl.tint[0]}, ${isl.tint[1]})` }}>
                      <img src={picUrl(p, 600)} alt={p.about ?? ''} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                      <span className="absolute left-2 top-2 grid h-7 min-w-7 place-items-center rounded-full bg-night px-2 text-sm font-bold text-white">{i + 1}</span>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-bold leading-snug">{p.about}</p>
                      <p className="text-xs text-ink-soft">{p.local ? p.credit : `${p.credit} / Unsplash`}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}
