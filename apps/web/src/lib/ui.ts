import type { CSSProperties } from 'react'

/** Delay for the `rise` entrance of the n-th item in a list (index.css). */
export function stagger(index: number): CSSProperties {
  return { '--i': index } as CSSProperties
}

/** Only paths inside the app: `?next=https://evil.example` must never redirect out. */
export function safeNext(value: string | null): string | null {
  return value && /^\/(?![/\\])/.test(value) ? value : null
}
