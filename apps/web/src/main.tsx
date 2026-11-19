import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { i18nReady } from './lib/i18n'
import { retryPendingSignup } from './data/waitlist'
import { startInstallWatch } from './lib/install'
import { startAccountSync } from './state/accountSync'
import './index.css'

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

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
