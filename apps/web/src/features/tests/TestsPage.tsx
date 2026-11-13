import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '../../components/icons'
import { PATH_LINE } from '../../components/PathMark'
import { ButtonLink } from '../../components/ui/Button'
import { Chip } from '../../components/ui/Chip'
import { PageHeader } from '../../components/ui/PageHeader'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { KURSOS } from '../../data/kursos'
import type { CourseTone } from '../../data/kursos/types'
import { AREA_COUNT, GENERAL_COUNT, INTERVIEWS_PER_DAY } from '../../domain/interviews'
import { EXAM_PASS, EXAM_SIZE } from '../../domain/kursos'
import { FULL_QUESTIONS, FULL_SECONDS, LEVELS, overall, SKILLS } from '../../domain/psychotech'
import { useUser } from '../../state/userStore'
import { useTestProgress } from '../../state/useTestProgress'
import { percent, TONE_CLASS } from '../kursos/shared'

type TestCardProps = {
  icon: IconName
  tone: CourseTone
  title: string
  body: string
  facts: string[]
  /** What the person already did here, when there is something. */
  status?: ReactNode
  action: { to: string; label: string }
  /** The tutorial points at this card (components/Tour.tsx). */
  tour?: string
  featured?: boolean
}

/** One test: its icon on a block of colour, what it is, real facts from the code and the next step. */
function TestCard({ icon, tone, title, body, facts, status, action, tour, featured = false }: TestCardProps) {
  const { t } = useTranslation()
  return (
    <article
      data-tour={tour}
      className={`relative flex h-full flex-col overflow-hidden rounded-card p-5 sm:p-6 ${
        featured
          ? 'bg-coal text-white shadow-lift sm:col-span-2'
          : 'border border-line bg-surface shadow-card'
      }`}
    >
      {featured && (
        <svg
          viewBox="0 0 240 112"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute right-4 bottom-4 hidden w-56 opacity-60 sm:block"
        >
          <path d={PATH_LINE} className="stroke-white/15" strokeWidth="10" strokeLinecap="round" />
          <path
            d={PATH_LINE}
            className="stroke-gold"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="2 9"
          />
          <circle cx="8" cy="104" r="7" className="fill-gold" />
        </svg>
      )}
      <div className="relative flex items-start gap-4">
        <span
          aria-hidden="true"
          className={`grid size-12 shrink-0 rotate-[-6deg] place-items-center rounded-2xl ${TONE_CLASS[tone]}`}
        >
          <Icon name={icon} className="size-6" />
        </span>
        <div className="min-w-0">
          {featured && (
            <p className="mb-1 text-xs font-semibold tracking-wide text-gold uppercase">
              {t('tests.featured')}
            </p>
          )}
          <h2 className={`text-lg leading-snug font-extrabold ${featured ? 'text-white' : 'text-night'}`}>
            {title}
          </h2>
        </div>
      </div>
      <p className={`relative mt-3 text-sm font-light ${featured ? 'max-w-md text-white/80' : 'text-copy'}`}>
        {body}
      </p>
      {facts.length > 0 && (
        <ul className="relative mt-4 flex flex-wrap gap-1.5">
          {facts.map((fact) => (
            <li key={fact}>
              <Chip tone={featured ? 'onDark' : 'neutral'}>{fact}</Chip>
            </li>
          ))}
        </ul>
      )}
      <div className="relative mt-auto pt-5">
        {status && (
          <div className={`mb-4 text-sm ${featured ? 'max-w-sm text-white' : 'text-night'}`}>{status}</div>
        )}
        <ButtonLink to={action.to} variant={featured ? 'onDark' : 'primary'}>
          {action.label}
          <Icon name="arrowRight" className="size-4" />
        </ButtonLink>
      </div>
    </article>
  )
}

/** A line of state with a tick: "Feito", "Melhor resultado: 80%". */
function Done({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 font-semibold">
      <Icon name="check" className="size-4 shrink-0 text-success" />
      {children}
    </p>
  )
}

