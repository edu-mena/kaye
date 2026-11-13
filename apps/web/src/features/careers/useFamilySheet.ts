import { useTranslation } from 'react-i18next'
import { useCompanies, useCourses, useScholarships, useTestimonials } from '../../data/queries'
import type { Career } from '../../data/types'
import { paybackMonths } from '../../domain/fees'
import type { Fit } from '../../domain/fit'
import { formatKz } from '../../domain/format'
import { useDuration } from '../../lib/useFormat'
import { familyFacts } from './familyFacts'
import type { FamilySection, FamilySheet } from './familySheet'

const unique = (items: string[]) => [...new Set(items.filter(Boolean))]

export type FamilySheetOptions = {
  /** Only what the person chose to share. */
  firstName?: string
  /** False for minors: the family never sees salaries about them. */
  showSalary: boolean
  /** The test's reasons; null when there is no test (or on /familia, where only the code travels). */
  fit: Fit | null
}

/** Gathers the sheet's content from the catalogue, in the app's language; nothing from whoever opens it. */
export function useFamilySheet(career: Career, { firstName = '', showSalary, fit }: FamilySheetOptions) {
  const { t, i18n } = useTranslation()
  const duration = useDuration()
  const { data: courses = [] } = useCourses()
  const { data: companies = [] } = useCompanies()
  const { data: scholarships = [] } = useScholarships()
  const { data: stories = [] } = useTestimonials(career.slug)
  const { market } = career
  const { t: k } = useTranslation('translation', { keyPrefix: 'familySheet' })

  const build = (withFit: boolean): FamilySheet => {
    const sources: string[] = []
    const { cost, decrees, institutions, publicPlaces, employers, grants } = familyFacts(career, {
      courses,
      companies,
      scholarships,
    })

    // 1. The profession in three sentences.
    const what: FamilySection = {
      title: k('whatTitle'),
      paragraphs: [
        career.summary,
        market.hiringSectors.length > 0
          ? k('where', { list: market.hiringSectors.slice(0, 4).join(', ') })
          : '',
        career.dayToDay[0] ? k('day', { text: career.dayToDay[0].replace(/([^.!?])$/, '$1.') }) : '',
      ].filter(Boolean),
    }

    // 2. The numbers parents ask about; "sem dados" rather than a guess.
    const entry =
      career.salaryKind === 'entrada' ? career.salaryMedian : (market.salaryByStage[0]?.median ?? null)
    const median = career.salaryKind === 'entrada' ? null : (market.salary?.p50 ?? career.salaryMedian)
    const perMonth = (value: number | null) =>
      value === null ? k('noData') : t('cost.perMonth', { value: formatKz(value) })
    const lastMonth = market.postingsByMonth.at(-1)?.count
    const numbers: FamilySection = {
      title: k('numbersTitle'),
      facts: [
        ...(showSalary
          ? [
              {
                label: career.salaryKind === 'entrada' ? k('salaryEntryState') : k('salaryEntry'),
                value: perMonth(entry),
              },
              ...(career.salaryKind === 'entrada'
                ? []
                : [{ label: k('salaryMedian'), value: perMonth(median) }]),
            ]
          : []),
        {
          label: k('demand'),
          value:
            market.trendPct !== null && lastMonth !== undefined
              ? k('postings', { count: lastMonth })
              : t(`demand.${career.demand}`),
        },
        { label: k('costPublic'), value: cost?.free ? k('free') : k('noData') },
        {
          label: k('costPrivate'),
          value:
            cost && cost.max > 0
              ? t('cost.range', { min: formatKz(cost.min), max: formatKz(cost.max) })
              : k('noData'),
        },
        { label: k('duration'), value: cost ? duration(cost.months) : k('noData') },
      ],
      paragraphs: [],
    }
    if (showSalary && market.salary?.basis) sources.push(market.salary.basis)
    if (market.trendPct === null && market.demandNote) {
      numbers.paragraphs?.push(market.demandNote.text)
      sources.push(market.demandNote.source.label)
    }
    const payback = cost && showSalary ? paybackMonths(cost, career.salaryMedian) : null
    if (payback !== null) numbers.paragraphs?.push(k('payback', { count: payback }))
    if (cost) numbers.paragraphs?.push(k('estimateNote'))

    // 3. Is it serious? Recognition, institutions, employers.
    const serious: FamilySection = {
      title: k('seriousTitle'),
      bullets: [
        decrees.length > 0 ? k('recognised', { list: decrees.slice(0, 2).join('; ') }) : '',
        institutions.length > 0 ? k('institutions', { list: institutions.join(', ') }) : '',
        employers.length > 0
          ? k('employers', { list: employers.join(', ') })
          : market.hiringSectors.length > 0
            ? k('sectors', { list: market.hiringSectors.slice(0, 3).join(', ') })
            : '',
      ].filter(Boolean),
    }
    sources.push(...decrees.slice(0, 2))

    // 4. How to pay: free public teaching and up to three scholarships.
    const pay: FamilySection = {
      title: k('payTitle'),
      bullets: [
        publicPlaces.length > 0 ? k('publicFree', { list: publicPlaces.join(', ') }) : '',
        ...grants.map((grant) => k('scholarship', { name: grant.name, provider: grant.provider })),
      ].filter(Boolean),
    }
    if (pay.bullets?.length === 0) pay.paragraphs = [k('payNone')]
    sources.push(...grants.flatMap((grant) => grant.sources.slice(0, 1).map((source) => source.label)))

    // 5. A real testimony only: the demo examples are not real people.
    const story = stories.find((item) => !item.example)
    const testimony: FamilySection | null = story
      ? {
          title: k('storyTitle'),
          paragraphs: [`“${story.path}”`, [story.name, story.role, story.place].filter(Boolean).join(' · ')],
        }
      : null
    if (story?.source) sources.push(story.source.label)

    // 6. Optional, off by default: the test's reasons, with the first name only.
    const reasons: FamilySection | null =
      withFit && fit?.interests
        ? {
            title: k('fitTitle'),
            paragraphs: [firstName ? k('fitIntroNamed', { name: firstName }) : k('fitIntro')],
            bullets: [
              k(`fitInterests.${fit.interests.level}`, {
                dimension: t(`riasec.${fit.interests.strength}`),
                body: t(`riasec.${fit.interests.strength}Body`).toLowerCase(),
              }),
              fit.education ? k('fitEducation', { count: fit.education.steps.length }) : '',
              // A reason, not a gap: shown only once some essential skills are there.
              fit.skills.have > 0 ? k('fitSkills', { have: fit.skills.have, total: fit.skills.total }) : '',
            ].filter(Boolean),
          }
        : null

    return {
      kicker: k('kicker'),
      name: career.name,
      sections: [what, numbers, serious, pay, testimony, reasons].filter(
        (section): section is FamilySection => section !== null,
      ),
      footer: {
        madeWith: k('madeWith'),
        date: new Date().toLocaleDateString(i18n.language, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        sourcesLabel: k('sources'),
        sources: unique([...sources, k('sourceKaye')]),
        url: `${window.location.origin}/carreiras/${career.slug}`,
        scan: k('scan'),
      },
    }
  }

  return { build, canIncludeFit: Boolean(fit?.interests) }
}
