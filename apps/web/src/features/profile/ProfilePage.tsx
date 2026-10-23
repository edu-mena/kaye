import { useTranslation } from 'react-i18next'
import { changeLocale, LOCALE_NAMES, LOCALES } from '../../lib/i18n'

export default function ProfilePage() {
  const { t, i18n } = useTranslation()

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-navy">{t('profile.title')}</h1>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-navy">{t('profile.language')}</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {LOCALES.map((locale) => {
            const active = i18n.language === locale
            return (
              <button
                key={locale}
                type="button"
                lang={locale}
                aria-pressed={active}
                onClick={() => changeLocale(locale)}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  active ? 'border-navy bg-navy font-semibold text-white' : 'border-slate-200 text-navy'
                }`}
              >
                {LOCALE_NAMES[locale]}
              </button>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}
