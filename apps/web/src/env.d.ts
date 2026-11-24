/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  /** Absolute API URL for the native apps. The web app uses /api/v1 on the same domain. */
  readonly VITE_API_URL?: string
  /** Where the content comes from: `api` reads /api/v1 (Laravel); anything else, or unset, the bundled demo data. */
  readonly VITE_DATA_SOURCE?: 'api' | 'demo'
  /** Kayé's email for corrections ("Ajuda-nos a completar"); without it, that link is hidden. */
  readonly VITE_KAYE_EMAIL?: string
  /** Kayé's WhatsApp number, digits only with the country code (244…), for mentor requests. */
  readonly VITE_KAYE_WHATSAPP?: string
  /** `true` shows Kayé Plus (padlocks, card, /plus). Off by default: nothing is charged yet (docs/decisoes/0024). */
  readonly VITE_PLUS_ENABLED?: 'true' | 'false'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