/** Testes (/testes): every test in the app, with where the person stands in each. */
export default function TestsPage() {
  const { t } = useTranslation()
  const { psychotech, interviews, kursos } = useUser()
  const progress = useTestProgress()
  const { total, answered, stepsDone, stepsTotal } = progress

  const vocationalDone = progress.completed
  const part1 = vocationalDone ? (
    <Done>{t('tests.part1Done')}</Done>
  ) : answered > 0 && total > 0 ? (
    <>
      <p className="mb-1.5 text-xs font-light">{t('tests.answered', { done: answered, total })}</p>
      <ProgressBar value={answered / total} label={t('tests.answered', { done: answered, total })} />
    </>
  ) : undefined
  const part2 = progress.strengthsDone ? (
    <Done>{t('tests.part2Done')}</Done>
  ) : stepsDone > 0 || vocationalDone ? (
    <p className="mt-2 text-xs font-light">{t('tests.stepsDone', { done: stepsDone, total: stepsTotal })}</p>
  ) : undefined
  const vocationalStatus =
    part1 || part2 ? (
      <>
        {part1}
        {part2}
      </>
    ) : undefined

  const best = psychotech.length > 0 ? Math.max(...psychotech.map((entry) => overall(entry.scores))) : null
  const passed = KURSOS.filter((course) =>
    (kursos[course.id]?.exam ?? []).some((attempt) => attempt.score >= EXAM_PASS),
  ).length

  const vocational: TestCardProps = {
    icon: 'compass',
    tone: 'blue',
    title: t('tests.vocationalTitle'),
    body: t('tests.vocationalBody'),
    facts:
      total > 0
        ? [
            t('tests.questions', { count: total }),
            t('tests.steps', { count: stepsTotal }),
            t('tests.minutes', { count: progress.minutes1 + progress.minutes2 }),
          ]
        : [],
    status: vocationalStatus,
    action: !vocationalDone
      ? { to: '/teste', label: answered > 0 ? t('tests.continue') : t('tests.start') }
      : progress.strengthsDone
        ? { to: '/teste/resultado', label: t('tests.seeResult') }
        : { to: '/teste/valencias', label: t('tests.completeStrengths') },
    featured: !vocationalDone,
  }
  const others: TestCardProps[] = [
    {
      icon: 'brain',
      tone: 'gold',
      title: t('tests.psychotechTitle'),
      body: t('tests.psychotechBody'),
      facts: [
        t('tests.questions', { count: FULL_QUESTIONS }),
        t('tests.minutes', { count: FULL_SECONDS / 60 }),
        t('tests.skills', { count: SKILLS.length }),
        t('tests.levels', { count: LEVELS.length }),
      ],
      status:
        best === null ? undefined : (
          <>
            <Done>{t('tests.best', { value: percent(best) })}</Done>
            <p className="mt-1 text-xs font-light opacity-80">
              {t('tests.sessions', { count: psychotech.length })}
            </p>
          </>
        ),
      action: { to: '/treino', label: best === null ? t('tests.start') : t('tests.trainAgain') },
      tour: 'psychotech',
    },
    {
      icon: 'message',
      tone: 'coral',
      title: t('tests.interviewsTitle'),
      body: t('tests.interviewsBody'),
      facts: [
        t('tests.questions', { count: GENERAL_COUNT + AREA_COUNT }),
        t('tests.perDay', { count: INTERVIEWS_PER_DAY }),
      ],
      status:
        interviews.length === 0 ? undefined : <Done>{t('tests.sent', { count: interviews.length })}</Done>,
      action: { to: '/entrevistas', label: t('tests.train') },
      tour: 'interviews',
    },
    {
      icon: 'award',
      tone: 'success',
      title: t('tests.examsTitle'),
      body: t('tests.examsBody'),
      facts: [
        t('tests.courses', { count: KURSOS.length }),
        t('tests.questions', { count: EXAM_SIZE }),
        t('tests.passMark', { value: percent(EXAM_PASS) }),
      ],
      status: passed === 0 ? undefined : <Done>{t('tests.passed', { count: passed })}</Done>,
      action: { to: '/kursos', label: t('tests.seeKursos') },
    },
  ]
  // Not done yet: the career test comes first and takes two columns; done, it joins the others.
  const cards = vocationalDone
    ? [...others.slice(0, 1), vocational, ...others.slice(1)]
    : [vocational, ...others]

  return (
    <>
      <PageHeader compact title={t('nav.tests')} subtitle={t('tests.subtitle')} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <TestCard key={card.title} {...card} />
        ))}
      </div>
    </>
  )
}
