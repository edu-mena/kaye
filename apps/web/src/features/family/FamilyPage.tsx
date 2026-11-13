import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { PublicShell } from '../../components/PublicShell'
import { Icon } from '../../components/icons'
import { ScoreRing } from '../../components/ScoreRing'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { Hexagon } from '../../components/ui/Hexagon'
import { useCareer, useCompanies, useCourses, usePrograms, useScholarships } from '../../data/queries'
import type { Career, RiasecKey } from '../../data/types'
import { quickestPathway } from '../../domain/education'
import { formatKz } from '../../domain/format'
import { rankPrograms, scorePrograms } from '../../domain/ranking'
import { followLocale } from '../../lib/i18n'
import { useDuration } from '../../lib/useFormat'
import { familyFacts } from '../careers/familyFacts'
import { FamilyPdfButton } from '../careers/FamilySheetButton'
import { decodeFamilyLink, type FamilyLink } from './familyLink'

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1)

/** "O que o teste diz": one plain sentence per letter of the code. */
function TestSummary({ link }: { link: FamilyLink }) {
  const { t } = useTranslation()
  const keys = [...link.code] as RiasecKey[]
  return (
    <header className="rise">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">{t('family.kicker')}</p>
      <h1 className="mt-2 text-3xl leading-tight font-extrabold text-night sm:text-4xl">
        {link.firstName ? t('family.titleNamed', { name: link.firstName }) : t('family.title')}
      </h1>
      {keys.length > 0 ? (
        <div className="mt-6 flex flex-col items-start gap-5 sm:flex-row">
          <Hexagon size="lg">{link.code}</Hexagon>
          <div className="space-y-2 text-base leading-relaxed font-light text-copy">
            <p>{t('family.codeIntro', { code: link.code })}</p>
            {keys.map((key, index) => (
              <p key={key}>
                {t(`family.line${index as 0 | 1 | 2}`, {
                  dimension: t(`riasec.${key}`),
                  body: lowerFirst(t(`riasec.${key}Body`)),
                })}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-base font-light text-copy">{t('family.noTest')}</p>
      )}
    </header>
  )
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-light text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-night">{children}</dd>
    </div>
  )
}

/** One career, in the words parents use: what it is, what it costs, if it is serious and how to pay. */
function CareerForFamily({ career, adult }: { career: Career; adult: boolean }) {
  const { t } = useTranslation()
  const duration = useDuration()
  const { data: courses = [] } = useCourses()
  const { data: companies = [] } = useCompanies()
  const { data: scholarships = [] } = useScholarships()
  const { data: programs = [] } = usePrograms()
  const facts = familyFacts(career, { courses, companies, scholarships })
  const quickest = quickestPathway(career, null)
  const where = rankPrograms(
    scorePrograms(programs).filter((item) => item.program.careers.includes(career.slug)),
    'score',
  ).ranked.slice(0, 3)
  const lastMonth = career.market.postingsByMonth.at(-1)?.count
  const { cost } = facts
  const total = quickest?.pathway.totalCost ?? (cost && cost.max > 0 ? cost : null)

  return (
    <Card as="article" className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-extrabold text-night">{career.name}</h2>
        <p className="mt-2 text-sm leading-relaxed font-light text-copy">{career.summary}</p>
        {career.dayToDay[0] && (
          <p className="mt-2 text-sm leading-relaxed font-light text-copy">
            {t('familySheet.day', { text: career.dayToDay[0].replace(/([^.!?])$/, '$1.') })}
          </p>
        )}
      </div>

      <dl className="grid gap-4 sm:grid-cols-3">
        <Fact label={t('family.demand')}>
          {career.market.trendPct !== null && lastMonth !== undefined
            ? t('familySheet.postings', { count: lastMonth })
            : t(`demand.${career.demand}`)}
        </Fact>
        <Fact label={t('family.totalCost')}>
          {total
            ? t('cost.range', { min: formatKz(total.min), max: formatKz(total.max) })
            : cost?.free
              ? t('familySheet.free')
              : t('familySheet.noData')}
        </Fact>
        {adult && career.salaryMedian !== null ? (
          <Fact
            label={t(
              career.salaryKind === 'entrada' ? 'familySheet.salaryEntryState' : 'familySheet.salaryMedian',
            )}
          >
            {t('cost.perMonth', { value: formatKz(career.salaryMedian) })}
          </Fact>
        ) : (
          <Fact label={t('familySheet.duration')}>
            {quickest ? duration(quickest.months) : t('familySheet.noData')}
          </Fact>
        )}
      </dl>
      {cost?.estimated && (
        <p className="-mt-3 text-xs font-light text-muted">{t('familySheet.estimateNote')}</p>
      )}

      {quickest && (
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-night">
            <Icon name="path" className="size-4 text-blue" />
            {t('family.shortest', { name: quickest.pathway.name, time: duration(quickest.months) })}
          </h3>
          <ol className="mt-2 space-y-1 text-sm font-light text-copy">
            {quickest.steps.map((step, index) => (
              <li key={step.title} className="flex gap-2">
                <span className="font-display font-bold text-night">{index + 1}.</span>
                {step.title}
              </li>
            ))}
          </ol>
        </section>
      )}

      <section>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-night">
          <Icon name="cap" className="size-4 text-blue" />
          {t('family.whereTitle')}
        </h3>
        {where.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {where.map(({ program, score }) => (
              <li key={program.id} className="flex items-center gap-3">
                <ScoreRing score={score} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-night">{program.name}</span>
                  <span className="block text-xs font-light text-muted">
                    {program.institution.name} · {t(`training.${program.level}`)}
                  </span>
                </span>
                {program.recognized && <Chip tone="success">{t('family.recognised')}</Chip>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm font-light text-copy">
            {facts.institutions.length > 0
              ? t('familySheet.institutions', { list: facts.institutions.join(', ') })
              : t('familySheet.noData')}
          </p>
        )}
        {facts.decrees.length > 0 && (
          <p className="mt-3 text-xs font-light text-copy">
            {t('familySheet.recognised', { list: facts.decrees.slice(0, 2).join('; ') })}
          </p>
        )}
      </section>

      <section>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-night">
          <Icon name="wallet" className="size-4 text-blue" />
          {t('familySheet.payTitle')}
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-light text-copy">
          {facts.publicPlaces.length > 0 && (
            <li>{t('familySheet.publicFree', { list: facts.publicPlaces.join(', ') })}</li>
          )}
          {facts.grants.map((grant) => (
            <li key={grant.id}>
              {t('familySheet.scholarship', { name: grant.name, provider: grant.provider })}
            </li>
          ))}
          {facts.publicPlaces.length === 0 && facts.grants.length === 0 && (
            <li>{t('familySheet.payNone')}</li>
          )}
        </ul>
      </section>
    </Card>
  )
}

function CareerBlock({ slug, adult, firstName }: { slug: string; adult: boolean; firstName?: string }) {
  const { data: career, isPending } = useCareer(slug)
  if (isPending) return <Card className="h-64 animate-pulse" aria-hidden="true" />
  if (!career) return null
  return (
    <div className="space-y-3">
      <CareerForFamily career={career} adult={adult} />
      <FamilyPdfButton
        career={career}
        options={{ firstName, showSalary: adult, fit: null }}
        className="w-full sm:w-auto"
      />
    </div>
  )
}

function InvalidLink() {
  const { t } = useTranslation()
  return (
    <PublicShell>
      <div className="pt-16 text-center">
        <h1 className="text-2xl font-extrabold text-night">{t('family.invalidTitle')}</h1>
        <p className="mt-2 text-sm font-light text-copy">{t('family.invalidBody')}</p>
        <ButtonLink to="/" className="mt-6">
          {t('family.meetKaye')}
          <Icon name="arrowRight" className="size-4" />
        </ButtonLink>
      </div>
    </PublicShell>
  )
}

/** /familia#…: what the young person sent their family. Public; everything comes from the link and the catalogue. */
export default function FamilyPage() {
  const { t } = useTranslation()
  const { hash } = useLocation()
  const link = useMemo(() => decodeFamilyLink(hash), [hash])

  useEffect(() => {
    if (link) void followLocale(link.lang)
  }, [link])

  if (!link) return <InvalidLink />
  const adult = link.adult === true

  return (
    <PublicShell wide>
      <div className="space-y-10">
        <TestSummary link={link} />

        <section aria-labelledby="family-careers" className="space-y-6">
          <h2 id="family-careers" className="text-xl font-extrabold text-night">
            {t('family.careersTitle', { count: link.careers.length })}
          </h2>
          {link.careers.map((slug) => (
            <CareerBlock key={slug} slug={slug} adult={adult} firstName={link.firstName} />
          ))}
        </section>

        <Card tone="coal" as="section" className="p-6" aria-labelledby="family-help">
          <h2 id="family-help" className="text-lg font-extrabold">
            {t('family.helpTitle')}
          </h2>
          <ol className="mt-3 space-y-2 text-sm font-light text-white/85">
            {(['help1', 'help2', 'help3'] as const).map((key, index) => (
              <li key={key} className="flex gap-3">
                <span className="font-display font-bold text-gold">{index + 1}</span>
                {t(`family.${key}`)}
              </li>
            ))}
          </ol>
        </Card>

        <p className="text-xs font-light text-muted">{t('family.privacyNote')}</p>
        <ButtonLink to="/" variant="secondary">
          {t('family.meetKaye')}
          <Icon name="arrowRight" className="size-4" />
        </ButtonLink>
      </div>
    </PublicShell>
  )
}
