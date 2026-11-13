import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { CheckboxField } from '../../components/ui/Field'
import { useCompanies, useCourses, useScholarships, useTestimonials } from '../../data/queries'
import { GROUP_AREAS, type Career } from '../../data/types'
import { paybackMonths, studyCost } from '../../domain/fees'
import { careerFit } from '../../domain/fit'
import { formatKz } from '../../domain/format'
import { scholarshipsFor, todayIso } from '../../domain/scholarships'
import { useDuration } from '../../lib/useFormat'
import { useRiasecProfile } from '../../state/useRiasecProfile'
import { useUser } from '../../state/userStore'
import { shareFamilySheet, type FamilySection, type FamilySheet } from './familySheet'

const unique = (items: string[]) => [...new Set(items.filter(Boolean))]

/** Gathers the sheet's content from what the career page already loads, in the app's language. */
function useFamilySheet(career: Career) {
  const { t, i18n } = useTranslation()
  const duration = useDuration()
  const user = useUser()
  const { profile: riasec } = useRiasecProfile()
  const { data: courses = [] } = useCourses()
  const { data: companies = [] } = useCompanies()
  const { data: scholarships = [] } = useScholarships()
  const { data: stories = [] } = useTestimonials(career.slug)
  const { market } = career
  const { t: k } = useTranslation('translation', { keyPrefix: 'familySheet' })

  const fit = riasec
    ? careerFit(career, { profile: riasec, education: user.profile?.education ?? null, skills: user.skills })
    : null

  const build = (withFit: boolean): FamilySheet => {
    const sources: string[] = []
    const offers = courses
      .filter((course) => course.careers.includes(career.slug))
      .flatMap((course) => course.offers)
    const cost = studyCost(offers)

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
        {
          label: career.salaryKind === 'entrada' ? k('salaryEntryState') : k('salaryEntry'),
          value: perMonth(entry),
        },
        ...(career.salaryKind === 'entrada' ? [] : [{ label: k('salaryMedian'), value: perMonth(median) }]),
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
    if (market.salary?.basis) sources.push(market.salary.basis)
    if (market.trendPct === null && market.demandNote) {
      numbers.paragraphs?.push(market.demandNote.text)
      sources.push(market.demandNote.source.label)
    }
    const payback = cost ? paybackMonths(cost, career.salaryMedian) : null
    if (payback !== null) numbers.paragraphs?.push(k('payback', { count: payback }))
    if (cost) numbers.paragraphs?.push(k('estimateNote'))

    // 3. Is it serious? Recognition, institutions, employers.
    const decrees = unique(
      offers.flatMap(({ offer }) => (offer.recognition ? [offer.recognition.label] : [])),
    )
    const institutions = unique(
      offers
        .toSorted((a, b) => Number(Boolean(b.offer.recognition)) - Number(Boolean(a.offer.recognition)))
        .map(({ academy }) => academy.name),
    ).slice(0, 3)
    const employers = companies
      .filter((company) => company.careers.includes(career.slug))
      .slice(0, 3)
      .map((company) => company.name)
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
    const publicPlaces = unique(
      offers.filter(({ academy }) => academy.ownership === 'publica').map(({ academy }) => academy.name),
    ).slice(0, 3)
    const grants = scholarshipsFor(scholarships, { areas: [GROUP_AREAS[career.group]] }, todayIso()).slice(
      0,
      3,
    )
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
    const firstName = user.profile?.name.trim().split(/\s+/)[0] ?? ''
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

/** "Mostrar à família": a one-page PDF to convince whoever pays the fees (ADR 0006: built on the phone). */
export function FamilySheetButton({ career, className = '' }: { career: Career; className?: string }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [withFit, setWithFit] = useState(false)
  const [busy, setBusy] = useState(false)
  const { build, canIncludeFit } = useFamilySheet(career)

  const create = async () => {
    setBusy(true)
    try {
      await shareFamilySheet(build(canIncludeFit && withFit), career.slug)
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className={className}>
        <Icon name="users" className="size-4" />
        {t('familySheet.button')}
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t('familySheet.dialogTitle')}
        footer={
          <Button onClick={() => void create()} disabled={busy} className="w-full">
            <Icon name="document" className="size-4" />
            {busy ? t('familySheet.creating') : t('familySheet.create')}
          </Button>
        }
      >
        <p className="text-sm leading-relaxed font-light text-copy">{t('familySheet.dialogBody')}</p>
        {canIncludeFit && (
          <div className="mt-5">
            <CheckboxField
              label={t('familySheet.includeFit')}
              checked={withFit}
              onChange={(event) => setWithFit(event.target.checked)}
            />
          </div>
        )}
        <p className="mt-4 text-xs font-light text-muted">{t('familySheet.privacy')}</p>
      </Dialog>
    </>
  )
}
