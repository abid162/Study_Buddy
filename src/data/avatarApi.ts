/**
 * Photo-to-avatar: sends a downsized photo to the n8n workflow "Study Buddy: Photo to Avatar"
 * (gpt-image-2 via the "OpenAi c2 account" credential). n8n keeps no copy: execution saving is off.
 */
export const AVATAR_WEBHOOK = import.meta.env.VITE_AVATAR_WEBHOOK_URL || 'https://cleartwo.app.n8n.cloud/webhook/study-buddy-avatar'

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('That file could not be opened as a photo.'))
    img.src = src
  })

/** Read a photo, square-crop around the centre, scale to 768px and return JPEG base64 (no data: prefix). */
export async function preparePhoto(file: File): Promise<{ base64: string; preview: string }> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose a photo (JPG, PNG or HEIC from your camera).')
  if (file.size > 20 * 1024 * 1024) throw new Error('That photo is very large. Please choose one under 20 MB.')
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const side = Math.min(img.naturalWidth, img.naturalHeight)
    const size = Math.min(768, side)
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size)
    const preview = canvas.toDataURL('image/jpeg', 0.85)
    return { base64: preview.split(',')[1], preview }
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Shrink the returned avatar to a light 320px image so it fits comfortably in session storage. */
async function shrink(blob: Blob): Promise<string> {
  const url = URL.createObjectURL(blob)
  try {
    const img = await loadImage(url)
    const canvas = document.createElement('canvas')
    canvas.width = 320
    canvas.height = 320
    canvas.getContext('2d')!.drawImage(img, 0, 0, 320, 320)
    const webp = canvas.toDataURL('image/webp', 0.86)
    return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.88)
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Ask n8n to draw the cartoon. Uses a multipart form (a "simple" request, so no CORS preflight). */
export async function drawAvatar(base64: string, signal?: AbortSignal): Promise<string> {
  const form = new FormData()
  form.append('image', base64)
  let res: Response
  try {
    res = await fetch(AVATAR_WEBHOOK, { method: 'POST', body: form, signal })
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e
    throw new Error('Nova could not reach the drawing studio. Check your connection and try again.')
  }
  const type = res.headers.get('content-type') || ''
  if (!res.ok || !type.startsWith('image/')) {
    let msg = 'Nova could not draw that one. Try a clearer photo of just your face, or build an avatar instead.'
    try {
      const j = await res.json()
      if (j?.error) msg = j.error
    } catch {
      /* not JSON */
    }
    throw new Error(msg)
  }
  return shrink(await res.blob())
}
