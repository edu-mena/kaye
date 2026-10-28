import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { i18nReady } from './lib/i18n'
import './index.css'

// The person's language first (a small file, only for English and French), so the first paint is in it.
await i18nReady

const container = document.getElementById('root')
if (!container) throw new Error('index.html is missing the #root element')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
