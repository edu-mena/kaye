import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import logo from '../../assets/kaye-logo.png'
import { Icon, type IconName } from '../../components/icons'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useCareers } from '../../data/queries'
import { areaCounts } from '../../domain/discovery'
import { changeLocale, LOCALES, type Locale } from '../../lib/i18n'
import { safeNext } from '../../lib/ui'
import { AREA_ICONS } from '../onboarding/areaIcons'
import { ContactSection } from './ContactSection'
import { FeedbackForm } from './FeedbackForm'
import { ScreensSection } from './ScreensSection'
import { WaitlistSection } from './WaitlistSection'
import { WelcomeBanner } from './WelcomeBanner'
import { CvScene, DiscoverScene, GuideSun, HeroScene, ManifestoScene, MarketScene, PathScene } from './scenes'

const PROMISES = [
  { id: 'free', icon: 'heart' },
  { id: 'honest', icon: 'shield' },
  { id: 'angola', icon: 'pin' },
] as const satisfies readonly { id: string; icon: IconName }[]

function LanguagePicker() {
  const { t, i18n } = useTranslation()

  return (
    <fieldset aria-label={t('landing.language')} className="flex min-w-0">
      {LOCALES.map((locale: Locale) => (
        <button
          key={locale}
          type="button"
          aria-pressed={i18n.language === locale}
          onClick={() => void changeLocale(locale)}
          className={`h-11 w-9 rounded-full text-sm ${
            i18n.language === locale ? 'font-semibold text-night' : 'font-light text-muted hover:text-night'
          }`}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </fieldset>
  )
}

type FeatureProps = { id: 'discover' | 'path' | 'market' | 'cv'; flip?: boolean; children: ReactNode }

/** One thing the Kayé does: a big picture and a sentence, sides swapping along the page. */
function Feature({ id, flip = false, children }: FeatureProps) {
  const { t } = useTranslation()

  return (
    <section className="grid items-center gap-6 lg:grid-cols-2 lg:gap-16">
      <div className={flip ? 'lg:order-2' : ''}>{children}</div>
      <div className={flip ? 'lg:order-1' : ''}>
        <h2 className="text-3xl leading-tight font-extrabold text-night sm:text-4xl">
          {t(`landing.feature_${id}_title`)}
        </h2>
        <p className="mt-4 text-lg font-light text-copy">{t(`landing.feature_${id}_text`)}</p>
      </div>
    </section>
  )
}

/** The public face of the Kayé: more pictures than words, and a single way in. */
export function LandingPage() {
  const { t } = useTranslation()
  const { data: careers = [] } = useCareers()
  // A shared link opened without an account: sign in first, then straight back to it.
  const next = safeNext(useSearchParams()[0].get('next'))
  const signIn = next ? `/entrar?next=${encodeURIComponent(next)}` : '/entrar'

  return (
    <div className="bg-paper">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-4">
        <img src={logo} alt="Kayé" className="h-9 w-auto" />
        <div className="flex items-center gap-2">
          <LanguagePicker />
          <ButtonLink to={signIn} size="sm" variant="secondary">
            {t('landing.signIn')}
          </ButtonLink>
        </div>
      </header>

      <main id="conteudo">
        {next && (
          <section
            aria-labelledby="shared-link"
            className="mx-auto mt-2 flex max-w-6xl flex-wrap items-center gap-4 px-4"
          >
            <div className="flex w-full flex-wrap items-center gap-4 rounded-card bg-coal p-5 text-white">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-gold">
                <Icon name="lock" className="size-5" />
              </span>
              <div className="min-w-0 flex-1 basis-60">
                <h2 id="shared-link" className="text-lg font-extrabold">
                  {t('share.signInToSee')}
                </h2>
                <p className="mt-0.5 text-sm font-light text-white/80">{t('share.signInToSeeBody')}</p>
              </div>
              <ButtonLink to={signIn} variant="onDark">
                {t('share.signInAndSee')}
                <Icon name="arrowRight" className="size-4" />
              </ButtonLink>
            </div>
          </section>
        )}
        <WelcomeBanner />

        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-10 sm:pt-16 lg:grid-cols-2 lg:gap-8">
          <div>
            <h1 className="max-w-xl rise text-4xl leading-[1.08] font-extrabold text-night sm:text-6xl">
              {t('landing.title')}
            </h1>
            <p className="mt-5 max-w-lg rise text-lg font-light text-copy">{t('landing.subtitle')}</p>
            <ButtonLink to={signIn} size="lg" className="mt-8 rise">
              {t('landing.start')}
              <Icon name="arrowRight" className="size-5" />
            </ButtonLink>
          </div>
          <div className="rise">
            <HeroScene careers={careers} />
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-4 py-20 text-center lg:py-28">
          <GuideSun />
          <h2 className="mt-6 text-3xl leading-tight font-extrabold text-night sm:text-5xl">
            {t('landing.feelingTitle')}
          </h2>
          <p className="mt-4 text-lg font-light text-copy">{t('landing.feelingText')}</p>
        </section>

        <div className="mx-auto max-w-5xl space-y-16 px-4 lg:space-y-28">
          <Feature id="discover">
            <DiscoverScene />
          </Feature>
          <Feature id="path" flip>
            <PathScene />
          </Feature>
          <Feature id="market">
            <MarketScene careers={careers} />
          </Feature>
          <Feature id="cv" flip>
            <CvScene />
          </Feature>
        </div>

        <ScreensSection />

        <section className="mx-auto max-w-5xl px-4 py-20 lg:py-28">
          <h2 className="mx-auto max-w-2xl text-center text-3xl leading-tight font-extrabold text-night sm:text-4xl">
            {t('landing.areasTitle')}
          </h2>
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {areaCounts(careers).map(({ area, count }) => (
              <li key={area} className="flex items-center gap-3 rounded-2xl bg-surface p-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-coal text-gold">
                  <Icon name={AREA_ICONS[area]} className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-normal text-night">
                    {t(`market.area_${area}`)}
                  </span>
                  <span className="block text-xs font-light text-muted">
                    {t('onboarding.careerCount', { count })}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="px-3">
          <section className="relative mx-auto max-w-6xl overflow-hidden rounded-card bg-coal px-6 py-16 text-white sm:px-12 lg:py-24">
            <ManifestoScene />
            <div className="relative max-w-xl">
              <h2 className="text-3xl leading-tight font-extrabold sm:text-5xl">
                {t('landing.manifestoTitle')}
              </h2>
              <p className="mt-5 text-lg font-light">{t('landing.manifestoText')}</p>
              <ul className="mt-8 space-y-3">
                {PROMISES.map((promise) => (
                  <li key={promise.id} className="flex items-center gap-3 text-base font-normal">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-gold">
                      <Icon name={promise.icon} className="size-5" />
                    </span>
                    {t(`landing.promise_${promise.id}`)}
                  </li>
                ))}
              </ul>
              <ButtonLink to={signIn} size="lg" variant="onDark" className="mt-10">
                {t('landing.start')}
                <Icon name="arrowRight" className="size-5" />
              </ButtonLink>
            </div>
          </section>
        </div>

        <WaitlistSection />

        <section className="mx-auto max-w-2xl px-4 pb-4">
          <Card as="section" aria-labelledby="feedback-title">
            <h2 id="feedback-title" className="text-2xl font-extrabold text-night">
              {t('prelaunch.feedbackTitle')}
            </h2>
            <p className="mt-2 mb-5 text-base font-light text-copy">{t('prelaunch.feedbackText')}</p>
            <FeedbackForm page="landing" />
          </Card>
        </section>

        <ContactSection />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm font-light text-muted">
          <img src={logo} alt="" className="h-7 w-auto" />
          <p>{t('landing.developedBy')}</p>
          <nav aria-label={t('landing.legal')} className="flex gap-4">
            <Link to="/termos" className="hover:text-night">
              {t('landing.terms')}
            </Link>
            <Link to="/privacidade" className="hover:text-night">
              {t('landing.privacy')}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
