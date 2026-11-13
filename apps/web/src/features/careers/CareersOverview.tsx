import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StatBlock, Subheading } from '../../components/DetailLayout'
import { Icon } from '../../components/icons'
import { Loading, RowsSkeleton } from '../../components/PageStates'
import { ButtonLink } from '../../components/ui/Button'
import { Segmented } from '../../components/ui/Segmented'
import { useCareerDetails } from '../../data/queries'
import type { CareerSummary } from '../../data/types'
import { formatKz } from '../../domain/format'
import { CareerMarket } from './CareerMarket'
import { FitPanel } from './FitPanel'

// The careers a course or an institution leads to, on its Mercado and Avaliação tabs.

const DEMAND_ORDER = ['alta', 'media', 'baixa'] as const

/** The market of each career, one at a time. */
export function CareersMarket({ slugs, intro, none }: { slugs: string[]; intro: string; none: string }) {
  const { t } = useTranslation()
  const { data: careers, isPending } = useCareerDetails(slugs)
  const [slug, setSlug] = useState<string | null>(null)
  const career = careers.find((item) => item.slug === slug) ?? careers[0]
  if (isPending)
    return (
      <Loading>
        <RowsSkeleton />
      </Loading>
    )
  if (!career) return <p className="text-sm font-light text-copy">{none}</p>
  return (
    <>
      <p className="mb-5 max-w-3xl text-sm font-light text-copy">{intro}</p>
      {careers.length > 1 && (
        <div className="mb-8">
          <Segmented
            label={t('course.marketPick')}
            value={career.slug}
            onChange={(value) => value && setSlug(value)}
            options={careers.map((item) => ({ value: item.slug, label: item.name }))}
          />
        </div>
      )}
      <CareerMarket career={career} />
      <ButtonLink to={`/carreiras/${career.slug}`} variant="ghost" className="mt-6 -ml-3">
        {t('course.seeCareer', { name: career.name })}
        <Icon name="arrowRight" className="size-4" />
      </ButtonLink>
    </>
  )
}

type CareersEvaluationProps = {
  careers: CareerSummary[]
  /** The first figure: how many institutions teach the course, or how many courses the institution has. */
  count: { label: string; value: number }
  /** How many plans of studies are published (none for a company). */
  plans?: number
  note: string
  fitSubtitle: string
  /** Between the figures and the fit (an institution's reviews). */
  children?: ReactNode
}

/** What the data says (demand, best median salary), then how the careers fit the user. */
export function CareersEvaluation({
  careers,
  count,
  plans,
  note,
  fitSubtitle,
  children,
}: CareersEvaluationProps) {
  const { t } = useTranslation()
  const { data: detailed, isPending } = useCareerDetails(careers.map((career) => career.slug))
  const demand = DEMAND_ORDER.find((level) => careers.some((career) => career.demand === level))
  const salaries = careers.flatMap((career) => (career.salaryMedian === null ? [] : [career.salaryMedian]))
  return (
    <>
      <Subheading>{t('course.evaluationTitle')}</Subheading>
      <StatBlock
        items={[
          { label: count.label, value: String(count.value) },
          ...(plans === undefined ? [] : [{ label: t('course.evalPlans'), value: String(plans) }]),
          { label: t('course.evalDemand'), value: demand ? t(`demand.${demand}`) : '—' },
          {
            label: t('course.evalSalary'),
            value: salaries.length > 0 ? formatKz(Math.max(...salaries)) : '—',
          },
        ]}
      />
      <p className="mt-3 text-xs font-light text-muted">{note}</p>
      {children}
      <div className="mt-10">
        {isPending ? (
          <Loading>
            <RowsSkeleton />
          </Loading>
        ) : detailed.length > 0 ? (
          <FitPanel careers={detailed} subtitle={fitSubtitle} />
        ) : (
          <p className="text-sm font-light text-copy">{t('course.marketNone')}</p>
        )}
      </div>
    </>
  )
}
