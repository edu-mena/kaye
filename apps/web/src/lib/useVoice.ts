import { useCallback, useEffect, useRef, useState } from 'react'
import { clipName } from './voices'

/** Plays the guide's recorded sentences (docs/decisoes/0013). A missing clip just stays silent. */
export function useVoice() {
  const audio = useRef<HTMLAudioElement | null>(null)
  const [speaking, setSpeaking] = useState(false)

  const stop = useCallback(() => {
    audio.current?.pause()
    audio.current = null
    setSpeaking(false)
  }, [])

  const say = useCallback(
    (text: string, voiceId: string) => {
      stop()
      const clip = new Audio(`${import.meta.env.BASE_URL}voice/${voiceId}/${clipName(text)}.mp3`)
      audio.current = clip
      clip.addEventListener('playing', () => setSpeaking(true))
      clip.addEventListener('ended', () => setSpeaking(false))
      clip.addEventListener('error', () => setSpeaking(false))
      // Browsers refuse sound before the first tap; the text is on the screen anyway.
      clip.play().catch(() => setSpeaking(false))
    },
    [stop],
  )

  useEffect(() => stop, [stop])

  return { speaking, say, stop }
}
