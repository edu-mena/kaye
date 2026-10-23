import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from '../locales/en'
import { fr } from '../locales/fr'
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

export function changeLocale(locale: Locale) {
  void i18n.changeLanguage(locale)
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // Not critical: the choice just won't survive a reload.
  }
}

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
})

void i18n.use(initReactI18next).init({
  resources: {
    pt: { translation: pt },
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: initialLocale(),
  fallbackLng: 'pt',
  interpolation: { escapeValue: false },
})
