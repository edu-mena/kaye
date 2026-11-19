import { useTranslation } from 'react-i18next'
import { ExternalLink } from '../../components/DetailParts'
import { Subheading } from '../../components/DetailLayout'
import { Icon } from '../../components/icons'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { useFreeCourses } from '../../data/queries'
import type { FreeCourse } from '../../data/types'

const MAX = 4

/** Portuguese first, then a free certificate, then the cheapest, then catalogue order. */
function rank(course: FreeCourse): number {
  return (course.languages.includes('pt') ? 0 : 2) + (course.certificate === 'gratis' ? 0 : 1)
}

const byRank = (a: FreeCourse, b: FreeCourse) =>
  rank(a) - rank(b) || (a.priceUsd ?? Infinity) - (b.priceUsd ?? Infinity)

/**
 * "Começa já, sem pagar": up to four free online courses for the career, with what each gives at the end; then
 * up to four cheap paid certifications (official exams and well-rated courses), with their price.
 */
export function FreeCourses({ careerSlug }: { careerSlug: string }) {
  const { t } = useTranslation()
  const { data = [] } = useFreeCourses(careerSlug)
  const free = data
    .filter((course) => course.certificate !== 'pago')
    .toSorted(byRank)
    .slice(0, MAX)
  const paid = data
    .filter((course) => course.certificate === 'pago')
    .toSorted(byRank)
    .slice(0, MAX)

  return (
    <div className="space-y-10">
      {free.length > 0 && (
        <CourseList title={t('freeCourses.title')} note={t('freeCourses.note')} courses={free} />
      )}
      {paid.length > 0 && (
        <CourseList title={t('freeCourses.paidTitle')} note={t('freeCourses.paidNote')} courses={paid} />
      )}
    </div>
  )
}

function CourseList({ title, note, courses }: { title: string; note: string; courses: FreeCourse[] }) {
  return (
    <div>
      <Subheading>{title}</Subheading>
      <ul className="grid gap-3 sm:grid-cols-2">
        {courses.map((course) => (
          <li key={course.id}>
            <CourseCard course={course} />
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs font-light text-muted">{note}</p>
    </div>
  )
}

function CourseCard({ course }: { course: FreeCourse }) {
  const { t } = useTranslation()
  const price =
    course.certificate === 'pago' &&
    (course.priceUsd === undefined
      ? t('freeCourses.priceVaries')
      : t('freeCourses.price', { value: course.priceUsd }))
  return (
    <Card as="article" className="flex h-full flex-col">
      <div className="flex flex-wrap gap-1.5">
        {course.languages.map((language) => (
          <Chip key={language}>{t(`freeCourses.language.${language}`)}</Chip>
        ))}
        <Chip tone={course.certificate === 'gratis' ? 'success' : 'neutral'}>
          {price || t(`freeCourses.certificate.${course.certificate ?? 'unknown'}`)}
        </Chip>
      </div>
      <h3 className="mt-3 text-base leading-snug font-semibold text-night">{course.name}</h3>
      <p className="mt-1 text-xs font-light text-muted">{course.provider}</p>
      <ul className="mt-3 space-y-1 text-sm font-light text-copy">
        <li className="flex items-start gap-2">
          <Icon name="clock" className="mt-0.5 size-4 shrink-0 text-muted" />
          {course.hours === undefined
            ? t('freeCourses.hoursUnknown')
            : t('freeCourses.hours', { count: course.hours })}
          {' · '}
          {t(`freeCourses.level.${course.level}`)}
        </li>
        {course.credential && (
          <li className="flex items-start gap-2">
            <Icon name="award" className="mt-0.5 size-4 shrink-0 text-muted" />
            {course.credential}
          </li>
        )}
      </ul>
      <p className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 text-xs font-light text-muted">
        <ExternalLink href={course.url}>{t('freeCourses.open')}</ExternalLink>
        <span>
          {t('opportunity.source')}{' '}
          {course.sources.map((source, index) => (
            <span key={source.url}>
              {index > 0 && ', '}
              <ExternalLink href={source.url}>{source.label}</ExternalLink>
            </span>
          ))}
        </span>
      </p>
    </Card>
  )
}
