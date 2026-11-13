import { useTranslation } from 'react-i18next'
import { ExternalLink } from '../../components/DetailParts'
import { StatBlock, Subheading } from '../../components/DetailLayout'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import type { Admission } from '../../data/types'
import { useAdmissionDates } from './useAdmissionDates'
import { admissionStatus, type AdmissionStatus } from '../../domain/admissions'
import { formatKz } from '../../domain/format'
import { todayIso } from '../../domain/scholarships'

const TONES = {
  abertas: 'success',
  fecham_em: 'coral',
  por_abrir: 'gold',
  fechadas: 'neutral',
  por_anunciar: 'neutral',
} as const satisfies Record<AdmissionStatus['kind'], string>

/** "Abertas", "Fecham em 5 dias", "Por abrir", "Fechadas" or "Por anunciar", in its colour. */
export function AdmissionStatusChip({ admission }: { admission: Admission }) {
  const { t } = useTranslation()
  const status = admissionStatus(admission, todayIso())
  return (
    <Chip tone={TONES[status.kind]}>
      {status.kind === 'fecham_em'
        ? t('admission.status_fecham_em', { count: status.days })
        : t(`admission.status_${status.kind}`)}
    </Chip>
  )
}

/**
 * How to get in, in one record: whether applications are open, their days and the exam's, the subjects, the
 * vacancies, the last admitted grade, the fee, what to bring, the official site and the source.
 */
export function AdmissionBlock({ admission, title }: { admission: Admission; title: string }) {
  const { t } = useTranslation()
  const dates = useAdmissionDates()(admission)
  const facts = [
    { label: t('admission.registration'), value: dates.registration },
    { label: t('admission.exams'), value: dates.exams },
    ...(admission.vacancies === undefined
      ? []
      : [{ label: t('admission.vacancies'), value: admission.vacancies.toLocaleString() }]),
    ...(admission.fee === undefined ? [] : [{ label: t('admission.fee'), value: formatKz(admission.fee) }]),
    ...(admission.minGrade === undefined
      ? []
      : [
          {
            label: t('admission.minGrade', { year: admission.minGrade.year }),
            value: `${admission.minGrade.value} / 20`,
          },
        ]),
  ]
  return (
    <Card as="article" aria-label={title}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base leading-snug font-semibold text-night">{title}</h3>
        <AdmissionStatusChip admission={admission} />
      </div>
      <p className="mt-1 text-xs font-light text-muted">{t('admission.year', { year: admission.year })}</p>
      <div className="mt-4">
        <StatBlock items={facts} />
      </div>
      {admission.subjects.length > 0 && (
        <div className="mt-6">
          <Subheading>{t('admission.subjects')}</Subheading>
          <ExamSubjects subjects={admission.subjects} />
        </div>
      )}
      {admission.requirements.length > 0 && (
        <div className="mt-6">
          <Subheading>{t('admission.requirements')}</Subheading>
          <ul className="list-disc space-y-1 pl-5 text-sm font-light text-copy">
            {admission.requirements.map((requirement) => (
              <li key={requirement}>{requirement}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-sm font-light text-copy">
        <ExternalLink href={admission.url}>{t('admission.official')}</ExternalLink>
        {admission.sources.map((source) => (
          <ExternalLink key={source.url} href={source.url}>
            {source.label}
          </ExternalLink>
        ))}
      </p>
    </Card>
  )
}

/** The exam's subjects, as chips. */
export function ExamSubjects({ subjects }: { subjects: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {subjects.map((subject) => (
        <li key={subject}>
          <Chip>{subject}</Chip>
        </li>
      ))}
    </ul>
  )
}
