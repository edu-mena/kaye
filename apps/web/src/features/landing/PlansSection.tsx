import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { formatKz } from '../../domain/format'
import { PLUS_PRICE_KZ } from '../../lib/plan'

// Free and Plus side by side (docs/decisoes/0025). "included: false" is shown, locked, so nobody finds out late.
const FREE_ROWS = [
  { id: 'discover', included: true },
  { id: 'test', included: true },
  { id: 'daily', included: true },
  { id: 'kurso', included: true },
  { id: 'deadlines', included: true },
  { id: 'certificate', included: false },
  { id: 'alerts', included: false },
  { id: 'myPlan', included: false },
] as const

const PLUS_ROWS = [
  { id: 'allFree' },
  { id: 'kursoMore' },
  { id: 'certificate' },
  { id: 'alerts' },
  { id: 'myPlan' },
  { id: 'cvPdf' },
  { id: 'training' },
] as const

/** What the person gets for free and what the Plus adds: two cards, the way price pages usually look. */
export function PlansSection({ signIn }: { signIn: string }) {
  const { t } = useTranslation()

  return (
    <section aria-labelledby="plans-title" className="mx-auto max-w-5xl px-4 py-20 lg:py-28">
      <h2
        id="plans-title"
        className="mx-auto max-w-2xl text-center text-3xl leading-tight font-extrabold text-night sm:text-4xl"
      >
        {t('landing.plansTitle')}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-lg font-light text-copy">
        {t('landing.plansText')}
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2 md:items-stretch">
        <Card as="article" aria-labelledby="plan-free" className="flex flex-col p-6 sm:p-8">
          <h3 id="plan-free" className="text-xl font-extrabold text-night">
            {t('landing.planFreeName')}
          </h3>
          <p className="mt-3 font-display text-4xl font-extrabold text-night">
            0 Kz
            <span className="ml-1 text-base font-light text-muted">{t('landing.planForever')}</span>
          </p>
          <p className="mt-2 text-sm font-light text-copy">{t('landing.planFreeFor')}</p>
          <ul className="mt-6 flex-1 space-y-3">
            {FREE_ROWS.map((row) => (
              <li
                key={row.id}
                className={`flex items-start gap-3 text-sm ${row.included ? 'font-normal text-night' : 'font-light text-muted'}`}
              >
                <Icon
                  name={row.included ? 'check' : 'lock'}
                  className={`mt-0.5 size-4 shrink-0 ${row.included ? 'text-blue' : 'text-muted'}`}
                />
                <span>
                  {t(`landing.plan_${row.id}`)}
                  {!row.included && <span className="sr-only"> ({t('landing.planNotIncluded')})</span>}
                </span>
              </li>
            ))}
          </ul>
          <ButtonLink to={signIn} size="lg" variant="secondary" className="mt-8 w-full">
            {t('landing.planFreeCta')}
          </ButtonLink>
        </Card>

        <Card as="article" aria-labelledby="plan-plus" tone="coal" className="flex flex-col p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <h3 id="plan-plus" className="text-xl font-extrabold">
              {t('landing.planPlusName')}
            </h3>
            <span className="rounded-full border border-gold/40 px-3 py-1 text-xs font-semibold whitespace-nowrap text-gold">
              {t('landing.planSoon')}
            </span>
          </div>
          <p className="mt-3 font-display text-4xl font-extrabold">
            {formatKz(PLUS_PRICE_KZ)}
            <span className="ml-1 text-base font-light text-white/70">{t('landing.planPerMonth')}</span>
          </p>
          <p className="mt-2 text-sm font-light text-white/80">{t('landing.planPlusFor')}</p>
          <ul className="mt-6 flex-1 space-y-3">
            {PLUS_ROWS.map((row) => (
              <li key={row.id} className="flex items-start gap-3 text-sm font-normal">
                <Icon name="check" className="mt-0.5 size-4 shrink-0 text-gold" />
                {t(`landing.plan_${row.id}`)}
              </li>
            ))}
          </ul>
          <ButtonLink to="#lista-de-espera" size="lg" variant="onDark" className="mt-8 w-full">
            {t('landing.planPlusCta')}
          </ButtonLink>
        </Card>
      </div>

      <p className="mx-auto mt-6 max-w-2xl text-center text-sm font-light text-muted">
        {t('landing.planNote')}
      </p>
    </section>
  )
}
