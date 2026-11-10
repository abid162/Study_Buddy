/**
 * Calls to Cleartwo's n8n. Both use multipart forms ("simple" requests, so no CORS preflight), like the avatar workflow.
 * Override the URLs with VITE_MARK_WEBHOOK_URL and VITE_SCAN_WEBHOOK_URL.
 */
import type { EnItem } from './english'

export const MARK_WEBHOOK = import.meta.env.VITE_MARK_WEBHOOK_URL || 'https://cleartwo.app.n8n.cloud/webhook/study-buddy-mark'
export const SCAN_WEBHOOK = import.meta.env.VITE_SCAN_WEBHOOK_URL || 'https://cleartwo.app.n8n.cloud/webhook/study-buddy-homework'

async function post(url: string, form: FormData, ms: number, signal?: AbortSignal) {
  const ctrl = new AbortController()
  const timer = window.setTimeout(() => ctrl.abort(), ms)
  signal?.addEventListener('abort', () => ctrl.abort())
  try {
    const res = await fetch(url, { method: 'POST', body: form, signal: ctrl.signal })
    const data = await res.json().catch(() => null)
    if (!res.ok || !data) throw new Error(data?.error || `Status ${res.status}`)
    return data
  } finally {
    window.clearTimeout(timer)
  }
}

/* ---------------- English answer marking ---------------- */

export interface MarkResult {
  verdict: 'correct' | 'almost' | 'not_yet'
  feedback: string
  tip: string
}

/** Ask the AI marker about an English answer. Throws if n8n cannot be reached. */
export async function markEnglish(q: EnItem, statement: string, answer: string): Promise<MarkResult> {
  const f = new FormData()
  f.append('year', String(q.year))
  f.append('curriculum_id', q.curriculumId)
  f.append('statement', statement)
  f.append('task', q.prompt)
  f.append('extract', q.extract ?? '')
  f.append('rubric', q.rubric ?? `Accept answers that mean the same as: ${(q.accept ?? []).join(' / ')}`)
  f.append('model_answer', q.model ?? (q.accept ?? [])[0] ?? '')
  f.append('answer', answer.slice(0, 1500))
  const d = await post(MARK_WEBHOOK, f, 30000)
  if (!d.verdict) throw new Error('No verdict')
  return { verdict: d.verdict, feedback: String(d.feedback ?? ''), tip: String(d.tip ?? '') }
}

/* ---------------- homework scanner ---------------- */

export type ScanStatus = 'correct' | 'incorrect' | 'partly' | 'unanswered' | 'unclear'
export interface ScanItem {
  question: string
  child_answer: string
  status: ScanStatus
  correct_answer: string
  feedback: string
  steps: string[]
  curriculum_id: string
}
export interface ScanResult {
  subject: 'maths' | 'english'
  readable: boolean
  summary: string
  score: { correct: number; total: number }
  items: ScanItem[]
  praise: string
  next_step: string
}

/** Read a photo, keep its shape, scale the long side to 1600px and return JPEG base64 (no data: prefix). */
export async function prepareSheet(file: File): Promise<{ base64: string; preview: string }> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose a photo of the homework sheet.')
  if (file.size > 25 * 1024 * 1024) throw new Error('That photo is very large. Please choose one under 25 MB.')
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('That file could not be opened as a photo.'))
      i.src = url
    })
    const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    const preview = canvas.toDataURL('image/jpeg', 0.85)
    return { base64: preview.split(',')[1]!, preview }
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Send the sheet to n8n, which reads it and marks it against the curriculum for the child's year. */
export async function scanHomework(base64: string, year: number, subject: 'maths' | 'english' | 'auto', signal?: AbortSignal): Promise<ScanResult> {
  const f = new FormData()
  f.append('image', base64)
  f.append('year', String(year))
  f.append('subject', subject)
  try {
    const d = await post(SCAN_WEBHOOK, f, 120000, signal)
    if (!Array.isArray(d.items)) throw new Error('Nova could not read that sheet.')
    return d as ScanResult
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw new Error('The scan took too long. Check your connection and try again.')
    throw e
  }
}
