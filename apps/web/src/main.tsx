import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { i18nReady } from './lib/i18n'
import { retryPendingSignup } from './data/waitlist'
import { startInstallWatch } from './lib/install'
import { startAccountSync } from './state/accountSync'
import { reportError, startErrorReporting } from './lib/errorReporting'
import './index.css'

// First, so an error anywhere after this reaches Sentry (through the API, without personal data).
startErrorReporting()
// Before the first await: Chrome may offer the install as soon as the page loads.
startInstallWatch()
// A launch contact typed without network goes now.
retryPendingSignup()
// With accounts: this device's data meets the account's (merged at the first login, then kept in sync).
void startAccountSync()

// The person's language first (a small file, only for English and French), so the first paint is in it.
await i18nReady

const container = document.getElementById('root')
if (!container) throw new Error('index.html is missing the #root element')

// A render error React could not recover from: still logged in the console, and reported.
createRoot(container, {
  onUncaughtError: (error) => {
    console.error(error)
    reportError(error, 'react')
  },
}).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
