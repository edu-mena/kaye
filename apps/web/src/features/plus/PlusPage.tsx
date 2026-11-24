import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router'
import { Icon } from '../../components/icons'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { usePlus } from '../../lib/plan'
import { WaitlistSection } from '../landing/WaitlistSection'
import { CardHeading } from '../home/CardHeading'
import { PlusBenefits } from './PlusBenefits'
import { usePlusPrice } from './usePlusPrice'

const FAQ = [
  { q: 'plus.faqFreeQ', a: 'plus.faqFreeA' },
  { q: 'plus.faqTryQ', a: 'plus.faqTryA' },
  { q: 'plus.faqPayQ', a: 'plus.faqPayA' },
  { q: 'plus.faqAgeQ', a: 'plus.faqAgeA' },
] as const

/** Kayé Plus: what it includes, the price, short answers, and "Avisa-me quando abrir". Nothing is charged yet. */
export default function PlusPage() {
  const { t } = useTranslation()
  const { enabled, promotable } = usePlus()
  const price = usePlusPrice()
  // With the flag off the page does not exist for anyone.
  if (!enabled) return <Navigate to="/" replace />

  if (!promotable) {
    return (
      <>
        <PageHeader title={t('plus.title')} back={{ to: '/', label: t('nav.home') }} />
        <Card as="section" aria-labelledby="plus-adults">
          <CardHeading id="plus-adults" icon="lock">
            {t('plus.adultsTitle')}
          </CardHeading>
          <p className="mt-2 text-sm font-light text-copy">{t('plus.adultsBody')}</p>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={t('plus.title')}
        subtitle={t('plus.subtitle')}
        back={{ to: '/', label: t('nav.home') }}
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-4">
          <Card as="section" aria-labelledby="plus-includes" className="p-5 sm:p-6">
            <CardHeading id="plus-includes" icon="award">
              {t('plus.includesTitle')}
            </CardHeading>
            <PlusBenefits className="mt-4" />
            <p className="mt-4 font-display text-2xl font-extrabold text-night">{price}</p>
            <p className="mt-1 text-sm font-light text-copy">{t('plus.notCharged')}</p>
          </Card>
          <Card as="section" aria-labelledby="plus-free" tone="gray" className="p-5 sm:p-6">
            <CardHeading id="plus-free" icon="check">
              {t('plus.freeTitle')}
            </CardHeading>
            <p className="mt-2 text-sm font-light text-copy">{t('plus.freeBody')}</p>
            <ButtonLink to="/" variant="secondary" size="sm" className="mt-4">
              {t('plus.freeCta')}
              <Icon name="arrowRight" className="size-4" />
            </ButtonLink>
          </Card>
        </div>
        <div className="space-y-4">
          <Card as="section" aria-labelledby="plus-faq" className="p-5 sm:p-6">
            <CardHeading id="plus-faq" icon="help">
              {t('plus.faqTitle')}
            </CardHeading>
            <dl className="mt-3 divide-y divide-line">
              {FAQ.map((item) => (
                <div key={item.q} className="py-3 first:pt-0 last:pb-0">
                  <dt className="text-sm font-semibold text-night">{t(item.q)}</dt>
                  <dd className="mt-1 text-sm font-light text-copy">{t(item.a)}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <WaitlistSection
            source="plus"
            embedded
            copy={{
              title: t('plus.waitlistTitle'),
              text: t('plus.waitlistText'),
              consent: t('plus.waitlistConsent'),
              done: t('plus.waitlistDone'),
              already: t('plus.waitlistAlready'),
            }}
          />
        </div>
      </div>
    </>
  )
}
