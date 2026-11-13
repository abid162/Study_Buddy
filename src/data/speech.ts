/**
 * Read-aloud with the browser's own voice (British English where available). No audio leaves the device.
 * speakParts() reads a list in order and reports which part is being read, so the screen can highlight it.
 */

const KEY = 'study-buddy-read-aloud'

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window

export function getAutoRead(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function setAutoRead(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? '1' : '0')
  } catch {
    /* fine */
  }
}

/** Turn maths and screen symbols into words a voice reads well. */
export function forSpeech(text: string): string {
  return text
    .replace(/\n+/g, '. ')
    .replace(/(\d)\s*×\s*(\d)/g, '$1 times $2')
    .replace(/×/g, ' times ')
    .replace(/÷/g, ' divided by ')
    .replace(/(\d)\s*[−–]\s*(\d)/g, '$1 minus $2')
    .replace(/[−–]\s*(\d)/g, 'minus $1')
    .replace(/\s=\s?/g, ' equals ')
    .replace(/(\d)\s*\/\s*(\d)/g, '$1 over $2')
    .replace(/\?\s*\/\s*(\d)/g, 'what over $1')
    .replace(/_{2,}/g, ' blank ')
    .replace(/(\d)°C/g, '$1 degrees')
    .replace(/(\d)\s?cm²/g, '$1 square centimetres')
    .replace(/(\d)\s?m²/g, '$1 square metres')
    .replace(/(\d)\s?cm\b/g, '$1 centimetres')
    .replace(/(\d)\s?mm\b/g, '$1 millimetres')
    .replace(/(\d)\s?km\b/g, '$1 kilometres')
    .replace(/(\d)\s?kg\b/g, '$1 kilograms')
    .replace(/(\d)\s?ml\b/g, '$1 millilitres')
    .replace(/[“”"]/g, '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function voice() {
  const vs = window.speechSynthesis.getVoices()
  return vs.find((x) => x.lang === 'en-GB' && /female|libby|sonia|serena|kate/i.test(x.name)) ?? vs.find((x) => x.lang === 'en-GB') ?? vs.find((x) => x.lang.startsWith('en'))
}

let run = 0

export function stopSpeaking() {
  run++
  try {
    window.speechSynthesis?.cancel()
  } catch {
    /* ignore */
  }
}

/**
 * Read parts one after another. `onPart(i)` fires as part i starts; `onPart(null)` when finished or stopped.
 * Starting a new read stops the previous one.
 */
export function speakParts(parts: string[], onPart?: (i: number | null) => void, rate = 0.9) {
  if (!canSpeak()) return false
  stopSpeaking()
  const mine = run
  const synth = window.speechSynthesis
  const v = voice()
  const list = parts.map(forSpeech).filter(Boolean)
  list.forEach((text, i) => {
    const u = new SpeechSynthesisUtterance(text)
    if (v) u.voice = v
    u.lang = 'en-GB'
    u.rate = rate
    u.onstart = () => mine === run && onPart?.(i)
    u.onend = () => mine === run && i === list.length - 1 && onPart?.(null)
    u.onerror = () => mine === run && onPart?.(null)
    synth.speak(u)
  })
  return true
}

/** Read one thing, stopping anything already being read. */
export const speak = (text: string) => speakParts([text])

/** Read after whatever is already being read (Nova's replies), without cutting it off. */
export function speakNext(text: string) {
  if (!canSpeak()) return
  const t = forSpeech(text)
  if (!t) return
  const u = new SpeechSynthesisUtterance(t)
  const v = voice()
  if (v) u.voice = v
  u.lang = 'en-GB'
  u.rate = 0.9
  window.speechSynthesis.speak(u)
}
