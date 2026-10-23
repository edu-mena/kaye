import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  // Permanent once the app is on Google Play: confirm it before the first release.
  appId: 'ao.kaye.app',
  appName: 'Kayé',
  // Built with `npm run build:native` (vite --mode native).
  webDir: 'dist',
}

export default config
