import { useState } from 'react'
import { BookOpen, MicOff, Trash2, Volume2 } from 'lucide-react'
import { useProfile } from '../data/profile'
import { useReadingConsent, useReadingLog } from '../data/reading/log'
import { KIND_LABEL } from '../data/reading/texts'
import { canSpeak, speak } from '../data/speech'

const DAY = 864e5
const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

/** Grown-ups: what the child has read aloud, words worth practising, and the microphone permission. */
export function ReadingReport() {
  const { profile } = useProfile()
  const name = profile?.name ?? 'Your child'
  const { sessions, clear } = useReadingLog()
  const consent = useReadingConsent()
  const [confirm, setConfirm] = useState(false)

  const week = sessions.filter((s) => Date.now() - Date.parse(s.at) < 7 * DAY)
  const words = week.reduce((n, s) => n + s.words, 0)
  const clearWords = week.reduce((n, s) => n + s.clear, 0)
  const recent = [...sessions].reverse().slice(0, 5)
  const practice = [...new Set(recent.flatMap((s) => s.practice))].slice(0, 12)

  return (
    <section className="card mb-6 p-5 sm:p-6" aria-labelledby="reading-title">
      <h2 id="reading-title" className="flex items-center gap-2 font-display text-xl font-semibold">
        <BookOpen size={22} className="text-sea-deep" aria-hidden /> Reading aloud
      </h2>

      {sessions.length === 0 ? (
        <p className="mt-2 text-ink-soft">When {name} reads to Nova in the Read tab, you’ll see what they read and which words are worth practising together.</p>
      ) : (
        <>
          <p className="mt-2 text-ink-soft">
            This week {name} read {week.length} {week.length === 1 ? 'text' : 'texts'} out loud
            {words ? `, and ${clearWords} of ${words} words came through clearly` : ''}. This shows how clearly the speech engine heard each word, not a reading age or a test.
          </p>

          <ul className="mt-4 grid gap-2">
            {recent.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-mist px-3 py-2 text-sm">
                <span className="font-bold">
                  {shortDate(s.at)}: {s.title} <span className="font-normal text-ink-soft">({KIND_LABEL[s.kind].toLowerCase()})</span>
                </span>
                <span>
                  {s.parts < s.partsTotal ? `${s.parts} of ${s.partsTotal} parts, ` : ''}
                  {s.clear} of {s.words} words clear
                </span>
              </li>
            ))}
          </ul>

          {practice.length > 0 && (
            <>
              <h3 className="mb-2 mt-5 font-bold">Words to practise together</h3>
              <ul className="flex flex-wrap gap-2">
                {practice.map((w) => (
                  <li key={w}>
                    {canSpeak() ? (
                      <button type="button" onClick={() => speak(w)} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-sun-soft px-3 font-semibold shadow-[inset_0_0_0_2px_#FFC93C]">
                        <Volume2 size={16} aria-hidden /> {w}
                      </button>
                    ) : (
                      <span className="inline-flex min-h-[44px] items-center rounded-full bg-sun-soft px-3 font-semibold">{w}</span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t-2 border-mist pt-4 text-sm">
        <p className="min-w-[200px] flex-1 text-ink-soft">
          {consent.granted ? 'You’ve allowed the microphone for reading practice. Recordings are never saved.' : 'The microphone hasn’t been allowed yet. You’ll be asked the first time your child reads.'}
        </p>
        {consent.granted && (
          <button type="button" className="btn btn-ghost !min-h-[44px] !py-2 text-sm" onClick={() => void consent.withdraw()}>
            <MicOff size={18} aria-hidden /> Turn off the microphone
          </button>
        )}
        {sessions.length > 0 &&
          (confirm ? (
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-bold">Clear all reading history?</span>
              <button
                type="button"
                className="btn btn-ghost !min-h-[44px] !py-2 text-sm text-coral-deep"
                onClick={async () => {
                  await clear()
                  setConfirm(false)
                }}
              >
                Yes, clear it
              </button>
              <button type="button" className="btn btn-ghost !min-h-[44px] !py-2 text-sm" onClick={() => setConfirm(false)}>
                Keep it
              </button>
            </span>
          ) : (
            <button type="button" className="btn btn-ghost !min-h-[44px] !py-2 text-sm" onClick={() => setConfirm(true)}>
              <Trash2 size={18} aria-hidden /> Clear reading history
            </button>
          ))}
      </div>
    </section>
  )
}
