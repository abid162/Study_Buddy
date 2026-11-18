import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Push-to-talk recording for the reading coach.
 * - The microphone only opens when the child taps to start, and is fully released (the browser's mic light goes off) on stop.
 * - Audio stays in memory as one short clip; nothing is written to the device or kept after it is sent.
 * - Chrome/Android record WebM (Opus); iPhone/iPad Safari record MP4 (AAC). Whisper reads both.
 */

export type MicState = 'idle' | 'asking' | 'recording' | 'denied' | 'unsupported'

const TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
export const MAX_SECONDS = 90

export const canRecord = () => typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof window.MediaRecorder !== 'undefined'

export function useRecorder() {
  const [state, setState] = useState<MicState>(() => (canRecord() ? 'idle' : 'unsupported'))
  const [seconds, setSeconds] = useState(0)
  /** recent loudness values (0–1), newest last, for the waveform */
  const levels = useRef<number[]>([])
  const rec = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const ctx = useRef<AudioContext | null>(null)
  const raf = useRef(0)
  const timer = useRef(0)
  const chunks = useRef<Blob[]>([])
  const done = useRef<((b: Blob | null) => void) | null>(null)
  /** a clip that finished on its own (the time limit) and hasn't been collected yet */
  const last = useRef<Blob | null>(null)

  const release = useCallback(() => {
    cancelAnimationFrame(raf.current)
    window.clearInterval(timer.current)
    stream.current?.getTracks().forEach((t) => t.stop())
    stream.current = null
    void ctx.current?.close().catch(() => {})
    ctx.current = null
  }, [])

  const stop = useCallback((): Promise<Blob | null> => {
    const r = rec.current
    if (!r || r.state === 'inactive') {
      release()
      setState((s) => (s === 'recording' || s === 'asking' ? 'idle' : s))
      const b = last.current
      last.current = null
      return Promise.resolve(b)
    }
    return new Promise((resolve) => {
      done.current = resolve
      r.stop()
    })
  }, [release])

  /** open the microphone and start recording; false if it couldn't (blocked, missing) */
  const start = useCallback(async (): Promise<boolean> => {
    if (!canRecord()) {
      setState('unsupported')
      return false
    }
    setState('asking')
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } })
      stream.current = s
      const mimeType = TYPES.find((t) => MediaRecorder.isTypeSupported?.(t))
      const r = new MediaRecorder(s, mimeType ? { mimeType, audioBitsPerSecond: 48000 } : undefined)
      chunks.current = []
      last.current = null
      r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data)
      r.onstop = () => {
        const blob = chunks.current.length ? new Blob(chunks.current, { type: (r.mimeType || mimeType || 'audio/webm').split(';')[0] }) : null
        chunks.current = []
        release()
        rec.current = null
        setState('idle')
        if (done.current) done.current(blob)
        else last.current = blob
        done.current = null
      }
      rec.current = r

      // loudness for the waveform
      try {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        const ac = new AC()
        ctx.current = ac
        void ac.resume?.().catch(() => {})
        const an = ac.createAnalyser()
        an.fftSize = 512
        ac.createMediaStreamSource(s).connect(an)
        const buf = new Uint8Array(an.fftSize)
        levels.current = []
        const tick = () => {
          an.getByteTimeDomainData(buf)
          let sum = 0
          for (const v of buf) sum += ((v - 128) / 128) ** 2
          levels.current.push(Math.min(1, Math.sqrt(sum / buf.length) * 3.2))
          if (levels.current.length > 160) levels.current.shift()
          raf.current = requestAnimationFrame(tick)
        }
        tick()
      } catch {
        /* no waveform, recording still works */
      }

      r.start(250)
      setSeconds(0)
      const t0 = Date.now()
      timer.current = window.setInterval(() => {
        const sec = Math.floor((Date.now() - t0) / 1000)
        setSeconds(sec)
        if (sec >= MAX_SECONDS && rec.current?.state === 'recording') rec.current.stop()
      }, 250)
      setState('recording')
      return true
    } catch (e) {
      release()
      const name = (e as Error).name
      setState(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : name === 'NotFoundError' ? 'unsupported' : 'idle')
      return false
    }
  }, [release])

  /** throw the recording away without sending it */
  const cancel = useCallback(() => {
    done.current = null
    last.current = null
    const r = rec.current
    if (r && r.state !== 'inactive') {
      r.onstop = () => {
        chunks.current = []
        release()
        rec.current = null
        setState('idle')
      }
      r.stop()
    } else release()
  }, [release])

  // leaving the screen always closes the microphone
  useEffect(() => () => cancel(), [cancel])

  return { state, seconds, levels, start, stop, cancel }
}
