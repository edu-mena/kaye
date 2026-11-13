/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  /** Absolute API URL for the native apps. The web app uses /api/v1 on the same domain. */
  readonly VITE_API_URL?: string
  /** Kayé's email for corrections ("Ajuda-nos a completar"); without it, that link is hidden. */
  readonly VITE_KAYE_EMAIL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
