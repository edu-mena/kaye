import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { InstitutionLogo } from '../../components/InstitutionLogo'
import { ScoreRing } from '../../components/ScoreRing'
import { ButtonLink } from '../../components/ui/Button'
import { Chip } from '../../components/ui/Chip'
import type { Career } from '../../data/types'
import { stepsServedBy } from '../../domain/education'
import { formatKz } from '../../domain/format'
import { recognitionBody, type ScoredProgram } from '../../domain/ranking'
import { useDuration, useRatingLabel } from '../../lib/useFormat'
import { CompareButton, ScoreBreakdown } from './ProgramCard'

const EYEBROW = 'mb-4 text-sm font-semibold text-night'

type ProgramSummaryProps = { item: ScoredProgram; career: Career; rank: number }

/**
 * A course in short, for the career's "Onde estudar" popup: a dark header with the institution,
 * the rank and the score ring; then the offer, the path step it serves and how the score adds up.
 * The fuller institution page comes with Academias.
 */
export function ProgramSummary({ item, career, rank }: ProgramSummaryProps) {
  const { t } = useTranslation()
  const duration = useDuration()
  const ratingLabel = useRatingLabel()
  const { program, score, criteria } = item
  const { institution } = program
  const served = stepsServedBy(career, program.level)
  const perMonth =
    program.totalCost !== null && program.durationMonths > 0
      ? program.totalCost / program.durationMonths
      : null

  const body = recognitionBody(program.level)

  const facts: { label: string; value: string; note?: string }[] = [
    { label: t('training.level'), value: t(`training.${program.level}`) },
    {
      label: t('training.duration'),
      value: duration({ min: program.durationMonths, max: program.durationMonths }),
    },
    {
      label: t('training.cost'),
      value: program.totalCost === null ? '—' : formatKz(program.totalCost),
      note: perMonth === null ? undefined : t('training.perMonth', { value: formatKz(perMonth) }),
    },
    {
      label: t('training.schedule'),
      value: program.schedule.map((slot) => t(`training.${slot}`)).join(' · '),
    },
    { label: t('training.rating'), value: ratingLabel(program.rating) },
  ]

  return (
    <div className="space-y-8">
      <section aria-labelledby="program-institution" className="rounded-2xl bg-coal p-6 text-white">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-xs font-light text-white/70">
              {t('career.studyRank', { rank, career: career.name })}
            </p>
            <h3 id="program-institution" className="sr-only">
              {t('training.institution')}
            </h3>
            <div className="mt-4 flex items-center gap-4">
              <InstitutionLogo institution={institution} />
              <div className="min-w-0">
                <p className="text-lg font-semibold">{institution.name}</p>
                <p className="mt-1 text-xs font-light text-white/70">
                  {t(`training.type_${institution.type}`)} ·{' '}
                  {t(`training.ownership_${institution.ownership}`)} · {institution.province}
                </p>
              </div>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm font-normal text-white">
              <Icon name={program.recognized ? 'check' : 'info'} className="size-4 shrink-0 text-gold" />
              {program.recognized ? (
                <span>
                  {t('training.recognizedBy')}{' '}
                  <abbr title={body.name} className="no-underline">
                    {body.code}
                  </abbr>
                </span>
              ) : (
                t('training.recognizedNo')
              )}
            </p>
          </div>
          {program.recognized && <ScoreRing score={score} size="lg" tone="dark" />}
        </div>
      </section>

      {/* A spec sheet: quiet label on the left, the value on the right, one line each. */}
      <dl className="divide-y divide-line rounded-2xl border border-line">
        {facts.map((fact) => (
          <div key={fact.label} className="flex items-baseline justify-between gap-4 px-4 py-3">
            <dt className="text-sm font-light text-muted">{fact.label}</dt>
            <dd className="text-right text-sm font-semibold text-night">
              {fact.value}
              {fact.note && <span className="mt-1 block text-xs font-light text-muted">{fact.note}</span>}
            </dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="program-path">
        <h3 id="program-path" className={EYEBROW}>
          {t('career.studyFitsTitle', { career: career.name })}
        </h3>
        {served.length === 0 ? (
          <p className="text-sm font-light text-copy">{t('career.studyNoStep')}</p>
        ) : (
          <ol className="space-y-4">
            {served.map(({ pathway, step }) => (
              <li
                key={`${pathway.id}-${step.title}`}
                className="flex items-start gap-4 rounded-2xl border border-line p-4 text-sm font-light text-night"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-night text-white">
                  <Icon name="path" className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  {t('career.studyFits', { step: step.title, pathway: pathway.name.toLowerCase() })}
                  <span className="mt-2 block">
                    <Chip tone={step.need === 'essencial' ? 'night' : 'neutral'}>
                      {t(`career.need_${step.need}`)}
                    </Chip>
                  </span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {program.recognized && (
        <section aria-labelledby="program-score">
          <h3 id="program-score" className={EYEBROW}>
            {t('career.studyScoreHow', { score })}
          </h3>
          <ScoreBreakdown criteria={criteria} />
        </section>
      )}

      <div className="flex flex-wrap gap-2 border-t border-line pt-6">
        <CompareButton programId={program.id} />
        <ButtonLink to={`/cursos?carreira=${career.slug}`} variant="ghost" size="sm">
          {t('career.studyAll')}
          <Icon name="arrowRight" className="size-4" />
        </ButtonLink>
      </div>
    </div>
  )
}
