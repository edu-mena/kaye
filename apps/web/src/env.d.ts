interface ImportMetaEnv {
  /** Absolute API URL for the native apps. The web app uses /api/v1 on the same domain. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
