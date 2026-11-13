import { useTranslation } from 'react-i18next'

/** A field only bots fill: kept off-screen and out of the keyboard order. */
export function Honeypot({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { t } = useTranslation()
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        {t('prelaunch.honeypot')}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    </div>
  )
}
