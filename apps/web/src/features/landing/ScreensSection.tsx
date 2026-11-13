import { useTranslation } from 'react-i18next'
import academies from '../../assets/screens/academies.webp'
import career from '../../assets/screens/career.webp'
import cv from '../../assets/screens/cv.webp'
import market from '../../assets/screens/market.webp'
import path from '../../assets/screens/path.webp'
import result from '../../assets/screens/result.webp'
import { CardRow, ROW_ITEM } from '../../components/ui/CardRow'

// Real captures of the app (a demo account on the test site), so the visitor sees what they get.
const SCREENS = [
  { id: 'test', src: result },
  { id: 'career', src: career },
  { id: 'path', src: path },
  { id: 'study', src: academies },
  { id: 'market', src: market },
  { id: 'cv', src: cv },
] as const

/** The app from the inside: one phone per main feature, in a row that slides. */
export function ScreensSection() {
  const { t } = useTranslation()

  return (
    <section className="mx-auto max-w-5xl px-4 pt-20 lg:pt-28">
      <h2 className="mx-auto max-w-2xl text-center text-3xl leading-tight font-extrabold text-night sm:text-4xl">
        {t('landing.screensTitle')}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-lg font-light text-copy">
        {t('landing.screensText')}
      </p>
      <div className="mt-10">
        <CardRow label={t('landing.screensTitle')}>
          {SCREENS.map((screen) => (
            <li key={screen.id} className={ROW_ITEM}>
              <figure>
                <div className="overflow-hidden rounded-[1.75rem] border-[6px] border-coal bg-coal shadow-lg">
                  <img
                    src={screen.src}
                    alt={t(`landing.screen_${screen.id}_title`)}
                    width={560}
                    height={1212}
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full rounded-[1.3rem]"
                  />
                </div>
                <figcaption className="mt-4 px-1">
                  <span className="block text-base font-semibold text-night">
                    {t(`landing.screen_${screen.id}_title`)}
                  </span>
                  <span className="mt-1 block text-sm font-light text-copy">
                    {t(`landing.screen_${screen.id}_text`)}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </CardRow>
      </div>
    </section>
  )
}
