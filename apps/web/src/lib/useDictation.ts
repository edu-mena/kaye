import { useCallback, useEffect, useRef, useState } from 'react'

// Voice to text with the browser's own speech recognition (Chrome, Edge, Safari). TypeScript's DOM
// types do not include it, so only what is used is declared here. Unsupported: the button hides.

type Alternative = { transcript: string }
type Result = { isFinal: boolean; 0: Alternative }
type RecognitionEvent = { resultIndex: number; results: ArrayLike<Result> }
type Recognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  addEventListener(type: 'result', listener: (event: RecognitionEvent) => void): void
  addEventListener(type: 'error', listener: (event: { error: string }) => void): void
  addEventListener(type: 'end', listener: () => void): void
  start: () => void
  stop: () => void
}
type RecognitionClass = new () => Recognition

const RecognitionApi = (): RecognitionClass | undefined => {
  if (typeof window === 'undefined') return undefined
  const scope = window as unknown as {
    SpeechRecognition?: RecognitionClass
    webkitSpeechRecognition?: RecognitionClass
  }
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition
}

/** The recognition language for the app's language; Angolan Portuguese is not offered, so pt-PT. */
const LANGS: Record<string, string> = { pt: 'pt-PT', en: 'en-GB', fr: 'fr-FR' }

const canDictate = () => Boolean(RecognitionApi())

/**
 * Listens while `listening` and hands each finished sentence to `onText`; `interim` is what is
 * being heard right now. `error` is set when the microphone is refused.
 */
export function useDictation(language: string, onText: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognition = useRef<Recognition | null>(null)
  const wanted = useRef(false)
  const deliver = useRef(onText)
  useEffect(() => {
    deliver.current = onText
  }, [onText])

  const stop = useCallback(() => {
    wanted.current = false
    recognition.current?.stop()
    recognition.current = null
    setListening(false)
    setInterim('')
  }, [])

  const start = useCallback(() => {
    const Api = RecognitionApi()
    if (!Api) return
    const next = new Api()
    next.lang = LANGS[language.slice(0, 2)] ?? 'pt-PT'
    next.continuous = true
    next.interimResults = true
    next.addEventListener('result', (event) => {
      let heard = ''
      for (let index = event.resultIndex; index < event.results.length; index++) {
        const result = event.results[index]
        if (!result) continue
        if (result.isFinal) deliver.current(result[0].transcript.trim())
        else heard += result[0].transcript
      }
      setInterim(heard)
    })
    next.addEventListener('error', (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError(event.error)
        stop()
      }
    })
    // Phones end the session after a pause: start again while the person still wants it.
    next.addEventListener('end', () => {
      if (wanted.current && recognition.current === next) {
        try {
          next.start()
        } catch {
          stop()
        }
      }
    })
    wanted.current = true
    recognition.current = next
    setError(null)
    setListening(true)
    try {
      next.start()
    } catch {
      stop()
    }
  }, [language, stop])

  useEffect(() => stop, [stop])

  return { listening, interim, error, start, stop, supported: canDictate() }
}
