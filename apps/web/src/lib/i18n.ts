import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'
import { pt, type Messages } from '../locales/pt'

export const LOCALES = ['pt', 'en', 'fr'] as const
export type Locale = (typeof LOCALES)[number]

// Each language is shown in its own name, whatever the current language.
export const LOCALE_NAMES: Record<Locale, string> = {
  pt: 'Português',
  en: 'English',
  fr: 'Français',
}

const STORAGE_KEY = 'kaye.locale'

// Own instance instead of the i18next global, so nothing else can change it.
export const i18n = createInstance()

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: Messages }
  }
}

function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale)
}

function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLocale(saved)) return saved
  } catch {
    // Storage can be blocked (private mode): fall back to the device language.
  }
  const device = navigator.language.slice(0, 2)
  return isLocale(device) ? device : 'pt'
}

// Portuguese ships with the app; English and French are fetched only by those who pick them.
const LOADERS: Record<Exclude<Locale, 'pt'>, () => Promise<Messages>> = {
  en: () => import('../locales/en').then((module) => module.en),
  fr: () => import('../locales/fr').then((module) => module.fr),
}

async function load(locale: Locale) {
  if (locale === 'pt' || i18n.hasResourceBundle(locale, 'translation')) return
  i18n.addResourceBundle(locale, 'translation', await LOADERS[locale]())
}

export async function changeLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // Not critical: the choice just won't survive a reload.
  }
  await load(locale)
  await i18n.changeLanguage(locale)
}

/**
 * A shared page in the sender's language (/familia), unless whoever opens it already chose one. Not saved:
 * the next visit to the app starts as before.
 */
export async function followLocale(locale: Locale) {
  try {
    if (isLocale(localStorage.getItem(STORAGE_KEY))) return
  } catch {
    // Storage blocked: follow the link.
  }
  await load(locale)
  await i18n.changeLanguage(locale)
}

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
})

void i18n.use(initReactI18next).init({
  resources: { pt: { translation: pt } },
  lng: 'pt',
  fallbackLng: 'pt',
  interpolation: { escapeValue: false },
})

/** Resolves once the person's language is loaded; the app waits for it before its first paint. */
export const i18nReady: Promise<void> = (async () => {
  const first = initialLocale()
  if (first === 'pt') return
  try {
    await load(first)
    await i18n.changeLanguage(first)
  } catch {
    // Offline before the language arrived: Portuguese until the next load.
  }
})()
